/**
 * ALCHEMIST SERVICE
 * Database operations for Alchemist Lab
 * Boss's Rules: All dynamic, no hardcoded values, real database calls
 */

import { supabase } from '../lib/supabase'

class AlchemistService {
  /**
   * Fetch all available Alchemist flows from database
   */
  async getFlows() {
    try {
      const { data, error } = await supabase
        .from('alchemist_flows')
        .select('*')
        .order('priority', { ascending: true })
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('❌ Failed to fetch alchemist flows:', error)
      throw error
    }
  }

  /**
   * Fetch single flow by ID
   */
  async getFlowById(flowId) {
    try {
      const { data, error } = await supabase
        .from('alchemist_flows')
        .select('*')
        .eq('id', flowId)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('❌ Failed to fetch flow:', error)
      throw error
    }
  }

  /**
   * Get flows by category
   */
  async getFlowsByCategory(category) {
    try {
      const { data, error } = await supabase
        .from('alchemist_flows')
        .select('*')
        .eq('category', category)
        .order('priority', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('❌ Failed to fetch flows by category:', error)
      throw error
    }
  }

  /**
   * Save generated content to database
   */
  async saveContent(userId, contentData) {
    try {
      const { data, error } = await supabase
        .from('user_alchemist_content')
        .insert({
          user_id: userId,
          flow_id: contentData.flowId,
          flow_name: contentData.flowName,
          flow_category: contentData.flowCategory,
          input_data: contentData.inputData,
          generated_content: contentData.generatedContent,
          metadata: contentData.metadata || {},
          word_count: contentData.wordCount,
          character_count: contentData.characterCount,
          tokens_used: contentData.tokensUsed,
          cost_usd: contentData.costUsd,
          provider_used: contentData.providerUsed,
          model_used: contentData.modelUsed,
          generation_time_ms: contentData.generationTimeMs
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('❌ Failed to save content:', error)
      throw error
    }
  }

  /**
   * Fetch user's saved content from database
   */
  async getUserContent(userId, options = {}) {
    try {
      let query = supabase
        .from('user_alchemist_content')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      // Apply filters if provided
      if (options.category) {
        query = query.eq('flow_category', options.category)
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('❌ Failed to fetch user content:', error)
      throw error
    }
  }

  /**
   * Delete saved content
   */
  async deleteContent(contentId, userId) {
    try {
      const { error } = await supabase
        .from('user_alchemist_content')
        .delete()
        .eq('id', contentId)
        .eq('user_id', userId) // Ensure user owns this content

      if (error) throw error
      return true
    } catch (error) {
      console.error('❌ Failed to delete content:', error)
      throw error
    }
  }

  /**
   * Update saved content
   */
  async updateContent(contentId, userId, updates) {
    try {
      const { data, error } = await supabase
        .from('user_alchemist_content')
        .update(updates)
        .eq('id', contentId)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('❌ Failed to update content:', error)
      throw error
    }
  }

  /**
   * Get content statistics for user
   */
  async getContentStats(userId) {
    try {
      const { data, error } = await supabase
        .from('user_alchemist_content')
        .select('id, tokens_used, cost_usd, word_count, flow_category')
        .eq('user_id', userId)

      if (error) throw error

      // Calculate stats
      const stats = {
        totalContent: data.length,
        totalTokens: data.reduce((sum, item) => sum + (item.tokens_used || 0), 0),
        totalCost: data.reduce((sum, item) => sum + parseFloat(item.cost_usd || 0), 0),
        totalWords: data.reduce((sum, item) => sum + (item.word_count || 0), 0),
        byCategory: {}
      }

      // Group by category
      data.forEach(item => {
        const cat = item.flow_category || 'other'
        if (!stats.byCategory[cat]) {
          stats.byCategory[cat] = 0
        }
        stats.byCategory[cat]++
      })

      return stats
    } catch (error) {
      console.error('❌ Failed to fetch content stats:', error)
      throw error
    }
  }

  /**
   * Extract input fields from flow's input node
   */
  extractInputFields(flow) {
    try {
      const nodes = flow.nodes || []
      const inputNode = nodes.find(node => node.type === 'input')
      
      if (!inputNode) {
        console.warn('⚠️ No input node found in flow:', flow.name)
        return []
      }

      return inputNode.data?.inputFields || []
    } catch (error) {
      console.error('❌ Failed to extract input fields:', error)
      return []
    }
  }
}

export default new AlchemistService()

