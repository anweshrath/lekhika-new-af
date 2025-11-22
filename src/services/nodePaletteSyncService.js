// NODE PALETTE SYNC SERVICE
// Syncs all master nodes from nodePalettes.js to node_palettes table in Supabase
// Handles both master nodes and custom user-created nodes

import { supabase } from '../lib/supabase'
import { NODE_PALETTES } from '../data/nodePalettes'
import toast from 'react-hot-toast'

class NodePaletteSyncService {
  constructor() {
    this.isInitialized = false
    this.syncInProgress = false
  }

  // Initialize the service
  async initialize() {
    if (this.isInitialized) return
    
    try {
      console.log('🚀 Initializing Node Palette Sync Service...')
      
      // Auto-sync master nodes on initialization
      await this.syncMasterNodes()
      
      this.isInitialized = true
      console.log('✅ Node Palette Sync Service initialized')
    } catch (error) {
      console.error('❌ Failed to initialize Node Palette Sync Service:', error)
      toast.error('Failed to initialize node palette sync')
    }
  }

  // Sync all master nodes from nodePalettes.js to database
  async syncMasterNodes() {
    if (this.syncInProgress) {
      console.log('⚠️ Node sync already in progress, skipping...')
      return
    }

    this.syncInProgress = true
    console.log('🔄 Syncing master nodes to node_palettes table...')
    
    try {
      let syncCount = 0
      let errorCount = 0
      
      // Process all node categories
      const categories = Object.keys(NODE_PALETTES)
      
      for (const category of categories) {
        const nodes = NODE_PALETTES[category]
        
        if (typeof nodes === 'object' && nodes !== null) {
          const nodeEntries = Object.entries(nodes)
          
          for (const [nodeKey, nodeData] of nodeEntries) {
            try {
              const success = await this.syncNodeToDatabase(nodeData, 'master')
              if (success) {
                syncCount++
                console.log(`✅ Synced master node: ${nodeData.name}`)
              } else {
                errorCount++
                console.error(`❌ Failed to sync master node: ${nodeData.name}`)
              }
            } catch (error) {
              errorCount++
              console.error(`❌ Error syncing master node ${nodeData.name}:`, error)
            }
          }
        }
      }
      
      console.log(`✅ Master node sync completed: ${syncCount} synced, ${errorCount} errors`)
      
      if (syncCount > 0) {
        toast.success(`Synced ${syncCount} master nodes to database`)
      }
      
      if (errorCount > 0) {
        toast.error(`${errorCount} nodes failed to sync`)
      }
      
      return { success: true, synced: syncCount, errors: errorCount }
      
    } catch (error) {
      console.error('❌ Failed to sync master nodes:', error)
      toast.error('Failed to sync master nodes')
      return { success: false, error: error.message }
    } finally {
      this.syncInProgress = false
    }
  }

