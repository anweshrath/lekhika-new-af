const { buildImagePrompt } = require('../utils/imagePromptBuilder')

/**
 * Execute image generation using the shared AI provider instance.
 * All dependencies are injected to keep this module pure and testable.
 */
async function executeImageGeneration({
  nodeData,
  pipelineData,
  progressCallback = null,
  workflowId = null,
  parseModelConfig,
  getAIService
}) {
  if (!nodeData || !pipelineData) {
    throw new Error('Image generation handler requires nodeData and pipelineData')
  }

  if (typeof parseModelConfig !== 'function') {
    throw new Error('parseModelConfig helper is required for image generation')
  }

  if (typeof getAIService !== 'function') {
    throw new Error('getAIService helper is required for image generation')
  }

  const { selectedModels } = nodeData
  const { userInput } = pipelineData

  console.log('🎨 IMAGE GENERATION NODE DETECTED')
  console.log('🎨 Node:', nodeData.label || nodeData.id)
  console.log('🎨 Role:', nodeData.role)

  const previousOutput = pipelineData.lastNodeOutput || pipelineData.userInput
  const imagePrompt = buildImagePrompt(previousOutput, userInput, nodeData)

  console.log('🎨 Image prompt:', imagePrompt.substring(0, 300) + '...')

  if (!selectedModels || selectedModels.length === 0) {
    console.warn('⚠️ No AI models selected for image node - skipping gracefully')
    return {
      success: true,
      output: {
        type: 'image_skipped',
        content: '',
        skipped: true,
        reason: 'No image model configured',
        metadata: {
          nodeType: 'image',
          skipped: true
        }
      }
    }
  }

  const modelConfig = await parseModelConfig(selectedModels[0])
  const aiServiceInstance = getAIService(modelConfig.provider)

  if (!pipelineData.superAdminUser) {
    throw new Error('SuperAdmin user not provided for AI service')
  }

  await aiServiceInstance.setUser(pipelineData.superAdminUser)

  try {
    const imageResult = await aiServiceInstance.generateImage(imagePrompt, {
      provider: modelConfig.providerName,
      model: modelConfig.modelId,
      width: nodeData?.imageWidth || 1024,
      height: nodeData?.imageHeight || 1024
    })

    console.log('✅ Image generated successfully')
    console.log('🎨 Image payload received')

    const normalizedImages = Array.isArray(imageResult?.images)
      ? imageResult.images.map(img => {
          const url = img.url || (img.dataUri ? null : null)
          const dataUri = img.dataUri || (typeof url === 'string' && url.startsWith('data:') ? url : null)
          return {
            url: url && !url.startsWith('data:') ? url : null,
            dataUri: dataUri || (img.inlineData || null),
            mimeType: img.mimeType || 'image/png',
            prompt: img.prompt || imagePrompt,
            provider: img.provider || modelConfig.providerName,
            chapter: pipelineData?.currentChapter || null
          }
        })
      : []

    return {
      success: true,
      output: {
        type: 'image_generation',
        imageData: normalizedImages[0]?.url || normalizedImages[0]?.dataUri || null,
        inlineData: normalizedImages[0]?.dataUri || null,
        assets: {
          images: normalizedImages
        },
        metadata: {
          nodeType: 'image',
          nodeId: nodeData.id,
          nodeName: nodeData.label,
          timestamp: new Date(),
          model: modelConfig.modelId,
          provider: modelConfig.providerName,
          usage: imageResult.usage
        }
      }
    }
  } catch (error) {
    console.error('❌ Image generation failed:', error)
    console.log('⚠️ Skipping image generation gracefully due to error')

    return {
      success: true,
      output: {
        type: 'image_skipped',
        content: '',
        skipped: true,
        reason: error.message,
        metadata: {
          nodeType: 'image',
          skipped: true,
          error: error.message
        }
      }
    }
  }
}

module.exports = {
  executeImageGeneration
}

