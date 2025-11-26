/**
 * Lekhika Execution Worker - Node.js Microservice
 * Handles real workflow execution with AI generation
 * Called internally by Supabase Edge Functions
 */

import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' }))

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

// Validate internal auth
const validateInternalAuth = (req, res, next) => {
  const authHeader = req.headers['x-internal-auth']
  const expectedSecret = process.env.INTERNAL_API_SECRET
  
  if (!expectedSecret) {
    return res.status(500).json({
      success: false,
      error: 'Internal auth not configured'
    })
  }
  
  if (authHeader !== expectedSecret) {
    return res.status(403).json({
      success: false,
      error: 'Unauthorized - invalid internal auth'
    })
  }
  
  next()
}

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'lekhika-execution-worker',
    version: '1.0.0'
  })
})

// Execute workflow endpoint
app.post('/execute', validateInternalAuth, async (req, res) => {
  try {
    const { 
      executionId, 
      engineId, 
      userId, 
      userInput, 
      nodes, 
      edges,
      models 
    } = req.body

    // Validate required fields
    if (!executionId || !userId || !userInput || !nodes || !edges) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: executionId, userId, userInput, nodes, edges'
      })
    }

    console.log('🚀 Execution started:', {
      executionId,
      userId,
      nodeCount: nodes.length,
      edgeCount: edges.length
    })

    // Update execution status to running
    await supabase
      .from('engine_executions')
      .update({ 
        status: 'running',
        execution_data: {
          ...req.body,
          started_at: new Date().toISOString()
        }
      })
      .eq('id', executionId)

    // Get user data for execution context
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, tier, full_name, level_id')
      .eq('id', userId)
      .single()

    if (userError || !userData) {
      throw new Error('User not found')
    }

    // Dynamic import of workflowExecutionService from parent directory
    const workflowModule = await import('../src/services/workflowExecutionService.js')
    const workflowExecutionService = workflowModule.default || workflowModule.workflowExecutionService

    // Progress callback
    const progressCallback = async (update) => {
      console.log('📊 Progress:', update)
      
      try {
        await supabase
          .from('engine_executions')
          .update({
            execution_data: {
              progress: update.progress || 0,
              currentNode: update.currentNode || null,
              message: update.message || '',
              status: 'running'
            }
          })
          .eq('id', executionId)
      } catch (err) {
        console.error('Failed to update progress:', err)
      }
    }

    // Execute workflow with real AI
    const executionContext = {
      executionId,
      userId,
      userEngineId: engineId,
      masterEngineId: engineId,
      levelId: userData.level_id || null,
      nodes,
      edges,
      models,
      userInput,
      options: req.body.options || {}
    }

    const result = await workflowExecutionService.executeWorkflow(
      nodes,
      edges,
      userInput,
      executionId,
      progressCallback,
      {
        id: userData.id,
        email: userData.email,
        role: 'user',
        tier: userData.tier || 'hobby',
        full_name: userData.full_name
      },
      executionContext
    )

    console.log('✅ Execution completed:', executionId)

    // Update execution with result and token/cost data
    await supabase
      .from('engine_executions')
      .update({
        status: 'completed',
        execution_data: {
          ...req.body,
          result: result.results || result,
          output: result.output || null,
          completed_at: new Date().toISOString()
        },
        tokens_used: result.totalTokens || result.tokens || 0,
        cost_estimate: result.totalCost || result.cost || 0,
        execution_time_ms: Date.now() - new Date(req.body.created_at || Date.now()).getTime(),
        completed_at: new Date().toISOString()
      })
      .eq('id', executionId)

    res.json({
      success: true,
      data: {
        executionId,
        status: 'completed',
        result: result.results || result,
        output: result.output || null,
        metadata: {
          completedAt: new Date().toISOString(),
          nodeCount: nodes.length,
          userId: userData.id
        }
      }
    })

  } catch (error) {
    console.error('❌ Execution error:', error)

    // Update execution with error
    if (req.body.executionId) {
      try {
        await supabase
          .from('engine_executions')
          .update({
            status: 'failed',
            execution_data: {
              error_message: error.message,
              error_stack: error.stack,
              failed_at: new Date().toISOString()
            },
            tokens_used: error.tokensUsed || 0,
            cost_estimate: error.costEstimate || 0,
            execution_time_ms: Date.now() - new Date(req.body.created_at || Date.now()).getTime(),
            completed_at: new Date().toISOString()
          })
          .eq('id', req.body.executionId)
      } catch (updateError) {
        console.error('Failed to update error status:', updateError)
      }
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Workflow execution failed',
      details: error.stack
    })
  }
})

