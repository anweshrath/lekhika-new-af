const { accentInstructionService } = require('../accentInstructionService')
const { typographyService } = require('../typographyService')

function generateChapterContext(allData) {
  const currentChapter = allData.currentChapter
  const totalChapters = allData.totalChapters
  const previousChapters = allData.previousChapters

  if (!currentChapter || !totalChapters) return null

  let context = ''

  if (previousChapters && Array.isArray(previousChapters) && previousChapters.length > 0) {
    context += `Previous chapters for continuity:\n`
    previousChapters.forEach((chapter, index) => {
      const chapterNum = chapter.chapter || (index + 1)
      const content = chapter.content || ''
      const summary = content.length > 200 ? content.substring(0, 200) + '...' : content
      context += `Chapter ${chapterNum}: ${summary}\n\n`
    })
  }

  context += `You are currently writing Chapter ${currentChapter} of ${totalChapters}.`
  return context.trim()
}

function processPromptVariables({
  prompts,
  pipelineData,
  nodePermissions = null,
  sanitizeUserInputForNextNode,
  logger = console
}) {
  const { userInput, nodeOutputs, lastNodeOutput } = pipelineData

  let structuredData = userInput
  if (lastNodeOutput?.content?.user_input) {
    structuredData = lastNodeOutput.content.user_input
  } else if (lastNodeOutput?.structuredData) {
    structuredData = lastNodeOutput.structuredData
  }

  const curatedStructuredData = sanitizeUserInputForNextNode(structuredData) || {}
  const beforeKeys = structuredData && typeof structuredData === 'object' ? Object.keys(structuredData).length : 0
  const afterKeys = Object.keys(curatedStructuredData).length
  logger.log(`🔒 Curated user input for prompts: ${afterKeys}/${beforeKeys} keys retained`)

  const allData = {
    ...curatedStructuredData,
    ...(pipelineData.currentChapter && { currentChapter: pipelineData.currentChapter }),
    ...(pipelineData.totalChapters && { totalChapters: pipelineData.totalChapters }),
    ...(pipelineData.previousChapters && { previousChapters: pipelineData.previousChapters }),
    previous_node_output: lastNodeOutput || null,
    user_input_data: curatedStructuredData
  }

  Object.keys(allData).forEach(key => {
    if (allData[key] === undefined) {
      delete allData[key]
    }
  })

  logger.log(`🔍 Processed variables for node:`, {
    variablesCount: Object.keys(allData).length,
    hasPreviousOutput: !!allData.previous_node_output,
    hasUserInput: !!allData.user_input_data,
    chapterContext: !!allData.currentChapter
  })

  let enhancedSystemPrompt = prompts.systemPrompt || ''

  if (nodePermissions) {
    logger.log('🔐 NODE PERMISSIONS (enforced in validation, NOT injected into prompt):')
    logger.log('  - canWriteContent:', nodePermissions.canWriteContent)
    logger.log('  - canEditStructure:', nodePermissions.canEditStructure)
    logger.log('  - canProofRead:', nodePermissions.canProofRead)
  }

  logger.log('🔍 ALL INPUT VARIABLES DEBUG:')
  logger.log('  - pipelineData keys:', Object.keys(pipelineData))
  logger.log('  - userInput keys:', Object.keys(userInput))
  logger.log('  - allData keys:', Object.keys(allData))
  logger.log('  - Chapter Context:')
  logger.log('    - currentChapter:', pipelineData.currentChapter)
  logger.log('    - totalChapters:', pipelineData.totalChapters)
  logger.log('    - previousChapters:', pipelineData.previousChapters)

  const processTemplate = (template) => {
    if (!template) return ''
    return template.replace(/\{([^}]+)\}/g, (match, variable) => {
      let value = allData[variable] ||
        allData[variable.toLowerCase()] ||
        allData[variable.replace(/\s+/g, '_').toLowerCase()] ||
        allData[variable.replace(/\s+/g, '_')] ||
        `[${variable} not provided]`

      if (variable === 'currentChapter' && allData.currentChapter) {
        value = allData.currentChapter
      } else if (variable === 'totalChapters' && allData.totalChapters) {
        value = allData.totalChapters
      } else if (variable === 'previousChapters' && allData.previousChapters) {
        const previousChapters = allData.previousChapters
        if (Array.isArray(previousChapters) && previousChapters.length > 0) {
          value = previousChapters.map((chapter, index) => {
            const chapterNum = chapter.chapter || (index + 1)
            const content = chapter.content || ''
            const summary = content.length > 200 ? content.substring(0, 200) + '...' : content
            return `Chapter ${chapterNum}: ${summary}`
          }).join('\n\n')
        } else {
          value = 'No previous chapters available'
        }
      } else if (variable === 'previousChapterSummary' && allData.previousChapters) {
        const previousChapters = allData.previousChapters
        if (Array.isArray(previousChapters) && previousChapters.length > 0) {
          const lastChapter = previousChapters[previousChapters.length - 1]
          const chapterNum = lastChapter.chapter || previousChapters.length
          const content = lastChapter.content || ''
          const summary = content.length > 150 ? content.substring(0, 150) + '...' : content
          value = `In Chapter ${chapterNum}, ${summary}`
        } else {
          value = 'This is the first chapter'
        }
      }

      if (value === `[${variable} not provided]`) {
        const mappings = {
          'Book Title': 'book_title',
          'Author Name': 'author_name',
          'Author Bio': 'author_bio',
          'Word Count': 'word_count',
          'Chapter Count': 'chapter_count',
          'Tone': 'tone',
          'Accent': 'accent',
          'Target Audience': 'target_audience',
          'Industry Focus': 'industry_focus',
          'Custom Instructions': 'custom_instructions',
          'Include Case Studies': 'include_case_studies',
          'Include Templates': 'include_templates',
          'Include Worksheets': 'include_worksheets',
          'Research Level': 'research_level',
          'Practical Applications': 'practical_applications',
          'Content Depth': 'content_depth',
          'Publishing Format': 'publishing_format',
          'Business Model': 'business_model',
          'Typography Style': 'typography_style'
        }
        const mappedKey = mappings[variable]
        if (mappedKey && allData[mappedKey]) {
          value = allData[mappedKey]
        }
      }

      logger.log(`🔍 Variable ${variable}: ${value}`)
      return value
    })
  }

  const accent = allData.accent || allData['Language Accent'] || 'neutral'
  const tone = allData.tone || allData.Tone || 'professional'

  let baseUserPrompt = processTemplate(prompts.userPrompt)

  if (allData.currentChapter && allData.totalChapters && allData.totalChapters > 1) {
    const chapterContext = generateChapterContext(allData)
    if (chapterContext) {
      baseUserPrompt = chapterContext + '\n\n' + baseUserPrompt
      logger.log(`📚 CHAPTER CONTEXT ENHANCED PROMPT:`, chapterContext.substring(0, 200) + '...')
    }
  }

  if (accent && accent !== 'neutral') {
    baseUserPrompt = accentInstructionService.buildAccentSpecificPrompt(baseUserPrompt, accent, tone)
    logger.log(`🎯 ACCENT ENHANCED PROMPT for ${accent}:`, baseUserPrompt.substring(0, 200) + '...')
  }

  if (allData.typography_combo) {
    const typographyInstructions = typographyService.generateTypographyInstructions(allData.typography_combo)
    baseUserPrompt = baseUserPrompt + '\n\n' + typographyInstructions
    logger.log(`🎨 TYPOGRAPHY ENHANCED PROMPT for ${allData.typography_combo}:`, typographyInstructions.substring(0, 200) + '...')
  }

  const processedPrompts = {
    systemPrompt: processTemplate(enhancedSystemPrompt),
    userPrompt: baseUserPrompt
  }

  logger.log('🔍 PROCESSED SYSTEM PROMPT:', processedPrompts.systemPrompt.substring(0, 500) + '...')
  logger.log('🔍 PROCESSED USER PROMPT:', processedPrompts.userPrompt.substring(0, 500) + '...')

  return processedPrompts
}

module.exports = {
  processPromptVariables,
  generateChapterContext
}

