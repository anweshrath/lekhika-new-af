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

    const {
      Queue,
      QueueScheduler
    } = BullMQ;

    const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
    const prefix = process.env.QUEUE_PREFIX || 'lekhika';

    this.queueName = `${prefix}:workflow`;
    this.connection = new IORedis(redisUrl);

    this.queue = new Queue(this.queueName, {
      connection: this.connection,
      defaultJobOptions: {
        removeOnComplete: true,
        removeOnFail: false
      }
    });

    this.scheduler = new QueueScheduler(this.queueName, {
      connection: this.connection
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
    await this.scheduler.close();
    await this.queue.close();
    await this.connection.quit();
  }
}

module.exports = RedisQueueAdapter;


