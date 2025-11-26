/**
 * Engine API Endpoints
 * Handles engine execution and management via API keys
 */

import { apiKeyService } from '../services/apiKeyService'
import { workflowExecutionService } from '../services/workflowExecutionService'
import { supabase } from '../lib/supabase'

// API Response Helper
const createResponse = (statusCode, data, error = null) => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key'
    },
    body: JSON.stringify({
      success: statusCode >= 200 && statusCode < 300,
      data,
      error,
      timestamp: new Date().toISOString()
    })
  }
}

// Extract API key from request
const extractAPIKey = (event) => {
  const authHeader = event.headers?.authorization || event.headers?.Authorization
  const apiKeyHeader = event.headers?.['x-api-key'] || event.headers?.['X-API-Key']
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  if (apiKeyHeader) {
    return apiKeyHeader
  }
  
  return null
}

// Validate API key and get user/engine info
const validateRequest = async (event) => {
  const apiKey = extractAPIKey(event)
  
  if (!apiKey) {
    throw new Error('API key required. Provide via Authorization header or X-API-Key header')
  }
  
  const keyData = await apiKeyService.validateAPIKey(apiKey)
  
  if (!keyData.users?.is_active) {
    throw new Error('User account is inactive')
  }
  
  if (!keyData.ai_engines?.active) {
    throw new Error('Engine is inactive')
  }
  
  return keyData
}

/**
 * GET /api/engines/list
 * List user's available engines
 */
export const listEngines = async (event) => {
  try {
    const keyData = await validateRequest(event)
    
    // Get engines assigned to this user
    const { data: assignments, error: assignmentError } = await supabase
      .from('engine_assignments')
      .select(`
        ai_engines (
          id,
          name,
          description,
          flow_config,
          models,
          active,
          created_at
        )
      `)
      .eq('user_id', keyData.user_id)
      .eq('active', true)
      .eq('assignment_type', 'user')

    if (assignmentError) throw assignmentError

    const engines = assignments?.map(a => a.ai_engines).filter(Boolean) || []
    
    return createResponse(200, {
      engines: engines || [],
      total: engines?.length || 0
    })
    
  } catch (error) {
    console.error('List engines error:', error)
    return createResponse(401, null, error.message)
  }
}

/**
 * GET /api/engines/{engineId}
 * Get specific engine details
 */
export const getEngine = async (event) => {
  try {
    const keyData = await validateRequest(event)
    const engineId = event.pathParameters?.engineId
    
    if (!engineId) {
      throw new Error('Engine ID required')
    }
    
    // Check if engine is assigned to user
    const { data: assignment, error: assignmentError } = await supabase
      .from('engine_assignments')
      .select(`
        ai_engines (
          id,
          name,
          description,
          flow_config,
          models,
          active,
          created_at
        )
      `)
      .eq('engine_id', engineId)
      .eq('user_id', keyData.user_id)
      .eq('active', true)
      .eq('assignment_type', 'user')
      .single()

    if (assignmentError) throw assignmentError

    const engine = assignment?.ai_engines
    
    if (!engine) {
      throw new Error('Engine not found or access denied')
    }
    
    return createResponse(200, { engine })
    
  } catch (error) {
    console.error('Get engine error:', error)
    return createResponse(404, null, error.message)
  }
}

/**
 * POST /api/engines/{engineId}/execute
 * Execute engine with user input
 */
