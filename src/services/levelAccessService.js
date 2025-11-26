// Professional Level Access Service
// Comprehensive enforcement, no lazy bullshit
import { supabase } from '../lib/supabase';

class LevelAccessService {
  constructor() {
    this.currentUser = null;
  }

  // =====================================================
  // FEATURE ACCESS CONTROL
  // =====================================================

  async checkFeatureAccess(featureName) {
    try {
      if (!this.currentUser) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .rpc('check_feature_access', {
          p_user_id: this.currentUser.id,
          p_feature_name: featureName
        });

      if (error) throw error;

      return data;

    } catch (error) {
      console.error('❌ Feature access check failed:', error);
      return false;
    }
  }

  async getUserAccessibleFeatures() {
    try {
      if (!this.currentUser) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .rpc('get_user_accessible_features', {
          p_user_id: this.currentUser.id
        });

      if (error) throw error;

      return data || [];

    } catch (error) {
      console.error('❌ Get accessible features failed:', error);
      return [];
    }
  }

  // =====================================================
  // LEVEL MANAGEMENT
  // =====================================================

  async assignUserToLevel(userId, levelName) {
    try {
      const { data, error } = await supabase
        .rpc('assign_user_to_level', {
          p_user_id: userId,
          p_level_name: levelName
        });

      if (error) throw error;

      console.log('✅ User assigned to level successfully:', levelName);
      return data;

    } catch (error) {
      console.error('❌ Level assignment failed:', error);
      throw error;
    }
  }

  async validateTierUpgrade(userId, newTier) {
    try {
      const { data, error } = await supabase
        .rpc('validate_tier_upgrade', {
          p_user_id: userId,
          p_new_tier: newTier
        });

      if (error) throw error;

      return data;

    } catch (error) {
      console.error('❌ Tier upgrade validation failed:', error);
      return false;
    }
  }

  // =====================================================
  // LEVEL DATA MANAGEMENT
  // =====================================================

  async getLevels() {
    try {
      const { data, error } = await supabase
        .from('levels')
        .select('*')
        .eq('is_active', true)
        .order('tier_level', { ascending: true });

      if (error) throw error;

      return data || [];

    } catch (error) {
      console.error('❌ Get levels failed:', error);
      return [];
    }
  }

  async getLevelAccess() {
    try {
      const { data, error } = await supabase
        .from('level_access')
        .select('*')
        .eq('is_active', true)
        .order('feature_category', { ascending: true });

      if (error) throw error;

      return data || [];

    } catch (error) {
      console.error('❌ Get level access failed:', error);
      return [];
    }
  }

  async updateLevelAccess(accessId, updates) {
    try {
      const { data, error } = await supabase
        .from('level_access')
        .update(updates)
        .eq('id', accessId)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Level access updated successfully');
      return data;

    } catch (error) {
      console.error('❌ Level access update failed:', error);
      throw error;
    }
  }

  async createLevelAccess(accessData) {
    try {
      const { data, error } = await supabase
        .from('level_access')
        .insert([accessData])
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Level access created successfully');
      return data;

    } catch (error) {
      console.error('❌ Level access creation failed:', error);
      throw error;
    }
  }

  // =====================================================
  // USER AUDIT AND ANALYTICS
  // =====================================================

  async auditUserAccess(userId) {
    try {
      const { data, error } = await supabase
        .rpc('audit_user_access', {
          p_user_id: userId
        });

      if (error) throw error;

      return data?.[0] || null;

    } catch (error) {
      console.error('❌ User access audit failed:', error);
      return null;
    }
  }

  async getUserLevelStats() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('tier, access_level, credits_balance, monthly_limit')
        .eq('is_active', true);

      if (error) throw error;

      // Group by tier
      const stats = data.reduce((acc, user) => {
        const tier = user.tier;
        if (!acc[tier]) {
          acc[tier] = {
            count: 0,
            totalCredits: 0,
            avgAccessLevel: 0
          };
        }
        acc[tier].count++;
        acc[tier].totalCredits += user.credits_balance;
        acc[tier].avgAccessLevel += user.access_level;
      }, {});

      // Calculate averages
      Object.keys(stats).forEach(tier => {
        stats[tier].avgAccessLevel = Math.round(stats[tier].avgAccessLevel / stats[tier].count);
      });

      return stats;

    } catch (error) {
      console.error('❌ Get user level stats failed:', error);
      return {};
    }
  }

  // =====================================================
  // ENGINE ASSIGNMENT CONTROL
  // =====================================================

  async assignEngineToUser(userId, engineId) {
    try {
      // This will trigger the enforce_engine_access trigger
      const { data, error } = await supabase
        .from('user_engines')
        .insert([{
          user_id: userId,
          engine_id: engineId,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Engine assigned to user successfully');
      return data;

    } catch (error) {
      console.error('❌ Engine assignment failed:', error);
      throw error;
    }
  }

  async removeEngineFromUser(userId, engineId) {
    try {
      const { data, error } = await supabase
        .from('user_engines')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('engine_id', engineId)
        .select()
        .single();

      if (error) throw error;

      console.log('✅ Engine removed from user successfully');
      return data;

    } catch (error) {
      console.error('❌ Engine removal failed:', error);
      throw error;
    }
  }

  // =====================================================
  // UTILITY FUNCTIONS
  // =====================================================

  setCurrentUser(user) {
    this.currentUser = user;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  hasAccessToFeature(featureName) {
    if (!this.currentUser) return false;
    
    // This would need to be called asynchronously in real usage
    // For now, return a promise-based check
    return this.checkFeatureAccess(featureName);
  }

  getUserTier() {
    return this.currentUser?.tier || 'hobby';
  }

  getUserAccessLevel() {
    return this.currentUser?.access_level || 1;
  }

  // =====================================================
  // FEATURE PERMISSION HELPERS
  // =====================================================

  async canCreateEbook() {
    return await this.checkFeatureAccess('ebook_creation');
  }

  async canCreateReport() {
    return await this.checkFeatureAccess('report_creation');
  }

  async canCreateWhitepaper() {
    return await this.checkFeatureAccess('whitepaper_creation');
  }

  async canAccessGPT4() {
    return await this.checkFeatureAccess('gpt4_access');
  }

  async canAccessClaude() {
    return await this.checkFeatureAccess('claude_access');
  }
}

// Create singleton instance
const levelAccessService = new LevelAccessService();

export default levelAccessService;
