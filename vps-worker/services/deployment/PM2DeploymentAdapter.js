/**
 * PM2 DEPLOYMENT ADAPTER
 * 
 * Implementation of DeploymentAdapter for PM2 process manager
 * Wraps existing pm2Manager.js and provides deployment-agnostic interface
 * 
 * Features:
 * - Worker creation/deletion/cloning
 * - Start/stop/restart operations
 * - Port management
 * - PM2 ecosystem.config.js generation
 * - Process monitoring
 * 
 * Part of: Orchestration Control Center (Future-Proof Architecture)
 * Created: 2025-11-27
 */

const DeploymentAdapter = require('./DeploymentAdapter');
const pm2Manager = require('../pm2Manager');
const logger = require('../../utils/logger');
const fs = require('fs').promises;
const path = require('path');

class PM2DeploymentAdapter extends DeploymentAdapter {
  constructor(config = {}) {
    super({ ...config, type: 'pm2' });
    
    this.vpsId = config.vpsId || 'local';
    this.ecosystemPath = config.ecosystemPath || path.join(__dirname, '../../ecosystem.config.js');
    this.basePort = config.basePort || 3001;
    this.usedPorts = new Set();
    
    logger.info(`[PM2DeploymentAdapter] Initialized for VPS: ${this.vpsId}`);
  }

  // ============================================
  // WORKER LIFECYCLE MANAGEMENT
  // ============================================

  /**
   * List all PM2 workers
   */
  async listWorkers() {
    try {
      const processes = await pm2Manager.listProcesses();
      
      // Transform PM2 processes to worker objects
      return processes
        .filter(proc => proc.name.includes('lekhika'))
        .map(proc => this.transformPM2ProcessToWorker(proc));
    } catch (error) {
      logger.error('[PM2DeploymentAdapter] Failed to list workers:', error);
      throw error;
    }
  }

  /**
   * Get specific worker by ID
   */
  async getWorker(workerId) {
    try {
      const workers = await this.listWorkers();
      return workers.find(w => w.id === workerId) || null;
    } catch (error) {
      logger.error(`[PM2DeploymentAdapter] Failed to get worker ${workerId}:`, error);
      throw error;
    }
  }

  /**
   * Create new worker
   */
  async createWorker(workerConfig) {
    try {
      // Validate config
      const validation = this.validateWorkerConfig(workerConfig);
      if (!validation.valid) {
        throw new Error(`Invalid worker config: ${validation.errors.join(', ')}`);
      }

      // Auto-assign port if needed
      const port = workerConfig.port || await this.getNextAvailablePort();
      
      // Generate PM2 config entry
      const pm2Config = this.generatePM2Config({
        ...workerConfig,
        port
      });

      // Add to ecosystem.config.js
      await this.addToEcosystem(pm2Config);

      // Start worker via PM2
      const startResult = await pm2Manager.startProcess(pm2Config.name);

      logger.info(`[PM2DeploymentAdapter] Worker created: ${pm2Config.name} on port ${port}`);

      return {
        id: pm2Config.name,
        name: pm2Config.name,
        port: port,
        type: workerConfig.type || 'standard',
        status: 'starting',
        deploymentType: 'pm2',
        vpsId: this.vpsId,
        created: true
      };
    } catch (error) {
      logger.error('[PM2DeploymentAdapter] Failed to create worker:', error);
      throw error;
    }
  }

  /**
   * Update worker configuration
   */
  async updateWorker(workerId, config) {
    try {
      // For PM2, this means updating ecosystem.config.js and restarting
      await this.updateEcosystemConfig(workerId, config);
      await pm2Manager.restartProcess(workerId);
      
      logger.info(`[PM2DeploymentAdapter] Worker ${workerId} updated and restarted`);
      
      return await this.getWorker(workerId);
    } catch (error) {
      logger.error(`[PM2DeploymentAdapter] Failed to update worker ${workerId}:`, error);
      throw error;
    }
  }

