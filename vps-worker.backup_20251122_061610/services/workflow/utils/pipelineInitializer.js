/**
 * Initialize pipeline data for workflow execution
 * Extracted from workflowExecutionService.executeWorkflow for modularity
 * 
 * @param {Object} initialInput - User input
 * @param {string} workflowId - Workflow execution ID
 * @param {Object} superAdminUser - Super admin user object
 * @param {Array} executionOrder - Execution order array
 * @returns {Object} Initialized pipeline data
 */
function initializePipelineData(initialInput, workflowId, superAdminUser, executionOrder) {
  return {
    userInput: initialInput,
    nodeOutputs: {},
    lastNodeOutput: null,
    previousNodePassover: null,
    structuralNodeOutputs: {}, // SURGICAL: Track structural node outputs separately
    superAdminUser: superAdminUser,
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


