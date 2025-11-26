import { supabase } from '../lib/supabase.js'
import { toast } from 'react-hot-toast'

// AUTO-SYNC SERVICE - AUTOMATICALLY SYNC FLOWS TO AI_FLOWS TABLE
// Ensures all flows (new and elite templates) are properly stored in Supabase

class FlowAutoSyncService {
  constructor() {
    this.isInitialized = false
    this.syncQueue = []
    this.syncInProgress = false
  }

  // Initialize the auto-sync service
  async initialize() {
    if (this.isInitialized) return
    
    console.log('🔄 Initializing Flow Auto-Sync Service...')
    
    try {
      // Sync all elite templates on initialization
      await this.syncEliteTemplates()
      
      // Set up auto-sync for new flows
      this.setupAutoSyncListeners()
      
      this.isInitialized = true
      console.log('✅ Flow Auto-Sync Service initialized successfully')
      
    } catch (error) {
      console.error('❌ Failed to initialize Flow Auto-Sync Service:', error)
      toast.error('Failed to initialize auto-sync service')
    }
  }

  // Sync all elite templates to ai_flows table
  async syncEliteTemplates() {
    console.log('🔄 Syncing elite templates to ai_flows...')
    
    try {
      // Import elite templates from new organized structure
      const { ELITE_TEMPLATES } = await import('../data/flows/index.js')
      
      let syncCount = 0
      
      // Sync All Elite Templates (unified structure)
      const eliteEntries = Object.entries(ELITE_TEMPLATES)
      for (const [key, template] of eliteEntries) {
        const success = await this.syncFlowToDatabase({
          id: template.id,
          name: template.name,
          description: template.description,
          category: template.category,
          complexity: template.complexity,
          configurations: template,
          flow_type: 'elite_template',
          is_elite: true,
          created_by: '5950cad6-810b-4c5b-9d40-4485ea249770'
        })
        
        if (success) syncCount++
      }
      
      console.log(`✅ Synced ${syncCount} elite templates to ai_flows`)
      toast.success(`Synced ${syncCount} elite templates to database`)
      
      return true
      
    } catch (error) {
      console.error('❌ Failed to sync elite templates:', error)
      toast.error('Failed to sync elite templates')
      return false
    }
  }

  // Sync a single flow to the database
  async syncFlowToDatabase(flowData) {
    try {
      // Process configurations to ensure proper node roles
      let processedConfigurations = flowData.configurations || {}
      
      // If configurations has nodes, ensure they have proper roles
      if (processedConfigurations.nodes) {
        processedConfigurations = this.ensureNodeRoles(processedConfigurations)
      }
      
      // Map to actual database schema
      const dbData = {
        id: flowData.id,
        name: flowData.name,
        description: flowData.description,
        type: flowData.type || 'expert', // Map flow_type to type
        steps: [], // Required field but not used for elite flows
        configurations: processedConfigurations,
        metadata: {
          category: flowData.category,
          complexity: flowData.complexity,
          flow_type: flowData.flow_type || 'custom_flow',
          is_elite: flowData.is_elite || false,
          ...flowData.metadata
        },
        is_default: false,
        created_by: flowData.created_by || '5950cad6-810b-4c5b-9d40-4485ea249770' // SuperAdmin user ID
      }
      
      const { error } = await supabase
        .from('ai_flows')
        .upsert(dbData)
      
      if (error) {
        console.error(`❌ Error syncing flow ${flowData.name}:`, error)
        return false
      }
      
      console.log(`✅ Synced flow: ${flowData.name}`)
      return true
      
    } catch (error) {
      console.error(`❌ Failed to sync flow ${flowData.name}:`, error)
      return false
    }
  }

  // Ensure all nodes have proper roles based on their labels
  ensureNodeRoles(configurations) {
    try {
      // Handle both stringified JSON and direct JSON
      let nodes = configurations.nodes
      
      // If nodes is a string, parse it
      if (typeof nodes === 'string') {
        nodes = JSON.parse(nodes)
      }
      
      // Process each node to ensure proper role
      const processedNodes = nodes.map(node => {
        // Skip if node already has a proper role
        if (node.data && node.data.role && !node.data.role.match(/^process-\d+$/)) {
          return node
        }
        
        // Map node type and label to proper role
        let role = node.data?.role || node.id
        
        if (node.type === 'input') {
          role = 'universal_input'
        } else if (node.type === 'output') {
          role = 'universal_output'
        } else if (node.type === 'process') {
          const label = node.data?.label || ''
          
          if (label.toLowerCase().includes('world') || 
              label.toLowerCase().includes('character') ||
              label.toLowerCase().includes('setting') ||
              label.toLowerCase().includes('environment')) {
            role = 'world_builder'
          } else if (label.toLowerCase().includes('plot') || 
                     label.toLowerCase().includes('story') ||
                     label.toLowerCase().includes('structure') ||
                     label.toLowerCase().includes('outline')) {
            role = 'plot_architect'
          } else if (label.toLowerCase().includes('literary') || 
                     label.toLowerCase().includes('narrative') ||
                     label.toLowerCase().includes('writing') ||
                     label.toLowerCase().includes('chapter') ||
                     label.toLowerCase().includes('content')) {
            role = 'content_writer'
          } else if (label.toLowerCase().includes('proofread') || 
                     label.toLowerCase().includes('edit') ||
                     label.toLowerCase().includes('review') ||
                     label.toLowerCase().includes('polish')) {
            role = 'proofreader'
          } else {
            role = 'content_writer' // Default for unknown process nodes
          }
        }
        
        // Update node with proper role
        return {
          ...node,
          data: {
            ...node.data,
            role: role
          }
        }
      })
      
      // Return updated configurations
      return {
        ...configurations,
        nodes: typeof configurations.nodes === 'string' 
          ? JSON.stringify(processedNodes)
          : processedNodes
      }
      
    } catch (error) {
      console.error('❌ Error ensuring node roles:', error)
      return configurations // Return original if processing fails
    }
  }

