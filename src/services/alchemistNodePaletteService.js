/**
 * ALCHEMIST NODE PALETTE SERVICE
 * Database operations for Alchemist node palette
 */

import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

class AlchemistNodePaletteService {
  constructor() {
    this.tableName = 'alchemist_node_palette'
  }

  // Get all available node types
  async getAllNodeTypes() {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching Alchemist node types:', error)
      return []
    }
  }

  // Get node types by category
  async getNodeTypesByCategory(category) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('category', category)
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (error) throw error

      return data || []
    } catch (error) {
      console.error('Error fetching node types by category:', error)
      return []
    }
  }

  // Get unique categories
  async getCategories() {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('category')
        .eq('is_active', true)
        .order('category', { ascending: true })

      if (error) throw error

      const categories = [...new Set(data.map(item => item.category))]
      return categories
    } catch (error) {
      console.error('Error fetching categories:', error)
      return []
    }
  }

  // Update node configuration
  async updateNode(nodeId, updates) {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
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
}

// Export singleton instance
export const alchemistNodePaletteService = new AlchemistNodePaletteService()
export default alchemistNodePaletteService
