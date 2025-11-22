const exportService = require('../exportService')
const { getSupabase } = require('../supabase')

async function preRunTest(nodes, edges, initialInput, progressCallback = null) {
  console.log('🧪 Starting Pre-Run Test for workflow validation...')
  console.log('🧪 Test Parameters:', { 
    nodesCount: nodes?.length || 0, 
    edgesCount: edges?.length || 0, 
    hasInitialInput: !!initialInput 
  })
  
  const testResults = {
    overallStatus: 'passing',
    nodeTests: {},
    connectivityTests: {},
    exportTests: {},
    warnings: [],
    errors: []
  }

  try {
    console.log('🔍 Testing node configurations...')
    for (const node of nodes) {
      const nodeTest = await testNodeConfiguration(node, initialInput)
      testResults.nodeTests[node.id] = nodeTest
      
      if (nodeTest.status === 'error') {
        testResults.overallStatus = 'failing'
        testResults.errors.push(`Node ${node.id}: ${nodeTest.error}`)
      } else if (nodeTest.status === 'warning') {
        testResults.warnings.push(`Node ${node.id}: ${nodeTest.warning}`)
      }
      
      if (progressCallback) {
        progressCallback({
          status: 'testing',
          message: `Testing node: ${node.data?.label || node.id}`,
          progress: (Object.keys(testResults.nodeTests).length / nodes.length) * 25
        })
      }
    }

    console.log('🤖 Testing AI connectivity...')
    const connectivityTest = await testAIConnectivity(nodes)
    testResults.connectivityTests = connectivityTest
    
    if (connectivityTest.status === 'error') {
      testResults.overallStatus = 'failing'
      testResults.errors.push(`AI Connectivity: ${connectivityTest.error}`)
    }

    if (progressCallback) {
      progressCallback({
        status: 'testing',
        message: 'Testing AI connectivity...',
        progress: 50
      })
    }

    console.log('📄 Testing export services...')
    const exportTest = await testExportServices()
    testResults.exportTests = exportTest
    
    if (exportTest.status === 'error') {
      testResults.overallStatus = 'failing'
      testResults.errors.push(`Export Services: ${exportTest.error}`)
    }

    if (progressCallback) {
      progressCallback({
        status: 'testing',
        message: 'Testing export services...',
        progress: 75
      })
    }

    console.log('🔗 Validating workflow structure...')
    const structureTest = validateWorkflowStructure(nodes, edges)
    if (!structureTest.valid) {
      testResults.overallStatus = 'failing'
      testResults.errors.push(`Workflow Structure: ${structureTest.error}`)
    }

    if (progressCallback) {
      progressCallback({
        status: testResults.overallStatus === 'passing' ? 'success' : 'error',
        message: testResults.overallStatus === 'passing' 
          ? '✅ Pre-run test completed successfully!' 
          : '❌ Pre-run test failed - check errors',
        progress: 100,
        testResults
      })
    }

    console.log('🧪 Pre-Run Test Results:', testResults)
    return testResults

  } catch (error) {
    console.error('❌ Pre-Run Test Error:', error)
    testResults.overallStatus = 'failing'
    testResults.errors.push(`CRITICAL SYSTEM ERROR: ${error.message}`)
    testResults.errors.push(`Error Type: ${error.name}`)
    testResults.errors.push(`Stack Trace: ${error.stack}`)
    
    testResults.diagnostics = {
      nodesCount: nodes?.length || 0,
      edgesCount: edges?.length || 0,
      hasInitialInput: !!initialInput,
      inputType: typeof initialInput,
      errorTimestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Server-side',
      memoryUsage: typeof process !== 'undefined' ? process.memoryUsage() : 'N/A'
    }
    
    if (progressCallback) {
      progressCallback({
        status: 'error',
        message: `CRITICAL ERROR: ${error.message}`,
        progress: 100,
        testResults,
        errorDetails: {
          name: error.name,
          message: error.message,
          stack: error.stack,
          diagnostics: testResults.diagnostics
        }
      })
    }
    
    return testResults
  }
}

async function testNodeConfiguration(node, initialInput) {
  try {
    if (!node.data) {
      return { status: 'error', error: 'Missing node data' }
    }
    if (node.type === 'input') {
      if (!node.data.inputFields || !Array.isArray(node.data.inputFields)) {
        return { status: 'warning', warning: 'Input node missing inputFields' }
      }
      const requiredFields = node.data.inputFields.filter(field => field.required)
      if (requiredFields.length === 0) {
        return { status: 'warning', warning: 'No required fields defined' }
      }
    }
    if (node.type === 'process') {
      if (!node.data.role) {
        return { status: 'error', error: 'Process node missing role' }
      }
      if (!node.data.configuration) {
        return { status: 'warning', warning: 'Process node missing configuration' }
      }
      if (!node.data.configuration.systemPrompt || !node.data.configuration.userPrompt) {
        return { status: 'warning', warning: 'Process node missing prompts' }
      }
    }
    if (node.type === 'output') {
      if (!node.data.role) {
        return { status: 'error', error: 'Output node missing role' }
      }
    }
    if (node.type === 'preview') {
      if (!node.data.approvalRequired) {
        return { status: 'warning', warning: 'Preview node should have approvalRequired' }
      }
    }
    return { status: 'passing', message: 'Node configuration valid' }
  } catch (error) {
    return { status: 'error', error: error.message }
  }
}

