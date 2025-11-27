/**
 * DEPLOYMENT ADAPTER FACTORY
 * 
 * Creates the appropriate deployment adapter based on configuration
 * Enables easy switching between PM2, K8s, Docker, etc.
 * 
 * Usage:
 *   const deployment = getDeploymentAdapter();
 *   await deployment.createWorker(config);
 * 
 * Part of: Orchestration Control Center (Future-Proof Architecture)
 * Created: 2025-11-27
 */

const PM2DeploymentAdapter = require('./PM2DeploymentAdapter');
const logger = require('../../utils/logger');

// Future adapters (to be implemented)
// const KubernetesDeploymentAdapter = require('./KubernetesDeploymentAdapter');
// const DockerSwarmDeploymentAdapter = require('./DockerSwarmDeploymentAdapter');
// const HybridDeploymentAdapter = require('./HybridDeploymentAdapter');

/**
 * Get deployment adapter based on environment or config
 * @param {object} config - Optional config to override defaults
 * @returns {DeploymentAdapter} Deployment adapter instance
 */
function getDeploymentAdapter(config = {}) {
  // Check environment variable first
  const deploymentType = config.type || process.env.DEPLOYMENT_TYPE || 'pm2';
  
  logger.info(`[DeploymentFactory] Creating ${deploymentType} adapter`);
  
  switch (deploymentType.toLowerCase()) {
    case 'pm2':
      return new PM2DeploymentAdapter(config);
    
    // Future deployment types
    // case 'kubernetes':
    // case 'k8s':
    //   return new KubernetesDeploymentAdapter(config);
    
    // case 'docker':
    // case 'swarm':
    //   return new DockerSwarmDeploymentAdapter(config);
    
    // case 'hybrid':
    //   return new HybridDeploymentAdapter(config);
    
    default:
      logger.warn(`[DeploymentFactory] Unknown deployment type: ${deploymentType}, defaulting to PM2`);
      return new PM2DeploymentAdapter(config);
  }
}

/**
 * Get adapter for specific VPS
 * @param {string} vpsId - VPS identifier
 * @returns {DeploymentAdapter} Deployment adapter for that VPS
 */
function getAdapterForVPS(vpsId) {
  // For now, all VPSes use PM2
  // In future, query VPS config to get deployment type
  return new PM2DeploymentAdapter({ vpsId });
}

/**
 * List available deployment types
 * @returns {Array} Array of supported deployment types
 */
function getAvailableDeploymentTypes() {
  return [
    {
      type: 'pm2',
      name: 'PM2 Process Manager',
      available: true,
      description: 'Single VPS with PM2 process manager'
    },
    {
      type: 'kubernetes',
      name: 'Kubernetes Cluster',
      available: false,
      description: 'K8s cluster with auto-scaling (coming soon)'
    },
    {
      type: 'docker',
      name: 'Docker Swarm',
      available: false,
      description: 'Docker Swarm orchestration (coming soon)'
    },
    {
      type: 'hybrid',
      name: 'Hybrid Mode',
      available: false,
      description: 'Mix of PM2 + K8s workers (coming soon)'
    }
  ];
}

module.exports = {
  getDeploymentAdapter,
  getAdapterForVPS,
  getAvailableDeploymentTypes,
  // Export adapter classes for direct use
  PM2DeploymentAdapter
};

