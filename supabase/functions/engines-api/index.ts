// Lekhika Engines API - Supabase Edge Function
// Handles engine execution and management via API keys

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// API Response Helper
const createResponse = (statusCode: number, data: any, error: string | null = null) => {
  return new Response(
    JSON.stringify({
      success: statusCode >= 200 && statusCode < 300,
      data,
      error,
      timestamp: new Date().toISOString()
    }),
    {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key, apikey'
      }
    }
  )
}

// Extract API key from request
const extractAPIKey = (req: Request): string | null => {
  // Check X-API-Key header first (Lekhika API key)
  const apiKeyHeader = req.headers.get('X-API-Key')
  if (apiKeyHeader) {
    return apiKeyHeader
  }
  
  // Check Authorization header as backup (should be Lekhika API key, not Supabase anon key)
  const authHeader = req.headers.get('Authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  return null
}

// Validate API key and get user data
const validateRequest = async (req: Request) => {
  const apiKey = extractAPIKey(req)
  
  if (!apiKey) {
    throw new Error('API key required')
  }
  
  if (!apiKey.startsWith('LEKH-2-')) {
    throw new Error('Invalid API key format')
  }
  
  // Get API key data from user_engines table
  console.log('🔍 Validating API key:', apiKey)
  
  const { data: keyData, error } = await supabase
    .from('user_engines')
    .select('user_id, engine_id, api_key, status')
    .eq('api_key', apiKey)
    .eq('status', 'active')
  
  console.log('🔍 API key query result:', { data: keyData, error, count: keyData?.length })
  
  if (error) {
    console.error('❌ API key query error:', error)
    throw new Error(`API key validation failed: ${error.message}`)
  }
  
  if (!keyData || keyData.length === 0) {
    console.error('❌ No matching API key found')
    throw new Error('Invalid or inactive API key')
  }
  
  if (keyData.length > 1) {
    console.error('❌ Multiple API keys found - data integrity issue')
    throw new Error('Duplicate API keys detected')
  }
  
  const key = keyData[0]
  console.log('✅ API key validated for user:', key.user_id)
  
  // Get user data with level information
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('id, email, level_id, tier')
    .eq('id', key.user_id)
  
  console.log('🔍 User query result:', { data: userData, error: userError, count: userData?.length })
  
  if (userError) {
    console.error('❌ User query error:', userError)
    throw new Error(`User lookup failed: ${userError.message}`)
  }
  
  if (!userData || userData.length === 0) {
    console.error('❌ No user found with ID:', key.user_id)
    throw new Error('User not found')
  }
  
  if (userData.length > 1) {
    console.error('❌ Multiple users found with same ID - database corruption')
    throw new Error('Database integrity error')
  }
  
  const user = userData[0]
  console.log('✅ User validated:', { id: user.id, email: user.email, tier: user.tier })
  
  return {
    user_id: key.user_id,
    engine_id: key.engine_id,
    api_key: key.api_key,
    status: key.status,
    users: user
  }
}

/**
 * GET /engines-api/list
 * List user's available engines
 */
const listEngines = async (req: Request) => {
  try {
    const keyData = await validateRequest(req)
    
    // Get user's engine copies
    const { data: userEngines, error: userEnginesError } = await supabase
      .from('user_engines')
      .select(`
        id,
        name,
        description,
        config,
        models,
        status,
        api_key,
        created_at
      `)
      .eq('user_id', keyData.user_id)
      .eq('status', 'active')

    if (userEnginesError) throw userEnginesError

    const engines = userEngines || []
    
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
 * GET /engines-api/{engineId}
 * Get specific engine details
 */
const getEngine = async (req: Request, engineId: string) => {
  try {
    const keyData = await validateRequest(req)
    
    if (!engineId) {
      throw new Error('Engine ID required')
    }
    
    // Get user's engine copy
    const { data: userEngines, error: userEngineError } = await supabase
      .from('user_engines')
      .select(`
        id,
        name,
        description,
        config,
        models,
        status,
        api_key,
        created_at
      `)
      .eq('id', engineId)
      .eq('user_id', keyData.user_id)
      .eq('status', 'active')

    if (userEngineError) throw userEngineError

    if (!userEngines || userEngines.length === 0) {
      throw new Error('Engine not found or access denied')
    }
    
    const engine = userEngines[0]
    
    return createResponse(200, { engine })
    
  } catch (error) {
    console.error('Get engine error:', error)
    return createResponse(404, null, error.message)
  }
}

/**
 * POST /engines-api/{engineId}/execute
 * Execute engine with user input
 */
const executeEngine = async (req: Request, engineId: string) => {
  try {
    const keyData = await validateRequest(req)
    
    if (!engineId) {
      throw new Error('Engine ID required')
    }
    
    const requestBody = await req.json()
    const { userInput, options = {} } = requestBody
    
    if (!userInput) {
      throw new Error('userInput data required')
    }
    
    // Get user's engine copy with workflow data
    const { data: userEngines, error: userEngineError } = await supabase
      .from('user_engines')
      .select('*')
      .eq('id', engineId)
      .eq('user_id', keyData.user_id)
      .eq('status', 'active')
    
    if (userEngineError) {
      console.error('❌ Engine query error:', userEngineError)
      throw userEngineError
    }
    
    if (!userEngines || userEngines.length === 0) {
      throw new Error('Engine not found or access denied')
    }
    
    const userEngine = userEngines[0]
    
    // Validate engine has nodes and edges
    if (!userEngine.nodes || !userEngine.edges) {
      throw new Error('Engine configuration incomplete - missing nodes or edges')
    }
    
    // Create execution record with running status (pending not allowed by constraint)
    // Let database generate UUID for id
    // IMPORTANT: Use userEngine.engine_id (master engine ID) for foreign key, not the URL engineId (user copy ID)
    const { data: executionRecords, error: execError } = await supabase
      .from('engine_executions')
      .insert([{
        engine_id: userEngine.engine_id,
        user_id: keyData.user_id,
        status: 'running',
        execution_data: {
          userInput,
          options,
          api_key: extractAPIKey(req),
          nodes: userEngine.nodes,
          edges: userEngine.edges,
          models: userEngine.models,
          created_at: new Date().toISOString()
        }
      }])
      .select()
    
    if (execError) {
      console.error('❌ Failed to create execution record:', execError)
      throw execError
    }
    
    if (!executionRecords || executionRecords.length === 0) {
      throw new Error('Failed to create execution record')
    }
    
    const executionRecord = executionRecords[0]
    const executionId = executionRecord.id
    
    console.log('✅ Execution created:', executionId)
    
    // Call worker to process execution (don't wait for response)
    const workerUrl = Deno.env.get('EXECUTION_WORKER_URL') || 'http://localhost:3001'
    const internalSecret = Deno.env.get('INTERNAL_API_SECRET') || 'dev-secret-key'
    
    console.log('📞 Calling worker:', workerUrl)
    
    // Fire and forget - don't wait for worker response
    fetch(`${workerUrl}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Auth': internalSecret
      },
      body: JSON.stringify({
        executionId,
        lekhikaApiKey: extractAPIKey(req),
        userEngineId: engineId, // User engine copy ID from URL
        masterEngineId: userEngine.engine_id, // Master engine ID
        userId: keyData.user_id,
        workflow: {
          nodes: userEngine.nodes,
          edges: userEngine.edges,
          models: userEngine.models
        },
        inputs: userInput, // Dynamic user input - whatever fields they fill
        options: options // Dynamic options - whatever AI parameters are configured
      })
    }).catch(error => {
      console.error('❌ Worker call failed (non-blocking):', error)
      // Don't throw - execution is queued, worker will retry
    })
    
    // Return execution ID immediately
    // Execution will be processed asynchronously
    return createResponse(202, {
      executionId,
      status: 'running',
      message: 'Execution started successfully',
      statusUrl: `/engines-api/executions/${executionId}`,
      metadata: {
        engineId: userEngine.engine_id, // Master engine ID
        userEngineId: engineId, // User copy ID
        engineName: userEngine.name,
        userId: keyData.user_id,
        queuedAt: new Date().toISOString(),
        estimatedTime: '30-120 seconds'
      }
    })
    
  } catch (error) {
    console.error('Execute engine error:', error)
    
    return createResponse(500, null, error.message)
  }
}

/**
 * GET /engines-api/executions/{executionId}
 * Get specific execution status and result
 */
const getExecutionStatus = async (req: Request, executionId: string) => {
  try {
    const keyData = await validateRequest(req)
    
    const { data: execution, error } = await supabase
      .from('engine_executions')
      .select('*')
      .eq('id', executionId)
      .eq('user_id', keyData.user_id)
      .single()
    
    if (error || !execution) {
      return createResponse(404, null, 'Execution not found')
    }
    
    return createResponse(200, {
      executionId: execution.id,
      status: execution.status,
      executionData: execution.execution_data || {},
      result: execution.execution_data?.result || null,
      createdAt: execution.created_at,
      completedAt: execution.completed_at,
      metadata: {
        engineId: execution.engine_id,
        progress: execution.execution_data?.progress || null,
        error: execution.execution_data?.error || execution.error_message || null,
        tokens: execution.execution_data?.tokens || execution.tokens_used || null,
        words: execution.execution_data?.words || null,
        lastValidationError: execution.execution_data?.lastValidationError || null
      }
    })
    
  } catch (error) {
    console.error('Get execution status error:', error)
    return createResponse(500, null, error.message)
  }
}

/**
 * GET /engines-api/executions
 * Get user's execution history
 */
const getExecutions = async (req: Request) => {
  try {
    const keyData = await validateRequest(req)
    
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
 * GET /engines-api/stats
 * Get user's engine usage statistics
 */
const getStats = async (req: Request) => {
  try {
    const keyData = await validateRequest(req)
    
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
      user: {
        id: keyData.user_id,
        email: keyData.users?.email,
        tier: keyData.users?.tier
      }
    })
    
  } catch (error) {
    console.error('Get stats error:', error)
    return createResponse(500, null, error.message)
  }
}

/**
 * POST /engines-api/stop/:executionId
 * Stop a running execution
 */
const stopExecution = async (req: Request, executionId: string) => {
  try {
    const keyData = await validateRequest(req) // Validate API key
    
    // Forward stop request to VPS worker
    const workerUrl = `${Deno.env.get('VPS_WORKER_URL')}/stop/${executionId}`
    const workerResponse = await fetch(workerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Lekhika-API-Key': keyData.api_key // Pass Lekhika API key for worker validation
      }
    })
    
    if (!workerResponse.ok) {
      const errorData = await workerResponse.json()
      throw new Error(`Worker failed to stop execution: ${errorData.error}`)
    }
    
    const workerResult = await workerResponse.json()
    
    // Update execution status in Supabase
    const { error: updateError } = await supabase
      .from('engine_executions')
      .update({ status: 'cancelled' })
      .eq('id', executionId)
      .eq('user_id', keyData.user_id)
    
    if (updateError) {
      console.error('Supabase update error on stop:', updateError)
      // Still return worker success if worker stopped, but log DB error
    }
    
    return createResponse(200, workerResult, null)
    
  } catch (error) {
    console.error('Stop execution error:', error)
    return createResponse(500, null, error.message)
  }
}

/**
 * POST /engines-api/:engineId/resume
 * Resume a failed execution from checkpoint
 */
const resumeExecution = async (req: Request, engineId: string) => {
  try {
    const keyData = await validateRequest(req) // Validate API key
    const requestBody = await req.json()
    
    const { 
      executionId, 
      userEngineId, 
      userId, 
      nodes, 
      edges 
    } = requestBody
    
    if (!executionId || !nodes || !edges) {
      return createResponse(400, null, 'Missing required fields: executionId, nodes, edges')
    }
    
    // Forward resume request to VPS worker
    const workerUrl = `${Deno.env.get('VPS_WORKER_URL')}/resume`
    const workerResponse = await fetch(workerUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Lekhika-API-Key': keyData.api_key // Pass Lekhika API key for worker validation
      },
      body: JSON.stringify({
        executionId,
        lekhikaApiKey: keyData.api_key,
        userEngineId: userEngineId || engineId,
        masterEngineId: engineId,
        userId: userId || keyData.user_id,
        workflow: { nodes, edges },
        inputs: {},
        options: {}
      })
    })
    
    if (!workerResponse.ok) {
      const errorData = await workerResponse.json()
      throw new Error(`Worker failed to resume execution: ${errorData.error}`)
    }
    
    const workerResult = await workerResponse.json()
    
    return createResponse(200, workerResult, null)
    
  } catch (error) {
    console.error('Resume execution error:', error)
    return createResponse(500, null, error.message)
  }
}

// Handle CORS preflight
const handleOptions = () => {
  return createResponse(200, { message: 'CORS preflight' })
}

// Main Edge Function handler
Deno.serve(async (req: Request) => {
  const url = new URL(req.url)
  const path = url.pathname
  const method = req.method
  
  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return handleOptions()
  }
  
  try {
    // Route requests
    if (path === '/engines-api/list' && method === 'GET') {
      return await listEngines(req)
    }
    
    if (path.match(/^\/engines-api\/[^\/]+$/) && method === 'GET') {
      const engineId = path.split('/')[2]
      return await getEngine(req, engineId)
    }
    
    if (path.match(/^\/engines-api\/[^\/]+\/execute$/) && method === 'POST') {
      const engineId = path.split('/')[2]
      return await executeEngine(req, engineId)
    }
    
    if (path.match(/^\/engines-api\/executions\/[^\/]+$/) && method === 'GET') {
      const executionId = path.split('/')[3]
      return await getExecutionStatus(req, executionId)
    }
    
    if (path === '/engines-api/executions' && method === 'GET') {
      return await getExecutions(req)
    }
    
    if (path === '/engines-api/stats' && method === 'GET') {
      return await getStats(req)
    }
    
    if (path.match(/^\/engines-api\/stop\/[^\/]+$/) && method === 'POST') {
      const executionId = path.split('/')[3]
      return await stopExecution(req, executionId)
    }
    
    if (path.match(/^\/engines-api\/[^\/]+\/resume$/) && method === 'POST') {
      const engineId = path.split('/')[2]
      return await resumeExecution(req, engineId)
    }
    
    return createResponse(404, null, 'Endpoint not found')
    
  } catch (error) {
    console.error('API handler error:', error)
    return createResponse(500, null, 'Internal server error')
  }
})