import React, { useState, useEffect } from 'react'
import { 
  RefreshCw, 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Users, 
  Settings, 
  FileText, 
  Brain, 
  GitBranch,
  Zap,
  Eye,
  Loader2
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useSuperAdmin } from '../../contexts/SuperAdminContext'
import toast from 'react-hot-toast'

const MasterSyncModal = ({ 
  isOpen, 
  onClose, 
  masterEngine,
  onSyncComplete 
}) => {
  const { getSuperAdminUserId, isAuthenticated } = useSuperAdmin()
  const [syncOptions, setSyncOptions] = useState({
    description: false,
    models: false,
    nodes: false,
    edges: false,
    config: false,
    full: false
  })
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncLogs, setSyncLogs] = useState([])
  const [userEngineCount, setUserEngineCount] = useState(0)

  useEffect(() => {
    if (isOpen && masterEngine) {
      loadUserEngineCount()
      loadSyncLogs()
    }
  }, [isOpen, masterEngine])

  const loadUserEngineCount = async () => {
    try {
      const { data, error } = await supabase
        .from('user_engines')
        .select('id', { count: 'exact' })
        .eq('engine_id', masterEngine.id)
        .eq('status', 'active')

      if (error) throw error
      setUserEngineCount(data?.length || 0)
    } catch (error) {
      console.error('Error loading user engine count:', error)
      setUserEngineCount(0)
    }
  }

  const loadSyncLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('master_sync_log')
        .select('*')
        .eq('master_engine_id', masterEngine.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setSyncLogs(data || [])
    } catch (error) {
      console.error('Error loading sync logs:', error)
      setSyncLogs([])
    }
  }

  const handleSyncOptionChange = (option) => {
    if (option === 'full') {
      // If full is selected, uncheck all others
      setSyncOptions({
        description: false,
        models: false,
        nodes: false,
        edges: false,
        config: false,
        full: true
      })
    } else {
      // If any other option is selected, uncheck full
      setSyncOptions(prev => ({
        ...prev,
        [option]: !prev[option],
        full: false
      }))
    }
  }

  const handleSync = async () => {
    const selectedOptions = Object.entries(syncOptions)
      .filter(([key, value]) => value)
      .map(([key]) => key)

    if (selectedOptions.length === 0) {
      toast.error('Please select at least one sync option')
      return
    }

    setIsSyncing(true)

    try {
      const userId = getSuperAdminUserId()
      const syncType = selectedOptions.includes('full') ? 'full' : selectedOptions[0]
      
      const { data, error } = await supabase
        .rpc('sync_master_engine_to_users', {
          p_master_engine_id: masterEngine.id,
          p_sync_type: syncType,
          p_sync_details: { selectedOptions },
          p_synced_by: userId
        })

      if (error) throw error

      toast.success(`Sync completed! Updated ${data.affected_count} user engines`)
      loadSyncLogs()
      loadUserEngineCount()
      
      if (onSyncComplete) {
        onSyncComplete(data)
      }

    } catch (error) {
      console.error('Sync error:', error)
      toast.error(`Sync failed: ${error.message}`)
    } finally {
      setIsSyncing(false)
    }
  }

  const getSyncStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-400" />
      case 'in_progress': return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
      default: return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getSyncStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-400'
      case 'failed': return 'text-red-400'
      case 'in_progress': return 'text-blue-400'
      default: return 'text-gray-400'
    }
  }

  if (!isOpen || !masterEngine) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-xl w-[800px] max-w-[90%] max-h-[90vh] overflow-y-auto p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <RefreshCw className="w-8 h-8 text-orange-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">Master Sync</h2>
            <p className="text-gray-400">Sync changes to all user copies</p>
          </div>
        </div>

        {/* Master Engine Info */}
        <div className="bg-slate-700/50 rounded-lg p-4 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">
                {masterEngine.name}
              </h3>
              <p className="text-gray-400 text-sm mb-2">
                {masterEngine.description || 'No description'}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{userEngineCount} user copies</span>
                </div>
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  <span>{masterEngine.nodes?.length || 0} nodes</span>
                </div>
                <div className="flex items-center gap-1">
                  <GitBranch className="w-4 h-4" />
                  <span>{masterEngine.edges?.length || 0} edges</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500">Master Engine</span>
              <div className="text-sm text-green-400 font-medium">Active</div>
            </div>
          </div>
        </div>

        {/* Sync Options */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-4">Select What to Sync</h3>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={syncOptions.description}
                onChange={() => handleSyncOptionChange('description')}
                className="w-4 h-4 text-orange-600 bg-slate-600 border-slate-500 rounded focus:ring-orange-500"
              />
              <FileText className="w-5 h-5 text-blue-400" />
              <div>
                <div className="text-white font-medium">Description</div>
                <div className="text-gray-400 text-sm">Update engine description</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={syncOptions.models}
                onChange={() => handleSyncOptionChange('models')}
                className="w-4 h-4 text-orange-600 bg-slate-600 border-slate-500 rounded focus:ring-orange-500"
              />
              <Brain className="w-5 h-5 text-purple-400" />
              <div>
                <div className="text-white font-medium">AI Models</div>
                <div className="text-gray-400 text-sm">Update model configurations</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={syncOptions.nodes}
                onChange={() => handleSyncOptionChange('nodes')}
                className="w-4 h-4 text-orange-600 bg-slate-600 border-slate-500 rounded focus:ring-orange-500"
              />
              <Settings className="w-5 h-5 text-green-400" />
              <div>
                <div className="text-white font-medium">Nodes</div>
                <div className="text-gray-400 text-sm">Update workflow nodes</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={syncOptions.edges}
                onChange={() => handleSyncOptionChange('edges')}
                className="w-4 h-4 text-orange-600 bg-slate-600 border-slate-500 rounded focus:ring-orange-500"
              />
              <GitBranch className="w-5 h-5 text-yellow-400" />
              <div>
                <div className="text-white font-medium">Connections</div>
                <div className="text-gray-400 text-sm">Update node connections</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={syncOptions.config}
                onChange={() => handleSyncOptionChange('config')}
                className="w-4 h-4 text-orange-600 bg-slate-600 border-slate-500 rounded focus:ring-orange-500"
              />
              <Zap className="w-5 h-5 text-orange-400" />
              <div>
                <div className="text-white font-medium">Configuration</div>
                <div className="text-gray-400 text-sm">Update engine settings</div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={syncOptions.full}
                onChange={() => handleSyncOptionChange('full')}
                className="w-4 h-4 text-orange-600 bg-slate-600 border-slate-500 rounded focus:ring-orange-500"
              />
              <RefreshCw className="w-5 h-5 text-red-400" />
              <div>
                <div className="text-white font-medium">Full Sync</div>
                <div className="text-gray-400 text-sm">Update everything</div>
              </div>
            </label>
          </div>
        </div>

        {/* Sync Logs */}
        {syncLogs.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Recent Sync History</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {syncLogs.map((log) => (
                <div key={log.id} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                  {getSyncStatusIcon(log.sync_status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium capitalize">
                        {log.sync_type} sync
                      </span>
                      <span className={`text-sm ${getSyncStatusColor(log.sync_status)}`}>
                        {log.sync_status}
                      </span>
                    </div>
                    <div className="text-gray-400 text-sm">
                      {log.affected_user_engines} engines updated • {new Date(log.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {isSyncing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Sync to {userEngineCount} Engines
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default MasterSyncModal
