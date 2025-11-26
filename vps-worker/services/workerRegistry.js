/**
 * WORKER REGISTRY SERVICE
 * 
 * Auto-discovery and registration system for all Lekhika workers
 * Supports unlimited workers, tracks health, enables intelligent routing
 * 
 * Workers register via Redis heartbeat (every 30s)
 * Control center queries registry for live worker list
 * Dead workers auto-removed after 2 min of no heartbeat
 * 
 * Part of: Orchestration Control Center (Mother Control Panel)
 * Created: 2025-11-24
 */

const logger = require('../utils/logger');

class WorkerRegistry {
  constructor() {
    this.workers = new Map(); // In-memory cache
    this.redis = null; // Will be initialized with Redis connection
    this.heartbeatInterval = null;
    this.cleanupInterval = null;
    this.workerId = process.env.WORKER_ID || 'unknown-worker';
    this.workerType = process.env.WORKER_TYPE || 'standard'; // standard, lean, gpu, export
    this.port = parseInt(process.env.PORT || process.env.LEAN_PORT || '3001');
  }

  /**
   * Initialize registry with Redis connection
   * @param {object} redisConnection - ioredis connection
   */
  async initialize(redisConnection) {
    this.redis = redisConnection;
    logger.info('[WorkerRegistry] Initialized with Redis connection');
    
    // Load existing workers from Redis
    await this.loadWorkersFromRedis();
    
    // Start cleanup of dead workers
    this.startDeadWorkerCleanup();
    
    logger.info('[WorkerRegistry] Registry ready');
  }

  /**
   * Register this worker (called on server startup)
   * Sends heartbeat to Redis so control center can discover it
   */
  async registerSelf() {
    if (!this.redis) {
      logger.warn('[WorkerRegistry] Redis not initialized, skipping self-registration');
      return;
    }

    const metadata = {
      id: this.workerId,
      type: this.workerType,
      port: this.port,
      url: `http://103.190.93.28:${this.port}`, // VPS IP
      capacity: parseInt(process.env.MAX_CONCURRENT_EXECUTIONS || '3'),
      weight: this.workerType === 'lean' ? 8 : 10, // Routing weight
      tags: this.getWorkerTags(),
      pm2: {
        processName: process.env.name || this.workerId,
        pid: process.pid
      },
      registeredAt: Date.now(),
      lastHeartbeat: Date.now(),
      status: 'online'
    };

    // Store in Redis with TTL (expires after 2 minutes if no heartbeat)
    const key = `lekhika:workers:${this.workerId}`;
    await this.redis.setex(key, 120, JSON.stringify(metadata));
    
    // Also cache locally
    this.workers.set(this.workerId, metadata);
    
    logger.info(`[WorkerRegistry] Registered worker: ${this.workerId} (${this.workerType}) on port ${this.port}`);
    
    // Start sending heartbeats
    this.startHeartbeat();
  }

  /**
   * Get worker tags based on type and capabilities
   */
  getWorkerTags() {
    const tags = ['ai', 'workflow']; // All workers support AI workflows
    
    if (this.workerType === 'lean') {
      tags.push('memory-optimized', 'fast');
    }
    
    if (this.workerType === 'standard') {
      tags.push('full-featured');
    }
    
    // Could add more tags based on env vars
    if (process.env.GPU_ENABLED === 'true') {
      tags.push('gpu', 'image-generation');
    }
    
    if (process.env.EXPORT_SPECIALIZED === 'true') {
      tags.push('export', 'pdf', 'docx');
    }
    
    return tags;
  }

  /**
   * Send heartbeat to Redis every 30 seconds
   * Updates worker status, health metrics
   */
  startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(async () => {
      try {
        if (!this.redis) return;

        const metadata = {
          id: this.workerId,
          type: this.workerType,
          port: this.port,
          url: `http://103.190.93.28:${this.port}`,
          capacity: parseInt(process.env.MAX_CONCURRENT_EXECUTIONS || '3'),
          weight: this.workerType === 'lean' ? 8 : 10,
          tags: this.getWorkerTags(),
          pm2: {
            processName: process.env.name || this.workerId,
            pid: process.pid
          },
          health: await this.calculateHealth(),
          metrics: await this.getWorkerMetrics(),
          lastHeartbeat: Date.now(),
          status: 'online'
        };

        const key = `lekhika:workers:${this.workerId}`;
        await this.redis.setex(key, 120, JSON.stringify(metadata));
        
        this.workers.set(this.workerId, metadata);
        
        logger.debug(`[WorkerRegistry] Heartbeat sent: ${this.workerId}`);
      } catch (error) {
        logger.error('[WorkerRegistry] Heartbeat failed:', error);
      }
    }, 30000); // Every 30 seconds

