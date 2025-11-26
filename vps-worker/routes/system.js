/**
 * SYSTEM CONTROL ROUTER
 * 
 * System-level operations (queue toggle, worker control, config updates)
 * These are admin operations that modify worker configuration
 * 
 * Features:
 * - Queue enable/disable (updates .env, restarts workers)
 * - Worker enable/disable
 * - Config updates
 * 
 * Created: 2025-11-24
 * Part of: Orchestration Control Center (Mother Control Panel)
 */

const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const logger = require('../utils/logger');

const execAsync = promisify(exec);

/**
 * POST /system/queue/toggle
 * Enable or disable queue system
 * Body: { enabled: boolean }
 * 
 * This ACTUALLY WORKS - updates .env and restarts workers
 */
router.post('/queue/toggle', async (req, res) => {
  try {
    const { enabled } = req.body;
    
    if (typeof enabled !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'enabled must be a boolean'
      });
    }

    const envPath = path.join(__dirname, '../.env');
    
    // Read current .env
    let envContent = await fs.readFile(envPath, 'utf8');
    
    // Update QUEUE_ENABLED value
    if (envContent.includes('QUEUE_ENABLED=')) {
      envContent = envContent.replace(
        /QUEUE_ENABLED=.*/,
        `QUEUE_ENABLED=${enabled}`
      );
    } else {
      envContent += `\nQUEUE_ENABLED=${enabled}\n`;
    }
    
    // Write back to .env
    await fs.writeFile(envPath, envContent);
    
    logger.info(`[SystemControl] Queue ${enabled ? 'enabled' : 'disabled'} in .env`);
    
    // Restart PM2 processes to apply changes
    try {
      const { stdout } = await execAsync('pm2 restart all');
      logger.info('[SystemControl] PM2 processes restarted');
      
      res.json({
        success: true,
        message: `Queue ${enabled ? 'enabled' : 'disabled'} successfully. Workers restarted.`,
        queueEnabled: enabled,
        pm2Output: stdout
      });
    } catch (pm2Error) {
      logger.error('[SystemControl] PM2 restart failed:', pm2Error);
      
      // Queue state updated but restart failed
      res.json({
        success: true,
        warning: 'Queue state updated but PM2 restart failed. Manual restart required.',
        queueEnabled: enabled
      });
    }
    
  } catch (error) {
    logger.error('[SystemControl] Queue toggle failed:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /system/config
 * Get current system configuration
 */
router.get('/config', async (req, res) => {
  try {
    // Read .env to get current config
    const envPath = path.join(__dirname, '../.env');
    const envContent = await fs.readFile(envPath, 'utf8');
    
    // Parse key config values
    const queueEnabled = envContent.match(/QUEUE_ENABLED=(.*)/)
    const redisUrl = envContent.match(/REDIS_URL=(.*)/)
    const maxConcurrent = envContent.match(/MAX_CONCURRENT_EXECUTIONS=(.*)/)
    const queueConcurrency = envContent.match(/QUEUE_CONCURRENCY=(.*)/)
    
    res.json({
      success: true,
      config: {
        queueEnabled: queueEnabled && queueEnabled[1] === 'true',
        redisUrl: redisUrl ? redisUrl[1] : null,
        maxConcurrentExecutions: maxConcurrent ? parseInt(maxConcurrent[1]) : 5,
        queueConcurrency: queueConcurrency ? parseInt(queueConcurrency[1]) : 2,
        nodeEnv: process.env.NODE_ENV,
        port: process.env.PORT,
        workerId: process.env.WORKER_ID
      }
    });
  } catch (error) {
    logger.error('[SystemControl] Failed to get config:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;

