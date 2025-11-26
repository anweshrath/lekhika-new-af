/**
 * REAL Workflow Execution Service
 * Executes workflows with actual AI calls and data flow between nodes
 * NO MOCKUPS - REAL FUNCTIONALITY ONLY
 */

const { getSupabase } = require('./supabase.js')
const logger = require('../utils/logger')
const { narrativeStructureService } = require('./narrativeStructureService.js')
const { professionalBookFormatter } = require('./professionalBookFormatter.js')
const exportService = require('./exportService.js')
const { sampleAnalysisService } = require('./sampleAnalysisService.js')
const bookCompilationService = require('./BookCompilationService.js')
const aiResponseValidator = require('./aiResponseValidator.js')
const { getCelebrityStyle } = require('../config/celebrityStyles.js')
const {
  compileWorkflowContent: compileWorkflowContentHelper,
  sanitizeGeneratedContent,
  extractChapterStructure
} = require('./workflow/contentCompiler')
const { applyPermissions } = require('./workflow/permissionService')
const {
  processPromptVariables: processPromptVariablesHelper,
  generateChapterContext: generateChapterContextHelper
} = require('./workflow/promptService')
const { sanitizeUserInputForNextNode } = require('./workflow/inputSanitizer')
const sessionService = require('./workflow/sessionService')
const {
  preRunTest: preRunTestHelper,
  validateWorkflowStructure: validateWorkflowStructureHelper,
  testNodeConfiguration: testNodeConfigurationHelper,
  testAIConnectivity: testAIConnectivityHelper,
  testExportServices: testExportServicesHelper
} = require('./workflow/testService')
const {
  parseModelConfig: parseModelConfigHelper
} = require('./workflow/modelService')
const {
  debitTokens,
  getAIProviderInstance
} = require('./workflow/executionService')
const {
  executeImageGeneration: executeImageGenerationHandler
} = require('./workflow/handlers/imageGenerationHandler')
const {
  executeSingleAIGeneration: executeSingleAIGenerationHandler,
  generateMultipleChapters: generateMultipleChaptersHandler
} = require('./workflow/handlers/contentGenerationHandler')
const {
  executeContentRefinement: executeContentRefinementHandler
} = require('./workflow/handlers/contentRefinementHandler')
const {
  executePreviewNode: executePreviewNodeHandler
} = require('./workflow/handlers/previewHandler')
const {
  executeConditionNode: executeConditionNodeHandler
} = require('./workflow/handlers/conditionHandler')
const {
  executeOutputNode: executeOutputNodeHandler
} = require('./workflow/handlers/outputHandler')
const {
  routeProcessNode: routeProcessNodeHelper
} = require('./workflow/handlers/processNodeRouter')
const {
  executeInputNode: executeInputNodeHelper
} = require('./workflow/handlers/inputNodeHandler')
const {
  formatFinalOutput: formatFinalOutputHelper,
  generateDeliverables: generateDeliverablesHelper,
  getMimeType: getMimeTypeHelper
} = require('./workflow/helpers/outputHelpers')
const {
  deriveNodeTokenMetrics: deriveNodeTokenMetricsHelper,
  calculateTokenUsageFromOutputs: calculateTokenUsageFromOutputsHelper,
  buildTokenLedgerFromOutputs: buildTokenLedgerFromOutputsHelper,
  extractNumericValue: extractNumericValueHelper,
  getTokenUsageSummary: getTokenUsageSummaryHelper,
  getTokenLedger: getTokenLedgerHelper,
  recordNodeTokenUsage: recordNodeTokenUsageHelper
} = require('./workflow/helpers/tokenHelpers')
const {
  restartFromCheckpoint: restartFromCheckpointHelper,
  restartFailedNode: restartFailedNodeHelper,
  continueWorkflowFromNode: continueWorkflowFromNodeHelper,
  continueExecutionFromNode: continueExecutionFromNodeHelper
} = require('./workflow/helpers/resumeHelpers')
const {
  convertResultsToNodeOutputs: convertResultsToNodeOutputsHelper,
  extractChapterTitle: extractChapterTitleHelper
} = require('./workflow/helpers/contentHelpers')
const {
  validateInputFields: validateInputFieldsHelper,
  identifyMissingOptionals: identifyMissingOptionalsHelper,
  createNextNodeInstructions: createNextNodeInstructionsHelper,
  assessContentQuality: assessContentQualityHelper,
  canSkipNode: canSkipNodeHelper
} = require('./workflow/utils/workflowUtils')
const {
  evaluateCondition: evaluateConditionHelper,
  executeConditionAction: executeConditionActionHelper
} = require('./workflow/utils/conditionHelpers')
const {
  buildExecutionOrder: buildExecutionOrderHelper
} = require('./workflow/utils/executionOrderBuilder')
const {
  structureInputData: structureInputDataHelper,
  uploadFileToSupabase: uploadFileToSupabaseHelper
} = require('./workflow/utils/inputProcessor')
const {
  buildDependencyMaps: buildDependencyMapsHelper
} = require('./workflow/utils/dependencyBuilder')
const {
  isStructuralNode: isStructuralNodeHelper
} = require('./workflow/utils/nodeClassifier')
const {
  wireImagesToStoryContext: wireImagesToStoryContextHelper
} = require('./workflow/utils/imageWiring')
const {
  initializePipelineData: initializePipelineDataHelper
} = require('./workflow/utils/pipelineInitializer')
const {
  preserveStructuralNodeOutput: preserveStructuralNodeOutputHelper,
  rebuildStructuralNodeOutputs: rebuildStructuralNodeOutputsHelper
} = require('./workflow/utils/structuralNodePreserver')
const stateManager = require('./workflow/state/executionStateManager')

class WorkflowExecutionService {
  constructor() {
    // State Maps now managed by stateManager singleton
    // Access via: stateManager.executionState, stateManager.checkpointStates
    // REMOVED: this.currentSession - use sessionService directly (Phase 3)
    this.aiService = getAIProviderInstance()
  }
  
  // Expose state Maps for backward compatibility (delegate to stateManager)
  get executionState() {
    return stateManager.executionState
  }
  
  get checkpointStates() {
    return stateManager.checkpointStates
  }

  // REMOVED: getAIService() - delegate wrapper, removed in Phase 6
  // Use this.aiService directly or getAIProviderInstance() from executionService.js

  // REMOVED: evaluateCondition(), executeConditionAction() extracted to workflow/utils/conditionHelpers.js (Phase 8)
  // Use evaluateConditionHelper(), executeConditionActionHelper() from workflow/utils/conditionHelpers.js

  // REMOVED: Session management wrapper methods (Phase 3)
  // - checkForExistingSession() → use sessionService.checkForExistingSession() directly
  // - startNewSession() → use sessionService.startNewSession() directly
  // - resumeSession() → use sessionService.resumeSession() directly
  // - updateSession() → use sessionService.updateSession() directly
  // - completeSession() → use sessionService.stopSession() directly
  // - handleExecutionError() → use sessionService.updateSession() directly for error handling

