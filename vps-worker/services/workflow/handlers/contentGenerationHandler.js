const bookCompilationService = require('../../BookCompilationService.js')
const aiResponseValidator = require('../../aiResponseValidator.js')
const { narrativeStructureService } = require('../../narrativeStructureService.js')
const { getCelebrityStyle } = require('../../../config/celebrityStyles.js')

function assertHelper(helper, name) {
  if (typeof helper !== 'function') {
    throw new Error(`contentGenerationHandler missing required helper: ${name}`)
  }
  return helper
}

/**
 * Execute single AI generation - shared by single + multi chapter flows
 */
async function executeSingleAIGeneration({
  nodeData,
  pipelineData,
  progressCallback = null,
  workflowId = null,
  helpers = {}
}) {
  const {
    processPromptVariables,
    isWorkflowStopped,
    checkDatabaseStopSignal,
    parseModelConfig,
    getAIService
  } = helpers

  assertHelper(processPromptVariables, 'processPromptVariables')
  assertHelper(isWorkflowStopped, 'isWorkflowStopped')
  assertHelper(checkDatabaseStopSignal, 'checkDatabaseStopSignal')
  assertHelper(parseModelConfig, 'parseModelConfig')
  assertHelper(getAIService, 'getAIService')

  const { selectedModels, systemPrompt, userPrompt, temperature, maxTokens, inputInstructions } = nodeData

  const previousOutput = pipelineData.lastNodeOutput || pipelineData.userInput

  if (!pipelineData.previousNodePassover) {
    pipelineData.previousNodePassover = previousOutput || pipelineData.userInput
  }

  const processedPrompts = processPromptVariables({
    systemPrompt,
    userPrompt
  }, pipelineData, nodeData.permissions)

  // SURGICAL FIX: Extract chapter titles from ANY structural node (not hardcoded)
  let structuralNodeData = null
  let chapterTitles = {}
  
  if (pipelineData.structuralNodeOutputs && Object.keys(pipelineData.structuralNodeOutputs).length > 0) {
    console.log(`📐 FOUND ${Object.keys(pipelineData.structuralNodeOutputs).length} structural node outputs`)
    
    // Find ANY structural node with chapter breakdown (generic detection, no hardcoding)
    for (const [nodeId, structuralOutput] of Object.entries(pipelineData.structuralNodeOutputs)) {
      if (structuralOutput.content && typeof structuralOutput.content === 'string') {
        try {
          const unfenced = structuralOutput.content.replace(/^```json\s*/i, '').replace(/```$/i, '').trim()
          const maybeJson = unfenced.startsWith('{') ? unfenced : (structuralOutput.content.trim().startsWith('{') ? structuralOutput.content.trim() : '')
          if (maybeJson) {
            const parsed = JSON.parse(maybeJson)
            const chapterBreakdown = parsed?.story_structure?.chapter_breakdown || parsed?.chapter_breakdown
            
            if (Array.isArray(chapterBreakdown) && chapterBreakdown.length > 0) {
              structuralNodeData = parsed
              chapterBreakdown.forEach(ch => {
                if (ch.chapter && ch.title) {
                  chapterTitles[ch.chapter] = ch.title
                }
              })
              console.log(`📐 EXTRACTED chapter titles from structural node ${nodeId}:`, chapterTitles)
              break // Use first structural node that has chapter breakdown
            }
          }
        } catch (e) {
          console.warn(`⚠️ Failed to parse structural node ${nodeId} output:`, e.message)
        }
      }
    }
  }

  const { userInput, nodeOutputs, lastNodeOutput } = pipelineData

  let structuredData = userInput
  if (lastNodeOutput?.content?.user_input) {
    structuredData = lastNodeOutput.content.user_input
  } else if (lastNodeOutput?.structuredData) {
    structuredData = lastNodeOutput.structuredData
  }

  const filteredStructuredData = { ...structuredData }
  delete filteredStructuredData.completeBook
  delete filteredStructuredData._chapters

  const allData = {
    ...userInput,
    ...filteredStructuredData,
    currentChapter: pipelineData.currentChapter,
    totalChapters: pipelineData.totalChapters,
    previousChapters: pipelineData.previousChapters
  }

  console.log('🔍 Selected models for AI generation:', selectedModels)
  console.log('🔍 First selected model:', selectedModels?.[0])

  if (!selectedModels || selectedModels.length === 0) {
    throw new Error('No AI models selected for this node. Please configure AI Integration in the node modal.')
  }

  if (workflowId && (isWorkflowStopped(workflowId) || await checkDatabaseStopSignal(workflowId))) {
    console.log('🛑 WORKFLOW STOPPED BEFORE AI CALL - RETURNING STOPPED RESULT')
    return {
      type: 'stopped_before_ai',
      content: 'Workflow stopped before AI generation could complete.',
      metadata: {
        nodeId: nodeData.id,
        timestamp: new Date(),
        stopped: true
      },
      stopped: true,
      message: 'Workflow stopped before AI generation.'
    }
  }

  const modelConfig = await parseModelConfig(selectedModels[0])
  console.log('🔍 Parsed model config:', modelConfig)
  const aiServiceInstance = getAIService(modelConfig.provider)

  const isBookGeneration = nodeData.label?.toLowerCase().includes('writing') ||
    nodeData.label?.toLowerCase().includes('narrative') ||
    nodeData.label?.toLowerCase().includes('literary')

  const timeoutDuration = isBookGeneration ? 1800000 : 600000
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error(`AI generation timeout after ${timeoutDuration / 60000} minutes`)), timeoutDuration)
  })

  if (!aiServiceInstance) {
    throw new Error(`AI service not available for provider: ${modelConfig.provider}`)
  }

  try {
    let finalPrompt = processedPrompts.systemPrompt
      ? `${processedPrompts.systemPrompt}\n\n${processedPrompts.userPrompt}`
      : processedPrompts.userPrompt

    const celebrityStyleValue = allData.celebrity_style || userInput.celebrity_style
    if (celebrityStyleValue) {
      const celebrityData = getCelebrityStyle(celebrityStyleValue)
      if (celebrityData && celebrityData.styleGuide) {
        console.log(`🎭 CELEBRITY STYLE ACTIVATED: ${celebrityData.label}`)
        finalPrompt = `${finalPrompt}\n\n🎭 WRITING STYLE DIRECTIVE:\n${celebrityData.styleGuide}`
      }
    }

    if (!nodeData.permissions?.canWriteContent) {
      finalPrompt += `\n\n⚠️ CRITICAL RESTRICTION - YOU ARE A PLANNING/RESEARCH NODE:
- DO NOT write narrative chapters, story prose, or complete book content
- DO NOT generate "Chapter 1", "Chapter 2", etc.
- ONLY provide: structural plans, outlines, architecture, research data, analysis
- Keep output concise and structured - this is planning/reference material
- Your output will be used by content writer nodes to create the actual narrative`
      console.log(`🔒 PERMISSION RESTRICTION: Node "${nodeData.label}" (canWriteContent: false) - blocked from narrative generation`)
    }

    let rawWordCount = allData.word_count || allData['Word Count'] || '2000'
    let rawChapterCount = allData.chapter_count || allData['Chapter Count'] || '1'

    let wordCount = 2000
    if (rawWordCount && typeof rawWordCount === 'string') {
      if (rawWordCount.includes('-')) {
        const parts = rawWordCount.split('-')
        wordCount = parseInt(parts[1]) || parseInt(parts[0]) || 2000
      } else {
        wordCount = parseInt(rawWordCount) || 2000
      }
    } else if (rawWordCount && typeof rawWordCount === 'number') {
      wordCount = rawWordCount
    }

    let chapterCount = parseInt(rawChapterCount) || 1
    const wordsPerChapter = Math.max(Math.floor(wordCount / chapterCount), 500)

    console.log('🔍 WORD COUNT CALCULATION DEBUG:')
    console.log('  - rawWordCount:', rawWordCount)
    console.log('  - rawChapterCount:', rawChapterCount)
    console.log('  - parsed wordCount:', wordCount)
    console.log('  - parsed chapterCount:', chapterCount)
    console.log('  - calculated wordsPerChapter:', wordsPerChapter)

    const totalWordsTarget = parseInt(wordCount)
    const dynamicMaxTokens = Math.ceil(totalWordsTarget * 1.3 * 1.5)

    const MODEL_MAX_TOKENS = {
      'claude-3-5-haiku-20241022': 8192,
      'claude-3-5-sonnet-20241022': 8192,
      'claude-3-opus-20240229': 4096,
      'gpt-4': 8192,
      'gpt-4-turbo': 4096,
      'gpt-4o': 16384,
      'gpt-3.5-turbo': 4096,
      'gemini-pro': 8192,
      'gemini-1.5-pro': 8192,
      'gemini-1.5-flash': 8192,
      'gemini-2.0-flash': 8192,
      'mistral-medium': 8192,
      'mistral-large': 8192
    }

    const modelLimit = MODEL_MAX_TOKENS[modelConfig.model] || 4096
    const finalMaxTokens = modelLimit

    console.log('🔍 DYNAMIC MAX TOKENS CALCULATION:')
    console.log('  - wordCount:', wordCount)
    console.log('  - chapterCount:', chapterCount)
    console.log('  - wordsPerChapter:', wordsPerChapter)
    console.log('  - dynamicMaxTokens:', dynamicMaxTokens)
    console.log('  - model:', modelConfig.model)
    console.log('  - modelLimit:', modelLimit)
    console.log('  - finalMaxTokens (capped):', finalMaxTokens)

    const dynamicInputs = []
    const excludedKeys = ['currentChapter', 'totalChapters', 'previousChapters', 'word_count', 'chapter_count', 'Word Count', 'Chapter Count']

    Object.entries(allData).forEach(([key, value]) => {
      if (value && !excludedKeys.includes(key) && typeof value === 'string' && value.trim() !== '') {
        const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        dynamicInputs.push(`- ${formattedKey}: ${value}`)
      }
    })

    // SURGICAL FIX: Get chapter title from structural node if available (generic, no hardcoding)
    const currentChapterNum = allData.currentChapter || 1
    const structuralNodeChapterTitle = chapterTitles[currentChapterNum]
    const chapterTitleToUse = structuralNodeChapterTitle || null
    
    let structuralNodeContext = ''
    if (structuralNodeData) {
      const currentChapterData = structuralNodeData.story_structure?.chapter_breakdown?.find(ch => ch.chapter === currentChapterNum) ||
                                  structuralNodeData.chapter_breakdown?.find(ch => ch.chapter === currentChapterNum)
      if (currentChapterData) {
        structuralNodeContext = `
📐 STRUCTURAL NODE DIRECTIVE (MANDATORY):
- CHAPTER TITLE: "${currentChapterData.title}" (YOU MUST USE THIS EXACT TITLE)
- CHAPTER OUTLINE: ${Array.isArray(currentChapterData.outline) ? currentChapterData.outline.join(', ') : 'Follow the story structure'}
- DO NOT suggest or hint at a "next chapter" - this is the final chapter or part of a complete book
- END THE CHAPTER NATURALLY without transition suggestions`
        
        if (structuralNodeData.story_structure?.plot_structure?.pacing_and_tension_arcs) {
          const pacingData = structuralNodeData.story_structure.plot_structure.pacing_and_tension_arcs.find(arc => arc.chapter === currentChapterNum)
          if (pacingData) {
            structuralNodeContext += `\n- PACING: ${pacingData.pacing}, TENSION: ${pacingData.tension_level}`
            if (Array.isArray(pacingData.key_events) && pacingData.key_events.length > 0) {
              structuralNodeContext += `\n- KEY EVENTS TO COVER: ${pacingData.key_events.join(', ')}`
            }
          }
        }
      }
    }

    const wordCountEnforcement = `

CRITICAL BOOK STRUCTURE REQUIREMENTS:
- TOTAL WORD COUNT: ${wordCount} words (NON-NEGOTIABLE)
- CHAPTER COUNT: ${chapterCount} chapters
- WORDS PER CHAPTER: ${wordsPerChapter} words (±10%)
- CURRENT CHAPTER: ${allData.currentChapter || 1} of ${chapterCount}

DYNAMIC USER INPUTS (ALL PROVIDED INFORMATION):
${dynamicInputs.length > 0 ? dynamicInputs.join('\n') : '- No specific inputs provided'}
${structuralNodeContext}

CRITICAL ORCHESTRATION REQUIREMENTS:
- YOU MUST GENERATE A COMPLETE, PROFESSIONAL BOOK CHAPTER
- INCLUDE PROPER CHAPTER TITLE AND STRUCTURE
- USE ALL PROVIDED INPUTS ABOVE TO CREATE RELEVANT CONTENT
- INCORPORATE ALL USER-SPECIFIED DETAILS INTO THE NARRATIVE

🚫 ABSOLUTE PROHIBITIONS:
- DO NOT generate book title, author name, or Table of Contents (structural node handles this)
- DO NOT include book metadata or header information
- DO NOT create a TOC or book structure - ONLY write the chapter content
- START DIRECTLY WITH THE CHAPTER TITLE AND CONTENT

CHAPTER STRUCTURE REQUIREMENTS:
- START WITH CHAPTER TITLE: "Chapter ${allData.currentChapter || 1}: ${chapterTitleToUse}"
- INCLUDE PROPER INTRODUCTION TO THE CHAPTER
- DEVELOP MAIN CONTENT WITH CLEAR SECTIONS
- INCLUDE PRACTICAL EXAMPLES AND APPLICATIONS
- END WITH CHAPTER SUMMARY${currentChapterNum < chapterCount ? ' AND TRANSITION TO NEXT CHAPTER' : ' - THIS IS THE FINAL CHAPTER, END NATURALLY WITHOUT SUGGESTING MORE CHAPTERS'}

WORD COUNT ENFORCEMENT:
- YOU MUST GENERATE EXACTLY ${wordsPerChapter} WORDS FOR THIS CHAPTER
- COUNT YOUR WORDS AND ENSURE YOU MEET THE REQUIREMENT
- NO LESS, NO MORE - EXACTLY ${wordsPerChapter} WORDS

CHAPTER CONTEXT:
- YOU ARE WRITING CHAPTER ${allData.currentChapter || 1} OF ${chapterCount} TOTAL CHAPTERS
- ${allData.currentChapter > 1 ? 'BUILD UPON PREVIOUS CHAPTERS WITHOUT REPEATING CONTENT' : 'ESTABLISH THE FOUNDATION FOR THE ENTIRE BOOK'}

${narrativeStructureService.buildChapterContext(
  allData.currentChapter || 1,
  allData.totalChapters || chapterCount,
  allData.previousChapters || [],
  allData
)}

CUSTOM INSTRUCTIONS: ${allData.custom_instructions || 'Generate comprehensive, professional content that provides real value to the target audience.'}`

    finalPrompt = finalPrompt + wordCountEnforcement

    console.log('📝 Final Prompt Debug:')
    console.log('  - System prompt:', processedPrompts.systemPrompt)
    console.log('  - User prompt:', processedPrompts.userPrompt)
    console.log('  - Dynamic inputs included:', dynamicInputs.length)
    console.log('  - Dynamic inputs:', dynamicInputs)
    console.log('  - Final prompt length:', finalPrompt.length)
    console.log('  - Final prompt preview:', finalPrompt.substring(0, 500))

    if (pipelineData.superAdminUser) {
      await aiServiceInstance.setUser(pipelineData.superAdminUser)
    } else {
      throw new Error('SuperAdmin user not provided for AI service')
    }

    if (!aiServiceInstance.providers[modelConfig.providerName]) {
      throw new Error(`Provider ${modelConfig.providerName} not available. Please check API key configuration.`)
    }

    const providerConfig = aiServiceInstance.providers[modelConfig.providerName]
    if (!providerConfig.apiKey) {
      throw new Error(`No API key configured for ${modelConfig.providerName}. Please add API key in SuperAdmin settings.`)
    }

    let aiResponse

    try {
      aiResponse = await Promise.race([
        aiServiceInstance.generateContent(finalPrompt, modelConfig.providerName, finalMaxTokens, modelConfig.model),
        timeoutPromise
      ])
      console.log('✅ AI generation succeeded:', modelConfig.providerName, modelConfig.model)
    } catch (error) {
      console.error(`❌ AI generation failed with ${modelConfig.providerName} (${modelConfig.model}):`, error.message)

      const errorDetails = {
        provider: modelConfig.providerName,
        model: modelConfig.model,
        error: error.message,
        errorType: error.name || 'AIProviderError',
        timestamp: new Date().toISOString()
      }

      console.error('❌ AI generation error details:', errorDetails)

      let errorMessage = `AI generation failed with ${modelConfig.providerName} (${modelConfig.model}): `
      if (error.message?.includes('rate limit')) {
        errorMessage += 'Rate limit exceeded. Please try again later or check your API key limits.'
      } else if (error.message?.includes('timeout')) {
        errorMessage += 'Request timeout. The content may be too complex or the API is slow.'
      } else if (error.message?.includes('invalid')) {
        errorMessage += 'Invalid request. Please check your API configuration and content format.'
      } else if (error.message?.includes('authentication')) {
        errorMessage += 'Authentication failed. Please check your API keys.'
      } else {
        errorMessage += error.message || 'Unknown error'
      }

      throw new Error(errorMessage)
    }

    console.log('🔍 Validating AI response quality...')
    console.log('🔍 AI Response BEFORE validation:', JSON.stringify(aiResponse).substring(0, 500))
    console.log('🔍 AI Response type:', typeof aiResponse)
    console.log('🔍 AI Response keys:', Object.keys(aiResponse || {}))

    const nodeLabelLower = String(nodeData.label || '').toLowerCase()
    const nodeTypeLower = String(nodeData.type || nodeData.nodeType || nodeData.role || '').toLowerCase()
    const outputFormat = String(nodeData.outputFormat || '').toLowerCase()
    const contentType = String(nodeData.contentType || '').toLowerCase()

    const wantsOutline =
      nodeLabelLower.includes('outline') ||
      nodeTypeLower.includes('outline') ||
      outputFormat === 'outline' ||
      contentType === 'outline'

    const isNonWritingNode = nodeData.permissions && nodeData.permissions.canWriteContent === false
    const isWorldBuilder = nodeTypeLower.includes('world') || nodeLabelLower.includes('world-building') || nodeLabelLower.includes('world building')
    const isPlotArchitect = nodeTypeLower.includes('plot') || nodeLabelLower.includes('plot architecture') || nodeLabelLower.includes('plot')
    const isCharacterDev = nodeLabelLower.includes('character development') || nodeLabelLower.includes('character')
    const isStoryOutliner = nodeTypeLower.includes('outliner') || nodeLabelLower.includes('story architect') || nodeLabelLower.includes('story outline')

    let finalContentType = 'chapter'

    const isImageNode = nodeLabelLower.includes('image') || nodeLabelLower.includes('generator') || nodeData.type === 'image'

    if (isImageNode) {
      finalContentType = 'image_metadata'
    } else if (wantsOutline || isStoryOutliner) {
      finalContentType = 'outline'
    } else if (isWorldBuilder || isPlotArchitect || isCharacterDev) {
      finalContentType = 'world_data'
    } else if (isNonWritingNode) {
      finalContentType = 'data'
    }

    console.log('🔍 Content type detection debug:')
    console.log('  - Node label:', nodeData.label)
    console.log('  - Node type:', nodeData.type)
    console.log('  - Output format:', nodeData.outputFormat)
    console.log('  - Content type (from nodeData):', nodeData.contentType)
    console.log('  - Wants outline:', wantsOutline)
    console.log('  - Final content type for validator:', finalContentType)

    const validation = aiResponseValidator.validateResponse(aiResponse, finalContentType, allData, nodeData.permissions)

    console.log('🤖 AI Response Debug:')
    console.log('  - Raw response type:', typeof aiResponse)
    console.log('  - Validation result:', validation.isValid ? '✅ VALID' : '❌ INVALID')
    console.log('  - Errors:', validation.errors)
    console.log('  - Warnings:', validation.warnings)
    console.log('  - Extracted content length:', validation.content?.length || 0)
    console.log('  - Content preview:', validation.content?.substring(0, 200))

    if (!validation.isValid) {
      const errorReport = aiResponseValidator.createErrorReport(validation)
      console.error('❌ AI Response Validation Failed:', errorReport)

      const errorMessage = validation.errors
        .map(e => `${e.code}: ${e.message}`)
        .join('; ')

      throw new Error(`AI response validation failed: ${errorMessage}. Recommendation: ${errorReport.recommendation}`)
    }

    const content = validation.content
    const actualWordCount = typeof content === 'string' ? content.split(' ').length : 0

    let actualTokens = 0
    let actualCost = 0

    if (aiResponse && aiResponse.usage) {
      actualTokens = aiResponse.usage.total_tokens ||
        aiResponse.usage.completion_tokens ||
        aiResponse.token_count ||
        Math.ceil(actualWordCount * 1.3)

      const modelCostPer1k = modelConfig.costPer1k || 0.00003
      actualCost = (actualTokens / 1000) * modelCostPer1k
    } else {
      actualTokens = Math.ceil(actualWordCount * 1.3)
      actualCost = (actualTokens / 1000) * (modelConfig.costPer1k || 0.00003)
    }

    if (progressCallback) {
      progressCallback({
        nodeId: nodeData.id,
        nodeName: nodeData.label || 'AI Generation',
        status: 'processing',
        progress: 75,
        providerName: modelConfig.providerName,
        timestamp: new Date().toLocaleTimeString(),
        cost: actualCost,
        tokens: actualTokens,
        words: actualWordCount,
        aiResponse: aiResponse,
        processedContent: content,
        rawData: {
          model: selectedModels[0],
          provider: modelConfig.provider,
          providerName: modelConfig.providerName,
          temperature: temperature || 0.7,
          maxTokens: maxTokens || 8000,
          systemPrompt: processedPrompts.systemPrompt,
          userPrompt: processedPrompts.userPrompt,
          inputData: allData,
          dynamicInputs: Object.keys(allData),
          modelCostPer1k: modelConfig.costPer1k,
          actualTokens: actualTokens,
          actualCost: actualCost
        }
      })
    }

    if (progressCallback) {
      progressCallback({
        nodeId: nodeData.id,
        nodeName: nodeData.label || 'AI Generation',
        status: 'completed',
        progress: 100,
        providerName: modelConfig.providerName,
        timestamp: new Date().toLocaleTimeString(),
        cost: actualCost,
        tokens: actualTokens,
        words: actualWordCount,
        output: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
        aiResponse: aiResponse,
        processedContent: content,
        rawData: {
          model: selectedModels[0],
          provider: modelConfig.provider,
          temperature,
          maxTokens,
          systemPrompt: processedPrompts.systemPrompt,
          userPrompt: processedPrompts.userPrompt,
          inputData: previousOutput,
          dynamicInputs: dynamicInputs,
          modelCostPer1k: modelConfig.costPer1k
        }
      })
    }

    const combinedDataPackage = {
      type: 'ai_generation',
      content: content,
      nodeName: nodeData.label || nodeData.id,
      modelName: selectedModels[0],
      previousNodePassover: pipelineData.previousNodePassover,
      aiMetadata: {
        model: selectedModels[0],
        provider: modelConfig.provider,
        providerName: modelConfig.providerName,
        tokens: actualTokens,
        cost: actualCost,
        words: actualWordCount,
        modelCostPer1k: modelConfig.costPer1k
      },
      processedContent: content,
      aiResponse: aiResponse,
      tokens: actualTokens,
      words: actualWordCount,
      inputData: previousOutput,
      instructions: inputInstructions,
      metadata: {
        nodeId: nodeData.id || 'process-node',
        nodeName: nodeData.label || nodeData.id,
        timestamp: new Date(),
        processingTime: aiResponse.processingTime || 0,
        dataPreservation: 'complete_context_maintained',
        permissions: nodeData.permissions
      }
    }

    console.log('🔗 COMBINED DATA PACKAGE: AI output + previous node data ready for next node')
    console.log('   - AI content length:', content?.length || 0)
    console.log('   - Previous data preserved:', !!pipelineData.previousNodePassover)

    return combinedDataPackage
  } catch (error) {
    throw new Error(`AI generation failed: ${error.message}`)
  }
}

