/**
 * WORKER FACTORY SERVICE
 * 
 * High-level worker creation and management service
 * Uses deployment adapters internally, adds business logic
 * 
 * Features:
 * - Worker templates (Standard, Lean, GPU, Export)
 * - Smart port assignment (conflict detection)
 * - Worker cloning with validation
 * - Config presets
 * - Batch worker creation
 * 
 * Part of: Orchestration Control Center
 * Created: 2025-11-27
 */

const { getDeploymentAdapter } = require('./deployment');
const logger = require('../utils/logger');

class WorkerFactory {
  constructor() {
    this.deployment = getDeploymentAdapter();
    this.templates = this.initializeTemplates();
    
    logger.info('[WorkerFactory] Initialized with deployment type:', this.deployment.getType());
  }

  /**
   * Initialize worker templates
   */
  initializeTemplates() {
    return {
      standard: {
        name: 'Standard Worker',
        type: 'standard',
        script: 'server.js',
        maxConcurrent: 3,
        maxMemory: '3G',
        description: 'Full-featured worker with all capabilities',
        env: {
          NODE_ENV: 'production'
        }
      },
      lean: {
        name: 'Lean Worker',
        type: 'lean',
        script: 'leanServer.js',
        maxConcurrent: 5,
        maxMemory: '1G',
        description: 'Memory-optimized worker (70% less memory)',
        env: {
          NODE_ENV: 'production'
        }
      },
      queue: {
        name: 'Queue Worker',
        type: 'queue',
        script: 'queueWorker.js',
        maxConcurrent: 2,
        maxMemory: '1G',
        description: 'Dedicated queue processing worker',
        env: {
          NODE_ENV: 'production',
          QUEUE_CONCURRENCY: 2
        }
      },
      gpu: {
        name: 'GPU Worker',
        type: 'gpu',
        script: 'server.js',
        maxConcurrent: 2,
        maxMemory: '4G',
        description: 'GPU-enabled worker for image generation',
        env: {
          NODE_ENV: 'production',
          GPU_ENABLED: 'true'
        }
      },
      export: {
        name: 'Export Worker',
        type: 'export',
        script: 'server.js',
        maxConcurrent: 4,
        maxMemory: '2G',
        description: 'Specialized worker for PDF/DOCX exports',
        env: {
          NODE_ENV: 'production',
          EXPORT_SPECIALIZED: 'true'
        }
      }
    };
  }

  /**
   * Get all available templates
   */
  getTemplates() {
    return Object.entries(this.templates).map(([key, template]) => ({
      id: key,
      ...template
    }));
  }

  /**
   * Get specific template
   */
  getTemplate(templateId) {
    return this.templates[templateId] || null;
  }

  /**
   * Create worker from config
   * @param {object} config - Worker configuration
   * @returns {Promise<object>} Created worker
   */
  async createWorker(config) {
    try {
      logger.info('[WorkerFactory] Creating worker:', config.name || 'unnamed');

      // Validate config
      const validation = this.validateConfig(config);
      if (!validation.valid) {
        throw new Error(`Invalid config: ${validation.errors.join(', ')}`);
      }

      // Apply template if specified
      let workerConfig = { ...config };
      if (config.template) {
        const template = this.getTemplate(config.template);
        if (!template) {
          throw new Error(`Template ${config.template} not found`);
        }
        
        // Merge template with config (config overrides template)
        workerConfig = {
          ...template,
          ...config,
          env: { ...template.env, ...config.env }
        };
      }

      // Generate unique name if not provided
      if (!workerConfig.name) {
        workerConfig.name = this.generateWorkerName(workerConfig.type || 'standard');
      }

      // Auto-assign port if needed
      if (!workerConfig.port) {
        workerConfig.port = await this.getNextAvailablePort();
      } else {
        // Check port conflict
        const conflict = await this.checkPortConflict(workerConfig.port);
        if (conflict) {
          throw new Error(`Port ${workerConfig.port} is already in use by ${conflict.name}`);
        }
      }

      // Create worker via deployment adapter
      const worker = await this.deployment.createWorker(workerConfig);

      logger.info(`[WorkerFactory] Worker created successfully: ${worker.name} on port ${worker.port}`);

      return {
        success: true,
        worker: worker,
        message: `Worker ${worker.name} created on port ${worker.port}`
      };
    } catch (error) {
      logger.error('[WorkerFactory] Failed to create worker:', error);
      throw error;
    }
  }