  // REMOVED: Test method wrappers (Phase 4)
  // - preRunTest() → use preRunTestHelper() from workflow/testService.js directly
  // - testNodeConfiguration() → use testNodeConfigurationHelper() from workflow/testService.js directly
  // - testAIConnectivity() → use testAIConnectivityHelper() from workflow/testService.js directly
  // - testExportServices() → use testExportServicesHelper() from workflow/testService.js directly
  // - validateWorkflowStructure() → use validateWorkflowStructureHelper() from workflow/testService.js directly

  /**
   * Execute a complete workflow with real AI calls and data flow
   * @param {Array} nodes - Workflow nodes
   * @param {Array} edges - Workflow edges  
   * @param {Object} initialInput - User input from Lekhika root app
   * @param {string} workflowId - Unique workflow execution ID
   * @param {Function} progressCallback - Progress update callback
   * @returns {Object} Final workflow output
   */
  async executeWorkflow(nodes, edges, initialInput, workflowId, progressCallback = null, executionUser = null) {
    const startTime = Date.now() // DEFINE START TIME FOR EXECUTION TRACKING
    
    try {
      // SURGICAL: Validate execution user context (needed for provider keys, limits, analytics)
      if (!executionUser || !executionUser.id) {
        logger.error(`❌ Execution user validation failed:`, { 
          executionUser, 
          hasId: executionUser?.id,
          workflowId 
        })
        throw new Error('Execution user context required for workflow execution - user_id is missing')
      }
      
      logger.info(`✅ Execution user validated:`, { id: executionUser.id, role: executionUser.role, tier: executionUser.tier })

      // Initialize execution state
      stateManager.executionState.set(workflowId, {
        status: 'running',
        currentNode: null,
        results: {},
        errors: [],
        startTime: new Date(),
        progress: 0,
        tokenUsage: {
          totalTokens: 0,
          totalCost: 0,
          totalWords: 0
        },
        tokenLedger: []
      })

      // Build execution order based on edges
      const executionOrder = buildExecutionOrderHelper(nodes, edges)
      
      // Build dependency maps for validation during execution
      const { incomingEdges, outgoingEdges } = buildDependencyMapsHelper(nodes, edges)
      
      // SURGICAL: Log executionUser before initializing pipeline
      logger.info(`🔍 workflowExecutionService.executeWorkflow - executionUser:`, { 
        hasExecutionUser: !!executionUser, 
        id: executionUser?.id, 
        role: executionUser?.role,
        tier: executionUser?.tier 
      });
      
      // Initialize data pipeline with user input
      let pipelineData = initializePipelineDataHelper(initialInput, workflowId, executionUser, executionOrder)
      
      // SURGICAL: Inject regenerateContext into pipelineData so content generation handlers can access user guidance
      if (regenerateContext) {
        pipelineData.regenerateContext = regenerateContext
        logger.info(`✅ Injected regenerateContext into pipelineData for failed node retry`)
      }
      
      // SURGICAL: Verify executionUser is in pipelineData
      if (!pipelineData.executionUser || !pipelineData.executionUser.id) {
        logger.error(`❌ CRITICAL: pipelineData.executionUser is missing after initialization!`, {
          hasExecutionUser: !!pipelineData.executionUser,
          pipelineDataKeys: Object.keys(pipelineData)
        });
        throw new Error('Execution user context lost during pipeline initialization');
      }

      console.log('🔍 WORKFLOW EXECUTION DEBUG:')
      console.log('  - Initial input:', initialInput)
      console.log('  - Execution order:', executionOrder.map(n => `${n.id} (${n.type}) - ${n.data.label}`))
      console.log('  - Total nodes to execute:', executionOrder.length)
      console.log('  - Initial pipeline data:', pipelineData)

      // Initialize execution with starting progress
      stateManager.updateExecutionState(workflowId, {
        currentNode: 'Initializing...',
        progress: 5,
        baseProgress: 5,
        nodeIndex: -1,
        totalNodes: executionOrder.length,
        status: 'running'
      })
      
      if (progressCallback) {
        progressCallback({
          nodeId: 'initializing',
          nodeName: 'Initializing...',
          progress: 5,
          status: 'running',
          providerName: null,
          baseProgress: 5,
          nodeIndex: -1,
          totalNodes: executionOrder.length
        })
      }

      // Execute nodes in sequence - CRITICAL: ENSURE PROPER ORDER
      console.log('🔍 EXECUTION ORDER DEBUG:')
      console.log('  - Total nodes:', executionOrder.length)
      console.log('  - Execution sequence:', executionOrder.map((n, i) => `${i + 1}. ${n.data.label || n.id} (${n.data.type})`).join(', '))
      
      for (let i = 0; i < executionOrder.length; i++) {
        // Check if workflow was paused - wait until resumed
        if (stateManager.isWorkflowPaused(workflowId)) {
          console.log(`⏸️ Workflow ${workflowId} is paused, waiting for resume...`)
          // Wait indefinitely until resumed - use Promise that resolves only on resume
          await stateManager.waitForResume(workflowId)
        }

        // Check if workflow was resumed from a specific checkpoint
        const currentState = stateManager.getExecutionState(workflowId)
        if (currentState?.resumedFromNode) {
          console.log(`🔄 Workflow resumed from node: ${currentState.resumedFromNode}`)
          // Skip to the node after the resumed checkpoint
          const resumedNodeIndex = executionOrder.findIndex(node => node.id === currentState.resumedFromNode)
          if (resumedNodeIndex !== -1 && resumedNodeIndex > i) {
            console.log(`⏭️ Skipping to node ${resumedNodeIndex + 1} (resumed from ${currentState.resumedFromNode})`)
            i = resumedNodeIndex // Skip to the resumed node
            // Clear the resumedFromNode flag
            stateManager.updateExecutionState(workflowId, { resumedFromNode: null })
          }
        }

        // Check if workflow was stopped - ENHANCED CHECK
        if (stateManager.isWorkflowStopped(workflowId) || await stateManager.checkDatabaseStopSignal(workflowId)) {
          console.log(`🛑 Workflow ${workflowId} stopped during execution`)
          
          // IMMEDIATELY clear all processing states
          stateManager.updateExecutionState(workflowId, {
            status: 'stopped',
            currentNode: null,
            forceStopped: true
          })
          
          // Force all nodes to stopped state - NO LINGERING "Processing"
          if (progressCallback) {
            progressCallback({
              nodeId: null,
              nodeName: 'System',
              progress: 0,
              status: 'stopped',
              message: 'Workflow killed by user - all processing stopped',
              forceStopped: true
            })
          }
          
          // COLLECT ALL PARTIAL RESULTS - DON'T LOSE GENERATED CONTENT
          const currentState = stateManager.getExecutionState(workflowId)
          const partialResults = currentState?.results || {}
          const allNodeOutputs = pipelineData.nodeOutputs || {}
          
          console.log('📦 Collecting partial results:', {
            partialResults,
            allNodeOutputs,
            nodeCount: Object.keys(allNodeOutputs).length
          })
          
          const tokenUsage = getTokenUsageSummaryHelper(stateManager, workflowId, pipelineData.nodeOutputs)
          const tokenLedger = getTokenLedgerHelper(stateManager, workflowId, pipelineData.nodeOutputs)

          return {
            success: false,
            error: 'Workflow stopped by user',
            results: partialResults,
            partialOutputs: allNodeOutputs,
            pipelineData: pipelineData,
            stopped: true,
            forceStopped: true,
            message: 'Workflow killed by user. All processing stopped immediately.',
            tokenUsage,
            tokenLedger,
            totalTokensUsed: tokenUsage.totalTokens,
            totalCostIncurred: tokenUsage.totalCost,
            totalWordsGenerated: tokenUsage.totalWords
          }
        }

        const node = executionOrder[i]
        
        // DYNAMIC PROGRESS CALCULATION - NO HARDCODING
        // Base progress on node position, but allow individual nodes to override
        // Calculate progress based on node position with granular updates
        const nodeStartProgress = (i / executionOrder.length) * 100
        const nodeEndProgress = ((i + 1) / executionOrder.length) * 100
        const progress = nodeStartProgress + 5 // Start with some progress for current node
        const baseProgress = progress
        const nodeProgress = progress
        
        stateManager.updateExecutionState(workflowId, {
          currentNode: node.id,
          progress: nodeProgress,
          baseProgress: baseProgress,
          nodeIndex: i,
          totalNodes: executionOrder.length
        })
        
        if (progressCallback) {
          progressCallback({
            nodeId: node.id,
            nodeName: node.data.label,
            progress: nodeProgress,
            status: 'executing',
            providerName: null, // Will be updated when AI call starts
            baseProgress: baseProgress,
            nodeIndex: i,
            totalNodes: executionOrder.length,
            // CRITICAL: Send completed nodeOutputs so frontend can mark steps as done
            nodeResults: pipelineData.nodeOutputs || {}
          })
        }

        try {
          console.log(`🔍 EXECUTING NODE ${i + 1}/${executionOrder.length}: ${node.id} (${node.data.label || node.data.type})`)
          console.log('  - Node type:', node.data.type)
          console.log('  - Node dependencies:', incomingEdges?.get(node.id) || 'none')
          console.log('  - Pipeline data before execution:', Object.keys(pipelineData.nodeOutputs || {}))
          
          // CRITICAL: Ensure this node should execute now
          const dependencies = incomingEdges?.get(node.id) || []
          const unmetDependencies = dependencies.filter(depId => !pipelineData.nodeOutputs[depId])
          if (unmetDependencies.length > 0) {
            console.error(`❌ EXECUTION ORDER ERROR: Node ${node.id} has unmet dependencies:`, unmetDependencies)
            throw new Error(`Execution order violation: Node ${node.id} cannot execute before dependencies: ${unmetDependencies.join(', ')}`)
          }
          
          // Execute individual node with pipeline data
          const nodeOutput = await this.executeNode(node, pipelineData, workflowId, progressCallback)
          
          console.log('  - Node output:', nodeOutput)
          
          // Add node output to pipeline with execution order tracking
          const decoratedNodeOutput = {
            ...nodeOutput,
            sequenceNumber: i + 1, // Track execution order for proper display
            executionIndex: i,
            totalNodes: executionOrder.length,
            nodeName: node.data.label || node.data.type || node.id, // ENSURE NODE NAME IS PRESERVED
            nodeType: node.data.type,
            executedAt: new Date().toISOString()
          }
          pipelineData.nodeOutputs[node.id] = decoratedNodeOutput

          recordNodeTokenUsageHelper(
            stateManager,
            workflowId,
            {
              nodeId: node.id,
              nodeName: node.data.label || node.id,
              nodeType: node.data.type
            },
            decoratedNodeOutput
          )
          
          console.log(`✅ NODE COMPLETED: ${node.id} (sequence ${i + 1}/${executionOrder.length})`)
          console.log('  - Output type:', nodeOutput.type)
          console.log('  - Content length:', typeof nodeOutput.content === 'string' ? nodeOutput.content.length : 'N/A')
          console.log('  - Pipeline now has:', Object.keys(pipelineData.nodeOutputs).length, 'completed nodes')
          
          // SURGICAL FIX: Preserve structural node outputs separately
          // Structural nodes (Story Architect, etc.) must reach Content Writer even if intermediate nodes exist
          preserveStructuralNodeOutputHelper(node, nodeOutput, pipelineData)
          
          // SURGICAL FIX: Only update lastNodeOutput if node produced actual content
          // Skip gates/routing nodes that don't have content - they shouldn't overwrite Content Writer's output
          const hasActualContent = nodeOutput.content && 
                                   (typeof nodeOutput.content === 'string' || 
                                    nodeOutput.allChapters || 
                                    nodeOutput.chapters ||
                                    nodeOutput.type === 'ai_generation')
          const isGateOrRouting = nodeOutput.type === 'routing' || nodeOutput.type === 'condition_result'
          
          if (hasActualContent && !isGateOrRouting) {
            pipelineData.lastNodeOutput = nodeOutput
            console.log(`✅ UPDATED lastNodeOutput to ${node.id} (has content)`)
          } else {
            console.log(`⏭️ SKIPPING lastNodeOutput update for ${node.id} (${nodeOutput.type}) - no content or is routing node`)
          }
          
          console.log('  - Pipeline data after execution:', pipelineData)
          
          // Update execution state
          const updatedState = {
            [`results.${node.id}`]: nodeOutput,
            nodeOutputs: pipelineData.nodeOutputs,
            structuralNodeOutputs: pipelineData.structuralNodeOutputs, // SURGICAL: Preserve structural outputs in checkpoint
            currentNodeIndex: i,
            completedNodes: executionOrder.slice(0, i + 1).map(n => n.id)
          }
          stateManager.updateExecutionState(workflowId, updatedState)

          // CREATE CHECKPOINT AFTER NODE COMPLETION
          stateManager.createCheckpoint(workflowId, node.id, {
            ...stateManager.executionState.get(workflowId),
            ...updatedState
          })

          // PROPER COMPLETION PROGRESS - DYNAMIC CALCULATION
          const completionProgress = ((i + 1) / executionOrder.length) * 100
          
          if (progressCallback) {
            progressCallback({
              nodeId: node.id,
              nodeName: node.data.label,
              progress: completionProgress, // DYNAMIC: Shows actual completion
              status: 'completed',
              output: nodeOutput,
              nodeIndex: i + 1,
              totalNodes: executionOrder.length,
              isNodeComplete: true,
              checkpointCreated: true, // Indicate checkpoint was created
              // CRITICAL: Send updated nodeOutputs after this node completes
              nodeResults: pipelineData.nodeOutputs || {}
            })
          }

        } catch (error) {
          const nodeError = {
            nodeId: node.id,
            nodeName: node.data.label,
            error: error.message,
            timestamp: new Date()
          }
          
          // CRITICAL: Save checkpoint data to DB for resume functionality (single DB write on failure)
          const currentState = stateManager.getExecutionState(workflowId)
          
          // Find last completed node's output for resume
          let lastCompletedOutput = null
          if (i > 0 && pipelineData.nodeOutputs) {
            const lastCompletedNodeId = executionOrder[i - 1]?.id
            if (lastCompletedNodeId && pipelineData.nodeOutputs[lastCompletedNodeId]) {
              lastCompletedOutput = pipelineData.nodeOutputs[lastCompletedNodeId]
            }
          }
          
          const checkpointData = {
            nodeId: node.id,
            nodeName: node.data.label,
            nodeIndex: i,
            nodeOutputs: pipelineData.nodeOutputs || {},
            lastNodeOutput: lastCompletedOutput, // SURGICAL: Include last completed node output for resume
            structuralNodeOutputs: pipelineData.structuralNodeOutputs || {}, // SURGICAL: Preserve structural outputs in checkpoint
            userInput: pipelineData.userInput,
            executionUser: pipelineData.executionUser, // SURGICAL: Include executionUser for resume
            executionOrder: executionOrder.map(n => ({ id: n.id, type: n.data.type })),
            completedNodes: executionOrder.slice(0, i).map(n => n.id),
            failedAtNode: node.id,
            timestamp: new Date().toISOString()
          }
          
          // Save checkpoint to database - CRITICAL: Preserve existing execution_data
          try {
            const supabase = getSupabase()
            
            // First, get current execution_data to preserve it
            const { data: currentExecData } = await supabase
              .from('engine_executions')
              .select('execution_data')
              .eq('id', workflowId)
              .single()
            
            // Merge checkpoint data with existing execution_data
            const updatedExecutionData = {
              ...(currentExecData?.execution_data || {}),
              ...(currentState?.executionData || {}),
              resumable: true,
              checkpointData: checkpointData, // CRITICAL: This must be preserved
              failedNodeId: node.id,
              failedNodeName: node.data.label,
              error: error.message,
              status: 'failed',
              nodeResults: pipelineData.nodeOutputs || {},
              // Ensure checkpointData is always at top level for easy access
              checkpointData: checkpointData
            }
            
            const { error: updateError } = await supabase
              .from('engine_executions')
              .update({
                execution_data: updatedExecutionData,
                status: 'failed' // Also update status column
              })
              .eq('id', workflowId)
            
            if (updateError) {
              console.error('❌ Failed to save checkpoint to DB:', updateError)
              throw updateError // Don't fail silently - this is critical
            }
            
            console.log(`💾 Checkpoint saved to DB for resume - failed at node: ${node.id}`, {
              checkpointNodeOutputs: Object.keys(checkpointData.nodeOutputs || {}).length,
              completedNodes: checkpointData.completedNodes?.length || 0
            })
          } catch (dbError) {
            console.error('❌ CRITICAL: Failed to save checkpoint to DB:', dbError)
            // Still save to in-memory state as backup
            stateManager.updateExecutionState(workflowId, {
              checkpointData: checkpointData,
              checkpointSaveFailed: true,
              checkpointSaveError: dbError.message
            })
            throw new Error(`Failed to save checkpoint: ${dbError.message}. Checkpoint saved to memory only.`)
          }
          
          // PAUSE on failure instead of stopping - allow user to fix and resume
          stateManager.updateExecutionState(workflowId, {
            status: 'paused',
            failedNodeId: node.id,
            failedNodeName: node.data.label,
            pauseReason: 'node_failure',
            resumable: true,
            checkpointData: checkpointData,
            [`errors`]: [...(stateManager.executionState.get(workflowId)?.errors || []), nodeError]
          })

          if (progressCallback) {
            progressCallback({
              nodeId: node.id,
              nodeName: node.data.label,
              progress,
              status: 'failed',
              error: error.message,
              pauseReason: 'node_failure',
              resumable: true,
              message: `Node failed - workflow can be resumed from previous node.`,
              // Send nodeOutputs even on failure for partial results
              nodeResults: pipelineData.nodeOutputs || {}
            })
          }

          console.log(`⏸️ Workflow ${workflowId} paused due to node failure: ${node.data.label}`)
          
          // Wait for user to fix the issue and resume
          await stateManager.waitForResume(workflowId)
          
          // After resume, retry the failed node or continue
          console.log(`▶️ Workflow ${workflowId} resumed after node failure fix`)
          
          // Retry the current node after resume
          i-- // Decrement to retry the same node
          continue
        }
      }

      // Mark execution as completed
      stateManager.updateExecutionState(workflowId, {
        status: 'completed',
        endTime: new Date(),
        progress: 100
      })

      // ENSURE FINAL 100% COMPLETION CALLBACK
      if (progressCallback) {
        progressCallback({
          status: 'completed',
          progress: 100, // GUARANTEED 100% completion
          message: 'Workflow execution completed successfully',
          nodeId: 'workflow-complete',
          nodeName: 'Workflow Complete',
          output: {
            success: true,
            results: pipelineData.nodeOutputs,
            lastNodeOutput: pipelineData.lastNodeOutput,
            nodeOutputs: pipelineData.nodeOutputs, // For deliverables access
            metadata: {
              totalNodes: executionOrder.length,
              executionTime: Date.now() - startTime,
              workflowId,
              completedNodes: executionOrder.length,
              successRate: 100
            }
          }
        })
      }

      const finalTokenUsage = getTokenUsageSummaryHelper(stateManager, workflowId, pipelineData.nodeOutputs)
      const finalTokenLedger = getTokenLedgerHelper(stateManager, workflowId, pipelineData.nodeOutputs)

      pipelineData.tokenUsage = finalTokenUsage
      pipelineData.tokenLedger = finalTokenLedger
      pipelineData.totalTokensUsed = finalTokenUsage.totalTokens
      pipelineData.totalCostIncurred = finalTokenUsage.totalCost
      pipelineData.totalWordsGenerated = finalTokenUsage.totalWords

      return pipelineData

    } catch (error) {
      // Save final error state with checkpoint data for resume
      const currentState = stateManager.getExecutionState(workflowId)
      if (currentState?.nodeOutputs) {
        try {
          const supabase = getSupabase()
          await supabase
            .from('engine_executions')
            .update({
              execution_data: {
                ...(currentState?.executionData || {}),
                resumable: true,
                checkpointData: {
                  nodeOutputs: currentState.nodeOutputs,
                  userInput: currentState.userInput,
                  completedNodes: currentState.completedNodes || [],
                  failedAtNode: currentState.failedNodeId || 'unknown',
                  timestamp: new Date().toISOString()
                },
                error: error.message,
                status: 'failed'
              }
            })
            .eq('id', workflowId)
          console.log(`💾 Final checkpoint saved to DB for resume`)
        } catch (dbError) {
          console.error('❌ Failed to save final checkpoint:', dbError)
        }
      }
      
      stateManager.updateExecutionState(workflowId, {
        status: 'error',
        endTime: new Date(),
        finalError: error.message
      })
      throw error
    }
  }

