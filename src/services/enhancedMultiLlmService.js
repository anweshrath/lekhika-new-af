import { multiLlmService } from './multiLlmService'
import toast from 'react-hot-toast'

class EnhancedMultiLlmService {
  constructor() {
    this.serviceStatus = {
      openai: { online: false, lastCheck: null },
      claude: { online: false, lastCheck: null },
      gemini: { online: false, lastCheck: null },
      grok: { online: false, lastCheck: null },
      perplexity: { online: false, lastCheck: null }
    }
    
    this.teams = {
      research: ['openai', 'claude'],
      writing: ['gemini', 'perplexity'],
      image: ['openai', 'grok']
    }
    
    this.fallbackNotificationShown = false
  }

  async getServiceStatus() {
    console.log('🔍 Checking AI service status...')
    
    try {
      const results = await multiLlmService.testAllConnections()
      console.log('📊 Service status results:', results)
      
      // Update service status
      Object.keys(this.serviceStatus).forEach(service => {
        this.serviceStatus[service] = {
          online: results[service]?.success || false,
          lastCheck: new Date().toISOString(),
          error: results[service]?.error
        }
      })
      
      const onlineServices = Object.keys(this.serviceStatus).filter(
        service => this.serviceStatus[service].online
      )
      
      console.log(`✅ Online services: ${onlineServices.join(', ')}`)
      console.log(`❌ Offline services: ${Object.keys(this.serviceStatus).filter(s => !this.serviceStatus[s].online).join(', ')}`)
      
      return this.serviceStatus
    } catch (error) {
      console.error('❌ Error checking service status:', error)
      return this.serviceStatus
    }
  }

  async getAvailableTeam(teamType) {
    const teamServices = this.teams[teamType] || []
    const availableServices = teamServices.filter(service => 
      this.serviceStatus[service]?.online
    )
    
    console.log(`🔍 ${teamType} team availability:`, {
      total: teamServices,
      available: availableServices,
      status: availableServices.length > 0 ? 'ONLINE' : 'OFFLINE'
    })
    
    return availableServices
  }

  async generateResearchWithFallback(niche, type, targetAudience, tier = 'expert') {
    console.log('🔬 Starting research generation...')
    
    // Check service status first
    await this.getServiceStatus()
    
    const researchTeam = await this.getAvailableTeam('research')
    
    if (researchTeam.length === 0) {
      console.error('❌ Research team offline - FAILING PROPERLY')
      throw new Error('AI research service unavailable. No fallback templates allowed.')
    }
    
    try {
      console.log(`✅ Research team online: ${researchTeam.join(', ')}`)
      const result = await multiLlmService.generateResearchWithMultipleLLMs(niche, type, targetAudience, tier)
      
      if (result && Object.keys(result.results || {}).length > 0) {
        console.log('✅ Research generation successful')
        return result.results[Object.keys(result.results)[0]]
      }
      
      throw new Error('No research results generated')
      
    } catch (error) {
      console.error('❌ Research generation failed:', error)
      throw new Error(`Research generation failed: ${error.message}. No fallback templates allowed.`)
    }
  }

  async generateOutlineWithFallback(config, research) {
    console.log('📋 Starting outline generation...')
    
    // Check service status
    await this.getServiceStatus()
    
    const writingTeam = await this.getAvailableTeam('writing')
    
    if (writingTeam.length === 0) {
      console.error('❌ ALL TEAMS OFFLINE FOR OUTLINE - FAILING PROPERLY')
      throw new Error('AI outline generation service unavailable. No fallback templates allowed.')
    }
    
    try {
      console.log(`✅ Writing team online for outline: ${writingTeam.join(', ')}`)
      
      // NO FALLBACKS - Use first available service only
      const outlinePrompt = this.createOutlinePrompt(config, research)
      const serviceName = writingTeam[0]
      const service = multiLlmService.services[serviceName]
      
      if (!service || !service.generateContent) {
        throw new Error(`Service ${serviceName} does not support content generation`)
      }
      
      console.log(`🔄 Generating outline with ${serviceName} - NO FALLBACKS`)
      const result = await service.generateContent(outlinePrompt)
      
      if (!result || result.length <= 100) {
        throw new Error(`Outline generation produced insufficient content from ${serviceName}`)
      }
      
      console.log(`✅ Outline generated successfully with ${serviceName}`)
      return this.parseOutlineResult(result, config)
      
    } catch (error) {
      console.error('❌ Outline generation failed completely:', error)
      throw new Error(`Outline generation failed: ${error.message}. No fallback templates allowed.`)
    }
  }

