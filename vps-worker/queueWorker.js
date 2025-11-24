/* Dedicated queue worker process for workflow execution */

require('dotenv').config();

const logger = require('./utils/logger');
const { initializeSupabase } = require('./services/supabase');
const analyticsAggregator = require('./services/analyticsAggregator');
const healthService = require('./services/healthService');
const queue = require('./services/queue');
const executionService = require('./services/executionService');

async function bootstrap() {
  try {
    logger.info('Initializing Lekhika Queue Worker...');

    await initializeSupabase();
    logger.info('✅ Supabase initialized in queue worker');

    await analyticsAggregator.initialize();
    logger.info('✅ Analytics aggregator initialized in queue worker');

    healthService.startMonitoring();
    logger.info('✅ Health monitoring started in queue worker');

    const concurrency = parseInt(process.env.QUEUE_CONCURRENCY, 10) || 2;

    await queue.process(
      'workflow.execute',
      async (job) => {
        const payload = job.data || {};
        const {
          executionId,
          lekhikaApiKey,
          userEngineId,
          masterEngineId,
          userId,
          workflow,
          inputs,
          options
        } = payload;

        logger.info(`QueueWorker: processing execution ${executionId} (job ${job.id})`);

        // SURGICAL: Validate critical parameters before execution
        if (!userId) {
          const error = new Error(`QueueWorker: userId is missing in job payload for execution ${executionId}`);
          logger.error('QueueWorker validation failed:', { executionId, payload: Object.keys(payload) });
          throw error;
        }
        
        if (!executionId || !workflow || !inputs) {
          const error = new Error(`QueueWorker: Missing required parameters for execution ${executionId}`);
          logger.error('QueueWorker validation failed:', { executionId, hasWorkflow: !!workflow, hasInputs: !!inputs });
          throw error;
        }

        // Use existing executionService to preserve all DB/tokens/analytics behavior.
        return executionService.executeWorkflow({
          executionId,
          lekhikaApiKey,
          userEngineId,
          masterEngineId,
          userId,
          workflow,
          inputs,
          options
        });
      },
      { concurrency }
    );

    logger.info(`🚀 Queue worker ready. Listening for workflow.execute jobs with concurrency ${concurrency}`);

    process.on('SIGTERM', async () => {
      logger.info('QueueWorker: SIGTERM received, shutting down gracefully...');
      healthService.stopMonitoring();
      if (queue && queue.close) {
        await queue.close();
      }
      process.exit(0);
    });

    process.on('SIGINT', async () => {
      logger.info('QueueWorker: SIGINT received, shutting down gracefully...');
      healthService.stopMonitoring();
      if (queue && queue.close) {
        await queue.close();
      }
      process.exit(0);
    });
  } catch (err) {
    logger.error('QueueWorker initialization failed:', err);
    process.exit(1);
  }
}

bootstrap();