  /**
   * Resume execution from a failed checkpoint
   * @param {string} executionId - Execution ID to resume
   * @param {Array} nodes - Workflow nodes
   * @param {Array} edges - Workflow edges
   * @param {Function} progressCallback - Progress callback
   * @returns {Object} Execution result
   */
  async resumeExecution(executionId, nodes, edges, progressCallback = null, regenerateContext = null) {
    try {
      console.log(`🔄 Resuming execution: ${executionId}`)
      if (regenerateContext?.manualInstruction) {
        logger.info(`📝 User guidance provided for resume:`, regenerateContext.manualInstruction.substring(0, 100))
      }
      
      // Load checkpoint & user context from database (used by both in-memory + DB fallback)
      const supabase = getSupabase()
      const { data: executionData, error } = await supabase
        .from('engine_executions')
        .select('execution_data, input_data, status, user_id')
        .eq('id', executionId)
        .single()
      
      if (error) {
        throw new Error(`Failed to load execution data: ${error.message}`)
      }
      
      // Build execution user context from persisted execution row
      if (!executionData.user_id) {
        throw new Error(`Cannot resume execution ${executionId}: user_id is missing from execution record. This execution cannot be resumed.`)
      }
      
      const executionUser = {
        id: executionData.user_id,
        role: 'user',
        tier: executionData.execution_data?.options?.tier || 'hobby'
      }
      
      // FALLBACK 0: Check in-memory execution state first (if worker didn't restart)
      const inMemoryState = stateManager.getExecutionState(executionId)
      if (inMemoryState?.checkpointData?.nodeOutputs) {
        console.log(`✅ Found checkpoint data in memory`)
        const checkpointData = inMemoryState.checkpointData
        const pipelineData = {
          userInput: checkpointData.userInput || inMemoryState.userInput || {},
          nodeOutputs: checkpointData.nodeOutputs || {},
          lastNodeOutput: null,
          structuralNodeOutputs: checkpointData.structuralNodeOutputs || {}, // SURGICAL: Preserve structural outputs on resume
          executionUser: executionUser || null,
          regenerateContext: regenerateContext // SURGICAL: Include user guidance for failed node retry
        }
        
        const completedNodeIds = checkpointData.completedNodes || Object.keys(pipelineData.nodeOutputs)
        if (completedNodeIds.length > 0) {
          const lastCompletedNodeId = completedNodeIds[completedNodeIds.length - 1]
          pipelineData.lastNodeOutput = checkpointData.nodeOutputs[lastCompletedNodeId] || null
        }
        
        // SURGICAL: Rebuild structuralNodeOutputs from nodeOutputs if not in checkpoint
        rebuildStructuralNodeOutputsHelper(pipelineData)
        
        // Use the canonical execution-order helper (same as main execute path)
        const executionOrder = buildExecutionOrderHelper(nodes, edges)
        let resumeIndex = 0
        if (checkpointData.failedAtNode) {
          // SURGICAL: Resume FROM the failed node, not before it
          const failedNodeIndex = executionOrder.findIndex(n => n.id === checkpointData.failedAtNode)
          if (failedNodeIndex >= 0) {
            resumeIndex = failedNodeIndex // Resume FROM the failed node
            logger.info(`🔄 Resuming FROM failed node ${checkpointData.failedAtNode} at index ${resumeIndex}`)
          } else {
            logger.warn(`⚠️ Failed node ${checkpointData.failedAtNode} not found in execution order, starting from beginning`)
            resumeIndex = 0
          }
        } else if (completedNodeIds.length > 0) {
          const lastCompletedId = completedNodeIds[completedNodeIds.length - 1]
          resumeIndex = executionOrder.findIndex(n => n.id === lastCompletedId)
          if (resumeIndex === -1) resumeIndex = 0
          // Resume from the node AFTER the last completed one
          if (resumeIndex < executionOrder.length - 1) {
            resumeIndex = resumeIndex + 1
          }
        }
        
        stateManager.updateExecutionState(executionId, {
          status: 'running',
          nodeOutputs: pipelineData.nodeOutputs,
          resumed: true,
          resumedFromNode: executionOrder[resumeIndex]?.id || null
        })
        
        const resumeResult = await continueExecutionFromNodeHelper(
          executionId,
          nodes,
          edges,
          pipelineData.userInput,
          progressCallback,
          executionUser || null,
          resumeIndex,
          pipelineData.nodeOutputs,
          buildExecutionOrderHelper,
          this.executeNode.bind(this),
          regenerateContext // SURGICAL: Pass user guidance for failed node retry
        )
        
        // SURGICAL: Handle error result from resume (don't throw - return it so frontend can display)
        if (resumeResult && resumeResult.success === false) {
          console.error(`❌ Resume failed at node: ${resumeResult.failedAtNode}`, resumeResult.error)
          return resumeResult
        }
        
        return resumeResult
      }
      
      // Log what we actually have in execution_data for debugging
      console.log(`📊 Execution data structure:`, {
        hasExecutionData: !!executionData.execution_data,
        hasCheckpointData: !!executionData.execution_data?.checkpointData,
        hasNodeResults: !!executionData.execution_data?.nodeResults,
        executionDataKeys: executionData.execution_data ? Object.keys(executionData.execution_data) : []
      })
      
      let checkpointData = executionData.execution_data?.checkpointData
      if (!checkpointData || !checkpointData.nodeOutputs) {
        // SURGICAL FALLBACK: Rebuild checkpoint data from nodeResults when explicit
        // checkpointData is missing but we still have real node outputs persisted.
        const nodeResults = executionData.execution_data?.nodeResults
        if (nodeResults && Object.keys(nodeResults).length > 0) {
          console.warn('⚠️ No checkpointData found in execution_data – rebuilding fallback checkpoint from nodeResults for resume.')
          checkpointData = {
            nodeId: executionData.execution_data.failedNodeId || null,
            nodeName: executionData.execution_data.failedNodeName || null,
            nodeIndex: null,
            nodeOutputs: nodeResults,
            userInput: executionData.input_data || {},
            executionOrder: [],
            completedNodes: Object.keys(nodeResults),
            failedAtNode: executionData.execution_data.failedNodeId || null,
            structuralNodeOutputs: executionData.execution_data.structuralNodeOutputs || {},
            timestamp: new Date().toISOString()
          }
        } else {
          throw new Error('No checkpoint data found - cannot resume')
        }
      }
      
      console.log(`📦 Loaded checkpoint:`, {
        completedNodes: checkpointData.completedNodes?.length || 0,
        failedAt: checkpointData.failedAtNode
      })
      
      // Reconstruct pipeline data from checkpoint
      const pipelineData = {
        userInput: checkpointData.userInput || executionData.input_data || {},
        nodeOutputs: checkpointData.nodeOutputs || {},
        lastNodeOutput: null,
        structuralNodeOutputs: checkpointData.structuralNodeOutputs || {}, // SURGICAL: Preserve structural outputs on resume
        executionUser: executionUser || null,
        regenerateContext: regenerateContext // SURGICAL: Include user guidance for failed node retry
      }
      
      // Get the last completed node output
      const completedNodeIds = checkpointData.completedNodes || []
      if (completedNodeIds.length > 0) {
        const lastCompletedNodeId = completedNodeIds[completedNodeIds.length - 1]
        pipelineData.lastNodeOutput = checkpointData.nodeOutputs[lastCompletedNodeId] || null
      }
      
      // SURGICAL: Rebuild structuralNodeOutputs from nodeOutputs if not in checkpoint
      if (Object.keys(pipelineData.structuralNodeOutputs).length === 0 && pipelineData.nodeOutputs) {
        Object.entries(pipelineData.nodeOutputs).forEach(([nodeId, nodeOutput]) => {
          const isStructural = nodeOutput.metadata?.permissions?.canEditStructure === true ||
                             /structural|structure|narrative.*architect|story.*architect/i.test(nodeOutput.metadata?.nodeName || '')
          if (isStructural && nodeOutput.content) {
            pipelineData.structuralNodeOutputs[nodeId] = nodeOutput
          }
        })
      }
      
      // Calculate execution order using the canonical helper (same as main execute path)
      const executionOrder = buildExecutionOrderHelper(nodes, edges)
      
      // Find the index to resume from (one step back from failed node)
      let resumeIndex = 0
      if (checkpointData.failedAtNode) {
        const failedNodeIndex = executionOrder.findIndex(n => n.id === checkpointData.failedAtNode)
        if (failedNodeIndex > 0) {
          resumeIndex = failedNodeIndex - 1 // Resume from previous node
          console.log(`⏮️ Resuming from node index ${resumeIndex} (one before failed node ${failedNodeIndex})`)
        } else if (failedNodeIndex === 0) {
          resumeIndex = 0 // Start from beginning if first node failed
        }
      } else {
        // No failed node specified - resume from last completed node
        if (completedNodeIds.length > 0) {
          const lastCompletedId = completedNodeIds[completedNodeIds.length - 1]
          resumeIndex = executionOrder.findIndex(n => n.id === lastCompletedId)
          if (resumeIndex === -1) resumeIndex = 0
        }
      }
      
      // Update execution state
      stateManager.updateExecutionState(executionId, {
        status: 'running',
        nodeOutputs: pipelineData.nodeOutputs,
        resumed: true,
        resumedFromNode: executionOrder[resumeIndex]?.id || null
      })
      
      // Continue execution from resume point
      const resumeResult = await continueExecutionFromNodeHelper(
        executionId,
        nodes,
        edges,
        pipelineData.userInput,
        progressCallback,
        executionUser, // SURGICAL: executionUser is already validated above, don't use || null
        resumeIndex,
        pipelineData.nodeOutputs,
        buildExecutionOrderHelper,
        this.executeNode.bind(this)
      )
      
      // SURGICAL: Handle error result from resume (don't throw - return it so frontend can display)
      if (resumeResult && resumeResult.success === false) {
        console.error(`❌ Resume failed at node: ${resumeResult.failedAtNode}`, resumeResult.error)
        // Don't throw - return error result so frontend can display it properly
        return resumeResult
      }
      
      // SURGICAL: After successful resume, delete checkpoint from DB (CRUD it out)
      // Checkpoint is only needed for resume - once execution continues, we don't need it
      if (resumeResult && resumeResult.success !== false) {
        try {
          const supabase = getSupabase()
          const { data: currentExecData } = await supabase
            .from('engine_executions')
            .select('execution_data')
            .eq('id', executionId)
            .single()
          
          if (currentExecData?.execution_data?.checkpointData) {
            const updatedExecutionData = { ...currentExecData.execution_data }
            delete updatedExecutionData.checkpointData // CRUD it out
            
            await supabase
              .from('engine_executions')
              .update({ execution_data: updatedExecutionData })
              .eq('id', executionId)
            
            console.log(`🗑️ Deleted checkpoint from DB after successful resume for ${executionId}`)
          }
        } catch (cleanupError) {
          // Don't fail resume if cleanup fails - just log it
          console.warn(`⚠️ Failed to cleanup checkpoint after resume:`, cleanupError.message)
        }
      }
      
      return resumeResult
      
    } catch (error) {
      console.error('❌ Resume failed with exception:', error)
      // SURGICAL: Return error result instead of throwing (so frontend can display it)
      return {
        success: false,
        status: 'failed',
        error: error.message,
        fullError: error.toString(),
        stack: error.stack
      }
    }
  }