  /**
   * Delete worker
   */
  async deleteWorker(workerId) {
    try {
      // Stop and delete from PM2
      await pm2Manager.deleteProcess(workerId);
      
      // Remove from ecosystem.config.js
      await this.removeFromEcosystem(workerId);
      
      logger.info(`[PM2DeploymentAdapter] Worker ${workerId} deleted`);
      
      return { success: true, deleted: workerId };
    } catch (error) {
      logger.error(`[PM2DeploymentAdapter] Failed to delete worker ${workerId}:`, error);
      throw error;
    }
  }

  /**
   * Clone worker (create duplicate with new config)
   */
  async cloneWorker(sourceWorkerId, newConfig = {}) {
    try {
      // Get source worker config
      const sourceWorker = await this.getWorker(sourceWorkerId);
      if (!sourceWorker) {
        throw new Error(`Source worker ${sourceWorkerId} not found`);
      }

      // Read current ecosystem.config.js to get source config
      const ecosystem = await this.readEcosystem();
      const sourceConfig = ecosystem.apps.find(app => app.name === sourceWorkerId);
      
      if (!sourceConfig) {
        throw new Error(`Source worker ${sourceWorkerId} not found in ecosystem.config.js`);
      }

      // Generate new worker name if not provided
      const newName = newConfig.name || `${sourceWorkerId}-clone-${Date.now()}`;
      
      // Merge configs
      const clonedConfig = {
        name: newName,
        type: newConfig.type || sourceWorker.type,
        port: newConfig.port || await this.getNextAvailablePort(),
        script: sourceConfig.script,
        maxMemory: newConfig.maxMemory || sourceConfig.max_memory_restart,
        maxConcurrent: newConfig.maxConcurrent || sourceConfig.env?.MAX_CONCURRENT_EXECUTIONS,
        env: { ...sourceConfig.env, ...newConfig.env }
      };

      // Create the cloned worker
      return await this.createWorker(clonedConfig);
    } catch (error) {
      logger.error(`[PM2DeploymentAdapter] Failed to clone worker ${sourceWorkerId}:`, error);
      throw error;
    }
  }

  // ============================================
  // WORKER CONTROL
  // ============================================

  /**
   * Start worker
   */
  async startWorker(workerId) {
    try {
      const result = await pm2Manager.startProcess(workerId);
      logger.info(`[PM2DeploymentAdapter] Worker ${workerId} started`);
      return result;
    } catch (error) {
      logger.error(`[PM2DeploymentAdapter] Failed to start worker ${workerId}:`, error);
      throw error;
    }
  }

  /**
   * Stop worker
   */
  async stopWorker(workerId) {
    try {
      const result = await pm2Manager.stopProcess(workerId);
      logger.info(`[PM2DeploymentAdapter] Worker ${workerId} stopped`);
      return result;
    } catch (error) {
      logger.error(`[PM2DeploymentAdapter] Failed to stop worker ${workerId}:`, error);
      throw error;
    }
  }

  /**
   * Restart worker
   */
  async restartWorker(workerId) {
    try {
      const result = await pm2Manager.restartProcess(workerId);
      logger.info(`[PM2DeploymentAdapter] Worker ${workerId} restarted`);
      return result;
    } catch (error) {
      logger.error(`[PM2DeploymentAdapter] Failed to restart worker ${workerId}:`, error);
      throw error;
    }
  }

  /**
   * Get worker status
   */
  async getWorkerStatus(workerId) {
    try {
      const worker = await this.getWorker(workerId);
      return {
        workerId: workerId,
        status: worker.status,
        uptime: worker.uptime,
        restarts: worker.restarts,
        memory: worker.memory,
        cpu: worker.cpu
      };
    } catch (error) {
      logger.error(`[PM2DeploymentAdapter] Failed to get worker status ${workerId}:`, error);
      throw error;
    }
  }

