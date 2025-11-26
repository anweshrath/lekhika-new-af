/**
 * Build dependency maps for workflow nodes
 * Extracted from workflowExecutionService.executeWorkflow for modularity
 * 
 * @param {Array} nodes - Workflow nodes
 * @param {Array} edges - Workflow edges
 * @returns {Object} Dependency maps { incomingEdges: Map, outgoingEdges: Map }
 */
function buildDependencyMaps(nodes, edges) {
  const incomingEdges = new Map()
  const outgoingEdges = new Map()
  
  nodes.forEach(node => {
    incomingEdges.set(node.id, [])
    outgoingEdges.set(node.id, [])
  })
  
  edges.forEach(edge => {
    outgoingEdges.get(edge.source).push(edge.target)
    incomingEdges.get(edge.target).push(edge.source)
  })
  
  return { incomingEdges, outgoingEdges }
}

module.exports = {
  buildDependencyMaps
}