  // REMOVED: canSkipNode() extracted to workflow/utils/workflowUtils.js (Phase 7)
  // Use canSkipNodeHelper() from workflow/utils/workflowUtils.js

  /**
   * Execute a single node with real AI processing
   * @param {Object} node - Node to execute
   * @param {Object} pipelineData - Current pipeline data
   * @param {string} workflowId - Workflow execution ID
   * @returns {Object} Node output
   */
  async executeNode(node, pipelineData, workflowId, progressCallback = null) {
    console.log(`🔍 EXECUTING NODE: ${node.id} (${node.type}) - ${node.data.label}`)
    console.log(`  - Pipeline data keys:`, Object.keys(pipelineData))
    console.log(`  - Last node output:`, pipelineData.lastNodeOutput ? 'EXISTS' : 'NONE')
    
    // Check if this node can be skipped for optimization
    const skipCheck = canSkipNodeHelper(node, pipelineData, workflowId, assessContentQualityHelper)
    console.log(`  - Skip check result:`, skipCheck)
    
    if (skipCheck.skip) {
      console.log(`⏭️ SKIPPING NODE ${node.id} (${node.type}): ${skipCheck.reason}`)
      return {
        success: true,
        output: {
          content: pipelineData.lastNodeOutput?.content || '',
          skipped: true,
          skipReason: skipCheck.reason,
          ...skipCheck
        },
        metadata: {
          nodeType: node.type,
          processingTime: 0,
          skipped: true,
          skipReason: skipCheck.reason
        }
      }
    }
    const { type, data } = node
    
    switch (type) {
      case 'input':
        return await this.executeInputNode(data, pipelineData)
      
      case 'process':
        {
          const result = await this.executeProcessNode(data, pipelineData, progressCallback, workflowId)
          // If this process produced images, wire them into storyContext for live display
          wireImagesToStoryContextHelper(result, pipelineData, progressCallback, data)
          return result
        }
      
      case 'preview':
        return await this.executePreviewNode(data, pipelineData, progressCallback)
      
      case 'condition':
        return await this.executeConditionNode(data, pipelineData)
      
      case 'output':
        return await this.executeOutputNode(data, pipelineData)
      
      default:
        throw new Error(`Unknown node type: ${type}`)
    }
  }

