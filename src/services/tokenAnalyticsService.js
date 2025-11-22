import { supabase } from '../lib/supabase'

class TokenAnalyticsService {
  constructor() {
    this.cache = new Map()
    this.cacheTimeout = 5 * 60 * 1000 // 5 minutes
  }

  /**
   * Get user's token usage and cost analytics
   */
  async getUserTokenAnalytics(userId, period = '30d') {
    try {
      const cacheKey = `user_${userId}_${period}`
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey)
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data
        }
      }

      const dateFilter = this.getDateFilter(period)
      
      // Get token usage from user_analytics table (aggregated data)
      console.log('🔍 Querying user_analytics with:', { userId, dateFilter })
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('user_analytics')
        .select(`
          date_hour,
          engine_id,
          engine_name,
          model_type,
          total_tokens,
          total_cost,
          execution_count,
          successful_executions,
          failed_executions,
          cancelled_executions,
          avg_tokens_per_execution,
          peak_hourly_usage
        `)
        .eq('user_id', userId)
        .eq('analytics_type', 'token_usage')
        .gte('date_hour', dateFilter)
        .order('date_hour', { ascending: false })

      console.log('📊 Query result:', { analyticsData, analyticsError })

      if (analyticsError) {
        console.error('❌ Analytics query error:', analyticsError)
        throw analyticsError
      }

      // SURGICAL STRIKE: Fetch recent executions directly for rich data, bypassing the aggregated table.
      // NOTE: execution_data excluded to avoid 400 errors from large JSONB (4.6MB+)
      // execution_data is only needed for individual execution details, not list queries
      const { data: recentExecutions, error: recentExecutionsError } = await supabase
        .from('engine_executions')
        .select(`
          id,
          created_at,
          completed_at,
          engine_id,
          book_id,
          tokens_used,
          status,
          cost_estimate,
          execution_time_ms,
          input_data,
          user_input,
          ai_engines (
            name
          ),
          books (
            title,
            type,
            niche
          )
        `)
        .eq('user_id', userId)
        .gte('created_at', dateFilter)
        .order('created_at', { ascending: false })
        .limit(150)

      if (recentExecutionsError) {
        console.error('❌ Recent executions direct query error:', recentExecutionsError);
        // Don't throw, we can still proceed with aggregated data if this fails
      }

 
      // Calculate analytics from aggregated data
      const analytics = this.calculateUserAnalyticsFromAggregated(analyticsData)
      
      // SURGICAL INJECTION: Overwrite the aggregated recentExecutions with our high-quality direct data.
      let aiEngineConfigs = {}
      let userEngineConfigs = {}

      if (recentExecutions && recentExecutions.length > 0) {
        const engineIds = Array.from(
          new Set(recentExecutions.map(exec => exec.engine_id).filter(Boolean))
        )
        if (engineIds.length > 0) {
          const { data: engineRows, error: engineError } = await supabase
            .from('ai_engines')
            .select('id, flow_config, models')
            .in('id', engineIds)
          if (!engineError && engineRows) {
            aiEngineConfigs = engineRows.reduce((acc, row) => {
              acc[row.id] = row
              return acc
            }, {})
          } else if (engineError) {
            console.warn('⚠️ Failed to load ai_engine configs:', engineError)
          }
        }

        const userEngineIds = Array.from(
          new Set(
            recentExecutions
              .map(exec => this.extractUserEngineId(exec.execution_data))
              .filter(Boolean)
          )
        )
        if (userEngineIds.length > 0) {
          const { data: userEngineRows, error: userEngineError } = await supabase
            .from('user_engines')
            .select('id, config')
            .in('id', userEngineIds)
          if (!userEngineError && userEngineRows) {
            userEngineConfigs = userEngineRows.reduce((acc, row) => {
              acc[row.id] = row.config
              return acc
            }, {})
          } else if (userEngineError) {
            console.warn('⚠️ Failed to load user_engine configs:', userEngineError)
          }
        }
      }

      if (recentExecutions) {
        analytics.recentExecutions = recentExecutions.map(exec =>
          this.enrichExecutionMetadata(exec, { aiEngineConfigs, userEngineConfigs })
        )
      }
      analytics.flowBreakdown = this.calculateFlowBreakdown(analytics.recentExecutions)
      analytics.modelBreakdown = this.calculateModelBreakdown(analytics.recentExecutions)
      analytics.topEngines = this.calculateTopEngines(analytics.recentExecutions)
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: analytics,
        timestamp: Date.now()
      })

      return analytics
    } catch (error) {
      console.error('Error getting user token analytics:', error)
      throw error
    }
  }

  /**
   * Get SuperAdmin's system-wide token analytics
   */
  async getSuperAdminTokenAnalytics(period = '30d') {
    try {
      const cacheKey = `superadmin_${period}`
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey)
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
          return cached.data
        }
      }

      const dateFilter = this.getDateFilter(period)

      // Get all engine executions with proper joins
      const { data: executions, error: execError } = await supabase
        .from('engine_executions')
        .select(`
          id,
          user_id,
          engine_id,
          tokens_used,
          cost_estimate,
          status,
          created_at,
          completed_at,
          execution_time_ms,
          ai_engines(name, description),
          users(email, full_name)
        `)
        .gte('created_at', dateFilter)
        .order('created_at', { ascending: false })

      if (execError) {
        console.error('❌ SuperAdmin executions query error:', execError)
        throw execError
      }

      console.log('🔍 SuperAdmin analytics - Found executions:', executions?.length || 0)
      console.log('🔍 Sample execution:', executions?.[0])

      // Skip usage_logs for now since table doesn't exist
      const usageLogs = []

      // Calculate system-wide analytics
      const analytics = this.calculateSuperAdminAnalytics(executions, usageLogs)
      console.log('🔍 Calculated analytics:', analytics.summary)
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: analytics,
        timestamp: Date.now()
      })

      return analytics
    } catch (error) {
      console.error('Error getting SuperAdmin token analytics:', error)
      throw error
    }
  }

  /**
   * Get token usage by engine
   */
  async getEngineTokenAnalytics(engineId, period = '30d') {
    try {
      const dateFilter = this.getDateFilter(period)
      
      const { data: executions, error } = await supabase
        .from('engine_executions')
        .select(`
          id,
          user_id,
          tokens_used,
          cost_estimate,
          status,
          created_at,
          users!inner(email, full_name)
        `)
        .eq('engine_id', engineId)
        .gte('created_at', dateFilter)
        .order('created_at', { ascending: false })

      if (error) throw error

      return this.calculateEngineAnalytics(executions)
    } catch (error) {
      console.error('Error getting engine token analytics:', error)
      throw error
    }
  }

  /**
   * Get top users by token usage
   */
  async getTopUsersByTokens(limit = 10, period = '30d') {
    try {
      const dateFilter = this.getDateFilter(period)
      
      const { data, error } = await supabase
        .from('engine_executions')
        .select(`
          user_id,
          tokens_used,
          cost_estimate,
          users!inner(email, full_name)
        `)
        .gte('created_at', dateFilter)
        .eq('status', 'completed')

      if (error) throw error

      // Group by user and sum tokens
      const userStats = {}
      data.forEach(execution => {
        const userId = execution.user_id
        if (!userStats[userId]) {
          userStats[userId] = {
            user: execution.users,
            totalTokens: 0,
            totalCost: 0,
            executions: 0
          }
        }
        userStats[userId].totalTokens += execution.tokens_used || 0
        userStats[userId].totalCost += execution.cost_estimate || 0
        userStats[userId].executions += 1
      })

      return Object.values(userStats)
        .sort((a, b) => b.totalTokens - a.totalTokens)
        .slice(0, limit)
    } catch (error) {
      console.error('Error getting top users by tokens:', error)
      throw error
    }
  }

  /**
   * Get daily token usage trends
   */
  async getDailyTokenTrends(period = '30d') {
    try {
      const dateFilter = this.getDateFilter(period)
      
      const { data, error } = await supabase
        .from('engine_executions')
        .select('tokens_used, cost_estimate, created_at')
        .gte('created_at', dateFilter)
        .eq('status', 'completed')
        .order('created_at', { ascending: true })

      if (error) throw error

      // Group by day
      const dailyStats = {}
      data.forEach(execution => {
        const date = new Date(execution.created_at).toISOString().split('T')[0]
        if (!dailyStats[date]) {
          dailyStats[date] = {
            date,
            tokens: 0,
            cost: 0,
            executions: 0
          }
        }
        dailyStats[date].tokens += execution.tokens_used || 0
        dailyStats[date].cost += execution.cost_estimate || 0
        dailyStats[date].executions += 1
      })

      return Object.values(dailyStats)
    } catch (error) {
      console.error('Error getting daily token trends:', error)
      throw error
    }
  }

  /**
   * Calculate user analytics from executions and logs
   */
  calculateUserAnalytics(executions, usageLogs) {
    const completed = executions.filter(e => e.status === 'completed')
    const failed = executions.filter(e => e.status === 'failed')
    
    const totalTokens = completed.reduce((sum, e) => sum + (e.tokens_used || 0), 0)
    const totalCost = completed.reduce((sum, e) => sum + (e.cost_estimate || 0), 0)
    const avgTokensPerExecution = completed.length > 0 ? totalTokens / completed.length : 0
    const avgCostPerExecution = completed.length > 0 ? totalCost / completed.length : 0
    
    // Group by engine
    const byEngineMap = {}
    completed.forEach(execution => {
      const engineName = execution.ai_engines?.name || execution.execution_data?.engineName || 'Unknown Engine'
      const model = execution.execution_data?.aiService || execution.execution_data?.aiMetadata?.model || execution.execution_data?.model || 'Unknown Model'
      if (!byEngineMap[engineName]) {
        byEngineMap[engineName] = {
          name: engineName,
          tokens: 0,
          cost: 0,
          executions: 0,
          modelType: model
        }
      }
      byEngineMap[engineName].tokens += execution.tokens_used || 0
      byEngineMap[engineName].cost += execution.cost_estimate || 0
      byEngineMap[engineName].executions += 1
    })

    const byEngine = Object.values(byEngineMap).map(item => ({
      ...item,
      share: totalTokens > 0 ? item.tokens / totalTokens : 0
    }))

    return {
      summary: {
        totalExecutions: executions.length,
        completedExecutions: completed.length,
        failedExecutions: failed.length,
        successRate: executions.length > 0 ? (completed.length / executions.length) * 100 : 0,
        totalTokens,
        totalCost,
        avgTokensPerExecution: Math.round(avgTokensPerExecution),
        avgCostPerExecution: parseFloat(avgCostPerExecution.toFixed(4))
      },
      byEngine,
      recentExecutions: executions.slice(0, 10),
      usageLogs: usageLogs.slice(0, 20)
    }
  }

  /**
   * Calculate user analytics from aggregated data
   */
  calculateUserAnalyticsFromAggregated(analyticsData) {
    if (!analyticsData || analyticsData.length === 0) {
      return {
        summary: {
          totalExecutions: 0,
          completedExecutions: 0,
          failedExecutions: 0,
          successRate: 0,
          totalTokens: 0,
          totalCost: 0,
          avgTokensPerExecution: 0,
          avgCostPerExecution: 0
        },
        byEngine: [],
        recentExecutions: [],
        usageLogs: []
      }
    }

    // Aggregate data from hourly records
    const totals = analyticsData.reduce((acc, record) => {
      acc.totalTokens += record.total_tokens || 0
      acc.totalCost += parseFloat(record.total_cost || 0)
      acc.totalExecutions += record.execution_count || 0
      acc.completedExecutions += record.successful_executions || 0
      acc.failedExecutions += record.failed_executions || 0
      acc.cancelledExecutions += record.cancelled_executions || 0
      return acc
    }, {
      totalTokens: 0,
      totalCost: 0,
      totalExecutions: 0,
      completedExecutions: 0,
      failedExecutions: 0,
      cancelledExecutions: 0
    })

    const successRate = totals.totalExecutions > 0 ? (totals.completedExecutions / totals.totalExecutions) * 100 : 0
    const avgTokensPerExecution = totals.completedExecutions > 0 ? totals.totalTokens / totals.completedExecutions : 0
    const avgCostPerExecution = totals.completedExecutions > 0 ? totals.totalCost / totals.completedExecutions : 0

    // Group by engine
    const byEngine = {}
    analyticsData.forEach(record => {
      const engineKey = record.engine_id || 'unknown'
      const engineName = record.engine_name || 'Unknown Engine'
      const modelType = record.model_type || 'Unknown'
      
      if (!byEngine[engineKey]) {
        byEngine[engineKey] = {
          name: engineName,
          modelType: modelType,
          tokens: 0,
          cost: 0,
          executions: 0
        }
      }
      byEngine[engineKey].tokens += record.total_tokens || 0
      byEngine[engineKey].cost += parseFloat(record.total_cost || 0)
      byEngine[engineKey].executions += record.execution_count || 0
    })

    const byEngineArray = Object.entries(byEngine).map(([engineKey, stats]) => ({
      ...stats,
      id: engineKey,
      share: totals.totalTokens > 0 ? stats.tokens / totals.totalTokens : 0
    }))

    return {
      summary: {
        totalExecutions: totals.totalExecutions,
        completedExecutions: totals.completedExecutions,
        failedExecutions: totals.failedExecutions,
        cancelledExecutions: totals.cancelledExecutions,
        successRate: Math.round(successRate * 100) / 100,
        totalTokens: totals.totalTokens,
        totalCost: parseFloat(totals.totalCost.toFixed(6)),
        avgTokensPerExecution: Math.round(avgTokensPerExecution),
        avgCostPerExecution: parseFloat(avgCostPerExecution.toFixed(6))
      },
      byEngine: byEngineArray,
      // This part is now overridden by our direct query, but we keep it as a fallback.
      recentExecutions: analyticsData.slice(0, 10).map(record => ({
        id: record.engine_id + record.date_hour, // Create a pseudo-id
        created_at: record.date_hour,
        engine_name: record.engine_name, // This will be null/stale
        ai_engines: { name: record.engine_name, kind: record.model_type }, // Mimic structure
        model_type: record.model_type, // This will be null/stale
        tokens_used: record.total_tokens,
        cost: record.total_cost,
        status: 'completed' // Assume completed for analytics data
      })),
      usageLogs: []
    }
  }

  /**
   * Calculate SuperAdmin analytics
   */
  calculateSuperAdminAnalytics(executions, usageLogs) {
    const completed = executions.filter(e => e.status === 'completed')
    const failed = executions.filter(e => e.status === 'failed')
    
    const totalTokens = completed.reduce((sum, e) => sum + (e.tokens_used || 0), 0)
    const totalCost = completed.reduce((sum, e) => sum + (e.cost_estimate || 0), 0)
    
    // Group by user
    const byUser = {}
    completed.forEach(execution => {
      const userId = execution.user_id
      if (!byUser[userId]) {
        byUser[userId] = {
          user: execution.users,
          tokens: 0,
          cost: 0,
          executions: 0
        }
      }
      byUser[userId].tokens += execution.tokens_used || 0
      byUser[userId].cost += execution.cost_estimate || 0
      byUser[userId].executions += 1
    })

    // Group by engine
    const byEngine = {}
    completed.forEach(execution => {
      const engineName = execution.ai_engines?.name || 'Unknown Engine'
      if (!byEngine[engineName]) {
        byEngine[engineName] = {
          name: engineName,
          tokens: 0,
          cost: 0,
          executions: 0
        }
      }
      byEngine[engineName].tokens += execution.tokens_used || 0
      byEngine[engineName].cost += execution.cost_estimate || 0
      byEngine[engineName].executions += 1
    })

    return {
      summary: {
        totalUsers: Object.keys(byUser).length,
        totalExecutions: executions.length,
        completedExecutions: completed.length,
        failedExecutions: failed.length,
        successRate: executions.length > 0 ? (completed.length / executions.length) * 100 : 0,
        totalTokens,
        totalCost,
        avgTokensPerExecution: completed.length > 0 ? Math.round(totalTokens / completed.length) : 0,
        avgCostPerExecution: completed.length > 0 ? parseFloat((totalCost / completed.length).toFixed(4)) : 0
      },
      byUser: Object.values(byUser).sort((a, b) => b.tokens - a.tokens),
      byEngine: Object.values(byEngine).sort((a, b) => b.tokens - a.tokens),
      recentExecutions: executions.slice(0, 20),
      usageLogs: usageLogs.slice(0, 50)
    }
  }

  /**
   * Calculate engine analytics
   */
  calculateEngineAnalytics(executions) {
    const completed = executions.filter(e => e.status === 'completed')
    const failed = executions.filter(e => e.status === 'failed')
    
    const totalTokens = completed.reduce((sum, e) => sum + (e.tokens_used || 0), 0)
    const totalCost = completed.reduce((sum, e) => sum + (e.cost_estimate || 0), 0)
    
    return {
      summary: {
        totalExecutions: executions.length,
        completedExecutions: completed.length,
        failedExecutions: failed.length,
        successRate: executions.length > 0 ? (completed.length / executions.length) * 100 : 0,
        totalTokens,
        totalCost,
        avgTokensPerExecution: completed.length > 0 ? Math.round(totalTokens / completed.length) : 0,
        avgCostPerExecution: completed.length > 0 ? parseFloat((totalCost / completed.length).toFixed(4)) : 0
      },
      recentExecutions: executions.slice(0, 20)
    }
  }

  /**
   * Enrich execution metadata with friendly labels for analytics
   */
  enrichExecutionMetadata(execution, { aiEngineConfigs = {}, userEngineConfigs = {} } = {}) {
    const executionData = execution.execution_data || {}
    const inputData = execution.input_data || {}
    const userInput = execution.user_input || executionData.userInput || {}
    const metadata = executionData.metadata || {}
    const workflowMeta = executionData.workflowMetadata || {}
    const aiMeta = executionData.aiMetadata || {}
    const userEngineId = this.extractUserEngineId(executionData)

    const engineName =
      execution.ai_engines?.name ||
      metadata.engineName ||
      workflowMeta.engineName ||
      executionData.engineName ||
      inputData.engine_name ||
      userInput.engine_name ||
      'Unknown Engine'

    const engineKind =
      execution.ai_engines?.kind ||
      metadata.engineKind ||
      workflowMeta.kind ||
      workflowMeta.category ||
      inputData.engine_kind ||
      userInput.workflow_kind ||
      userInput.book_type ||
      'General'

    const flowCategory =
      execution.books?.type ||
      userInput.book_type ||
      userInput.story_type ||
      metadata.workflowCategory ||
      workflowMeta.category ||
      engineKind ||
      'General'

    const flowTitle =
      execution.books?.title ||
      userInput.book_title ||
      userInput.story_title ||
      userInput.project_title ||
      metadata.workflowTitle ||
      workflowMeta.title ||
      'Untitled Flow'

    const model =
      aiMeta.model ||
      executionData.model ||
      executionData.aiService ||
      metadata.model ||
      userInput.model ||
      userInput.ai_service ||
      'Unknown Model'

    const provider =
      aiMeta.provider ||
      executionData.provider ||
      metadata.provider ||
      userInput.provider ||
      (model && model.toLowerCase().includes('gpt') ? 'OpenAI' : null) ||
      'Unknown Provider'

    const durationMs =
      execution.execution_time_ms ||
      metadata.executionTimeMs ||
      workflowMeta.executionTimeMs ||
      aiMeta.duration_ms ||
      0

    const models = this.collectModels({
      executionData,
      aiEngineConfig: aiEngineConfigs[execution.engine_id],
      userEngineConfig: userEngineConfigs[userEngineId]
    })

    return {
      id: execution.id,
      createdAt: execution.created_at,
      completedAt: execution.completed_at || null,
      tokens: execution.tokens_used || aiMeta.tokens || 0,
      cost: execution.cost_estimate || aiMeta.cost || metadata.cost || 0,
      status: execution.status,
      engineId: execution.engine_id,
      engineName,
      engineKind,
      flowTitle,
      flowCategory,
      model,
      models,
      provider,
      durationMs,
      durationSeconds: durationMs ? durationMs / 1000 : 0,
      books: execution.books || null,
      rawInput: inputData,
      rawExecution: executionData
    }
  }

  /**
   * Aggregate flow statistics by category/kind
   */
  calculateFlowBreakdown(recentExecutions = []) {
    if (!recentExecutions || recentExecutions.length === 0) return []
    const breakdown = recentExecutions.reduce((acc, exec) => {
      const key = exec.flowCategory || 'General'
      if (!acc[key]) {
        acc[key] = {
          label: key,
          tokens: 0,
          executions: 0,
          cost: 0
        }
      }
      acc[key].tokens += exec.tokens || 0
      acc[key].executions += 1
      acc[key].cost += exec.cost || 0
      return acc
    }, {})

    const totalTokens = recentExecutions.reduce((sum, exec) => sum + (exec.tokens || 0), 0)

    return Object.values(breakdown)
      .map(item => ({
        ...item,
        share: totalTokens > 0 ? item.tokens / totalTokens : 0
      }))
      .sort((a, b) => b.tokens - a.tokens)
  }

  /**
   * Aggregate usage by underlying model/provider
   */
  calculateModelBreakdown(recentExecutions = []) {
    if (!recentExecutions || recentExecutions.length === 0) return []
    const models = recentExecutions.reduce((acc, exec) => {
      const modelKeys =
        Array.isArray(exec.models) && exec.models.length > 0
          ? exec.models
          : [exec.model || 'Unknown Model']

      modelKeys.forEach(modelKey => {
        if (!modelKey) return
        if (!acc[modelKey]) {
          acc[modelKey] = {
            model: modelKey,
            provider: exec.provider,
            tokens: 0,
            executions: 0,
            engines: new Set()
          }
        }
        acc[modelKey].tokens += exec.tokens || 0
        acc[modelKey].executions += 1
        if (exec.engineName) {
          acc[modelKey].engines.add(exec.engineName)
        }
      })
      return acc
    }, {})

    const totalTokens = recentExecutions.reduce((sum, exec) => sum + (exec.tokens || 0), 0)

    return Object.values(models)
      .map(item => ({
        model: item.model,
        provider: item.provider,
        tokens: item.tokens,
        executions: item.executions,
        engines: Array.from(item.engines),
        share: totalTokens > 0 ? item.tokens / totalTokens : 0
      }))
      .sort((a, b) => b.tokens - a.tokens)
  }

  /**
   * Aggregate engine level usage with model details
   */
  calculateTopEngines(recentExecutions = []) {
    if (!recentExecutions || recentExecutions.length === 0) return []
    const engineMap = recentExecutions.reduce((acc, exec) => {
      const key = exec.engineName || 'Unknown Engine'
      if (!acc[key]) {
        acc[key] = {
          name: key,
          kind: exec.engineKind,
          tokens: 0,
          executions: 0,
          cost: 0,
          models: new Set()
        }
      }
      acc[key].tokens += exec.tokens || 0
      acc[key].executions += 1
      acc[key].cost += exec.cost || 0
      if (Array.isArray(exec.models) && exec.models.length > 0) {
        exec.models.forEach(model => model && acc[key].models.add(model))
      } else if (exec.model) {
        acc[key].models.add(exec.model)
      }
      return acc
    }, {})

    return Object.values(engineMap)
      .map(item => ({
        ...item,
        models: Array.from(item.models)
      }))
      .sort((a, b) => b.tokens - a.tokens)
  }

  /**
   * Extract user engine id from execution data payloads
   */
  extractUserEngineId(executionData = {}) {
    if (!executionData) return null
    return (
      executionData.userEngineId ||
      executionData.user_engine_id ||
      executionData.executionContext?.userEngineId ||
      executionData.metadata?.userEngineId ||
      null
    )
  }

  /**
   * Collect all models referenced by execution + engine configs
   */
  collectModels({ executionData = {}, aiEngineConfig = {}, userEngineConfig = {} }) {
    const modelSet = new Set()

    const collectFromNodes = (nodes = []) => {
      nodes.forEach(node => {
        const data = node?.data || node
        if (!data) return
        const selected = data.selectedModels || data.models || []
        if (Array.isArray(selected)) {
          selected.forEach(model => {
            if (model) modelSet.add(model)
          })
        }
      })
    }

    if (Array.isArray(executionData.nodes)) {
      collectFromNodes(executionData.nodes)
    }
    if (Array.isArray(executionData.workflow?.nodes)) {
      collectFromNodes(executionData.workflow.nodes)
    }
    if (Array.isArray(executionData.executionContext?.nodes)) {
      collectFromNodes(executionData.executionContext.nodes)
    }

    if (userEngineConfig) {
      if (Array.isArray(userEngineConfig.nodes)) {
        collectFromNodes(userEngineConfig.nodes)
      }
      if (Array.isArray(userEngineConfig.selectedModels)) {
        userEngineConfig.selectedModels.forEach(model => model && modelSet.add(model))
      }
    }

    if (aiEngineConfig) {
      if (Array.isArray(aiEngineConfig.flow_config?.nodes)) {
        collectFromNodes(aiEngineConfig.flow_config.nodes)
      }
      if (Array.isArray(aiEngineConfig.models)) {
        aiEngineConfig.models.forEach(model => model && modelSet.add(model))
      }
    }

    if (modelSet.size === 0 && executionData.aiService) {
      modelSet.add(executionData.aiService)
    }
    if (modelSet.size === 0 && executionData.model) {
      modelSet.add(executionData.model)
    }
    if (modelSet.size === 0 && executionData.aiMetadata?.model) {
      modelSet.add(executionData.aiMetadata.model)
    }

    return Array.from(modelSet)
  }

  /**
   * Get date filter for period
   */
  getDateFilter(period) {
    const now = new Date()
    let days = 30
    
    switch (period) {
      case '7d':
        days = 7
        break
      case '30d':
        days = 30
        break
      case '90d':
        days = 90
        break
      case '1y':
        days = 365
        break
      default:
        days = 30
    }
    
    const filterDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000))
    return filterDate.toISOString()
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear()
  }
}

export const tokenAnalyticsService = new TokenAnalyticsService()
