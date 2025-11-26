/**
 * API Key Service
 * Generates and manages LEKH-2- prefixed API keys for user-engine access
 */

import { supabase } from '../lib/supabase'
import crypto from 'crypto'

class APIKeyService {
  constructor() {
    this.keyPrefix = 'LEKH-2-'
    this.keyLength = 32 // Total length including prefix
  }

  /**
   * Generate a unique API key for user-engine combination
   * Format: LEKH-2-{user_id}-{engine_id}-{timestamp}
   * @param {string} userId - User ID
   * @param {string} engineId - Engine ID
   * @returns {string} Generated API key
   */
  generateAPIKey(userId, engineId) {
    const timestamp = Date.now().toString(36)
    const randomPart = crypto.randomBytes(8).toString('hex')
    const key = `${this.keyPrefix}${userId.slice(0, 8)}-${engineId.slice(0, 8)}-${timestamp}-${randomPart}`
    
    console.log('🔑 Generated API key:', key)
    return key
  }

  /**
   * Validate API key format
   * @param {string} apiKey - API key to validate
   * @returns {boolean} Is valid format
   */
  validateKeyFormat(apiKey) {
    const pattern = new RegExp(`^${this.keyPrefix}[a-f0-9]{8}-[a-f0-9]{8}-[a-z0-9]+-[a-f0-9]{16}$`)
    return pattern.test(apiKey)
  }

  /**
   * Parse API key to extract components
   * @param {string} apiKey - API key to parse
   * @returns {Object} Parsed components
   */
  parseAPIKey(apiKey) {
    if (!this.validateKeyFormat(apiKey)) {
      throw new Error('Invalid API key format')
    }

    const parts = apiKey.replace(this.keyPrefix, '').split('-')
    return {
      userId: parts[0],
      engineId: parts[1],
      timestamp: parts[2],
      randomPart: parts[3]
    }
  }

  /**
   * Create API key for user-engine assignment
   * @param {string} userId - User ID
   * @param {string} engineId - Engine ID
   * @param {Object} metadata - Additional metadata
   * @returns {Object} Created API key record
   */
  async createAPIKey(userId, engineId, metadata = {}) {
    try {
      const apiKey = this.generateAPIKey(userId, engineId)
      
      const keyData = {
        user_id: userId,
        engine_id: engineId,
        api_key: apiKey,
        key_type: 'engine_access',
        is_active: true,
        permissions: ['execute', 'read'],
        metadata: {
          ...metadata,
          created_at: new Date().toISOString(),
          last_used: null,
          usage_count: 0
        }
      }

      const { data, error } = await supabase
        .from('user_api_keys')
        .insert([keyData])
        .select()
        .single()

      if (error) throw error

      console.log('✅ API key created successfully:', data)
      return data
    } catch (error) {
      console.error('❌ Error creating API key:', error)
      throw error
    }
  }

  /**
   * Validate API key and get user/engine info
   * @param {string} apiKey - API key to validate
   * @returns {Object} User and engine information
   */
  async validateAPIKey(apiKey) {
    try {
      if (!this.validateKeyFormat(apiKey)) {
        throw new Error('Invalid API key format')
      }

      const { data, error } = await supabase
        .from('user_api_keys')
        .select(`
          *,
          users (id, full_name, email, tier, is_active),
          ai_engines (id, name, description, flow_config, models, active)
        `)
        .eq('api_key', apiKey)
        .eq('is_active', true)
        .single()

      if (error) throw error

      if (!data) {
        throw new Error('API key not found or inactive')
      }

      // Update last used timestamp
      await this.updateLastUsed(apiKey)

      console.log('✅ API key validated successfully')
      return data
    } catch (error) {
      console.error('❌ Error validating API key:', error)
      throw error
    }
  }

  /**
   * Update last used timestamp for API key
   * @param {string} apiKey - API key to update
   */
  async updateLastUsed(apiKey) {
    try {
      const { error } = await supabase
        .from('user_api_keys')
        .update({ 
          last_used: new Date().toISOString(),
          usage_count: supabase.raw('usage_count + 1')
        })
        .eq('api_key', apiKey)

      if (error) throw error
    } catch (error) {
      console.error('❌ Error updating last used:', error)
    }
  }

  /**
   * Get all API keys for a user
   * @param {string} userId - User ID
   * @returns {Array} User's API keys
   */
  async getUserAPIKeys(userId) {
    try {
      const { data, error } = await supabase
        .from('user_api_keys')
        .select(`
          *,
          ai_engines (id, name, description, active)
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('❌ Error getting user API keys:', error)
      throw error
    }
  }

  /**
   * Revoke API key
   * @param {string} apiKey - API key to revoke
   */
  async revokeAPIKey(apiKey) {
    try {
      const { error } = await supabase
        .from('user_api_keys')
        .update({ is_active: false })
        .eq('api_key', apiKey)

      if (error) throw error

      console.log('✅ API key revoked successfully')
    } catch (error) {
      console.error('❌ Error revoking API key:', error)
      throw error
    }
  }

  /**
   * Get API key statistics
   * @returns {Object} API key statistics
   */
  async getAPIKeyStats() {
    try {
      const { data, error } = await supabase
        .from('user_api_keys')
        .select('*')

      if (error) throw error

      const stats = {
        total: data.length,
        active: data.filter(key => key.is_active).length,
        revoked: data.filter(key => !key.is_active).length,
        totalUsage: data.reduce((sum, key) => sum + (key.usage_count || 0), 0)
      }

      return stats
    } catch (error) {
      console.error('❌ Error getting API key stats:', error)
      throw error
    }
  }
}

export const apiKeyService = new APIKeyService()
export default apiKeyService
