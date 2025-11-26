/**
 * ALCHEMIST FLOW SERVICE
 * Database operations for Alchemist flows
 * Mirrors the structure of the main flow service but isolated
 */

import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

class AlchemistFlowService {
  constructor() {
    this.tableName = 'alchemist_flows'
  }

  // Create a new Alchemist flow
  async createFlow(flowData) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .insert([{
          name: flowData.name,
          description: flowData.description || '',
          category: flowData.category || 'alchemist',
          type: flowData.type || 'alchemist',
          suite: flowData.suite || 'Content Creation',
          priority: flowData.priority || 1,
          nodes: flowData.nodes || [],
          edges: flowData.edges || [],
          framework: flowData.framework || null,
          custom_framework: flowData.customFramework || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()

      if (error) throw error

      toast.success('✅ Alchemist flow created successfully!')
      return data[0]
    } catch (error) {
      console.error('Error creating Alchemist flow:', error)
      toast.error(`Failed to create flow: ${error.message}`)
      throw error
    }
  }

  // Update an existing Alchemist flow
  async updateFlow(flowId, flowData) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .update({
          name: flowData.name,
          description: flowData.description || '',
          category: flowData.category || 'alchemist',
          type: flowData.type || 'alchemist',
          suite: flowData.suite || 'Content Creation',
          priority: flowData.priority || 1,
          nodes: flowData.nodes || [],
          edges: flowData.edges || [],
          framework: flowData.framework || null,
          custom_framework: flowData.customFramework || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', flowId)
        .select()

      if (error) throw error

      toast.success('✅ Alchemist flow updated successfully!')
      return data[0]
    } catch (error) {
      console.error('Error updating Alchemist flow:', error)
      toast.error(`Failed to update flow: ${error.message}`)
      throw error
    }
  }

  // Get all Alchemist flows
  async getAllFlows() {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching Alchemist flows:', error)
      toast.error(`Failed to fetch flows: ${error.message}`)
      return []
    }
  }

  // Get a specific Alchemist flow by ID
  async getFlowById(flowId) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', flowId)
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error('Error fetching Alchemist flow:', error)
      toast.error(`Failed to fetch flow: ${error.message}`)
      return null
    }
  }

  // Delete an Alchemist flow
  async deleteFlow(flowId) {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', flowId)

      if (error) throw error

      toast.success('✅ Alchemist flow deleted successfully!')
      return true
    } catch (error) {
      console.error('Error deleting Alchemist flow:', error)
      toast.error(`Failed to delete flow: ${error.message}`)
      return false
    }
  }

  // Get flows by category
  async getFlowsByCategory(category) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('category', category)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching flows by category:', error)
      return []
    }
  }

  // Search flows by name or description
  async searchFlows(searchTerm) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error searching flows:', error)
      return []
    }
  }

  // Create a new node in alchemist_node_palette
  async createNode(nodeData) {
    try {
      const { data, error } = await supabase
        .from('alchemist_node_palette')
        .insert([{
          node_id: nodeData.node_id,
          name: nodeData.name,
          description: nodeData.description,
          type: nodeData.type,
          category: nodeData.category,
          sub_category: nodeData.sub_category,
          role: nodeData.role,
          icon: nodeData.icon,
          gradient: nodeData.gradient,
          is_ai_enabled: nodeData.is_ai_enabled,
          configuration: nodeData.configuration,
          is_active: nodeData.is_active,
          created_by: nodeData.created_by,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()

      if (error) throw error

      return data[0]
    } catch (error) {
      console.error('Error creating node:', error)
      throw error
    }
  }

  // Update node configuration
  async updateNode(nodeId, updates) {
    try {
      const { data, error } = await supabase
        .from('alchemist_node_palette')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('node_id', nodeId)
        .select()

      if (error) throw error
      return data[0]
    } catch (error) {
      console.error('Error updating node:', error)
      throw error
    }
  }

  // Get flow statistics
  async getFlowStats() {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('category, suite')

      if (error) throw error

      const stats = {
        total: data.length,
        byCategory: {},
        bySuite: {}
      }

      data.forEach(flow => {
        stats.byCategory[flow.category] = (stats.byCategory[flow.category] || 0) + 1
        stats.bySuite[flow.suite] = (stats.bySuite[flow.suite] || 0) + 1
      })

      return stats
    } catch (error) {
      console.error('Error fetching flow stats:', error)
      return { total: 0, byCategory: {}, bySuite: {} }
    }
  }
}

// Export singleton instance
export const alchemistFlowService = new AlchemistFlowService()
export default alchemistFlowService