async function testAIConnectivity(nodes) {
  try {
    const aiNodes = nodes.filter(node => 
      node.type === 'process' && 
      node.data?.aiEnabled && 
      node.data?.selectedModels?.length > 0
    )

    if (aiNodes.length === 0) {
      return { status: 'warning', warning: 'No AI-enabled nodes found' }
    }

    const providers = new Set()
    aiNodes.forEach(node => {
      node.data.selectedModels.forEach(model => {
        const provider = model.split('-')[0]?.toLowerCase()
        if (provider) providers.add(provider)
      })
    })

    const connectivityResults = {}
    for (const provider of providers) {
      try {
        const testResult = await testAIProvider(provider)
        connectivityResults[provider] = testResult
      } catch (error) {
        connectivityResults[provider] = { status: 'error', error: error.message }
      }
    }

    const hasErrors = Object.values(connectivityResults).some(result => result.status === 'error')
    return {
      status: hasErrors ? 'error' : 'passing',
      providers: connectivityResults,
      error: hasErrors ? 'Some AI providers failed connectivity test' : null
    }

  } catch (error) {
    return { status: 'error', error: error.message }
  }
}

async function testAIProvider(provider) {
  try {
    const { data: apiKeys, error } = await getSupabase()
      .from('ai_providers')
      .select('*')
      .eq('provider', provider)
      .eq('is_active', true)

    if (error) throw error

    if (!apiKeys || apiKeys.length === 0) {
      return { status: 'error', error: `No active API keys found for ${provider}` }
    }

    return { 
      status: 'passing', 
      message: `${provider} API keys available`,
      keyCount: apiKeys.length
    }

  } catch (error) {
    return { status: 'error', error: error.message }
  }
}

async function testExportServices() {
  try {
    const exportTests = {}
    try {
      if (typeof exportService.generatePDF === 'function') {
        exportTests.pdf = { status: 'passing', message: 'PDF export available' }
      } else {
        exportTests.pdf = { status: 'error', error: 'PDF export method not found' }
      }
    } catch (error) {
      exportTests.pdf = { status: 'error', error: error.message }
    }

    try {
      if (typeof exportService.generateDOCX === 'function') {
        exportTests.docx = { status: 'passing', message: 'DOCX export available' }
      } else {
        exportTests.docx = { status: 'error', error: 'DOCX export method not found' }
      }
    } catch (error) {
      exportTests.docx = { status: 'error', error: error.message }
    }

    try {
      if (typeof exportService.generateEPUB === 'function') {
        exportTests.epub = { status: 'passing', message: 'EPUB export available' }
      } else {
        exportTests.epub = { status: 'error', error: 'EPUB export method not found' }
      }
    } catch (error) {
      exportTests.epub = { status: 'error', error: error.message }
    }

    const hasErrors = Object.values(exportTests).some(test => test.status === 'error')
    return {
      status: hasErrors ? 'error' : 'passing',
      services: exportTests,
      error: hasErrors ? 'Some export services failed test' : null
    }

  } catch (error) {
    return { status: 'error', error: error.message }
  }
}

function validateWorkflowStructure(nodes, edges) {
  try {
    if (!nodes || nodes.length === 0) {
      return { valid: false, error: 'No nodes found' }
    }
    if (!edges || edges.length === 0) {
      return { valid: false, error: 'No edges found' }
    }
    const inputNodes = nodes.filter(node => node.type === 'input')
    if (inputNodes.length === 0) {
      return { valid: false, error: 'No input nodes found' }
    }
    const outputNodes = nodes.filter(node => node.type === 'output')
    if (outputNodes.length === 0) {
      return { valid: false, error: 'No output nodes found' }
    }
    const nodeIds = new Set(nodes.map(node => node.id))
    for (const edge of edges) {
      if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
        return { valid: false, error: `Edge references non-existent node: ${edge.source} -> ${edge.target}` }
      }
    }
    return { valid: true, message: 'Workflow structure is valid' }
  } catch (error) {
    return { valid: false, error: error.message }
  }
}

module.exports = {
  preRunTest,
  validateWorkflowStructure,
  testNodeConfiguration,
  testAIConnectivity,
  testExportServices
}

