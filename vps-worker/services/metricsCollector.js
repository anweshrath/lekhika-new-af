/**
 * METRICS COLLECTOR SERVICE
 * 
 * Real-time metrics aggregation for orchestration control center
 * Collects data from: Queue, Workers, PM2, Executions
 * Provides analytics, trends, insights
 * 
 * Metrics Collected:
 * - Queue stats (waiting, active, completed, failed, delayed)
 * - Worker metrics (memory, CPU, active jobs, health)
 * - Throughput (jobs completed per hour)
 * - Success rate (completed vs failed %)
 * - Average duration per job
 * - Cost metrics (tokens, $ per job)
 * 
 * Part of: Orchestration Control Center (Mother Control Panel)
 * Created: 2025-11-24
 */

const logger = require('../utils/logger');
const workerRegistry = require('./workerRegistry');
const pm2Manager = require('./pm2Manager');

class MetricsCollector {
  constructor() {
    this.queue = null; // Will be set to queue adapter instance
    this.metricsHistory = {
      throughput: [], // Jobs/hour over time
      successRate: [], // Success % over time
      queueDepth: [], // Queue size over time
      workerUtilization: [], // Worker utilization % over time
    };
    this.collectionInterval = null;
    this.historyRetention = 24 * 60 * 60 * 1000; // 24 hours
  }

  /**
   * Initialize with queue adapter
   * @param {object} queueAdapter - Queue adapter instance
   */
  initialize(queueAdapter) {
    this.queue = queueAdapter;
    logger.info('[MetricsCollector] Initialized with queue adapter');
    
    // Start periodic metrics collection (every 5 minutes)
    this.startPeriodicCollection();
  }

  /**
   * Get real-time queue stats
   */
  async getQueueStats() {
    if (!this.queue) {
      return {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        delayed: 0,
        enabled: false
      };
    }

    try {
      const stats = await this.queue.getQueueStats();
      
      return {
        waiting: stats.wait || stats.waiting || 0,
        active: stats.active || 0,
        completed: stats.completed || 0,
        failed: stats.failed || 0,
        delayed: stats.delayed || 0,
        enabled: true,
        timestamp: Date.now()
      };
    } catch (error) {
      logger.error('[MetricsCollector] Failed to get queue stats:', error);
      return {
        waiting: 0,
        active: 0,
        completed: 0,
        failed: 0,
        delayed: 0,
        enabled: false,
        error: error.message
      };
    }
  }

  /**
   * Get real-time worker metrics (all workers)
   */
  async getWorkerMetrics() {
    try {
      const workers = await workerRegistry.getAllWorkers();
      
      return workers.map(worker => ({
        id: worker.id,
        type: worker.type,
        port: worker.port,
        status: worker.status,
        health: worker.health,
        activeJobs: worker.metrics?.activeJobs || 0,
        capacity: worker.capacity,
        utilization: worker.capacity > 0 
          ? ((worker.metrics?.activeJobs || 0) / worker.capacity * 100).toFixed(2)
          : 0,
        memory: worker.metrics?.memory,
        uptime: worker.metrics?.uptime,
        lastHeartbeat: worker.lastHeartbeat
      }));
    } catch (error) {
      logger.error('[MetricsCollector] Failed to get worker metrics:', error);
      return [];
    }
  }

  /**
   * Get PM2 process metrics
   */
  async getPM2Metrics() {
    try {
      const processes = await pm2Manager.listProcesses();
      
      return processes.map(proc => ({
        name: proc.name,
        status: proc.status,
        memory: proc.memory,
        cpu: proc.cpu,
        uptime: proc.uptime,
        restarts: proc.restarts
      }));
    } catch (error) {
      logger.error('[MetricsCollector] Failed to get PM2 metrics:', error);
      return [];
    }
  }

  /**
   * Calculate throughput (jobs completed per hour)
   * @param {string} timeRange - '1h', '6h', '24h'
   */
  async calculateThroughput(timeRange = '1h') {
    if (!this.queue) return 0;

    try {
      const stats = await this.getQueueStats();
      
      // Simple calculation: completed jobs count
      // For accurate throughput, need time-series data (Redis sorted sets)
      const completed = stats.completed;
      
      // Convert to per-hour rate
      const hours = this.parseTimeRange(timeRange);
      const throughput = completed / hours;
      
      return Math.round(throughput);
    } catch (error) {
      logger.error('[MetricsCollector] Failed to calculate throughput:', error);
      return 0;
    }
  }

  /**
   * Calculate success rate (completed / (completed + failed) * 100)
   */
  async calculateSuccessRate() {
    if (!this.queue) return 100;

    try {
      const stats = await this.getQueueStats();
      const total = stats.completed + stats.failed;
      
      if (total === 0) return 100;
      
      const successRate = (stats.completed / total) * 100;
      return successRate.toFixed(2);
    } catch (error) {
      logger.error('[MetricsCollector] Failed to calculate success rate:', error);
      return 0;
    }
  }

  /**
   * Calculate average worker utilization
   */
  async calculateAverageUtilization() {
    try {
      const workerMetrics = await this.getWorkerMetrics();
      
      if (workerMetrics.length === 0) return 0;
      
      const totalUtilization = workerMetrics.reduce((sum, w) => sum + parseFloat(w.utilization), 0);
      const avgUtilization = totalUtilization / workerMetrics.length;
      
      return avgUtilization.toFixed(2);
    } catch (error) {
      logger.error('[MetricsCollector] Failed to calculate utilization:', error);
      return 0;
    }
  }