    logger.info(`[WorkerRegistry] Heartbeat started for ${this.workerId}`);
  }

  /**
   * Calculate worker health score (0-100)
   * Based on: memory usage, CPU, active jobs, error rate
   */
  async calculateHealth() {
    try {
      const mem = process.memoryUsage();
      const heapUsedPercent = (mem.heapUsed / mem.heapTotal) * 100;
      
      // Simple health scoring (can be enhanced)
      let health = 100;
      
      // Deduct for high memory usage
      if (heapUsedPercent > 90) {
        health -= 30;
      } else if (heapUsedPercent > 75) {
        health -= 15;
      } else if (heapUsedPercent > 60) {
        health -= 5;
      }
      
      // Could add CPU, active jobs, error rate here
      
      return Math.max(0, Math.min(100, health));
    } catch (error) {
      logger.error('[WorkerRegistry] Health calculation failed:', error);
      return 50; // Default to medium health
    }
  }

  /**
   * Get current worker metrics
   */
  async getWorkerMetrics() {
    const mem = process.memoryUsage();
    
    // Get active executions count (if executionService is available)
    let activeJobs = 0;
    try {
      const executionService = require('./executionService');
      activeJobs = executionService.activeExecutions?.size || 0;
    } catch (err) {
      // executionService might not be available in all worker types
    }
    
    return {
      memory: {
        rss: mem.rss,
        heapTotal: mem.heapTotal,
        heapUsed: mem.heapUsed,
        heapPercent: ((mem.heapUsed / mem.heapTotal) * 100).toFixed(2)
      },
      uptime: process.uptime(),
      activeJobs: activeJobs,
      pid: process.pid
    };
  }

  /**
   * Load all workers from Redis (on startup)
   */
  async loadWorkersFromRedis() {
    if (!this.redis) return;

    try {
      const keys = await this.redis.keys('lekhika:workers:*');
      
      for (const key of keys) {
        const data = await this.redis.get(key);
        if (data) {
          const worker = JSON.parse(data);
          this.workers.set(worker.id, worker);
        }
      }
      
      logger.info(`[WorkerRegistry] Loaded ${this.workers.size} workers from Redis`);
    } catch (error) {
      logger.error('[WorkerRegistry] Failed to load workers from Redis:', error);
    }
  }

  /**
   * Get all registered workers
   * @returns {Array} List of worker objects
   */
  async getAllWorkers() {
    // Refresh from Redis to get latest
    await this.loadWorkersFromRedis();
    
    return Array.from(this.workers.values());
  }

  /**
   * Get healthy workers only (health > 60, heartbeat < 2 min ago)
   * @returns {Array} List of healthy worker objects
   */
  async getHealthyWorkers() {
    const workers = await this.getAllWorkers();
    const now = Date.now();
    
    return workers.filter(w => 
      w.health > 60 && 
      (now - w.lastHeartbeat) < 120000 // 2 minutes
    );
  }

  /**
   * Get worker by ID
   */
  async getWorker(workerId) {
    if (!this.redis) return null;

    try {
      const key = `lekhika:workers:${workerId}`;
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error(`[WorkerRegistry] Failed to get worker ${workerId}:`, error);
      return null;
    }
  }

  /**
   * Remove worker from registry
   */
  async removeWorker(workerId) {
    if (!this.redis) return;

    try {
      const key = `lekhika:workers:${workerId}`;
      await this.redis.del(key);
      this.workers.delete(workerId);
      
      logger.info(`[WorkerRegistry] Removed worker: ${workerId}`);
    } catch (error) {
      logger.error(`[WorkerRegistry] Failed to remove worker ${workerId}:`, error);
    }
  }

  /**
   * Cleanup dead workers (no heartbeat for 2+ minutes)
   */
  startDeadWorkerCleanup() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.cleanupInterval = setInterval(async () => {
      try {
        const workers = await this.getAllWorkers();
        const now = Date.now();
        let removed = 0;

        for (const worker of workers) {
          if (now - worker.lastHeartbeat > 120000) {
            await this.removeWorker(worker.id);
            removed++;
            logger.warn(`[WorkerRegistry] Removed dead worker: ${worker.id} (no heartbeat for ${Math.round((now - worker.lastHeartbeat) / 1000)}s)`);
          }
        }

        if (removed > 0) {
          logger.info(`[WorkerRegistry] Cleanup: removed ${removed} dead workers`);
        }
      } catch (error) {
        logger.error('[WorkerRegistry] Cleanup failed:', error);
      }
    }, 60000); // Every minute

    logger.info('[WorkerRegistry] Dead worker cleanup started');
  }

  /**
   * Stop heartbeat and cleanup (on shutdown)
   */
  async shutdown() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    
    // Remove self from registry
    await this.removeWorker(this.workerId);
    
    logger.info(`[WorkerRegistry] Shutdown complete for ${this.workerId}`);
  }
}

module.exports = new WorkerRegistry();

