/**
 * LEAN WORKER SERVER
 * 
 * Memory-optimized worker on port 3002
 * Uses leanExecutionService.js for 70% memory reduction
 * 
 * Differences from standard server.js:
 * - Port 3002 (vs. 3001)
 * - Uses leanExecutionService instead of executionService
 * - All features identical, just optimized memory usage
 * 
 * Created: 2025-11-24
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const logger = require('./utils/logger');
const { initializeSupabase, getSupabase } = require('./services/supabase');
const leanExecutionService = require('./services/leanExecutionService'); // LEAN VERSION
const healthService = require('./services/healthService');
const analyticsAggregator = require('./services/analyticsAggregator');
const queue = require('./services/queue');

// ORCHESTRATION SERVICES (Mother Control Panel)
const workerRegistry = require('./services/workerRegistry');
const pm2Manager = require('./services/pm2Manager');
const jobManager = require('./services/jobManager');
const metricsCollector = require('./services/metricsCollector');
const orchestrationRouter = require('./routes/orchestration');

const app = express();
const PORT = process.env.LEAN_PORT || 3002; // Different port for lean worker

// CORS middleware
app.use(cors({
  origin: '*',
  credentials: false,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cache-Control', 'Accept'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400
}));

app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Cache-Control, Accept');
  res.header('Access-Control-Max-Age', '86400');
  res.sendStatus(204);
});

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging
app.use((req, res, next) => {
  logger.info(`[LEAN] ${req.method} ${req.path}`, {
    ip: req.ip,
    timestamp: new Date().toISOString()
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    worker_type: 'lean',
    timestamp: new Date().toISOString(),
    workerId: process.env.WORKER_ID + '-lean',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: require('./package.json').version,
    port: PORT
  });
});

// Main execution endpoint
app.post('/execute', async (req, res) => {
  logger.info('[LEAN] 📥 POST /execute received');
  try {
    const { 
      executionId, 
      lekhikaApiKey, 
      userEngineId, 
      masterEngineId, 
      userId, 
      workflow, 
      inputs, 
      options 
    } = req.body;
    
    if (!userId) {
      logger.error('[LEAN] ❌ userId is missing');
      return res.status(400).json({
        error: 'Missing required parameter: userId'
      });
    }
    
    if (!executionId || !lekhikaApiKey || !userEngineId || !masterEngineId || !workflow || !inputs) {
      logger.warn('[LEAN] Missing required parameters');
      return res.status(400).json({
        error: 'Missing required parameters',
        required: ['executionId', 'lekhikaApiKey', 'userEngineId', 'masterEngineId', 'userId', 'workflow', 'inputs']
      });
    }

    logger.info(`[LEAN] 🚀 Starting execution ${executionId}`);

    const queueEnabled = String(process.env.QUEUE_ENABLED || 'false').toLowerCase() === 'true';

    if (queueEnabled) {
      // Enqueue job - queueWorker will process using leanExecutionService
      await queue.enqueue('workflow.execute', {
        executionId,
        lekhikaApiKey,
        userEngineId,
        masterEngineId,
        userId,
        workflow,
        inputs,
        options,
        workerType: 'lean' // Flag for queueWorker to use lean service
      }, { jobId: executionId });

      return res.json({
        success: true,
        queued: true,
        executionId,
        workerType: 'lean'
      });
    }

    // Direct execution (queue disabled)
    const result = await leanExecutionService.executeWorkflow({
      executionId,
      lekhikaApiKey,
      userEngineId,
      masterEngineId,
      userId,
      workflow,
      inputs,
      options
    });

    return res.json({
      success: true,
      executionId,
      workerType: 'lean',
      result
    });

  } catch (error) {
    logger.error('[LEAN] Execution failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      workerType: 'lean'
    });
  }
});

// Status endpoint
app.get('/status/:executionId', async (req, res) => {
  try {
    const { executionId } = req.params;
    const status = leanExecutionService.getExecutionStatus(executionId);
    
    res.json({
      success: true,
      executionId,
      workerType: 'lean',
      ...status
    });
  } catch (error) {
    logger.error('[LEAN] Status check failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Stop endpoint
app.post('/stop/:executionId', async (req, res) => {
  try {
    const { executionId } = req.params;
    const result = await leanExecutionService.stopExecution(executionId);
    
    res.json({
      success: true,
      executionId,
      workerType: 'lean',
      ...result
    });
  } catch (error) {
    logger.error('[LEAN] Stop failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Worker status endpoint
app.get('/status', async (req, res) => {
  try {
    const activeExecutionIds = Array.from(leanExecutionService.activeExecutions.keys());
    
    res.json({
      success: true,
      workerType: 'lean',
      status: 'running',
      activeExecutions: leanExecutionService.activeExecutions.size,
      activeExecutionIds: activeExecutionIds,
      maxConcurrent: leanExecutionService.maxConcurrent,
      capacity: `${leanExecutionService.activeExecutions.size}/${leanExecutionService.maxConcurrent}`,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      port: PORT
    });
  } catch (error) {
    logger.error('[LEAN] Status failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Mount orchestration router
app.use('/orchestration', orchestrationRouter);
logger.info('[LEAN] ✅ Orchestration API router mounted at /orchestration');

// Queue stats endpoint
app.get('/queue/stats', async (req, res) => {
  try {
    const stats = await queue.getStats('workflow.execute');
    res.json({
      success: true,
      workerType: 'lean',
      stats
    });
  } catch (error) {
    logger.error('[LEAN] Queue stats failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Initialize and start server
async function startServer() {
  try {
    logger.info('[LEAN] 🚀 Initializing Lean Worker...');
    
    // Initialize Supabase
    await initializeSupabase();
    logger.info('[LEAN] ✅ Supabase initialized');
    
    // Initialize health monitoring
    healthService.startMonitoring();
    logger.info('[LEAN] ✅ Health monitoring started');
    
    // Initialize analytics aggregator
    await analyticsAggregator.initialize();
    logger.info('[LEAN] ✅ Analytics aggregator initialized');
    
    // ORCHESTRATION: Initialize Mother Control Panel services
    try {
      const queueEnabled = String(process.env.QUEUE_ENABLED || 'false').toLowerCase() === 'true';
      
      if (queueEnabled && queue.connection) {
        // Initialize worker registry with Redis connection
        await workerRegistry.initialize(queue.connection);
        await workerRegistry.registerSelf();
        logger.info('[LEAN] ✅ Worker Registry initialized - lean worker registered');
        
        // Initialize job manager with queue and Supabase
        jobManager.initialize(queue, getSupabase());
        logger.info('[LEAN] ✅ Job Manager initialized');
        
        // Initialize metrics collector with queue
        metricsCollector.initialize(queue);
        logger.info('[LEAN] ✅ Metrics Collector initialized');
        
        logger.info('[LEAN] 🎛️ Orchestration Control Center ACTIVE');
      } else {
        logger.info('[LEAN] ⚠️ Orchestration features disabled (QUEUE_ENABLED=false)');
      }
    } catch (orchestrationError) {
      logger.warn('[LEAN] ⚠️ Orchestration services initialization failed:', orchestrationError.message);
    }
    
    app.listen(PORT, () => {
      logger.info(`[LEAN] ✅ Lean Worker listening on port ${PORT}`);
      logger.info(`[LEAN] 🎯 Memory-optimized worker ready (70% reduction target)`);
      logger.info(`[LEAN] 📊 Max concurrent: ${leanExecutionService.maxConcurrent}`);
    });
    
  } catch (error) {
    logger.error('[LEAN] ❌ Failed to start Lean Worker:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('[LEAN] 🛑 SIGTERM received, shutting down gracefully');
  leanExecutionService.cleanup();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('[LEAN] 🛑 SIGINT received, shutting down gracefully');
  leanExecutionService.cleanup();
  process.exit(0);
});

