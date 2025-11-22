class AIUsageVerifier {
  constructor() {
    this.generationLogs = []
    this.serviceTests = {}
  }

  async verifyAIUsage() {
    console.log('🔍 VERIFYING AI USAGE vs FALLBACK TEMPLATES...')
    
    const results = {
      timestamp: new Date().toISOString(),
      aiServicesOnline: {},
      actualUsage: {},
      fallbackUsage: {},
      summary: {}
    }

    // Test each AI service individually
    console.log('📡 Testing individual AI services...')
    
    try {
      // Import the services
      const { multiLlmService } = await import('./multiLlmService')
      
      // Test each service
      const services = ['openai', 'claude', 'gemini', 'grok', 'perplexity']
      
      for (const serviceName of services) {
        console.log(`🔄 Testing ${serviceName}...`)
        
        try {
          const service = multiLlmService.services[serviceName]
          if (service && service.testConnection) {
            const testResult = await service.testConnection()
            results.aiServicesOnline[serviceName] = {
              online: testResult.success,
              error: testResult.error || null,
              hasApiKey: !!service.apiKey,
              lastTest: new Date().toISOString()
            }
            console.log(`${testResult.success ? '✅' : '❌'} ${serviceName}: ${testResult.success ? 'ONLINE' : 'OFFLINE'}`)
          } else {
            results.aiServicesOnline[serviceName] = {
              online: false,
              error: 'Service not properly configured',
              hasApiKey: false,
              lastTest: new Date().toISOString()
            }
            console.log(`❌ ${serviceName}: NOT CONFIGURED`)
          }
        } catch (error) {
          results.aiServicesOnline[serviceName] = {
            online: false,
            error: error.message,
            hasApiKey: false,
            lastTest: new Date().toISOString()
          }
          console.log(`❌ ${serviceName}: ERROR - ${error.message}`)
        }
      }

      // Check recent generation logs
      console.log('📋 Checking recent generation logs...')
      const recentBooks = JSON.parse(localStorage.getItem('bookmagic-books') || '[]')
      
      if (recentBooks.length > 0) {
        const latestBook = recentBooks[recentBooks.length - 1]
        console.log('📖 Latest book analysis:', latestBook)
        
        results.actualUsage = {
          bookId: latestBook.id,
          title: latestBook.title,
          sections: latestBook.sections?.length || 0,
          metadata: latestBook.metadata || {},
          servicesUsed: latestBook.metadata?.servicesUsed || [],
          fallbackSections: latestBook.metadata?.fallbackSections || 0,
          templateUsed: latestBook.metadata?.templateUsed || false
        }

        // Analyze each section
        if (latestBook.sections) {
          results.actualUsage.sectionAnalysis = latestBook.sections.map(section => ({
            title: section.title,
            aiService: section.aiService,
            fallbackUsed: section.fallbackUsed,
            templateUsed: section.templateUsed,
            wordCount: section.wordCount
          }))
        }
      }

      // Generate summary
      const onlineServices = Object.keys(results.aiServicesOnline).filter(
        service => results.aiServicesOnline[service].online
      )
      
      const offlineServices = Object.keys(results.aiServicesOnline).filter(
        service => !results.aiServicesOnline[service].online
      )

      results.summary = {
        totalServices: services.length,
        onlineServices: onlineServices.length,
        offlineServices: offlineServices.length,
        onlineServicesList: onlineServices,
        offlineServicesList: offlineServices,
        verdict: this.determineVerdict(results),
        recommendation: this.getRecommendation(results)
      }

      console.log('📊 VERIFICATION RESULTS:')
      console.log(`✅ Online Services (${onlineServices.length}/${services.length}):`, onlineServices)
      console.log(`❌ Offline Services (${offlineServices.length}/${services.length}):`, offlineServices)
      console.log(`🎯 Verdict: ${results.summary.verdict}`)
      console.log(`💡 Recommendation: ${results.summary.recommendation}`)

      return results

    } catch (error) {
      console.error('❌ Error during AI usage verification:', error)
      results.error = error.message
      results.summary.verdict = 'VERIFICATION_FAILED'
      return results
    }
  }

  determineVerdict(results) {
    const onlineCount = results.summary.onlineServices
    const totalCount = results.summary.totalServices
    
    if (onlineCount === 0) {
      return 'ALL_FALLBACK_TEMPLATES - No AI services are working'
    } else if (onlineCount < totalCount / 2) {
      return 'MOSTLY_FALLBACK_TEMPLATES - Most AI services are offline'
    } else if (onlineCount === totalCount) {
      return 'FULL_AI_GENERATION - All AI services are working'
    } else {
      return 'MIXED_AI_AND_TEMPLATES - Some AI services working'
    }
  }

  getRecommendation(results) {
    const onlineCount = results.summary.onlineServices
    
    if (onlineCount === 0) {
      return 'Check API keys in superadmin panel - all services appear to be offline'
    } else if (onlineCount < 3) {
      return 'Some AI services are working but consider checking API keys for better results'
    } else {
      return 'AI services are working well - you should be getting real AI-generated content'
    }
  }

  async testSingleService(serviceName) {
    console.log(`🔍 Testing single service: ${serviceName}`)
    
    try {
      const { multiLlmService } = await import('./multiLlmService')
      const service = multiLlmService.services[serviceName]
      
      if (!service) {
        return { success: false, error: 'Service not found' }
      }

      if (!service.apiKey) {
        return { success: false, error: 'No API key configured' }
      }

      const testResult = await service.testConnection()
      console.log(`${serviceName} test result:`, testResult)
      
      return testResult
    } catch (error) {
      console.error(`Error testing ${serviceName}:`, error)
      return { success: false, error: error.message }
    }
  }

  async generateTestContent(serviceName) {
    console.log(`🧪 Generating test content with ${serviceName}`)
    
    try {
      const { multiLlmService } = await import('./multiLlmService')
      const service = multiLlmService.services[serviceName]
      
      if (!service || !service.generateContent) {
        return { success: false, error: 'Service not available for content generation' }
      }

      const testPrompt = 'Write a short paragraph about artificial intelligence in business.'
      const result = await service.generateContent(testPrompt)
      
      if (result && result.length > 50) {
        console.log(`✅ ${serviceName} generated content:`, result.substring(0, 100) + '...')
        return { success: true, content: result, length: result.length }
      } else {
        return { success: false, error: 'Generated content too short or empty' }
      }
    } catch (error) {
      console.error(`Error generating test content with ${serviceName}:`, error)
      return { success: false, error: error.message }
    }
  }

  logGenerationEvent(event) {
    this.generationLogs.push({
      timestamp: new Date().toISOString(),
      ...event
    })
    
    // Keep only last 50 logs
    if (this.generationLogs.length > 50) {
      this.generationLogs = this.generationLogs.slice(-50)
    }
  }

  getRecentLogs() {
    return this.generationLogs.slice(-10) // Last 10 events
  }
}

export const aiUsageVerifier = new AIUsageVerifier()
