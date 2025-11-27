/**
 * ORCHESTRATION API ROUTER
 * 
 * Unified REST API for Orchestration Control Center (Mother Control Panel)
 * Exposes all orchestration services via clean REST endpoints
 * 
 * Services Exposed:
 * - Worker Registry (worker discovery, health, metrics)
 * - PM2 Manager (process control)
 * - Job Manager (job lifecycle, search, bulk operations)
 * - Routing Engine (strategy, affinity, metrics)
 * - Metrics Collector (system metrics, analytics)
 * 
 * Part of: Orchestration Control Center (Mother Control Panel)
 * Created: 2025-11-24
 */

const express = require('express');
const router = express.Router();
const logger = require('../utils/logger');
const workerRegistry = require('../services/workerRegistry');
const pm2Manager = require('../services/pm2Manager');
const jobManager = require('../services/jobManager');
const routingEngine = require('../services/routingEngine');
const metricsCollector = require('../services/metricsCollector');
const workerFactory = require('../services/WorkerFactory');

// ============================================
// WORKER MANAGEMENT ENDPOINTS
// ============================================

/**
 * GET /orchestration/workers
 * Get all registered workers
 */
router.get('/workers', async (req, res) => {
  try {
    const workers = await workerRegistry.getAllWorkers();
    res.json({
      success: true,
      workers: workers,
      count: workers.length
    });
  } catch (error) {
    logger.error('[Orchestration API] GET /workers failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /orchestration/workers/healthy
 * Get only healthy workers
 */
router.get('/workers/healthy', async (req, res) => {
  try {
    const workers = await workerRegistry.getHealthyWorkers();
    res.json({
      success: true,
      workers: workers,
      count: workers.length
    });
  } catch (error) {
    logger.error('[Orchestration API] GET /workers/healthy failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /orchestration/workers/:workerId
 * Get specific worker details
 */
router.get('/workers/:workerId', async (req, res) => {
  try {
    const { workerId } = req.params;
    const worker = await workerRegistry.getWorker(workerId);
    
    if (!worker) {
      return res.status(404).json({
        success: false,
        error: `Worker ${workerId} not found`
      });
    }
    
    res.json({
      success: true,
      worker: worker
    });
  } catch (error) {
    logger.error('[Orchestration API] GET /workers/:workerId failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /orchestration/workers/:workerId
 * Remove worker from registry
 */
router.delete('/workers/:workerId', async (req, res) => {
  try {
    const { workerId } = req.params;
    await workerRegistry.removeWorker(workerId);
    
    res.json({
      success: true,
      message: `Worker ${workerId} removed from registry`
    });
  } catch (error) {
    logger.error('[Orchestration API] DELETE /workers/:workerId failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// WORKER FACTORY ENDPOINTS (NEW)
// ============================================

/**
 * POST /orchestration/workers/create
 * Create new worker from config or template
 * Body: { name, type, port, template, maxConcurrent, maxMemory, env }
 */
router.post('/workers/create', async (req, res) => {
  try {
    const config = req.body;
    
    if (!config || Object.keys(config).length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Worker configuration required'
      });
    }

    const result = await workerFactory.createWorker(config);
    
    logger.info(`[Orchestration API] Worker created: ${result.worker.name}`);
    
    res.json(result);
  } catch (error) {
    logger.error('[Orchestration API] POST /workers/create failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /orchestration/workers/:workerId/clone
 * Clone existing worker
 * Body: { name, port, maxConcurrent, env } (all optional, defaults from source)
 */
router.post('/workers/:workerId/clone', async (req, res) => {
  try {
    const { workerId } = req.params;
    const overrides = req.body || {};

    const result = await workerFactory.cloneWorker(workerId, overrides);
    
    logger.info(`[Orchestration API] Worker cloned: ${workerId} → ${result.worker.name}`);
    
    res.json(result);
  } catch (error) {
    logger.error('[Orchestration API] POST /workers/:workerId/clone failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /orchestration/workers/create-from-template
 * Create worker from template
 * Body: { template: 'standard|lean|queue|gpu|export', overrides: {...} }
 */
router.post('/workers/create-from-template', async (req, res) => {
  try {
    const { template, overrides = {} } = req.body;
    
    if (!template) {
      return res.status(400).json({
        success: false,
        error: 'Template ID required'
      });
    }

    const result = await workerFactory.createFromTemplate(template, overrides);
    
    logger.info(`[Orchestration API] Worker created from template: ${template}`);
    
    res.json(result);
  } catch (error) {
    logger.error('[Orchestration API] POST /workers/create-from-template failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /orchestration/workers/batch-create
 * Create multiple workers at once
 * Body: { workers: [config1, config2, ...] }
 */
router.post('/workers/batch-create', async (req, res) => {
  try {
    const { workers } = req.body;
    
    if (!Array.isArray(workers) || workers.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Workers array required'
      });
    }

    const result = await workerFactory.createBatch(workers);
    
    logger.info(`[Orchestration API] Batch created: ${result.created}/${workers.length} workers`);
    
    res.json(result);
  } catch (error) {
    logger.error('[Orchestration API] POST /workers/batch-create failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /orchestration/workers/:workerId/delete
 * Delete worker completely (stop + remove from PM2 + remove from config)
 */
router.delete('/workers/:workerId/delete', async (req, res) => {
  try {
    const { workerId } = req.params;

    const result = await workerFactory.deleteWorker(workerId);
    
    logger.info(`[Orchestration API] Worker deleted: ${workerId}`);
    
    res.json(result);
  } catch (error) {
    logger.error('[Orchestration API] DELETE /workers/:workerId/delete failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /orchestration/workers/templates
 * Get all available worker templates
 */
router.get('/workers/templates', async (req, res) => {
  try {
    const templates = workerFactory.getTemplates();
    
    res.json({
      success: true,
      templates: templates,
      count: templates.length
    });
  } catch (error) {
    logger.error('[Orchestration API] GET /workers/templates failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /orchestration/workers/suggestions
 * Get smart suggestions for worker creation/scaling
 */
router.get('/workers/suggestions', async (req, res) => {
  try {
    const suggestions = await workerFactory.getSuggestions();
    
    res.json({
      success: true,
      ...suggestions
    });
  } catch (error) {
    logger.error('[Orchestration API] GET /workers/suggestions failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /orchestration/ports/available
 * Get available ports for worker assignment
 * Query params: limit (default 10)
 */
router.get('/ports/available', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const ports = await workerFactory.getAvailablePorts(limit);
    
    res.json({
      success: true,
      ports: ports,
      count: ports.length,
      next: ports[0] || null
    });
  } catch (error) {
    logger.error('[Orchestration API] GET /ports/available failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /orchestration/ports/check
 * Check if specific port is available
 * Body: { port: number }
 */
router.post('/ports/check', async (req, res) => {
  try {
    const { port } = req.body;
    
    if (!port || typeof port !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Port number required'
      });
    }

    const conflict = await workerFactory.checkPortConflict(port);
    
    res.json({
      success: true,
      port: port,
      available: !conflict,
      usedBy: conflict ? conflict.name : null
    });
  } catch (error) {
    logger.error('[Orchestration API] POST /ports/check failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /orchestration/workers/preview
 * Preview worker creation (dry run)
 * Body: worker config
 */
router.post('/workers/preview', async (req, res) => {
  try {
    const config = req.body;
    
    const preview = await workerFactory.previewWorkerCreation(config);
    
    res.json({
      success: true,
      ...preview
    });
  } catch (error) {
    logger.error('[Orchestration API] POST /workers/preview failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /orchestration/factory/status
 * Get worker factory status and statistics
 */
router.get('/factory/status', async (req, res) => {
  try {
    const status = await workerFactory.getStatus();
    
    res.json({
      success: true,
      ...status
    });
  } catch (error) {
    logger.error('[Orchestration API] GET /factory/status failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// PM2 MANAGEMENT ENDPOINTS
// ============================================

/**
 * GET /orchestration/pm2/processes
 * List all PM2 processes
 */
router.get('/pm2/processes', async (req, res) => {
  try {
    const processes = await pm2Manager.listProcesses();
    res.json({
      success: true,
      processes: processes,
      count: processes.length
    });
  } catch (error) {
    logger.error('[Orchestration API] GET /pm2/processes failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /orchestration/pm2/:processName/start
 * Start PM2 process
 */
router.post('/pm2/:processName/start', async (req, res) => {
  try {
    const { processName } = req.params;
    const result = await pm2Manager.startProcess(processName);
    res.json(result);
  } catch (error) {
    logger.error('[Orchestration API] POST /pm2/:processName/start failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /orchestration/pm2/:processName/stop
 * Stop PM2 process
 */
router.post('/pm2/:processName/stop', async (req, res) => {
  try {
    const { processName } = req.params;
    const result = await pm2Manager.stopProcess(processName);
    res.json(result);
  } catch (error) {
    logger.error('[Orchestration API] POST /pm2/:processName/stop failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /orchestration/pm2/:processName/restart
 * Restart PM2 process
 */
router.post('/pm2/:processName/restart', async (req, res) => {
  try {
    const { processName } = req.params;
    const result = await pm2Manager.restartProcess(processName);
    res.json(result);
  } catch (error) {
    logger.error('[Orchestration API] POST /pm2/:processName/restart failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /orchestration/pm2/:processName/logs
 * Get PM2 process logs
 */
router.get('/pm2/:processName/logs', async (req, res) => {
  try {
    const { processName } = req.params;
    const lines = parseInt(req.query.lines) || 100;
    const result = await pm2Manager.getLogs(processName, lines);
    res.json(result);
  } catch (error) {
    logger.error('[Orchestration API] GET /pm2/:processName/logs failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /orchestration/pm2/:processName/flush-logs
 * Flush PM2 logs
 */
router.post('/pm2/:processName/flush-logs', async (req, res) => {
  try {
    const { processName } = req.params;
    const result = await pm2Manager.flushLogs(processName);
    res.json(result);
  } catch (error) {
    logger.error('[Orchestration API] POST /pm2/:processName/flush-logs failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /orchestration/pm2/monit
 * Get real-time PM2 monitoring data
 */
router.get('/pm2/monit', async (req, res) => {
  try {
    const monitData = await pm2Manager.getMonitData();
    res.json({
      success: true,
      processes: monitData
    });
  } catch (error) {
    logger.error('[Orchestration API] GET /pm2/monit failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// JOB MANAGEMENT ENDPOINTS
// ============================================

/**
 * GET /orchestration/jobs
 * Browse jobs by state with pagination
 * Query params: state (waiting/active/failed/delayed), start, end
 */
router.get('/jobs', async (req, res) => {
  try {
    const state = req.query.state || 'waiting';
    const start = parseInt(req.query.start) || 0;
    const end = parseInt(req.query.end) || 99;
    
    const jobs = await jobManager.browseJobs(state, start, end);
    
    res.json({
      success: true,
      jobs: jobs,
      count: jobs.length,
      state: state,
      pagination: { start, end }
    });
  } catch (error) {
    logger.error('[Orchestration API] GET /jobs failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /orchestration/jobs/search
 * Search jobs by executionId or userId
 * Query params: term (search term), type (executionId/userId)
 */
router.get('/jobs/search', async (req, res) => {
  try {
    const term = req.query.term;
    const type = req.query.type || 'executionId';
    
    if (!term) {
      return res.status(400).json({
        success: false,
        error: 'Search term required'
      });
    }
    
    const jobs = await jobManager.searchJobs(term, type);
    
    res.json({
      success: true,
      jobs: jobs,
      count: jobs.length,
      searchTerm: term,
      searchType: type
    });
  } catch (error) {
    logger.error('[Orchestration API] GET /jobs/search failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /orchestration/jobs/:jobId
 * Get detailed job information
 */
router.get('/jobs/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await jobManager.getJobDetails(jobId);
    
    res.json({
      success: true,
      job: job
    });
  } catch (error) {
    logger.error('[Orchestration API] GET /jobs/:jobId failed:', error);
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /orchestration/jobs/:jobId/retry
 * Retry a failed job
 */
router.post('/jobs/:jobId/retry', async (req, res) => {
  try {
    const { jobId } = req.params;
    const result = await jobManager.retryJob(jobId);
    res.json(result);
  } catch (error) {
    logger.error('[Orchestration API] POST /jobs/:jobId/retry failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /orchestration/jobs/:jobId/cancel
 * Cancel a job
 */
router.post('/jobs/:jobId/cancel', async (req, res) => {
  try {
    const { jobId } = req.params;
    const result = await jobManager.cancelJob(jobId);
    res.json(result);
  } catch (error) {
    logger.error('[Orchestration API] POST /jobs/:jobId/cancel failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /orchestration/jobs/:jobId/priority
 * Change job priority
 * Body: { priority: number }
 */
router.post('/jobs/:jobId/priority', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { priority } = req.body;
    
    if (typeof priority !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Priority must be a number'
      });
    }
    
    const result = await jobManager.changeJobPriority(jobId, priority);
    res.json(result);
  } catch (error) {
    logger.error('[Orchestration API] POST /jobs/:jobId/priority failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /orchestration/jobs/:jobId/promote
 * Promote job to front of queue
 */
router.post('/jobs/:jobId/promote', async (req, res) => {
  try {
    const { jobId } = req.params;
    const result = await jobManager.promoteJob(jobId);
    res.json(result);
  } catch (error) {
    logger.error('[Orchestration API] POST /jobs/:jobId/promote failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /orchestration/jobs/:jobId/delay
 * Delay job execution
 * Body: { delayMs: number }
 */
router.post('/jobs/:jobId/delay', async (req, res) => {
  try {
    const { jobId } = req.params;
    const { delayMs } = req.body;
    
    if (typeof delayMs !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'delayMs must be a number'
      });
    }
    
    const result = await jobManager.delayJob(jobId, delayMs);
    res.json(result);
  } catch (error) {
    logger.error('[Orchestration API] POST /jobs/:jobId/delay failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /orchestration/jobs/counts
 * Get job counts by state
 */
router.get('/jobs/counts', async (req, res) => {
  try {
    const counts = await jobManager.getJobCounts();
    res.json({
      success: true,
      counts: counts
    });
  } catch (error) {
    logger.error('[Orchestration API] GET /jobs/counts failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /orchestration/jobs/summary
 * Get jobs summary (counts + recent jobs)
 */
router.get('/jobs/summary', async (req, res) => {
  try {
    const summary = await jobManager.getJobsSummary();
    res.json({
      success: true,
      summary: summary
    });
  } catch (error) {
    logger.error('[Orchestration API] GET /jobs/summary failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /orchestration/jobs/bulk/retry
 * Bulk retry all failed jobs
 */
router.post('/jobs/bulk/retry', async (req, res) => {
  try {
    const result = await jobManager.bulkRetryFailed();
    res.json(result);
  } catch (error) {
    logger.error('[Orchestration API] POST /jobs/bulk/retry failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /orchestration/jobs/bulk/cancel
 * Bulk cancel jobs
 * Body: { jobIds: [string] }
 */
router.post('/jobs/bulk/cancel', async (req, res) => {
  try {
    const { jobIds } = req.body;
    
    if (!Array.isArray(jobIds)) {
      return res.status(400).json({
        success: false,
        error: 'jobIds must be an array'
      });
    }
    
    const result = await jobManager.bulkCancel(jobIds);
    res.json(result);
  } catch (error) {
    logger.error('[Orchestration API] POST /jobs/bulk/cancel failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /orchestration/jobs/bulk/priority
 * Bulk change job priority
 * Body: { jobIds: [string], priority: number }
 */
router.post('/jobs/bulk/priority', async (req, res) => {
  try {
    const { jobIds, priority } = req.body;
    
    if (!Array.isArray(jobIds)) {
      return res.status(400).json({
        success: false,
        error: 'jobIds must be an array'
      });
    }
    
    if (typeof priority !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'priority must be a number'
      });
    }
    
    const result = await jobManager.bulkChangePriority(jobIds, priority);
    res.json(result);
  } catch (error) {
    logger.error('[Orchestration API] POST /jobs/bulk/priority failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /orchestration/jobs/failed/analysis
 * Analyze failed jobs for error patterns
 */
router.get('/jobs/failed/analysis', async (req, res) => {
  try {
    const analysis = await jobManager.getFailedJobsAnalysis();
    res.json({
      success: true,
      analysis: analysis
    });
  } catch (error) {
    logger.error('[Orchestration API] GET /jobs/failed/analysis failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /orchestration/jobs/schedule/recurring
 * Schedule recurring job (cron)
 * Body: { jobType: string, payload: object, cronPattern: string }
 */
router.post('/jobs/schedule/recurring', async (req, res) => {
  try {
    const { jobType, payload, cronPattern } = req.body;
    
    if (!jobType || !payload || !cronPattern) {
      return res.status(400).json({
        success: false,
        error: 'jobType, payload, and cronPattern are required'
      });
    }
    
    const result = await jobManager.scheduleRecurringJob(jobType, payload, cronPattern);
    res.json(result);
  } catch (error) {
    logger.error('[Orchestration API] POST /jobs/schedule/recurring failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /orchestration/jobs/schedule/recurring
 * Get all recurring jobs
 */
router.get('/jobs/schedule/recurring', async (req, res) => {
  try {
    const jobs = await jobManager.getRepeatableJobs();
    res.json({
      success: true,
      jobs: jobs,
      count: jobs.length
    });
  } catch (error) {
    logger.error('[Orchestration API] GET /jobs/schedule/recurring failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /orchestration/jobs/schedule/recurring/:key
 * Remove recurring job
 */
router.delete('/jobs/schedule/recurring/:key', async (req, res) => {
  try {
    const { key } = req.params;
    const result = await jobManager.removeRepeatableJob(key);
    res.json(result);
  } catch (error) {
    logger.error('[Orchestration API] DELETE /jobs/schedule/recurring/:key failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /orchestration/jobs/clean/completed
 * Clean completed jobs older than specified age
 * Body: { ageHours: number } (default 24)
 */
router.post('/jobs/clean/completed', async (req, res) => {
  try {
    const ageHours = req.body.ageHours || 24;
    const ageMs = ageHours * 60 * 60 * 1000;
    
    const result = await jobManager.cleanCompletedJobs(ageMs);
    res.json(result);
  } catch (error) {
    logger.error('[Orchestration API] POST /jobs/clean/completed failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// ROUTING ENGINE ENDPOINTS
// ============================================

/**
 * GET /orchestration/routing/config
 * Get routing configuration
 */
router.get('/routing/config', async (req, res) => {
  try {
    const config = routingEngine.getConfig();
    res.json({
      success: true,
      config: config
    });
  } catch (error) {
    logger.error('[Orchestration API] GET /routing/config failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /orchestration/routing/strategy
 * Set routing strategy
 * Body: { strategy: string }
 */
router.post('/routing/strategy', async (req, res) => {
  try {
    const { strategy } = req.body;
    
    if (!strategy) {
      return res.status(400).json({
        success: false,
        error: 'strategy is required'
      });
    }
    
    routingEngine.setStrategy(strategy);
    
    res.json({
      success: true,
      message: `Routing strategy set to: ${strategy}`,
      strategy: strategy
    });
  } catch (error) {
    logger.error('[Orchestration API] POST /routing/strategy failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /orchestration/routing/affinity
 * Set affinity rule
 * Body: { jobType: string, tags: [string] }
 */
router.post('/routing/affinity', async (req, res) => {
  try {
    const { jobType, tags } = req.body;
    
    if (!jobType || !Array.isArray(tags)) {
      return res.status(400).json({
        success: false,
        error: 'jobType (string) and tags (array) are required'
      });
    }
    
    routingEngine.setAffinityRule(jobType, tags);
    
    res.json({
      success: true,
      message: `Affinity rule set: ${jobType} → [${tags.join(', ')}]`
    });
  } catch (error) {
    logger.error('[Orchestration API] POST /routing/affinity failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /orchestration/routing/metrics
 * Get routing performance metrics
 */
router.get('/routing/metrics', async (req, res) => {
  try {
    const metrics = routingEngine.getMetrics();
    res.json({
      success: true,
      metrics: metrics
    });
  } catch (error) {
    logger.error('[Orchestration API] GET /routing/metrics failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /orchestration/routing/metrics/reset
 * Reset routing metrics
 */
router.post('/routing/metrics/reset', async (req, res) => {
  try {
    routingEngine.resetMetrics();
    res.json({
      success: true,
      message: 'Routing metrics reset'
    });
  } catch (error) {
    logger.error('[Orchestration API] POST /routing/metrics/reset failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// METRICS & ANALYTICS ENDPOINTS
// ============================================

/**
 * GET /orchestration/metrics/system
 * Get comprehensive system metrics
 */
router.get('/metrics/system', async (req, res) => {
  try {
    const metrics = await metricsCollector.getSystemMetrics();
    res.json({
      success: true,
      metrics: metrics
    });
  } catch (error) {
    logger.error('[Orchestration API] GET /metrics/system failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /orchestration/metrics/historical
 * Get historical metrics for charts
 * Query params: range (1h/6h/24h)
 */
router.get('/metrics/historical', async (req, res) => {
  try {
    const range = req.query.range || '1h';
    const metrics = metricsCollector.getAllHistoricalMetrics(range);
    
    res.json({
      success: true,
      metrics: metrics,
      range: range
    });
  } catch (error) {
    logger.error('[Orchestration API] GET /metrics/historical failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /orchestration/metrics/capacity
 * Get capacity planning recommendations
 */
router.get('/metrics/capacity', async (req, res) => {
  try {
    const recommendations = await metricsCollector.getCapacityRecommendations();
    res.json({
      success: true,
      recommendations: recommendations,
      count: recommendations.length
    });
  } catch (error) {
    logger.error('[Orchestration API] GET /metrics/capacity failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// HEALTH CHECK
// ============================================

/**
 * GET /orchestration/health
 * Orchestration system health check
 */
router.get('/health', async (req, res) => {
  try {
    const [workers, pm2, metrics] = await Promise.all([
      workerRegistry.getAllWorkers().catch(() => []),
      pm2Manager.listProcesses().catch(() => []),
      metricsCollector.getSystemMetrics().catch(() => ({}))
    ]);

    res.json({
      success: true,
      status: 'healthy',
      components: {
        workerRegistry: workers.length > 0 ? 'healthy' : 'no_workers',
        pm2Manager: pm2.length > 0 ? 'healthy' : 'unavailable',
        metricsCollector: metrics.timestamp ? 'healthy' : 'unavailable',
        jobManager: jobManager.queue ? 'healthy' : 'not_initialized',
        routingEngine: 'healthy'
      },
      timestamp: Date.now()
    });
  } catch (error) {
    logger.error('[Orchestration API] GET /health failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

