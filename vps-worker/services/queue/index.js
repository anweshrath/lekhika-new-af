const logger = require('../../utils/logger');
const InMemoryQueueAdapter = require('./adapters/InMemoryQueueAdapter');
const QueueAdapter = require('./QueueAdapter');

let instance = null;

function createAdapter() {
  const enabled = String(process.env.QUEUE_ENABLED || 'false').toLowerCase() === 'true';
  const provider = (process.env.QUEUE_PROVIDER || 'redis').toLowerCase();

  // Queue explicitly disabled: always use in-memory adapter
  if (!enabled) {
    logger.info('Queue system disabled (QUEUE_ENABLED=false). Using InMemoryQueueAdapter.');
    return new InMemoryQueueAdapter();
  }

  // Queue enabled: provider must be redis for now – no silent fallbacks
  if (provider !== 'redis') {
    const message = `QUEUE_ENABLED=true but QUEUE_PROVIDER="${provider}" is not supported. Expected "redis". Refusing to start with fake queue.`;
    logger.error(message);
    throw new Error(message);
  }

  // Strict Redis mode
  try {
    const RedisQueueAdapter = require('./adapters/RedisQueueAdapter');
    const adapter = new RedisQueueAdapter();

    if (!(adapter instanceof QueueAdapter)) {
      const message = 'RedisQueueAdapter did not extend QueueAdapter – refusing to continue with invalid adapter.';
      logger.error(message);
      throw new Error(message);
    }

    logger.info('✅ RedisQueueAdapter initialized for queue processing (STRICT mode, no in-memory fallback).');
    return adapter;
  } catch (err) {
    // CRITICAL: Do not fall back to in-memory when queue is enabled.
    logger.error('❌ Failed to initialize RedisQueueAdapter while QUEUE_ENABLED=true. Process will exit so you see the real error:', err);
    throw err;
  }
}

function getQueueAdapter() {
  if (instance && instance instanceof QueueAdapter) {
    return instance;
  }
  instance = createAdapter();
  return instance;
}

module.exports = getQueueAdapter();