export const executeEngine = async (event) => {
  try {
    const keyData = await validateRequest(event)
    const engineId = event.pathParameters?.engineId
    
    if (!engineId) {
      throw new Error('Engine ID required')
    }
    
    const requestBody = JSON.parse(event.body || '{}')
    const { input, options = {} } = requestBody
    
    if (!input) {
      throw new Error('Input data required')
    }
    
    // Get engine details
    const { data: engine, error: engineError } = await supabase
      .from('ai_engines')
      .select('*')
      .eq('id', engineId)
      .eq('active', true)
      .single()
    
    if (engineError) throw engineError
    
    if (!engine) {
      throw new Error('Engine not found or access denied')
    }
    
    // Create execution record
    const executionId = `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const { data: executionRecord, error: execError } = await supabase
      .from('engine_executions')
      .insert([{
        id: executionId,
        engine_id: engineId,
        user_id: keyData.user_id,
        status: 'running',
        execution_data: {
          input,
          options,
          api_key: keyData.api_key
        }
      }])
      .select()
      .single()
    
    if (execError) throw execError
    
    // Execute workflow
    const progressCallback = (update) => {
      console.log('Execution progress:', update)
      // TODO: Send real-time updates via WebSocket or SSE
    }
    
    const executionContext = {
      executionId,
      userId: keyData.user_id,
      userEngineId: engineId,
      masterEngineId: engineId,
      levelId: input?.level_id || input?.levelId || null,
      nodes: engine.nodes || [],
      edges: engine.edges || [],
      models: engine.models || [],
      userInput: input,
      options
    }

    const result = await workflowExecutionService.executeWorkflow(
      engine.nodes || [],
      engine.edges || [],
      input,
      executionId,
      progressCallback,
      {
        id: keyData.user_id,
        role: 'user',
        tier: keyData.users.tier
      },
      executionContext
    )
    
    // Update execution record
    await supabase
      .from('engine_executions')
      .update({
        status: 'completed',
        execution_data: {
          ...executionRecord.execution_data,
          result: result.output
        },
        completed_at: new Date().toISOString()
      })
      .eq('id', executionId)
    
    // Update engine last used
    await supabase
      .from('ai_engines')
      .update({ last_used: new Date().toISOString() })
      .eq('id', engineId)
    
    return createResponse(200, {
      executionId,
      status: 'completed',
      result: result.results || result,
      metadata: {
        engineId,
        userId: keyData.user_id,
        executedAt: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('Execute engine error:', error)
    
    // Update execution record with error
    if (event.pathParameters?.engineId) {
      await supabase
        .from('engine_executions')
        .update({
          status: 'failed',
          execution_data: {
            error_message: error.message
          },
          completed_at: new Date().toISOString()
        })
        .eq('engine_id', event.pathParameters.engineId)
        .eq('status', 'running')
    }
    
    return createResponse(500, null, error.message)
  }
}

/**
 * GET /api/engines/executions
 * Get user's execution history
 */
export const getExecutions = async (event) => {
  try {
    const keyData = await validateRequest(event)
    
    const { data: executions, error } = await supabase
      .from('engine_executions')
      .select(`
        id,
        engine_id,
        status,
        execution_data,
        created_at,
        completed_at,
        ai_engines (name, description)
      `)
      .eq('user_id', keyData.user_id)
      .order('created_at', { ascending: false })
      .limit(50)
    
    if (error) throw error
    
    return createResponse(200, {
      executions: executions || [],
      total: executions?.length || 0
    })
    
  } catch (error) {
    console.error('Get executions error:', error)
    return createResponse(500, null, error.message)
  }
}

/**
 * GET /api/engines/stats
 * Get user's engine usage statistics
 */
export const getStats = async (event) => {
  try {
    const keyData = await validateRequest(event)
    
    // Get user's assigned engines
    const { data: assignments, error } = await supabase
      .from('engine_assignments')
      .select(`
        ai_engines (
          id,
          name,
          last_used,
          created_at
        )
      `)
      .eq('user_id', keyData.user_id)
      .eq('active', true)
    
    if (error) throw error
    
    const engines = assignments?.map(a => a.ai_engines).filter(Boolean) || []
    const totalEngines = engines.length
    const activeEngines = engines.filter(engine => engine.last_used).length
    
    const totalExecutions = await supabase
      .from('engine_executions')
      .select('id', { count: 'exact' })
      .eq('user_id', keyData.user_id)
    
    return createResponse(200, {
      totalEngines,
      activeEngines,
      totalExecutions: totalExecutions.count || 0,
      lastActivity: stats?.sort((a, b) => new Date(b.last_used || 0) - new Date(a.last_used || 0))[0]?.last_used || null
    })
    
  } catch (error) {
    console.error('Get stats error:', error)
    return createResponse(500, null, error.message)
  }
}

/**
 * OPTIONS handler for CORS
 */
export const options = async (event) => {
  return createResponse(200, { message: 'CORS preflight' })
}

// Main handler
export const handler = async (event) => {
  const { httpMethod, path } = event
  
  // Handle CORS preflight
  if (httpMethod === 'OPTIONS') {
    return await options(event)
  }
  
  try {
    // Route requests
    if (path === '/api/engines/list' && httpMethod === 'GET') {
      return await listEngines(event)
    }
    
    if (path.match(/^\/api\/engines\/[^\/]+$/) && httpMethod === 'GET') {
      return await getEngine(event)
    }
    
    if (path.match(/^\/api\/engines\/[^\/]+\/execute$/) && httpMethod === 'POST') {
      return await executeEngine(event)
    }
    
    if (path === '/api/engines/executions' && httpMethod === 'GET') {
      return await getExecutions(event)
    }
    
    if (path === '/api/engines/stats' && httpMethod === 'GET') {
      return await getStats(event)
    }
    
    return createResponse(404, null, 'Endpoint not found')
    
  } catch (error) {
    console.error('API handler error:', error)
    return createResponse(500, null, 'Internal server error')
  }
}
