import { openaiService } from './openaiService'

class CoverService {
  async generateCover({ title, niche, tone, type }) {
    try {
      // Generate DALL-E prompt using GPT-4
      const dallePrompt = await openaiService.generateCoverPrompt(title, niche, tone, type)
      
      console.log('Generated DALL-E prompt:', dallePrompt)
      
      // Generate image with DALL-E
      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt: dallePrompt,
          n: 1,
          size: '1024x1024',
          quality: 'standard',
          style: 'natural'
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`DALL-E API error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`)
      }

      const data = await response.json()
      const imageUrl = data.data[0].url

      // Create Canva export URL (mock for now)
      const canvaUrl = `https://www.canva.com/design/import?image=${encodeURIComponent(imageUrl)}`

      return {
        imageUrl,
        canvaUrl,
        metadata: {
          prompt: dallePrompt,
          model: 'dall-e-3',
          size: '1024x1024',
          generatedAt: new Date().toISOString()
        }
      }
    } catch (error) {
      console.error('Cover generation error:', error)
      
      // Return fallback cover
      return {
        imageUrl: 'https://via.placeholder.com/400x600/4F46E5/FFFFFF?text=' + encodeURIComponent(title),
        canvaUrl: 'https://www.canva.com/create/book-covers/',
        metadata: {
          fallback: true,
          error: error.message,
          generatedAt: new Date().toISOString()
        }
      }
    }
  }
}

export const coverService = new CoverService()