// Resume execution endpoint
app.post('/resume', validateInternalAuth, async (req, res) => {
  try {
    const { 
      executionId, 
      engineId, 
      userId, 
      nodes, 
      edges
    } = req.body
    
    if (!executionId || !nodes || !edges) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: executionId, nodes, edges'
      })
    }

    // Verify execution exists and is resumable
    const { data: execution, error: fetchError } = await supabase
      .from('engine_executions')
      .select('execution_data, status, user_id')
      .eq('id', executionId)
      .single()

    if (fetchError || !execution) {
      return res.status(404).json({
        success: false,
        error: 'Execution not found'
      })
    }

    if (execution.execution_data?.resumable !== true) {
      return res.status(400).json({
        success: false,
        error: 'This execution cannot be resumed (no checkpoint data)'
      })
    }

    // Verify user access
    if (execution.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized access to this execution'
      })
    }

    const workflowExecutionService = workflowModule.default || workflowModule.workflowExecutionService

    // Progress callback for resume
    const progressCallback = async (update) => {
      console.log('📊 Resume Progress:', update)
      
      try {
        await supabase
          .from('engine_executions')
          .update({
            execution_data: {
              progress: update.progress || 0,
              currentNode: update.currentNode || null,
              message: update.message || '',
              status: 'running',
              resumed: true
            }
          })
          .eq('id', executionId)
      } catch (err) {
        console.error('Failed to update resume progress:', err)
      }
    }

    // Resume execution
    const result = await workflowExecutionService.resumeExecution(
      executionId,
      nodes,
      edges,
      progressCallback
    )

    console.log('✅ Execution resumed:', executionId)

    // Update execution with result
    await supabase
      .from('engine_executions')
      .update({
        status: 'completed',
        execution_data: {
          ...execution.execution_data,
          result: result.results || result,
          output: result.output || null,
          completed_at: new Date().toISOString(),
          resumed: true
        },
        tokens_used: result.totalTokens || result.tokens || 0,
        cost_estimate: result.totalCost || result.cost || 0,
        completed_at: new Date().toISOString()
      })
      .eq('id', executionId)

    res.json({
      success: true,
      data: {
        executionId,
        status: 'completed',
        result: result.results || result,
        output: result.output || null,
        metadata: {
          completedAt: new Date().toISOString(),
          resumed: true
        }
      }
    })

  } catch (error) {
    console.error('❌ Resume error:', error)

    // Update execution with error
    if (req.body.executionId) {
      try {
        await supabase
          .from('engine_executions')
          .update({
            status: 'failed',
            execution_data: {
              error_message: error.message,
              error_stack: error.stack,
              failed_at: new Date().toISOString(),
              resumed: true
            },
            completed_at: new Date().toISOString()
          })
          .eq('id', req.body.executionId)
      } catch (updateError) {
        console.error('Failed to update resume error status:', updateError)
      }
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Resume execution failed',
      details: error.stack
    })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Lekhika Execution Worker running on port ${PORT}`)
  console.log(`📍 Health check: http://localhost:${PORT}/health`)
  console.log(`⚙️  Execute endpoint: POST http://localhost:${PORT}/execute`)
  console.log(`🔐 Internal auth: ${process.env.INTERNAL_API_SECRET ? 'Configured' : 'MISSING'}`)
  console.log(`🗄️  Supabase: ${process.env.SUPABASE_URL ? 'Connected' : 'NOT CONFIGURED'}`)
})

export default app

