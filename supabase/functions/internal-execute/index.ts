// Internal Workflow Execution Function
// Called ONLY by engines-api Edge Function
// NOT exposed to external clients

import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from 'jsr:@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Response helper
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
        'Content-Type': 'application/json'
      }
    }
  )
}

// Validate internal auth
const validateInternalAuth = (req: Request): boolean => {
  const authHeader = req.headers.get('X-Internal-Auth')
  const expectedSecret = Deno.env.get('INTERNAL_API_SECRET') || 'dev-secret'
  
  return authHeader === expectedSecret
}

// Main handler
Deno.serve(async (req: Request) => {
  try {
    // Validate internal auth
    if (!validateInternalAuth(req)) {
      return createResponse(403, null, 'Unauthorized - internal access only')
    }
    
    const requestBody = await req.json()
    const { 
      engineId, 
      userId, 
      userInput, 
      nodes, 
      edges,
      models,
      executionId 
    } = requestBody

    // Validate required fields
    if (!engineId || !userId || !userInput || !nodes || !edges) {
      return createResponse(400, null, 'Missing required fields')
    }

    console.log('🔧 Internal execution:', {
      executionId,
      userId,
      nodeCount: nodes?.length || 0,
      edgeCount: edges?.length || 0
    })

    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, tier, full_name')
      .eq('id', userId)
      .single()

    if (userError || !userData) {
      return createResponse(404, null, 'User not found')
    }

    // Update execution status to running
    if (executionId) {
      await supabase
        .from('engine_executions')
        .update({ 
          status: 'running',
          execution_data: {
            ...requestBody,
            started_at: new Date().toISOString()
          }
        })
        .eq('id', executionId)
    }

    // Execute workflow logic here
    // For now, validate nodes and return structure
    const result = await executeWorkflowNodes(nodes, edges, userInput, userData)

    console.log('✅ Workflow execution completed')

    return createResponse(200, {
      executionId,
      status: 'completed',
      result: result,
      metadata: {
        nodeCount: nodes.length,
        edgeCount: edges.length,
        completedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Internal execution error:', error)
    return createResponse(500, null, error.message)
  }
})

// Workflow execution logic
async function executeWorkflowNodes(nodes: any[], edges: any[], userInput: any, userData: any) {
  // Find input node
  const inputNode = nodes.find(n => n.type === 'input' || n.data?.type === 'input')
  if (!inputNode) {
    throw new Error('No input node found in workflow')
  }

  // Build execution graph
  const nodeMap = new Map()
  nodes.forEach(node => nodeMap.set(node.id, node))

  const edgeMap = new Map()
  edges.forEach(edge => {
    if (!edgeMap.has(edge.source)) {
      edgeMap.set(edge.source, [])
    }
    edgeMap.get(edge.source).push(edge)
  })

  // Execute nodes in order
  const executionResults = new Map()
  const processedNodes = new Set()
  
  // Start with input node
  executionResults.set(inputNode.id, {
    nodeId: inputNode.id,
    type: 'input',
    output: userInput,
    status: 'completed'
  })
  processedNodes.add(inputNode.id)

  // Process remaining nodes
  const queue = [inputNode.id]
  
  while (queue.length > 0) {
    const currentNodeId = queue.shift()!
    const outgoingEdges = edgeMap.get(currentNodeId) || []
    
    for (const edge of outgoingEdges) {
      const targetNode = nodeMap.get(edge.target)
      if (!targetNode || processedNodes.has(targetNode.id)) continue
      
      // Check if all incoming edges are processed
      const incomingEdges = edges.filter(e => e.target === targetNode.id)
      const allIncomingProcessed = incomingEdges.every(e => processedNodes.has(e.source))
      
      if (!allIncomingProcessed) continue
      
      // Execute node
      try {
        const nodeResult = await executeNode(targetNode, executionResults, userInput, userData)
        executionResults.set(targetNode.id, nodeResult)
        processedNodes.add(targetNode.id)
        queue.push(targetNode.id)
      } catch (error) {
        console.error(`Node ${targetNode.id} execution failed:`, error)
        executionResults.set(targetNode.id, {
          nodeId: targetNode.id,
          type: targetNode.type || targetNode.data?.type,
          status: 'failed',
          error: error.message
        })
      }
    }
  }

  // Find output node
  const outputNode = nodes.find(n => n.type === 'output' || n.data?.type === 'output')
  const outputResult = outputNode ? executionResults.get(outputNode.id) : null

  return {
    output: outputResult?.output || 'Execution completed',
    results: Array.from(executionResults.values()),
    processedNodeCount: processedNodes.size,
    totalNodeCount: nodes.length
  }
}

// Execute individual node
async function executeNode(node: any, executionResults: Map<string, any>, userInput: any, userData: any) {
  const nodeType = node.type || node.data?.type
  const nodeData = node.data || {}

  console.log(`Executing node ${node.id} (${nodeType})`)

  // For now, return placeholder results
  // TODO: Integrate full AI generation logic
  return {
    nodeId: node.id,
    type: nodeType,
    output: `${nodeType} node executed`,
    status: 'completed',
    metadata: {
      executedAt: new Date().toISOString()
    }
  }
}

