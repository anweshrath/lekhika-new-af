/**
 * ALCHEMIST JSON WRAPPER SERVICE
 * Handles standardized JSON data flow between Alchemist nodes
 * Ensures NO data loss and handles ANY number of input fields dynamically
 */

class AlchemistJsonWrapper {
  constructor() {
    this.workflowData = new Map() // Store workflow context
  }

  /**
   * 🚀 CREATE INITIAL JSON WRAPPER FROM INPUT NODE
   * Collects all input data and wraps it in standardized format
   */
  createInputWrapper(nodeData, testInputValues, customerContext = {}, workflowId) {
    const timestamp = new Date().toISOString()
    
    // Extract all user input from test input values (from Variables tab)
    const userInput = { ...testInputValues }
    
    // Get selected variables from node configuration
    const selectedVariables = nodeData.inputFields?.map(field => field.variable) || []
    
    // Count required fields
    const requiredFields = nodeData.inputFields?.filter(field => {
      // Check if field is marked as required in variable definition
      return field.required === true
    }).length || 0

    const jsonWrapper = {
      // Core identification
      nodeType: nodeData.type || 'inputMaster',
      timestamp: timestamp,
      workflowId: workflowId,
      nodeId: nodeData.id || 'input-node',
      
      // Customer context (tier, industry, permissions, etc)
      customerContext: {
        tier: customerContext.tier || 'starter',
        industry: customerContext.industry || 'general',
        permissions: customerContext.permissions || ['basic'],
        userId: customerContext.userId || null,
        sessionId: customerContext.sessionId || null,
        ...customerContext
      },
      
      // ALL user input data - dynamically handles any number of fields
      userInput: userInput,
      
      // Metadata for processing
      metadata: {
        selectedVariables: selectedVariables,
        totalFields: Object.keys(userInput).length,
        requiredFields: requiredFields,
        nodeConfiguration: {
          label: nodeData.label || 'Input Node',
          description: nodeData.description || '',
          variables: selectedVariables
        },
        processingFlags: {
          isInputNode: true,
          requiresValidation: requiredFields > 0,
          hasCustomerContext: Object.keys(customerContext).length > 0
        }
      },
      
      // Continuity data (empty for first node, will accumulate)
      continuityData: {
        previousNodes: [],
        workflowHistory: [],
        accumulatedContext: {}
      }
    }

    // Store in workflow data for continuity
    this.workflowData.set(workflowId, {
      startTime: timestamp,
      initialInput: jsonWrapper,
      nodeHistory: [jsonWrapper],
      currentStep: 1
    })

    console.log('🎯 ALCHEMIST JSON WRAPPER CREATED:', jsonWrapper)
    return jsonWrapper
  }

  /**
   * 🔄 PROCESS NODE DATA WRAPPER
   * Takes previous JSON wrapper + current node output, creates new wrapper
   */
  createProcessWrapper(previousWrapper, currentNodeData, processOutput, nodeId) {
    const timestamp = new Date().toISOString()
    const workflowId = previousWrapper.workflowId
    
    // Get workflow context
    const workflowContext = this.workflowData.get(workflowId) || {}
    
    const processWrapper = {
      // Core identification
      nodeType: currentNodeData.type || 'processNode',
      timestamp: timestamp,
      workflowId: workflowId,
      nodeId: nodeId,
      
      // Preserve customer context from previous wrapper
      customerContext: previousWrapper.customerContext,
      
      // Preserve original user input (NEVER lost)
      originalUserInput: previousWrapper.userInput,
      
      // Current node's AI-generated output
      currentNodeOutput: processOutput,
      
      // Enhanced metadata
      metadata: {
        ...previousWrapper.metadata,
        currentNodeType: currentNodeData.type,
        currentNodeLabel: currentNodeData.label || 'Process Node',
        processingStep: (workflowContext.currentStep || 1) + 1,
        totalStepsCompleted: workflowContext.nodeHistory?.length || 1,
        aiModelUsed: processOutput.aiModelUsed || null,
        tokens: processOutput.tokens || 0,
        cost: processOutput.cost || 0,
        processingTime: processOutput.processingTime || 0
      },
      
      // FULL CONTINUITY - ALL previous data preserved
      continuityData: {
        previousNodes: [
          ...previousWrapper.continuityData.previousNodes,
          {
            nodeId: previousWrapper.nodeId,
            nodeType: previousWrapper.nodeType,
            output: previousWrapper.currentNodeOutput || previousWrapper.userInput,
            timestamp: previousWrapper.timestamp
          }
        ],
        workflowHistory: [
          ...previousWrapper.continuityData.workflowHistory,
          previousWrapper
        ],
        accumulatedContext: {
          ...previousWrapper.continuityData.accumulatedContext,
          [previousWrapper.nodeId]: previousWrapper.currentNodeOutput || previousWrapper.userInput
        }
      }
    }

    // Update workflow context
    workflowContext.currentStep = (workflowContext.currentStep || 1) + 1
    workflowContext.nodeHistory = [...(workflowContext.nodeHistory || []), processWrapper]
    this.workflowData.set(workflowId, workflowContext)

    console.log('🔄 ALCHEMIST PROCESS WRAPPER CREATED:', processWrapper)
    return processWrapper
  }