  // Auto-sync a new flow when created
  async autoSyncNewFlow(flowData) {
    console.log('🔄 Auto-syncing new flow to ai_flows...')
    
    try {
      // Generate unique ID if not provided
      if (!flowData.id) {
        flowData.id = `flow-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }
      
      // Set default values
      flowData.flow_type = flowData.flow_type || 'custom_flow'
      flowData.is_elite = flowData.is_elite || false
      flowData.created_at = new Date().toISOString()
      flowData.updated_at = new Date().toISOString()
      
      const success = await this.syncFlowToDatabase(flowData)
      
      if (success) {
        console.log('✅ New flow auto-synced successfully')
        toast.success('Flow saved to database')
      } else {
        console.log('❌ Failed to auto-sync new flow')
        toast.error('Failed to save flow to database')
      }
      
      return success
      
    } catch (error) {
      console.error('❌ Auto-sync error:', error)
      toast.error('Auto-sync failed')
      return false
    }
  }

  // Auto-sync when flow is updated
  async autoSyncUpdatedFlow(flowData) {
    console.log('🔄 Auto-syncing updated flow to ai_flows...')
    
    try {
      flowData.updated_at = new Date().toISOString()
      
      const success = await this.syncFlowToDatabase(flowData)
      
      if (success) {
        console.log('✅ Updated flow auto-synced successfully')
        toast.success('Flow updated in database')
      } else {
        console.log('❌ Failed to auto-sync updated flow')
        toast.error('Failed to update flow in database')
      }
      
      return success
      
    } catch (error) {
      console.error('❌ Auto-sync update error:', error)
      toast.error('Auto-sync update failed')
      return false
    }
  }

  // Setup auto-sync listeners (called when flow is created/updated)
  setupAutoSyncListeners() {
    console.log('🔄 Setting up auto-sync listeners...')
    
    // Listen for flow creation/update events
    // This will be called from Flow.jsx when flows are created/updated
    window.flowAutoSync = {
      syncNewFlow: (flowData) => this.autoSyncNewFlow(flowData),
      syncUpdatedFlow: (flowData) => this.autoSyncUpdatedFlow(flowData),
      syncEliteTemplates: () => this.syncEliteTemplates()
    }
    
    console.log('✅ Auto-sync listeners set up')
  }

  // Manual sync all flows (for admin use)
  async manualSyncAll() {
    console.log('🔄 Manual sync all flows...')
    
    try {
      // First sync elite templates
      await this.syncEliteTemplates()
      
      // Then sync any custom flows from localStorage or other sources
      // This can be extended based on your needs
      
      toast.success('All flows synced successfully')
      return true
      
    } catch (error) {
      console.error('❌ Manual sync failed:', error)
      toast.error('Manual sync failed')
      return false
    }
  }

  // Get all flows from database
  async getAllFlowsFromDatabase() {
    try {
      const { data, error } = await supabase
        .from('ai_flows')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('❌ Error fetching flows from database:', error)
        return []
      }
      
      console.log(`✅ Fetched ${data?.length || 0} flows from database`)
      return data || []
      
    } catch (error) {
      console.error('❌ Failed to fetch flows from database:', error)
      return []
    }
  }

  // Check if flow exists in database
  async flowExistsInDatabase(flowId) {
    try {
      const { data, error } = await supabase
        .from('ai_flows')
        .select('id')
        .eq('id', flowId)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        console.error('❌ Error checking flow existence:', error)
        return false
      }
      
      return !!data
      
    } catch (error) {
      console.error('❌ Failed to check flow existence:', error)
      return false
    }
  }
}

// Create singleton instance
const flowAutoSyncService = new FlowAutoSyncService()

// Export the service
export default flowAutoSyncService

// Export convenience functions
export const {
  initialize,
  syncEliteTemplates,
  autoSyncNewFlow,
  autoSyncUpdatedFlow,
  manualSyncAll,
  getAllFlowsFromDatabase,
  flowExistsInDatabase
} = flowAutoSyncService
