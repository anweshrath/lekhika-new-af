import { flowPersistenceService } from './flowPersistenceService'

class FlowBackupService {
  constructor() {
    this.backupDir = 'src/data/backups'
    this.backupFile = 'savedFlowsBackup.json'
  }

  /**
   * Download flows backup as local file
   * @returns {Promise<{success: boolean, count: number, error?: string}>}
   */
  async downloadFlowsBackup() {
    try {
      console.log('🔄 Starting flow backup sync...')
      
      // Get all flows from database
      const flows = await flowPersistenceService.getAllFlows()
      
      if (!flows || flows.length === 0) {
        console.log('⚠️ No flows found in database')
        return { success: true, count: 0, message: 'No flows to backup' }
      }

      // Convert flows to awesomeFlows.js format
      const backupFlows = {}
      
      flows.forEach(flow => {
        const flowKey = flow.name.toLowerCase().replace(/[^a-z0-9]/g, '_')
        
        backupFlows[flowKey] = {
          id: flow.id,
          name: flow.name,
          description: flow.description || 'Saved flow from database',
          category: 'saved_flows',
          icon: '💾',
          gradient: 'from-blue-600 to-blue-800',
          nodes: flow.nodes || [],
          edges: flow.edges || [],
          metadata: {
            ...flow.metadata,
            type: flow.type,
            steps: flow.steps,
            configurations: flow.configurations,
            parameters: flow.parameters,
            models: flow.models,
            is_default: flow.is_default,
            usage_count: flow.usage_count,
            last_used: flow.last_used,
            created_at: flow.created_at,
            updated_at: flow.updated_at,
            backup_sync_date: new Date().toISOString()
          }
        }
      })

      // Create backup file content in awesomeFlows.js format
      const backupFileContent = `// SAVED FLOWS BACKUP - Synced from Database
// Generated on: ${new Date().toISOString()}
// Total Flows: ${flows.length}

export const SAVED_FLOWS_BACKUP = ${JSON.stringify(backupFlows, null, 2)}

export default SAVED_FLOWS_BACKUP
`

      // Create downloadable file
      const blob = new Blob([backupFileContent], { type: 'text/javascript' })
      const url = URL.createObjectURL(blob)
      
      // Trigger download
      const link = document.createElement('a')
      link.href = url
      link.download = `savedFlowsBackup_${new Date().toISOString().split('T')[0]}.js`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      console.log(`✅ Flow backup sync completed: ${flows.length} flows downloaded`)
      return { 
        success: true, 
        count: flows.length,
        message: `Successfully backed up ${flows.length} flows to downloadable file`,
        location: 'download'
      }

    } catch (error) {
      console.error('❌ Flow backup sync failed:', error)
      return { 
        success: false, 
        count: 0, 
        error: error.message 
      }
    }
  }

