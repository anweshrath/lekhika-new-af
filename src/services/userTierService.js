import { supabase } from '../lib/supabase'

class UserTierService {
  async getUserTier(userId = null) {
    try {
      const { data: user } = await supabase.auth.getUser()
      const targetUserId = userId || user?.user?.id

      if (!targetUserId) {
        return 'hobby' // Default tier for unauthenticated users
      }

      // Get user's tier from user_credits table
      const { data: userCredits, error } = await supabase
        .from('user_credits')
        .select('tier')
        .eq('user_id', targetUserId)
        .single()

      if (error || !userCredits) {
        // Create default tier if doesn't exist
        await this.initializeUserTier(targetUserId)
        return 'hobby'
      }

      return userCredits.tier || 'hobby'
    } catch (error) {
      console.error('Error getting user tier:', error)
      return 'hobby'
    }
  }

  async initializeUserTier(userId, tier = 'hobby') {
    try {
      const { data, error } = await supabase
        .from('user_credits')
        .upsert([{
          user_id: userId,
          tier: tier,
          credits_remaining: this.getDefaultCreditsForTier(tier),
          credits_total: this.getDefaultCreditsForTier(tier),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error initializing user tier:', error)
      throw error
    }
  }

  async updateUserTier(userId, newTier) {
    try {
      const { data, error } = await supabase
        .from('user_credits')
        .update({
          tier: newTier,
          credits_remaining: this.getDefaultCreditsForTier(newTier),
          credits_total: this.getDefaultCreditsForTier(newTier),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error updating user tier:', error)
      throw error
    }
  }

  getDefaultCreditsForTier(tier) {
    const tierCredits = {
      hobby: 10,
      pro: 100,
      enterprise: 1000
    }
    return tierCredits[tier] || 10
  }

  async getUserCreditsInfo(userId = null) {
    try {
      const { data: user } = await supabase.auth.getUser()
      const targetUserId = userId || user?.user?.id

      if (!targetUserId) {
        return null
      }

      const { data, error } = await supabase
        .from('user_credits')
        .select('*')
        .eq('user_id', targetUserId)
        .single()

      if (error || !data) {
        // Initialize if doesn't exist
        return await this.initializeUserTier(targetUserId)
      }

      return data
    } catch (error) {
      console.error('Error getting user credits info:', error)
      return null
    }
  }

  async deductCredits(userId, amount) {
    try {
      const { data, error } = await supabase
        .from('user_credits')
        .update({
          credits_remaining: supabase.raw(`credits_remaining - ${amount}`),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error deducting credits:', error)
      throw error
    }
  }
}

export const userTierService = new UserTierService()
