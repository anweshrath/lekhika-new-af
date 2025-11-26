/**
 * EXECUTION STATE MANAGER
 * 
 * Purpose: Centralize all execution state management logic extracted from workflowExecutionService.js
 * 
 * Location: workflow/state/executionStateManager.js
 * 
 * Responsibilities:
 * - Manage executionState Map (workflow lifecycle state)
 * - Manage checkpointStates Map (resume/restart checkpoints)
 * - Provide all state management operations (update, get, clear, stop, pause, resume)
 * - Handle database stop signal checks
 * - Manage pause/resume promises
 * 
 * Dependencies:
 * - getSupabase() for checkDatabaseStopSignal
 * 
 * Extracted from: workflowExecutionService.js (Phase 2)
 * Extraction date: 2025-11-20
 * 
 * Architecture:
 * - Singleton pattern: Single instance holds both Maps
 * - All methods operate on the shared Maps
 * - No class instance needed - pure module exports
 * 
 * Usage:
 *   const stateManager = require('./workflow/state/executionStateManager')
 *   stateManager.updateExecutionState(workflowId, updates)
 *   const state = stateManager.getExecutionState(workflowId)
 */

const { getSupabase } = require('../../supabase.js')

/**
 * Singleton state storage
 * These Maps are shared across all state operations
 */
const executionState = new Map()
const checkpointStates = new Map()

/**
 * Update execution state for a workflow
 * Extracted from: workflowExecutionService.js - updateExecutionState()
 */
function updateExecutionState(workflowId, updates) {
  const currentState = executionState.get(workflowId) || {}
  executionState.set(workflowId, { ...currentState, ...updates })
}

/**
 * Get execution state for a workflow
 * Extracted from: workflowExecutionService.js - getExecutionState()
 */
function getExecutionState(workflowId) {
  return executionState.get(workflowId)
}

/**
 * Clear execution state for a workflow
 * Extracted from: workflowExecutionService.js - clearExecutionState()
 */
function clearExecutionState(workflowId) {
  executionState.delete(workflowId)
}

/**
 * Stop workflow execution
 * Extracted from: workflowExecutionService.js - stopWorkflow()
 */
function stopWorkflow(workflowId) {
  const currentState = executionState.get(workflowId)
  if (currentState) {
    updateExecutionState(workflowId, {
      ...currentState,
      status: 'stopped',
      currentNode: null,
      stopped: true,
      stoppedAt: new Date(),
      forceStopped: true
    })
    
    if (currentState.pauseResolver) {
      currentState.pauseResolver()
      delete currentState.pauseResolver
    }

    console.log(`🛑 Workflow ${workflowId} force stopped by user`)
    return true
  }
  return false
}

/**
 * Check if workflow is stopped
 * Extracted from: workflowExecutionService.js - isWorkflowStopped()
 */
function isWorkflowStopped(workflowId) {
  const state = executionState.get(workflowId)
  return state?.status === 'stopped'
}

/**
 * Check if workflow is paused
 * Extracted from: workflowExecutionService.js - isWorkflowPaused()
 */
function isWorkflowPaused(workflowId) {
  const state = executionState.get(workflowId)
  return state?.status === 'paused'
}

/**
 * Pause workflow execution
 * Extracted from: workflowExecutionService.js - pauseWorkflow()
 */
function pauseWorkflow(workflowId) {
  const currentState = executionState.get(workflowId)
  if (currentState && currentState.status === 'executing') {
    updateExecutionState(workflowId, {
      ...currentState,
      status: 'paused',
      pausedAt: new Date()
    })
    console.log(`⏸️ Workflow ${workflowId} paused by user`)
    return true
  }
  return false
}

/**
 * Resume workflow execution
 * Extracted from: workflowExecutionService.js - resumeWorkflow()
 */
function resumeWorkflow(workflowId) {
  const currentState = executionState.get(workflowId)
  console.log(`🔄 Attempting to resume workflow ${workflowId}:`, currentState)
  
  if (currentState && currentState.status === 'paused') {
    const pauseResolver = currentState.pauseResolver
    console.log(`🔄 Found pauseResolver:`, !!pauseResolver)
    
    updateExecutionState(workflowId, {
      ...currentState,
      status: 'executing',
      resumedAt: new Date()
    })
    
    if (pauseResolver) {
      console.log(`▶️ Resolving pause promise for workflow ${workflowId}`)
      pauseResolver()
      console.log(`▶️ Pause promise resolved for workflow ${workflowId}`)
    } else {
      console.log(`⚠️ No pauseResolver found for workflow ${workflowId}`)
    }
    
    console.log(`▶️ Workflow ${workflowId} resumed by user`)
    return true
  }
  
  console.log(`❌ Cannot resume workflow ${workflowId}: status is ${currentState?.status || 'undefined'}`)
  return false
}

/**
 * Check database for stop signal
 * Extracted from: workflowExecutionService.js - checkDatabaseStopSignal()
 */
async function checkDatabaseStopSignal(workflowId) {
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('engine_executions')
      .select('status, execution_data')
      .eq('id', workflowId)
      .maybeSingle()

    if (error) {
      console.warn(`⚠️ checkDatabaseStopSignal: query failed for ${workflowId}:`, error.message)
      return false
    }

    if (!data) {
      return false
    }

    if (data.status === 'cancelled' || data.status === 'stopped') {
      console.log(`🛑 Database stop detected for ${workflowId} via status ${data.status}`)
      return true
    }

    const stopRequested =
      data.execution_data?.stopRequested ||
      data.execution_data?.forceStopped ||
      data.execution_data?.stopSignal ||
      false

    if (stopRequested) {
      console.log(`🛑 Database stop detected for ${workflowId} via execution_data flag`)
      return true
    }

    return false
  } catch (error) {
    console.warn(`⚠️ checkDatabaseStopSignal error for ${workflowId}:`, error.message)
    return false
  }
}

