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
    this.sessionCache = new Map(); // For sticky sessions
    this.latencyTracker = new Map(); // Worker → latency history
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
   * @param {string} strategy - Routing strategy name
   */
  setStrategy(strategy) {
    const validStrategies = [
      'round_robin',
      'least_loaded',
      'weighted',
      'health_based',
      'affinity_based',
      'priority_based',
      'latency_based',
      'capacity_aware',
      'sticky_session',
      'resource_based'
    ];
    
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
      case 'priority_based':
        selectedWorker = this.priorityBased(candidates, job);
        break;
      case 'latency_based':
        selectedWorker = this.latencyBased(candidates);
        break;
      case 'capacity_aware':
        selectedWorker = this.capacityAware(candidates);
        break;
      case 'sticky_session':
        selectedWorker = this.stickySession(candidates, job);
        break;
      case 'resource_based':
        selectedWorker = this.resourceBased(candidates);
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
   * Priority-Based: Route based on worker priority and job priority
   */
  priorityBased(workers, job) {
    if (workers.length === 0) {
      throw new Error('No workers available for priority-based routing');
    }

    const jobPriority = job.priority || 'normal';
    
    // If high-priority job, route to high-priority workers first
    if (jobPriority === 'high') {
      const highPriorityWorkers = workers.filter(w => w.tags?.includes('high-priority'));
      if (highPriorityWorkers.length > 0) {
        return this.leastLoaded(highPriorityWorkers);
      }
    }
    
    // Fallback to least-loaded
    return this.leastLoaded(workers);
  }

  /**
   * Latency-Based: Route to worker with lowest average response time
   */
  latencyBased(workers) {
    if (workers.length === 0) {
      throw new Error('No workers available for latency-based routing');
    }

    // Sort by latency (ascending) - prefer workers with lower latency
    const sorted = workers.sort((a, b) => {
      const aLatency = this.latencyTracker.get(a.id) || 1000; // Default 1000ms
      const bLatency = this.latencyTracker.get(b.id) || 1000;
      return aLatency - bLatency;
    });

    return sorted[0];
  }

  /**
   * Capacity-Aware: Route based on remaining capacity percentage
   */
  capacityAware(workers) {
    if (workers.length === 0) {
      throw new Error('No workers available for capacity-aware routing');
    }

    // Calculate remaining capacity percentage
    const sorted = workers.sort((a, b) => {
      const aCapacity = a.capacity || 10;
      const aActive = a.metrics?.activeJobs || 0;
      const aRemaining = (aCapacity - aActive) / aCapacity;
      
      const bCapacity = b.capacity || 10;
      const bActive = b.metrics?.activeJobs || 0;
      const bRemaining = (bCapacity - bActive) / bCapacity;
      
      return bRemaining - aRemaining; // Descending (most capacity first)
    });

    return sorted[0];
  }

  /**
   * Sticky Session: Route same user/job type to same worker
   */
  stickySession(workers, job) {
    if (workers.length === 0) {
      throw new Error('No workers available for sticky-session routing');
    }

    // Generate session key from userId + jobType
    const sessionKey = `${job.userId || 'unknown'}-${job.type || 'workflow'}`;
    
    // Check if we have a cached worker for this session
    const cachedWorkerId = this.sessionCache.get(sessionKey);
    
    if (cachedWorkerId) {
      const cachedWorker = workers.find(w => w.id === cachedWorkerId);
      if (cachedWorker) {
        logger.debug(`[RoutingEngine] Sticky session: ${sessionKey} → ${cachedWorkerId}`);
        return cachedWorker;
      }
    }
    
    // No cached worker or worker no longer available - select new one
    const selectedWorker = this.leastLoaded(workers);
    
    // Cache for future requests
    this.sessionCache.set(sessionKey, selectedWorker.id);
    
    // Auto-cleanup old sessions (keep last 1000)
    if (this.sessionCache.size > 1000) {
      const firstKey = this.sessionCache.keys().next().value;
      this.sessionCache.delete(firstKey);
    }
    
    return selectedWorker;
  }

  /**
   * Resource-Based: Route based on CPU/Memory availability
   */
  resourceBased(workers) {
    if (workers.length === 0) {
      throw new Error('No workers available for resource-based routing');
    }

    // Calculate resource score (lower CPU + lower memory = better)
    const sorted = workers.sort((a, b) => {
      const aCpu = a.metrics?.cpu || 50;
      const aMemory = a.metrics?.memoryPercent || 50;
      const aScore = (100 - aCpu) + (100 - aMemory); // Higher is better
      
      const bCpu = b.metrics?.cpu || 50;
      const bMemory = b.metrics?.memoryPercent || 50;
      const bScore = (100 - bCpu) + (100 - bMemory);
      
      return bScore - aScore; // Descending (best resources first)
    });

    return sorted[0];
  }

  /**
   * Track latency for latency-based routing
   * @param {string} workerId - Worker ID
   * @param {number} latencyMs - Latency in milliseconds
   */
  trackLatency(workerId, latencyMs) {
    const history = this.latencyTracker.get(workerId) || [];
    history.push(latencyMs);
    
    // Keep last 100 latency measurements
    if (history.length > 100) {
      history.shift();
    }
    
    // Calculate average latency
    const avgLatency = history.reduce((sum, val) => sum + val, 0) / history.length;
    this.latencyTracker.set(workerId, avgLatency);
  }

  /**
   * Get all available routing strategies
   */
  getAvailableStrategies() {
    return [
      {
        id: 'round_robin',
        name: 'Round Robin',
        description: 'Distribute jobs evenly across all workers',
        useCase: 'Balanced load distribution',
        pros: ['Simple', 'Fair distribution'],
        cons: ['Ignores worker load', 'No intelligence']
      },
      {
        id: 'least_loaded',
        name: 'Least Loaded',
        description: 'Route to worker with fewest active jobs',
        useCase: 'Dynamic load balancing',
        pros: ['Prevents overload', 'Adapts to load'],
        cons: ['Slight overhead checking jobs']
      },
      {
        id: 'weighted',
        name: 'Weighted Distribution',
        description: 'Route based on worker capacity/weight',
        useCase: 'Workers with different capacities',
        pros: ['Respects worker capacity', 'Configurable weights'],
        cons: ['Needs manual weight configuration']
      },
      {
        id: 'health_based',
        name: 'Health-Based',
        description: 'Route to healthiest worker',
        useCase: 'Maximize reliability',
        pros: ['Avoids unhealthy workers', 'Reliability focus'],
        cons: ['May ignore capacity']
      },
      {
        id: 'affinity_based',
        name: 'Affinity-Based',
        description: 'Match job type to worker capabilities',
        useCase: 'Specialized workers (GPU, Export)',
        pros: ['Optimizes for job type', 'Efficient resource use'],
        cons: ['Requires tag configuration']
      },
      {
        id: 'priority_based',
        name: 'Priority-Based',
        description: 'High-priority jobs go to dedicated workers',
        useCase: 'VIP/urgent job handling',
        pros: ['Fast-track important jobs', 'SLA compliance'],
        cons: ['May underutilize some workers']
      },
      {
        id: 'latency_based',
        name: 'Latency-Based',
        description: 'Route to worker with fastest response time',
        useCase: 'Performance-critical applications',
        pros: ['Minimizes response time', 'User experience focus'],
        cons: ['Requires latency tracking']
      },
      {
        id: 'capacity_aware',
        name: 'Capacity-Aware',
        description: 'Route based on remaining capacity percentage',
        useCase: 'Prevent worker saturation',
        pros: ['Prevents overload', 'Smart distribution'],
        cons: ['Slight complexity']
      },
      {
        id: 'sticky_session',
        name: 'Sticky Sessions',
        description: 'Route same user/job type to same worker',
        useCase: 'Stateful applications, cache efficiency',
        pros: ['Cache efficiency', 'Consistency'],
        cons: ['May cause imbalance']
      },
      {
        id: 'resource_based',
        name: 'Resource-Based',
        description: 'Route based on CPU/Memory availability',
        useCase: 'Resource-intensive workloads',
        pros: ['Optimizes resource usage', 'Prevents crashes'],
        cons: ['Requires metrics collection']
      }
    ];
  }

  /**
   * Get routing configuration
   */
  getConfig() {
    return {
      strategy: this.strategy,
      affinityRules: this.getAffinityRules(),
      metrics: this.getMetrics(),
      availableStrategies: this.getAvailableStrategies()
    };
  }
}

module.exports = new RoutingEngine();

