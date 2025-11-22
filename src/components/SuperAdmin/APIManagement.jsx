import React, { useState, useEffect } from 'react'
import { 
  Key, 
  Copy, 
  Trash2, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Plus, 
  Search, 
  Filter,
  Activity,
  Clock,
  Users,
  Zap,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ExternalLink,
  Code,
  Database,
  Settings,
  BarChart3,
  TrendingUp,
  Globe,
  Lock,
  Unlock
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useSuperAdmin } from '../../contexts/SuperAdminContext'
import toast from 'react-hot-toast'

const APIManagement = () => {
  const { superAdminUser, getSuperAdminUserId, isAuthenticated } = useSuperAdmin()
  const [apiKeys, setApiKeys] = useState([])
  const [engines, setEngines] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showCreateKeyModal, setShowCreateKeyModal] = useState(false)
  const [showKeyDetails, setShowKeyDetails] = useState({})
  const [apiStats, setApiStats] = useState({
    totalKeys: 0,
    activeKeys: 0,
    totalRequests: 0,
    avgResponseTime: 0
  })
  const [newKey, setNewKey] = useState({
    user_id: '',
    engine_id: '',
    permissions: ['execute', 'read'],
    expires_at: null,
    description: ''
  })

  // Load API keys and related data
  const loadAPIData = async () => {
    try {
      setLoading(true)
      
      if (!isAuthenticated()) {
        console.error('SuperAdmin not authenticated')
        return
      }

      // Load API keys with user and engine details
      const { data: keysData, error: keysError } = await supabase
        .from('engine_api_keys')
        .select(`
          *,
          users!engine_api_keys_user_id_fkey (
            id,
            full_name,
            username,
            email
          ),
          ai_engines!engine_api_keys_engine_id_fkey (
            id,
            name,
            description
          )
        `)
        .order('created_at', { ascending: false })

      if (keysError) {
        console.error('Error loading API keys:', keysError)
        throw keysError
      }

      console.log('✅ Loaded API keys:', keysData)

      // Load engines for dropdown
      const { data: enginesData, error: enginesError } = await supabase
        .from('ai_engines')
        .select('id, name, description')
        .order('name')

      if (enginesError) {
        console.error('Error loading engines:', enginesError)
        throw enginesError
      }

      console.log('✅ Loaded engines:', enginesData)

      // Load users for dropdown
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, full_name, username, email')
        .order('full_name')

      if (usersError) {
        console.error('Error loading users:', usersError)
        throw usersError
      }

      console.log('✅ Loaded users:', usersData)

      setApiKeys(keysData || [])
      setEngines(enginesData || [])
      setUsers(usersData || [])

      // Calculate stats
      const totalKeys = keysData?.length || 0
      const activeKeys = keysData?.filter(key => key.is_active).length || 0
      const totalRequests = keysData?.reduce((sum, key) => sum + (key.usage_count || 0), 0) || 0
      const avgResponseTime = 150 // Mock data - would come from actual API logs

      setApiStats({
        totalKeys,
        activeKeys,
        totalRequests,
        avgResponseTime
      })

    } catch (error) {
      console.error('Error loading API data:', error)
      toast.error('Failed to load API data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAPIData()
  }, [])

  // Filter API keys
  const filteredKeys = apiKeys.filter(key => {
    const matchesSearch = 
      key.api_key?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      key.users?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      key.users?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      key.users?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      key.ai_engines?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      key.ai_engines?.description?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'active' && key.is_active) ||
      (filterStatus === 'inactive' && !key.is_active) ||
      (filterStatus === 'expired' && key.expires_at && new Date(key.expires_at) < new Date())

    return matchesSearch && matchesStatus
  })

  // Create new API key
  const createAPIKey = async () => {
    try {
      if (!newKey.user_id || !newKey.engine_id) {
        toast.error('Please select both user and engine')
        return
      }

      const { data, error } = await supabase
        .rpc('assign_engine_to_user', {
          p_user_id: newKey.user_id,
          p_engine_id: newKey.engine_id,
          p_assigned_by: getSuperAdminUserId()
        })

      if (error) throw error

      toast.success('API key created successfully!')
      setShowCreateKeyModal(false)
      setNewKey({
        user_id: '',
        engine_id: '',
        permissions: ['execute', 'read'],
        expires_at: null,
        description: ''
      })
      loadAPIData()

    } catch (error) {
      console.error('Error creating API key:', error)
      toast.error('Failed to create API key')
    }
  }

  // Toggle API key status
  const toggleKeyStatus = async (keyId, isActive) => {
    try {
      const { error } = await supabase
        .from('engine_api_keys')
        .update({ is_active: !isActive })
        .eq('id', keyId)

      if (error) throw error

      toast.success(`API key ${!isActive ? 'activated' : 'deactivated'}`)
      loadAPIData()

    } catch (error) {
      console.error('Error toggling key status:', error)
      toast.error('Failed to update API key status')
    }
  }

  // Delete API key
  const deleteAPIKey = async (keyId) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('engine_api_keys')
        .delete()
        .eq('id', keyId)

      if (error) throw error

      toast.success('API key deleted successfully')
      loadAPIData()

    } catch (error) {
      console.error('Error deleting API key:', error)
      toast.error('Failed to delete API key')
    }
  }

  // Copy API key to clipboard
  const copyAPIKey = (apiKey) => {
    navigator.clipboard.writeText(apiKey)
    toast.success('API key copied to clipboard')
  }

  // Format API key for display
  const formatAPIKey = (key, showFull = false) => {
    if (showFull) return key
    return `${key.substring(0, 8)}...${key.substring(key.length - 8)}`
  }

  // Get status color
  const getStatusColor = (key) => {
    if (!key.is_active) return 'text-red-400 bg-red-500/20'
    if (key.expires_at && new Date(key.expires_at) < new Date()) return 'text-orange-400 bg-orange-500/20'
    return 'text-green-400 bg-green-500/20'
  }

  // Get status text
  const getStatusText = (key) => {
    if (!key.is_active) return 'Inactive'
    if (key.expires_at && new Date(key.expires_at) < new Date()) return 'Expired'
    return 'Active'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">API Management</h2>
          <p className="text-slate-400">Manage API keys, endpoints, and monitor usage</p>
        </div>
        <button
          onClick={() => setShowCreateKeyModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-all duration-200 hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          Create API Key
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="group bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-2xl rounded-2xl border border-orange-500/30 p-4 sm:p-6 hover:border-orange-500/60 transition-all duration-500 transform hover:scale-[1.05] hover:shadow-2xl hover:shadow-orange-500/30 hover:-translate-y-1 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-slate-400 text-xs sm:text-sm font-medium mb-1 sm:mb-2 group-hover:text-orange-200 transition-colors duration-300">Total API Keys</p>
                <p className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2 group-hover:text-orange-100 transition-colors duration-300">{apiStats.totalKeys}</p>
                <div className="flex items-center group-hover:translate-x-1 transition-transform duration-300">
                  <Key className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400 mr-1 sm:mr-2 group-hover:text-orange-300 group-hover:scale-110 transition-all duration-300" />
                  <span className="text-xs sm:text-sm text-orange-400 font-medium group-hover:text-orange-300 transition-colors duration-300">Generated</span>
                </div>
              </div>
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg group-hover:shadow-orange-500/50 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 flex-shrink-0">
                <Key className="w-5 h-5 sm:w-7 sm:h-7 text-white group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
          </div>
        </div>

        <div className="group bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-2xl rounded-2xl border border-green-500/30 p-4 sm:p-6 hover:border-green-500/60 transition-all duration-500 transform hover:scale-[1.05] hover:shadow-2xl hover:shadow-green-500/30 hover:-translate-y-1 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-slate-400 text-xs sm:text-sm font-medium mb-1 sm:mb-2 group-hover:text-green-200 transition-colors duration-300">Active Keys</p>
                <p className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2 group-hover:text-green-100 transition-colors duration-300">{apiStats.activeKeys}</p>
                <div className="flex items-center group-hover:translate-x-1 transition-transform duration-300">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 mr-1 sm:mr-2 group-hover:text-green-300 group-hover:scale-110 transition-all duration-300" />
                  <span className="text-xs sm:text-sm text-green-400 font-medium group-hover:text-green-300 transition-colors duration-300">Online</span>
                </div>
              </div>
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg group-hover:shadow-green-500/50 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 flex-shrink-0">
                <CheckCircle className="w-5 h-5 sm:w-7 sm:h-7 text-white group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
          </div>
        </div>

        <div className="group bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-2xl rounded-2xl border border-blue-500/30 p-4 sm:p-6 hover:border-blue-500/60 transition-all duration-500 transform hover:scale-[1.05] hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-1 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-slate-400 text-xs sm:text-sm font-medium mb-1 sm:mb-2 group-hover:text-blue-200 transition-colors duration-300">Total Requests</p>
                <p className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2 group-hover:text-blue-100 transition-colors duration-300">{apiStats.totalRequests.toLocaleString()}</p>
                <div className="flex items-center group-hover:translate-x-1 transition-transform duration-300">
                  <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400 mr-1 sm:mr-2 group-hover:text-blue-300 group-hover:scale-110 transition-all duration-300" />
                  <span className="text-xs sm:text-sm text-blue-400 font-medium group-hover:text-blue-300 transition-colors duration-300">This month</span>
                </div>
              </div>
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:shadow-blue-500/50 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 flex-shrink-0">
                <Activity className="w-5 h-5 sm:w-7 sm:h-7 text-white group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
          </div>
        </div>

        <div className="group bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-2xl rounded-2xl border border-purple-500/30 p-4 sm:p-6 hover:border-purple-500/60 transition-all duration-500 transform hover:scale-[1.05] hover:shadow-2xl hover:shadow-purple-500/30 hover:-translate-y-1 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-slate-400 text-xs sm:text-sm font-medium mb-1 sm:mb-2 group-hover:text-purple-200 transition-colors duration-300">Avg Response</p>
                <p className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2 group-hover:text-purple-100 transition-colors duration-300">{apiStats.avgResponseTime}ms</p>
                <div className="flex items-center group-hover:translate-x-1 transition-transform duration-300">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 mr-1 sm:mr-2 group-hover:text-purple-300 group-hover:scale-110 transition-all duration-300" />
                  <span className="text-xs sm:text-sm text-purple-400 font-medium group-hover:text-purple-300 transition-colors duration-300">Response time</span>
                </div>
              </div>
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-purple-500/50 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 flex-shrink-0">
                <Clock className="w-5 h-5 sm:w-7 sm:h-7 text-white group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* API Endpoints Documentation */}
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl border border-orange-500/20 p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
              <Code className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">API Endpoints</h3>
              <p className="text-slate-400 text-sm">Available endpoints for engine execution</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {/* List Engines Endpoint */}
          <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded border border-green-500/30">GET</span>
                <code className="text-orange-400 font-mono">/api/engines</code>
              </div>
              <button
                onClick={() => copyAPIKey('GET /api/engines')}
                className="p-1 text-slate-400 hover:text-orange-400 transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="text-slate-300 text-sm mb-2">List all engines assigned to the authenticated user</p>
            <div className="text-xs text-slate-500">
              <strong>Headers:</strong> Authorization: Bearer LEKH-2-xxxxxxxxx
            </div>
          </div>

          {/* Get Engine Details Endpoint */}
          <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded border border-blue-500/30">GET</span>
                <code className="text-orange-400 font-mono">/api/engines/{`{id}`}</code>
              </div>
              <button
                onClick={() => copyAPIKey('GET /api/engines/{id}')}
                className="p-1 text-slate-400 hover:text-orange-400 transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="text-slate-300 text-sm mb-2">Get detailed information about a specific engine</p>
            <div className="text-xs text-slate-500">
              <strong>Headers:</strong> Authorization: Bearer LEKH-2-xxxxxxxxx
            </div>
          </div>

          {/* Execute Engine Endpoint */}
          <div className="bg-slate-700/50 rounded-xl p-4 border border-slate-600">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs font-medium rounded border border-orange-500/30">POST</span>
                <code className="text-orange-400 font-mono">/api/engines/{`{id}`}/execute</code>
              </div>
              <button
                onClick={() => copyAPIKey('POST /api/engines/{id}/execute')}
                className="p-1 text-slate-400 hover:text-orange-400 transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="text-slate-300 text-sm mb-2">Execute an engine with input parameters</p>
            <div className="text-xs text-slate-500">
              <strong>Headers:</strong> Authorization: Bearer LEKH-2-xxxxxxxxx, Content-Type: application/json
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search API keys..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white placeholder-slate-400"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-slate-800/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-white"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* API Keys Table */}
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl border border-orange-500/20 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-slate-700 to-slate-800">
              <tr>
                <th className="px-6 py-4 text-left text-white font-bold">API Key</th>
                <th className="px-6 py-4 text-left text-white font-bold">User</th>
                <th className="px-6 py-4 text-left text-white font-bold">Engine</th>
                <th className="px-6 py-4 text-center text-white font-bold">Status</th>
                <th className="px-6 py-4 text-center text-white font-bold">Usage</th>
                <th className="px-6 py-4 text-center text-white font-bold">Last Used</th>
                <th className="px-6 py-4 text-center text-white font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredKeys.map((key) => (
                <tr key={key.id} className="border-b border-slate-600 hover:bg-slate-700/30 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <code className="text-orange-400 font-mono text-sm">
                        {formatAPIKey(key.api_key, showKeyDetails[key.id])}
                      </code>
                      <button
                        onClick={() => setShowKeyDetails(prev => ({ ...prev, [key.id]: !prev[key.id] }))}
                        className="p-1 text-slate-400 hover:text-orange-400 transition-colors"
                      >
                        {showKeyDetails[key.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => copyAPIKey(key.api_key)}
                        className="p-1 text-slate-400 hover:text-orange-400 transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-white">{key.users?.full_name || 'Unknown'}</div>
                      <div className="text-sm text-slate-400">{key.users?.username || key.users?.email || 'No username'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-white">{key.ai_engines?.name || 'Unknown'}</div>
                      <div className="text-sm text-slate-400 truncate max-w-xs">{key.ai_engines?.description || 'No description'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(key)}`}>
                      {getStatusText(key)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="text-white font-medium">{key.usage_count || 0}</div>
                    <div className="text-xs text-slate-400">requests</div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="text-slate-300 text-sm">
                      {key.last_used ? new Date(key.last_used).toLocaleDateString() : 'Never'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => toggleKeyStatus(key.id, key.is_active)}
                        className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                          key.is_active 
                            ? 'text-red-400 hover:bg-red-500/20' 
                            : 'text-green-400 hover:bg-green-500/20'
                        }`}
                        title={key.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {key.is_active ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => deleteAPIKey(key.id)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all duration-200 hover:scale-110"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {filteredKeys.length === 0 && (
        <div className="text-center py-12">
          <Key className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No API keys found</h3>
          <p className="text-slate-400">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first API key to get started'
            }
          </p>
        </div>
      )}

      {/* Create API Key Modal */}
      {showCreateKeyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl border border-orange-500/30 p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Create API Key</h3>
              <button
                onClick={() => setShowCreateKeyModal(false)}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">User</label>
                <select
                  value={newKey.user_id}
                  onChange={(e) => setNewKey(prev => ({ ...prev, user_id: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select a user</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.full_name} ({user.username})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Engine</label>
                <select
                  value={newKey.engine_id}
                  onChange={(e) => setNewKey(prev => ({ ...prev, engine_id: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Select an engine</option>
                  {engines.map(engine => (
                    <option key={engine.id} value={engine.id}>
                      {engine.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Description (Optional)</label>
                <input
                  type="text"
                  value={newKey.description}
                  onChange={(e) => setNewKey(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter a description for this API key"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateKeyModal(false)}
                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createAPIKey}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
              >
                Create API Key
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default APIManagement
