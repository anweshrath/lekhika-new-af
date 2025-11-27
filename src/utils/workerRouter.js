/**
 * Worker Router Utility
 * Manages worker preference selection (standard vs lean)
 */

const WORKER_PREFERENCE_KEY = 'lekhika_worker_preference';

/**
 * Get the current worker preference
 * @returns {'standard' | 'lean'} The preferred worker type
 */
export const getWorkerPreference = () => {
  try {
    const preference = localStorage.getItem(WORKER_PREFERENCE_KEY);
    return preference === 'lean' ? 'lean' : 'standard'; // Default to 'standard'
  } catch (error) {
    console.error('Failed to get worker preference:', error);
    return 'standard';
  }
};

/**
 * Set the worker preference
 * @param {'standard' | 'lean'} workerType The worker type to prefer
 */
export const setWorkerPreference = (workerType) => {
  try {
    if (workerType === 'lean' || workerType === 'standard') {
      localStorage.setItem(WORKER_PREFERENCE_KEY, workerType);
    } else {
      console.warn(`Invalid worker type: ${workerType}. Must be 'standard' or 'lean'`);
    }
  } catch (error) {
    console.error('Failed to set worker preference:', error);
  }
};

/**
 * Get the worker URL based on preference
 * @returns {string} The worker URL (port 3001 for standard, 3002 for lean)
 */
export const getWorkerUrl = () => {
  // Import workerConfig to get dynamic IPs
  try {
    const { getWorkerUrl: getDynamicUrl } = require('./workerConfig');
    return getDynamicUrl();
  } catch {
    // Fallback if workerConfig not available
    const preference = getWorkerPreference();
    return preference === 'lean' 
      ? 'http://103.190.93.28:3002'
      : 'http://103.190.93.28:3001';
  }
};

