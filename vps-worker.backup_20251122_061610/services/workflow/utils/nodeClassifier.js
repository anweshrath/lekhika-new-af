/**
 * Classify and detect node types
 * Extracted from workflowExecutionService for modularity
 * 
 * @param {Object} node - Node object (with data property)
 * @param {Object} nodeOutput - Node output object
 * @returns {boolean} True if node is structural
 */
function isStructuralNode(node, nodeOutput) {
  return node?.data?.permissions?.canEditStructure === true ||
         nodeOutput?.metadata?.permissions?.canEditStructure === true ||
         /structural|structure|narrative.*architect|story.*architect/i.test(node?.data?.label || '')
}

module.exports = {
  isStructuralNode
}


