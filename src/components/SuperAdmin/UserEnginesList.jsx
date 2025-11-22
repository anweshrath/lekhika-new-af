import React, { useState, useEffect } from 'react'
import { 
  Search, Filter, Edit, Trash2, Key, RefreshCw, Eye, EyeOff,
  ChevronDown, User, Zap, CheckCircle, XCircle, Copy, ExternalLink,
  Brain, Star, X, Loader2
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

const UserEnginesList = () => {
  const [userEngines, setUserEngines] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterEngine, setFilterEngine] = useState('all')
  const [filterLevel, setFilterLevel] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [engines, setEngines] = useState([])
  const [levels, setLevels] = useState([])
  const [revealedKeys, setRevealedKeys] = useState({})
  
  // AI Models state
  const [availableModels, setAvailableModels] = useState([])
  const [modelsLoading, setModelsLoading] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState('')
  const [providers, setProviders] = useState([])
  
  // Edit modal state
  const [editingUserEngine, setEditingUserEngine] = useState(null)
  const [editData, setEditData] = useState({})
  
  // Node editing state
  const [editingNode, setEditingNode] = useState(null)
  const [nodeEditData, setNodeEditData] = useState({})

  // Load all data
  useEffect(() => {
    loadUserEngines()
    loadEngines()
    loadLevels()
    loadAIModels()
  }, [])

  // Load user engines with user and engine data
  const loadUserEngines = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('user_engines')
        .select(`
          id,
          user_id,
          engine_id,
          name,
          description,
          api_key,
          status,
          created_at,
          updated_at,
          users (
            id,
            full_name,
            email,
            level_id,
            levels (
              id,
              name,
              display_name
            )
          ),
          ai_engines!user_engines_engine_id_fkey (
            id,
            name,
            description,
            nodes,
            edges,
            models,
            execution_mode,
            tier,
            active,
            created_at,
            updated_at
          )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setUserEngines(data || [])
    } catch (error) {
      console.error('Error loading user engines:', error)
      toast.error(`Failed to load user engines: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Load engines for filter
  const loadEngines = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_engines')
        .select('id, name')
        .order('name')

      if (error) throw error
      setEngines(data || [])
    } catch (error) {
      console.error('Error loading engines:', error)
    }
  }

  // Load levels for filter
  const loadLevels = async () => {
    try {
      const { data, error } = await supabase
        .from('levels')
        .select('id, name, display_name')
        .order('tier_level')

      if (error) throw error
      setLevels(data || [])
    } catch (error) {
      console.error('Error loading levels:', error)
    }
  }

  // Load AI providers and models for engine configuration
  const loadAIModels = async () => {
    try {
      setModelsLoading(true)
      
      // Load AI providers from ai_providers table
      const { data: providersData, error: providersError } = await supabase
        .from('ai_providers')
        .select('*')
        .eq('is_active', true)

      if (providersError) throw providersError
      
      setProviders(providersData?.map(provider => provider.name) || [])
      
      // Set first provider as default
      if (providersData && providersData.length > 0 && !selectedProvider) {
        setSelectedProvider(providersData[0].name)
      }
    } catch (error) {
      console.error('Error loading AI providers:', error)
      toast.error('Failed to load AI providers')
    } finally {
      setModelsLoading(false)
    }
  }

  // Load models for specific provider (like FlowNodeModal does)
  const loadModelsForProvider = async (providerName) => {
    try {
      setModelsLoading(true)
      
      console.log('🔍 Loading models for provider:', providerName)
      
      // Use EXACT same logic as FlowNodeModal
      const { data, error } = await supabase
        .from('ai_model_metadata')
        .select('*')
        .eq('is_active', true)
        .eq('key_name', providerName) // Filter by key_name directly in query
        .order('model_name', { ascending: true })

      if (error) throw error
      
      console.log(`🎉 Found ${data?.length || 0} models for ${providerName} in ai_model_metadata`)
      
      const models = (data || []).map(model => ({
        id: model.model_id,
        name: model.model_name,
        provider: model.provider,
        key_name: model.key_name,
        input_cost_per_million: model.input_cost_per_million,
        output_cost_per_million: model.output_cost_per_million,
        context_window_tokens: model.context_window_tokens,
        description: model.description
      }))
      
      console.log(`🔍 Loaded ${models.length} models for ${providerName}:`, models)
      setAvailableModels(models)
      
    } catch (error) {
      console.error('Error loading models:', error)
      toast.error(`Failed to load models for ${providerName}`)
      setAvailableModels([])
    } finally {
      setModelsLoading(false)
    }
  }

  // Get filtered models by selected provider
  const getFilteredModels = () => {
    if (!selectedProvider) return []
    console.log('🔍 Filtering models for provider:', selectedProvider)
    console.log('🔍 Available models:', availableModels.length)
    
    const filtered = availableModels.filter(model => {
      console.log('🔍 Model key_name:', model.key_name, 'Selected provider:', selectedProvider)
      return model.key_name === selectedProvider
    })
    
    console.log('🔍 Filtered models:', filtered.length)
    return filtered
  }

  // Get default AI model for display
  const getDefaultAIModel = () => {
    if (!editData.models || editData.models.length === 0) return null
    return editData.models.find(model => model.is_default) || editData.models[0]
  }

  // Filter user engines
  const filteredUserEngines = userEngines.filter(ue => {
    const matchesSearch = 
      ue.users?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ue.users?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ue.name?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesEngine = filterEngine === 'all' || ue.engine_id === filterEngine
    const matchesLevel = filterLevel === 'all' || ue.users?.level_id === filterLevel
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && ue.status === 'active') ||
      (filterStatus === 'inactive' && ue.status === 'inactive')

    return matchesSearch && matchesEngine && matchesLevel && matchesStatus
  })

  // Toggle API key visibility
  const toggleKeyVisibility = (id) => {
    setRevealedKeys(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // Copy API key to clipboard
  const copyAPIKey = (apiKey) => {
    navigator.clipboard.writeText(apiKey)
    toast.success('API key copied to clipboard')
  }

  // Delete user engine
  const handleDelete = async (id, userName) => {
    if (!confirm(`Remove engine access for ${userName}? This will delete their API key.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('user_engines')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('User engine access removed')
      loadUserEngines()
    } catch (error) {
      console.error('Error deleting user engine:', error)
      toast.error(`Failed to remove access: ${error.message}`)
    }
  }

  // Regenerate API key
  const handleRegenerateKey = async (id, userId, engineId, userName) => {
    if (!confirm(`Regenerate API key for ${userName}? Their current key will stop working.`)) {
      return
    }

    try {
      const { data: newKey, error } = await supabase
        .rpc('generate_user_engine_api_key', {
          p_user_id: userId,
          p_engine_id: engineId
        })

      if (error) throw error

      await supabase
        .from('user_engines')
        .update({ 
          api_key: newKey,
          api_key_created_at: new Date().toISOString() 
        })
        .eq('id', id)

      toast.success('API key regenerated successfully')
      loadUserEngines()
    } catch (error) {
      console.error('Error regenerating API key:', error)
      toast.error(`Failed to regenerate key: ${error.message}`)
    }
  }

  // Toggle status
  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
      const { error } = await supabase
        .from('user_engines')
        .update({ status: newStatus })
        .eq('id', id)

      if (error) throw error
      toast.success(`Engine ${newStatus === 'active' ? 'activated' : 'deactivated'}`)
      loadUserEngines()
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error(`Failed to update status: ${error.message}`)
    }
  }

  // Handle edit user engine
  const handleEditUserEngine = (userEngine) => {
    console.log('🔍 Editing user engine:', userEngine)
    console.log('🔍 Engine data:', userEngine.ai_engines)
    
    setEditingUserEngine(userEngine)
    setEditData({
      ...userEngine,
      // Use the engine's workflow data
      nodes: userEngine.ai_engines?.nodes || [],
      edges: userEngine.ai_engines?.edges || [],
      models: userEngine.ai_engines?.models || [],
      execution_mode: userEngine.ai_engines?.execution_mode || 'sequential',
      tier: userEngine.ai_engines?.tier || 'starter'
    })
  }

  // Save user engine changes
  const handleSaveUserEngine = async () => {
    try {
      const { error } = await supabase
        .from('user_engines')
        .update({
          name: editData.name,
          description: editData.description,
          nodes: editData.nodes, // Save the updated nodes
          status: editData.status
        })
        .eq('id', editingUserEngine.id)

      if (error) throw error
      toast.success('User engine updated successfully')
      setEditingUserEngine(null)
      setEditData({})
      loadUserEngines()
    } catch (error) {
      console.error('Error updating user engine:', error)
      toast.error(`Failed to update user engine: ${error.message}`)
    }
  }

  // Handle edit node
  const handleEditNode = (node, nodeIndex) => {
    setEditingNode({ node, nodeIndex })
    setNodeEditData({
      ...node,
      aiModel: node.data?.aiModel || null
    })
  }

  // Save node changes
  const handleSaveNode = () => {
    const updatedNodes = [...editData.nodes]
    updatedNodes[nodeEditData.nodeIndex] = {
      ...updatedNodes[nodeEditData.nodeIndex],
      data: {
        ...updatedNodes[nodeEditData.nodeIndex].data,
        aiModel: nodeEditData.aiModel
      }
    }
    
    setEditData({ ...editData, nodes: updatedNodes })
    setEditingNode(null)
    setNodeEditData({})
    toast.success('Node AI model updated')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-gray-800 rounded-lg p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by user name, email, or engine..."
            className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Filter dropdowns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Engine filter */}
          <select
            value={filterEngine}
            onChange={(e) => setFilterEngine(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Engines</option>
            {engines.map(engine => (
              <option key={engine.id} value={engine.id}>{engine.name}</option>
            ))}
          </select>

          {/* Level filter */}
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Levels</option>
            {levels.map(level => (
              <option key={level.id} value={level.id}>{level.display_name || level.name}</option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {/* Results count */}
        <div className="text-sm text-gray-400">
          Showing {filteredUserEngines.length} of {userEngines.length} user engines
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Engine
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  API Key
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredUserEngines.map(ue => (
                <tr key={ue.id} className="hover:bg-gray-750 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-white">{ue.users?.full_name || 'Unknown'}</div>
                      <div className="text-xs text-gray-400">{ue.users?.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{ue.ai_engines?.name || ue.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-900 text-blue-200">
                      {ue.users?.levels?.display_name || ue.users?.levels?.name || 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <code className="text-xs text-gray-300 font-mono">
                        {revealedKeys[ue.id] ? ue.api_key : '••••••••••••••••'}
                      </code>
                      <button
                        onClick={() => toggleKeyVisibility(ue.id)}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                      >
                        {revealedKeys[ue.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => copyAPIKey(ue.api_key)}
                        className="p-1 text-gray-400 hover:text-white transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleStatus(ue.id, ue.status)}
                      className="flex items-center gap-1"
                    >
                      {ue.status === 'active' ? (
                        <span className="flex items-center gap-1 text-green-400 text-sm">
                          <CheckCircle className="w-4 h-4" />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-gray-400 text-sm">
                          <XCircle className="w-4 h-4" />
                          Inactive
                        </span>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {new Date(ue.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEditUserEngine(ue)}
                        className="p-2 text-green-400 hover:text-green-300 transition-colors"
                        title="Edit User Engine"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRegenerateKey(ue.id, ue.user_id, ue.engine_id, ue.users?.full_name)}
                        className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                        title="Regenerate API Key"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(ue.id, ue.users?.full_name)}
                        className="p-2 text-red-400 hover:text-red-300 transition-colors"
                        title="Remove Access"
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

        {filteredUserEngines.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No user engines found</p>
          </div>
        )}
      </div>

      {/* Edit User Engine Modal */}
      {editingUserEngine && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-slate-600/50 backdrop-blur-xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 p-6 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/30 via-emerald-500/30 to-teal-500/30"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                      <Edit className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold mb-1">Edit User Engine</h2>
                      <p className="text-sm text-green-100">{editingUserEngine.users?.full_name} - {editingUserEngine.ai_engines?.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setEditingUserEngine(null)
                      setEditData({})
                    }}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="bg-slate-800/50 border border-slate-600 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Basic Configuration</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">Name</label>
                      <input
                        type="text"
                        value={editData.name || ''}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">Status</label>
                      <select
                        value={editData.status || 'active'}
                        onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-bold text-gray-300 mb-2">Description</label>
                    <textarea
                      value={editData.description || ''}
                      onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>

                {/* Engine Flow Diagram */}
                <div className="bg-slate-800/50 border border-slate-600 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                    <Brain className="w-5 h-5" />
                    <span>Engine Flow Configuration</span>
                  </h3>
                  
                  {editData.nodes && editData.nodes.length > 0 ? (
                    <div className="space-y-4">
                      {/* Flow Diagram */}
                      <div className="bg-slate-900/50 rounded-xl p-4">
                        <h5 className="text-sm font-bold text-gray-300 mb-3">Workflow Nodes</h5>
                        <div className="flex flex-wrap gap-4">
                          {editData.nodes.map((node, index) => (
                            <div key={node.id || index} className="relative">
                              {/* Node Card */}
                              <div className="bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 rounded-xl p-4 min-w-[200px] hover:border-green-500/50 transition-all cursor-pointer"
                                   onClick={() => handleEditNode(node, index)}>
                                <div className="flex items-center space-x-3 mb-2">
                                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                                    <Brain className="w-4 h-4 text-white" />
                                  </div>
                                  <div>
                                    <div className="font-bold text-white text-sm">{node.data?.label || `Node ${index + 1}`}</div>
                                    <div className="text-xs text-gray-400">{node.type}</div>
                                  </div>
                                </div>
                                
                                {/* Current AI Model */}
                                {node.data?.aiModel ? (
                                  <div className="bg-slate-800/50 rounded-lg p-2">
                                    <div className="text-xs text-gray-300 font-medium">{node.data.aiModel.name}</div>
                                    <div className="text-xs text-gray-500">{node.data.aiModel.provider}</div>
                                  </div>
                                ) : (
                                  <div className="bg-red-900/30 border border-red-500/30 rounded-lg p-2">
                                    <div className="text-xs text-red-300">No AI Model</div>
                                  </div>
                                )}
                                
                                {/* Edit Indicator */}
                                <div className="absolute top-2 right-2">
                                  <Edit className="w-3 h-3 text-gray-400" />
                                </div>
                              </div>
                              
                              {/* Connection Arrow */}
                              {index < editData.nodes.length - 1 && (
                                <div className="flex justify-center my-2">
                                  <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-400"></div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Instructions */}
                      <div className="bg-blue-900/30 border border-blue-500/30 rounded-xl p-4">
                        <h6 className="text-sm font-bold text-blue-300 mb-2">How to Edit AI Models</h6>
                        <ul className="text-xs text-blue-200 space-y-1">
                          <li>• Click on any node card above to edit its AI model</li>
                          <li>• Each node can have different AI models and settings</li>
                          <li>• Changes are saved automatically when you close the node editor</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No workflow nodes found</p>
                      <p className="text-xs mt-2">This engine may not have a proper workflow configuration</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-800/30 border-t border-slate-600/50 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-end space-x-4">
                <button
                  onClick={() => {
                    setEditingUserEngine(null)
                    setEditData({})
                  }}
                  className="px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveUserEngine}
                  disabled={loading}
                  className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Node Edit Modal */}
      {editingNode && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-slate-600/50 backdrop-blur-xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 p-6 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-pink-500/30 to-red-500/30"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold mb-1">Edit Node AI Model</h2>
                      <p className="text-sm text-purple-100">{nodeEditData.data?.label || `Node ${editingNode.nodeIndex + 1}`}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setEditingNode(null)
                      setNodeEditData({})
                    }}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              <div className="space-y-6">
                {/* Current AI Model */}
                <div className="bg-slate-800/50 border border-slate-600 rounded-xl p-4">
                  <h3 className="text-lg font-bold text-white mb-4">Current AI Model</h3>
                  {nodeEditData.aiModel ? (
                    <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-xl p-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                          <Brain className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-bold text-white">{nodeEditData.aiModel.name}</div>
                          <div className="text-xs text-gray-400">{nodeEditData.aiModel.provider}</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-red-900/30 border border-red-500/30 rounded-xl p-4">
                      <div className="text-center text-red-300">No AI Model Configured</div>
                    </div>
                  )}
                </div>

                {/* Select New AI Model */}
                <div className="bg-slate-800/50 border border-slate-600 rounded-xl p-4">
                  <h3 className="text-lg font-bold text-white mb-4">Select AI Model</h3>
                  
                  {/* Provider Selection */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Select Provider</label>
                    <select
                      value={selectedProvider}
                      onChange={(e) => {
                        setSelectedProvider(e.target.value)
                        if (e.target.value) {
                          loadModelsForProvider(e.target.value)
                        }
                      }}
                      className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Choose a provider...</option>
                      {providers.map(provider => (
                        <option key={provider} value={provider}>{provider}</option>
                      ))}
                    </select>
                  </div>
                  
                  {/* Filtered Models */}
                  {selectedProvider && (
                    <div className="grid grid-cols-1 gap-3">
                      {availableModels.map((model) => (
                        <div key={model.id} className="bg-slate-800/50 rounded-lg p-3 hover:bg-slate-700/50 transition-colors cursor-pointer border border-slate-600 hover:border-purple-500/50"
                             onClick={() => {
                               setNodeEditData({
                                 ...nodeEditData,
                                 aiModel: {
                                   id: model.id,
                                   name: model.name,
                                   provider: model.provider,
                                   temperature: 0.7,
                                   max_tokens: 2000,
                                   description: model.description
                                 }
                               })
                             }}>
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-bold text-white">{model.name}</div>
                              <div className="text-xs text-gray-400">{model.provider}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-green-400">
                                ${model.input_cost_per_million || 0}/1M tokens
                              </div>
                              <div className="text-xs text-gray-400">
                                {model.context_window_tokens || 0} context
                              </div>
                            </div>
                          </div>
                          {model.description && (
                            <div className="text-xs text-gray-500 mt-2 line-clamp-2">
                              {model.description}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {!selectedProvider && (
                    <div className="text-center py-8 text-gray-400">
                      <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Select a provider to see available models</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-slate-800/30 border-t border-slate-600/50 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-end space-x-4">
                <button
                  onClick={() => {
                    setEditingNode(null)
                    setNodeEditData({})
                  }}
                  className="px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNode}
                  className="px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors flex items-center space-x-2"
                >
                  <span>Save Node</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserEnginesList

