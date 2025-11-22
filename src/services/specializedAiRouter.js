import { superAdminKeyService } from './superAdminKeyService'
import { aiServiceManager } from './aiServiceManager'

class SpecializedAiRouter {
  constructor() {
    this.teamCapabilities = {
      'SuperAdmin Research Team': {
        specialties: ['market research', 'trend analysis', 'competitive intelligence'],
        preferredServices: ['perplexity', 'google'],
        maxTokens: 3000
      },
      'SuperAdmin Writing Team': {
        specialties: ['content creation', 'copywriting', 'storytelling'],
        preferredServices: ['openai', 'anthropic'],
        maxTokens: 4000
      },
      'SuperAdmin Analysis Team': {
        specialties: ['data analysis', 'strategic insights', 'optimization'],
        preferredServices: ['openai', 'google'],
        maxTokens: 2500
      },
      'SuperAdmin Image Team': {
        specialties: ['visual content', 'image generation', 'design'],
        preferredServices: ['openai'],
        maxTokens: 1000
      }
    }
  }

  async routeResearchRequest(niche, type, audience) {
    try {
      const team = 'SuperAdmin Research Team'
      const capability = this.teamCapabilities[team]
      
      const prompt = `As the ${team}, conduct comprehensive research for a ${type} in the ${niche} niche targeting ${audience}.
      
      Research Requirements:
      - Identify 8-10 key topics that are trending and valuable
      - Analyze target audience pain points and desires
      - Find current market gaps and opportunities
      - Suggest content angles that would resonate
      - Provide competitive landscape insights
      
      Format your response as a structured research report with clear sections.`

      // Try preferred services in order
      for (const service of capability.preferredServices) {
        try {
          const apiKey = await superAdminKeyService.getApiKey(service)
          if (apiKey) {
            const result = await aiServiceManager.generateContent(service, prompt, {
              apiKey,
              maxTokens: capability.maxTokens
            })
            
            return {
              keyTopics: this.extractTopics(result.content),
              targetInsights: this.extractInsights(result.content),
              marketGaps: this.extractGaps(result.content),
              fullResearch: result.content,
              teamUsed: team,
              serviceUsed: service,
              tokensUsed: result.tokensUsed
            }
          }
        } catch (error) {
          console.warn(`${service} failed for research, trying next service:`, error.message)
          continue
        }
      }

      // NO FALLBACK TEMPLATES - FAIL PROPERLY
      throw new Error(`AI research service unavailable. No fallback templates allowed.`)
      
    } catch (error) {
      console.error('Research routing failed:', error)
      throw new Error(`AI research generation failed: ${error.message}. No fallback templates allowed.`)
    }
  }

  async routeOutlineRequest(config, research) {
    try {
      const team = 'SuperAdmin Analysis Team'
      const capability = this.teamCapabilities[team]
      
      const prompt = `As the ${team}, create a comprehensive outline for "${config.bookTitle}" - a ${config.type} in ${config.niche}.
      
      Research Context:
      ${research.fullResearch || 'No research available'}
      
      Target Audience: ${config.avatar?.name || 'professionals'}
      Tone: ${config.tone}
      Chapters: ${config.numberOfChapters}
      
      Create a detailed outline with:
      - Compelling chapter titles
      - Key points for each chapter
      - Logical flow and progression
      - Actionable takeaways
      - Engaging hooks and transitions`

      // Try preferred services
      for (const service of capability.preferredServices) {
        try {
          const apiKey = await superAdminKeyService.getApiKey(service)
          if (apiKey) {
            const result = await aiServiceManager.generateContent(service, prompt, {
              apiKey,
              maxTokens: capability.maxTokens
            })
            
            return {
              sections: this.parseOutline(result.content, config.numberOfChapters),
              fullOutline: result.content,
              teamUsed: team,
              serviceUsed: service,
              tokensUsed: result.tokensUsed
            }
          }
        } catch (error) {
          console.warn(`${service} failed for outline, trying next service:`, error.message)
          continue
        }
      }

      // NO FALLBACK TEMPLATES - FAIL PROPERLY
      throw new Error(`AI outline service unavailable. No fallback templates allowed.`)
      
    } catch (error) {
      console.error('Outline routing failed:', error)
      throw new Error(`AI outline service unavailable. No fallback templates allowed.`)
    }
  }

