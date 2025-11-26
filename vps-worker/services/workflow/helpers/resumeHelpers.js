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
 * - restartFromCheckpoint(workflowId, nodeId, nodes, edges, initialInput, progressCallback, executionUser, buildExecutionOrder, executeNode, restartFailedNode, continueExecutionFromNode)
 * - restartFailedNode(workflowId, nodeId, nodes, edges, initialInput, progressCallback, executionUser, buildExecutionOrder, executeNode, continueWorkflowFromNode)
 * - continueWorkflowFromNode(workflowId, fromNodeId, nodes, edges, initialInput, progressCallback, executionUser, buildExecutionOrder, continueExecutionFromNode)
 * - continueExecutionFromNode(workflowId, nodes, edges, initialInput, progressCallback, executionUser, startIndex, existingOutputs, buildExecutionOrder, executeNode)
 * 
 * Usage:
 *   const { restartFromCheckpoint, restartFailedNode, continueWorkflowFromNode, continueExecutionFromNode } = require('./workflow/helpers/resumeHelpers')
 *   await restartFromCheckpoint(..., this.buildExecutionOrder.bind(this), this.executeNode.bind(this), ...)
 */

const stateManager = require('../state/executionStateManager')
const { getSupabase } = require('../../supabase')

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
  executionUser,
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
        executionUser,
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
      executionUser,
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
  executionUser,
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
        executionUser,
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
  executionUser,
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
      executionUser,
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
  executionUser, 
  startIndex, 
  existingOutputs,
  buildExecutionOrder,
  executeNode,
  regenerateContext = null // SURGICAL: Accept user guidance for failed node retry
) {
  console.log(`🔄 Continuing execution from node index ${startIndex}`)
  
  const executionOrder = buildExecutionOrder(nodes, edges)
  
  // SURGICAL: Find last completed node's output from existingOutputs
  let lastNodeOutput = null
  if (startIndex > 0 && Object.keys(existingOutputs).length > 0) {
    // Find the last node before startIndex that has output
    for (let i = startIndex - 1; i >= 0; i--) {
      const prevNode = executionOrder[i]
      if (existingOutputs[prevNode.id]) {
        lastNodeOutput = existingOutputs[prevNode.id]
        console.log(`✅ Found lastNodeOutput from node ${prevNode.id} (${prevNode.data.label})`)
        break
      }
    }
  }
  
  // SURGICAL: Validate executionUser before proceeding
  if (!executionUser || !executionUser.id) {
    throw new Error('Execution user context required for resume - user_id is missing')
  }
  
  const pipelineData = {
    userInput: initialInput,
    nodeOutputs: { ...existingOutputs },
    lastNodeOutput: lastNodeOutput, // SURGICAL: Use actual last completed node output
    previousNodePassover: null,
    executionUser: executionUser, // SURGICAL: Include executionUser so AI handlers can access it
    regenerateContext: regenerateContext // SURGICAL: Include user guidance for failed node retry
  }
  
  if (regenerateContext?.manualInstruction) {
    console.log(`📝 User guidance available for resume: ${regenerateContext.manualInstruction.substring(0, 100)}...`)
  }
  
  // SURGICAL: Send initial progress update when resume starts (so progress bar shows activity)
  const initialProgress = (startIndex / executionOrder.length) * 100
  if (progressCallback && startIndex < executionOrder.length) {
    const firstNode = executionOrder[startIndex]
    progressCallback({
      nodeId: firstNode?.id || null,
      nodeName: firstNode?.data?.label || 'Resuming workflow',
      progress: initialProgress,
      status: 'running',
      nodeIndex: startIndex + 1,
      totalNodes: executionOrder.length,
      isNodeComplete: false,
      resumed: true,
      message: `Resuming from node ${startIndex + 1} of ${executionOrder.length}`
    })
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
      
      // SURGICAL: Send progress update when node starts executing (so progress bar moves)
      const startProgress = (i / executionOrder.length) * 100
      if (progressCallback) {
        progressCallback({
          nodeId: node.id,
          nodeName: node.data.label,
          progress: startProgress,
          status: 'running',
          nodeIndex: i + 1,
          totalNodes: executionOrder.length,
          isNodeComplete: false,
          currentNode: node.data.label
        })
      }
      
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
      console.error(`❌ Error executing node ${node.id} during resume:`, error)
      
      // SURGICAL: Report error via progressCallback with full details
      if (progressCallback) {
        progressCallback({
          nodeId: node.id,
          nodeName: node.data.label,
          progress: (i / executionOrder.length) * 100,
          status: 'failed',
          error: error.message,
          fullError: error.toString(),
          stack: error.stack,
          nodeIndex: i + 1,
          totalNodes: executionOrder.length,
          isNodeComplete: false,
          failed: true
        })
      }
      
      // SURGICAL: Save checkpoint and update DB with error details
      const checkpointData = {
        nodeId: node.id,
        nodeName: node.data.label,
        nodeIndex: i,
        nodeOutputs: pipelineData.nodeOutputs || {},
        lastNodeOutput: pipelineData.lastNodeOutput || null,
        structuralNodeOutputs: pipelineData.structuralNodeOutputs || {},
        userInput: pipelineData.userInput,
        executionUser: pipelineData.executionUser,
        executionOrder: executionOrder.map(n => ({ id: n.id, type: n.data.type })),
        completedNodes: executionOrder.slice(0, i).map(n => n.id),
        failedAtNode: node.id,
        timestamp: new Date().toISOString()
      }
      
      // Update execution status in DB with error
      try {
        const supabase = getSupabase()
        
        // Get current execution_data to preserve it
        const { data: currentExecData } = await supabase
          .from('engine_executions')
          .select('execution_data')
          .eq('id', workflowId)
          .single()
        
        const updatedExecutionData = {
          ...(currentExecData?.execution_data || {}),
          resumable: true,
          checkpointData: checkpointData,
          failedNodeId: node.id,
          failedNodeName: node.data.label,
          error: error.message,
          fullError: error.toString(),
          status: 'failed',
          nodeResults: pipelineData.nodeOutputs || {}
        }
        
        await supabase
          .from('engine_executions')
          .update({
            execution_data: updatedExecutionData,
            status: 'failed'
          })
          .eq('id', workflowId)
        
        console.log(`💾 Resume error saved to DB - failed at node: ${node.id}`, {
          error: error.message,
          checkpointNodeOutputs: Object.keys(checkpointData.nodeOutputs || {}).length
        })
      } catch (dbError) {
        console.error('❌ CRITICAL: Failed to save resume error to DB:', dbError)
        // Don't throw - we still want to return error to frontend
      }
      
      // SURGICAL: Return error result instead of throwing (so frontend can display it)
      return {
        success: false,
        status: 'failed',
        error: error.message,
        fullError: error.toString(),
        failedAtNode: node.id,
        failedNodeName: node.data.label,
        nodeIndex: i + 1,
        totalNodes: executionOrder.length,
        checkpointData: checkpointData
      }
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