  /**
   * Get worker metrics
   */
  async getWorkerMetrics(workerId) {
    try {
      const worker = await this.getWorker(workerId);
      return {
        workerId: workerId,
        memory: worker.memory,
        cpu: worker.cpu,
        uptime: worker.uptime,
        restarts: worker.restarts
      };
    } catch (error) {
      logger.error(`[PM2DeploymentAdapter] Failed to get worker metrics ${workerId}:`, error);
      throw error;
    }
  }

  // ============================================
  // SCALING
  // ============================================

  /**
   * Scale workers to target count
   */
  async scaleWorkers(targetCount) {
    try {
      const currentWorkers = await this.listWorkers();
      const currentCount = currentWorkers.length;

      if (targetCount === currentCount) {
        return { success: true, message: 'Already at target count', count: currentCount };
      }

      if (targetCount > currentCount) {
        // Scale up - create new workers
        const workersToCreate = targetCount - currentCount;
        const results = [];
        
        for (let i = 0; i < workersToCreate; i++) {
          const newWorker = await this.createWorker({
            name: `lekhika-worker-${Date.now()}-${i}`,
            type: 'standard',
            autoAssignPort: true
          });
          results.push(newWorker);
        }
        
        return { success: true, message: `Scaled up by ${workersToCreate}`, workers: results };
      } else {
        // Scale down - stop and remove excess workers
        const workersToRemove = currentCount - targetCount;
        const toRemove = currentWorkers.slice(-workersToRemove); // Remove last workers
        
        for (const worker of toRemove) {
          await this.deleteWorker(worker.id);
        }
        
        return { success: true, message: `Scaled down by ${workersToRemove}`, removed: toRemove.length };
      }
    } catch (error) {
      logger.error('[PM2DeploymentAdapter] Failed to scale workers:', error);
      throw error;
    }
  }

  // ============================================
  // CONFIGURATION HELPERS
  // ============================================

