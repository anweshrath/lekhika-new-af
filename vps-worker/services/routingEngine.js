/**
 * ROUTING ENGINE SERVICE
 * 
 * Intelligent job-to-worker routing and load balancing
 * Supports multiple algorithms, affinity rules, health-based routing
 * 
 * Routing Strategies:
 * - Round Robin: Distribute evenly across all workers
 * - Least Loaded: Assign to worker with fewest active jobs
 * - Weighted: Distribute based on worker capacity/weight
 * - Health-Based: Only route to healthy workers (score > 60)
 * - Affinity-Based: Match job type to worker capabilities
 * 
 * Part of: Orchestration Control Center (Mother Control Panel)
 * Created: 2025-11-24
 */

const logger = require('../utils/logger');
const workerRegistry = require('./workerRegistry');

class RoutingEngine {
  constructor() {
    this.strategy = 'least_loaded'; // Default strategy
    this.affinityRules = new Map(); // Job type → worker tags mapping
    this.roundRobinIndex = 0;
    this.routingMetrics = {
      totalRouted: 0,
      byWorker: new Map(),
      byStrategy: new Map(),
      lastReset: Date.now()
    };
    
    // Default affinity rules
    this.initializeDefaultAffinityRules();
    
    logger.info('[RoutingEngine] Initialized with strategy:', this.strategy);
  }

  /**
   * Initialize default affinity rules
   * Can be overridden via setAffinityRule()
   */
  initializeDefaultAffinityRules() {
    // Image generation jobs → Workers with 'gpu' tag
    this.affinityRules.set('image_generation', ['gpu', 'image-generation']);
    
    // Export jobs → Workers with 'export' tag
    this.affinityRules.set('export', ['export', 'pdf', 'docx']);
    
    // Standard workflow → Any worker with 'ai' tag
    this.affinityRules.set('workflow', ['ai', 'workflow']);
    
    logger.info('[RoutingEngine] Default affinity rules initialized');
  }

  /**
   * Set routing strategy
   * @param {string} strategy - round_robin, least_loaded, weighted, health_based, affinity_based
   */
  setStrategy(strategy) {
    const validStrategies = ['round_robin', 'least_loaded', 'weighted', 'health_based', 'affinity_based'];
    
    if (!validStrategies.includes(strategy)) {
      throw new Error(`Invalid strategy: ${strategy}. Must be one of: ${validStrategies.join(', ')}`);
    }
    
    this.strategy = strategy;
    logger.info(`[RoutingEngine] Strategy changed to: ${strategy}`);
  }

  /**
   * Get current routing strategy
   */
  getStrategy() {
    return this.strategy;
  }

  /**
   * Set affinity rule (job type → worker tags)
   * @param {string} jobType - Type of job (workflow, image_generation, export)
   * @param {Array} tags - Worker tags that can handle this job type
   */
  setAffinityRule(jobType, tags) {
    this.affinityRules.set(jobType, tags);
    logger.info(`[RoutingEngine] Affinity rule set: ${jobType} → [${tags.join(', ')}]`);
  }

  /**
   * Get all affinity rules
   */
  getAffinityRules() {
    return Array.from(this.affinityRules.entries()).map(([jobType, tags]) => ({
      jobType,
      tags
    }));
  }

  /**
   * Select best worker for a job
   * @param {object} job - Job object with type, priority, etc.
   * @returns {object} Selected worker object
   */
  async selectWorker(job) {
    // Get all healthy workers
    const workers = await workerRegistry.getHealthyWorkers();
    
    if (!workers || workers.length === 0) {
      throw new Error('No healthy workers available for job assignment');
    }

    // Apply affinity filter if rules exist for this job type
    let candidates = workers;
    const jobType = job.type || job.data?.jobType || 'workflow';
    
    if (this.strategy === 'affinity_based' || this.affinityRules.has(jobType)) {
      candidates = this.filterByAffinity(jobType, workers);
      
      // If no workers match affinity, fallback to all workers
      if (candidates.length === 0) {
        logger.warn(`[RoutingEngine] No workers match affinity for ${jobType}, using all workers`);
        candidates = workers;
      }
    }

    // Apply routing strategy
    let selectedWorker;
    
    switch (this.strategy) {
      case 'round_robin':
        selectedWorker = this.roundRobin(candidates);
        break;
      case 'least_loaded':
        selectedWorker = this.leastLoaded(candidates);
        break;
      case 'weighted':
        selectedWorker = this.weighted(candidates);
        break;
      case 'health_based':
        selectedWorker = this.healthBased(candidates);
        break;
      case 'affinity_based':
        selectedWorker = this.leastLoaded(candidates); // Use least-loaded within affinity group
        break;
      default:
        selectedWorker = this.leastLoaded(candidates); // Default to least-loaded
    }

    // Track routing metrics
    this.trackRouting(selectedWorker, this.strategy);

    logger.info(`[RoutingEngine] Job routed to worker: ${selectedWorker.id} (strategy: ${this.strategy})`);
    
    return selectedWorker;
  }

