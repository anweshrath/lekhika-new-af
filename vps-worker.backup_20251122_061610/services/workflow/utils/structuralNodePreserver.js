const { isStructuralNode: isStructuralNodeHelper } = require('./nodeClassifier')

/**
 * Preserve structural node output in pipeline data
 * Extracted from workflowExecutionService for modularity
 * 
 * @param {Object} node - Node object
 * @param {Object} nodeOutput - Node output
 * @param {Object} pipelineData - Pipeline data (mutated)
 */
function preserveStructuralNodeOutput(node, nodeOutput, pipelineData) {
  if (isStructuralNodeHelper(node, nodeOutput) && nodeOutput.content) {
    if (!pipelineData.structuralNodeOutputs) {
      pipelineData.structuralNodeOutputs = {}
    }
    pipelineData.structuralNodeOutputs[node.id] = nodeOutput
    console.log(`📐 PRESERVED structural node output from ${node.id} (${node.data?.label || 'structural'})`)
    console.log(`   - Structural outputs count: ${Object.keys(pipelineData.structuralNodeOutputs).length}`)
  }
}

/**
 * Rebuild structural node outputs from nodeOutputs during resume
 * Extracted from workflowExecutionService.resumeExecution for modularity
 * 
 * @param {Object} pipelineData - Pipeline data (mutated)
 */
function rebuildStructuralNodeOutputs(pipelineData) {
  if (Object.keys(pipelineData.structuralNodeOutputs || {}).length === 0 && pipelineData.nodeOutputs) {
    Object.entries(pipelineData.nodeOutputs).forEach(([nodeId, nodeOutput]) => {
      const isStructural = nodeOutput.metadata?.permissions?.canEditStructure === true ||
                         /structural|structure|narrative.*architect|story.*architect/i.test(nodeOutput.metadata?.nodeName || '')
      if (isStructural && nodeOutput.content) {
        if (!pipelineData.structuralNodeOutputs) {
          pipelineData.structuralNodeOutputs = {}
        }
        pipelineData.structuralNodeOutputs[nodeId] = nodeOutput
      }
    })
  }
}

module.exports = {
  preserveStructuralNodeOutput,
  rebuildStructuralNodeOutputs
}

