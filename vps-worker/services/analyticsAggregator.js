const { getSupabase } = require('./supabase')
const logger = require('../utils/logger')

class AnalyticsAggregator {
  constructor() {
    this.supabase = null
    this.aggregationInterval = null
  }

  async initialize() {
    this.supabase = getSupabase()
    logger.info('✅ Analytics Aggregator initialized')
  }

  /**
   * Update user analytics after execution completion
   */
  async updateUserAnalytics(userId, executionData) {
    try {
      // Only aggregate if tokens were used (AI was actually called)
      const tokensUsed = executionData.tokens_used || 0
      if (tokensUsed === 0) {
        logger.debug(`⏭️  Skipping analytics for user ${userId}: no tokens used`)
        return
      }

      const now = new Date()
      const currentHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours())
      
      const costEstimate = executionData.cost_estimate || 0
      const status = executionData.status
      const engineId = executionData.engine_id
      const engineName = executionData.engine_name || 'Unknown Engine'
      
      // Determine model type (Included/PAYG) - will be enhanced later
      const modelType = 'Unknown' // TODO: Get from workflow data or AI model metadata

      // Upsert analytics record for current hour
      const { data: existingRecord, error: selectError } = await this.supabase
        .from('user_analytics')
        .select('*')
        .eq('user_id', userId)
        .eq('analytics_type', 'token_usage')
        .eq('date_hour', currentHour.toISOString())
        .single()

      if (selectError && selectError.code !== 'PGRST116') {
        throw selectError
      }

      if (existingRecord) {
        // Update existing record
        const updates = {
          total_tokens: existingRecord.total_tokens + tokensUsed,
          total_cost: existingRecord.total_cost + parseFloat(costEstimate),
          execution_count: existingRecord.execution_count + 1,
          avg_tokens_per_execution: (existingRecord.total_tokens + tokensUsed) / (existingRecord.execution_count + 1),
          peak_hourly_usage: Math.max(existingRecord.peak_hourly_usage, tokensUsed),
          updated_at: new Date().toISOString()
        }

        // Update status counters
        if (status === 'completed') {
          updates.successful_executions = existingRecord.successful_executions + 1
        } else if (status === 'failed') {
          updates.failed_executions = existingRecord.failed_executions + 1
        } else if (status === 'cancelled') {
          updates.cancelled_executions = existingRecord.cancelled_executions + 1
        }

        const { error: updateError } = await this.supabase
          .from('user_analytics')
          .update(updates)
          .eq('id', existingRecord.id)

        if (updateError) throw updateError

        logger.info(`📊 Updated analytics for user ${userId}: +${tokensUsed} tokens, +$${costEstimate}`)

      } else {
        // Create new record
        const newRecord = {
          user_id: userId,
          analytics_type: 'token_usage',
          date_hour: currentHour.toISOString(),
          engine_id: engineId,
          engine_name: engineName,
          model_type: modelType,
          total_tokens: tokensUsed,
          total_cost: parseFloat(costEstimate),
          execution_count: 1,
          successful_executions: status === 'completed' ? 1 : 0,
          failed_executions: status === 'failed' ? 1 : 0,
          cancelled_executions: status === 'cancelled' ? 1 : 0,
          avg_tokens_per_execution: tokensUsed,
          peak_hourly_usage: tokensUsed
        }

        const { error: insertError } = await this.supabase
          .from('user_analytics')
          .insert(newRecord)

        if (insertError) throw insertError

        logger.info(`📊 Created new analytics record for user ${userId}: ${tokensUsed} tokens, $${costEstimate}`)
      }

    } catch (error) {
      logger.error('❌ Failed to update user analytics:', error)
      // Don't throw - analytics failure shouldn't break execution
    }
  }

  /**
   * Clean up old execution records (24+ hours old)
   */
  async cleanupOldExecutions() {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

      const { data: deletedExecutions, error } = await this.supabase
        .from('engine_executions')
        .delete()
        .lt('created_at', twentyFourHoursAgo)
        .select('id')

      if (error) throw error

      const deletedCount = deletedExecutions?.length || 0
      if (deletedCount > 0) {
        logger.info(`🧹 Cleaned up ${deletedCount} old execution records (24+ hours old)`)
      }

      return deletedCount

    } catch (error) {
      logger.error('❌ Failed to cleanup old executions:', error)
      return 0
    }
  }

  /**
   * Start periodic cleanup (every 6 hours)
   */
  startPeriodicCleanup() {
    this.aggregationInterval = setInterval(async () => {
      await this.cleanupOldExecutions()
    }, 6 * 60 * 60 * 1000) // Every 6 hours

    logger.info('🧹 Started periodic execution cleanup (every 6 hours)')
  }

  /**
   * Stop periodic cleanup
   */
  stopPeriodicCleanup() {
    if (this.aggregationInterval) {
      clearInterval(this.aggregationInterval)
      this.aggregationInterval = null
      logger.info('🛑 Stopped periodic execution cleanup')
    }
  }
}

module.exports = new AnalyticsAggregator()