  /**
   * Execute input node - validate and structure user input
   * EXTRACTED: Logic moved to workflow/handlers/inputNodeHandler.js
   */
  async executeInputNode(nodeData, pipelineData) {
    return executeInputNodeHelper(nodeData, pipelineData)
  }

  /**
   * Execute process node - call AI with real API requests
   * DYNAMIC MULTI-CHAPTER SUPPORT: Reads userInput.chapterCount and follows node instructions
   * EXTRACTED: Routing logic moved to workflow/handlers/processNodeRouter.js
   */
  async executeProcessNode(nodeData, pipelineData, progressCallback = null, workflowId = null) {
    return await routeProcessNodeHelper(
      nodeData,
      pipelineData,
      workflowId,
      {
        executeNonAIProcessing: this.executeNonAIProcessing?.bind(this) || null,
        executeImageGeneration: this.executeImageGeneration.bind(this),
        generateMultipleChapters: this.generateMultipleChapters.bind(this),
        executeContentRefinement: this.executeContentRefinement.bind(this),
        executeSingleAIGeneration: this.executeSingleAIGeneration.bind(this)
      },
      progressCallback
    )
  }

  /**
   * Generate multiple chapters based on user input and node instructions
   * This follows the node's own instructions dynamically
   */
  async generateMultipleChapters(nodeData, pipelineData, chapterCount, progressCallback = null, workflowId = null) {
    return generateMultipleChaptersHandler({
      nodeData,
            pipelineData,
      chapterCount,
      progressCallback,
      workflowId,
      helpers: {
        isWorkflowStopped: stateManager.isWorkflowStopped,
        checkDatabaseStopSignal: stateManager.checkDatabaseStopSignal,
        convertResultsToNodeOutputs: convertResultsToNodeOutputsHelper,
        processPromptVariables: (prompts, pipelineData, nodePermissions) => processPromptVariablesHelper({
          prompts,
          pipelineData,
          nodePermissions,
          sanitizeUserInputForNextNode,
          logger: console
        }),
        parseModelConfig: parseModelConfigHelper,
        getAIService: () => this.aiService,
        extractChapterTitle: extractChapterTitleHelper
      }
    })
  }

