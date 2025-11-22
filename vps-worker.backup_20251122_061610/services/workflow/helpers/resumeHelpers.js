/**
 * RESUME HELPERS MODULE
 * 
 * Purpose: Centralize all resume/restart workflow logic
 * 
 * Location: workflow/helpers/resumeHelpers.js
 * 
 * Responsibilities:
 * - Restart workflows from checkpoints
 * - Restart failed nodes
 * - Continue workflows from specific nodes
 * - Continue execution from a node index
 * 
 * Dependencies:
 * - stateManager (imported)
 * - buildExecutionOrder (passed as function parameter)
 * - executeNode (passed as function parameter)
 * 
 * Extracted from: workflowExecutionService.js (Phase 4)
 * Extraction date: 2025-11-20
 * 
 * Methods extracted:
 * - restartFromCheckpoint(workflowId, nodeId, nodes, edges, initialInput, progressCallback, superAdminUser, buildExecutionOrder, executeNode, restartFailedNode, continueExecutionFromNode)
 * - restartFailedNode(workflowId, nodeId, nodes, edges, initialInput, progressCallback, superAdminUser, buildExecutionOrder, executeNode, continueWorkflowFromNode)
 * - continueWorkflowFromNode(workflowId, fromNodeId, nodes, edges, initialInput, progressCallback, superAdminUser, buildExecutionOrder, continueExecutionFromNode)
 * - continueExecutionFromNode(workflowId, nodes, edges, initialInput, progressCallback, superAdminUser, startIndex, existingOutputs, buildExecutionOrder, executeNode)
 * 
 * Usage:
 *   const { restartFromCheckpoint, restartFailedNode, continueWorkflowFromNode, continueExecutionFromNode } = require('./workflow/helpers/resumeHelpers')
 *   await restartFromCheckpoint(..., this.buildExecutionOrder.bind(this), this.executeNode.bind(this), ...)
 */

const stateManager = require('../state/executionStateManager')

/**
 * Restart workflow from checkpoint
 * Extracted from: workflowExecutionService.js - restartFromCheckpoint()
 */
async function restartFromCheckpoint(
  workflowId, 
  nodeId, 
  nodes, 
  edges, 
  initialInput, 
  progressCallback, 
  superAdminUser,
  buildExecutionOrder,
  executeNode,
  restartFailedNode,
  continueExecutionFromNode
) {
  console.log(`🔄 Restarting workflow ${workflowId} from checkpoint ${nodeId}`)
  
  try {
    const checkpoint = stateManager.getCheckpoint(workflowId, nodeId)
    
    if (!checkpoint) {
      console.log(`⚠️ No checkpoint found for node ${nodeId}, attempting to restart failed node`)
      return await restartFailedNode(
        workflowId, 
        nodeId, 
        nodes, 
        edges, 
        initialInput, 
        progressCallback, 
        superAdminUser,
        buildExecutionOrder,
        executeNode,
        continueWorkflowFromNode
      )
    }
    
    stateManager.updateExecutionState(workflowId, {
      ...checkpoint.state,
      status: 'executing',
      resumedFromNode: nodeId,
      resumedAt: new Date()
    })
    
    const executionOrder = buildExecutionOrder(nodes, edges)
    const nodeIndex = executionOrder.findIndex(node => node.id === nodeId)
    
    if (nodeIndex === -1) {
      throw new Error(`Node ${nodeId} not found in execution order`)
    }
    
    return await continueExecutionFromNode(
      workflowId, 
      nodes, 
      edges, 
      initialInput, 
      progressCallback, 
      superAdminUser,
      nodeIndex + 1, 
      checkpoint.state.nodeOutputs || {},
      buildExecutionOrder,
      executeNode
    )
    
  } catch (error) {
    console.error(`❌ Error restarting from checkpoint:`, error)
    return { success: false, error: error.message }
  }
}

/**
 * Restart failed node
 * Extracted from: workflowExecutionService.js - restartFailedNode()
 */
async function restartFailedNode(
  workflowId, 
  nodeId, 
  nodes, 
  edges, 
  initialInput, 
  progressCallback, 
  superAdminUser,
  buildExecutionOrder,
  executeNode,
  continueWorkflowFromNode
) {
  console.log(`🔄 Restarting failed node ${nodeId} in workflow ${workflowId}`)
  
  try {
    const nodeToRestart = nodes.find(node => node.id === nodeId)
    if (!nodeToRestart) {
      throw new Error(`Node ${nodeId} not found`)
    }
    
    const currentState = stateManager.getExecutionState(workflowId)
    if (!currentState) {
      throw new Error(`No execution state found for workflow ${workflowId}`)
    }
    
    const previousOutputs = currentState.nodeOutputs || {}
    const pipelineData = {
      userInput: initialInput,
      nodeOutputs: { ...previousOutputs },
      lastNodeOutput: previousOutputs[nodeId] || null,
      workflowId,
      currentNodeId: nodeId,
      executionStartTime: currentState.startTime || new Date()
    }
    
    stateManager.updateExecutionState(workflowId, {
      ...currentState,
      status: 'executing',
      currentNodeId: nodeId,
      currentNodeStatus: 'executing',
      errors: currentState.errors ? currentState.errors.filter(error => error.nodeId !== nodeId) : []
    })
    
    const result = await executeNode(nodeToRestart, pipelineData, workflowId, progressCallback)
    
    if (result.success) {
      stateManager.updateExecutionState(workflowId, {
        ...currentState,
        nodeOutputs: {
          ...currentState.nodeOutputs,
          [nodeId]: result.output
        },
        currentNodeStatus: 'completed'
      })
      
      console.log(`✅ Successfully restarted node ${nodeId}`)
      
      return await continueWorkflowFromNode(
        workflowId, 
        nodeId, 
        nodes, 
        edges, 
        initialInput, 
        progressCallback, 
        superAdminUser,
        buildExecutionOrder,
        executeNode,
        continueExecutionFromNode
      )
    } else {
      throw new Error(result.error || 'Node execution failed')
    }
    
  } catch (error) {
    console.error(`❌ Error restarting failed node:`, error)
    return { success: false, error: error.message }
  }
}

