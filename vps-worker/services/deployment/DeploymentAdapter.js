/**
 * DEPLOYMENT ADAPTER - BASE INTERFACE
 * 
 * Universal abstraction layer for all deployment types (PM2, K8s, Docker, etc.)
 * Makes the system deployment-agnostic and future-proof
 * 
 * ANY deployment type must implement this interface
 * Switching from PM2 → K8s → Docker is just swapping adapters
 * 
 * Part of: Orchestration Control Center (Future-Proof Architecture)
 * Created: 2025-11-27
 */

const logger = require('../../utils/logger');

class DeploymentAdapter {
  constructor(config = {}) {
    this.type = config.type || 'unknown'; // 'pm2', 'kubernetes', 'docker', 'hybrid'
    this.config = config;
    
    logger.info(`[DeploymentAdapter] ${this.type} adapter initialized`);
  }

  // ============================================
  // WORKER LIFECYCLE MANAGEMENT
  // ============================================

  /**
   * List all workers
   * @returns {Promise<Array>} Array of worker objects
   */
  async listWorkers() {
    throw new Error('listWorkers() must be implemented by deployment adapter');
  }

  /**
   * Get specific worker by ID
   * @param {string} workerId - Worker ID
   * @returns {Promise<object>} Worker object
   */
  async getWorker(workerId) {
    throw new Error('getWorker() must be implemented by deployment adapter');
  }

  /**
   * Create new worker
   * @param {object} workerConfig - Worker configuration
   * @returns {Promise<object>} Created worker object
   */
  async createWorker(workerConfig) {
    throw new Error('createWorker() must be implemented by deployment adapter');
  }

  /**
   * Update worker configuration
   * @param {string} workerId - Worker ID
   * @param {object} config - New configuration
   * @returns {Promise<object>} Updated worker object
   */
  async updateWorker(workerId, config) {
    throw new Error('updateWorker() must be implemented by deployment adapter');
  }

  /**
   * Delete worker
   * @param {string} workerId - Worker ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteWorker(workerId) {
    throw new Error('deleteWorker() must be implemented by deployment adapter');
  }

  /**
   * Clone worker (create duplicate with new config)
   * @param {string} sourceWorkerId - Source worker ID
   * @param {object} newConfig - New worker config (overrides)
   * @returns {Promise<object>} New worker object
   */
  async cloneWorker(sourceWorkerId, newConfig = {}) {
    throw new Error('cloneWorker() must be implemented by deployment adapter');
  }

  // ============================================
  // WORKER CONTROL
  // ============================================

  /**
   * Start worker
   * @param {string} workerId - Worker ID
   * @returns {Promise<object>} Start result
   */
  async startWorker(workerId) {
    throw new Error('startWorker() must be implemented by deployment adapter');
  }

  /**
   * Stop worker
   * @param {string} workerId - Worker ID
   * @returns {Promise<object>} Stop result
   */
  async stopWorker(workerId) {
    throw new Error('stopWorker() must be implemented by deployment adapter');
  }

  /**
   * Restart worker
   * @param {string} workerId - Worker ID
   * @returns {Promise<object>} Restart result
   */
  async restartWorker(workerId) {
    throw new Error('restartWorker() must be implemented by deployment adapter');
  }

  /**
   * Get worker status
   * @param {string} workerId - Worker ID
   * @returns {Promise<object>} Status object
   */
  async getWorkerStatus(workerId) {
    throw new Error('getWorkerStatus() must be implemented by deployment adapter');
  }

  /**
   * Get worker metrics (CPU, memory, etc.)
   * @param {string} workerId - Worker ID
   * @returns {Promise<object>} Metrics object
   */
  async getWorkerMetrics(workerId) {
    throw new Error('getWorkerMetrics() must be implemented by deployment adapter');
  }

  // ============================================
  // BULK OPERATIONS
  // ============================================

  /**
   * Start all workers
   * @returns {Promise<Array>} Results array
   */
  async startAllWorkers() {
    const workers = await this.listWorkers();
    return await Promise.all(
      workers.map(w => this.startWorker(w.id))
    );
  }

  /**
   * Stop all workers
   * @returns {Promise<Array>} Results array
   */
  async stopAllWorkers() {
    const workers = await this.listWorkers();
    return await Promise.all(
      workers.map(w => this.stopWorker(w.id))
    );
  }

  /**
   * Restart all workers
   * @returns {Promise<Array>} Results array
   */
  async restartAllWorkers() {
    const workers = await this.listWorkers();
    return await Promise.all(
      workers.map(w => this.restartWorker(w.id))
    );
  }

  /**
   * Scale workers to specific count
   * @param {number} targetCount - Target worker count
   * @returns {Promise<object>} Scaling result
   */
  async scaleWorkers(targetCount) {
    throw new Error('scaleWorkers() must be implemented by deployment adapter');
  }

  // ============================================
  // CONFIGURATION & INFO
  // ============================================

  /**
   * Get deployment configuration
   * @returns {Promise<object>} Deployment config
   */
  async getDeploymentConfig() {
    return {
      type: this.type,
      config: this.config,
      capabilities: this.getCapabilities()
    };
  }

  /**
   * Update deployment configuration
   * @param {object} newConfig - New configuration
   * @returns {Promise<object>} Updated config
   */
  async updateDeploymentConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    return await this.getDeploymentConfig();
  }

  /**
   * Get adapter capabilities
   * @returns {Array} Array of capability strings
   */
  getCapabilities() {
    return ['basic']; // Override in subclasses
  }

  /**
   * Get adapter type
   * @returns {string} Deployment type
   */
  getType() {
    return this.type;
  }

  /**
   * Validate worker configuration
   * @param {object} config - Worker config to validate
   * @returns {object} Validation result
   */
  validateWorkerConfig(config) {
    const errors = [];

    if (!config.name) {
      errors.push('Worker name is required');
    }

    if (!config.port && !config.autoAssignPort) {
      errors.push('Worker port is required or autoAssignPort must be true');
    }

    if (config.port && (config.port < 1024 || config.port > 65535)) {
      errors.push('Port must be between 1024 and 65535');
    }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }
}

module.exports = DeploymentAdapter;

