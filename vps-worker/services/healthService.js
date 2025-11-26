const logger = require('../utils/logger');

class HealthService {
  constructor() {
    this.isMonitoring = false;
    this.monitoringInterval = null;
    this.healthCheckInterval = parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000;
  }
  
  startMonitoring() {
    if (this.isMonitoring) {
      return;
    }
    
    this.isMonitoring = true;
    
    // Start health check monitoring
    this.monitoringInterval = setInterval(() => {
      this.performHealthCheck();
    }, this.healthCheckInterval);
    
    logger.info('Health monitoring started');
  }
  
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    
    this.isMonitoring = false;
    logger.info('Health monitoring stopped');
  }
  
  async performHealthCheck() {
    try {
      const healthStatus = {
        timestamp: new Date().toISOString(),
        workerId: process.env.WORKER_ID,
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        activeExecutions: this.getActiveExecutionCount(),
        status: 'healthy'
      };
      
      // Check memory usage
      const memoryUsage = process.memoryUsage();
      const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
      
      if (memoryUsagePercent > 90) {
        healthStatus.status = 'warning';
        healthStatus.warning = 'High memory usage detected';
        logger.warn('High memory usage detected:', { memoryUsagePercent });
      }
      
      // Check active executions
      if (healthStatus.activeExecutions > 10) {
        healthStatus.status = 'warning';
        healthStatus.warning = 'High number of active executions';
        logger.warn('High number of active executions:', { count: healthStatus.activeExecutions });
      }
      
      logger.info('Health check completed', healthStatus);
      
    } catch (error) {
      logger.error('Health check failed:', error);
    }
  }
  
  getActiveExecutionCount() {
    // This would be implemented to get count from execution service
    return 0; // Placeholder
  }
  
  getHealthStatus() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      workerId: process.env.WORKER_ID,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      isMonitoring: this.isMonitoring
    };
  }
}

module.exports = new HealthService();
