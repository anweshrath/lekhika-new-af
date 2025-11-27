/**
 * Worker Configuration Utility
 * Manages worker IP addresses and connection settings
 */

const WORKER_CONFIG_KEY = 'lekhika_worker_config';

const DEFAULT_CONFIG = {
  workers: [
    {
      id: 'primary',
      name: 'Primary Worker',
      ip: '103.190.93.28',
      port: 3001,
      type: 'standard',
      enabled: true
    },
    {
      id: 'lean',
      name: 'Lean Worker',
      ip: '103.190.93.28',
      port: 3002,
      type: 'lean',
      enabled: false // Disabled by default since lean worker may not be running
    }
  ],
  activeWorkerId: 'primary'
};

/**
 * Get worker configuration
 */
export const getWorkerConfig = () => {
  try {
    const config = localStorage.getItem(WORKER_CONFIG_KEY);
    return config ? JSON.parse(config) : DEFAULT_CONFIG;
  } catch (error) {
    console.error('Failed to get worker config:', error);
    return DEFAULT_CONFIG;
  }
};

/**
 * Save worker configuration
 */
export const saveWorkerConfig = (config) => {
  try {
    localStorage.setItem(WORKER_CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save worker config:', error);
  }
};

/**
 * Get active worker
 */
export const getActiveWorker = () => {
  const config = getWorkerConfig();
  return config.workers.find(w => w.id === config.activeWorkerId) || config.workers[0];
};

/**
 * Get worker by ID
 */
export const getWorker = (workerId) => {
  const config = getWorkerConfig();
  return config.workers.find(w => w.id === workerId);
};

/**
 * Add worker to config
 */
export const addWorker = (worker) => {
  const config = getWorkerConfig();
  config.workers.push(worker);
  saveWorkerConfig(config);
};

/**
 * Update worker in config
 */
export const updateWorker = (workerId, updates) => {
  const config = getWorkerConfig();
  const index = config.workers.findIndex(w => w.id === workerId);
  if (index !== -1) {
    config.workers[index] = { ...config.workers[index], ...updates };
    saveWorkerConfig(config);
  }
};

/**
 * Remove worker from config
 */
export const removeWorker = (workerId) => {
  const config = getWorkerConfig();
  config.workers = config.workers.filter(w => w.id !== workerId);
  saveWorkerConfig(config);
};

/**
 * Set active worker
 */
export const setActiveWorker = (workerId) => {
  const config = getWorkerConfig();
  config.activeWorkerId = workerId;
  saveWorkerConfig(config);
};

/**
 * Get worker URL
 */
export const getWorkerUrl = (workerId = null) => {
  const worker = workerId ? getWorker(workerId) : getActiveWorker();
  if (!worker) return 'http://103.190.93.28:3001';
  return `http://${worker.ip}:${worker.port}`;
};

/**
 * Get orchestration API URL
 */
export const getOrchestrationUrl = () => {
  const worker = getActiveWorker();
  return `http://${worker.ip}:${worker.port}/orchestration`;
};

