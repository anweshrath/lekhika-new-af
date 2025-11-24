const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const logger = require('./utils/logger');
const { initializeSupabase } = require('./services/supabase');
const executionService = require('./services/executionService');
const healthService = require('./services/healthService');
const analyticsAggregator = require('./services/analyticsAggregator');
const queue = require('./services/queue');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS middleware (must come before helmet)
app.use(cors({
  origin: '*', // Allow all origins explicitly
  credentials: false, // Disable credentials for wildcard origin
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Cache-Control', 'Accept'],
  exposedHeaders: ['Content-Length', 'Content-Type'],
  maxAge: 86400 // Cache preflight for 24 hours
}));

// SURGICAL FIX: Handle OPTIONS preflight requests explicitly
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Cache-Control, Accept');
  res.header('Access-Control-Max-Age', '86400');
  res.sendStatus(204);
});

// Security middleware (disabled for CORS compatibility)
// app.use(helmet({
//   crossOriginEmbedderPolicy: false,
//   contentSecurityPolicy: false
// }));

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    workerId: process.env.WORKER_ID,
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: require('./package.json').version
  });
});

// Main execution endpoint
app.post('/execute', async (req, res) => {
  logger.info('📥 POST /execute received:', req.body);
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
    
    // SURGICAL: Validate userId explicitly - critical for executionUser construction
    if (!userId) {
      logger.error('❌ userId is missing in /execute request:', { executionId, hasUserId: !!userId });
      return res.status(400).json({
        error: 'Missing required parameter: userId',
        required: ['executionId', 'lekhikaApiKey', 'userEngineId', 'masterEngineId', 'userId', 'workflow', 'inputs']
      });
    }
    
    if (!executionId || !lekhikaApiKey || !userEngineId || !masterEngineId || !workflow || !inputs) {
      logger.warn('Missing required parameters for execution:', { 
        executionId, 
        lekhikaApiKey: !!lekhikaApiKey, 
        userEngineId, 
        masterEngineId, 
        userId, 
        workflow: !!workflow, 
        inputs: !!inputs 
      });
      return res.status(400).json({
        error: 'Missing required parameters',
        required: ['executionId', 'lekhikaApiKey', 'userEngineId', 'masterEngineId', 'userId', 'workflow', 'inputs']
      });
    }

    logger.info(`🚀 Starting execution ${executionId} for user ${userId} with Lekhika API key ${lekhikaApiKey}`);

    const queueEnabled = String(process.env.QUEUE_ENABLED || 'false').toLowerCase() === 'true';

    if (queueEnabled) {
      // Enqueue job for asynchronous processing by queueWorker
      await queue.enqueue('workflow.execute', {
        executionId,
        lekhikaApiKey,
        userEngineId,
        masterEngineId,
        userId,
        workflow,
        inputs,
        options
      }, { jobId: executionId });

      return res.json({
        success: true,
        queued: true,
        executionId
      });
    }

    // Direct execution path (queue disabled) - preserves existing behavior
    const result = await executionService.executeWorkflow({
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
      result
    });

  } catch (error) {
    logger.error('Execution failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      executionId: req.body.executionId
    });
  }
});