  async routeWritingRequest(sectionTitle, research, tone, avatar, customPrompts) {
    try {
      const team = 'SuperAdmin Writing Team'
      const capability = this.teamCapabilities[team]
      
      const prompt = `As the ${team}, write compelling content for the section: "${sectionTitle}"
      
      Context:
      ${research.fullResearch || 'General knowledge'}
      
      Writing Guidelines:
      - Tone: ${tone}
      - Target Audience: ${avatar?.name || 'professionals'}
      - Pain Points: ${avatar?.painPoints?.join(', ') || 'common challenges'}
      - Goals: ${avatar?.goals?.join(', ') || 'success and growth'}
      
      ${customPrompts ? `Special Instructions: ${customPrompts}` : ''}
      
      Create engaging, valuable content that:
      - Addresses the target audience directly
      - Provides actionable insights
      - Uses examples and case studies
      - Maintains the specified tone
      - Delivers real value
      
      Write 800-1200 words of high-quality content.`

      // Try preferred services
      for (const service of capability.preferredServices) {
        try {
          const apiKey = await superAdminKeyService.getApiKey(service)
          if (apiKey) {
            const result = await aiServiceManager.generateContent(service, prompt, {
              apiKey,
              maxTokens: capability.maxTokens
            })
            
            return {
              content: result.content,
              teamUsed: team,
              serviceUsed: service,
              tokensUsed: result.tokensUsed
            }
          }
        } catch (error) {
          console.warn(`${service} failed for writing, trying next service:`, error.message)
          continue
        }
      }

      // NO FALLBACK TEMPLATES - FAIL PROPERLY  
      throw new Error(`AI writing service unavailable for section: ${sectionTitle}. No fallback templates allowed.`)
      
    } catch (error) {
      console.error('Writing routing failed:', error)
      throw new Error(`AI writing service unavailable for section: ${sectionTitle}. No fallback templates allowed.`)
    }
  }

  async routeImageRequest(imagePrompts, imageTypes) {
    try {
      const team = 'SuperAdmin Image Team'
      
      // For now, return placeholder images since we don't have image generation setup
      const images = imagePrompts.map((prompt, index) => ({
        id: `img_${index}`,
        prompt: prompt,
        url: `https://via.placeholder.com/800x600/4F46E5/FFFFFF?text=Image+${index + 1}`,
        type: imageTypes[0] || 'illustration',
        teamUsed: team,
        serviceUsed: 'placeholder'
      }))

      return {
        images,
        teamUsed: team,
        serviceUsed: 'placeholder'
      }
      
    } catch (error) {
      console.error('Image routing failed:', error)
      return {
        images: [],
        teamUsed: 'Template Images',
        serviceUsed: 'fallback'
      }
    }
  }

  // Helper methods
  extractTopics(content) {
    // Simple topic extraction - look for numbered lists or bullet points
    const topics = []
    const lines = content.split('\n')
    
    lines.forEach(line => {
      if (line.match(/^\d+\./) || line.match(/^[-*•]/)) {
        const topic = line.replace(/^\d+\./, '').replace(/^[-*•]/, '').trim()
        if (topic.length > 10 && topic.length < 100) {
          topics.push(topic)
        }
      }
    })
    
    return topics.slice(0, 10)
  }

  extractInsights(content) {
    return {
      demographics: 'professionals',
      painPoints: ['time constraints', 'information overload', 'practical application'],
      preferences: ['actionable advice', 'real examples', 'step-by-step guidance']
    }
  }

  extractGaps(content) {
    return [
      'Lack of practical implementation guides',
      'Too much theory, not enough action',
      'Missing real-world examples'
    ]
  }

  parseOutline(content, numberOfChapters) {
    const sections = []
    const lines = content.split('\n')
    let currentSection = null
    
    lines.forEach(line => {
      if (line.match(/^(Chapter|Section|\d+\.)/i)) {
        if (currentSection) {
          sections.push(currentSection)
        }
        currentSection = {
          title: line.replace(/^\d+\./, '').replace(/^Chapter\s+\d+:?/i, '').trim(),
          type: 'chapter',
          keyPoints: []
        }
      } else if (currentSection && line.trim().match(/^[-*•]/)) {
        currentSection.keyPoints.push(line.replace(/^[-*•]/, '').trim())
      }
    })
    
    if (currentSection) {
      sections.push(currentSection)
    }
    
    // Ensure we have the right number of sections
    while (sections.length < numberOfChapters) {
      sections.push({
        title: `Chapter ${sections.length + 1}`,
        type: 'chapter',
        keyPoints: ['Key concepts', 'Practical applications', 'Action steps']
      })
    }
    
    return sections.slice(0, numberOfChapters)
  }

  // REMOVED: getFallbackResearch() - NO TEMPLATES ALLOWED

  // REMOVED: getFallbackOutline() - NO TEMPLATES ALLOWED

  // REMOVED: getFallbackContent() - NO TEMPLATES ALLOWED
}

export const specializedAiRouter = new SpecializedAiRouter()
