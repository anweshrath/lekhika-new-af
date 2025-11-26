import { openaiService } from './openaiService'
import { claudeService } from './claudeService'
import { geminiService } from './geminiService'
import { grokService } from './grokService'
import { perplexityService } from './perplexityService'
import { mistralService } from './mistralService'

class AIServiceValidator {
  constructor() {
    this.services = {
      openai: {
        service: openaiService,
        name: 'OpenAI',
        keyFormat: /^sk-[a-zA-Z0-9]{48,}$/,
        testEndpoint: 'https://api.openai.com/v1/models',
        corsIssues: false
      },
      claude: {
        service: claudeService,
        name: 'Claude (Anthropic)',
        keyFormat: /^sk-ant-[a-zA-Z0-9\-_]{95,}$/,
        testEndpoint: 'https://api.anthropic.com/v1/messages',
        corsIssues: true // Anthropic blocks browser requests
      },
      gemini: {
        service: geminiService,
        name: 'Google Gemini',
        keyFormat: /^[a-zA-Z0-9\-_]{39}$/,
        testEndpoint: 'https://generativelanguage.googleapis.com/v1/models',
        corsIssues: false
      },
      grok: {
        service: grokService,
        name: 'GROK (xAI)',
        keyFormat: /^xai-[a-zA-Z0-9\-_]{64,}$/,
        testEndpoint: 'https://api.x.ai/v1/chat/completions',
        corsIssues: false
      },
      perplexity: {
        service: perplexityService,
        name: 'Perplexity',
        keyFormat: /^pplx-[a-zA-Z0-9]{56}$/,
        testEndpoint: 'https://api.perplexity.ai/chat/completions',
        corsIssues: false
      },
      mistral: {
        service: mistralService,
        name: 'Mistral AI',
        keyFormat: /^[a-zA-Z0-9]{32}$/,
        testEndpoint: 'https://api.mistral.ai/v1/models',
        corsIssues: false
      }
    }
  }

  async validateApiKey(serviceId, apiKey) {
    console.log(`🔍 Validating ${serviceId} API key...`)
    
    const serviceConfig = this.services[serviceId]
    if (!serviceConfig) {
      throw new Error(`Unknown service: ${serviceId}`)
    }

    // Basic format validation
    if (!serviceConfig.keyFormat.test(apiKey)) {
      throw new Error(`Invalid ${serviceConfig.name} API key format`)
    }

    // Handle CORS-restricted services
    if (serviceConfig.corsIssues) {
      console.log(`⚠️ ${serviceId} has CORS restrictions - using format validation only`)
      return {
        valid: true,
        service: serviceId,
        models: await this.getServiceModels(serviceId),
        validated: false,
        corsLimited: true,
        note: `${serviceConfig.name} API key format is valid. Full validation blocked by CORS policy.`
      }
    }

    try {
      // Use service-specific validation if available
      if (serviceConfig.service.validateApiKey) {
        console.log(`✅ Using ${serviceId} service validation method`)
        return await serviceConfig.service.validateApiKey(apiKey)
      }

      // Fallback to generic validation
      console.log(`⚠️ Using generic validation for ${serviceId}`)
      return await this.genericValidation(serviceId, apiKey, serviceConfig)

    } catch (error) {
      console.error(`❌ ${serviceId} validation failed:`, error)
      
      // Enhanced error handling for specific issues
      if (error.message.includes('Failed to fetch') || error.name === 'TypeError') {
        if (serviceConfig.corsIssues) {
          throw new Error(`CORS Error: ${serviceConfig.name} API blocks direct browser requests. Server-side proxy required.`)
        } else {
          throw new Error(`Network error connecting to ${serviceConfig.name} API. Please check your internet connection and try again.`)
        }
      }
      
      if (error.message.includes('CORS')) {
        throw new Error(`CORS error with ${serviceConfig.name} API. This service may require server-side proxy.`)
      }
      
      throw error
    }
  }

  async genericValidation(serviceId, apiKey, serviceConfig) {
    console.log(`🔄 Generic validation for ${serviceId}...`)
    
    // For services without specific validation, return basic info
    const models = await this.getServiceModels(serviceId)
    
    return {
      valid: true,
      service: serviceId,
      models: models,
      validated: false, // Indicates this was not fully validated
      note: `${serviceConfig.name} API key format is valid, but full validation requires testing with actual API calls.`
    }
  }

  async getServiceModels(serviceId) {
    const serviceConfig = this.services[serviceId]
    
    try {
      if (serviceConfig.service.listModels) {
        return await serviceConfig.service.listModels()
      }
    } catch (error) {
      console.warn(`Could not fetch models for ${serviceId}:`, error)
    }
    
    // Return empty array if models can't be fetched
    return []
  }

  async validateAllServices(apiKeys) {
    console.log('🔍 Validating all API services...')
    
    const results = {}
    const errors = {}
    
    for (const [serviceId, apiKey] of Object.entries(apiKeys)) {
      if (!apiKey || apiKey.trim() === '') continue
      
      try {
        console.log(`🔄 Validating ${serviceId}...`)
        results[serviceId] = await this.validateApiKey(serviceId, apiKey)
        console.log(`✅ ${serviceId} validation successful`)
      } catch (error) {
        console.error(`❌ ${serviceId} validation failed:`, error)
        errors[serviceId] = error.message
      }
    }
    
    return { results, errors }
  }

  getServiceInfo(serviceId) {
    return this.services[serviceId] || null
  }

  getAllServices() {
    return Object.keys(this.services).map(id => ({
      id,
      ...this.services[id]
    }))
  }

  hasCorsIssues(serviceId) {
    return this.services[serviceId]?.corsIssues || false
  }
}

export const aiServiceValidator = new AIServiceValidator()
