/**
 * Build an image generation prompt from previous node output plus user preferences.
 * Keeps logic isolated so every image-capable node uses the same source of truth.
 */
function buildImagePrompt(previousContent = {}, userInput = {}, nodeData = {}) {
  let contentSummary = ''

  if (typeof previousContent?.content === 'string') {
    contentSummary = previousContent.content.substring(0, 500)
  } else if (typeof previousContent === 'string') {
    contentSummary = previousContent.substring(0, 500)
  }

  const imageStyle = userInput.image_style || 'photorealistic'
  const mood = userInput.mood || 'neutral'
  const composition = userInput.composition || 'centered'
  const aspectRatio = userInput.aspect_ratio || '16:9'

  const prompt = `Generate an image for this story:

STORY CONTEXT:
${contentSummary}

IMAGE SPECIFICATIONS:
- Style: ${imageStyle}
- Mood: ${mood}
- Composition: ${composition}
- Aspect Ratio: ${aspectRatio}

Create a visually striking image that captures the essence of the story.`

  return prompt
}

module.exports = {
  buildImagePrompt
}

