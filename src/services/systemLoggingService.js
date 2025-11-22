import { supabase } from '../lib/supabase.js'
import { toast } from 'react-hot-toast'

// COMPREHENSIVE SYSTEM LOGGING SERVICE FOR LEKHIKA PLATFORM
// Tracks AI usage, costs, performance, and execution details

class SystemLoggingService {
  constructor() {
    this.isInitialized = false
    this.logQueue = []
    this.batchSize = 10
    this.flushInterval = 5000 // 5 seconds
    this.currentSession = this.generateSessionId()
    this.currentExecution = null
    this.startTime = null
    
    // Initialize batch processing
    this.startBatchProcessor()
  }

  // Generate unique session ID
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Generate unique execution ID
  generateExecutionId() {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Start batch processor for efficient logging
  startBatchProcessor() {
    setInterval(() => {
      this.flushLogQueue()
    }, this.flushInterval)
  }

  // Log workflow execution start
  async logWorkflowStart(flowId, flowName, userId) {
    this.currentExecution = this.generateExecutionId()
    this.startTime = Date.now()
    
    const logEntry = {
      ai_model_id: null, // Will be updated when AI is called
      ai_provider_id: null,
      ai_model_name: 'workflow_start',
      ai_provider_name: 'system',
      engine_id: flowId,
      flow_id: flowId,
      execution_id: this.currentExecution,
      user_id: userId,
      session_id: this.currentSession,
      execution_cost: 0,
      token_usage_input: 0,
      token_usage_output: 0,
      execution_time_ms: 0,
      status: 'pending',
      log_level: 'INFO',
      category: 'WORKFLOW',
      message: `Workflow "${flowName}" execution started`,
      flow_name: flowName,
      workflow_type: 'custom_flow',
      details: {
        flow_id: flowId,
        start_time: new Date().toISOString(),
        execution_phase: 'initialization'
      }
    }

    await this.addToQueue(logEntry)
    return this.currentExecution
  }

  // Log AI API call
  async logAICall(aiModelId, aiProviderId, aiModelName, aiProviderName, 
                  inputTokens, outputTokens, cost, executionTime, status, error = null) {
    
    const logEntry = {
      ai_model_id: aiModelId,
      ai_provider_id: aiProviderId,
      ai_model_name: aiModelName,
      ai_provider_name: aiProviderName,
      engine_id: this.currentExecution || 'unknown',
      execution_id: this.currentExecution,
      user_id: await this.getCurrentUserId(),
      session_id: this.currentSession,
      execution_cost: cost,
      token_usage_input: inputTokens,
      token_usage_output: outputTokens,
      cost_per_input_token: cost / (inputTokens + outputTokens) * 0.7, // Estimate
      cost_per_output_token: cost / (inputTokens + outputTokens) * 0.3, // Estimate
      execution_time_ms: executionTime,
      status: status,
      log_level: status === 'success' ? 'INFO' : 'ERROR',
      category: 'AI_API',
      message: `AI API call to ${aiProviderName} ${aiModelName}`,
      error_code: error?.code || null,
      error_message: error?.message || null,
      bug_category: error ? this.categorizeError(error) : null,
      details: {
        model_details: {
          model_id: aiModelId,
          provider_id: aiProviderId,
          model_name: aiModelName,
          provider_name: aiProviderName
        },
        token_usage: {
          input: inputTokens,
          output: outputTokens,
          total: inputTokens + outputTokens
        },
        cost_breakdown: {
          total_cost: cost,
          cost_per_input_token: cost / (inputTokens + outputTokens) * 0.7,
          cost_per_output_token: cost / (inputTokens + outputTokens) * 0.3
        },
        performance: {
          execution_time_ms: executionTime,
          tokens_per_second: (inputTokens + outputTokens) / (executionTime / 1000)
        }
      }
    }

    await this.addToQueue(logEntry)
  }

  // Log node processing
  async logNodeProcessing(nodeId, nodeType, nodeData, processingTime, status, error = null) {
    const logEntry = {
      ai_model_id: nodeData.aiModelId || null,
      ai_provider_id: nodeData.aiProviderId || null,
      ai_model_name: nodeData.aiModelName || nodeType,
      ai_provider_name: nodeData.aiProviderName || 'workflow_engine',
      engine_id: nodeId,
      node_id: nodeId,
      execution_id: this.currentExecution,
      user_id: await this.getCurrentUserId(),
      session_id: this.currentSession,
      execution_cost: nodeData.cost || 0,
      token_usage_input: nodeData.inputTokens || 0,
      token_usage_output: nodeData.outputTokens || 0,
      execution_time_ms: processingTime,
      status: status,
      log_level: status === 'success' ? 'INFO' : 'ERROR',
      category: 'WORKFLOW',
      message: `Node "${nodeType}" processing ${status}`,
      node_type: nodeType,
      error_code: error?.code || null,
      error_message: error?.message || null,
      bug_category: error ? this.categorizeError(error) : null,
      details: {
        node_processing: {
          node_id: nodeId,
          node_type: nodeType,
          processing_time_ms: processingTime,
          status: status
        },
        ai_usage: {
          model_id: nodeData.aiModelId,
          provider_id: nodeData.aiProviderId,
          model_name: nodeData.aiModelName,
          cost: nodeData.cost,
          input_tokens: nodeData.inputTokens,
          output_tokens: nodeData.outputTokens
        },
        data_flow: {
          input_data_size: JSON.stringify(nodeData.inputData || {}).length,
          output_data_size: JSON.stringify(nodeData.outputData || {}).length,
          previous_node_passover: nodeData.previousNodePassover || null
        }
      }
    }

    await this.addToQueue(logEntry)
  }

  // Log workflow completion
  async logWorkflowComplete(flowId, flowName, totalCost, totalTokens, totalTime, status, error = null) {
    const executionTime = Date.now() - (this.startTime || Date.now())
    
    const logEntry = {
      ai_model_id: null,
      ai_provider_id: null,
      ai_model_name: 'workflow_complete',
      ai_provider_name: 'system',
      engine_id: flowId,
      flow_id: flowId,
      execution_id: this.currentExecution,
      user_id: await this.getCurrentUserId(),
      session_id: this.currentSession,
      execution_cost: totalCost,
      token_usage_input: totalTokens,
      token_usage_output: 0,
      execution_time_ms: executionTime,
      status: status,
      log_level: status === 'success' ? 'INFO' : 'ERROR',
      category: 'WORKFLOW',
      message: `Workflow "${flowName}" execution ${status}`,
      flow_name: flowName,
      workflow_type: 'custom_flow',
      error_code: error?.code || null,
      error_message: error?.message || null,
      bug_category: error ? this.categorizeError(error) : null,
      details: {
        workflow_summary: {
          flow_id: flowId,
          flow_name: flowName,
          total_execution_time_ms: executionTime,
          total_cost: totalCost,
          total_tokens: totalTokens,
          status: status
        },
        performance_metrics: {
          avg_cost_per_second: totalCost / (executionTime / 1000),
          avg_tokens_per_second: totalTokens / (executionTime / 1000),
          cost_efficiency: totalTokens / totalCost
        }
      }
    }

    await this.addToQueue(logEntry)
    
    // Reset execution tracking
    this.currentExecution = null
    this.startTime = null
  }

  // Log user actions
  async logUserAction(action, details, userId = null) {
    const logEntry = {
      ai_model_id: null,
      ai_provider_id: null,
      ai_model_name: 'user_action',
      ai_provider_name: 'system',
      engine_id: 'user_interface',
      execution_id: this.generateExecutionId(),
      user_id: userId || await this.getCurrentUserId(),
      session_id: this.currentSession,
      execution_cost: 0,
      token_usage_input: 0,
      token_usage_output: 0,
      execution_time_ms: 0,
      status: 'success',
      log_level: 'INFO',
      category: 'USER_ACTION',
      message: `User action: ${action}`,
      details: {
        user_action: {
          action: action,
          timestamp: new Date().toISOString(),
          session_id: this.currentSession,
          user_id: userId || await this.getCurrentUserId()
        },
        action_details: details
      }
    }

    await this.addToQueue(logEntry)
  }

  // Log system events
  async logSystemEvent(event, level = 'INFO', details = {}) {
    const logEntry = {
      ai_model_id: null,
      ai_provider_id: null,
      ai_model_name: 'system_event',
      ai_provider_name: 'system',
      engine_id: 'system',
      execution_id: this.generateExecutionId(),
      user_id: await this.getCurrentUserId(),
      session_id: this.currentSession,
      execution_cost: 0,
      token_usage_input: 0,
      token_usage_output: 0,
      execution_time_ms: 0,
      status: level === 'ERROR' || level === 'CRITICAL' ? 'failed' : 'success',
      log_level: level,
      category: 'SYSTEM',
      message: `System event: ${event}`,
      details: {
        system_event: {
          event: event,
          level: level,
          timestamp: new Date().toISOString()
        },
        system_details: details
      }
    }

    await this.addToQueue(logEntry)
  }

  // Add log entry to queue for batch processing
  async addToQueue(logEntry) {
    this.logQueue.push(logEntry)
    
    // Flush immediately if queue is full
    if (this.logQueue.length >= this.batchSize) {
      await this.flushLogQueue()
    }
  }

  // Flush log queue to database
  async flushLogQueue() {
    if (this.logQueue.length === 0) return

    const logsToInsert = [...this.logQueue]
    this.logQueue = []

    try {
      const { error } = await supabase
        .from('system_logs')
        .insert(logsToInsert)

      if (error) {
        console.error('❌ Failed to insert logs:', error)
        // Re-add logs to queue for retry
        this.logQueue.unshift(...logsToInsert)
      } else {
        console.log(`✅ Flushed ${logsToInsert.length} log entries to database`)
      }
    } catch (error) {
      console.error('❌ Logging service error:', error)
      // Re-add logs to queue for retry
      this.logQueue.unshift(...logsToInsert)
    }
  }

  // Get current user ID
  async getCurrentUserId() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      return user?.id || null
    } catch (error) {
      return null
    }
  }

  // Categorize errors
  categorizeError(error) {
    if (error?.message?.includes('rate limit')) return 'rate_limit'
    if (error?.message?.includes('timeout')) return 'timeout'
    if (error?.message?.includes('API')) return 'api_error'
    if (error?.message?.includes('validation')) return 'validation_error'
    return 'system_error'
  }

  // Get logs with filters
  async getLogs(filters = {}) {
    try {
      let query = supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })

      // Apply filters
      if (filters.logLevel) {
        query = query.in('log_level', filters.logLevel)
      }
      if (filters.category) {
        query = query.in('category', filters.category)
      }
      if (filters.status) {
        query = query.in('status', filters.status)
      }
      if (filters.userId) {
        query = query.eq('user_id', filters.userId)
      }
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom)
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo)
      }
      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query

      if (error) {
        console.error('❌ Failed to fetch logs:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('❌ Error fetching logs:', error)
      return []
    }
  }

  // Get analytics data
  async getAnalyticsData(timeRange = '7d') {
    try {
      const dateFrom = this.getDateFromTimeRange(timeRange)
      
      const { data, error } = await supabase
        .from('v_cost_analysis')
        .select('*')
        .gte('date', dateFrom)
        .order('date', { ascending: false })

      if (error) {
        console.error('❌ Failed to fetch analytics:', error)
        return null
      }

      return data || []
    } catch (error) {
      console.error('❌ Error fetching analytics:', error)
      return null
    }
  }

  // Get performance data
  async getPerformanceData(timeRange = '7d') {
    try {
      const dateFrom = this.getDateFromTimeRange(timeRange)
      
      const { data, error } = await supabase
        .from('v_performance_monitoring')
        .select('*')
        .gte('date', dateFrom)
        .order('date', { ascending: false })

      if (error) {
        console.error('❌ Failed to fetch performance data:', error)
        return null
      }

      return data || []
    } catch (error) {
      console.error('❌ Error fetching performance data:', error)
      return null
    }
  }

  // Get user usage data
  async getUserUsageData(timeRange = '7d') {
    try {
      const dateFrom = this.getDateFromTimeRange(timeRange)
      
      const { data, error } = await supabase
        .from('v_user_usage')
        .select('*')
        .gte('date', dateFrom)
        .order('date', { ascending: false })

      if (error) {
        console.error('❌ Failed to fetch user usage data:', error)
        return null
      }

      return data || []
    } catch (error) {
      console.error('❌ Error fetching user usage data:', error)
      return null
    }
  }

  // Get error analysis data
  async getErrorAnalysisData(timeRange = '7d') {
    try {
      const dateFrom = this.getDateFromTimeRange(timeRange)
      
      const { data, error } = await supabase
        .from('v_error_analysis')
        .select('*')
        .gte('date', dateFrom)
        .order('date', { ascending: false })

      if (error) {
        console.error('❌ Failed to fetch error analysis:', error)
        return null
      }

      return data || []
    } catch (error) {
      console.error('❌ Error fetching error analysis:', error)
      return null
    }
  }

  // Helper function to get date from time range
  getDateFromTimeRange(timeRange) {
    const now = new Date()
    switch (timeRange) {
      case '1d':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString()
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString()
      default:
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  }

  // Initialize the logging service
  async initialize() {
    if (this.isInitialized) return
    
    console.log('🔄 Initializing System Logging Service...')
    
    try {
      // Test database connection
      const { data, error } = await supabase
        .from('system_logs')
        .select('id')
        .limit(1)

      if (error) {
        console.error('❌ System logs table not accessible:', error)
        toast.error('System logs table not accessible')
        return false
      }

      this.isInitialized = true
      console.log('✅ System Logging Service initialized successfully')
      
      // Log service initialization
      await this.logSystemEvent('System Logging Service initialized', 'INFO', {
        service_version: '1.0.0',
        initialization_time: new Date().toISOString()
      })

      return true
      
    } catch (error) {
      console.error('❌ Failed to initialize System Logging Service:', error)
      toast.error('Failed to initialize logging service')
      return false
    }
  }
}

// Create singleton instance
const systemLoggingService = new SystemLoggingService()

// Export the service
export default systemLoggingService

// Export convenience functions
export const {
  logWorkflowStart,
  logAICall,
  logNodeProcessing,
  logWorkflowComplete,
  logUserAction,
  logSystemEvent,
  getLogs,
  getAnalyticsData,
  getPerformanceData,
  getUserUsageData,
  getErrorAnalysisData,
  initialize
} = systemLoggingService