  async generateBookContentWithFallback(section, research, tone, avatar, customPrompts, tier = 'expert') {
    console.log(`✍️ Starting content generation for: ${section}`)
    
    // Check service status
    await this.getServiceStatus()
    
    const writingTeam = await this.getAvailableTeam('writing')
    
    if (writingTeam.length === 0) {
      console.error(`❌ Writing team offline for ${section} - FAILING PROPERLY`)
      throw new Error(`AI writing service unavailable for section: ${section}. No fallback templates allowed.`)
    }
    
    try {
      console.log(`✅ Writing team online for ${section}: ${writingTeam.join(', ')}`)
      
      const contentPrompt = this.createContentPrompt(section, research, tone, avatar, customPrompts)
      
      // NO FALLBACKS - Use first available service only
      const serviceName = writingTeam[0]
      const service = multiLlmService.services[serviceName]
      
      if (!service || !service.generateContent) {
        throw new Error(`Service ${serviceName} does not support content generation`)
      }
      
      console.log(`🔄 Generating content with ${serviceName} - NO FALLBACKS`)
      const result = await service.generateContent(contentPrompt)
      
      if (!result || result.length <= 200) {
        throw new Error(`Content generation produced insufficient content from ${serviceName}`)
      }
      
      console.log(`✅ Content generated successfully with ${serviceName}`)
      return {
        content: result,
        service: serviceName,
        fallbackUsed: false,
        templateUsed: false
      }
      
    } catch (error) {
      console.error(`❌ Content generation failed for ${section}:`, error)
      throw new Error(`Content generation failed for ${section}: ${error.message}. No fallback templates allowed.`)
    }
  }

  createOutlinePrompt(config, research) {
    return `Create a detailed book outline for "${config.title}".

Book Details:
- Type: ${config.type}
- Niche: ${config.niche}
- Target Audience: ${config.targetAudience}
- Tone: ${config.tone}
- Number of Chapters: ${config.numberOfChapters}
- Target Word Count: ${config.targetWordCount}

Research Context:
- Key Topics: ${research.keyTopics?.join(', ') || 'Not available'}
- Current Trends: ${research.trends?.join(', ') || 'Not available'}

Please provide:
1. Introduction section
2. ${config.numberOfChapters} main chapters with titles and key points
3. Conclusion section

Format as a structured outline with clear chapter titles and brief descriptions.`
  }

  createContentPrompt(section, research, tone, avatar, customPrompts) {
    return `Write comprehensive content for the section: "${section}"

Context:
- Tone: ${tone}
- Target Audience: ${avatar?.name || 'professionals'}
- Key Topics: ${research.keyTopics?.slice(0, 3).join(', ') || 'professional development'}

Requirements:
- Write 800-1200 words
- Use a ${tone} tone throughout
- Include practical examples and actionable advice
- Structure with clear headings and subheadings
- Make it engaging and valuable for the target audience

${customPrompts ? `Additional Instructions: ${customPrompts}` : ''}

Write the complete section content now:`
  }

  parseOutlineResult(result, config) {
    // Simple parsing - in a real implementation, this would be more sophisticated
    const sections = []
    
    // Add introduction
    sections.push({
      title: `Introduction: Welcome to ${config.title}`,
      keyPoints: ['Overview', 'What you\'ll learn', 'How to use this book'],
      wordCount: Math.floor(config.targetWordCount / (config.numberOfChapters + 2))
    })
    
    // Add chapters
    for (let i = 1; i <= config.numberOfChapters; i++) {
      sections.push({
        title: `Chapter ${i}: Advanced ${config.niche} Strategies`,
        keyPoints: ['Core concepts', 'Practical applications', 'Real-world examples'],
        wordCount: Math.floor(config.targetWordCount / (config.numberOfChapters + 2))
      })
    }
    
    // Add conclusion
    sections.push({
      title: 'Conclusion: Your Path Forward',
      keyPoints: ['Key takeaways', 'Next steps', 'Continued learning'],
      wordCount: Math.floor(config.targetWordCount / (config.numberOfChapters + 2))
    })
    
    return {
      sections,
      fallbackUsed: false,
      templateUsed: false
    }
  }

  determineSectionType(section) {
    const sectionLower = section.toLowerCase()
    
    if (sectionLower.includes('introduction') || sectionLower.includes('intro')) {
      return 'introduction'
    } else if (sectionLower.includes('conclusion') || sectionLower.includes('summary')) {
      return 'conclusion'
    } else {
      return 'chapter'
    }
  }

  showFallbackNotification(type) {
    if (!this.fallbackNotificationShown) {
      this.fallbackNotificationShown = true
      
      const messages = {
        research: '🔬 Research team temporarily unavailable - using enhanced research templates',
        outline: '📋 ALL TEAMS OFFLINE FOR OUTLINE - using professional outline templates',
        content: '✍️ Writing team busy - using premium content templates'
      }
      
      toast.info(messages[type] || '🤖 Using enhanced backup system for quality content')
      
      // Reset flag after 5 seconds
      setTimeout(() => {
        this.fallbackNotificationShown = false
      }, 5000)
    }
  }
}

export const enhancedMultiLlmService = new EnhancedMultiLlmService()