/**
 * Generate multiple chapters with retries + partial book handling
 */
async function generateMultipleChapters({
  nodeData,
  pipelineData,
  chapterCount,
  progressCallback = null,
  workflowId = null,
  helpers = {}
}) {
  const {
    isWorkflowStopped,
    checkDatabaseStopSignal,
    convertResultsToNodeOutputs,
    processPromptVariables,
    parseModelConfig,
    getAIService,
    extractChapterTitle
  } = helpers

  assertHelper(isWorkflowStopped, 'isWorkflowStopped')
  assertHelper(checkDatabaseStopSignal, 'checkDatabaseStopSignal')
  assertHelper(convertResultsToNodeOutputs, 'convertResultsToNodeOutputs')

  const generationHelpers = {
    processPromptVariables: assertHelper(processPromptVariables, 'processPromptVariables'),
    isWorkflowStopped,
    checkDatabaseStopSignal,
    parseModelConfig: assertHelper(parseModelConfig, 'parseModelConfig'),
    getAIService: assertHelper(getAIService, 'getAIService')
  }
  const chapterTitleHelper = assertHelper(extractChapterTitle, 'extractChapterTitle')

  const results = []

  console.log(`🔍 GENERATING ${chapterCount} CHAPTERS`)

  for (let i = 1; i <= chapterCount; i++) {
    if (workflowId && (isWorkflowStopped(workflowId) || await checkDatabaseStopSignal(workflowId))) {
      console.log(`🛑 WORKFLOW STOPPED DURING CHAPTER GENERATION - PRESERVING ${results.length} COMPLETED CHAPTERS`)

      if (results.length > 0) {
        const nodeOutputs = convertResultsToNodeOutputs(results)
        const partialBookResult = await bookCompilationService.compileBook(nodeOutputs, pipelineData.userInput)
        const partialBook = partialBookResult.content
        return {
          type: 'partial_book',
          content: partialBook,
          metadata: {
            nodeId: nodeData.id,
            timestamp: new Date(),
            chaptersCompleted: results.length,
            totalChapters: chapterCount,
            stopped: true,
            partialGeneration: true
          },
          partialResults: results,
          stopped: true,
          message: `Workflow stopped. ${results.length} of ${chapterCount} chapters completed.`
        }
      } else {
        return {
          type: 'stopped_no_content',
          content: 'Workflow stopped before any chapters were generated.',
          metadata: {
            nodeId: nodeData.id,
            timestamp: new Date(),
            chaptersCompleted: 0,
            totalChapters: chapterCount,
            stopped: true
          },
          stopped: true,
          message: 'Workflow stopped before any content was generated.'
        }
      }
    }

    console.log(`🔍 GENERATING CHAPTER ${i} OF ${chapterCount}`)

    const chapterPipelineData = {
      ...pipelineData,
      currentChapter: i,
      totalChapters: chapterCount,
      previousChapters: results
    }

    const MAX_RETRIES = 3
    let chapterResult = null
    let lastChapterError = null

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`🔄 Chapter ${i} Generation Attempt ${attempt}/${MAX_RETRIES}`)

        const chapterProgressCallback = progressCallback ? (update) => {
          progressCallback({
            ...update,
            chapterInfo: {
              current: i,
              total: chapterCount,
              chapterStatus: update.status || 'generating'
            }
          })
        } : null

        chapterResult = await executeSingleAIGeneration({
          nodeData,
          pipelineData: chapterPipelineData,
          progressCallback: chapterProgressCallback,
          workflowId: null,
          helpers: generationHelpers
        })

        const chapterValidation = aiResponseValidator.validateResponse(
          { content: chapterResult.content },
          'chapter',
          pipelineData,
          nodeData.permissions
        )

        if (!chapterValidation.isValid) {
          const validationErrors = chapterValidation.errors
            .map(e => `${e.code}: ${e.message}`)
            .join('; ')

          throw new Error(`Chapter validation failed: ${validationErrors}`)
        }

        console.log(`✅ Chapter ${i} validated successfully`)
        break
      } catch (error) {
        lastChapterError = error
        console.error(`❌ Chapter ${i} Attempt ${attempt} failed:`, error.message)

        if (attempt < MAX_RETRIES) {
          const backoffDelay = Math.pow(2, attempt) * 1000
          console.log(`⏳ Waiting ${backoffDelay}ms before retry...`)
          await new Promise(resolve => setTimeout(resolve, backoffDelay))
        }
      }
    }

    if (!chapterResult) {
      const errorMessage = `Chapter ${i} generation failed after ${MAX_RETRIES} attempts. Last error: ${lastChapterError?.message}`
      console.error(`🚨 ${errorMessage}`)

      if (progressCallback) {
        progressCallback({
          nodeId: nodeData.id,
          nodeName: `${nodeData.label} (Failed)`,
          status: 'failed',
          error: errorMessage,
          chapterInfo: {
            currentChapter: i,
            totalChapters: chapterCount,
            chapterStatus: 'failed',
            attemptsBeforeFailing: MAX_RETRIES
          }
        })
      }

      throw new Error(errorMessage)
    }

    results.push({
      chapter: i,
      content: chapterResult.content,
      metadata: chapterResult.metadata,
      aiMetadata: chapterResult.aiMetadata
    })

    console.log(`✅ CHAPTER ${i} COMPLETED: ${chapterResult.content.length} characters`)

    if (progressCallback) {
      const chapterCompleteProgress = (i / chapterCount) * 100
      const liveChapters = results.map((r, idx) => ({
        id: `chapter_${idx + 1}`,
        number: idx + 1,
        chapterNumber: idx + 1,
        title: chapterTitleHelper(r.content) || `Chapter ${idx + 1}`,
        content: r.content,
        words: r.aiMetadata?.words || (typeof r.content === 'string' ? r.content.split(/\s+/).filter(Boolean).length : 0),
        metadata: r.metadata || {}
      }))
      const liveStoryContext = {
        chapters: liveChapters,
        structural: pipelineData?.storyContext?.structural || null,
        assets: pipelineData?.storyContext?.assets || null,
        metadata: {
          totalChapters: liveChapters.length,
          updatedAt: new Date().toISOString()
        }
      }
      progressCallback({
        nodeId: nodeData.id,
        nodeName: `${nodeData.label} (Chapter ${i}/${chapterCount} Complete)`,
        status: i === chapterCount ? 'completed' : 'executing',
        progress: Math.round(chapterCompleteProgress),
        providerName: chapterResult.aiMetadata?.provider || null,
        timestamp: new Date().toLocaleTimeString(),
        cost: chapterResult.aiMetadata?.cost || 0,
        tokens: chapterResult.aiMetadata?.tokens || 0,
        words: chapterResult.aiMetadata?.words || 0,
        storyContext: liveStoryContext,
        chapterInfo: {
          currentChapter: i,
          totalChapters: chapterCount,
          chapterStatus: 'completed',
          chapterWordCount: chapterResult.aiMetadata?.words || 0
        }
      })
    }

    if (workflowId && (isWorkflowStopped(workflowId) || await checkDatabaseStopSignal(workflowId))) {
      console.log(`🛑 WORKFLOW STOPPED AFTER CHAPTER ${i} - PRESERVING ${results.length} COMPLETED CHAPTERS`)

      const nodeOutputs = convertResultsToNodeOutputs(results)
      const partialBookResult = await bookCompilationService.compileBook(nodeOutputs, pipelineData.userInput)
      const partialBook = partialBookResult.content
      return {
        type: 'partial_book',
        content: partialBook,
        metadata: {
          nodeId: nodeData.id,
          timestamp: new Date(),
          chaptersCompleted: results.length,
          totalChapters: chapterCount,
          stopped: true,
          partialGeneration: true
        },
        partialResults: results,
        stopped: true,
        message: `Workflow stopped. ${results.length} of ${chapterCount} chapters completed.`
      }
    }

    if (i < chapterCount) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  const nodeOutputs = convertResultsToNodeOutputs(results)
  const completeBookResult = await bookCompilationService.compileBook(nodeOutputs, pipelineData.userInput)
  const completeBook = completeBookResult.content

  const totalWords = results.reduce((sum, result) => sum + (result.aiMetadata?.words || 0), 0)
  const totalTokens = results.reduce((sum, result) => sum + (result.aiMetadata?.tokens || 0), 0)
  const totalCost = results.reduce((sum, result) => sum + (result.aiMetadata?.cost || 0), 0)

  return {
    type: 'multi_chapter_generation',
    content: completeBook,
    chapters: results,
    // SURGICAL FIX: Set tokens at root level for frontend compatibility (AI Thinking Modal reads result.tokens)
    tokens: totalTokens,
    words: totalWords,
    cost: totalCost,
    aiMetadata: {
      model: nodeData.selectedModels[0],
      provider: results[0]?.aiMetadata?.provider || null,
      providerName: results[0]?.aiMetadata?.providerName || null,
      totalChapters: chapterCount,
      totalWords: totalWords,
      totalTokens: totalTokens,
      totalCost: totalCost,
      // SURGICAL FIX: Also set tokens at aiMetadata level for compatibility
      tokens: totalTokens,
      words: totalWords,
      cost: totalCost
    },
    metadata: {
      nodeId: nodeData.id || 'process-node',
      nodeName: nodeData.label || nodeData.id || 'Process Node',
      role: nodeData.role || 'writer',
      permissions: nodeData.permissions || {
        canWriteContent: true,
        canEditStructure: false,
        canProofRead: false
      },
      timestamp: new Date(),
      chapterCount: chapterCount,
      totalCharacters: completeBook.length
    },
    structuredData: {
      ...pipelineData.userInput,
      currentChapter: chapterCount,
      totalChapters: chapterCount,
      totalWords: totalWords,
      _chapters: results
    }
  }
}

module.exports = {
  executeSingleAIGeneration,
  generateMultipleChapters
}

