// Script to check saved flows and their node configurations
import { flowPersistenceService } from './src/services/flowPersistenceService.js'

async function checkFlows() {
  try {
    console.log('🔍 Checking saved flows in database...')
    
    const flows = await flowPersistenceService.getAllFlows()
    
    if (!flows || flows.length === 0) {
      console.log('❌ No flows found in database')
      return
    }
    
    console.log(`📊 Found ${flows.length} flows in database`)
    
    // Check first 4 flows
    const flowsToCheck = flows.slice(0, 4)
    
    flowsToCheck.forEach((flow, index) => {
      console.log(`\n📋 FLOW ${index + 1}: ${flow.name}`)
      console.log(`   ID: ${flow.id}`)
      console.log(`   Type: ${flow.type}`)
      console.log(`   Description: ${flow.description || 'No description'}`)
      
      // Check nodes configuration
      if (flow.nodes && Array.isArray(flow.nodes)) {
        console.log(`   Nodes: ${flow.nodes.length}`)
        
        flow.nodes.forEach((node, nodeIndex) => {
          console.log(`     Node ${nodeIndex + 1}: ${node.data?.label || node.id}`)
          console.log(`       Type: ${node.type}`)
          console.log(`       Role: ${node.data?.role || 'No role'}`)
          
          // Check if node has proper configuration
          const hasSystemPrompt = node.data?.systemPrompt && node.data.systemPrompt.length > 50
          const hasUserPrompt = node.data?.userPrompt && node.data.userPrompt.length > 50
          const hasInstructions = node.data?.inputInstructions && node.data.inputInstructions.length > 50
          
          console.log(`       System Prompt: ${hasSystemPrompt ? '✅ Good' : '❌ Missing/Weak'}`)
          console.log(`       User Prompt: ${hasUserPrompt ? '✅ Good' : '❌ Missing/Weak'}`)
          console.log(`       Instructions: ${hasInstructions ? '✅ Good' : '❌ Missing/Weak'}`)
          
          // Check AI configuration
          const hasAI = node.data?.aiEnabled
          const hasModels = node.data?.selectedModels && node.data.selectedModels.length > 0
          console.log(`       AI Enabled: ${hasAI ? '✅ Yes' : '❌ No'}`)
          console.log(`       Models: ${hasModels ? '✅ Yes' : '❌ No'}`)
        })
      } else {
        console.log(`   Nodes: ❌ No nodes or invalid format`)
      }
      
      // Check edges
      if (flow.edges && Array.isArray(flow.edges)) {
        console.log(`   Edges: ${flow.edges.length}`)
      } else {
        console.log(`   Edges: ❌ No edges or invalid format`)
      }
      
      // Check configurations
      if (flow.configurations && Object.keys(flow.configurations).length > 0) {
        console.log(`   Configurations: ✅ Present`)
      } else {
        console.log(`   Configurations: ❌ Missing`)
      }
    })
    
  } catch (error) {
    console.error('❌ Error checking flows:', error)
  }
}

// Run the check
checkFlows()
