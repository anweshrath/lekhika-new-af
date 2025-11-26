const logger = require('../../utils/logger');
const InMemoryQueueAdapter = require('./adapters/InMemoryQueueAdapter');
const QueueAdapter = require('./QueueAdapter');

let instance = null;

function createAdapter() {
  const enabled = String(process.env.QUEUE_ENABLED || 'false').toLowerCase() === 'true';

  if (!enabled) {
    logger.info('Queue system disabled (QUEUE_ENABLED=false). Using InMemoryQueueAdapter.');
    return new InMemoryQueueAdapter();
  }

  const provider = (process.env.QUEUE_PROVIDER || 'redis').toLowerCase();

  if (provider === 'redis') {
    try {
      const RedisQueueAdapter = require('./adapters/RedisQueueAdapter');
      logger.info('Initializing RedisQueueAdapter for queue processing');
      return new RedisQueueAdapter();
    } catch (err) {
      logger.error('Failed to initialize RedisQueueAdapter, falling back to InMemoryQueueAdapter:', err);
      return new InMemoryQueueAdapter();
    }
  }

  logger.warn(`Unknown QUEUE_PROVIDER "${provider}", falling back to InMemoryQueueAdapter.`);
  return new InMemoryQueueAdapter();
}

function getQueueAdapter() {
  if (instance && instance instanceof QueueAdapter) {
    return instance;
  }
  instance = createAdapter();
  return instance;
}

module.exports = getQueueAdapter();