  /**
   * Generate PM2 config entry for a worker
   */
  generatePM2Config(workerConfig) {
    const workerType = workerConfig.type || 'standard';
    const script = workerType === 'lean' ? 'leanServer.js' : 'server.js';
    const portEnvVar = workerType === 'lean' ? 'LEAN_PORT' : 'PORT';

    return {
      name: workerConfig.name,
      script: script,
      cwd: '/home/lekhika.online/vps-worker',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        [portEnvVar]: workerConfig.port,
        MAX_CONCURRENT_EXECUTIONS: workerConfig.maxConcurrent || 3,
        WORKER_ID: workerConfig.name,
        WORKER_TYPE: workerType,
        ...workerConfig.env
      },
      log_file: `/home/lekhika.online/vps-worker/logs/${workerConfig.name}.log`,
      out_file: `/home/lekhika.online/vps-worker/logs/${workerConfig.name}-out.log`,
      error_file: `/home/lekhika.online/vps-worker/logs/${workerConfig.name}-error.log`,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      max_memory_restart: workerConfig.maxMemory || '3G',
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s',
      watch: false,
      ignore_watch: ['node_modules', 'logs'],
      kill_timeout: 5000,
      wait_ready: workerType !== 'queue',
      listen_timeout: 10000
    };
  }

  /**
   * Get next available port
   */
  async getNextAvailablePort() {
    const workers = await this.listWorkers();
    const usedPorts = workers.map(w => w.port).filter(Boolean);
    
    let port = this.basePort;
    while (usedPorts.includes(port)) {
      port++;
    }
    
    return port;
  }

  /**
   * Transform PM2 process to worker object
   */
  transformPM2ProcessToWorker(pm2Process) {
    return {
      id: pm2Process.name,
      name: pm2Process.name,
      port: pm2Process.port,
      type: pm2Process.type,
      status: pm2Process.status,
      uptime: pm2Process.uptime,
      restarts: pm2Process.restarts,
      memory: pm2Process.memory,
      cpu: pm2Process.cpu,
      pid: pm2Process.pid,
      script: pm2Process.script,
      deploymentType: 'pm2',
      vpsId: this.vpsId
    };
  }

  /**
   * Read ecosystem.config.js
   */
  async readEcosystem() {
    try {
      // Read file content
      const content = await fs.readFile(this.ecosystemPath, 'utf8');
      
      // Parse the module.exports
      // Note: This is a simplified parser - for production use a proper JS parser
      const match = content.match(/module\.exports\s*=\s*(\{[\s\S]*\})/);
      if (!match) {
        throw new Error('Could not parse ecosystem.config.js');
      }
      
      // Use eval in safe context (only for config files we control)
      const config = eval(`(${match[1]})`);
      return config;
    } catch (error) {
      logger.error('[PM2DeploymentAdapter] Failed to read ecosystem.config.js:', error);
      // Return empty structure if file doesn't exist or can't be read
      return { apps: [] };
    }
  }

  /**
   * Write ecosystem.config.js
   */
  async writeEcosystem(config) {
    try {
      const content = `module.exports = ${JSON.stringify(config, null, 2)};\n`;
      await fs.writeFile(this.ecosystemPath, content, 'utf8');
      logger.info('[PM2DeploymentAdapter] Updated ecosystem.config.js');
    } catch (error) {
      logger.error('[PM2DeploymentAdapter] Failed to write ecosystem.config.js:', error);
      throw error;
    }
  }

  /**
   * Add worker to ecosystem.config.js
   */
  async addToEcosystem(pm2Config) {
    try {
      const ecosystem = await this.readEcosystem();
      
      // Check if worker already exists
      const existingIndex = ecosystem.apps.findIndex(app => app.name === pm2Config.name);
      if (existingIndex !== -1) {
        throw new Error(`Worker ${pm2Config.name} already exists in ecosystem.config.js`);
      }
      
      // Add new worker
      ecosystem.apps.push(pm2Config);
      
      // Write back
      await this.writeEcosystem(ecosystem);
      
      logger.info(`[PM2DeploymentAdapter] Added ${pm2Config.name} to ecosystem.config.js`);
    } catch (error) {
      logger.error('[PM2DeploymentAdapter] Failed to add to ecosystem:', error);
      throw error;
    }
  }

  /**
   * Remove worker from ecosystem.config.js
   */
  async removeFromEcosystem(workerId) {
    try {
      const ecosystem = await this.readEcosystem();
      
      // Filter out the worker
      ecosystem.apps = ecosystem.apps.filter(app => app.name !== workerId);
      
      // Write back
      await this.writeEcosystem(ecosystem);
      
      logger.info(`[PM2DeploymentAdapter] Removed ${workerId} from ecosystem.config.js`);
    } catch (error) {
      logger.error('[PM2DeploymentAdapter] Failed to remove from ecosystem:', error);
      throw error;
    }
  }

  /**
   * Update worker config in ecosystem.config.js
   */
  async updateEcosystemConfig(workerId, newConfig) {
    try {
      const ecosystem = await this.readEcosystem();
      
      // Find worker
      const workerIndex = ecosystem.apps.findIndex(app => app.name === workerId);
      if (workerIndex === -1) {
        throw new Error(`Worker ${workerId} not found in ecosystem.config.js`);
      }
      
      // Merge configs
      ecosystem.apps[workerIndex] = {
        ...ecosystem.apps[workerIndex],
        ...newConfig
      };
      
      // Write back
      await this.writeEcosystem(ecosystem);
      
      logger.info(`[PM2DeploymentAdapter] Updated ${workerId} config in ecosystem.config.js`);
    } catch (error) {
      logger.error('[PM2DeploymentAdapter] Failed to update ecosystem config:', error);
      throw error;
    }
  }

  // ============================================
  // CAPABILITIES
  // ============================================

  getCapabilities() {
    return [
      'worker-creation',
      'worker-cloning',
      'port-management',
      'process-control',
      'log-access',
      'metrics-collection',
      'scaling',
      'pm2-native'
    ];
  }
}

module.exports = PM2DeploymentAdapter;

