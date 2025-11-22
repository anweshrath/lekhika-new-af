const { getCelebrityStyle } = require('../../../config/celebrityStyles.js')

function assertHelper(helper, name) {
  if (typeof helper !== 'function') {
    throw new Error(`contentRefinementHandler missing required helper: ${name}`)
  }
  return helper
}

async function executeContentRefinement({
  nodeData,
  pipelineData,
  progressCallback = null,
  workflowId = null,
  helpers = {}
}) {
  const {
    processPromptVariables,
    assessContentQuality,
    isWorkflowStopped,
    checkDatabaseStopSignal,
    parseModelConfig,
    getAIService
  } = helpers

  assertHelper(processPromptVariables, 'processPromptVariables')
  assertHelper(assessContentQuality, 'assessContentQuality')
  assertHelper(isWorkflowStopped, 'isWorkflowStopped')
  assertHelper(checkDatabaseStopSignal, 'checkDatabaseStopSignal')
  assertHelper(parseModelConfig, 'parseModelConfig')
  assertHelper(getAIService, 'getAIService')

  const { selectedModels, systemPrompt, userPrompt, temperature, maxTokens, inputInstructions } = nodeData

  const previousOutput = pipelineData.lastNodeOutput || pipelineData.userInput

  console.log('🔍 EDITOR NODE - Previous output check:', {
    hasPreviousOutput: !!previousOutput,
    previousOutputType: typeof previousOutput,
    hasContent: !!previousOutput?.content,
    hasChapters: !!previousOutput?.chapters,
    hasAllChapters: !!previousOutput?.allChapters,
    contentLength: previousOutput?.content?.length,
    keys: previousOutput ? Object.keys(previousOutput) : []
  })

  let contentToEdit = null
  if (previousOutput?.content) {
    contentToEdit = previousOutput.content
  } else if (previousOutput?.allChapters && previousOutput.allChapters.length > 0) {
    contentToEdit = previousOutput.allChapters.map((ch, i) => {
      const title = ch.title || `Chapter ${i + 1}`
      const content = ch.content || ch.text || ''
      return `# ${title}\n\n${content}`
    }).join('\n\n')
    console.log('✅ EDITOR: Combined chapters into content for editing')
  } else if (previousOutput?.chapters && previousOutput.chapters.length > 0) {
    contentToEdit = previousOutput.chapters.map((ch, i) => {
      const title = ch.title || `Chapter ${i + 1}`
      const content = ch.content || ch.text || ''
      return `# ${title}\n\n${content}`
    }).join('\n\n')
    console.log('✅ EDITOR: Combined chapters (alt structure) into content for editing')
  } else if (typeof previousOutput === 'string') {
    contentToEdit = previousOutput
  }

  if (!contentToEdit || contentToEdit.trim().length === 0) {
    console.error('❌ EDITOR ERROR: No content found to edit', {
      previousOutput,
      pipelineData: {
        hasLastNodeOutput: !!pipelineData.lastNodeOutput,
        hasUserInput: !!pipelineData.userInput,
        nodeOutputsKeys: Object.keys(pipelineData.nodeOutputs || {})
      }
    })
    throw new Error('No content available for refinement. Editor node must come after a content generation node.')
  }

  console.log(`✅ EDITOR: Found ${contentToEdit.length} characters to edit`)

  if (!previousOutput.content) {
    previousOutput.content = contentToEdit
  }

  const contentQualityCheck = assessContentQuality(previousOutput.content)

  if (contentQualityCheck.isHighQuality) {
    console.log('✅ Content is already high quality, skipping refinement')
    console.log(`📊 Quality metrics: ${contentQualityCheck.score}/100, Word count: ${contentQualityCheck.wordCount}`)

    return {
      success: true,
      output: {
        content: previousOutput.content,
        refinement: {
          skipped: true,
          reason: 'Content already meets quality standards',
          qualityScore: contentQualityCheck.score,
          wordCount: contentQualityCheck.wordCount,
          assessment: contentQualityCheck.assessment
        },
        metadata: {
          nodeType: 'editor',
          processingTime: 0,
          refinementSkipped: true,
          qualityScore: contentQualityCheck.score
        }
      }
    }
  }

  const processedPrompts = processPromptVariables({
    systemPrompt,
    userPrompt
  }, pipelineData, nodeData.permissions)

  const { userInput, nodeOutputs, lastNodeOutput } = pipelineData

  let structuredData = userInput
  if (lastNodeOutput?.content?.user_input) {
    structuredData = lastNodeOutput.content.user_input
  } else if (lastNodeOutput?.structuredData) {
    structuredData = lastNodeOutput.structuredData
  }

  const allData = {
    ...userInput,
    ...structuredData,
    existingContent: previousOutput.content,
    previousNodeOutput: previousOutput
  }

  console.log('🔍 Starting content refinement for Editor node')
  console.log('🔍 Previous content length:', previousOutput.content?.length || 0)

  if (!selectedModels || selectedModels.length === 0) {
    throw new Error('No AI models selected for Editor node. Please configure AI Integration in the node modal.')
  }

  if (workflowId && (isWorkflowStopped(workflowId) || await checkDatabaseStopSignal(workflowId))) {
    console.log('🛑 WORKFLOW STOPPED BEFORE EDITOR AI CALL')
    return {
      type: 'stopped_before_ai',
      content: 'Workflow stopped before content refinement could complete.',
      metadata: {
        nodeId: nodeData.id,
        timestamp: new Date(),
        stopped: true
      },
      stopped: true,
      message: 'Workflow stopped before content refinement.'
    }
  }

  const modelConfig = await parseModelConfig(selectedModels[0])
  console.log('🔍 Editor parsed model config:', modelConfig)
  const aiServiceInstance = getAIService(modelConfig.provider)

  if (progressCallback) {
    progressCallback({
      nodeId: nodeData.id,
      nodeName: nodeData.label || 'Content Refinement',
      status: 'executing',
      progress: 50,
      providerName: modelConfig.providerName,
      timestamp: new Date().toLocaleTimeString(),
      cost: 0,
      tokens: 0,
      words: 0,
      aiResponse: null,
      processedContent: null,
      rawData: {
        model: selectedModels[0],
        provider: modelConfig.provider,
        providerName: modelConfig.providerName,
        temperature: temperature || 0.3,
        maxTokens: maxTokens || 8000,
        systemPrompt: processedPrompts.systemPrompt,
        userPrompt: processedPrompts.userPrompt,
        inputData: allData,
        refinementMode: true
      }
    })
  }

  if (!aiServiceInstance) {
    throw new Error(`AI service not available for provider: ${modelConfig.provider}`)
  }

  try {
    const refinementPrompt = `
${processedPrompts.systemPrompt || 'You are an expert content editor and proofreader. Your role is to refine and improve existing content while maintaining its original intent and structure.'}

CONTENT TO REFINE:
${previousOutput.content}

REFINEMENT CHECKLIST:
- Fix any typos, grammatical errors, or spelling mistakes
- Ensure consistent tone and voice throughout
- Improve clarity and readability where needed
- Check for factual accuracy and logical flow
- Remove any hallucinations or made-up information
- Ensure proper formatting and structure
- Maintain the original content's intent and message
- Apply user-specific requirements (tone, accent, style preferences)

USER REQUIREMENTS:
${Object.entries(allData).filter(([key, value]) =>
  ['tone', 'accent', 'style', 'custom_instructions', 'branding_style'].includes(key) && value
).map(([key, value]) => `- ${key.replace(/_/g, ' ').toUpperCase()}: ${value}`).join('\n')}

${processedPrompts.userPrompt}

INSTRUCTIONS:
1. Read the existing content carefully
2. Identify areas that need improvement based on the checklist
3. Make only necessary corrections and improvements
4. Preserve the original structure and intent
5. Output the refined content with your changes clearly integrated

REFINED CONTENT:`

    let finalRefinementPrompt = refinementPrompt
    const celebrityStyleValue = allData.celebrity_style || userInput.celebrity_style
    if (celebrityStyleValue) {
      const celebrityData = getCelebrityStyle(celebrityStyleValue)
      if (celebrityData && celebrityData.styleGuide) {
        console.log(`🎭 CELEBRITY STYLE ACTIVATED (Refinement): ${celebrityData.label}`)
        finalRefinementPrompt = `${refinementPrompt}\n\n🎭 WRITING STYLE DIRECTIVE:\n${celebrityData.styleGuide}`
      }
    }

    if (pipelineData.superAdminUser) {
      await aiServiceInstance.setUser(pipelineData.superAdminUser)
    } else {
      throw new Error('SuperAdmin user not provided for AI service')
    }

    if (!aiServiceInstance.providers[modelConfig.providerName]) {
      throw new Error(`Provider ${modelConfig.providerName} not available. Please check API key configuration.`)
    }

    const timeoutDuration = 1800000
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`Content refinement timeout after ${timeoutDuration / 60000} minutes`)), timeoutDuration)
    })

    const aiPromise = aiServiceInstance.generateContent(
      finalRefinementPrompt,
      modelConfig.providerName,
      maxTokens || 8000,
      modelConfig.modelId
    )

    const aiResponse = await Promise.race([aiPromise, timeoutPromise])
    const refinedContent = aiResponse.content || aiResponse

    const actualTokens = aiResponse.tokens || 0
    const actualCost = aiResponse.cost || 0
    const actualWordCount = refinedContent.split(/\s+/).length

    console.log('✅ Content refinement completed')
    console.log(`   - Refined content length: ${refinedContent.length} characters`)
    console.log(`   - Word count: ${actualWordCount} words`)
    console.log(`   - Tokens used: ${actualTokens}`)
    console.log(`   - Cost: $${actualCost}`)

    if (progressCallback) {
      progressCallback({
        nodeId: nodeData.id,
        nodeName: nodeData.label || 'Content Refinement',
        status: 'completed',
        progress: 100,
        providerName: modelConfig.providerName,
        timestamp: new Date().toLocaleTimeString(),
        cost: actualCost,
        tokens: actualTokens,
        words: actualWordCount,
        output: refinedContent.substring(0, 200) + (refinedContent.length > 200 ? '...' : ''),
        aiResponse: aiResponse,
        processedContent: refinedContent,
        rawData: {
          model: selectedModels[0],
          provider: modelConfig.provider,
          temperature: temperature || 0.3,
          maxTokens: maxTokens || 8000,
          systemPrompt: processedPrompts.systemPrompt,
          userPrompt: processedPrompts.userPrompt,
          inputData: allData,
          originalContentLength: previousOutput.content?.length || 0,
          refinementMode: true
        }
      })
    }

    const refinedDataPackage = {
      type: 'content_refinement',
      content: refinedContent,
      previousNodePassover: pipelineData.previousNodePassover,
      originalContent: previousOutput.content,
      aiMetadata: {
        model: selectedModels[0],
        provider: modelConfig.provider,
        tokens: actualTokens,
        cost: actualCost,
        words: actualWordCount,
        modelCostPer1k: modelConfig.costPer1k,
        refinementMode: true
      },
      inputData: previousOutput,
      instructions: inputInstructions,
      metadata: {
        nodeId: nodeData.id || 'editor-node',
        timestamp: new Date(),
        processingTime: aiResponse.processingTime || 0,
        refinementApplied: true,
        originalLength: previousOutput.content?.length || 0,
        refinedLength: refinedContent.length
      }
    }

    console.log('🔗 REFINED DATA PACKAGE: Editor output ready for next node')
    console.log('   - Refined content length:', refinedContent?.length || 0)
    console.log('   - Original content preserved:', !!previousOutput.content)

    return refinedDataPackage
  } catch (error) {
    throw new Error(`Content refinement failed: ${error.message}`)
  }
}

module.exports = {
  executeContentRefinement
}

