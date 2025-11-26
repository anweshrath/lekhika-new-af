// Migration script to move flows from filesystem to ai_flows table
import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config()
import { CUSTOMER_CONTENT_FLOWS } from './src/data/customerContentFlows.js'
import { CUSTOMER_CONTENT_FLOWS_PART2 } from './src/data/customerContentFlows2.js'
import { CUSTOMER_CONTENT_FLOWS_PART3 } from './src/data/customerContentFlows3.js'
import { CUSTOMER_CONTENT_FLOWS_PART4 } from './src/data/customerContentFlows4.js'
import { PROFESSIONAL_FLOWS } from './src/data/professionalFlows.js'
import { PROFESSIONAL_FLOWS_PART2 } from './src/data/professionalFlows2.js'
import { PROFESSIONAL_FLOWS_PART3 } from './src/data/professionalFlows3.js'

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// SuperAdmin user ID (from the dump)
const SUPERADMIN_USER_ID = '5950cad6-810b-4c5b-9d40-4485ea249770'

// Function to convert flow to ai_flows format
function convertFlowToDatabaseFormat(flowKey, flowData) {
  return {
    name: flowData.name,
    description: flowData.description || '',
    type: flowData.type || 'book_generation',
    steps: JSON.stringify(flowData.steps || {}),
    configurations: JSON.stringify(flowData.configurations || {}),
    parameters: JSON.stringify(flowData.parameters || {}),
    models: JSON.stringify(flowData.models || []),
    is_default: false,
    usage_count: 0,
    last_used: null,
    created_by: SUPERADMIN_USER_ID,
    nodes: JSON.stringify(flowData.nodes || []),
    edges: JSON.stringify(flowData.edges || []),
    metadata: JSON.stringify({
      hasAI: flowData.nodes?.some(node => node.data?.aiEnabled) || false,
      createdAt: new Date().toISOString(),
      nodeCount: flowData.nodes?.length || 0,
      hasConditions: flowData.nodes?.some(node => node.data?.conditions?.length > 0) || false,
      source: 'filesystem_migration',
      originalKey: flowKey
    })
  }
}

// Function to migrate flows
async function migrateFlows() {
  console.log('🚀 Starting flow migration to ai_flows table...')
  
  try {
    // Collect all flows from all files
    const allFlows = {
      ...CUSTOMER_CONTENT_FLOWS,
      ...CUSTOMER_CONTENT_FLOWS_PART2,
      ...CUSTOMER_CONTENT_FLOWS_PART3,
      ...CUSTOMER_CONTENT_FLOWS_PART4,
      ...PROFESSIONAL_FLOWS,
      ...PROFESSIONAL_FLOWS_PART2,
      ...PROFESSIONAL_FLOWS_PART3
    }
    
    console.log(`📊 Found ${Object.keys(allFlows).length} flows to migrate`)
    
    // Convert and insert flows
    const flowsToInsert = []
    
    for (const [flowKey, flowData] of Object.entries(allFlows)) {
      const dbFormat = convertFlowToDatabaseFormat(flowKey, flowData)
      flowsToInsert.push(dbFormat)
      console.log(`✅ Converted flow: ${flowData.name}`)
    }
    
    // Insert flows into database
    console.log('💾 Inserting flows into ai_flows table...')
    
    const { data, error } = await supabase
      .from('ai_flows')
      .insert(flowsToInsert)
      .select()
    
    if (error) {
      console.error('❌ Error inserting flows:', error)
      return
    }
    
    console.log(`🎉 Successfully migrated ${data.length} flows to ai_flows table!`)
    console.log('📋 Migrated flows:')
    data.forEach(flow => {
      console.log(`  - ${flow.name} (ID: ${flow.id})`)
    })
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
  }
}

// Run migration
migrateFlows()
