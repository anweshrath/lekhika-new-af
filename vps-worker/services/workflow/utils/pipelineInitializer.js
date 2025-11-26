/**
 * Initialize pipeline data for workflow execution
 * Extracted from workflowExecutionService.executeWorkflow for modularity
 * 
 * @param {Object} initialInput - User input
 * @param {string} workflowId - Workflow execution ID
 * @param {Object} executionUser - Execution user context object
 * @param {Array} executionOrder - Execution order array
 * @returns {Object} Initialized pipeline data
 */
function initializePipelineData(initialInput, workflowId, executionUser, executionOrder) {
  // SURGICAL: Validate executionUser before using it
  if (!executionUser || !executionUser.id) {
    const error = new Error(`pipelineInitializer: executionUser is missing or invalid - id: ${executionUser?.id}`);
    console.error('❌ pipelineInitializer error:', error.message, { executionUser });
    throw error;
  }
  
  return {
    userInput: initialInput,
    nodeOutputs: {},
    lastNodeOutput: null,
    previousNodePassover: null,
    structuralNodeOutputs: {}, // SURGICAL: Track structural node outputs separately
    executionUser: executionUser, // SURGICAL: Must be valid object with id
    metadata: {
      workflowId,
      executionTime: new Date(),
      totalNodes: executionOrder.length
    },
    tokenUsage: {
      totalTokens: 0,
      totalCost: 0,
      totalWords: 0
    },
    tokenLedger: []
  }
}

module.exports = {
  initializePipelineData
}