// Status endpoint for specific execution
app.get('/status/:executionId', async (req, res) => {
  try {
    // SURGICAL: Validate internal auth for Edge Function calls
    const internalAuth = req.headers['x-internal-auth']
    const expectedSecret = process.env.INTERNAL_API_SECRET || 'dev-secret-key'
    
    if (internalAuth !== expectedSecret) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized - invalid internal auth'
      })
    }
    
    const { executionId } = req.params;
    const status = await executionService.getExecutionStatus(executionId);
    
    res.json({
      success: true,
      executionId,
      status
    });
  } catch (error) {
    logger.error('Status check failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Stop execution endpoint
app.post('/stop/:executionId', async (req, res) => {
  try {
    const { executionId } = req.params;
    logger.info(`🛑 Stop request received for execution ${executionId}`);
    
    const result = await executionService.stopExecution(executionId);
    
    res.json({
      success: true,
      message: result.message,
      executionId
    });
    
  } catch (error) {
    logger.error('Stop execution failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      executionId: req.params.executionId
    });
  }
});

// SURGICAL FIX: Resume execution from checkpoint endpoint
// CRITICAL: Match execute endpoint pattern (no engineId in URL - handled by Edge Function)
app.post('/resume', async (req, res) => {
  try {
    const { executionId, nodes: bodyNodes, edges: bodyEdges, workflow, regenerateContext } = req.body;
    const nodes = bodyNodes || workflow?.nodes;
    const edges = bodyEdges || workflow?.edges;
    logger.info(`🔄 Resume request received for execution ${executionId}`);
    logger.info(`🔍 Request body keys:`, Object.keys(req.body));
    logger.info(`🔍 Has nodes:`, !!nodes, `Has edges:`, !!edges);
    logger.info(`🔍 Has regenerateContext:`, !!regenerateContext, `Has manualInstruction:`, !!regenerateContext?.manualInstruction);
    
    if (!executionId) {
      return res.status(400).json({
        success: false,
        error: 'executionId is required'
      });
    }
    
    if (!nodes || !edges) {
      logger.error(`❌ Missing nodes or edges. Nodes: ${!!nodes}, Edges: ${!!edges}`);
      return res.status(400).json({
        success: false,
        error: 'nodes and edges are required for resume',
        debug: {
          hasNodes: !!nodes,
          hasEdges: !!edges,
          bodyKeys: Object.keys(req.body)
        }
      });
    }
    
    // Call workflowExecutionService.resumeExecution
    const workflowExecutionService = require('./services/workflowExecutionService');
    
    // SURGICAL: Set status to 'running' immediately so frontend knows to poll
    try {
      await executionService.updateExecutionStatus(executionId, 'running', {
        status: 'running',
        message: 'Resuming execution from checkpoint...',
        resumed: true
      });
      logger.info(`✅ Set execution ${executionId} status to 'running' for resume`);
    } catch (statusError) {
      logger.warn(`⚠️ Failed to set status to 'running' at resume start:`, statusError.message);
      // Continue anyway - progress callback will try again
    }
    
    // SURGICAL: Progress callback to update database (same as /execute endpoint)
    const progressCallback = async (update) => {
      logger.info(`📊 Resume progress: ${JSON.stringify(update)}`);
      // Update execution status in DB so frontend polling can see progress
      try {
        await executionService.updateExecutionStatus(executionId, 'running', update);
      } catch (updateError) {
        logger.warn(`⚠️ Failed to update execution status during resume:`, updateError.message);
        // Don't throw - resume should continue even if DB update fails
      }
    };
    
    // SURGICAL: Pass regenerateContext to resumeExecution so user guidance can be applied
    const result = await workflowExecutionService.resumeExecution(
      executionId,
      nodes,
      edges,
      progressCallback,
      regenerateContext // Pass user guidance/instructions for failed node retry
    );
    
    // SURGICAL: Handle error result from resume (don't return success: true if it failed)
    if (result && result.success === false) {
      logger.error(`❌ Resume failed: ${result.error}`, {
        executionId,
        failedAtNode: result.failedAtNode,
        fullError: result.fullError
      });
      return res.status(500).json({
        success: false,
        error: result.error,
        fullError: result.fullError,
        failedAtNode: result.failedAtNode,
        failedNodeName: result.failedNodeName,
        executionId
      });
    }
    
    res.json({
      success: true,
      message: 'Execution resumed successfully',
      executionId,
      result
    });
    
  } catch (error) {
    logger.error('Resume execution failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      executionId: req.body.executionId
    });
  }
});

// Regenerate endpoint - retry failed content with error feedback
app.post('/regenerate', async (req, res) => {
  try {
    const { executionId, failedNode, validationError, regeneratePrompt } = req.body;
    logger.info(`🔁 Regenerate request received for execution ${executionId}`);
    logger.info(`❌ Validation error:`, validationError);
    
    // Validate input
    if (!executionId) {
      return res.status(400).json({
        success: false,
        error: 'Missing executionId'
      });
    }
    
    if (!validationError || !regeneratePrompt) {
      return res.status(400).json({
        success: false,
        error: 'Missing validation error details or regenerate prompt'
      });
    }
    
    // Call execution service to regenerate with error feedback
    const result = await executionService.regenerateFailedNode(executionId, {
      failedNode,
      validationError,
      regeneratePrompt
    });
    
    logger.info(`✅ Regeneration started for execution ${executionId}`);
    res.json({
      success: true,
      executionId: executionId,
      attempt: result?.attempt || 1,
      message: 'Regeneration started with validation feedback'
    });
    
  } catch (error) {
    logger.error('❌ Regenerate error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      executionId: req.body.executionId
    });
  }
});

