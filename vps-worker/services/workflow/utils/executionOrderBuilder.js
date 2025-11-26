/**
 * EXECUTION ORDER BUILDER MODULE
 * 
 * Purpose: Build workflow execution order based on dependencies and visual positioning
 * 
 * Location: workflow/utils/executionOrderBuilder.js
 * 
 * Responsibilities:
 * - Build topological sort based on dependencies
 * - Respect SuperAdmin visual order (Y-position)
 * - Ensure output nodes run last
 * - Validate execution order
 * 
 * Dependencies: None (pure function)
 * 
 * Extracted from: workflowExecutionService.js (Phase 8)
 * Extraction date: 2025-11-20
 * 
 * Methods extracted:
 * - buildExecutionOrder(nodes, edges) - Build execution order with dependencies and visual positioning
 * 
 * Usage:
 *   const { buildExecutionOrder } = require('./workflow/utils/executionOrderBuilder')
 */

/**
 * Build execution order based on dependencies and visual positioning
 * Extracted from: workflowExecutionService.js - buildExecutionOrder()
 * 
 * SURGICAL FIX: PRESERVE SUPERADMIN VISUAL SEQUENCE
 * - Sorts nodes by Y position first (SuperAdmin visual order)
 * - Then applies dependency constraints (topological sort)
 * - Forces output nodes to run last regardless of dependencies
 */
function buildExecutionOrder(nodes, edges) {
  if (!nodes || nodes.length === 0) {
    return []
  }

  // Build node map for quick lookup
  const nodeMap = new Map()
  nodes.forEach(node => {
    nodeMap.set(node.id, node)
  })

  // Build dependency maps
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

  // Debug dependency structure
  console.log('🔗 DEPENDENCY STRUCTURE:')
  nodes.forEach(node => {
    const deps = incomingEdges.get(node.id)
    console.log(`  - ${node.id} (${node.data.label || node.data.type}) depends on: [${deps.join(', ') || 'none'}]`)
  })

  // Topological sort
  const visited = new Set()
  const result = []

  const visit = (nodeId) => {
    if (visited.has(nodeId)) return
    visited.add(nodeId)
    
    // Visit dependencies first
    incomingEdges.get(nodeId).forEach(depId => visit(depId))
    
    result.push(nodeMap.get(nodeId))
  }

  // SURGICAL FIX: PRESERVE SUPERADMIN VISUAL SEQUENCE
  // Sort nodes by Y position first (SuperAdmin visual order), then apply dependency constraints
  const visualOrder = [...nodes].sort((a, b) => {
    // Primary sort: Y position (top to bottom as designed in SuperAdmin)
    const yDiff = (a.position?.y || 0) - (b.position?.y || 0)
    if (Math.abs(yDiff) > 50) return yDiff // Different rows
    
    // Secondary sort: X position (left to right within same row)
    return (a.position?.x || 0) - (b.position?.x || 0)
  })

  console.log('🔍 SUPERADMIN VISUAL ORDER (Y-position based):')
  visualOrder.forEach((node, i) => {
    console.log(`  ${i + 1}. ${node.id} (${node.data.label || node.data.type}) - Y:${node.position?.y || 0}`)
  })

  // Process nodes in visual order while respecting dependencies
  visualOrder.forEach(node => visit(node.id))

  // SURGICAL FIX: Force output nodes to run last, regardless of dependency graph
  const outputNodes = result.filter(node => node.data.type === 'output')
  const nonOutputNodes = result.filter(node => node.data.type !== 'output')
  const surgicalResult = [...nonOutputNodes, ...outputNodes]
  
  console.log('🔧 SURGICAL EXECUTION ORDER APPLIED:')
  console.log('  - Non-output nodes:', nonOutputNodes.map(n => `${n.id} (${n.data.type})`).join(', '))
  console.log('  - Output nodes (moved to end):', outputNodes.map(n => `${n.id} (${n.data.type})`).join(', '))
  console.log('✅ FINAL EXECUTION ORDER:', surgicalResult.map((n, i) => `${i + 1}. ${n.id} (${n.data.label || n.data.type})`).join(', '))
  
  // Validate the order (using surgicalResult instead of result)
  for (let i = 0; i < surgicalResult.length; i++) {
    const node = surgicalResult[i]
    const dependencies = incomingEdges.get(node.id)
    const unmetDeps = dependencies.filter(depId => {
      const depIndex = surgicalResult.findIndex(n => n.id === depId)
      return depIndex === -1 || depIndex > i
    })
    if (unmetDeps.length > 0) {
      console.error(`❌ EXECUTION ORDER VIOLATION: ${node.id} at position ${i + 1} has unmet dependencies:`, unmetDeps)
    }
  }

  return surgicalResult
}

module.exports = {
  buildExecutionOrder
}