  /**
   * Sync flows to filesystem (actual sync, not download)
   * @returns {Promise<{success: boolean, count: number, error?: string}>}
   */
  async syncFlowsToFilesystem() {
    try {
      console.log('🔄 Starting filesystem sync...')
      
      // Get all flows from database
      const flows = await flowPersistenceService.getAllFlows()
      
      if (!flows || flows.length === 0) {
        console.log('⚠️ No flows found in database')
        return { success: true, count: 0, message: 'No flows to sync' }
      }

      // Convert flows to awesomeFlows.js format
      const backupFlows = {}
      
      flows.forEach(flow => {
        const flowKey = flow.name.toLowerCase().replace(/[^a-z0-9]/g, '_')
        
        backupFlows[flowKey] = {
          id: flow.id,
          name: flow.name,
          description: flow.description || 'Saved flow from database',
          category: 'saved_flows',
          icon: '💾',
          gradient: 'from-blue-600 to-blue-800',
          nodes: flow.nodes || [],
          edges: flow.edges || [],
          metadata: {
            ...flow.metadata,
            type: flow.type,
            steps: flow.steps,
            configurations: flow.configurations,
            parameters: flow.parameters,
            models: flow.models,
            is_default: flow.is_default,
            usage_count: flow.usage_count,
            last_used: flow.last_used,
            created_at: flow.created_at,
            updated_at: flow.updated_at,
            backup_sync_date: new Date().toISOString()
          }
        }
      })

      // Create backup file content in awesomeFlows.js format
      const backupFileContent = `// SAVED FLOWS BACKUP - Synced from Database
// Generated on: ${new Date().toISOString()}
// Total Flows: ${flows.length}

export const SAVED_FLOWS_BACKUP = ${JSON.stringify(backupFlows, null, 2)}

export default SAVED_FLOWS_BACKUP
`

      // Write directly to filesystem using Node.js fs module
      const fs = await import('fs/promises')
      const path = await import('path')
      
      // Ensure backup directory exists
      const backupDir = path.join(process.cwd(), 'src', 'data', 'backups')
      await fs.mkdir(backupDir, { recursive: true })
      
      // Write backup file
      const backupFilePath = path.join(backupDir, 'savedFlowsBackup.js')
      await fs.writeFile(backupFilePath, backupFileContent, 'utf8')

      console.log(`✅ Filesystem sync completed: ${flows.length} flows synced to ${backupFilePath}`)
      return { 
        success: true, 
        count: flows.length,
        message: `Successfully synced ${flows.length} flows to filesystem`,
        location: 'filesystem',
        filePath: backupFilePath
      }
    } catch (error) {
      console.error('❌ Filesystem sync failed:', error)
      return { 
        success: false, 
        count: 0, 
        error: error.message 
      }
    }
  }

  /**
   * Load flows from localStorage backup
   * @returns {Promise<{success: boolean, flows: any[], error?: string}>}
   */
  async loadFlowsFromBackup() {
    try {
      const backupDataString = localStorage.getItem('flowBackup')
      
      if (!backupDataString) {
        return {
          success: false,
          flows: [],
          error: 'No backup found in localStorage'
        }
      }
      
      const backupData = JSON.parse(backupDataString)
      
      return {
        success: true,
        flows: backupData.flows || [],
        metadata: backupData.metadata
      }
    } catch (error) {
      console.error('❌ Failed to load flows from backup:', error)
      return {
        success: false,
        flows: [],
        error: error.message
      }
    }
  }

  /**
   * Get backup status info
   * @returns {Promise<{exists: boolean, lastSync?: string, flowCount?: number}>}
   */
  async getBackupStatus() {
    try {
      const backupDataString = localStorage.getItem('flowBackup')
      const backupDate = localStorage.getItem('flowBackupDate')
      
      if (!backupDataString) {
        return { 
          exists: false,
          message: 'No backup found in localStorage'
        }
      }
      
      const backupData = JSON.parse(backupDataString)
      
      return {
        exists: true,
        lastSync: backupDate,
        flowCount: backupData.metadata?.totalFlows || 0,
        location: 'localStorage'
      }
    } catch (error) {
      console.error('❌ Failed to get backup status:', error)
      return { exists: false }
    }
  }

  /**
   * Restore flows from backup to database (use with caution)
   * @param {boolean} confirm - Must be true to proceed
   * @returns {Promise<{success: boolean, restored: number, error?: string}>}
   */
  async restoreFlowsFromBackup(confirm = false) {
    if (!confirm) {
      return {
        success: false,
        restored: 0,
        error: 'Restore operation requires explicit confirmation'
      }
    }

    try {
      const backupResult = await this.loadFlowsFromBackup()
      
      if (!backupResult.success) {
        return {
          success: false,
          restored: 0,
          error: backupResult.error
        }
      }

      let restoredCount = 0
      const errors = []

      for (const flow of backupResult.flows) {
        try {
          await flowPersistenceService.saveFlow(flow)
          restoredCount++
        } catch (error) {
          errors.push(`Failed to restore ${flow.name}: ${error.message}`)
        }
      }

      console.log(`✅ Restored ${restoredCount} flows from backup`)
      
      return {
        success: true,
        restored: restoredCount,
        errors: errors.length > 0 ? errors : undefined
      }
    } catch (error) {
      console.error('❌ Restore operation failed:', error)
      return {
        success: false,
        restored: 0,
        error: error.message
      }
    }
  }
}

export const flowBackupService = new FlowBackupService()
