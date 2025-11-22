// Execution Processor - Processes queued workflow executions
// Triggered via cron or manually
// Picks up queued executions and processes them

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

Deno.serve(async (req: Request) => {
  try {
    console.log('🔄 Execution processor started')
    
    // Get all queued executions
    const { data: queuedExecutions, error: queueError } = await supabase
      .from('engine_executions')
      .select('*')
      .eq('status', 'queued')
      .order('created_at', { ascending: true })
      .limit(10)
    
    if (queueError) throw queueError
    
    if (!queuedExecutions || queuedExecutions.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No queued executions found',
          processed: 0
        }),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }
    
    console.log(`📋 Found ${queuedExecutions.length} queued executions`)
    
    const results = []
    
    // Process each execution
    for (const execution of queuedExecutions) {
      try {
        console.log(`⚙️ Processing execution: ${execution.id}`)
        
        // Update status to processing
        await supabase
          .from('engine_executions')
          .update({ 
            status: 'processing',
            execution_data: {
              ...execution.execution_data,
              processing_started_at: new Date().toISOString()
            }
          })
          .eq('id', execution.id)
        
        // Call Node.js execution worker service
        const workerUrl = Deno.env.get('EXECUTION_WORKER_URL')
        
        if (!workerUrl) {
          throw new Error('EXECUTION_WORKER_URL not configured')
        }
        
        const response = await fetch(`${workerUrl}/execute`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Internal-Auth': Deno.env.get('INTERNAL_API_SECRET') || 'dev-secret'
          },
          body: JSON.stringify({
            executionId: execution.id,
            engineId: execution.engine_id,
            userId: execution.user_id,
            userInput: execution.execution_data?.userInput || {},
            nodes: execution.execution_data?.nodes || [],
            edges: execution.execution_data?.edges || [],
            models: execution.execution_data?.models || []
          })
        })
        
        if (!response.ok) {
          throw new Error(`Internal execution failed: ${response.status}`)
        }
        
        const result = await response.json()
        
        // Update with result
        await supabase
          .from('engine_executions')
          .update({
            status: 'completed',
            execution_data: {
              ...execution.execution_data,
              result: result.data?.result || result,
              processing_completed_at: new Date().toISOString()
            },
            completed_at: new Date().toISOString()
          })
          .eq('id', execution.id)
        
        console.log(`✅ Execution completed: ${execution.id}`)
        results.push({ executionId: execution.id, status: 'completed' })
        
      } catch (error) {
        console.error(`❌ Execution failed: ${execution.id}`, error)
        
        // Update with error
        await supabase
          .from('engine_executions')
          .update({
            status: 'failed',
            execution_data: {
              ...execution.execution_data,
              error_message: error.message,
              processing_failed_at: new Date().toISOString()
            },
            completed_at: new Date().toISOString()
          })
          .eq('id', execution.id)
        
        results.push({ executionId: execution.id, status: 'failed', error: error.message })
      }
    }
    
    return new Response(
      JSON.stringify({ 
        message: 'Processing completed',
        processed: results.length,
        results
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    )
    
  } catch (error) {
    console.error('❌ Processor error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
})

