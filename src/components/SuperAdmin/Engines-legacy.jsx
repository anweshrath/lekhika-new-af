import React, { useState, useEffect } from 'react'
import { 
  Settings, 
  Users, 
  Crown, 
  Copy, 
  Trash2, 
  Edit, 
  Play,
  Pause,
  MoreVertical,
  Search,
  Filter,
  Plus,
  Zap,
  Target,
  Layers,
  Clock,
  CheckCircle,
  AlertTriangle,
  Key,
  Eye,
  EyeOff,
  RefreshCw,
  X
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useSuperAdmin } from '../../contexts/SuperAdminContext'
import toast from 'react-hot-toast'
import EngineAssignmentModal from './EngineAssignmentModal'
import MasterSyncModal from './MasterSyncModal'

const Engines = () => {
  console.log('🚀 Engines component rendering...')
  
  const { superAdminUser, getSuperAdminUserId, isAuthenticated } = useSuperAdmin()
  console.log('🔍 SuperAdmin context:', { superAdminUser, isAuthenticated: isAuthenticated() })
  
  const [engines, setEngines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [showSyncModal, setShowSyncModal] = useState(false)
  const [selectedEngine, setSelectedEngine] = useState(null)
  const [showActions, setShowActions] = useState({})
  const [apiKeys, setApiKeys] = useState({})
  const [showUserSelectionModal, setShowUserSelectionModal] = useState(false)
  const [users, setUsers] = useState([])

  // Load engines from ai_engines table
  const loadEngines = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔄 Loading engines from ai_engines...')
      
      if (!isAuthenticated()) {
        const authError = 'SuperAdmin authentication required'
        console.error('❌', authError)
        setError(authError)
        return
      }

      const { data, error } = await supabase
        .from('ai_engines')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error loading ai_engines:', error)
        setError(`Database error: ${error.message}`)
        setEngines([])
        return
      }

      console.log('✅ Loaded engines:', data)
      console.log('📊 Engine count:', data?.length || 0)
      
      if (!data || data.length === 0) {
        console.log('⚠️ No engines found in ai_flows table')
        toast.info('No engines found. Create some flows first!')
      }
      
      setEngines(data || [])
    } catch (error) {
      const errorMsg = `Unexpected error: ${error.message}`
      console.error('❌ Error loading engines:', error)
      setError(errorMsg)
      setEngines([])
    } finally {
      setLoading(false)
    }
  }

  // Load API keys for engines
  const loadAPIKeys = async () => {
    try {
      const { data, error } = await supabase
        .from('user_engines')
        .select('engine_id, api_key, status')

      if (error) {
        console.error('❌ Error loading API keys:', error)
        return
      }

      // Group API keys by engine_id
      const keysByEngine = {}
      data?.forEach(ue => {
        if (ue.api_key && ue.status === 'active') {
          if (!keysByEngine[ue.engine_id]) {
            keysByEngine[ue.engine_id] = []
          }
          keysByEngine[ue.engine_id].push({
            api_key: ue.api_key,
            status: ue.status
          })
        }
      })

      setApiKeys(keysByEngine)
      console.log('✅ Loaded API keys:', keysByEngine)
    } catch (error) {
      console.error('❌ Error loading API keys:', error)
    }
  }

  // Load users for assignment
  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name, username, email, tier')
        .eq('is_active', true)
        .order('full_name')

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('❌ Error loading users:', error)
    }
  }

  useEffect(() => {
    loadEngines()
    loadAPIKeys()
    loadUsers()
  }, [])

  // Filter engines based on search and filter
  const filteredEngines = engines.filter(engine => {
    const matchesSearch = engine.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         engine.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filterType === 'all') return matchesSearch
    if (filterType === 'active') return matchesSearch && engine.status === 'active'
    if (filterType === 'inactive') return matchesSearch && engine.status === 'inactive'
    
    return matchesSearch
  })

  // Handle engine actions
  const handleEngineAction = (action, engine) => {
    console.log(`🎯 Action: ${action} for engine:`, engine.name)
    
    switch (action) {
      case 'assign':
        setSelectedEngine(engine)
        setShowAssignmentModal(true)
        break
      case 'sync':
        setSelectedEngine(engine)
        setShowSyncModal(true)
        break
      case 'generate_api_key':
        generateAPIKey(engine)
        break
      case 'view_api_keys':
        // Show API keys for this engine
        break
      case 'edit':
        // Navigate to edit flow
        break
      case 'delete':
        // Delete engine
        break
      default:
        break
    }
    setShowActions({ ...showActions, [engine.id]: false })
  }

  // Generate API key for engine
  const generateAPIKey = async (engine) => {
    try {
      const currentUserId = getSuperAdminUserId()
      
      if (!currentUserId) {
        toast.error('User not authenticated')
        return
      }

      // Show user selection modal
      setSelectedEngine(engine)
      setShowUserSelectionModal(true)
    } catch (error) {
      console.error('❌ Error opening user selection:', error)
      toast.error(`Failed to open user selection: ${error.message}`)
    }
  }

  // Assign engine to selected user
  const assignEngineToUser = async (userId) => {
    try {
      const currentUserId = getSuperAdminUserId()
      
      console.log('🔑 Assigning engine to user:', userId)

      const { data: apiKey, error } = await supabase
        .rpc('assign_engine_to_user', {
          p_user_id: userId,
          p_engine_id: selectedEngine.id,
          p_assigned_by: currentUserId
        })

      if (error) throw error

      toast.success(`API Key generated for user: ${apiKey}`)
      console.log('🔑 Generated API Key:', apiKey)
      
      // Close modal and reload engines
      setShowUserSelectionModal(false)
      setSelectedEngine(null)
      loadEngines()
    } catch (error) {
      console.error('❌ Error generating API key:', error)
      toast.error(`Failed to generate API key: ${error.message}`)
    }
  }

  // Copy API key to clipboard
  const copyAPIKey = (apiKey) => {
    navigator.clipboard.writeText(apiKey)
    toast.success('API Key copied to clipboard!')
  }

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-red-100 text-red-800'
      case 'draft': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Error boundary
  if (error) {
    console.log('❌ Error state:', error)
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <AlertTriangle className="w-12 h-12 text-red-500" />
        <h3 className="text-lg font-semibold text-white">Error Loading Engines</h3>
        <p className="text-red-400 text-center max-w-md">{error}</p>
        <button
          onClick={() => {
            setError(null)
            loadEngines()
          }}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  // Loading state
  if (loading) {
    console.log('⏳ Loading state active')
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <h3 className="text-lg font-semibold text-white">Loading Engines...</h3>
        <p className="text-gray-400">Please wait while we fetch your engines</p>
      </div>
    )
  }

  console.log('🎯 Rendering main Engines component')
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search engines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="all">All Engines</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-400">
            {filteredEngines.length} of {engines.length} engines
          </span>
        </div>
      </div>

      {/* Engines Grid */}
      {filteredEngines.length === 0 ? (
        <div className="text-center py-12">
          <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Engines Found</h3>
          <p className="text-gray-400 mb-6">
            {searchTerm || filterType !== 'all' 
              ? 'No engines match your search criteria' 
              : 'Create your first AI flow to get started'
            }
          </p>
          {!searchTerm && filterType === 'all' && (
            <div className="text-left max-w-md mx-auto text-sm text-slate-500">
              <ul className="space-y-1">
                <li>• Go to Flow section to create workflows</li>
                <li>• Deploy flows as engines</li>
                <li>• Assign engines to users and levels</li>
                <li>• Generate API keys for access</li>
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEngines.map((engine) => (
            <div
              key={engine.id}
              className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-600 rounded-2xl p-6 hover:border-orange-500/70 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-500/20 transform hover:-translate-y-1 backdrop-blur-sm"
            >
              {/* Engine Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-white">
                      {engine.name || 'Unnamed Engine'}
                    </h3>
                    <span className="text-xs text-gray-400 font-mono bg-slate-700 px-2 py-1 rounded">
                      ID: {engine.id?.slice(0, 8)}...
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 line-clamp-2">
                    {engine.description || 'No description available'}
                  </p>
                </div>
                
                <div className="relative">
                  <button
                    onClick={() => setShowActions({ ...showActions, [engine.id]: !showActions[engine.id] })}
                    className="p-2 text-gray-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>
                  
                  {showActions[engine.id] && (
                    <div className="absolute right-0 top-10 bg-slate-700 border border-slate-600 rounded-lg shadow-lg z-10 min-w-[200px]">
                      <button
                        onClick={() => handleEngineAction('generate_api_key', engine)}
                        className="w-full px-4 py-2 text-left text-sm text-white hover:bg-slate-600 flex items-center space-x-2"
                      >
                        <Key className="w-4 h-4" />
                        <span>Generate API Key</span>
                      </button>
                      <button
                        onClick={() => handleEngineAction('assign', engine)}
                        className="w-full px-4 py-2 text-left text-sm text-white hover:bg-slate-600 flex items-center space-x-2"
                      >
                        <Users className="w-4 h-4" />
                        <span>Assign to Users</span>
                      </button>
                      <button
                        onClick={() => handleEngineAction('sync', engine)}
                        className="w-full px-4 py-2 text-left text-sm text-white hover:bg-slate-600 flex items-center space-x-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Master Sync</span>
                      </button>
                      <button
                        onClick={() => handleEngineAction('view_api_keys', engine)}
                        className="w-full px-4 py-2 text-left text-sm text-white hover:bg-slate-600 flex items-center space-x-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View API Keys</span>
                      </button>
                      <hr className="border-slate-600" />
                      <button
                        onClick={() => handleEngineAction('edit', engine)}
                        className="w-full px-4 py-2 text-left text-sm text-white hover:bg-slate-600 flex items-center space-x-2"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit Engine</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Engine Status */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusColor(engine.status)}`}>
                    {engine.status || 'draft'}
                  </span>
                  <div className={`w-2 h-2 rounded-full ${
                    engine.status === 'active' ? 'bg-green-500' : 
                    engine.status === 'inactive' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}></div>
                </div>
                <span className="text-xs text-gray-400 font-mono">
                  {new Date(engine.created_at).toLocaleDateString()}
                </span>
              </div>

              {/* API Keys Section */}
              {apiKeys[engine.id] && apiKeys[engine.id].length > 0 && (
                <div className="mb-6 p-4 bg-gradient-to-r from-slate-700/60 to-slate-800/60 rounded-xl border border-slate-600/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-white flex items-center space-x-2">
                      <Key className="w-4 h-4 text-orange-400" />
                      <span>API Keys</span>
                    </span>
                    <span className="text-xs text-orange-400 font-bold bg-orange-500/20 px-2 py-1 rounded-full">
                      {apiKeys[engine.id].length} key{apiKeys[engine.id].length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {apiKeys[engine.id].slice(0, 2).map((key, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <code className="flex-1 text-xs bg-slate-900 px-3 py-2 rounded-lg text-orange-400 font-mono truncate border border-orange-500/30">
                          {key.api_key}
                        </code>
                        <button
                          onClick={() => copyAPIKey(key.api_key)}
                          className="p-2 text-gray-400 hover:text-orange-400 hover:bg-orange-500/20 rounded-lg transition-all"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {apiKeys[engine.id].length > 2 && (
                      <p className="text-xs text-gray-400 font-medium">
                        +{apiKeys[engine.id].length - 2} more keys available
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleEngineAction('generate_api_key', engine)}
                  className="px-4 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white text-sm font-bold rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all transform hover:scale-105 shadow-lg hover:shadow-orange-500/25 flex items-center justify-center space-x-2"
                >
                  <Key className="w-4 h-4" />
                  <span>Get API Key</span>
                </button>
                <button
                  onClick={() => handleEngineAction('assign', engine)}
                  className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 flex items-center justify-center space-x-2"
                >
                  <Users className="w-4 h-4" />
                  <span>Assign</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignmentModal && selectedEngine && (
        <EngineAssignmentModal
          engine={selectedEngine}
          onClose={() => {
            setShowAssignmentModal(false)
            setSelectedEngine(null)
          }}
          onAssign={() => {
            setShowAssignmentModal(false)
            setSelectedEngine(null)
            loadEngines()
            loadAPIKeys()
          }}
        />
      )}

      {/* Master Sync Modal */}
      {showSyncModal && selectedEngine && (
        <MasterSyncModal
          masterEngine={selectedEngine}
          onClose={() => {
            setShowSyncModal(false)
            setSelectedEngine(null)
          }}
          onSyncComplete={() => {
            setShowSyncModal(false)
            setSelectedEngine(null)
            loadEngines()
            loadAPIKeys()
          }}
        />
      )}

      {/* User Selection Modal */}
      {showUserSelectionModal && selectedEngine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">Assign Engine to User</h3>
              <button
                onClick={() => {
                  setShowUserSelectionModal(false)
                  setSelectedEngine(null)
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-300 mb-2">Engine: <span className="text-white font-medium">{selectedEngine.name}</span></p>
              <p className="text-gray-400 text-sm">Select a user to assign this engine to:</p>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {users.map(user => (
                <button
                  key={user.id}
                  onClick={() => assignEngineToUser(user.id)}
                  className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{user.full_name}</p>
                      <p className="text-gray-400 text-sm">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-300 text-sm">@{user.username}</p>
                      <p className="text-gray-500 text-xs">{user.tier}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {users.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-400">No users found</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Engines