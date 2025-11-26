const winston = require('winston');
const path = require('path');

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'lekhika-worker',
    workerId: process.env.WORKER_ID || 'unknown'
  },
  transports: [
    // Console transport with timestamps
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
          return `${timestamp} ${level}: ${message} ${metaStr}`;
        })
      )
    }),
    
    // File transport for errors with JSON format
    new winston.transports.File({
      filename: process.env.LOG_FILE_PATH || '/var/log/lekhika-worker-error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.json()
      )
    }),
    
    // File transport for all logs with JSON format
    new winston.transports.File({
      filename: process.env.LOG_FILE_PATH || '/var/log/lekhika-worker.log',
      maxsize: 5242880, // 5MB
      maxFiles: 10,
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.json()
      )
    })
  ]
});

// Add execution-specific logging methods
logger.logExecution = (executionId, message, meta = {}) => {
  logger.info(message, {
    executionId,
    ...meta
  });
};

logger.logExecutionError = (executionId, error, meta = {}) => {
  logger.error(`Execution ${executionId} failed:`, {
    executionId,
    error: error.message,
    stack: error.stack,
    ...meta
  });
};

logger.logAIRequest = (provider, model, tokens, cost) => {
  logger.info('AI API Request', {
    provider,
    model,
    tokens,
    cost,
    timestamp: new Date().toISOString()
  });
};

logger.logAIError = (provider, model, error) => {
  logger.error('AI API Error', {
    provider,
    model,
    error: error.message,
    timestamp: new Date().toISOString()
  });
};

module.exports = logger;