  /**
   * Clone existing worker
   * @param {string} sourceWorkerId - Source worker ID
   * @param {object} overrides - Config overrides
   * @returns {Promise<object>} Cloned worker
   */
  async cloneWorker(sourceWorkerId, overrides = {}) {
    try {
      logger.info(`[WorkerFactory] Cloning worker: ${sourceWorkerId}`);

      // Get source worker
      const sourceWorker = await this.deployment.getWorker(sourceWorkerId);
      if (!sourceWorker) {
        throw new Error(`Source worker ${sourceWorkerId} not found`);
      }

      // Generate unique name for clone
      if (!overrides.name) {
        overrides.name = `${sourceWorkerId}-clone-${Date.now()}`;
      }

      // Auto-assign port if not specified
      if (!overrides.port) {
        overrides.port = await this.getNextAvailablePort();
      } else {
        // Check port conflict
        const conflict = await this.checkPortConflict(overrides.port);
        if (conflict) {
          throw new Error(`Port ${overrides.port} is already in use by ${conflict.name}`);
        }
      }

      // Clone via deployment adapter
      const clonedWorker = await this.deployment.cloneWorker(sourceWorkerId, overrides);

      logger.info(`[WorkerFactory] Worker cloned: ${clonedWorker.name} from ${sourceWorkerId}`);

      return {
        success: true,
        worker: clonedWorker,
        source: sourceWorkerId,
        message: `Worker ${clonedWorker.name} cloned from ${sourceWorkerId}`
      };
    } catch (error) {
      logger.error(`[WorkerFactory] Failed to clone worker ${sourceWorkerId}:`, error);
      throw error;
    }
  }

  /**
   * Create worker from template
   * @param {string} templateId - Template ID (standard, lean, gpu, etc.)
   * @param {object} overrides - Config overrides
   * @returns {Promise<object>} Created worker
   */
  async createFromTemplate(templateId, overrides = {}) {
    try {
      const template = this.getTemplate(templateId);
      if (!template) {
        throw new Error(`Template ${templateId} not found`);
      }

      logger.info(`[WorkerFactory] Creating worker from template: ${templateId}`);

      // Merge template with overrides
      const config = {
        ...template,
        ...overrides,
        template: templateId,
        env: { ...template.env, ...overrides.env }
      };

      return await this.createWorker(config);
    } catch (error) {
      logger.error(`[WorkerFactory] Failed to create from template ${templateId}:`, error);
      throw error;
    }
  }

