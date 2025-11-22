const { applyPermissions } = require('../permissionService')

/**
 * Route process node to appropriate handler based on node type, role, and configuration
 * Extracted from workflowExecutionService.executeProcessNode for modularity
 * 
 * @param {Object} nodeData - Node configuration
 * @param {Object} pipelineData - Current pipeline data
 * @param {number|null} workflowId - Workflow execution ID
 * @param {Object} handlers - Handler functions to route to
 * @param {Function} handlers.executeNonAIProcessing - Handler for non-AI nodes
 * @param {Function} handlers.executeImageGeneration - Handler for image generation nodes
 * @param {Function} handlers.generateMultipleChapters - Handler for multi-chapter content generation
 * @param {Function} handlers.executeContentRefinement - Handler for content refinement/editing
 * @param {Function} handlers.executeSingleAIGeneration - Handler for single AI generation
 * @param {Function|null} progressCallback - Progress update callback
 * @returns {Promise<Object>} Node execution result
 */
async function routeProcessNode(nodeData, pipelineData, workflowId, handlers, progressCallback = null) {
  const { 
    aiEnabled, 
    selectedModels, 
    systemPrompt, 
    userPrompt, 
    temperature, 
    maxTokens, 
    inputInstructions,
    processingInstructions
  } = nodeData
  
  // PERMISSION ENFORCEMENT: Delegate to workflow permission service
  const { role: nodeRole } = applyPermissions(nodeData, console)
  
  if (!aiEnabled) {
    // Non-AI processing node
    if (handlers.executeNonAIProcessing) {
      return await handlers.executeNonAIProcessing(nodeData, pipelineData)
    }
    throw new Error('Non-AI processing node requires executeNonAIProcessing handler')
  }

  // STEP 1: RECEIVE - Get previous node output and store in previousNodePassover
  const previousOutput = pipelineData.lastNodeOutput || pipelineData.userInput
  const { userInput } = pipelineData
  
  // STEP 2: STORE - Store complete previous node data in previousNodePassover
  const previousNodePassover = {
    previousOutput: previousOutput,
    originalUserInput: userInput,
    timestamp: new Date().toISOString(),
    nodeContext: 'stored_for_passover'
  }
  
  // Add previousNodePassover to pipelineData for template processing
  pipelineData.previousNodePassover = previousNodePassover
  // Backward-compatible alias expected by prompts and templates
  pipelineData.previous_node_output = previousNodePassover
  
  console.log('📦 PREVIOUS NODE PASSOVER: Stored previous data for context preservation')
  console.log('   - Previous output keys:', Object.keys(previousOutput || {}))
  console.log('   - User input keys:', Object.keys(userInput || {}))
  
  // CRITICAL: Extract user_input from JSON wrapper if available, otherwise fall back to userInput
  let structuredData = userInput
  
  if (previousOutput?.content?.user_input) {
    // Input node returned JSON wrapper - extract the user_input
    structuredData = previousOutput.content.user_input
    console.log('🔍 PROCESS NODE: Using user_input from JSON wrapper:', structuredData)
  } else if (previousOutput?.structuredData) {
    // Legacy fallback for old structuredData format
    structuredData = previousOutput.structuredData
    console.log('🔍 PROCESS NODE: Using legacy structuredData:', structuredData)
  } else {
    console.log('🔍 PROCESS NODE: Using direct userInput:', structuredData)
  }
  

  // SURGICAL FIX: FORCE USER INPUT CHAPTER COUNT - Check user input FIRST, ignore preset contamination
  let chapterCount = null
  
  // Priority 1: Direct user input (highest priority)
  chapterCount = userInput.chapterCount || userInput.chapter_count || userInput['Chapter Count'] || userInput['Number of Chapters']
  
  // Priority 2: Structured data (from input node processing)  
  if (!chapterCount) {
    chapterCount = structuredData.chapterCount || structuredData.chapter_count || structuredData['Chapter Count'] || structuredData['Number of Chapters']
  }
  
  console.log('🔍 CHAPTER COUNT EXTRACTION PRIORITY:')
  console.log('  - userInput.chapter_count:', userInput.chapter_count)
  console.log('  - userInput.chapterCount:', userInput.chapterCount)
  console.log('  - structuredData.chapter_count:', structuredData.chapter_count)
  console.log('  - FINAL chapterCount:', chapterCount)
  
  console.log('🔍 CHAPTER COUNT RAW EXTRACTION:', chapterCount, 'Type:', typeof chapterCount)
  
  // Parse chapter count if it's a string like "2-3" or "6-8" 
  if (chapterCount && typeof chapterCount === 'string') {
    if (chapterCount.includes('-')) {
      // Take the higher number from ranges like "2-3" -> 3, "6-8" -> 8
      const parts = chapterCount.split('-')
      chapterCount = parseInt(parts[1]) || parseInt(parts[0]) || 1
    } else {
      chapterCount = parseInt(chapterCount) || 1
    }
  }
  
  console.log('🔍 CHAPTER COUNT AFTER PARSING:', chapterCount, 'Type:', typeof chapterCount)
  
  if (!chapterCount || chapterCount < 1) {
    // NO AI DETERMINATION - Use sensible defaults based on content type
    const wordCount = parseInt(structuredData.word_count || structuredData['Word Count'] || 2000)
    
    // Simple logical defaults without AI calls
    if (wordCount <= 2000) {
      chapterCount = 3
    } else if (wordCount <= 5000) {
      chapterCount = 4
    } else if (wordCount <= 10000) {
      chapterCount = 6
    } else {
      chapterCount = 8
    }
    
    console.log('🔍 DEFAULT CHAPTER ASSIGNMENT:')
    console.log('  - Word count:', wordCount)
    console.log('  - Default chapters:', chapterCount)
  } else {
    console.log('🔍 USER-SPECIFIED CHAPTERS (RESPECTED):', chapterCount)
  }
  
  console.log('🔍 CHAPTER COUNT DEBUG:')
  console.log('  - structuredData:', structuredData)
  console.log('  - structuredData.chapterCount:', structuredData.chapterCount)
  console.log('  - structuredData.chapter_count:', structuredData.chapter_count)
  console.log('  - structuredData["Chapter Count"]:', structuredData['Chapter Count'])
  console.log('  - userInput.chapterCount:', userInput.chapterCount)
  console.log('  - userInput.chapter_count:', userInput.chapter_count)
  console.log('  - userInput["Chapter Count"]:', userInput['Chapter Count'])
  console.log('  - Final chapterCount:', chapterCount)
  console.log('  - Type:', typeof chapterCount)
  
  // CRITICAL: Distinguish between content generation and content refinement
  // Use nodeRole from permission check above, with label-based fallback
  const nodeLabel = (nodeData.label || '').toLowerCase()
  const isLabelBasedWriter = nodeLabel.includes('writing') || 
                             nodeLabel.includes('literary') || 
                             nodeLabel.includes('narrative') || 
                             nodeLabel.includes('content writer') ||
                             nodeLabel.includes('technical writer') ||
                             nodeLabel.includes('copywriter')
  
  const isContentWriter = nodeRole === 'content_writer' || 
                         nodeRole === 'technical_writer' || 
                         nodeRole === 'copywriter' ||
                         isLabelBasedWriter
  
  const isEditor = nodeRole === 'editor'

  console.log(`🔍 NODE ROLE CHECK: ${nodeRole}, isContentWriter: ${isContentWriter}, isEditor: ${isEditor}`)
  console.log(`🔍 NODE LABEL: ${nodeData.label}`)
  console.log(`🔍 LABEL-BASED WRITER DETECTION: ${isLabelBasedWriter}`)

  // SURGICAL FIX: Detect image generation nodes and handle differently
  const isImageNode = nodeRole === 'image_generator' || nodeRole === 'ecover_generator'
  
  if (isImageNode) {
    // Image generation: Call specialized image generation handler
    console.log(`🎨 STARTING IMAGE GENERATION (${nodeRole})`)
    return await handlers.executeImageGeneration(nodeData, pipelineData, progressCallback, workflowId)
  } else if (parseInt(chapterCount) > 1 && isContentWriter) {
    // Multi-chapter generation: ONLY for content writing nodes
    console.log(`🔍 STARTING MULTI-CHAPTER GENERATION: ${chapterCount} chapters`)
    return await handlers.generateMultipleChapters(nodeData, pipelineData, parseInt(chapterCount), progressCallback, workflowId)
  } else if (isEditor) {
    // Content refinement: Editor processes existing content with checklist
    console.log(`🔍 STARTING CONTENT REFINEMENT (Editor node)`)
    return await handlers.executeContentRefinement(nodeData, pipelineData, progressCallback, workflowId)
  } else {
    // Single generation: For research, analysis, and other non-writing nodes
    console.log(`🔍 STARTING SINGLE GENERATION (${isContentWriter ? 'content writer' : 'research/analysis node'})`)
    return await handlers.executeSingleAIGeneration(nodeData, pipelineData, progressCallback, workflowId)
  }
}

module.exports = {
  routeProcessNode
}


