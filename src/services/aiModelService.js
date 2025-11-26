import { supabase } from '../lib/supabase'

/**
 * AI Model Service - Dynamically fetch models from AI providers
 * This service fetches available models from each AI provider's API
 */
class AIModelService {
  
  /**
   * Get active AI providers from database
   */
  async getActiveProviders() {
    try {
      const { data: providers, error } = await supabase
        .from('ai_providers')
        .select('*')
        .eq('is_active', true)
      
      if (error) throw error
      return providers || []
    } catch (error) {
      console.error('Error fetching providers:', error)
      return []
    }
  }

  /**
   * Fetch models dynamically from OpenAI API
   */
  async fetchOpenAIModels(apiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (!response.ok) throw new Error('Failed to fetch OpenAI models')
      
      const data = await response.json()
      
      // Filter for relevant models
      const relevantModels = data.data
        .filter(model => 
          model.id.includes('gpt') || 
          model.id.includes('davinci') || 
          model.id.includes('text-davinci') ||
          model.id.includes('text-embedding')
        )
        .map(model => ({
          id: model.id,
          name: model.id,
          description: `OpenAI ${model.id}`,
          maxTokens: this.getMaxTokens(model.id),
          supportsChat: model.id.includes('gpt'),
          supportsCompletion: true
        }))
        .sort((a, b) => a.name.localeCompare(b.name))
      
      return relevantModels
    } catch (error) {
      console.error('Error fetching OpenAI models:', error)
      // Return fallback models if API fails
      return this.getFallbackOpenAIModels()
    }
  }

  /**
   * Fetch models from Anthropic (Claude)
   */
  async fetchAnthropicModels(apiKey) {
    try {
      // Anthropic doesn't have a public models endpoint, so we use known models
      return [
        {
          id: 'claude-3-opus-20240229',
          name: 'Claude 3 Opus',
          description: 'Most powerful Claude model for complex tasks',
          maxTokens: 200000,
          supportsChat: true,
          supportsCompletion: true
        },
        {
          id: 'claude-3-sonnet-20240229',
          name: 'Claude 3 Sonnet',
          description: 'Balanced Claude model for most tasks',
          maxTokens: 200000,
          supportsChat: true,
          supportsCompletion: true
        },
        {
          id: 'claude-3-haiku-20240307',
          name: 'Claude 3 Haiku',
          description: 'Fastest Claude model for simple tasks',
          maxTokens: 200000,
          supportsChat: true,
          supportsCompletion: true
        }
      ]
    } catch (error) {
      console.error('Error fetching Anthropic models:', error)
      return this.getFallbackAnthropicModels()
    }
  }

  /**
   * Fetch models from Google (Gemini)
   */
  async fetchGoogleModels(apiKey) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`)
      
      if (!response.ok) throw new Error('Failed to fetch Google models')
      
      const data = await response.json()
      
      const models = data.models
        .filter(model => model.name.includes('gemini'))
        .map(model => ({
          id: model.name.split('/').pop(),
          name: model.displayName || model.name.split('/').pop(),
          description: model.description || `Google ${model.name.split('/').pop()}`,
          maxTokens: 30720, // Gemini token limit
          supportsChat: true,
          supportsCompletion: true
        }))
      
      return models
    } catch (error) {
      console.error('Error fetching Google models:', error)
      return this.getFallbackGoogleModels()
    }
  }

  /**
   * Get models for a specific provider
   */
  async getModelsForProvider(provider, apiKey) {
    try {
      switch (provider.provider.toLowerCase()) {
        case 'openai':
          return await this.fetchOpenAIModels(apiKey || provider.api_key)
          
        case 'anthropic':
          return await this.fetchAnthropicModels(apiKey || provider.api_key)
          
        case 'google':
        case 'gemini':
          return await this.fetchGoogleModels(apiKey || provider.api_key)
          
        case 'mistral':
          return this.getFallbackMistralModels()
          
        case 'perplexity':
          return this.getFallbackPerplexityModels()
          
        case 'xai':
        case 'grok':
          return this.getFallbackXAIModels()
          
        default:
          console.warn(`Unknown provider: ${provider.provider}`)
          return []
      }
    } catch (error) {
      console.error(`Error getting models for ${provider.provider}:`, error)
      return this.getFallbackModelsForProvider(provider.provider)
    }
  }

  /**
   * Get max tokens for a model
   */
  getMaxTokens(modelId) {
    const tokenLimits = {
      'gpt-4': 8192,
      'gpt-4-32k': 32768,
      'gpt-4-turbo': 128000,
      'gpt-3.5-turbo': 4096,
      'gpt-3.5-turbo-16k': 16384,
      'text-davinci-003': 4097,
      'text-davinci-002': 4097
    }
    
    return tokenLimits[modelId] || 4096
  }

  /**
   * Fallback models if API calls fail
   */
  getFallbackOpenAIModels() {
    return [
      { id: 'gpt-4', name: 'GPT-4', description: 'Most capable OpenAI model', maxTokens: 8192 },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Latest GPT-4 with higher limits', maxTokens: 128000 },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and efficient model', maxTokens: 4096 },
      { id: 'gpt-3.5-turbo-16k', name: 'GPT-3.5 Turbo 16K', description: 'Extended context version', maxTokens: 16384 }
    ]
  }

  getFallbackAnthropicModels() {
    return [
      { id: 'claude-3-opus', name: 'Claude 3 Opus', description: 'Most powerful Claude model', maxTokens: 200000 },
      { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', description: 'Balanced Claude model', maxTokens: 200000 },
      { id: 'claude-3-haiku', name: 'Claude 3 Haiku', description: 'Fastest Claude model', maxTokens: 200000 }
    ]
  }

  getFallbackGoogleModels() {
    return [
      { id: 'gemini-pro', name: 'Gemini Pro', description: 'Google\'s most capable model', maxTokens: 30720 },
      { id: 'gemini-pro-vision', name: 'Gemini Pro Vision', description: 'Multimodal Gemini model', maxTokens: 30720 }
    ]
  }

  getFallbackMistralModels() {
    return [
      { id: 'mistral-large', name: 'Mistral Large', description: 'Most capable Mistral model', maxTokens: 32768 },
      { id: 'mistral-medium', name: 'Mistral Medium', description: 'Balanced Mistral model', maxTokens: 32768 },
      { id: 'mistral-small', name: 'Mistral Small', description: 'Efficient Mistral model', maxTokens: 32768 }
    ]
  }

  getFallbackPerplexityModels() {
    return [
      { id: 'pplx-7b-online', name: 'Perplexity 7B Online', description: 'Online-enabled 7B model', maxTokens: 4096 },
      { id: 'pplx-70b-online', name: 'Perplexity 70B Online', description: 'Online-enabled 70B model', maxTokens: 4096 }
    ]
  }

  getFallbackXAIModels() {
    return [
      { id: 'grok-beta', name: 'Grok Beta', description: 'xAI\'s Grok model', maxTokens: 8192 }
    ]
  }

  getFallbackModelsForProvider(provider) {
    switch (provider.toLowerCase()) {
      case 'openai': return this.getFallbackOpenAIModels()
      case 'anthropic': return this.getFallbackAnthropicModels()
      case 'google': case 'gemini': return this.getFallbackGoogleModels()
      case 'mistral': return this.getFallbackMistralModels()
      case 'perplexity': return this.getFallbackPerplexityModels()
      case 'xai': case 'grok': return this.getFallbackXAIModels()
      default: return []
    }
  }

  /**
   * Cache models to avoid repeated API calls
   */
  async getCachedModels(provider) {
    const cacheKey = `models_${provider.provider}_${provider.id}`
    const cached = localStorage.getItem(cacheKey)
    
    if (cached) {
      const { models, timestamp } = JSON.parse(cached)
      // Cache for 1 hour
      if (Date.now() - timestamp < 3600000) {
        return models
      }
    }
    
    const models = await this.getModelsForProvider(provider)
    
    // Cache the results
    localStorage.setItem(cacheKey, JSON.stringify({
      models,
      timestamp: Date.now()
    }))
    
    return models
  }

  /**
   * Validate if a model is available for a provider
   */
  async validateModel(provider, modelId) {
    const models = await this.getCachedModels(provider)
    return models.some(model => model.id === modelId)
  }
}

export const aiModelService = new AIModelService()
export default aiModelService
