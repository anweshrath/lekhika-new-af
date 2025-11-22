import { dbService } from './database'

class TokenRestrictionService {
  constructor() {
    this.usageCache = new Map()
    this.limitCache = new Map()
  }

  // ENFORCE TOKEN RESTRICTIONS - MAIN FUNCTION
  async enforceTokenRestriction(userId, tokenUsage, operation = 'book_generation') {
    try {
      console.log(`🔒 Enforcing token restrictions for user ${userId}, usage: ${tokenUsage}`)

      // Get user's current plan and limits
      const userLimits = await this.getUserTokenLimits(userId)
      const currentUsage = await this.getCurrentUsage(userId)
      
      // Check if user can perform operation
      const canProceed = await this.canUserProceed(userId, tokenUsage, userLimits, currentUsage)
      
      if (!canProceed.allowed) {
        throw new Error(`Token limit exceeded: ${canProceed.reason}`)
      }

      // Update usage BEFORE operation
      await this.updateUsage(userId, tokenUsage, operation)
      
      return {
        success: true,
        remainingTokens: canProceed.remainingTokens,
        limitType: userLimits.planType
      }

    } catch (error) {
      console.error('❌ Token restriction enforcement failed:', error)
      throw error
    }
  }

  // GET USER TOKEN LIMITS BASED ON PLAN
  async getUserTokenLimits(userId) {
    try {
      // Check cache first
      const cacheKey = `limits_${userId}`
      if (this.limitCache.has(cacheKey)) {
        const cached = this.limitCache.get(cacheKey)
        if (Date.now() - cached.timestamp < 300000) { // 5 min cache
          return cached.data
        }
      }

      // Get user's subscription/plan
      const user = await dbService.getUserById(userId)
      if (!user) {
        throw new Error('User not found')
      }

      // Define token limits by plan
      const planLimits = {
        'starter': {
          monthlyTokens: 100000, // ~100 books
          dailyTokens: 5000,     // ~5 books per day
          hourlyTokens: 2000,    // ~2 books per hour
          planType: 'starter'
        },
        'pro': {
          monthlyTokens: 500000, // ~500 books
          dailyTokens: 25000,    // ~25 books per day
          hourlyTokens: 5000,    // ~5 books per hour
          planType: 'pro'
        },
        'enterprise': {
          monthlyTokens: 2000000, // ~2000 books
          dailyTokens: 100000,    // ~100 books per day
          hourlyTokens: 20000,    // ~20 books per hour
          planType: 'enterprise'
        }
      }

      const userPlan = user.plan || 'starter'
      const limits = planLimits[userPlan] || planLimits.starter

      // Cache the limits
      this.limitCache.set(cacheKey, {
        data: limits,
        timestamp: Date.now()
      })

      return limits

    } catch (error) {
      console.error('❌ Failed to get user token limits:', error)
      // Return starter limits as fallback
      return {
        monthlyTokens: 100000,
        dailyTokens: 5000,
        hourlyTokens: 2000,
        planType: 'starter'
      }
    }
  }