// Worker status endpoint
app.get('/status', async (req, res) => {
  try {
    const activeExecutions = executionService.activeExecutions.size;
    const maxConcurrent = executionService.maxConcurrent;
    const isHealthy = activeExecutions < maxConcurrent;
    const activeExecutionIds = Array.from(executionService.activeExecutions.keys());
    
    res.json({
      success: true,
      status: isHealthy ? 'healthy' : 'overloaded',
      activeExecutions,
      maxConcurrent,
      capacity: `${activeExecutions}/${maxConcurrent}`,
      activeExecutionIds,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage()
    });
  } catch (error) {
    logger.error('Status check failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Queue stats endpoint (admin / monitoring)
app.get('/queue/stats', async (req, res) => {
  try {
    const queueEnabled = String(process.env.QUEUE_ENABLED || 'false').toLowerCase() === 'true';

    if (!queueEnabled) {
      return res.json({
        success: true,
        enabled: false,
        message: 'Queue system disabled (QUEUE_ENABLED=false)'
      });
    }

    const adapter = queue;
    const stats = {};

    if (adapter && typeof adapter.getQueueStats === 'function') {
      Object.assign(stats, await adapter.getQueueStats());
    }

    return res.json({
      success: true,
      enabled: true,
      stats
    });
  } catch (error) {
    logger.error('Queue stats failed:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Retry a failed execution by executionId (admin-only usage)
app.post('/queue/retry/:executionId', async (req, res) => {
  try {
    const queueEnabled = String(process.env.QUEUE_ENABLED || 'false').toLowerCase() === 'true';
    if (!queueEnabled) {
      return res.status(400).json({
        success: false,
        error: 'Queue system disabled'
      });
    }

    const { executionId } = req.params;
    await queue.retry(executionId);

    return res.json({
      success: true,
      executionId,
      message: 'Retry requested'
    });
  } catch (error) {
    logger.error('Queue retry failed:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Pause the queue (admin-only usage)
app.post('/queue/pause', async (req, res) => {
  try {
    const queueEnabled = String(process.env.QUEUE_ENABLED || 'false').toLowerCase() === 'true';
    if (!queueEnabled) {
      return res.status(400).json({
        success: false,
        error: 'Queue system disabled'
      });
    }

    await queue.pause();
    return res.json({
      success: true,
      message: 'Queue paused'
    });
  } catch (error) {
    logger.error('Queue pause failed:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Resume the queue (admin-only usage)
app.post('/queue/resume', async (req, res) => {
  try {
    const queueEnabled = String(process.env.QUEUE_ENABLED || 'false').toLowerCase() === 'true';
    if (!queueEnabled) {
      return res.status(400).json({
        success: false,
        error: 'Queue system disabled'
      });
    }

    await queue.resume();
    return res.json({
      success: true,
      message: 'Queue resumed'
    });
  } catch (error) {
    logger.error('Queue resume failed:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Cancel a queued execution by executionId (admin-only usage)
app.post('/queue/cancel/:executionId', async (req, res) => {
  try {
    const queueEnabled = String(process.env.QUEUE_ENABLED || 'false').toLowerCase() === 'true';
    if (!queueEnabled) {
      return res.status(400).json({
        success: false,
        error: 'Queue system disabled'
      });
    }

    const { executionId } = req.params;
    await queue.cancel(executionId);

    return res.json({
      success: true,
      executionId,
      message: 'Queue job cancelled (if it existed)'
    });
  } catch (error) {
    logger.error('Queue cancel failed:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Clear failed jobs from the queue (admin-only usage)
app.post('/queue/clear/failed', async (req, res) => {
  try {
    const queueEnabled = String(process.env.QUEUE_ENABLED || 'false').toLowerCase() === 'true';
    if (!queueEnabled) {
      return res.status(400).json({
        success: false,
        error: 'Queue system disabled'
      });
    }

    const cleared = await queue.clearFailed();
    return res.json({
      success: true,
      cleared,
      message: `Cleared ${cleared} failed jobs`
    });
  } catch (error) {
    logger.error('Queue clear failed jobs failed:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Clear delayed jobs from the queue (admin-only usage)
app.post('/queue/clear/delayed', async (req, res) => {
  try {
    const queueEnabled = String(process.env.QUEUE_ENABLED || 'false').toLowerCase() === 'true';
    if (!queueEnabled) {
      return res.status(400).json({
        success: false,
        error: 'Queue system disabled'
      });
    }

    const cleared = await queue.clearDelayed();
    return res.json({
      success: true,
      cleared,
      message: `Cleared ${cleared} delayed jobs`
    });
  } catch (error) {
    logger.error('Queue clear delayed jobs failed:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Clear waiting jobs from the queue (admin-only usage)
app.post('/queue/clear/waiting', async (req, res) => {
  try {
    const queueEnabled = String(process.env.QUEUE_ENABLED || 'false').toLowerCase() === 'true';
    if (!queueEnabled) {
      return res.status(400).json({
        success: false,
        error: 'Queue system disabled'
      });
    }

    if (typeof queue.clearWaiting !== 'function') {
      return res.status(500).json({
        success: false,
        error: 'clearWaiting not implemented for current queue adapter'
      });
    }

    const cleared = await queue.clearWaiting();
    return res.json({
      success: true,
      cleared,
      message: `Cleared ${cleared} waiting jobs`
    });
  } catch (error) {
    logger.error('Queue clear waiting jobs failed:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Hard reset queue: clear waiting, delayed, and failed jobs (admin-only usage)
app.post('/queue/reset', async (req, res) => {
  try {
    const queueEnabled = String(process.env.QUEUE_ENABLED || 'false').toLowerCase() === 'true';
    if (!queueEnabled) {
      return res.status(400).json({
        success: false,
        error: 'Queue system disabled'
      });
    }

    if (typeof queue.resetAll !== 'function') {
      return res.status(500).json({
        success: false,
        error: 'resetAll not implemented for current queue adapter'
      });
    }

    const result = await queue.resetAll();
    return res.json({
      success: true,
      message: 'Queue hard reset applied – waiting, delayed, and failed jobs cleared',
      ...result
    });
  } catch (error) {
    logger.error('Queue reset failed:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Force cleanup endpoint (emergency use)
app.post('/cleanup', async (req, res) => {
  try {
    logger.warn('🧹 Force cleanup requested');
    executionService.cleanupStuckExecutions();
    await executionService.cleanupStuckDatabaseExecutions();
    
    res.json({
      success: true,
      message: 'Cleanup completed',
      activeExecutions: executionService.activeExecutions.size
    });
  } catch (error) {
    logger.error('Cleanup failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Restart worker endpoint
app.post('/restart', async (req, res) => {
  try {
    logger.warn('🔄 Worker restart requested');
    
    res.json({
      success: true,
      message: 'Worker restart initiated'
    });
    
    // Give response time to send, then restart
    setTimeout(() => {
      process.exit(0);
    }, 1000);
    
  } catch (error) {
    logger.error('Restart failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Stop worker endpoint (stops PM2 process)
app.post('/stop-worker', async (req, res) => {
  try {
    logger.warn('🛑 Worker stop requested');
    const { exec } = require('child_process');
    const PM2_PATH = '/home/lekhika.online/.nvm/versions/node/v18.20.8/bin/pm2';
    const WORKER_DIR = '/home/lekhika.online/vps-worker';
    
    // Send response first before stopping
    res.json({
      success: true,
      message: 'Worker stop initiated'
    });
    
    // Stop PM2 process after response is sent
    setTimeout(() => {
      exec(`${PM2_PATH} stop lekhika-worker`, { cwd: WORKER_DIR }, (error, stdout, stderr) => {
        if (error) {
          logger.error('Failed to stop worker:', error);
          logger.error('Stderr:', stderr);
        } else {
          logger.info('Worker stopped successfully');
          if (stdout) logger.info('PM2 output:', stdout);
        }
      });
    }, 500);
    
  } catch (error) {
    logger.error('Stop worker failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Start worker endpoint (starts PM2 process)
app.post('/start-worker', async (req, res) => {
  try {
    logger.warn('▶️ Worker start requested');
    const { exec } = require('child_process');
    const PM2_PATH = '/home/lekhika.online/.nvm/versions/node/v18.20.8/bin/pm2';
    const WORKER_DIR = '/home/lekhika.online/vps-worker';
    
    exec(`${PM2_PATH} start lekhika-worker`, { cwd: WORKER_DIR }, (error, stdout, stderr) => {
      if (error) {
        logger.error('Failed to start worker:', error);
        logger.error('Stderr:', stderr);
        return res.status(500).json({
          success: false,
          error: error.message || 'PM2 command failed',
          stderr: stderr
        });
      }
      
      logger.info('Worker started successfully');
      if (stdout) logger.info('PM2 output:', stdout);
      res.json({
        success: true,
        message: 'Worker start initiated',
        output: stdout
      });
    });
    
  } catch (error) {
    logger.error('Start worker failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get recent logs endpoint  
app.get('/logs', async (req, res) => {
  try {
    const fs = require('fs').promises;
    const limit = parseInt(req.query.limit) || 50;
    
    // SURGICAL FIX: Use correct log paths from PM2 config (ecosystem.config.js)
    const logPath = '/home/lekhika.online/vps-worker/logs/lekhika-worker-out.log';
    const errorLogPath = '/home/lekhika.online/vps-worker/logs/lekhika-worker-error.log';
    
    let allLogs = [];
    
    // Read and parse output logs
    try {
      const outContent = await fs.readFile(logPath, 'utf-8');
      const outLines = outContent.split('\n').filter(line => line.trim());
      
      outLines.forEach(line => {
        // New Winston format: "YYYY-MM-DD HH:mm:ss level: message {...}"
        // Extract timestamp from beginning of line
        const timestampMatch = line.match(/^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})/);
        const timestamp = timestampMatch ? timestampMatch[1] : null;
        
        if (timestamp) {
          // Strip ANSI codes and timestamp prefix
          const cleanMessage = line.replace(/\x1b\[[0-9;]*m/g, '').replace(/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\s+/, '');
          allLogs.push({
            timestamp: new Date(timestamp).toISOString(),
            level: 'info',
            message: cleanMessage,
            type: 'stdout',
            rawTimestamp: timestamp
          });
        }
      });
    } catch (err) {
      // Log file might not exist
    }
    
    // Read and parse error logs
    try {
      const errContent = await fs.readFile(errorLogPath, 'utf-8');
      const errLines = errContent.split('\n').filter(line => line.trim());
      
      errLines.forEach(line => {
        // New Winston format with timestamps in error logs too
        const timestampMatch = line.match(/^(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})/);
        const timestamp = timestampMatch ? timestampMatch[1] : null;
        
        if (timestamp) {
          // Strip ANSI codes and timestamp prefix
          const cleanMessage = line.replace(/\x1b\[[0-9;]*m/g, '').replace(/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\s+/, '');
          allLogs.push({
            timestamp: new Date(timestamp).toISOString(),
            level: 'error',
            message: cleanMessage,
            type: 'stderr',
            rawTimestamp: timestamp
          });
        }
      });
    } catch (err) {
      // Error log file might not exist
    }
    
    // Sort by timestamp and take most recent
    const sortedLogs = allLogs
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
    
    // SURGICAL FIX: Ensure CORS headers are set explicitly
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    res.json({
      success: true,
      logs: sortedLogs,
      count: sortedLogs.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    logger.error('Failed to fetch logs:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      logs: []
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Initialize services
async function initializeServices() {
  try {
    logger.info('Initializing Lekhika VPS Worker...');
    
    // Initialize Supabase connection
    await initializeSupabase();
    logger.info('✅ Supabase initialized');
    
    // AI providers are initialized on-demand when needed
    logger.info('✅ AI providers ready (on-demand initialization)');
    
    // Start health monitoring
    healthService.startMonitoring();
    logger.info('✅ Health monitoring started');
    
    // Initialize analytics aggregator
    await analyticsAggregator.initialize();
    logger.info('✅ Analytics aggregator initialized');
    
    logger.info('🚀 Lekhika VPS Worker ready!');
    
  } catch (error) {
    logger.error('Failed to initialize services:', error);
    process.exit(1);
  }
}

// Initialize services first
initializeServices().then(() => {
  // Start server after initialization
  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`🚀 Lekhika VPS Worker running on port ${PORT}`);
  });
}).catch((error) => {
  logger.error('Failed to initialize services:', error);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  healthService.stopMonitoring();
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...');
  healthService.stopMonitoring();
  process.exit(0);
});


module.exports = app;