  /**
   * Get comprehensive system metrics (all-in-one)
   */
  async getSystemMetrics() {
    const [queueStats, workerMetrics, pm2Metrics, throughput, successRate, utilization] = await Promise.all([
      this.getQueueStats(),
      this.getWorkerMetrics(),
      this.getPM2Metrics(),
      this.calculateThroughput('1h'),
      this.calculateSuccessRate(),
      this.calculateAverageUtilization()
    ]);

    return {
      queue: queueStats,
      workers: workerMetrics,
      pm2: pm2Metrics,
      aggregated: {
        throughput: throughput,
        successRate: successRate,
        avgUtilization: utilization,
        totalWorkers: workerMetrics.length,
        healthyWorkers: workerMetrics.filter(w => w.health > 60).length,
        activeJobs: workerMetrics.reduce((sum, w) => sum + w.activeJobs, 0),
        totalCapacity: workerMetrics.reduce((sum, w) => sum + w.capacity, 0)
      },
      timestamp: Date.now()
    };
  }

  /**
   * Start periodic metrics collection (stores history for trends)
   */
  startPeriodicCollection() {
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
    }

    this.collectionInterval = setInterval(async () => {
      try {
        const metrics = await this.getSystemMetrics();
        
        // Store in history arrays
        this.metricsHistory.throughput.push({
          value: metrics.aggregated.throughput,
          timestamp: Date.now()
        });
        
        this.metricsHistory.successRate.push({
          value: parseFloat(metrics.aggregated.successRate),
          timestamp: Date.now()
        });
        
        this.metricsHistory.queueDepth.push({
          value: metrics.queue.waiting + metrics.queue.active,
          timestamp: Date.now()
        });
        
        this.metricsHistory.workerUtilization.push({
          value: parseFloat(metrics.aggregated.avgUtilization),
          timestamp: Date.now()
        });
        
        // Cleanup old history (keep last 24 hours only)
        this.cleanupOldHistory();
        
        logger.debug('[MetricsCollector] Periodic metrics collected');
      } catch (error) {
        logger.error('[MetricsCollector] Periodic collection failed:', error);
      }
    }, 5 * 60 * 1000); // Every 5 minutes

    logger.info('[MetricsCollector] Periodic collection started (every 5 min)');
  }

  /**
   * Cleanup metrics older than retention period
   */
  cleanupOldHistory() {
    const cutoff = Date.now() - this.historyRetention;
    
    Object.keys(this.metricsHistory).forEach(key => {
      this.metricsHistory[key] = this.metricsHistory[key].filter(
        entry => entry.timestamp > cutoff
      );
    });
  }

  /**
   * Get historical metrics for charts
   * @param {string} metric - throughput, successRate, queueDepth, workerUtilization
   * @param {string} range - 1h, 6h, 24h
   */
  getHistoricalMetrics(metric, range = '1h') {
    const hours = this.parseTimeRange(range);
    const cutoff = Date.now() - (hours * 60 * 60 * 1000);
    
    const history = this.metricsHistory[metric] || [];
    
    return history.filter(entry => entry.timestamp > cutoff);
  }

  /**
   * Get all historical metrics
   */
  getAllHistoricalMetrics(range = '1h') {
    return {
      throughput: this.getHistoricalMetrics('throughput', range),
      successRate: this.getHistoricalMetrics('successRate', range),
      queueDepth: this.getHistoricalMetrics('queueDepth', range),
      workerUtilization: this.getHistoricalMetrics('workerUtilization', range)
    };
  }

  /**
   * Parse time range string to hours
   */
  parseTimeRange(range) {
    const match = range.match(/^(\d+)([hd])$/);
    if (!match) return 1;
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    if (unit === 'h') return value;
    if (unit === 'd') return value * 24;
    
    return 1;
  }

  /**
   * Get capacity planning recommendations
   */
  async getCapacityRecommendations() {
    const metrics = await this.getSystemMetrics();
    const recommendations = [];

    // Check queue depth
    const queueDepth = metrics.queue.waiting + metrics.queue.active;
    if (queueDepth > 20) {
      recommendations.push({
        type: 'warning',
        category: 'capacity',
        message: `Queue depth is high (${queueDepth} jobs). Consider adding more workers.`,
        action: 'add_worker'
      });
    }

    // Check worker utilization
    const avgUtil = parseFloat(metrics.aggregated.avgUtilization);
    if (avgUtil > 80) {
      recommendations.push({
        type: 'warning',
        category: 'capacity',
        message: `Worker utilization is high (${avgUtil}%). Consider increasing concurrency or adding workers.`,
        action: 'scale_up'
      });
    } else if (avgUtil < 30 && metrics.aggregated.totalWorkers > 1) {
      recommendations.push({
        type: 'info',
        category: 'optimization',
        message: `Worker utilization is low (${avgUtil}%). Consider reducing workers to save costs.`,
        action: 'scale_down'
      });
    }

    // Check unhealthy workers
    const unhealthyCount = metrics.aggregated.totalWorkers - metrics.aggregated.healthyWorkers;
    if (unhealthyCount > 0) {
      recommendations.push({
        type: 'danger',
        category: 'health',
        message: `${unhealthyCount} worker(s) unhealthy. Check worker health and restart if needed.`,
        action: 'check_health'
      });
    }

    // Check success rate
    const successRate = parseFloat(metrics.aggregated.successRate);
    if (successRate < 90) {
      recommendations.push({
        type: 'warning',
        category: 'quality',
        message: `Success rate is low (${successRate}%). Check failed jobs for patterns.`,
        action: 'check_failures'
      });
    }

    return recommendations;
  }

  /**
   * Stop periodic collection
   */
  shutdown() {
    if (this.collectionInterval) {
      clearInterval(this.collectionInterval);
      logger.info('[MetricsCollector] Periodic collection stopped');
    }
  }
}

module.exports = new MetricsCollector();