  /**
   * Execute single AI generation - used for both single chapters and individual chapters in multi-chapter mode
   */
  async executeSingleAIGeneration(nodeData, pipelineData, progressCallback = null, workflowId = null) {
    return executeSingleAIGenerationHandler({
      nodeData,
      pipelineData,
      progressCallback,
      workflowId,
      helpers: {
        processPromptVariables: (prompts, pipelineData, nodePermissions) => processPromptVariablesHelper({
          prompts,
          pipelineData,
          nodePermissions,
          sanitizeUserInputForNextNode,
          logger: console
        }),
        isWorkflowStopped: stateManager.isWorkflowStopped,
        checkDatabaseStopSignal: stateManager.checkDatabaseStopSignal,
        parseModelConfig: parseModelConfigHelper,
        getAIService: () => this.aiService
      }
    })
  }

  // REMOVED: assessContentQuality() extracted to workflow/utils/workflowUtils.js (Phase 7)
  // Use assessContentQualityHelper() from workflow/utils/workflowUtils.js
  // Keeping method signature for backward compatibility - delegates to helper
  // REMOVED: assessContentQuality() wrapper removed (Phase 8)
  // Use assessContentQualityHelper() directly from workflow/utils/workflowUtils.js

  /**
   * Execute content refinement - Editor processes existing content with checklist
   */
  async executeContentRefinement(nodeData, pipelineData, progressCallback = null, workflowId = null) {
    return executeContentRefinementHandler({
      nodeData,
      pipelineData,
      progressCallback,
      workflowId,
      helpers: {
        processPromptVariables: (prompts, pipelineData, nodePermissions) => processPromptVariablesHelper({
          prompts,
          pipelineData,
          nodePermissions,
          sanitizeUserInputForNextNode,
          logger: console
        }),
        assessContentQuality: assessContentQualityHelper,
        isWorkflowStopped: stateManager.isWorkflowStopped,
        checkDatabaseStopSignal: stateManager.checkDatabaseStopSignal,
        parseModelConfig: parseModelConfigHelper,
        getAIService: () => this.aiService
      }
    })
  }

