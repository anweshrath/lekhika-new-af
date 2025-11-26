import { supabase } from '../lib/supabase'

class SuperAdminKeyService {
  constructor() {
    this.keyCache = new Map()
    this.cacheExpiry = 5 * 60 * 1000 // 5 minutes
  }

  async getApiKey(serviceName) {
    try {
      // Check cache first
      const cacheKey = `api_key_${serviceName}`
      const cached = this.keyCache.get(cacheKey)
      
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.key
      }

      // Fetch from database
      const { data, error } = await supabase
        .from('api_keys')
        .select('encrypted_key, is_active')
        .eq('service_name', serviceName)
        .eq('is_active', true)
        .single()

      if (error || !data) {
        console.warn(`No active API key found for ${serviceName}`)
        return null
      }

      // In a real implementation, you would decrypt the key here
      // For now, we'll assume the key is stored in a way that can be used directly
      const apiKey = data.encrypted_key

      // Cache the key
      this.keyCache.set(cacheKey, {
        key: apiKey,
        timestamp: Date.now()
      })

      return apiKey

    } catch (error) {
      console.error(`Error fetching API key for ${serviceName}:`, error)
      return null
    }
  }

  async getAllActiveKeys() {
    try {
      const { data, error } = await supabase
        .from('api_keys')
        .select('service_name, encrypted_key, is_active')
        .eq('is_active', true)

      if (error) {
        console.error('Error fetching all API keys:', error)
        return {}
      }

      const keys = {}
      data.forEach(row => {
        keys[row.service_name] = row.encrypted_key
      })

      return keys

    } catch (error) {
      console.error('Error fetching all API keys:', error)
      return {}
    }
  }

  async testApiKey(serviceName, apiKey) {
    try {
      // This would test the API key with the actual service
      // For now, we'll just return a mock response
      return {
        success: true,
        service: serviceName,
        response: 'API key is valid'
      }
    } catch (error) {
      return {
        success: false,
        service: serviceName,
        error: error.message
      }
    }
  }

  clearCache() {
    this.keyCache.clear()
  }

  // Fallback method for when database is not available
  getFallbackKeys() {
    return {
      openai: process.env.VITE_OPENAI_API_KEY || null,
      anthropic: process.env.VITE_ANTHROPIC_API_KEY || null,
      google: process.env.VITE_GOOGLE_API_KEY || null,
      perplexity: process.env.VITE_PERPLEXITY_API_KEY || null
    }
  }
}

export const superAdminKeyService = new SuperAdminKeyService()
