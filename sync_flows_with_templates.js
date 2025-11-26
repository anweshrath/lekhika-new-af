// SYNC FLOWS WITH NODE TEMPLATES SCRIPT
// This script will populate all flows with proper node template configurations

import { nodeTemplateLoader } from './src/services/nodeTemplateLoader.js'

async function syncAllFlows() {
  try {
    console.log('🚀 Starting flow sync with node templates...')
    
    const syncedCount = await nodeTemplateLoader.syncAllFlowsWithTemplates()
    
    console.log(`✅ Sync completed! ${syncedCount} flows updated with proper node templates`)
    
    // Show template statistics
    const stats = nodeTemplateLoader.getTemplateStats()
    console.log('📊 Template Statistics:')
    console.log(`   Total templates: ${stats.total}`)
    Object.entries(stats.byType).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} templates`)
    })
    
  } catch (error) {
    console.error('❌ Sync failed:', error)
  }
}

// Run the sync
syncAllFlows()