/**
 * Continue workflow from specific node
 * Extracted from: workflowExecutionService.js - continueWorkflowFromNode()
 */
async function continueWorkflowFromNode(
  workflowId, 
  fromNodeId, 
  nodes, 
  edges, 
  initialInput, 
  progressCallback, 
  superAdminUser,
  buildExecutionOrder,
  executeNode,
  continueExecutionFromNode
) {
  console.log(`▶️ Continuing workflow ${workflowId} from node ${fromNodeId}`)
  
  try {
    const executionOrder = buildExecutionOrder(nodes, edges)
    const fromNodeIndex = executionOrder.findIndex(node => node.id === fromNodeId)
    
    if (fromNodeIndex === -1) {
      throw new Error(`Node ${fromNodeId} not found in execution order`)
    }
    
    return await continueExecutionFromNode(
      workflowId,
      nodes,
      edges,
      initialInput,
      progressCallback,
      superAdminUser,
      fromNodeIndex + 1,
      stateManager.executionState.get(workflowId)?.nodeOutputs || {},
      buildExecutionOrder,
      executeNode
    )
    
  } catch (error) {
    console.error(`❌ Error continuing workflow from node:`, error)
    return { success: false, error: error.message }
  }
}

/**
 * Continue execution from node index
 * Extracted from: workflowExecutionService.js - continueExecutionFromNode()
 */
async function continueExecutionFromNode(
  workflowId, 
  nodes, 
  edges, 
  initialInput, 
  progressCallback, 
  superAdminUser, 
  startIndex, 
  existingOutputs,
  buildExecutionOrder,
  executeNode
) {
  console.log(`🔄 Continuing execution from node index ${startIndex}`)
  
  const executionOrder = buildExecutionOrder(nodes, edges)
  
  const pipelineData = {
    userInput: initialInput,
    nodeOutputs: { ...existingOutputs },
    lastNodeOutput: null,
    previousNodePassover: null
  }
  
  for (let i = startIndex; i < executionOrder.length; i++) {
    const node = executionOrder[i]
    
    if (stateManager.isWorkflowPaused(workflowId)) {
      await stateManager.waitForResume(workflowId)
    }
    
    if (stateManager.isWorkflowStopped(workflowId)) {
      console.log(`🛑 Workflow ${workflowId} stopped during continuation`)
      return { success: false, status: 'stopped' }
    }
    
    try {
      console.log(`🔍 EXECUTING NODE ${i + 1}/${executionOrder.length}: ${node.id} (${node.data.label})`)
      
      const nodeOutput = await executeNode(node, pipelineData, workflowId, progressCallback)
      
      pipelineData.nodeOutputs[node.id] = nodeOutput
      pipelineData.lastNodeOutput = nodeOutput
      
      stateManager.updateExecutionState(workflowId, {
        [`results.${node.id}`]: nodeOutput,
        nodeOutputs: pipelineData.nodeOutputs,
        currentNodeIndex: i,
        completedNodes: executionOrder.slice(0, i + 1).map(n => n.id)
      })

      stateManager.createCheckpoint(workflowId, node.id, {
        ...stateManager.executionState.get(workflowId),
        nodeOutputs: pipelineData.nodeOutputs,
        currentNodeIndex: i,
        completedNodes: executionOrder.slice(0, i + 1).map(n => n.id)
      })
      
      const completionProgress = ((i + 1) / executionOrder.length) * 100
      if (progressCallback) {
        progressCallback({
          nodeId: node.id,
          nodeName: node.data.label,
          progress: completionProgress,
          status: 'completed',
          output: nodeOutput,
          nodeIndex: i + 1,
          totalNodes: executionOrder.length,
          isNodeComplete: true,
          checkpointCreated: true
        })
      }
      
    } catch (error) {
      console.error(`❌ Error executing node ${node.id}:`, error)
      throw error
    }
  }
  
  console.log(`✅ Workflow ${workflowId} completed successfully`)
  return {
    success: true,
    status: 'completed',
    results: pipelineData.nodeOutputs
  }
}

module.exports = {
  restartFromCheckpoint,
  restartFailedNode,
  continueWorkflowFromNode,
  continueExecutionFromNode
}

