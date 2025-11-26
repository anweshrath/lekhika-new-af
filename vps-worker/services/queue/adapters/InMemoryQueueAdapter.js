const { v4: uuidv4 } = require('uuid');
const QueueAdapter = require('../QueueAdapter');
const logger = require('../../../utils/logger');

class InMemoryQueueAdapter extends QueueAdapter {
  constructor() {
    super();
    this.jobs = new Map(); // jobId -> job
    this.handlers = new Map(); // jobType -> { handler, concurrency }
    this.pending = [];
    this.isProcessing = false;
  }

  async enqueue(jobType, payload, options = {}) {
    const id = options.jobId || payload.executionId || uuidv4();
    const job = {
      id,
      name: jobType,
      type: jobType,
      data: payload,
      attemptsMade: 0,
      opts: { attempts: options.attempts || 1 },
      state: 'waiting',
      result: null,
      error: null,
      progress: 0,
      async updateProgress(progress) {
        this.progress = progress;
      }
    };

    this.jobs.set(id, job);
    this.pending.push(job);
    this._scheduleProcessing();

    logger.info(`InMemoryQueue: enqueued job ${id} (${jobType})`);
    return { id };
  }

  async process(jobType, handler, options = {}) {
    this.handlers.set(jobType, {
      handler,
      concurrency: options.concurrency || 1
    });
    // Kick off processing in case jobs were queued earlier
    this._scheduleProcessing();
  }

  async getJob(jobId) {
    return this.jobs.get(jobId) || null;
  }

  async getState(jobId) {
    const job = this.jobs.get(jobId);
    return job ? job.state || 'unknown' : 'not_found';
  }

  async retry(jobId) {
    const job = this.jobs.get(jobId);
    if (!job) return;
    job.state = 'waiting';
    job.error = null;
    this.pending.push(job);
    this._scheduleProcessing();
  }

  async cancel(jobId) {
    const job = this.jobs.get(jobId);
    if (!job) return;
    job.state = 'cancelled';
  }

  async clearFailed() {
    let cleared = 0;
    this.jobs.forEach((job, id) => {
      if (job.state === 'failed') {
        this.jobs.delete(id);
        cleared += 1;
      }
    });
    this.pending = this.pending.filter(job => job.state !== 'failed');
    logger.info(`InMemoryQueue: cleared ${cleared} failed jobs`);
    return cleared;
  }

  async clearDelayed() {
    // In-memory adapter does not model delayed states separately.
    return 0;
  }

  async pause() {
    this.isPaused = true;
  }

  async resume() {
    this.isPaused = false;
    this._scheduleProcessing();
  }

  on() {
    // No-op for in-memory implementation
  }

  async close() {
    this.isProcessing = false;
    this.pending = [];
  }

  _scheduleProcessing() {
    if (this.isProcessing || this.isPaused) return;
    setImmediate(() => this._processLoop());
  }

  async _processLoop() {
    if (this.isProcessing || this.isPaused) return;
    this.isProcessing = true;

    try {
      while (this.pending.length > 0 && !this.isPaused) {
        const job = this.pending.shift();
        const handlerEntry = this.handlers.get(job.type);
        if (!handlerEntry) {
          // No handler registered yet, push back and break
          this.pending.unshift(job);
          break;
        }

        const { handler } = handlerEntry;
        try {
          job.state = 'active';
          const result = await handler(job);
          job.result = result;
          job.state = 'completed';
          logger.info(`InMemoryQueue: job ${job.id} completed`);
        } catch (err) {
          job.error = err;
          job.state = 'failed';
          logger.error(`InMemoryQueue: job ${job.id} failed: ${err.message}`);
        }
      }
    } finally {
      this.isProcessing = false;
    }
  }

  async getQueueStats() {
    let waiting = 0;
    let active = 0;
    let completed = 0;
    let failed = 0;

    this.jobs.forEach((job) => {
      switch (job.state) {
        case 'waiting':
          waiting += 1;
          break;
        case 'active':
          active += 1;
          break;
        case 'completed':
          completed += 1;
          break;
        case 'failed':
          failed += 1;
          break;
        default:
          break;
      }
    });

    return {
      wait: waiting,
      active,
      completed,
      failed,
      delayed: 0
    };
  }
}

module.exports = InMemoryQueueAdapter;


