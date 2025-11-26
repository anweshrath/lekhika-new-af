/**
 * Local Test Script for Execution Worker
 * Tests the /execute endpoint with sample data
 */

const testExecution = async () => {
  const workerUrl = 'http://localhost:3001'
  const internalSecret = process.env.INTERNAL_API_SECRET || 'dev-secret'

  console.log('🧪 Testing Execution Worker...')
  console.log('📍 URL:', workerUrl)
  console.log('🔐 Auth:', internalSecret ? 'Configured' : 'Using dev-secret')

  // Test 1: Health Check
  console.log('\n1️⃣ Testing health endpoint...')
  try {
    const healthResponse = await fetch(`${workerUrl}/health`)
    const healthData = await healthResponse.json()
    console.log('✅ Health check passed:', healthData)
  } catch (error) {
    console.error('❌ Health check failed:', error.message)
    return
  }

  // Test 2: Execute Workflow
  console.log('\n2️⃣ Testing execution endpoint...')
  
  const testData = {
    executionId: `test_${Date.now()}`,
    engineId: 'test-engine-id',
    userId: 'test-user-id',
    userInput: {
      story_title: 'Test Book',
      genre: 'fantasy',
      word_count: 1000,
      chapter_count: 1
    },
    nodes: [
      {
        id: 'input-1',
        type: 'input',
        data: { type: 'input' }
      },
      {
        id: 'writer-1',
        type: 'ai_writer',
        data: {
          type: 'ai_writer',
          systemPrompt: 'You are a professional writer',
          userPrompt: 'Write a short story',
          aiEnabled: true,
          selectedModels: ['openai:gpt-4o-mini']
        }
      },
      {
        id: 'output-1',
        type: 'output',
        data: { type: 'output' }
      }
    ],
    edges: [
      { id: 'e1', source: 'input-1', target: 'writer-1' },
      { id: 'e2', source: 'writer-1', target: 'output-1' }
    ],
    models: ['openai:gpt-4o-mini']
  }

  try {
    const response = await fetch(`${workerUrl}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Auth': internalSecret
      },
      body: JSON.stringify(testData)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    const result = await response.json()
    console.log('✅ Execution test passed:')
    console.log(JSON.stringify(result, null, 2))
  } catch (error) {
    console.error('❌ Execution test failed:', error.message)
  }
}

testExecution()

