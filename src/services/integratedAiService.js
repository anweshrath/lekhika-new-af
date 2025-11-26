import superAdminKeyService from './superAdminKeyService'
import aiServiceManager from './aiServiceManager'

class IntegratedAiService {
  constructor() {
    this.fallbackMode = false
  }

  async generateContent(prompt, options = {}) {
    try {
      // Get available API keys from SuperAdmin
      const keys = await superAdminKeyService.getAllActiveKeys()
      
      if (Object.keys(keys).length === 0) {
        throw new Error('No API keys configured. Please add API keys to continue.')
      }

      // Try services in order of preference
      const serviceOrder = ['openai', 'anthropic', 'google', 'perplexity']
      
      for (const service of serviceOrder) {
        if (keys[service]) {
          try {
            const result = await aiServiceManager.generateContent(service, prompt, {
              apiKey: keys[service],
              maxTokens: options.maxTokens || 2000
            })
            
            return {
              ...result,
              service: service,
              fallback: false
            }
          } catch (error) {
            console.warn(`Service ${service} failed:`, error.message)
            continue
          }
        }
      }

      // If all services fail, throw error
      throw new Error('All AI services failed. Please check your API keys and try again.')

    } catch (error) {
      console.error('Integrated AI service error:', error)
      throw error
    }
  }

  // REMOVED: getFallbackContent() - NO FALLBACK TEMPLATES ALLOWED
  // If AI fails, the system must fail and show proper error with suggestions

  async generateResearch(niche, type, audience) {
    const prompt = `Research ${type} content for ${niche} targeting ${audience}. 
    Provide comprehensive research including key topics, trends, audience insights, and content recommendations.`
    
    return await this.generateContent(prompt, { maxTokens: 3000 })
  }

  async generateOutline(config, research) {
    const prompt = `Create a detailed book outline for:
    Title: ${config.title}
    Type: ${config.type}
    Audience: ${config.targetAudience}
    
    Research: ${research}
    
    Generate a comprehensive outline with chapters, key points, and structure.`
    
    return await this.generateContent(prompt, { maxTokens: 2000 })
  }

  async generateChapter(chapterInfo, bookContext) {
    const prompt = `Write a complete chapter:
    Chapter: ${chapterInfo.title}
    Description: ${chapterInfo.description}
    
    Book Context: ${bookContext}
    
    Write engaging, comprehensive content (2000-3000 words).`
    
    return await this.generateContent(prompt, { maxTokens: 4000 })
  }

  async checkServiceStatus() {
    try {
      const keys = await superAdminKeyService.getAllActiveKeys()
      const status = {}
      
      for (const [service, key] of Object.entries(keys)) {
        status[service] = {
          available: !!key,
          configured: true
        }
      }
      
      return status
    } catch (error) {
      console.error('Error checking service status:', error)
      return {}
    }
  }

  async getAvailableServices() {
    const status = await this.checkServiceStatus()
    return Object.keys(status).filter(service => status[service].available)
  }

  hasAnyService() {
    return this.getAvailableServices().then(services => services.length > 0)
  }

  async generateWithService(serviceName, prompt, options = {}) {
    try {
      const keys = await superAdminKeyService.getAllActiveKeys()
      
      if (!keys[serviceName]) {
        throw new Error(`Service ${serviceName} is not configured`)
      }
      
      const result = await aiServiceManager.generateContent(serviceName, prompt, {
        apiKey: keys[serviceName],
        maxTokens: options.maxTokens || 2000
      })
      
      return {
        ...result,
        service: serviceName,
        fallback: false
      }
    } catch (error) {
      console.error(`Error with ${serviceName}:`, error)
      throw error
    }
  }

  setFallbackMode(enabled) {
    this.fallbackMode = enabled
    console.log(`Fallback mode ${enabled ? 'enabled' : 'disabled'}`)
  }

  isFallbackMode() {
    return this.fallbackMode
  }
}

const integratedAiService = new IntegratedAiService()
export default integratedAiService
export { IntegratedAiService }

