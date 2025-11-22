/**
 * Wire images to story context for live display
 * Extracted from workflowExecutionService.executeNode for modularity
 * 
 * @param {Object} result - Process node execution result
 * @param {Object} pipelineData - Current pipeline data (mutated)
 * @param {Function|null} progressCallback - Progress update callback
 * @param {Object} nodeData - Node configuration
 */
function wireImagesToStoryContext(result, pipelineData, progressCallback, nodeData) {
  try {
    const imgs = result?.assets?.images
    if (Array.isArray(imgs) && imgs.length > 0) {
      pipelineData.storyContext = pipelineData.storyContext || { chapters: [], structural: {}, assets: { images: [] } }
      const existing = Array.isArray(pipelineData.storyContext.assets?.images) ? pipelineData.storyContext.assets.images : []
      pipelineData.storyContext.assets.images = existing.concat(imgs)
      if (typeof progressCallback === 'function') {
        progressCallback({
          nodeId: nodeData.id,
          nodeName: nodeData.label || nodeData.id,
          status: 'executing',
          storyContext: pipelineData.storyContext
        })
      }
    }
  } catch (e) {
    console.warn('⚠️ Image wiring skipped:', e?.message)
  }
}

module.exports = {
  wireImagesToStoryContext
}


