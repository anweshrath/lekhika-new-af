function assertHelper(helper, name) {
  if (typeof helper !== 'function') {
    throw new Error(`outputHandler missing required helper: ${name}`)
  }
  return helper
}

async function executeOutputNode({
  nodeData,
  pipelineData,
  helpers = {}
}) {
  const {
    compileWorkflowContent,
    formatFinalOutput,
    generateDeliverables
  } = helpers

  assertHelper(compileWorkflowContent, 'compileWorkflowContent')
  assertHelper(formatFinalOutput, 'formatFinalOutput')
  assertHelper(generateDeliverables, 'generateDeliverables')

  const { outputFormat, exportFormats, generateCover, includeImages, includeTOC } = nodeData
  const allNodeOutputs = pipelineData.nodeOutputs || {}

  const compiledContent = compileWorkflowContent(allNodeOutputs, pipelineData.userInput)

  console.log('🔍 COMPILED CONTENT VALIDATION:')
  console.log('  - Total sections:', compiledContent.sections.length)
  console.log('  - Total words:', compiledContent.totalWords)
  console.log('  - Total characters:', compiledContent.totalCharacters)

  const invalidSections = compiledContent.sections.filter(section => {
    return !section.title || !section.content || typeof section.content !== 'string' || section.content.trim().length === 0
  })

  if (invalidSections.length > 0) {
    console.error('❌ INVALID SECTIONS DETECTED:', invalidSections)
    console.error('  - Sections missing title:', invalidSections.filter(s => !s.title).length)
    console.error('  - Sections missing content:', invalidSections.filter(s => !s.content).length)
    console.error('  - Sections with empty content:', invalidSections.filter(s => !s.content || !s.content.trim()).length)
  }

  if (compiledContent.sections.length === 0) {
    const errorMsg = `No valid sections found for export. Total nodes processed: ${compiledContent.metadata.nodeCount}, Total words: ${compiledContent.totalWords}`
    console.error('❌', errorMsg)
    throw new Error(errorMsg)
  }

  let userInputFormats =
    pipelineData.userInput.output_formats ||
    pipelineData.userInput.outputFormats ||
    pipelineData.userInput.exportFormats ||
    pipelineData.userInput['Output Formats'] ||
    pipelineData.userInput['output formats'] ||
    []

  const nodeFormats = exportFormats || []

  console.log('📝 RAW FORMAT INPUT DEBUG:')
  console.log('  - userInput keys:', Object.keys(pipelineData.userInput))
  console.log('  - output_formats:', pipelineData.userInput.output_formats)
  console.log('  - outputFormats:', pipelineData.userInput.outputFormats)
  console.log('  - exportFormats:', pipelineData.userInput.exportFormats)
  console.log('  - Output Formats:', pipelineData.userInput['Output Formats'])
  console.log('  - nodeFormats:', nodeFormats)

  if (typeof userInputFormats === 'string') {
    userInputFormats = userInputFormats.split(',').map(f => f.trim().toLowerCase())
  } else if (Array.isArray(userInputFormats)) {
    userInputFormats = userInputFormats.map(f => String(f).trim().toLowerCase())
  } else {
    userInputFormats = []
  }

  userInputFormats = userInputFormats.filter(f => f && f.length > 1)

  console.log('📝 PROCESSED FORMATS:')
  console.log('  - userInputFormats (processed):', userInputFormats)
  console.log('  - nodeFormats:', nodeFormats)

  const finalExportFormats =
    userInputFormats.length > 0
      ? userInputFormats
      : nodeFormats.length > 0
        ? nodeFormats
        : [outputFormat || 'markdown']

  console.log('🎯 User input formats:', userInputFormats)
  console.log('🎯 Final export formats:', finalExportFormats)

  console.log('🎯 Output node format resolution:')
  console.log('  - User input formats:', userInputFormats)
  console.log('  - Node formats:', nodeFormats)
  console.log('  - Final formats:', finalExportFormats)

  let formattedOutput
  try {
    formattedOutput = await formatFinalOutput(compiledContent, {
      outputFormat,
      exportFormats: finalExportFormats,
      generateCover,
      includeImages,
      includeTOC
    })
  } catch (error) {
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      compiledContent: {
        sectionsCount: compiledContent.sections.length,
        sectionsStructure: compiledContent.sections.map(s => ({
          hasTitle: !!s.title,
          hasContent: !!s.content,
          contentLength: typeof s.content === 'string' ? s.content.length : 0,
          chapterNumber: s.chapterNumber,
          contentType: s.contentType
        })),
        totalWords: compiledContent.totalWords,
        totalCharacters: compiledContent.totalCharacters
      },
      requestedFormats: finalExportFormats,
      nodeOutputs: Object.keys(allNodeOutputs)
    }

    console.error('❌ EXPORT FAILURE - DETAILED DEBUG INFO:')
    console.error(JSON.stringify(errorDetails, null, 2))

    throw new Error(
      `Export failed: ${error.message}. Sections: ${compiledContent.sections.length}, ` +
      `Valid sections: ${compiledContent.sections.filter(s => s.title && s.content).length}`
    )
  }

  try {
    const audioRequested = finalExportFormats.filter(f =>
      ['mp3', 'wav', 'm4a', 'audiobook'].includes((f || '').toLowerCase())
    )
    if (audioRequested.length > 0) {
      const missing = audioRequested.filter(
        f => !(formattedOutput?.allFormats && formattedOutput.allFormats[f])
      )
      if (missing.length > 0) {
        console.warn('⚠️ Audio formats requested but not generated:', missing)
      } else {
        console.log('✅ Audio formats generated:', audioRequested)
      }
    }
  } catch (e) {
    console.warn('Audio verification skipped:', e?.message)
  }

  const outputResult = {
    type: 'final_output',
    content: formattedOutput.content || formattedOutput,
    compiledData: compiledContent,
    deliverables: generateDeliverables(formattedOutput, nodeData),
    allFormats: formattedOutput.allFormats || {},
    requestedFormats: finalExportFormats,
    availableFormats: Object.keys(formattedOutput.allFormats || {}),
    metadata: {
      nodeId: nodeData.id || 'output-node',
      timestamp: new Date(),
      totalWords: compiledContent.totalWords || 0,
      totalCharacters: compiledContent.totalCharacters || 0,
      nodeCount: compiledContent.metadata?.nodeCount || 0,
      wordCountByNode: compiledContent.metadata?.wordCountByNode || {},
      characterCountByNode: compiledContent.metadata?.characterCountByNode || {},
      formats: finalExportFormats,
      allFormats: formattedOutput.allFormats || {},
      primaryFormat: formattedOutput.primaryFormat || finalExportFormats[0],
      requestedFormats: formattedOutput.requestedFormats || finalExportFormats,
      userRequestedFormats: userInputFormats,
      nodeRequestedFormats: nodeFormats,
      generationStats: {
        totalSections: compiledContent.sections.length,
        averageWordsPerSection:
          compiledContent.sections.length > 0
            ? Math.round(compiledContent.totalWords / compiledContent.sections.length)
            : 0,
        averageCharactersPerSection:
          compiledContent.sections.length > 0
            ? Math.round(compiledContent.totalCharacters / compiledContent.sections.length)
            : 0,
        formatsGenerated: Object.keys(formattedOutput.allFormats || {}).length,
        formatDetails: Object.keys(formattedOutput.allFormats || {}).map(format => ({
          format,
          size:
            typeof formattedOutput.allFormats[format] === 'string'
              ? formattedOutput.allFormats[format].length
              : JSON.stringify(formattedOutput.allFormats[format]).length
        }))
      }
    }
  }

  console.log('✅ OUTPUT NODE RESULT:')
  console.log('  - Available formats:', outputResult.availableFormats)
  console.log('  - Requested formats:', outputResult.requestedFormats)
  console.log('  - User requested:', userInputFormats)
  console.log('  - Node requested:', nodeFormats)
  console.log('  - Format details:', outputResult.metadata.generationStats.formatDetails)

  return outputResult
}

module.exports = {
  executeOutputNode
}

