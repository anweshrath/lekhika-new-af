import { supabase } from '../lib/supabase'

class EngineDeploymentService {
  async deployEngine(engineConfig) {
    try {
      const { data: user } = await supabase.auth.getUser()
      
      const { data, error } = await supabase
        .from('ai_engines')
        .insert([{
          ...engineConfig,
          created_by: user?.user?.id
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Engine deployment error:', error)
      throw error
    }
  }

  async getEngines() {
    try {
      const { data, error } = await supabase
        .from('ai_engines')
        .select(`
          *,
          engine_assignments!inner(
            id,
            assignment_type,
            tier,
            user_id,
            priority,
            active
          )
        `)
        .eq('active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching engines:', error)
      return []
    }
  }

  async getAllEngines() {
    try {
      const { data, error } = await supabase
        .from('ai_engines')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching all engines:', error)
      return []
    }
  }

  async updateEngine(id, updates) {
    try {
      const { data, error } = await supabase
        .from('ai_engines')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Engine update error:', error)
      throw error
    }
  }

  async deleteEngine(id) {
    try {
      const { error } = await supabase
        .from('ai_engines')
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Engine deletion error:', error)
      throw error
    }
  }

  async duplicateEngine(id) {
    try {
      const { data: engine, error: fetchError } = await supabase
        .from('ai_engines')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      const { data: user } = await supabase.auth.getUser()
      
      const duplicatedEngine = {
        name: `${engine.name} (Copy)`,
        description: engine.description,
        flow_config: engine.flow_config,
        models: engine.models,
        execution_mode: engine.execution_mode,
        tier: engine.tier,
        active: engine.active,
        created_by: user?.user?.id
      }

      const { data, error } = await supabase
        .from('ai_engines')
        .insert([duplicatedEngine])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Engine duplication error:', error)
      throw error
    }
  }

  async getEngineStats() {
    try {
      const { data: engines, error: enginesError } = await supabase
        .from('ai_engines')
        .select('id, active, tier')

      if (enginesError) throw enginesError

      const { data: executions, error: executionsError } = await supabase
        .from('engine_executions')
        .select('id, status, tokens_used, cost_estimate')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

      if (executionsError) throw executionsError

      const stats = {
        totalEngines: engines?.length || 0,
        activeEngines: engines?.filter(e => e.active).length || 0,
        totalExecutions: executions?.length || 0,
        successfulExecutions: executions?.filter(e => e.status === 'completed').length || 0,
        totalTokensUsed: executions?.reduce((sum, e) => sum + (e.tokens_used || 0), 0) || 0,
        totalCostEstimate: executions?.reduce((sum, e) => sum + (parseFloat(e.cost_estimate) || 0), 0) || 0,
        enginesByTier: {
          hobby: engines?.filter(e => e.tier === 'hobby').length || 0,
          pro: engines?.filter(e => e.tier === 'pro').length || 0,
          enterprise: engines?.filter(e => e.tier === 'enterprise').length || 0
        }
      }

      return stats
    } catch (error) {
      console.error('Error fetching engine stats:', error)
      return {
        totalEngines: 0,
        activeEngines: 0,
        totalExecutions: 0,
        successfulExecutions: 0,
        totalTokensUsed: 0,
        totalCostEstimate: 0,
        enginesByTier: { hobby: 0, pro: 0, enterprise: 0 }
      }
    }
  }

  extractModelsFromConfigurations(stepConfigurations) {
    const allModels = []
    
    Object.values(stepConfigurations || {}).forEach(config => {
      if (config.models && Array.isArray(config.models)) {
        config.models.forEach(model => {
          if (!allModels.find(m => m.service === model.service && m.modelId === model.modelId)) {
            allModels.push({
              service: model.service,
              model: model.modelId,
              maxTokens: model.maxTokens || 2000
            })
          }
        })
      }
    })

    return allModels
  }
}

export const engineDeploymentService = new EngineDeploymentService()
