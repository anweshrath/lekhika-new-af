const QueueAdapter = require('../QueueAdapter');
const logger = require('../../../utils/logger');

let BullMQ;
let IORedis;

try {
  // Lazy require so that lack of bullmq/ioredis doesn't crash the worker process
  // when QUEUE_PROVIDER is not redis.
  // eslint-disable-next-line global-require
  BullMQ = require('bullmq');
  // eslint-disable-next-line global-require
  IORedis = require('ioredis');
} catch (err) {
  // Will be handled when attempting to construct the adapter
  BullMQ = null;
  IORedis = null;
}

class RedisQueueAdapter extends QueueAdapter {
  constructor() {
    super();

    if (!BullMQ || !IORedis) {
      throw new Error('bullmq/ioredis not available - install dependencies before using RedisQueueAdapter');
    }

    const { Queue } = BullMQ;

    const redisUrl = process.env.REDIS_URL;
    const prefix = process.env.QUEUE_PREFIX || 'lekhika';

    if (!redisUrl) {
      throw new Error('REDIS_URL is not set but QUEUE_ENABLED=true and QUEUE_PROVIDER=redis – cannot start RedisQueueAdapter.');
    }

    // BullMQ does NOT allow ":" in the queue name itself (it uses ":" internally for Redis keys).
    // Use an underscore to keep things simple and compliant, while still namespacing by prefix.
    this.queueName = `${prefix}_workflow`;
    // BullMQ requires maxRetriesPerRequest to be null for blocking commands.
    this.connection = new IORedis(redisUrl, {
      maxRetriesPerRequest: null
    });

    // Perform a basic connectivity check up-front so misconfig is loud
    this.connection
      .ping()
      .then((res) => {
        if (res !== 'PONG') {
          logger.error(`Redis ping responded with "${res}" instead of "PONG" for ${redisUrl}`);
          // Hard exit so PM2 can restart and you see the real error
          process.exit(1);
        }
      })
      .catch((err) => {
        logger.error('Redis ping failed during RedisQueueAdapter initialization:', err);
        // Hard exit so PM2 can restart and you see the real error
        process.exit(1);
      });

    this.queue = new Queue(this.queueName, {
      connection: this.connection,
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: false
      }
    });

    this.workers = [];