  /**
   * Batch create workers
   * @param {Array} configs - Array of worker configs
   * @returns {Promise<Array>} Created workers
   */
  async createBatch(configs) {
    try {
      logger.info(`[WorkerFactory] Batch creating ${configs.length} workers`);

      const results = [];
      const errors = [];

      for (const config of configs) {
        try {
          const result = await this.createWorker(config);
          results.push(result);
        } catch (error) {
          errors.push({
            config: config.name || 'unnamed',
            error: error.message
          });
        }
      }

      return {
        success: errors.length === 0,
        created: results.length,
        workers: results,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error) {
      logger.error('[WorkerFactory] Batch creation failed:', error);
      throw error;
    }
  }

  /**
   * Delete worker
   * @param {string} workerId - Worker ID
   * @returns {Promise<object>} Deletion result
   */
  async deleteWorker(workerId) {
    try {
      logger.info(`[WorkerFactory] Deleting worker: ${workerId}`);

      await this.deployment.deleteWorker(workerId);

      return {
        success: true,
        deleted: workerId,
        message: `Worker ${workerId} deleted successfully`
      };
    } catch (error) {
      logger.error(`[WorkerFactory] Failed to delete worker ${workerId}:`, error);
      throw error;
    }
  }

  // ============================================
  // PORT MANAGEMENT
  // ============================================

  /**
   * Get next available port
   */
  async getNextAvailablePort() {
    try {
      const workers = await this.deployment.listWorkers();
      const usedPorts = workers.map(w => w.port).filter(Boolean);
      
      let port = 3001;
      while (usedPorts.includes(port)) {
        port++;
      }
      
      logger.debug(`[WorkerFactory] Next available port: ${port}`);
      return port;
    } catch (error) {
      logger.error('[WorkerFactory] Failed to get next available port:', error);
      throw error;
    }
  }

  /**
   * Check if port is in use
   * @param {number} port - Port to check
   * @returns {Promise<object|null>} Worker using port or null
   */
  async checkPortConflict(port) {
    try {
      const workers = await this.deployment.listWorkers();
      return workers.find(w => w.port === port) || null;
    } catch (error) {
      logger.error(`[WorkerFactory] Failed to check port ${port}:`, error);
      throw error;
    }
  }

  /**
   * Get all available ports in range
   * @param {number} start - Start port
   * @param {number} end - End port
   * @returns {Promise<Array>} Available ports
   */
  async getAvailablePortsInRange(start = 3001, end = 3100) {
    try {
      const workers = await this.deployment.listWorkers();
      const usedPorts = new Set(workers.map(w => w.port).filter(Boolean));
      
      const availablePorts = [];
      for (let port = start; port <= end; port++) {
        if (!usedPorts.has(port)) {
          availablePorts.push(port);
        }
      }
      
      return availablePorts;
    } catch (error) {
      logger.error('[WorkerFactory] Failed to get available ports:', error);
      throw error;
    }
  }

  // ============================================
  // VALIDATION & HELPERS
  // ============================================

  /**
   * Validate worker configuration
   */
  validateConfig(config) {
    const errors = [];

    // Check required fields
    if (!config.name && !config.autoGenerateName) {
      errors.push('Worker name required or set autoGenerateName to true');
    }

    // Check worker type
    const validTypes = ['standard', 'lean', 'queue', 'gpu', 'export', 'custom'];
    if (config.type && !validTypes.includes(config.type)) {
      errors.push(`Invalid worker type: ${config.type}. Must be one of: ${validTypes.join(', ')}`);
    }

    // Check port
    if (config.port) {
      if (typeof config.port !== 'number') {
        errors.push('Port must be a number');
      } else if (config.port < 1024 || config.port > 65535) {
        errors.push('Port must be between 1024 and 65535');
      }
    }

    // Check max concurrent
    if (config.maxConcurrent && (config.maxConcurrent < 1 || config.maxConcurrent > 20)) {
      errors.push('maxConcurrent must be between 1 and 20');
    }

    return {
      valid: errors.length === 0,
      errors: errors
    };
  }

  /**
   * Generate unique worker name
   */
  generateWorkerName(type = 'standard') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 6);
    return `lekhika-${type}-${timestamp}-${random}`;
  }

  /**
   * Get worker creation suggestions
   * @returns {Promise<object>} Suggestions based on current state
   */
  async getSuggestions() {
    try {
      const workers = await this.deployment.listWorkers();
      const suggestions = [];

      // Suggest creating lean worker if only standard workers exist
      const hasLean = workers.some(w => w.type === 'lean');
      if (!hasLean && workers.length > 0) {
        suggestions.push({
          type: 'create',
          template: 'lean',
          reason: 'No lean worker found. Create one for 70% memory savings.',
          priority: 'high'
        });
      }

      // Suggest scaling if load is high
      const avgLoad = workers.reduce((sum, w) => sum + (w.cpu || 0), 0) / workers.length;
      if (avgLoad > 80 && workers.length < 10) {
        suggestions.push({
          type: 'scale',
          action: 'up',
          reason: `Average CPU load is ${avgLoad.toFixed(1)}%. Consider adding more workers.`,
          priority: 'medium'
        });
      }

      // Suggest creating queue worker if none exists
      const hasQueue = workers.some(w => w.type === 'queue');
      if (!hasQueue && workers.length > 0) {
        suggestions.push({
          type: 'create',
          template: 'queue',
          reason: 'No dedicated queue worker. Create one for better job processing.',
          priority: 'medium'
        });
      }

      return {
        suggestions: suggestions,
        count: suggestions.length
      };
    } catch (error) {
      logger.error('[WorkerFactory] Failed to get suggestions:', error);
      return { suggestions: [], count: 0 };
    }
  }

  /**
   * Get available ports
   */
  async getAvailablePorts(limit = 10) {
    return await this.getAvailablePortsInRange(3001, 3001 + limit - 1);
  }

  /**
   * Preview worker creation (dry run)
   * @param {object} config - Worker config
   * @returns {Promise<object>} Preview of what will be created
   */
  async previewWorkerCreation(config) {
    try {
      // Validate config
      const validation = this.validateConfig(config);
      
      // Generate preview
      const preview = {
        valid: validation.valid,
        errors: validation.errors,
        worker: null
      };

      if (validation.valid) {
        // Apply template if specified
        let workerConfig = { ...config };
        if (config.template) {
          const template = this.getTemplate(config.template);
          if (template) {
            workerConfig = { ...template, ...config };
          }
        }

        // Generate name if needed
        const name = workerConfig.name || this.generateWorkerName(workerConfig.type || 'standard');
        
        // Get port
        const port = workerConfig.port || await this.getNextAvailablePort();

        preview.worker = {
          name: name,
          type: workerConfig.type || 'standard',
          port: port,
          script: workerConfig.script || 'server.js',
          maxConcurrent: workerConfig.maxConcurrent || 3,
          maxMemory: workerConfig.maxMemory || '3G',
          willBeCreated: true
        };
      }

      return preview;
    } catch (error) {
      logger.error('[WorkerFactory] Failed to preview worker creation:', error);
      throw error;
    }
  }

  /**
   * Get factory status
   */
  async getStatus() {
    try {
      const workers = await this.deployment.listWorkers();
      const availablePorts = await this.getAvailablePorts(20);

      return {
        deploymentType: this.deployment.getType(),
        totalWorkers: workers.length,
        workersByType: this.groupWorkersByType(workers),
        availableTemplates: this.getTemplates().length,
        availablePorts: availablePorts.length,
        nextAvailablePort: availablePorts[0] || null,
        capabilities: this.deployment.getCapabilities()
      };
    } catch (error) {
      logger.error('[WorkerFactory] Failed to get status:', error);
      throw error;
    }
  }

  /**
   * Group workers by type
   */
  groupWorkersByType(workers) {
    const grouped = {};
    
    workers.forEach(worker => {
      const type = worker.type || 'unknown';
      if (!grouped[type]) {
        grouped[type] = 0;
      }
      grouped[type]++;
    });

    return grouped;
  }

  /**
   * Create config preset
   * @param {string} presetName - Name for the preset
   * @param {object} config - Worker config to save
   */
  savePreset(presetName, config) {
    // In future, save to database or file
    // For now, just log
    logger.info(`[WorkerFactory] Preset ${presetName} saved (feature not yet implemented)`);
    return {
      success: true,
      message: 'Preset saved (in-memory only for now)'
    };
  }

  /**
   * Quick create standard worker
   */
  async quickCreateStandard() {
    return await this.createFromTemplate('standard', {
      name: `lekhika-standard-${Date.now()}`
    });
  }

  /**
   * Quick create lean worker
   */
  async quickCreateLean() {
    return await this.createFromTemplate('lean', {
      name: `lekhika-lean-${Date.now()}`
    });
  }

  /**
   * Quick create queue worker
   */
  async quickCreateQueue() {
    return await this.createFromTemplate('queue', {
      name: `lekhika-queue-${Date.now()}`
    });
  }
}

module.exports = new WorkerFactory();