  // GET CURRENT USAGE FOR USER
  async getCurrentUsage(userId) {
    try {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const startOfHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours())

      // Get usage from database
      const usage = await dbService.query(`
        SELECT 
          SUM(CASE WHEN created_at >= $2 THEN tokens_used ELSE 0 END) as hourly_usage,
          SUM(CASE WHEN created_at >= $3 THEN tokens_used ELSE 0 END) as daily_usage,
          SUM(CASE WHEN created_at >= $4 THEN tokens_used ELSE 0 END) as monthly_usage
        FROM user_token_usage 
        WHERE user_id = $1
      `, [userId, startOfHour, startOfDay, startOfMonth])

      return {
        hourly: parseInt(usage.rows[0]?.hourly_usage || 0),
        daily: parseInt(usage.rows[0]?.daily_usage || 0),
        monthly: parseInt(usage.rows[0]?.monthly_usage || 0)
      }

    } catch (error) {
      console.error('❌ Failed to get current usage:', error)
      return { hourly: 0, daily: 0, monthly: 0 }
    }
  }

  // CHECK IF USER CAN PROCEED WITH OPERATION
  async canUserProceed(userId, tokenUsage, limits, currentUsage) {
    try {
      // Check hourly limit
      if (currentUsage.hourly + tokenUsage > limits.hourlyTokens) {
        return {
          allowed: false,
          reason: `Hourly limit exceeded. Used: ${currentUsage.hourly}/${limits.hourlyTokens}`,
          remainingTokens: 0
        }
      }

      // Check daily limit
      if (currentUsage.daily + tokenUsage > limits.dailyTokens) {
        return {
          allowed: false,
          reason: `Daily limit exceeded. Used: ${currentUsage.daily}/${limits.dailyTokens}`,
          remainingTokens: 0
        }
      }

      // Check monthly limit
      if (currentUsage.monthly + tokenUsage > limits.monthlyTokens) {
        return {
          allowed: false,
          reason: `Monthly limit exceeded. Used: ${currentUsage.monthly}/${limits.monthlyTokens}`,
          remainingTokens: 0
        }
      }

      // Calculate remaining tokens (lowest limit)
      const hourlyRemaining = limits.hourlyTokens - (currentUsage.hourly + tokenUsage)
      const dailyRemaining = limits.dailyTokens - (currentUsage.daily + tokenUsage)
      const monthlyRemaining = limits.monthlyTokens - (currentUsage.monthly + tokenUsage)

      const remainingTokens = Math.min(hourlyRemaining, dailyRemaining, monthlyRemaining)

      return {
        allowed: true,
        reason: 'All limits OK',
        remainingTokens: Math.max(0, remainingTokens)
      }

    } catch (error) {
      console.error('❌ Failed to check if user can proceed:', error)
      return {
        allowed: false,
        reason: 'Error checking limits',
        remainingTokens: 0
      }
    }
  }

  // UPDATE USAGE AFTER SUCCESSFUL OPERATION
  async updateUsage(userId, tokenUsage, operation) {
    try {
      await dbService.query(`
        INSERT INTO user_token_usage (user_id, tokens_used, operation_type, created_at)
        VALUES ($1, $2, $3, NOW())
      `, [userId, tokenUsage, operation])

      // Clear cache to force refresh
      this.usageCache.delete(userId)
      
      console.log(`✅ Updated usage for user ${userId}: +${tokenUsage} tokens`)

    } catch (error) {
      console.error('❌ Failed to update usage:', error)
      throw error
    }
  }

  // GET USAGE STATISTICS FOR USER
  async getUserUsageStats(userId) {
    try {
      const limits = await this.getUserTokenLimits(userId)
      const usage = await this.getCurrentUsage(userId)

      return {
        limits,
        usage,
        percentages: {
          hourly: Math.round((usage.hourly / limits.hourlyTokens) * 100),
          daily: Math.round((usage.daily / limits.dailyTokens) * 100),
          monthly: Math.round((usage.monthly / limits.monthlyTokens) * 100)
        },
        remaining: {
          hourly: Math.max(0, limits.hourlyTokens - usage.hourly),
          daily: Math.max(0, limits.dailyTokens - usage.daily),
          monthly: Math.max(0, limits.monthlyTokens - usage.monthly)
        }
      }

    } catch (error) {
      console.error('❌ Failed to get usage stats:', error)
      throw error
    }
  }

  // SUPERVISED ADMIN - OVERRIDE LIMITS
  async adminOverrideLimits(userId, newLimits, adminId) {
    try {
      // Log admin action
      await dbService.query(`
        INSERT INTO admin_actions (admin_id, action_type, target_user_id, details, created_at)
        VALUES ($1, 'token_limit_override', $2, $3, NOW())
      `, [adminId, userId, JSON.stringify(newLimits)])

      // Update user's custom limits
      await dbService.query(`
        INSERT INTO user_custom_limits (user_id, custom_limits, updated_by, updated_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (user_id) 
        DO UPDATE SET custom_limits = $2, updated_by = $3, updated_at = NOW()
      `, [userId, JSON.stringify(newLimits), adminId])

      // Clear cache
      this.limitCache.delete(`limits_${userId}`)
      
      console.log(`🔧 Admin ${adminId} overrode limits for user ${userId}`)

    } catch (error) {
      console.error('❌ Failed to override limits:', error)
      throw error
    }
  }

  // GET ALL USERS WITH HIGH USAGE (FOR ADMIN MONITORING)
  async getHighUsageUsers(threshold = 80) {
    try {
      const result = await dbService.query(`
        SELECT 
          u.id,
          u.email,
          u.plan,
          COALESCE(SUM(ut.tokens_used), 0) as monthly_usage,
          CASE 
            WHEN u.plan = 'starter' THEN 100000
            WHEN u.plan = 'pro' THEN 500000
            WHEN u.plan = 'enterprise' THEN 2000000
            ELSE 100000
          END as monthly_limit,
          ROUND((COALESCE(SUM(ut.tokens_used), 0) / 
            CASE 
              WHEN u.plan = 'starter' THEN 100000
              WHEN u.plan = 'pro' THEN 500000
              WHEN u.plan = 'enterprise' THEN 2000000
              ELSE 100000
            END) * 100, 2) as usage_percentage
        FROM users u
        LEFT JOIN user_token_usage ut ON u.id = ut.user_id 
          AND ut.created_at >= DATE_TRUNC('month', NOW())
        GROUP BY u.id, u.email, u.plan
        HAVING ROUND((COALESCE(SUM(ut.tokens_used), 0) / 
          CASE 
            WHEN u.plan = 'starter' THEN 100000
            WHEN u.plan = 'pro' THEN 500000
            WHEN u.plan = 'enterprise' THEN 2000000
            ELSE 100000
          END) * 100, 2) >= $1
        ORDER BY usage_percentage DESC
      `, [threshold])

      return result.rows

    } catch (error) {
      console.error('❌ Failed to get high usage users:', error)
      throw error
    }
  }
}

export const tokenRestrictionService = new TokenRestrictionService()
