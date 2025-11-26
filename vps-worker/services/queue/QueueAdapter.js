class QueueAdapter {
  /**
   * Enqueue a job.
   * @param {string} jobType
   * @param {object} payload
   * @param {object} options
   * @returns {Promise<{ id: string }>}
   */
  // eslint-disable-next-line no-unused-vars
  async enqueue(jobType, payload, options = {}) {
    throw new Error('enqueue() not implemented');
  }

  /**
   * Register a processor for a given job type.
   * @param {string} jobType
   * @param {Function} handler
   * @param {object} options
   */
  // eslint-disable-next-line no-unused-vars
  async process(jobType, handler, options = {}) {
    throw new Error('process() not implemented');
  }

  /**
   * Get job details by ID.
   * @param {string} jobId
   */
  // eslint-disable-next-line no-unused-vars
  async getJob(jobId) {
    throw new Error('getJob() not implemented');
  }

  /**
   * Get current state of a job.
   * @param {string} jobId
   */
  // eslint-disable-next-line no-unused-vars
  async getState(jobId) {
    throw new Error('getState() not implemented');
  }

  /**
   * Retry a failed job.
   * @param {string} jobId
   */
  // eslint-disable-next-line no-unused-vars
  async retry(jobId) {
    throw new Error('retry() not implemented');
  }

  /**
   * Cancel a job if possible.
   * @param {string} jobId
   */
  // eslint-disable-next-line no-unused-vars
  async cancel(jobId) {
    throw new Error('cancel() not implemented');
  }

  /**
   * Clear failed jobs from the queue.
   */
  // eslint-disable-next-line no-unused-vars
  async clearFailed() {
    throw new Error('clearFailed() not implemented');
  }

  /**
   * Clear delayed jobs from the queue.
   */
  // eslint-disable-next-line no-unused-vars
  async clearDelayed() {
    throw new Error('clearDelayed() not implemented');
  }

  /**
   * Pause processing for a given job type.
   * @param {string} jobType
   */
  // eslint-disable-next-line no-unused-vars
  async pause(jobType) {
    throw new Error('pause() not implemented');
  }

  /**
   * Resume processing for a given job type.
   * @param {string} jobType
   */
  // eslint-disable-next-line no-unused-vars
  async resume(jobType) {
    throw new Error('resume() not implemented');
  }

  /**
   * Register event listener.
   * @param {string} event
   * @param {Function} cb
   */
  // eslint-disable-next-line no-unused-vars
  on(event, cb) {
    throw new Error('on() not implemented');
  }

  /**
   * Gracefully close all connections.
   */
  async close() {
    // Default no-op
  }
}

module.exports = QueueAdapter;