  // Sync a single node to the database
  async syncNodeToDatabase(nodeData, nodeType = 'master') {
    try {
      // Validate required fields
      if (!nodeData.id || !nodeData.name || !nodeData.type) {
        console.error('❌ Node missing required fields:', nodeData)
        return false
      }

      // Map node data to database schema
      const dbData = {
        node_id: nodeData.id,
        name: nodeData.name,
        description: nodeData.description || `Master ${nodeData.type} node`,
        type: nodeData.type,
        category: nodeData.category || nodeData.type,
        sub_category: nodeData.subCategory || null,
        role: nodeData.role || nodeData.id,
        icon: nodeData.icon || '⚙️',
        gradient: nodeData.gradient || 'from-gray-500 to-gray-700',
        is_ai_enabled: nodeData.is_ai_enabled || false,
        configuration: {
          ...nodeData.configuration,
          nodeType: nodeType, // Mark as master or custom
          syncedAt: new Date().toISOString()
        },
        is_active: true,
        created_by: '5950cad6-810b-4c5b-9d40-4485ea249770', // SuperAdmin UUID
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
      
      // Use upsert to handle both insert and update
      const { error } = await supabase
        .from('node_palettes')
        .upsert(dbData, { 
          onConflict: 'node_id',
          ignoreDuplicates: false 
        })
      
      if (error) {
        console.error(`❌ Database error for node ${nodeData.name}:`, error)
        return false
      }
      
      return true
      
    } catch (error) {
      console.error(`❌ Failed to sync node ${nodeData.name}:`, error)
      return false
    }
  }

  // Manual sync trigger (for UI buttons)
  async manualSync() {
    console.log('🔄 Manual node palette sync triggered')
    return await this.syncMasterNodes()
  }

  // Get sync status
  getSyncStatus() {
    return {
      initialized: this.isInitialized,
      syncInProgress: this.syncInProgress
    }
  }

  // Get all nodes from database
  async getAllNodes() {
    try {
      const { data, error } = await supabase
        .from('node_palettes')
        .select('*')
        .eq('is_active', true)
        .order('type', { ascending: true })
        .order('name', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('❌ Failed to fetch nodes from database:', error)
      return []
    }
  }

  // Get nodes by type
  async getNodesByType(type) {
    try {
      const { data, error } = await supabase
        .from('node_palettes')
        .select('*')
        .eq('type', type)
        .eq('is_active', true)
        .order('name', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error(`❌ Failed to fetch ${type} nodes:`, error)
      return []
    }
  }

  // Delete a node from database
  async deleteNode(nodeId) {
    try {
      const { error } = await supabase
        .from('node_palettes')
        .update({ is_active: false })
        .eq('node_id', nodeId)

      if (error) throw error
      console.log(`✅ Node ${nodeId} deactivated`)
      return true
    } catch (error) {
      console.error(`❌ Failed to delete node ${nodeId}:`, error)
      return false
    }
  }

  // REVERSE SYNC: Sync from Database to Code (nodePalettes.js)
  async syncFromDatabase() {
    console.log('🔄 Syncing from Supabase to code file...')
    
    try {
      // Get all nodes from database
      const nodes = await this.getAllNodes()
      
      if (!nodes || nodes.length === 0) {
        console.log('⚠️ No nodes found in database')
        return { success: false, error: 'No nodes in database' }
      }

      // Group nodes by category
      const nodesByCategory = {
        input: {},
        process: {},
        condition: {},
        preview: {},
        output: {}
      }

      nodes.forEach(node => {
        const category = node.category || node.type
        const role = node.role
        
        if (nodesByCategory[category]) {
          nodesByCategory[category][role] = {
            id: node.node_id,
            type: node.type,
            category: node.category,
            subCategory: node.sub_category,
            role: node.role,
            name: node.name,
            description: node.description,
            icon: node.icon,
            gradient: node.gradient,
            is_ai_enabled: node.is_ai_enabled,
            configuration: node.configuration
          }
        }
      })

      // Generate the nodePalettes.js file content
      const fileContent = this.generateNodePalettesFile(nodesByCategory)

      // Write to file using Node.js fs
      const fs = await import('fs/promises')
      const path = await import('path')
      
      const filePath = path.join(process.cwd(), 'src', 'data', 'nodePalettes.js')
      await fs.writeFile(filePath, fileContent, 'utf8')

      console.log(`✅ Synced ${nodes.length} nodes from database to code file`)
      return {
        success: true,
        count: nodes.length,
        message: `Successfully synced ${nodes.length} nodes to nodePalettes.js`
      }

    } catch (error) {
      console.error('❌ Failed to sync from database to code:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Generate nodePalettes.js file content from database nodes
  generateNodePalettesFile(nodesByCategory) {
    const header = `// COMPREHENSIVE NODE PALETTE SYSTEM - SYNCED FROM SUPABASE
// Last synced: ${new Date().toISOString()}
// This file is auto-generated from the database

export const NODE_PALETTES = `

    const palettesObject = JSON.stringify(nodesByCategory, null, 2)

    const roleConfig = `

// NODE ROLE CONFIGURATIONS
export const NODE_ROLE_CONFIG = {
  // Input Roles
  universal_input: {
    canWriteContent: false,
    primaryFunction: 'input_collection',
    outputType: 'structured_input',
    maxTokens: 0,
    temperature: 0
  },
  story_input: {
    canWriteContent: false,
    primaryFunction: 'story_input_collection',
    outputType: 'story_structured_input',
    maxTokens: 0,
    temperature: 0
  },
  business_input: {
    canWriteContent: false,
    primaryFunction: 'business_input_collection',
    outputType: 'business_structured_input',
    maxTokens: 0,
    temperature: 0
  },

  // Process Roles - Research
  researcher: {
    canWriteContent: false,
    primaryFunction: 'data_gathering',
    outputType: 'research_data',
    maxTokens: 3000,
    temperature: 0.3
  },
  market_analyst: {
    canWriteContent: false,
    primaryFunction: 'market_analysis',
    outputType: 'market_intelligence',
    maxTokens: 3000,
    temperature: 0.3
  },
  fact_checker: {
    canWriteContent: false,
    primaryFunction: 'verification',
    outputType: 'verified_data',
    maxTokens: 2000,
    temperature: 0.2
  },

  // Process Roles - Creative
  world_builder: {
    canWriteContent: false,
    primaryFunction: 'world_creation',
    outputType: 'world_data',
    maxTokens: 4000,
    temperature: 0.7
  },
  character_developer: {
    canWriteContent: false,
    primaryFunction: 'character_creation',
    outputType: 'character_data',
    maxTokens: 3000,
    temperature: 0.7
  },
  plot_architect: {
    canWriteContent: false,
    primaryFunction: 'plot_design',
    outputType: 'plot_structure',
    maxTokens: 3000,
    temperature: 0.6
  },

  // Process Roles - Content (WRITERS)
  content_writer: {
    canWriteContent: true,
    primaryFunction: 'content_generation',
    outputType: 'written_content',
    maxTokens: 8000,
    temperature: 0.7
  },
  technical_writer: {
    canWriteContent: true,
    primaryFunction: 'technical_documentation',
    outputType: 'technical_content',
    maxTokens: 7000,
    temperature: 0.5
  },
  copywriter: {
    canWriteContent: true,
    primaryFunction: 'marketing_content',
    outputType: 'persuasive_content',
    maxTokens: 6000,
    temperature: 0.6
  },

  // Process Roles - Outlining
  story_outliner: {
    canWriteContent: false,
    primaryFunction: 'story_structure',
    outputType: 'story_outline',
    maxTokens: 3000,
    temperature: 0.7
  },
  narrative_architect: {
    canWriteContent: false,
    primaryFunction: 'narrative_structure',
    outputType: 'narrative_outline',
    maxTokens: 3000,
    temperature: 0.7
  },
  content_architect: {
    canWriteContent: false,
    primaryFunction: 'content_structure',
    outputType: 'content_outline',
    maxTokens: 3000,
    temperature: 0.7
  },

  // Process Roles - Polishing
  end_to_end_polisher: {
    canWriteContent: false,
    primaryFunction: 'format_polishing',
    outputType: 'polished_content',
    maxTokens: 3000,
    temperature: 0.7
  },

  // Process Roles - Quality
  editor: {
    canWriteContent: false,
    primaryFunction: 'content_refinement',
    outputType: 'edited_content',
    maxTokens: 6000,
    temperature: 0.3
  },
  quality_checker: {
    canWriteContent: false,
    primaryFunction: 'quality_validation',
    outputType: 'quality_report',
    maxTokens: 2000,
    temperature: 0.2
  },
  proofreader: {
    canWriteContent: false,
    primaryFunction: 'error_correction',
    outputType: 'proofread_content',
    maxTokens: 1500,
    temperature: 0.1
  },

  // Condition Roles
  preference_router: {
    canWriteContent: false,
    primaryFunction: 'workflow_routing',
    outputType: 'routing_decision',
    maxTokens: 1000,
    temperature: 0.5
  },
  content_type_router: {
    canWriteContent: false,
    primaryFunction: 'content_routing',
    outputType: 'routing_decision',
    maxTokens: 1000,
    temperature: 0.5
  },
  quality_gate: {
    canWriteContent: false,
    primaryFunction: 'quality_routing',
    outputType: 'routing_decision',
    maxTokens: 1500,
    temperature: 0.5
  },

  // Preview Roles
  chapter_previewer: {
    canWriteContent: false,
    primaryFunction: 'preview_generation',
    outputType: 'preview_content',
    maxTokens: 5000,
    temperature: 0.5
  },
  content_previewer: {
    canWriteContent: false,
    primaryFunction: 'section_preview',
    outputType: 'preview_content',
    maxTokens: 4000,
    temperature: 0.5
  },
  final_previewer: {
    canWriteContent: false,
    primaryFunction: 'final_preview',
    outputType: 'preview_content',
    maxTokens: 6000,
    temperature: 0.5
  },
  audiobook_previewer: {
    canWriteContent: false,
    primaryFunction: 'audio_preview',
    outputType: 'audio_preview',
    maxTokens: 5000,
    temperature: 0.5
  },

  // Output Roles
  output_processor: {
    canWriteContent: false,
    primaryFunction: 'output_generation',
    outputType: 'final_deliverables',
    maxTokens: 8000,
    temperature: 0.4
  },
  audiobook_output: {
    canWriteContent: false,
    primaryFunction: 'audio_generation',
    outputType: 'audiobook',
    maxTokens: 10000,
    temperature: 0.5
  },
  multi_format_output: {
    canWriteContent: false,
    primaryFunction: 'multi_format_generation',
    outputType: 'multi_format_package',
    maxTokens: 8000,
    temperature: 0.4
  }
}

export default NODE_PALETTES
`

    return header + palettesObject + roleConfig
  }
}

// Create singleton instance
const nodePaletteSyncService = new NodePaletteSyncService()

export { nodePaletteSyncService }
export default nodePaletteSyncService
