function assertHelper(helper, name) {
  if (typeof helper !== 'function') {
    throw new Error(`previewHandler missing required helper: ${name}`)
  }
  return helper
}

async function executePreviewNode({
  nodeData,
  pipelineData,
  progressCallback = null,
  helpers = {}
}) {
  const {
    processPromptVariables,
    parseModelConfig,
    getAIService
  } = helpers

  assertHelper(processPromptVariables, 'processPromptVariables')
  assertHelper(parseModelConfig, 'parseModelConfig')
  assertHelper(getAIService, 'getAIService')

  const {
    aiEnabled,
    selectedModels,
    systemPrompt,
    userPrompt,
    maxAttempts = 3,
    previewLength = '1 chapter',
    currentAttempt = 0,
    customerFeedback = '',
    isApproved = false // kept for future compatibility
  } = nodeData

  if (!aiEnabled || !selectedModels || selectedModels.length === 0) {
    throw new Error('Preview node requires AI configuration')
  }

  const previousOutput = pipelineData.lastNodeOutput || pipelineData.userInput
  const userInput = pipelineData.userInput || {}

  const defaultSystemPrompt =
    systemPrompt || 'Generate a preview of the content based on the user requirements.'
  let userPromptTemplate =
    userPrompt || 'Create a preview that showcases the writing style and content quality.'

  if (customerFeedback) {
    userPromptTemplate += `\n\nCUSTOMER FEEDBACK TO ADDRESS:\n${customerFeedback}`
  }

  const processedPrompts = processPromptVariables({
    prompts: {
      systemPrompt: defaultSystemPrompt,
      userPrompt: userPromptTemplate
    },
    pipelineData,
    nodePermissions: nodeData.permissions || null
  })

  const modelConfig = await parseModelConfig(selectedModels[0])
  const aiServiceInstance = getAIService(modelConfig.provider)

  const executionUser = pipelineData.executionUser
  if (!executionUser || !executionUser.id) {
    throw new Error('Execution user not provided for AI service')
  }
  await aiServiceInstance.setUser(executionUser)

  if (!aiServiceInstance.providers[modelConfig.providerName]) {
    throw new Error(`Provider ${modelConfig.providerName} not available. Please check API key configuration.`)
  }

  const providerConfig = aiServiceInstance.providers[modelConfig.providerName]
  if (!providerConfig.apiKey) {
    throw new Error(`No API key configured for ${modelConfig.providerName}. Please add API key in SuperAdmin settings.`)
  }

  const finalPrompt = processedPrompts.systemPrompt
    ? `${processedPrompts.systemPrompt}\n\n${processedPrompts.userPrompt}`
    : processedPrompts.userPrompt

  const wordCount = userInput?.word_count || userInput?.['Word Count'] || '2000'
  const chapterCount = userInput?.chapter_count || userInput?.['Chapter Count'] || '1'
  const wordsPerChapter = Math.floor(parseInt(wordCount) / parseInt(chapterCount))
  const dynamicMaxTokens = Math.ceil(wordsPerChapter * 1.3 * 1.5)
  const finalMaxTokens = 16384

  console.log('🔍 PREVIEW NODE DYNAMIC MAX TOKENS:')
  console.log('  - wordsPerChapter:', wordsPerChapter)
  console.log('  - requested max tokens:', dynamicMaxTokens)
  console.log('  - finalMaxTokens (capped):', finalMaxTokens)

  const aiResponse = await aiServiceInstance.generateContent(
    finalPrompt,
    modelConfig.providerName,
    finalMaxTokens,
    modelConfig.modelId
  )

  const content = aiResponse.content || aiResponse.text || JSON.stringify(aiResponse)
  const actualWordCount = typeof content === 'string' ? content.split(' ').length : 0

  let actualTokens = 0
  let actualCost = 0
  if (aiResponse && aiResponse.usage) {
    actualTokens =
      aiResponse.usage.total_tokens ||
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
      nodeName: nodeData.label || 'Preview Generation',
      status: 'completed',
      progress: 100,
      providerName: modelConfig.providerName,
      timestamp: new Date().toLocaleTimeString(),
      cost: actualCost,
      tokens: actualTokens,
      words: actualWordCount,
      output: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
      aiResponse,
      processedContent: content,
      rawData: {
        model: selectedModels[0],
        provider: modelConfig.provider,
        systemPrompt: processedPrompts.systemPrompt,
        userPrompt: processedPrompts.userPrompt,
        inputData: previousOutput,
        customerFeedback,
        currentAttempt: currentAttempt + 1,
        maxAttempts,
        previewLength
      }
    })
  }

  return {
    type: 'preview_generation',
    content,
    aiMetadata: {
      model: selectedModels[0],
      provider: modelConfig.provider,
      tokens: actualTokens,
      cost: actualCost,
      words: actualWordCount,
      modelCostPer1k: modelConfig.costPer1k
    },
    inputData: previousOutput,
    instructions: processedPrompts.userPrompt,
    metadata: {
      nodeId: nodeData.id || 'preview-node',
      timestamp: new Date(),
      previewLength,
      currentAttempt: currentAttempt + 1,
      maxAttempts,
      customerFeedback,
      isApproved: false,
      totalCharacters: typeof content === 'string' ? content.length : 0
    },
    structuredData: {
      ...previousOutput?.structuredData,
      previewContent: content,
      previewApproved: false,
      previewAttempt: currentAttempt + 1
    }
  }
}

module.exports = {
  executePreviewNode
}