  /**
   * Filter workers by affinity tags
   */
  filterByAffinity(jobType, workers) {
    const requiredTags = this.affinityRules.get(jobType);
    
    if (!requiredTags || requiredTags.length === 0) {
      return workers;
    }

    return workers.filter(worker => {
      // Worker must have at least one of the required tags
      return requiredTags.some(tag => worker.tags?.includes(tag));
    });
  }

  /**
   * Round Robin: Distribute jobs evenly across workers
   */
  roundRobin(workers) {
    if (workers.length === 0) {
      throw new Error('No workers available for round-robin routing');
    }

    const worker = workers[this.roundRobinIndex % workers.length];
    this.roundRobinIndex++;
    
    return worker;
  }

  /**
   * Least Loaded: Assign to worker with fewest active jobs
   */
  leastLoaded(workers) {
    if (workers.length === 0) {
      throw new Error('No workers available for least-loaded routing');
    }

    // Sort by active jobs (ascending)
    const sorted = workers.sort((a, b) => {
      const aJobs = a.metrics?.activeJobs || 0;
      const bJobs = b.metrics?.activeJobs || 0;
      return aJobs - bJobs;
    });

    return sorted[0];
  }

  /**
   * Weighted: Distribute based on worker weight/capacity
   */
  weighted(workers) {
    if (workers.length === 0) {
      throw new Error('No workers available for weighted routing');
    }

    // Calculate total weight
    const totalWeight = workers.reduce((sum, w) => sum + (w.weight || 10), 0);
    
    // Generate random number
    let random = Math.random() * totalWeight;
    
    // Select worker based on weight
    for (const worker of workers) {
      random -= (worker.weight || 10);
      if (random <= 0) {
        return worker;
      }
    }
    
    // Fallback to first worker
    return workers[0];
  }

  /**
   * Health-Based: Assign to healthiest worker
   */
  healthBased(workers) {
    if (workers.length === 0) {
      throw new Error('No workers available for health-based routing');
    }

    // Sort by health score (descending)
    const sorted = workers.sort((a, b) => {
      const aHealth = a.health || 0;
      const bHealth = b.health || 0;
      return bHealth - aHealth;
    });

    return sorted[0];
  }

  /**
   * Track routing metrics
   */
  trackRouting(worker, strategy) {
    this.routingMetrics.totalRouted++;
    
    // Track by worker
    const workerCount = this.routingMetrics.byWorker.get(worker.id) || 0;
    this.routingMetrics.byWorker.set(worker.id, workerCount + 1);
    
    // Track by strategy
    const strategyCount = this.routingMetrics.byStrategy.get(strategy) || 0;
    this.routingMetrics.byStrategy.set(strategy, strategyCount + 1);
  }

  /**
   * Get routing metrics
   */
  getMetrics() {
    return {
      totalRouted: this.routingMetrics.totalRouted,
      byWorker: Array.from(this.routingMetrics.byWorker.entries()).map(([workerId, count]) => ({
        workerId,
        count,
        percentage: ((count / this.routingMetrics.totalRouted) * 100).toFixed(2)
      })),
      byStrategy: Array.from(this.routingMetrics.byStrategy.entries()).map(([strategy, count]) => ({
        strategy,
        count
      })),
      currentStrategy: this.strategy,
      lastReset: this.routingMetrics.lastReset
    };
  }

  /**
   * Reset routing metrics
   */
  resetMetrics() {
    this.routingMetrics = {
      totalRouted: 0,
      byWorker: new Map(),
      byStrategy: new Map(),
      lastReset: Date.now()
    };
    
    logger.info('[RoutingEngine] Metrics reset');
  }

  /**
   * Get routing configuration
   */
  getConfig() {
    return {
      strategy: this.strategy,
      affinityRules: this.getAffinityRules(),
      metrics: this.getMetrics()
    };
  }
}

module.exports = new RoutingEngine();

