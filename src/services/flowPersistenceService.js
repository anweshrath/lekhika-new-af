import { supabase } from '../lib/supabase'

class FlowPersistenceService {
  constructor() {
    this.tableName = 'ai_flows'
  }

  async getAllFlows() {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching flows:', error)
      return []
    }
  }

  async getDefaultFlow() {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('is_default', true)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data || null
    } catch (error) {
      console.error('Error fetching default flow:', error)
      return null
    }
  }

  async saveFlow(flowData) {
    try {
      const newFlow = {
        name: flowData.name,
        description: flowData.description,
        type: flowData.type || 'simplified',
        steps: flowData.steps || [],
        configurations: flowData.configurations || {},
        parameters: flowData.parameters || {},
        models: flowData.models || {},
        is_default: flowData.isDefault || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        usage_count: 0,
        last_used: null
      }

      // If this is being set as default, remove default from others
      if (newFlow.is_default) {
        await supabase
          .from(this.tableName)
          .update({ is_default: false })
          .eq('is_default', true)
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .insert([newFlow])
        .select()
        .single()

      if (error) throw error

      console.log('Flow saved:', data)
      return data
    } catch (error) {
      console.error('Error saving flow:', error)
      throw error
    }
  }

  async updateFlow(flowId, updates) {
    try {
      // If setting as default, remove default from others
      if (updates.isDefault) {
        await supabase
          .from(this.tableName)
          .update({ is_default: false })
          .eq('is_default', true)
      }

      const updateData = {
        ...updates,
        updated_at: new Date().toISOString()
      }

      // Convert camelCase to snake_case for database
      if (updateData.isDefault !== undefined) {
        updateData.is_default = updateData.isDefault
        delete updateData.isDefault
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', flowId)
        .select()
        .single()

      if (error) throw error

      console.log('Flow updated:', data)
      return data
    } catch (error) {
      console.error('Error updating flow:', error)
      throw error
    }
  }

  async deleteFlow(flowId) {
    try {
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', flowId)

      if (error) throw error

      console.log('Flow deleted:', flowId)
      return true
    } catch (error) {
      console.error('Error deleting flow:', error)
      throw error
    }
  }

  async setDefaultFlow(flowId) {
    try {
      // Remove default from all flows
      await supabase
        .from(this.tableName)
        .update({ is_default: false })

      // Set new default
      const { data, error } = await supabase
        .from(this.tableName)
        .update({ 
          is_default: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', flowId)
        .select()
        .single()

      if (error) throw error

      console.log('Default flow set:', data)
      return data
    } catch (error) {
      console.error('Error setting default flow:', error)
      throw error
    }
  }

  async duplicateFlow(flowId) {
    try {
      const { data: originalFlow, error: fetchError } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', flowId)
        .single()

      if (fetchError) throw fetchError

      const duplicated = {
        name: `${originalFlow.name} (Copy)`,
        description: originalFlow.description,
        type: originalFlow.type,
        steps: originalFlow.steps,
        configurations: originalFlow.configurations,
        parameters: originalFlow.parameters,
        models: originalFlow.models,
        is_default: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        usage_count: 0,
        last_used: null
      }

      const { data, error } = await supabase
        .from(this.tableName)
        .insert([duplicated])
        .select()
        .single()

      if (error) throw error

      console.log('Flow duplicated:', data)
      return data
    } catch (error) {
      console.error('Error duplicating flow:', error)
      throw error
    }
  }

  async incrementUsage(flowId) {
    try {
      const { data: currentFlow, error: fetchError } = await supabase
        .from(this.tableName)
        .select('usage_count')
        .eq('id', flowId)
        .single()

      if (fetchError) throw fetchError

      const newCount = (currentFlow.usage_count || 0) + 1

      const { error } = await supabase
        .from(this.tableName)
        .update({
          usage_count: newCount,
          last_used: new Date().toISOString()
        })
        .eq('id', flowId)

      if (error) throw error
    } catch (error) {
      console.error('Error incrementing usage:', error)
    }
  }

  async getFlowStats() {
    try {
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')

      if (error) throw error

      const flows = data || []
      
      return {
        total: flows.length,
        active: flows.filter(f => f.is_default).length,
        recent: flows.filter(f => {
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return new Date(f.created_at) > weekAgo
        }).length
      }
    } catch (error) {
      console.error('Error getting flow stats:', error)
      return { total: 0, active: 0, recent: 0 }
    }
  }
}

export const flowPersistenceService = new FlowPersistenceService()