    logger.info(`RedisQueueAdapter initialized for queue ${this.queueName} (${redisUrl})`);
  }

  async enqueue(jobType, payload, options = {}) {
    const attempts = options.attempts || parseInt(process.env.QUEUE_ATTEMPTS, 10) || 3;
    const backoffMs = options.backoff || parseInt(process.env.QUEUE_BACKOFF_MS, 10) || 30000;

    const jobOptions = {
      jobId: options.jobId || payload.executionId,
      attempts,
      backoff: {
        type: 'exponential',
        delay: backoffMs
      },
      removeOnComplete: true,
      removeOnFail: false,
      ...options
    };

    const job = await this.queue.add(jobType, payload, jobOptions);
    logger.info(`RedisQueueAdapter: enqueued job ${job.id} (${jobType})`);

    return { id: job.id };
  }

  async process(jobType, handler, options = {}) {
    const {
      Worker
    } = BullMQ;

    const concurrency = options.concurrency || parseInt(process.env.QUEUE_CONCURRENCY, 10) || 2;

    const worker = new Worker(
      this.queueName,
      async (job) => {
        const wrappedJob = {
          id: job.id,
          name: job.name,
          type: job.name,
          data: job.data,
          attemptsMade: job.attemptsMade,
          opts: job.opts,
          async updateProgress(progress) {
            await job.updateProgress(progress);
          }
        };

        return handler(wrappedJob);
      },
      {
        connection: this.connection,
        concurrency
      }
    );

    worker.on('completed', (job) => {
      logger.info(`RedisQueueAdapter: job ${job.id} completed`);
    });

    worker.on('failed', (job, err) => {
      logger.error(`RedisQueueAdapter: job ${job?.id} failed: ${err?.message}`);
    });

    this.workers.push(worker);
    logger.info(`RedisQueueAdapter: worker started for ${this.queueName} with concurrency ${concurrency}`);
  }

  async getJob(jobId) {
    return this.queue.getJob(jobId);
  }

  async getState(jobId) {
    const job = await this.queue.getJob(jobId);
    if (!job) return 'not_found';
    return job.getState();
  }

  async retry(jobId) {
    const job = await this.queue.getJob(jobId);
    if (!job) return;
    await job.retry();
  }

  async cancel(jobId) {
    const job = await this.queue.getJob(jobId);
    if (!job) return;
    await job.remove();
  }

  async clearFailed() {
    const failed = await this.queue.getFailed(0, 1000);
    let cleared = 0;
    for (const job of failed) {
      await job.remove();
      cleared += 1;
    }
    logger.info(`RedisQueueAdapter: cleared ${cleared} failed jobs`);
    return cleared;
  }

  async clearDelayed() {
    const delayed = await this.queue.getDelayed(0, 1000);
    let cleared = 0;
    for (const job of delayed) {
      await job.remove();
      cleared += 1;
    }
    logger.info(`RedisQueueAdapter: cleared ${cleared} delayed jobs`);
    return cleared;
  }

  async clearWaiting() {
    const waiting = await this.queue.getWaiting(0, 1000);
    let cleared = 0;
    for (const job of waiting) {
      await job.remove();
      cleared += 1;
    }
    logger.info(`RedisQueueAdapter: cleared ${cleared} waiting jobs`);
    return cleared;
  }

  async resetAll() {
    // Pause processing while we clean up
    await this.queue.pause();
    const before = await this.getQueueStats().catch(() => ({}));

    let cleared = 0;

    // Clear waiting jobs
    const waiting = await this.queue.getWaiting(0, 1000);
    for (const job of waiting) {
      await job.remove();
      cleared += 1;
    }

    // Clear delayed jobs
    const delayed = await this.queue.getDelayed(0, 1000);
    for (const job of delayed) {
      await job.remove();
      cleared += 1;
    }

    // Clear failed jobs
    const failed = await this.queue.getFailed(0, 1000);
    for (const job of failed) {
      await job.remove();
      cleared += 1;
    }

    // EMERGENCY: Clear active jobs as well (may upset running workers, but this is a nuclear option)
    // For locked jobs, we need to unlock them first before removing
    const active = await this.queue.getActive(0, 1000);
    for (const job of active) {
      try {
        // Try to remove normally first
        await job.remove();
        cleared += 1;
      } catch (err) {
        // If locked, force unlock by deleting the lock key directly
        if (err.message && err.message.includes('locked')) {
          logger.warn(`RedisQueueAdapter: Job ${job.id} is locked, force unlocking...`);
          const lockKey = `bull:${this.queueName}:${job.id}:lock`;
          await this.connection.del(lockKey);
          // Now try removing again
          try {
            await job.remove();
            cleared += 1;
            logger.info(`RedisQueueAdapter: Force-unlocked and removed job ${job.id}`);
          } catch (retryErr) {
            logger.error(`RedisQueueAdapter: Failed to remove job ${job.id} even after unlock:`, retryErr.message);
            // Last resort: delete the job data directly from Redis
            const jobKey = `bull:${this.queueName}:${job.id}`;
            await this.connection.del(jobKey);
            cleared += 1;
            logger.warn(`RedisQueueAdapter: Force-deleted job ${job.id} data directly from Redis`);
          }
        } else {
          throw err;
        }
      }
    }

    logger.warn(`RedisQueueAdapter: HARD RESET applied – removed ${cleared} waiting/delayed/failed/active jobs`, {
      before
    });

    // Resume processing for future jobs
    await this.queue.resume();

    return {
      cleared,
      before
    };
  }

  async pause() {
    await this.queue.pause();
  }

  async resume() {
    await this.queue.resume();
  }

  on(event, cb) {
    this.queue.on(event, cb);
  }

  async getQueueStats() {
    const counts = await this.queue.getJobCounts(
      'wait',
      'active',
      'completed',
      'failed',
      'delayed'
    );
    return counts;
  }

  async close() {
    await Promise.all(
      this.workers.map((w) => w.close())
    );
    await this.queue.close();
    await this.connection.quit();
  }
}

module.exports = RedisQueueAdapter;


