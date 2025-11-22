/**
 * Workflow Orchestrator Entry Point
 * Thin wrapper that will gradually absorb the god-file responsibilities.
 * 
 * NOTE: workflowExecutionService exports an INSTANCE, not the class.
 * This file re-exports the same instance for compatibility.
 */

const workflowExecutionService = require('../workflowExecutionService')

/**
 * Legacy compatibility layer.
 * Re-exports the workflowExecutionService instance.
 */
module.exports = workflowExecutionService