/**
 * Create checkpoint for resume functionality
 * Extracted from: workflowExecutionService.js - createCheckpoint()
 */
function createCheckpoint(workflowId, nodeId, state, pauseResolver) {
  const checkpointKey = `${workflowId}_${nodeId}`
  checkpointStates.set(checkpointKey, {
    nodeId,
    state: { ...state },
    pauseResolver,
    timestamp: new Date(),
    nodeOutput: state.nodeOutputs?.[nodeId]
  })
  console.log(`💾 Checkpoint created for node ${nodeId} in workflow ${workflowId}`)
}

/**
 * Get checkpoint for a workflow/node
 */
function getCheckpoint(workflowId, nodeId) {
  return checkpointStates.get(`${workflowId}_${nodeId}`)
}

/**
 * Wait for workflow resume (pause promise)
 * Extracted from: workflowExecutionService.js - waitForResume()
 */
async function waitForResume(workflowId) {
  console.log(`⏳ Creating pause promise for workflow ${workflowId}`)
  return new Promise((resolve) => {
    const currentState = executionState.get(workflowId)
    console.log(`⏳ Current state for workflow ${workflowId}:`, currentState)
    
    if (currentState) {
      currentState.pauseResolver = resolve
      updateExecutionState(workflowId, currentState)
      console.log(`⏳ Pause resolver stored for workflow ${workflowId}`)
      console.log(`⏳ Updated state:`, executionState.get(workflowId))
    } else {
      console.log(`⏳ No state found for workflow ${workflowId}, resolving immediately`)
      resolve()
    }
  })
}

/**
 * Retry a paused node
 * Extracted from: workflowExecutionService.js - retryNode()
 */
function retryNode(nodeId) {
  const currentState = executionState.get(nodeId)
  if (currentState && currentState.status === 'paused') {
    updateExecutionState(nodeId, {
      status: 'ready_for_retry',
      retryRequested: true,
      retryAt: new Date()
    })
    
    console.log(`🔄 Node ${nodeId} marked for retry`)
    return true
  }
  return false
}

/**
 * Get current paused workflow
 * Extracted from: workflowExecutionService.js - getCurrentPausedWorkflow()
 */
function getCurrentPausedWorkflow() {
  const pausedWorkflows = Array.from(executionState.entries())
    .filter(([id, state]) => state.status === 'paused')
  
  return pausedWorkflows.length > 0 ? pausedWorkflows[0] : null
}

/**
 * Check if any workflow is paused
 * Extracted from: workflowExecutionService.js - hasPausedWorkflow()
 */
function hasPausedWorkflow() {
  return Array.from(executionState.values())
    .some(state => state.status === 'paused')
}

/**
 * Get all execution states
 * Extracted from: workflowExecutionService.js - getAllExecutionStates()
 */
function getAllExecutionStates() {
  return Array.from(executionState.entries())
}

/**
 * Clear all executions (zombie killer)
 * Extracted from: workflowExecutionService.js - clearAllExecutions()
 */
function clearAllExecutions() {
  console.log('🧹 Clearing all zombie executions...')
  executionState.clear()
  checkpointStates.clear()
  console.log('✅ All executions cleared')
}

/**
 * Kill stuck executions older than 5 minutes
 * Extracted from: workflowExecutionService.js - killStuckExecutions()
 */
function killStuckExecutions() {
  const now = Date.now()
  const stuckThreshold = 5 * 60 * 1000 // 5 minutes
  
  for (const [workflowId, state] of executionState) {
    if (state.startedAt && (now - state.startedAt) > stuckThreshold) {
      console.log(`💀 Killing stuck execution: ${workflowId}`)
      executionState.delete(workflowId)
    }
  }
}

/**
 * Resume workflow from specific node
 * Extracted from: workflowExecutionService.js - resumeFromNode()
 */
function resumeFromNode(workflowId, nodeId) {
  const currentState = executionState.get(workflowId)
  console.log(`🔄 Attempting to resume workflow ${workflowId} from node ${nodeId}:`, currentState)
  
  if (currentState) {
    const checkpoint = checkpointStates.get(`${workflowId}_${nodeId}`)
    if (checkpoint) {
      console.log(`✅ Found checkpoint for node ${nodeId}, restoring state`)
      
      updateExecutionState(workflowId, {
        ...checkpoint.state,
        status: 'executing',
        resumedFromNode: nodeId,
        resumedAt: new Date()
      })
      
      console.log(`▶️ Workflow ${workflowId} resumed from node ${nodeId}`)
      console.log(`▶️ Restored state:`, executionState.get(workflowId))
      return true
    } else {
      console.log(`❌ No checkpoint found for node ${nodeId}`)
      console.log(`❌ Available checkpoints:`, Array.from(checkpointStates.keys()))
      return false
    }
  }
  
  console.log(`❌ Cannot resume workflow ${workflowId}: no state found`)
  return false
}

module.exports = {
  // State Maps (exposed for direct access if needed)
  executionState,
  checkpointStates,
  
  // State operations
  updateExecutionState,
  getExecutionState,
  clearExecutionState,
  
  // Workflow control
  stopWorkflow,
  isWorkflowStopped,
  isWorkflowPaused,
  pauseWorkflow,
  resumeWorkflow,
  resumeFromNode,
  
  // Checkpoint operations
  createCheckpoint,
  getCheckpoint,
  
  // Pause/resume
  waitForResume,
  retryNode,
  getCurrentPausedWorkflow,
  hasPausedWorkflow,
  
  // Database operations
  checkDatabaseStopSignal,
  
  // Utility operations
  getAllExecutionStates,
  clearAllExecutions,
  killStuckExecutions
}