  /**
   * Execute image generation - generate images using Gemini image models
   */
  async executeImageGeneration(nodeData, pipelineData, progressCallback = null, workflowId = null) {
    return executeImageGenerationHandler({
      nodeData,
      pipelineData,
      progressCallback,
      workflowId,
      parseModelConfig: parseModelConfigHelper,
      getAIService: () => this.aiService
    })
  }

  /**
   * Build image generation prompt from story content and user preferences
   */
  /**
   * Execute preview node - generate preview content for customer approval
   */
  async executePreviewNode(nodeData, pipelineData, progressCallback = null) {
    return executePreviewNodeHandler({
      nodeData,
      pipelineData,
      progressCallback,
      helpers: {
        processPromptVariables: (prompts, pipelineData, nodePermissions) => processPromptVariablesHelper({
          prompts,
          pipelineData,
          nodePermissions,
          sanitizeUserInputForNextNode,
          logger: console
        }),
        parseModelConfig: parseModelConfigHelper,
        getAIService: () => this.aiService
      }
    })
  }

  /**
   * Execute condition node - evaluate conditions and route data
   */
  async executeConditionNode(nodeData, pipelineData) {
    return executeConditionNodeHandler({
      nodeData,
      pipelineData,
      helpers: {
        evaluateCondition: evaluateConditionHelper,
        executeConditionAction: (action, pipelineData) => executeConditionActionHelper(
          action,
          pipelineData,
          processPromptVariablesHelper,
          sanitizeUserInputForNextNode
        )
      }
    })
  }

  /**
   * Execute output node - format and deliver final results
   * ORCHESTRATION ONLY: Delegates to outputHandler with helpers from outputHelpers.js
   */
  async executeOutputNode(nodeData, pipelineData) {
    return executeOutputNodeHandler({
      nodeData,
      pipelineData,
      helpers: {
        compileWorkflowContent: (nodeOutputs, userInput) => {
          try {
            const compiled = compileWorkflowContentHelper(nodeOutputs, userInput)
            console.log('📦 compileWorkflowContent summary:', {
              sections: compiled.sections.length,
              totalWords: compiled.totalWords,
              totalCharacters: compiled.totalCharacters,
              structuralKeys: Object.keys(compiled.structural || {})
            })
            return compiled
          } catch (error) {
            console.error('❌ compileWorkflowContent failed:', error)
            throw error
          }
        },
        formatFinalOutput: formatFinalOutputHelper,
        generateDeliverables: (formattedOutput, nodeData) => generateDeliverablesHelper(formattedOutput, nodeData, getMimeTypeHelper)
      }
    })
  }

