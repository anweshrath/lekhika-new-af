import { supabase } from '../lib/supabase'

class EngineAssignmentService {
  async assignEngineToTier(engineId, tier, priority = 0) {
    try {
      // Remove existing tier assignment for this engine
      await supabase
        .from('engine_assignments')
        .delete()
        .eq('engine_id', engineId)
        .eq('assignment_type', 'tier')
        .eq('tier', tier)

      // Create new assignment
      const { data, error } = await supabase
        .from('engine_assignments')
        .insert([{
          engine_id: engineId,
          assignment_type: 'tier',
          tier: tier,
          priority: priority,
          active: true
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error assigning engine to tier:', error)
      throw error
    }
  }

  async assignEngineToUser(engineId, userId, priority = 0) {
    try {
      // Remove existing user assignment for this engine
      await supabase
        .from('engine_assignments')
        .delete()
        .eq('engine_id', engineId)
        .eq('assignment_type', 'user')
        .eq('user_id', userId)

      // Create new assignment
      const { data, error } = await supabase
        .from('engine_assignments')
        .insert([{
          engine_id: engineId,
          assignment_type: 'user',
          user_id: userId,
          priority: priority,
          active: true
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error assigning engine to user:', error)
      throw error
    }
  }

  async removeEngineAssignment(assignmentId) {
    try {
      const { error } = await supabase
        .from('engine_assignments')
        .delete()
        .eq('id', assignmentId)

      if (error) throw error
      return true
    } catch (error) {
      console.error('Error removing engine assignment:', error)
      throw error
    }
  }

  async getEngineAssignments(engineId = null) {
    try {
      let query = supabase
        .from('engine_assignments')
        .select(`
          *,
          ai_engines!inner(
            id,
            name,
            description,
            tier,
            active
          ),
          profiles(
            id,
            full_name,
            email
          )
        `)
        .eq('active', true)
        .order('priority', { ascending: false })

      if (engineId) {
        query = query.eq('engine_id', engineId)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching engine assignments:', error)
      return []
    }
  }

  async getUserAssignedEngines(userId = null) {
    try {
      const { data: user } = await supabase.auth.getUser()
      const targetUserId = userId || user?.user?.id

      if (!targetUserId) {
        throw new Error('No user ID provided')
      }

      // Get user's tier
      const { data: userCredits } = await supabase
        .from('user_credits')
        .select('tier')
        .eq('user_id', targetUserId)
        .single()

      const userTier = userCredits?.tier || 'hobby'

      // Get engines assigned to user directly or through tier
      const { data, error } = await supabase
        .from('engine_assignments')
        .select(`
          *,
          ai_engines!inner(
            id,
            name,
            description,
            flow_config,
            models,
            execution_mode,
            tier,
            active
          )
        `)
        .eq('active', true)
        .eq('ai_engines.active', true)
        .or(`and(assignment_type.eq.user,user_id.eq.${targetUserId}),and(assignment_type.eq.tier,tier.eq.${userTier})`)
        .order('priority', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching user assigned engines:', error)
      return []
    }
  }

  async getAssignmentStats() {
    try {
      const { data: assignments, error } = await supabase
        .from('engine_assignments')
        .select(`
          *,
          ai_engines!inner(id, name, tier)
        `)
        .eq('active', true)

      if (error) throw error

      const stats = {
        totalAssignments: assignments?.length || 0,
        tierAssignments: assignments?.filter(a => a.assignment_type === 'tier').length || 0,
        userAssignments: assignments?.filter(a => a.assignment_type === 'user').length || 0,
        assignmentsByTier: {
          hobby: assignments?.filter(a => a.assignment_type === 'tier' && a.tier === 'hobby').length || 0,
          pro: assignments?.filter(a => a.assignment_type === 'tier' && a.tier === 'pro').length || 0,
          enterprise: assignments?.filter(a => a.assignment_type === 'tier' && a.tier === 'enterprise').length || 0
        }
      }

      return stats
    } catch (error) {
      console.error('Error fetching assignment stats:', error)
      return {
        totalAssignments: 0,
        tierAssignments: 0,
        userAssignments: 0,
        assignmentsByTier: { hobby: 0, pro: 0, enterprise: 0 }
      }
    }
  }

  async bulkAssignEngines(assignments) {
    try {
      const { data, error } = await supabase
        .from('engine_assignments')
        .insert(assignments.map(assignment => ({
          ...assignment,
          active: true
        })))
        .select()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error bulk assigning engines:', error)
      throw error
    }
  }

  async updateAssignmentPriority(assignmentId, priority) {
    try {
      const { data, error } = await supabase
        .from('engine_assignments')
        .update({ priority })
        .eq('id', assignmentId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating assignment priority:', error)
      throw error
    }
  }
}

export const engineAssignmentService = new EngineAssignmentService()