  /**
   * 📤 FINAL OUTPUT WRAPPER
   * Creates final output with complete workflow summary
   */
  createFinalWrapper(previousWrapper, finalOutput, nodeId) {
    const timestamp = new Date().toISOString()
    const workflowId = previousWrapper.workflowId
    const workflowContext = this.workflowData.get(workflowId) || {}
    
    const finalWrapper = {
      // Core identification
      nodeType: 'outputNode',
      timestamp: timestamp,
      workflowId: workflowId,
      nodeId: nodeId,
      
      // Preserve everything
      customerContext: previousWrapper.customerContext,
      originalUserInput: previousWrapper.originalUserInput,
      
      // Final generated content
      finalOutput: finalOutput,
      
      // Complete workflow summary
      workflowSummary: {
        startTime: workflowContext.startTime,
        endTime: timestamp,
        totalDuration: this.calculateDuration(workflowContext.startTime, timestamp),
        totalNodes: workflowContext.nodeHistory?.length || 1,
        totalTokens: this.calculateTotalTokens(workflowContext.nodeHistory),
        totalCost: this.calculateTotalCost(workflowContext.nodeHistory),
        success: true
      },
      
      // Complete metadata
      metadata: {
        ...previousWrapper.metadata,
        currentNodeType: 'output',
        currentNodeLabel: 'Output Node',
        processingStep: (workflowContext.currentStep || 1) + 1,
        isComplete: true
      },
      
      // COMPLETE continuity data
      continuityData: {
        previousNodes: [
          ...previousWrapper.continuityData.previousNodes,
          {
            nodeId: previousWrapper.nodeId,
            nodeType: previousWrapper.nodeType,
            output: previousWrapper.currentNodeOutput,
            timestamp: previousWrapper.timestamp
          }
        ],
        completeWorkflowHistory: workflowContext.nodeHistory || [],
        finalAccumulatedContext: {
          ...previousWrapper.continuityData.accumulatedContext,
          [previousWrapper.nodeId]: previousWrapper.currentNodeOutput
        }
      }
    }

    console.log('📤 ALCHEMIST FINAL WRAPPER CREATED:', finalWrapper)
    
    // Clean up workflow data
    this.workflowData.delete(workflowId)
    
    return finalWrapper
  }

  /**
   * 🔍 EXTRACT DATA FOR AI PROCESSING
   * Gets the right data from wrapper for AI calls
   */
  extractDataForAI(wrapper) {
    return {
      userInput: wrapper.originalUserInput || wrapper.userInput,
      customerContext: wrapper.customerContext,
      previousContext: wrapper.continuityData?.accumulatedContext || {},
      metadata: wrapper.metadata
    }
  }

  /**
   * ✅ VALIDATE WRAPPER STRUCTURE
   * Ensures wrapper has all required fields
   */
  validateWrapper(wrapper) {
    const required = ['nodeType', 'timestamp', 'workflowId', 'userInput', 'metadata']
    const missing = required.filter(field => !wrapper[field])
    
    if (missing.length > 0) {
      throw new Error(`Invalid wrapper: missing fields ${missing.join(', ')}`)
    }
    
    return true
  }

  // Helper methods
  calculateDuration(startTime, endTime) {
    return Math.round((new Date(endTime) - new Date(startTime)) / 1000) // seconds
  }

  calculateTotalTokens(nodeHistory) {
    return nodeHistory?.reduce((total, node) => {
      return total + (node.metadata?.tokens || 0)
    }, 0) || 0
  }

  calculateTotalCost(nodeHistory) {
    return nodeHistory?.reduce((total, node) => {
      return total + (node.metadata?.cost || 0)
    }, 0) || 0
  }

  /**
   * 🧪 CREATE TEST WRAPPER
   * For testing purposes - generates sample wrapper
   */
  createTestWrapper(testData = {}) {
    return this.createInputWrapper(
      {
        type: 'inputMaster',
        id: 'test-input',
        label: 'Test Input Node',
        inputFields: [
          { variable: 'topic_alc', required: true },
          { variable: 'audience_alc', required: false }
        ]
      },
      {
        topic_alc: testData.topic || 'AI in Healthcare',
        audience_alc: testData.audience || 'Medical professionals'
      },
      {
        tier: 'pro',
        industry: 'healthcare',
        userId: 'test-user'
      },
      `test-workflow-${Date.now()}`
    )
  }
}

// Export singleton instance
export const alchemistJsonWrapper = new AlchemistJsonWrapper()
export default alchemistJsonWrapper