  /**
   * Helper methods for execution
   */
  
  // REMOVED: buildExecutionOrder() extracted to workflow/utils/executionOrderBuilder.js (Phase 8)
  // Use buildExecutionOrderHelper() from workflow/utils/executionOrderBuilder.js

  // REMOVED: validateInputFields() extracted to workflow/utils/workflowUtils.js (Phase 7)
  // Use validateInputFieldsHelper() from workflow/utils/workflowUtils.js

  // REMOVED: structureInputData() wrapper (Phase 7)
  // Use structureInputDataHelper() directly from workflow/utils/inputProcessor.js

  // REMOVED: identifyMissingOptionals(), createNextNodeInstructions() already extracted to workflow/utils/workflowUtils.js (Phase 7)
  // Use identifyMissingOptionalsHelper(), createNextNodeInstructionsHelper() from workflow/utils/workflowUtils.js

  // REMOVED: processPromptVariables() - delegate wrapper, removed in Phase 6
  // Use processPromptVariablesHelper() directly from workflow/promptService.js
  
  // REMOVED: generateChapterContext() - delegate wrapper, removed in Phase 6
  // Use generateChapterContextHelper() directly from workflow/promptService.js

  // REMOVED: parseModelConfig() wrapper removed (Phase 8)
  // Use parseModelConfigHelper() directly from workflow/modelService.js

  // REMOVED: compileWorkflowContent() - delegate wrapper with logging, removed in Phase 6
  // Use compileWorkflowContentHelper() directly from workflow/contentCompiler.js
  
  // REMOVED: __extractChapterStructure() - delegate wrapper, removed in Phase 6
  // Use extractChapterStructure() directly from workflow/contentCompiler.js

  // REMOVED: formatFinalOutput, generateDeliverables, getMimeType methods
  // EXTRACTED TO: workflow/helpers/outputHelpers.js (Phase 1.1)
  // These methods are now imported and wired through executeOutputNode()
  // See imports at top of file: formatFinalOutputHelper, generateDeliverablesHelper, getMimeTypeHelper

  // REMOVED: Legacy format generation methods removed (Phase 8)
  // All formatting now handled by professionalBookFormatter via outputHelpers.js
  // REMOVED: generateMarkdownOutput, generateHTMLOutput, generatePlainTextOutput, 
  // generatePDFOutput, generateEPUBOutput, generateDOCXOutput, generateXMLOutput,
  // generateCSVOutput, generateYAMLOutput, generateRTFOutput, generateODTOutput,
  // generateGenericOutput, generateFormatOutput
  // Use formatFinalOutputHelper() from workflow/helpers/outputHelpers.js instead

  // REMOVED: All state management methods extracted to workflow/state/executionStateManager.js
  // Access via: stateManager.updateExecutionState(), stateManager.stopWorkflow(), etc.

  async restartFromCheckpoint(workflowId, nodeId, nodes, edges, initialInput, progressCallback, executionUser) {
    return await restartFromCheckpointHelper(
      workflowId,
      nodeId,
      nodes,
      edges,
      initialInput,
      progressCallback,
      executionUser,
      buildExecutionOrderHelper,
      this.executeNode.bind(this),
      this.restartFailedNode.bind(this),
      this.continueExecutionFromNode.bind(this)
    )
  }

  async restartFailedNode(workflowId, nodeId, nodes, edges, initialInput, progressCallback, executionUser) {
    return await restartFailedNodeHelper(
      workflowId,
      nodeId,
      nodes,
      edges,
      initialInput,
      progressCallback,
      executionUser,
      buildExecutionOrderHelper,
      this.executeNode.bind(this),
      this.continueWorkflowFromNode.bind(this)
    )
  }

  async continueWorkflowFromNode(workflowId, fromNodeId, nodes, edges, initialInput, progressCallback, executionUser) {
    return await continueWorkflowFromNodeHelper(
      workflowId,
      fromNodeId,
      nodes,
      edges,
      initialInput,
      progressCallback,
      executionUser,
      buildExecutionOrderHelper,
      this.executeNode.bind(this),
      this.continueExecutionFromNode.bind(this)
    )
  }

  async continueExecutionFromNode(workflowId, nodes, edges, initialInput, progressCallback, executionUser, startIndex, existingOutputs) {
    return await continueExecutionFromNodeHelper(
      workflowId,
      nodes,
      edges,
      initialInput,
      progressCallback,
      executionUser,
      startIndex,
      existingOutputs,
      buildExecutionOrderHelper,
      this.executeNode.bind(this)
    )
  }

  // REMOVED: Checkpoint/pause/resume methods extracted to workflow/state/executionStateManager.js
  // Access via: stateManager.createCheckpoint(), stateManager.waitForResume(), etc.

  
  // REMOVED: Content helper methods extracted to workflow/helpers/contentHelpers.js (Phase 5)
  // - convertResultsToNodeOutputs() → use convertResultsToNodeOutputsHelper()
  // - extractChapterTitle() → use extractChapterTitleHelper()
  // These are now imported from workflow/helpers/contentHelpers.js

  // REMOVED: checkDatabaseStopSignal extracted to workflow/state/executionStateManager.js
  // Access via: stateManager.checkDatabaseStopSignal()

  // REMOVED: recordNodeTokenUsage() extracted to workflow/helpers/tokenHelpers.js (Phase 6)
  // Use recordNodeTokenUsageHelper(stateManager, workflowId, nodeMeta, nodeOutput) from tokenHelpers.js

  // REMOVED: Token helper methods extracted to workflow/helpers/tokenHelpers.js (Phase 3)
  // - deriveNodeTokenMetrics() → use deriveNodeTokenMetricsHelper()
  // - calculateTokenUsageFromOutputs() → use calculateTokenUsageFromOutputsHelper()
  // - buildTokenLedgerFromOutputs() → use buildTokenLedgerFromOutputsHelper()
  // - extractNumericValue() → use extractNumericValueHelper()
  // - getTokenUsageSummary() → use getTokenUsageSummaryHelper(stateManager, workflowId, nodeOutputs)
  // - getTokenLedger() → use getTokenLedgerHelper(stateManager, workflowId, nodeOutputs)
  // These are now imported from workflow/helpers/tokenHelpers.js
  
  // REMOVED: recordNodeTokenUsage() - extracted to workflow/helpers/tokenHelpers.js (Phase 6)

  // REMOVED: __sanitizeUserInputForNextNode() - delegate wrapper, removed in Phase 6
  // Use sanitizeUserInputForNextNode() directly from workflow/inputSanitizer.js


  // REMOVED: clearAllExecutions, killStuckExecutions extracted to workflow/state/executionStateManager.js
  // Access via: stateManager.clearAllExecutions(), stateManager.killStuckExecutions()
}

const workflowExecutionService = new WorkflowExecutionService()

module.exports = workflowExecutionService