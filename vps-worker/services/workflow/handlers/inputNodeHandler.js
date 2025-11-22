const { sanitizeUserInputForNextNode } = require('../inputSanitizer')

/**
 * Execute input node - validate and structure user input
 * Extracted from workflowExecutionService.executeInputNode for modularity
 * 
 * @param {Object} nodeData - Input node configuration
 * @param {Object} pipelineData - Current pipeline data
 * @returns {Object} Structured input output with JSON wrapper
 */
function executeInputNode(nodeData, pipelineData) {
  const { userInput } = pipelineData
  const { testInputEnabled, testInputValues, processingInstructions } = nodeData

  // Use test input values if enabled, otherwise use regular userInput
  const inputToUse = testInputEnabled && testInputValues ? testInputValues : userInput
  
  console.log('🔍 INPUT NODE JSON WRAPPER:')
  console.log('  - Using processingInstructions from nodePalettes.js')
  console.log('  - inputToUse:', inputToUse)

  // Create JSON wrapper as per nodePalettes.js instructions
  const jsonWrapper = {
    user_input: sanitizeUserInputForNextNode(inputToUse),
    metadata: {
      node_id: nodeData.id || 'input-node',
      timestamp: new Date().toISOString(),
      status: 'processed',
      workflow_type: nodeData.role || 'universal'
    },
    next_node_data: {
      original_input: inputToUse,
      processing_instructions: 'All user data wrapped and ready for next node'
    }
  }

  console.log('🔍 JSON WRAPPER CREATED:', jsonWrapper)

  return {
    type: 'input_json_wrapper',
    content: jsonWrapper,
    nodeName: nodeData.label || 'Input Processing',
    metadata: {
      nodeId: nodeData.id || 'input-node',
      nodeName: nodeData.label || 'Input Processing',
      timestamp: new Date(),
      wrapperCreated: true
    }
  }
}

module.exports = {
  executeInputNode
}


