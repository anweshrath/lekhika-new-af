import React, { useState, useEffect } from 'react'
import { 
  X, Users, Crown, Check, Plus, Search, User, Shield, Zap, Target,
  Layers, Clock, Brain, Cpu, Database, Globe, Activity, BarChart3,
  ChevronDown, ChevronUp, Sparkles, Rocket, Star, TrendingUp,
  Edit, Trash2, Copy, Key, Eye, EyeOff, RefreshCw, Settings,
  AlertTriangle, CheckCircle, XCircle, Play, Pause, MoreVertical,
  ArrowRight, ArrowLeft, Filter, SortAsc, SortDesc, Download,
  Upload, Save, Loader2, ExternalLink, Lock, Unlock
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useSuperAdmin } from '../../contexts/SuperAdminContext'
import toast from 'react-hot-toast'

const EpicEngineAssignmentModal = ({ engine, onClose, onAssign }) => {
  const { getSuperAdminUserId } = useSuperAdmin()
  const [activeTab, setActiveTab] = useState('sub-engines')
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')
  
  // Sub-engines state
  const [subEngines, setSubEngines] = useState([])
  const [subEnginesLoading, setSubEnginesLoading] = useState(false)
  
  // Level assignment state
  const [levels, setLevels] = useState([])
  const [selectedLevels, setSelectedLevels] = useState([])
  const [levelAssignments, setLevelAssignments] = useState([])
  const [levelsLoading, setLevelsLoading] = useState(false)
  
  // User assignment state
  const [users, setUsers] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [userAssignments, setUserAssignments] = useState([])
  const [usersLoading, setUsersLoading] = useState(false)
  
  // Engine editing state
  const [editMode, setEditMode] = useState(false)
  const [editedEngine, setEditedEngine] = useState({ ...engine })

  // Load full engine data when modal opens
  useEffect(() => {
    const loadEngineData = async () => {
      if (engine?.id && (!engine.nodes || engine.nodes.length === 0)) {
        try {
          const { data, error } = await supabase
            .from('ai_engines')
            .select('*')
            .eq('id', engine.id)
            .single()

          if (error) throw error
          
          setEditedEngine(data)
          console.log('🔍 Loaded full engine data:', data)
        } catch (error) {
          console.error('Error loading engine data:', error)
          toast.error('Failed to load engine data')
        }
      }
    }

    loadEngineData()
  }, [engine?.id])
  
  // AI Models state
  const [availableModels, setAvailableModels] = useState([])
  const [modelsLoading, setModelsLoading] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState('')
  const [providers, setProviders] = useState([])
  const [nodeProviderStates, setNodeProviderStates] = useState({})
  
  // Sub-engine editing state
  const [editingSubEngine, setEditingSubEngine] = useState(null)
  const [subEngineEditData, setSubEngineEditData] = useState({})

  // Get filtered models by selected provider FOR SPECIFIC NODE
  const getFilteredModels = (nodeId) => {
    const nodeProvider = nodeProviderStates[nodeId]
    if (!nodeProvider) return []
    return availableModels.filter(model => model.key_name === nodeProvider)
  }

  // Extract AI nodes from engine workflow
  const getAINodesFromEngine = () => {
    if (!editedEngine.nodes || editedEngine.nodes.length === 0) return []
    
    return editedEngine.nodes
      .filter(node => node.data?.aiEnabled)
      .map(node => ({
        id: node.id,
        name: node.data?.label || node.data?.name || 'Unnamed Node',
        type: node.type,
        selectedModels: node.data?.selectedModels || [],
        temperature: node.data?.temperature || 0.7,
        maxTokens: node.data?.maxTokens || 2000,
        systemPrompt: node.data?.systemPrompt || '',
        userPrompt: node.data?.userPrompt || node.data?.promptTemplate || '',
        instructions: node.data?.instructions || node.data?.additionalInstructions || '',
        estimatedTokens: node.data?.estimatedTokens || 1000
      }))
  }

  // Extract AI nodes from sub-engine workflow
  const getAINodesFromSubEngine = () => {
    if (!subEngineEditData.nodes || subEngineEditData.nodes.length === 0) return []
    
    return subEngineEditData.nodes
      .filter(node => node.data?.aiEnabled)
      .map(node => ({
        id: node.id,
        name: node.data?.label || node.data?.name || 'Unnamed Node',
        type: node.type,
        selectedModels: node.data?.selectedModels || [],
        temperature: node.data?.temperature || 0.7,
        maxTokens: node.data?.maxTokens || 2000,
        systemPrompt: node.data?.systemPrompt || '',
        userPrompt: node.data?.userPrompt || node.data?.promptTemplate || '',
        instructions: node.data?.instructions || node.data?.additionalInstructions || '',
        estimatedTokens: node.data?.estimatedTokens || 1000
      }))
  }

  // Get default AI model for display
  const getDefaultAIModel = () => {
    const aiNodes = getAINodesFromEngine()
    if (aiNodes.length === 0) return null
    
    const firstNode = aiNodes[0]
    if (firstNode.selectedModels.length === 0) return null
    
    // Parse first model: "providerKey:modelId"
    const [providerKey, modelId] = firstNode.selectedModels[0].split(':')
    return {
      provider: providerKey,
      model: modelId,
      temperature: firstNode.temperature,
      max_tokens: firstNode.maxTokens,
      name: `${providerKey} - ${modelId}`
    }
  }
  const loadAIModels = async () => {
    try {
      setModelsLoading(true)
      
      // First, load AI providers from ai_providers table
      const { data: providersData, error: providersError } = await supabase
        .from('ai_providers')
        .select('*')
        .eq('is_active', true)

      if (providersError) throw providersError
      
      // Then, load AI models from ai_model_metadata table
      const { data: modelsData, error: modelsError } = await supabase
        .from('ai_model_metadata')
        .select('*')
        .eq('is_active', true)
        .order('provider', { ascending: true })
        .order('model_name', { ascending: true })

      if (modelsError) throw modelsError
      
      setAvailableModels(modelsData || [])
      
      // Extract unique providers from ai_providers table
      const uniqueProviders = providersData?.map(provider => provider.name) || []
      setProviders(uniqueProviders)
      
      // Set first provider as default
      if (uniqueProviders.length > 0 && !selectedProvider) {
        setSelectedProvider(uniqueProviders[0])
      }
    } catch (error) {
      console.error('Error loading AI providers and models:', error)
      toast.error('Failed to load AI providers and models')
    } finally {
      setModelsLoading(false)
    }
  }
  const loadSubEngines = async () => {
    try {
      setSubEnginesLoading(true)
      const { data, error } = await supabase
        .from('user_engines')
        .select(`
          *,
          users!inner(id, full_name, email, username, tier)
        `)
        .eq('engine_id', engine.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSubEngines(data || [])
    } catch (error) {
      console.error('Error loading sub-engines:', error)
      toast.error('Failed to load sub-engines')
    } finally {
      setSubEnginesLoading(false)
    }
  }

  // Load levels
  const loadLevels = async () => {
    try {
      setLevelsLoading(true)
      console.log('🔄 Loading levels from database...')
      
      const { data, error } = await supabase
        .from('levels')
        .select('*')
        .order('name', { ascending: true })

      console.log('📊 Levels query result:', { data, error })

      if (error) {
        console.error('❌ Error loading levels:', error)
        throw error
      }
      
      console.log('✅ Loaded levels:', data)
      setLevels(data || [])
    } catch (error) {
      console.error('❌ Error loading levels:', error)
      toast.error(`Failed to load levels: ${error.message}`)
    } finally {
      setLevelsLoading(false)
    }
  }

  // Load users
  const loadUsers = async () => {
    try {
      setUsersLoading(true)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(100)

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Failed to load users')
    } finally {
      setUsersLoading(false)
    }
  }

  // Load existing assignments
  const loadAssignments = async () => {
    try {
      console.log('🔄 Loading assignments for engine:', engine.id)
      
      // Load level assignments from level_engines table
      const { data: levelData, error: levelError } = await supabase
        .from('level_engines')
        .select(`
          id,
          level_id,
          engine_id,
          access_type,
          created_at,
          levels (id, name, display_name, tier_level)
        `)
        .eq('engine_id', engine.id)

      console.log('📊 Level assignments query result:', { levelData, levelError })

      if (levelError) {
        console.error('❌ Error loading level assignments:', levelError)
        throw levelError
      }

      // Load user assignments from user_engines table
      const { data: userData, error: userError } = await supabase
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
          users (id, full_name, email, level_id)
        `)
        .eq('engine_id', engine.id)

      console.log('📊 User assignments query result:', { userData, userError })

      if (userError) {
        console.error('❌ Error loading user assignments:', userError)
        throw userError
      }

      console.log('✅ Loaded assignments:', { levelData, userData })
      setLevelAssignments(levelData || [])
      setUserAssignments(userData || [])
    } catch (error) {
      console.error('❌ Error loading assignments:', error)
      toast.error(`Failed to load assignments: ${error.message}`)
    }
  }

  useEffect(() => {
    loadSubEngines()
    loadLevels()
    loadUsers()
    loadAssignments()
    loadAIModels()
  }, [engine.id])

  // Handle level assignment
  const handleLevelAssignment = async (levelId, assign) => {
    try {
      setLoading(true)

      if (assign) {
        // Assign engine to level using direct insert
        // This will trigger auto-assignment to all users with this level
        const { error } = await supabase
          .from('level_engines')
          .insert([{
            level_id: levelId,
            engine_id: engine.id,
            access_type: 'execute'
          }])

        if (error) throw error
        toast.success('Engine assigned to level and all users in that level')
      } else {
        // Remove assignment from level
        const { error } = await supabase
          .from('level_engines')
          .delete()
          .eq('level_id', levelId)
          .eq('engine_id', engine.id)

        if (error) throw error
        toast.success('Engine unassigned from level')
      }

      loadAssignments()
      loadSubEngines()
    } catch (error) {
      console.error('Error updating level assignment:', error)
      toast.error(`Failed to update level assignment: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Handle user assignment
  const handleUserAssignment = async (userId, assign) => {
    try {
      setLoading(true)

      if (assign) {
        // Assign engine to user using RPC function
        const { data: apiKey, error: assignError } = await supabase
          .rpc('assign_engine_to_user', {
            p_user_id: userId,
            p_engine_id: engine.id,
            p_assigned_by: getSuperAdminUserId()
          })

        if (assignError) throw assignError

        toast.success(`Engine assigned to user successfully! API Key: ${apiKey}`)
        console.log('🔑 Generated API Key:', apiKey)
      } else {
        // Remove assignment
        const { error: removeError } = await supabase
          .from('user_engines')
          .delete()
          .eq('user_id', userId)
          .eq('engine_id', engine.id)

        if (removeError) throw removeError
        toast.success('Engine unassigned from user')
      }

      loadAssignments()
      loadSubEngines()
    } catch (error) {
      console.error('Error updating user assignment:', error)
      toast.error('Failed to update user assignment')
    } finally {
      setLoading(false)
    }
  }

  // Handle sub-engine editing
  const handleEditSubEngine = (subEngine) => {
    setEditingSubEngine(subEngine)
    setSubEngineEditData({ ...subEngine })
  }

  const handleSaveSubEngine = async () => {
    try {
      // Only validate that nodes have at least one model - don't check if deactivated
      const aiNodes = getAINodesFromSubEngine()
      const invalidNodes = aiNodes.filter(node => node.selectedModels.length === 0)
      
      if (invalidNodes.length > 0) {
        const nodeNames = invalidNodes.map(n => n.name).join(', ')
        toast.error(`These nodes need at least one AI model: ${nodeNames}`)
        return
      }
      
      setLoading(true)
      
      // Strip out id, user_id, and joined data (users)
      const { id, user_id, users, ...updateData } = subEngineEditData
      
      const { error } = await supabase
        .from('user_engines')
        .update(updateData)
        .eq('id', editingSubEngine.id)

      if (error) throw error
      
      toast.success('Sub-engine updated successfully!')
      setEditingSubEngine(null)
      setSubEngineEditData({})
      loadSubEngines()
    } catch (error) {
      console.error('Error updating sub-engine:', error)
      toast.error(`Failed to update sub-engine: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Handle delete sub-engine (user engine)
  const handleDeleteSubEngine = async (subEngine) => {
    try {
      const confirmDelete = window.confirm(`Delete user engine "${subEngine.name}" for ${subEngine.users?.email}? This cannot be undone.`)
      if (!confirmDelete) return
      setLoading(true)
      const { error } = await supabase
        .from('user_engines')
        .delete()
        .eq('id', subEngine.id)
      if (error) throw error
      toast.success('User engine deleted')
      loadSubEngines()
      loadAssignments()
    } catch (e) {
      console.error('Delete user engine failed:', e)
      toast.error('Failed to delete user engine')
    } finally {
      setLoading(false)
    }
  }
  const handleEngineEdit = async () => {
    try {
      // Only validate that nodes have at least one model - don't check if deactivated
      const aiNodes = getAINodesFromEngine()
      const invalidNodes = aiNodes.filter(node => node.selectedModels.length === 0)
      
      if (invalidNodes.length > 0) {
        const nodeNames = invalidNodes.map(n => n.name).join(', ')
        toast.error(`These nodes need at least one AI model: ${nodeNames}`)
        return
      }
      
      setLoading(true)
      
      const { error } = await supabase
        .from('ai_engines')
        .update(editedEngine)
        .eq('id', engine.id)

      if (error) throw error
      
      // Cascade default status to all sub-engines
      if (editedEngine.is_default !== undefined) {
        await supabase
          .from('user_engines')
          .update({
            is_default: editedEngine.is_default,
            default_order: editedEngine.default_order
          })
          .eq('engine_id', engine.id)
      }
      toast.success('Engine updated successfully!')
      setEditMode(false)
      onAssign() // Refresh parent
    } catch (error) {
      console.error('Error updating engine:', error)
      toast.error(`Failed to update engine: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Check if level is assigned
  const isLevelAssigned = (levelId) => {
    return levelAssignments.some(assignment => assignment.level_id === levelId)
  }

  // Check if user is assigned
  const isUserAssigned = (userId) => {
    return userAssignments.some(assignment => assignment.user_id === userId)
  }

  // Copy API key to clipboard
  const copyAPIKey = (apiKey) => {
    navigator.clipboard.writeText(apiKey)
    toast.success('API Key copied to clipboard!')
  }

  // Get tier color
  const getTierColor = (tier) => {
    switch (tier) {
      case 'starter': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'pro': return 'bg-purple-100 text-purple-800 border-purple-300'
      case 'enterprise': return 'bg-orange-100 text-orange-800 border-orange-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  // Get status color
  const getStatusColor = (isActive) => {
    return isActive ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'
  }

  // Filter data based on search
  const filteredLevels = levels.filter(level =>
    level.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    level.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredSubEngines = subEngines.filter(subEngine =>
    subEngine.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subEngine.users?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subEngine.users?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Sort data
  const sortData = (data, sortBy, sortOrder) => {
    return [...data].sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]
      
      if (sortBy === 'users') {
        aValue = a.users?.full_name || ''
        bValue = b.users?.full_name || ''
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }

  const sortedLevels = sortData(filteredLevels, sortBy, sortOrder)
  const sortedUsers = sortData(filteredUsers, sortBy, sortOrder)
  const sortedSubEngines = sortData(filteredSubEngines, sortBy, sortOrder)

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-slate-600/50 backdrop-blur-xl">
        {/* FUTURISTIC Header */}
        <div className="bg-gradient-to-r from-orange-600 via-red-600 to-purple-600 p-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/30 via-red-500/30 to-purple-500/30"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                  <Brain className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-1 flex items-center space-x-2">
                    <span>{engine.name}</span>
                    <Sparkles className="w-5 h-5 text-yellow-300" />
                  </h2>
                  <div className="flex items-center space-x-3 text-sm">
                    <span className="font-mono bg-white/20 px-2 py-1 rounded-lg text-xs">
                      {engine.id?.slice(0, 8)}...
                    </span>
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getStatusColor(engine.is_active !== false && engine.status !== 'inactive')}`}>
                      {engine.is_active !== false && engine.status !== 'inactive' ? 'Active' : 'Inactive'}
                    </span>
                    {engine.tier && (
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${getTierColor(engine.tier)}`}>
                        {engine.tier?.toUpperCase()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-white hover:bg-white/20 rounded-xl transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* FUTURISTIC Tabs */}
        <div className="bg-slate-800/30 border-b border-slate-600/50 backdrop-blur-sm">
          <div className="flex">
            {[
              { id: 'sub-engines', label: 'Sub-Engines', icon: Layers, count: subEngines.length },
              { id: 'levels', label: 'Level Assignment', icon: Crown, count: levelAssignments.length },
              { id: 'users', label: 'User Assignment', icon: Users, count: userAssignments.length },
              { id: 'edit', label: 'Edit Engine', icon: Edit, count: null },
              { id: 'cost', label: 'Cost Estimation', icon: BarChart3, count: null }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 px-4 py-3 text-sm font-bold transition-all relative ${
                  activeTab === tab.id
                    ? 'text-orange-400 bg-orange-500/10 border-b-2 border-orange-400'
                    : 'text-gray-400 hover:text-white hover:bg-slate-700/30'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  <tab.icon className="w-4 h-4" />
                  <span className="text-xs">{tab.label}</span>
                  {tab.count !== null && (
                    <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
                      activeTab === tab.id ? 'bg-orange-500 text-white' : 'bg-slate-600 text-gray-300'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[50vh] overflow-y-auto">
          {/* Search and Controls */}
          <div className="mb-4 flex items-center justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              >
                <option value="created_at">Date</option>
                <option value="name">Name</option>
                {activeTab === 'users' && <option value="tier">Tier</option>}
              </select>
              
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white hover:bg-slate-700/50 transition-colors"
              >
                {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Sub-Engines Tab */}
          {activeTab === 'sub-engines' && (
            <div className="space-y-3">
              {subEnginesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
                  <span className="ml-2 text-gray-400 text-sm">Loading...</span>
                </div>
              ) : sortedSubEngines.length === 0 ? (
                <div className="text-center py-8">
                  <Layers className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-bold text-white mb-1">No Sub-Engines</h3>
                  <p className="text-gray-400 text-sm">Engine not assigned to users yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sortedSubEngines.map((subEngine) => (
                    <div
                      key={subEngine.id}
                      className="bg-slate-800/30 border border-slate-600/30 rounded-lg p-4 hover:border-orange-500/50 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-white">{subEngine.name}</h3>
                            <p className="text-gray-400 text-xs">
                              {subEngine.users?.full_name || subEngine.users?.email}
                              {subEngine.users?.tier && (
                                <span className={`ml-2 px-1.5 py-0.5 rounded text-xs font-bold ${getTierColor(subEngine.users.tier)}`}>
                                  {subEngine.users.tier.toUpperCase()}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          {subEngine.api_key && (
                            <div className="flex items-center space-x-1">
                              <code className="text-xs bg-slate-900 px-2 py-1 rounded text-orange-400 font-mono">
                                {subEngine.api_key.slice(0, 12)}...
                              </code>
                              <button
                                onClick={() => copyAPIKey(subEngine.api_key)}
                                className="p-1 text-gray-400 hover:text-orange-400 transition-colors"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                          
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(subEngine.status === 'active')}`}>
                            {subEngine.status}
                          </span>
                          
                          <button
                            onClick={() => handleEditSubEngine(subEngine)}
                            className="p-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                            title="Edit Sub-Engine"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSubEngine(subEngine)}
                            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                            title="Delete Sub-Engine"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Level Assignment Tab */}
          {activeTab === 'levels' && (
            <div className="space-y-4">
              {levelsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
                  <span className="ml-3 text-gray-400">Loading levels...</span>
                </div>
              ) : sortedLevels.length === 0 ? (
                <div className="text-center py-12">
                  <Crown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Levels Found</h3>
                  <p className="text-gray-400">Create some levels first to assign engines</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {sortedLevels.map((level) => {
                    const isAssigned = isLevelAssigned(level.id)
                    return (
                      <div
                        key={level.id}
                        className={`border rounded-xl p-6 transition-all ${
                          isAssigned 
                            ? 'bg-green-900/20 border-green-500/50' 
                            : 'bg-slate-800/50 border-slate-600 hover:border-orange-500/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              isAssigned 
                                ? 'bg-gradient-to-r from-green-500 to-green-600' 
                                : 'bg-gradient-to-r from-purple-500 to-pink-600'
                            }`}>
                              <Crown className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                                <span>{level.name}</span>
                                {isAssigned && (
                                  <span className="text-green-400 text-sm font-bold">(Already Assigned)</span>
                                )}
                              </h3>
                              <p className="text-gray-400">
                                Level ID: {level.level_id} • {level.description || 'No description'}
                              </p>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleLevelAssignment(level.id, !isAssigned)}
                            disabled={loading}
                            className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                              isAssigned
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-orange-600 text-white hover:bg-orange-700'
                            }`}
                          >
                            {isAssigned ? 'Unassign' : 'Assign to Level'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* User Assignment Tab */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              {usersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
                  <span className="ml-3 text-gray-400">Loading users...</span>
                </div>
              ) : sortedUsers.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No Users Found</h3>
                  <p className="text-gray-400">No active users available for assignment</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {sortedUsers.map((user) => {
                    const isAssigned = isUserAssigned(user.id)
                    return (
                      <div
                        key={user.id}
                        className={`border rounded-xl p-6 transition-all ${
                          isAssigned 
                            ? 'bg-green-900/20 border-green-500/50' 
                            : 'bg-slate-800/50 border-slate-600 hover:border-orange-500/50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                              isAssigned 
                                ? 'bg-gradient-to-r from-green-500 to-green-600' 
                                : 'bg-gradient-to-r from-blue-500 to-cyan-600'
                            }`}>
                              <User className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                                <span>{user.full_name || user.username || 'Unnamed User'}</span>
                                {isAssigned && (
                                  <span className="text-green-400 text-sm font-bold">(Already Assigned)</span>
                                )}
                              </h3>
                              <p className="text-gray-400">
                                {user.email} • @{user.username}
                                {user.tier && (
                                  <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${getTierColor(user.tier)}`}>
                                    {user.tier.toUpperCase()}
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                          
                          <button
                            onClick={() => handleUserAssignment(user.id, !isAssigned)}
                            disabled={loading}
                            className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                              isAssigned
                                ? 'bg-red-600 text-white hover:bg-red-700'
                                : 'bg-orange-600 text-white hover:bg-orange-700'
                            }`}
                          >
                            {isAssigned ? 'Unassign' : 'Assign to User'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Edit Engine Tab */}
          {activeTab === 'edit' && (
            <div className="space-y-6">
              <div className="bg-slate-800/50 border border-slate-600 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                  <Edit className="w-5 h-5" />
                  <span>Engine Configuration</span>
                </h3>
                
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Engine Name</label>
                    <input
                      type="text"
                      value={editedEngine.name || ''}
                      onChange={(e) => setEditedEngine({ ...editedEngine, name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-bold text-gray-300 mb-2">Description</label>
                    <textarea
                      value={editedEngine.description || ''}
                      onChange={(e) => setEditedEngine({ ...editedEngine, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={editedEngine.is_active !== false && editedEngine.status !== 'inactive'}
                        onChange={(e) => {
                          const isActive = e.target.checked
                          setEditedEngine({ 
                            ...editedEngine, 
                            is_active: isActive,
                            status: isActive ? 'active' : 'inactive'
                          })
                        }}
                        className="w-4 h-4 text-orange-600 bg-slate-900 border-slate-600 rounded focus:ring-orange-500"
                      />
                      <span className="text-white font-bold">
                        {editedEngine.is_active !== false && editedEngine.status !== 'inactive' ? 'Active' : 'Inactive'}
                      </span>
                    </label>
                    
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={editedEngine.is_default === true}
                        onChange={async (e) => {
                          const isDefault = e.target.checked
                          if (isDefault) {
                            // Query existing defaults to find next available slot
                            const { data, error } = await supabase
                              .from('ai_engines')
                              .select('default_order')
                              .eq('is_default', true)
                              .order('default_order', { ascending: true })
                            
                            if (error) {
                              toast.error('Failed to check existing defaults')
                              return
                            }
                            
                            // Find first available slot 1-10
                            let nextOrder = 1
                            const usedOrders = data.map(d => d.default_order).filter(o => o !== null)
                            for (let i = 1; i <= 10; i++) {
                              if (!usedOrders.includes(i)) {
                                nextOrder = i
                                break
                              }
                            }
                            
                            if (nextOrder > 10 || usedOrders.length >= 10) {
                              toast.error('Maximum 10 default engines allowed. Please unset an existing default first.')
                              return
                            }
                            
                            setEditedEngine({ 
                              ...editedEngine, 
                              is_default: true,
                              default_order: nextOrder
                            })
                            toast.success(`Set as default #${nextOrder}`)
                          } else {
                            setEditedEngine({ 
                              ...editedEngine, 
                              is_default: false,
                              default_order: null
                            })
                          }
                        }}
                        className="w-4 h-4 text-orange-600 bg-slate-900 border-slate-600 rounded focus:ring-orange-500"
                      />
                      <span className="text-white font-bold flex items-center space-x-2">
                        <span>Default Engine</span>
                        {editedEngine.is_default && editedEngine.default_order && (
                          <span className="text-xs px-2 py-1 bg-orange-600 text-white rounded">#{editedEngine.default_order}</span>
                        )}
                      </span>
                    </label>
                  </div>
                </div>
                
                {/* AI Models Section */}
                <div className="mt-8">
                  <h4 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                    <Brain className="w-5 h-5" />
                    <span>AI Workflow Nodes</span>
                  </h4>
                  
                  {modelsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-orange-400" />
                      <span className="ml-2 text-gray-400">Loading AI models...</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* AI Nodes from Workflow */}
                      {getAINodesFromEngine().length > 0 ? (
                        <div className="space-y-4">
                          {getAINodesFromEngine().map((aiNode, index) => (
                            <div key={aiNode.id} className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-600 rounded-xl p-5 hover:border-orange-500/50 transition-all shadow-lg">
                              {/* Node Header */}
                              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-600">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <div className="font-bold text-white text-lg">{aiNode.name}</div>
                                    <div className="text-xs text-gray-400">{aiNode.type}</div>
                                  </div>
                                </div>
                                <div className="text-xs px-3 py-1 bg-orange-600/20 text-orange-400 rounded-full border border-orange-500/30">
                                  {aiNode.selectedModels.length} Model{aiNode.selectedModels.length !== 1 ? 's' : ''}
                                </div>
                              </div>
                              
                              {/* Selected Models */}
                              <div className="space-y-2 mb-4">
                                {aiNode.selectedModels.length > 0 ? (
                                  aiNode.selectedModels.map((modelKey, idx) => {
                                    const [providerKey, modelId] = modelKey.split(':')
                                    const modelInfo = availableModels.find(m => m.key_name === providerKey && m.model_id === modelId)
                                    return (
                                      <div key={idx} className="flex items-center justify-between bg-gradient-to-r from-slate-700/70 to-slate-700/40 rounded-lg p-3 border border-slate-600/50">
                                        <div className="flex items-center space-x-3 flex-1">
                                          <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
                                            <Brain className="w-5 h-5 text-white" />
                                          </div>
                                          <div className="flex-1">
                                            <div className="font-bold text-white">{modelId}</div>
                                            <div className="text-xs text-gray-400">{providerKey}</div>
                                            {modelInfo && (
                                              <div className="text-xs text-green-400 mt-1">
                                                ${modelInfo.input_cost_per_million || 0}/1M tokens
                                              </div>
                                            )}
                                          </div>
                                          {modelInfo?.is_active === false && (
                                            <div className="text-xs px-2 py-1 bg-red-900/30 text-red-400 rounded border border-red-500/30">
                                              Inactive
                                            </div>
                                          )}
                                        </div>
                                        <button
                                          onClick={() => {
                                            const newNodes = [...editedEngine.nodes]
                                            const nodeIdx = newNodes.findIndex(n => n.id === aiNode.id)
                                            if (nodeIdx !== -1) {
                                              const updatedModels = aiNode.selectedModels.filter((_, i) => i !== idx)
                                              newNodes[nodeIdx] = {
                                                ...newNodes[nodeIdx],
                                                data: {
                                                  ...newNodes[nodeIdx].data,
                                                  selectedModels: updatedModels
                                                }
                                              }
                                              setEditedEngine({ ...editedEngine, nodes: newNodes })
                                              toast.success('Model removed')
                                            }
                                          }}
                                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all"
                                          title="Remove Model"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>
                                    )
                                  })
                                ) : (
                                  <div className="text-center py-4 px-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                                    <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-red-400" />
                                    <div className="text-sm font-bold text-red-400">No AI Model Selected</div>
                                    <div className="text-xs text-red-300 mt-1">This node requires at least one active AI model</div>
                                  </div>
                                )}
                                      
                                {/* Add Model Section */}
                                <div className="bg-gradient-to-r from-slate-700/30 to-slate-800/30 border border-slate-600 border-dashed rounded-lg p-3">
                                  <div className="flex items-center space-x-2 mb-3">
                                    <Plus className="w-4 h-4 text-orange-400" />
                                    <span className="text-sm font-bold text-gray-300">Add AI Model</span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    {/* Provider Selection */}
                                    <div>
                                      <label className="block text-xs font-medium text-gray-400 mb-1.5">Provider</label>
                                            <select
                                              value={nodeProviderStates[aiNode.id] || ''}
                                              onChange={(e) => {
                                                setNodeProviderStates({
                                                  ...nodeProviderStates,
                                                  [aiNode.id]: e.target.value
                                                })
                                              }}
                                              className="w-full px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                                            >
                                              <option value="">Select Provider</option>
                                              {providers.map((prov) => (
                                                <option key={prov} value={prov}>{prov}</option>
                                              ))}
                                            </select>
                                          </div>
                                          
                                          {/* Model Selection - Auto-loads when provider selected */}
                                          <div>
                                            <label className="block text-xs text-gray-400 mb-1">Model</label>
                                            {nodeProviderStates[aiNode.id] ? (
                                              <select
                                                onChange={(e) => {
                                                  if (e.target.value) {
                                                    const modelKey = e.target.value
                                                    const newNodes = [...editedEngine.nodes]
                                                    const nodeIdx = newNodes.findIndex(n => n.id === aiNode.id)
                                                    if (nodeIdx !== -1) {
                                                      const updatedModels = [...aiNode.selectedModels, modelKey]
                                                      newNodes[nodeIdx] = {
                                                        ...newNodes[nodeIdx],
                                                        data: {
                                                          ...newNodes[nodeIdx].data,
                                                          selectedModels: updatedModels
                                                        }
                                                      }
                                                      setEditedEngine({ ...editedEngine, nodes: newNodes })
                                                      // Clear this node's provider selection after adding model
                                                      setNodeProviderStates({
                                                        ...nodeProviderStates,
                                                        [aiNode.id]: ''
                                                      })
                                                      const model = getFilteredModels(aiNode.id).find(m => `${m.key_name}:${m.model_id}` === modelKey)
                                                      toast.success(`${model?.model_name || 'Model'} added`)
                                                    }
                                                  }
                                                }}
                                                className="w-full px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                                              >
                                                <option value="">Select Model</option>
                                                {getFilteredModels(aiNode.id)
                                                  .filter(model => model.is_active)
                                                  .map((model) => {
                                                    const modelKey = `${model.key_name}:${model.model_id}`
                                                    const alreadySelected = aiNode.selectedModels.includes(modelKey)
                                                    return (
                                                      <option 
                                                        key={model.id} 
                                                        value={modelKey}
                                                        disabled={alreadySelected}
                                                      >
                                                        {model.model_name} {alreadySelected ? '(Added)' : `($${model.input_cost_per_million || 0}/1M)`}
                                                      </option>
                                                    )
                                                  })}
                                              </select>
                                            ) : (
                                              <div className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-gray-500 text-xs">
                                                Select provider first
                                              </div>
                                            )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Node Settings */}
                                <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-600">
                                  <div>
                                    <label className="block text-xs text-gray-400 mb-1">Temperature</label>
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="range"
                                        min="0"
                                        max="2"
                                        step="0.1"
                                        value={aiNode.temperature}
                                        onChange={(e) => {
                                          const newNodes = [...editedEngine.nodes]
                                          const nodeIdx = newNodes.findIndex(n => n.id === aiNode.id)
                                          if (nodeIdx !== -1) {
                                            newNodes[nodeIdx] = {
                                              ...newNodes[nodeIdx],
                                              data: {
                                                ...newNodes[nodeIdx].data,
                                                temperature: parseFloat(e.target.value)
                                              }
                                            }
                                            setEditedEngine({ ...editedEngine, nodes: newNodes })
                                          }
                                        }}
                                        className="flex-1 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                                      />
                                      <span className="text-xs text-white font-mono w-10">{aiNode.temperature}</span>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <label className="block text-xs text-gray-400 mb-1">Max Tokens</label>
                                    <input
                                      type="number"
                                      value={aiNode.maxTokens}
                                      onChange={(e) => {
                                        const newNodes = [...editedEngine.nodes]
                                        const nodeIdx = newNodes.findIndex(n => n.id === aiNode.id)
                                        if (nodeIdx !== -1) {
                                          newNodes[nodeIdx] = {
                                            ...newNodes[nodeIdx],
                                            data: {
                                              ...newNodes[nodeIdx].data,
                                              maxTokens: parseInt(e.target.value)
                                            }
                                          }
                                          setEditedEngine({ ...editedEngine, nodes: newNodes })
                                        }
                                      }}
                                      min="100"
                                      max="8000"
                                      step="100"
                                      className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                                    />
                                  </div>
                                </div>
                                
                                {/* Prompt Fields */}
                                <div className="grid grid-cols-1 gap-3 mt-3 pt-3 border-t border-slate-600">
                                  <div>
                                    <label className="block text-xs font-bold text-gray-300 mb-1.5">System Prompt</label>
                                    <textarea
                                      value={aiNode.systemPrompt || ''}
                                      onChange={(e) => {
                                        const newNodes = [...editedEngine.nodes]
                                        const nodeIdx = newNodes.findIndex(n => n.id === aiNode.id)
                                        if (nodeIdx !== -1) {
                                          newNodes[nodeIdx] = {
                                            ...newNodes[nodeIdx],
                                            data: {
                                              ...newNodes[nodeIdx].data,
                                              systemPrompt: e.target.value
                                            }
                                          }
                                          setEditedEngine({ ...editedEngine, nodes: newNodes })
                                        }
                                      }}
                                      rows={3}
                                      placeholder="System-level instructions for the AI..."
                                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                                    />
                                  </div>
                                  
                                  <div>
                                    <label className="block text-xs font-bold text-gray-300 mb-1.5">User Prompt / Prompt Template</label>
                                    <textarea
                                      value={aiNode.userPrompt || ''}
                                      onChange={(e) => {
                                        const newNodes = [...editedEngine.nodes]
                                        const nodeIdx = newNodes.findIndex(n => n.id === aiNode.id)
                                        if (nodeIdx !== -1) {
                                          newNodes[nodeIdx] = {
                                            ...newNodes[nodeIdx],
                                            data: {
                                              ...newNodes[nodeIdx].data,
                                              userPrompt: e.target.value,
                                              promptTemplate: e.target.value
                                            }
                                          }
                                          setEditedEngine({ ...editedEngine, nodes: newNodes })
                                        }
                                      }}
                                      rows={3}
                                      placeholder="User prompt template with {variables}..."
                                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                                    />
                                  </div>
                                  
                                  <div>
                                    <label className="block text-xs font-bold text-gray-300 mb-1.5">Additional Instructions</label>
                                    <textarea
                                      value={aiNode.instructions || ''}
                                      onChange={(e) => {
                                        const newNodes = [...editedEngine.nodes]
                                        const nodeIdx = newNodes.findIndex(n => n.id === aiNode.id)
                                        if (nodeIdx !== -1) {
                                          newNodes[nodeIdx] = {
                                            ...newNodes[nodeIdx],
                                            data: {
                                              ...newNodes[nodeIdx].data,
                                              instructions: e.target.value,
                                              additionalInstructions: e.target.value
                                            }
                                          }
                                          setEditedEngine({ ...editedEngine, nodes: newNodes })
                                        }
                                      }}
                                      rows={3}
                                      placeholder="Additional context or instructions..."
                                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-orange-500"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-gray-400">
                            <Brain className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <div className="font-medium">No AI configured</div>
                            <div className="text-xs text-gray-500">This engine has no AI nodes in its workflow</div>
                          </div>
                        )}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-end space-x-4 mt-6">
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleEngineEdit}
                    disabled={loading}
                    className="px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors flex items-center space-x-2"
                  >
                    {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Cost Estimation Tab */}
          {activeTab === 'cost' && (
            <div className="space-y-6">
              <div className="bg-slate-800/50 border border-slate-600 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Cost Estimation</span>
                </h3>
                
                {getAINodesFromEngine().length > 0 ? (
                  <div className="space-y-4">
                    {/* Cost Summary */}
                    <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="text-2xl font-bold text-white mb-1">
                            ${(() => {
                              const nodes = getAINodesFromEngine()
                              let totalCost = 0
                              nodes.forEach(node => {
                                node.selectedModels.forEach(modelKey => {
                                  const [providerKey, modelId] = modelKey.split(':')
                                  const model = availableModels.find(m => m.key_name === providerKey && m.model_id === modelId)
                                  if (model) {
                                    const inputCost = ((node.estimatedTokens || 1000) / 1000000) * (model.input_cost_per_million || 0)
                                    const outputCost = ((node.maxTokens || 2000) / 1000000) * (model.output_cost_per_million || 0)
                                    totalCost += (inputCost + outputCost)
                                  }
                                })
                              })
                              return totalCost.toFixed(4)
                            })()}
                          </h4>
                          <p className="text-sm text-gray-300">Estimated cost per execution</p>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-300">Total Nodes: {getAINodesFromEngine().length}</div>
                          <div className="text-xs text-gray-400">Based on estimated token usage</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Node-by-Node Breakdown */}
                    <div className="space-y-3">
                      <h5 className="text-sm font-bold text-gray-300">Cost Breakdown by Node</h5>
                      {getAINodesFromEngine().map((aiNode, index) => (
                        <div key={aiNode.id} className="bg-slate-900/50 border border-slate-600 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-2">
                              <Zap className="w-4 h-4 text-orange-400" />
                              <span className="font-bold text-white">{aiNode.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-green-400">
                                ${(() => {
                                  let nodeCost = 0
                                  aiNode.selectedModels.forEach(modelKey => {
                                    const [providerKey, modelId] = modelKey.split(':')
                                    const model = availableModels.find(m => m.key_name === providerKey && m.model_id === modelId)
                                    if (model) {
                                      const inputCost = ((aiNode.estimatedTokens || 1000) / 1000000) * (model.input_cost_per_million || 0)
                                      const outputCost = ((aiNode.maxTokens || 2000) / 1000000) * (model.output_cost_per_million || 0)
                                      nodeCost += (inputCost + outputCost)
                                    }
                                  })
                                  return nodeCost.toFixed(4)
                                })()}
                              </div>
                              <div className="text-xs text-gray-400">per execution</div>
                            </div>
                          </div>
                          
                          {/* Model-level costs */}
                          <div className="space-y-2">
                            {aiNode.selectedModels.map((modelKey, idx) => {
                              const [providerKey, modelId] = modelKey.split(':')
                              const model = availableModels.find(m => m.key_name === providerKey && m.model_id === modelId)
                              
                              if (!model) {
                                return (
                                  <div key={idx} className="text-xs text-gray-500">
                                    Model {modelKey} not found in database
                                  </div>
                                )
                              }
                              
                              const inputCost = ((aiNode.estimatedTokens || 1000) / 1000000) * (model.input_cost_per_million || 0)
                              const outputCost = ((aiNode.maxTokens || 2000) / 1000000) * (model.output_cost_per_million || 0)
                              
                              return (
                                <div key={idx} className="flex items-center justify-between bg-slate-800/50 rounded-lg p-3 text-sm">
                                  <div>
                                    <div className="font-medium text-white">{modelId}</div>
                                    <div className="text-xs text-gray-400">{providerKey}</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-xs text-gray-300">
                                      Input: ${inputCost.toFixed(6)} ({aiNode.estimatedTokens || 1000} tokens)
                                    </div>
                                    <div className="text-xs text-gray-300">
                                      Output: ${outputCost.toFixed(6)} ({aiNode.maxTokens || 2000} tokens)
                                    </div>
                                    <div className="text-xs text-green-400 font-bold mt-1">
                                      Total: ${(inputCost + outputCost).toFixed(6)}
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Usage Projections */}
                    <div className="bg-slate-900/50 border border-slate-600 rounded-xl p-4">
                      <h5 className="text-sm font-bold text-gray-300 mb-3">Usage Projections</h5>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { label: '100 runs/month', multiplier: 100 },
                          { label: '1,000 runs/month', multiplier: 1000 },
                          { label: '10,000 runs/month', multiplier: 10000 }
                        ].map((projection) => {
                          const costPerRun = parseFloat((() => {
                            const nodes = getAINodesFromEngine()
                            let totalCost = 0
                            nodes.forEach(node => {
                              node.selectedModels.forEach(modelKey => {
                                const [providerKey, modelId] = modelKey.split(':')
                                const model = availableModels.find(m => m.key_name === providerKey && m.model_id === modelId)
                                if (model) {
                                  const inputCost = ((node.estimatedTokens || 1000) / 1000000) * (model.input_cost_per_million || 0)
                                  const outputCost = ((node.maxTokens || 2000) / 1000000) * (model.output_cost_per_million || 0)
                                  totalCost += (inputCost + outputCost)
                                }
                              })
                            })
                            return totalCost
                          })())
                          
                          return (
                            <div key={projection.label} className="bg-slate-800/50 rounded-lg p-3">
                              <div className="text-xs text-gray-400 mb-1">{projection.label}</div>
                              <div className="text-xl font-bold text-white">
                                ${(costPerRun * projection.multiplier).toFixed(2)}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <BarChart3 className="w-16 h-16 mx-auto mb-3 opacity-50" />
                    <div className="font-medium text-lg">No AI Nodes Configured</div>
                    <div className="text-sm text-gray-500">Add AI nodes to your workflow to see cost estimates</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* FUTURISTIC Footer */}
        <div className="bg-slate-800/30 border-t border-slate-600/50 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-xs text-gray-400">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{subEngines.length} Sub-Engines</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>{levelAssignments.length} Levels</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>{userAssignments.length} Users</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-slate-700/50 text-white rounded-lg hover:bg-slate-600/50 transition-colors text-sm"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onAssign()
                  onClose()
                }}
                className="px-6 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-orange-500/25 text-sm font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Engine Edit Modal */}
      {editingSubEngine && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-slate-600/50 backdrop-blur-xl">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-600 p-6 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-orange-500/30"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/30">
                      <Edit className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold mb-1">Edit User Engine</h2>
                      <p className="text-sm text-blue-100">{editingSubEngine.users?.full_name || editingSubEngine.users?.email || 'User'}</p>
                      <p className="text-xs text-blue-200 mt-1">{editingSubEngine.name}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setEditingSubEngine(null)
                      setSubEngineEditData({})
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
                        value={subEngineEditData.name || ''}
                        onChange={(e) => setSubEngineEditData({ ...subEngineEditData, name: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-bold text-gray-300 mb-2">Status</label>
                      <select
                        value={subEngineEditData.status || 'active'}
                        onChange={(e) => setSubEngineEditData({ ...subEngineEditData, status: e.target.value })}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-300 mb-2">Description</label>
                      <textarea
                        value={subEngineEditData.description || ''}
                        onChange={(e) => setSubEngineEditData({ ...subEngineEditData, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  {/* Default Engine Toggle */}
                  <div className="mt-4 pt-4 border-t border-slate-600">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={subEngineEditData.is_default === true}
                        onChange={(e) => {
                          const isDefault = e.target.checked
                          setSubEngineEditData({ 
                            ...subEngineEditData, 
                            is_default: isDefault,
                            default_order: isDefault ? (editedEngine.default_order || null) : null
                          })
                        }}
                        className="w-4 h-4 text-blue-600 bg-slate-900 border-slate-600 rounded focus:ring-blue-500"
                      />
                      <span className="text-white font-bold flex items-center space-x-2">
                        <span>Default Engine</span>
                        {subEngineEditData.is_default && subEngineEditData.default_order && (
                          <span className="text-xs px-2 py-1 bg-blue-600 text-white rounded">#{subEngineEditData.default_order}</span>
                        )}
                      </span>
                    </label>
                    <p className="text-xs text-gray-400 mt-2 ml-6">
                      User can override master engine's default setting for this sub-engine
                    </p>
                  </div>
                </div>

                {/* AI Models Section */}
                <div className="bg-slate-800/50 border border-slate-600 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                    <Brain className="w-5 h-5" />
                    <span>AI Workflow Nodes</span>
                  </h3>
                  
                  {modelsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                      <span className="ml-2 text-gray-400">Loading AI models...</span>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* AI Nodes from Workflow */}
                      {getAINodesFromSubEngine().length > 0 ? (
                        <div className="space-y-4">
                          {getAINodesFromSubEngine().map((aiNode, index) => (
                            <div key={aiNode.id} className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-600 rounded-xl p-5 hover:border-blue-500/50 transition-all shadow-lg">
                              {/* Node Header */}
                              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-600">
                                <div className="flex items-center space-x-3">
                                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <div className="font-bold text-white text-lg">{aiNode.name}</div>
                                    <div className="text-xs text-gray-400">{aiNode.type}</div>
                                  </div>
                                </div>
                                <div className="text-xs px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full border border-blue-500/30">
                                  {aiNode.selectedModels.length} Model{aiNode.selectedModels.length !== 1 ? 's' : ''}
                                </div>
                              </div>
                              
                              {/* Selected Models */}
                              <div className="space-y-2 mb-4">
                                {aiNode.selectedModels.length > 0 ? (
                                  aiNode.selectedModels.map((modelKey, idx) => {
                                    const [providerKey, modelId] = modelKey.split(':')
                                    const modelInfo = availableModels.find(m => m.key_name === providerKey && m.model_id === modelId)
                                    return (
                                      <div key={idx} className="flex items-center justify-between bg-gradient-to-r from-slate-700/70 to-slate-700/40 rounded-lg p-3 border border-slate-600/50">
                                        <div className="flex items-center space-x-3 flex-1">
                                          <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center shadow-lg">
                                            <Brain className="w-5 h-5 text-white" />
                                          </div>
                                          <div className="flex-1">
                                            <div className="font-bold text-white">{modelId}</div>
                                            <div className="text-xs text-gray-400">{providerKey}</div>
                                            {modelInfo && (
                                              <div className="text-xs text-green-400 mt-1">
                                                ${modelInfo.input_cost_per_million || 0}/1M tokens
                                              </div>
                                            )}
                                          </div>
                                          {modelInfo?.is_active === false && (
                                            <div className="text-xs px-2 py-1 bg-red-900/30 text-red-400 rounded border border-red-500/30">
                                              Inactive
                                            </div>
                                          )}
                                        </div>
                                        <button
                                          onClick={() => {
                                            const newNodes = [...subEngineEditData.nodes]
                                            const nodeIdx = newNodes.findIndex(n => n.id === aiNode.id)
                                            if (nodeIdx !== -1) {
                                              const updatedModels = aiNode.selectedModels.filter((_, i) => i !== idx)
                                              newNodes[nodeIdx] = {
                                                ...newNodes[nodeIdx],
                                                data: {
                                                  ...newNodes[nodeIdx].data,
                                                  selectedModels: updatedModels
                                                }
                                              }
                                              setSubEngineEditData({ ...subEngineEditData, nodes: newNodes })
                                              toast.success('Model removed')
                                            }
                                          }}
                                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all"
                                          title="Remove Model"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                      </div>
                                    )
                                  })
                                ) : (
                                  <div className="text-center py-4 px-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                                    <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-red-400" />
                                    <div className="text-sm font-bold text-red-400">No AI Model Selected</div>
                                    <div className="text-xs text-red-300 mt-1">This node requires at least one active AI model</div>
                                  </div>
                                )}
                              </div>
                                      
                                {/* Add Model Section */}
                                <div className="bg-gradient-to-r from-slate-700/30 to-slate-800/30 border border-slate-600 border-dashed rounded-lg p-3">
                                  <div className="flex items-center space-x-2 mb-3">
                                    <Plus className="w-4 h-4 text-blue-400" />
                                    <span className="text-sm font-bold text-gray-300">Add AI Model</span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-3">
                                    <div>
                                      <label className="block text-xs font-medium text-gray-400 mb-1.5">Provider</label>
                                      <select
                                        value={nodeProviderStates[aiNode.id] || ''}
                                        onChange={(e) => {
                                          setNodeProviderStates({
                                            ...nodeProviderStates,
                                            [aiNode.id]: e.target.value
                                          })
                                        }}
                                        className="w-full px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                      >
                                        <option value="">Select Provider</option>
                                        {providers.map((prov) => (
                                          <option key={prov} value={prov}>{prov}</option>
                                        ))}
                                      </select>
                                    </div>
                                    
                                    <div>
                                      <label className="block text-xs text-gray-400 mb-1">Model</label>
                                      {nodeProviderStates[aiNode.id] ? (
                                        <select
                                          onChange={(e) => {
                                            if (e.target.value) {
                                              const modelKey = e.target.value
                                              const newNodes = [...subEngineEditData.nodes]
                                              const nodeIdx = newNodes.findIndex(n => n.id === aiNode.id)
                                              if (nodeIdx !== -1) {
                                                const updatedModels = [...aiNode.selectedModels, modelKey]
                                                newNodes[nodeIdx] = {
                                                  ...newNodes[nodeIdx],
                                                  data: {
                                                    ...newNodes[nodeIdx].data,
                                                    selectedModels: updatedModels
                                                  }
                                                }
                                                setSubEngineEditData({ ...subEngineEditData, nodes: newNodes })
                                                setNodeProviderStates({
                                                  ...nodeProviderStates,
                                                  [aiNode.id]: ''
                                                })
                                                const model = getFilteredModels(aiNode.id).find(m => `${m.key_name}:${m.model_id}` === modelKey)
                                                toast.success(`${model?.model_name || 'Model'} added`)
                                              }
                                            }
                                          }}
                                          className="w-full px-2 py-1 bg-slate-800 border border-slate-600 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                        >
                                          <option value="">Select Model</option>
                                          {getFilteredModels(aiNode.id)
                                            .filter(model => model.is_active)
                                            .map((model) => {
                                              const modelKey = `${model.key_name}:${model.model_id}`
                                              const alreadySelected = aiNode.selectedModels.includes(modelKey)
                                              return (
                                                <option 
                                                  key={model.id} 
                                                  value={modelKey}
                                                  disabled={alreadySelected}
                                                >
                                                  {model.model_name} {alreadySelected ? '(Added)' : `($${model.input_cost_per_million || 0}/1M)`}
                                                </option>
                                              )
                                            })}
                                        </select>
                                      ) : (
                                        <div className="px-2 py-1 bg-slate-900 border border-slate-700 rounded text-gray-500 text-xs">
                                          Select provider first
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Node Settings */}
                                <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-600">
                                  <div>
                                    <label className="block text-xs text-gray-400 mb-1">Temperature</label>
                                    <div className="flex items-center space-x-2">
                                      <input
                                        type="range"
                                        min="0"
                                        max="2"
                                        step="0.1"
                                        value={aiNode.temperature}
                                        onChange={(e) => {
                                          const newNodes = [...subEngineEditData.nodes]
                                          const nodeIdx = newNodes.findIndex(n => n.id === aiNode.id)
                                          if (nodeIdx !== -1) {
                                            newNodes[nodeIdx] = {
                                              ...newNodes[nodeIdx],
                                              data: {
                                                ...newNodes[nodeIdx].data,
                                                temperature: parseFloat(e.target.value)
                                              }
                                            }
                                            setSubEngineEditData({ ...subEngineEditData, nodes: newNodes })
                                          }
                                        }}
                                        className="flex-1 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                                      />
                                      <span className="text-xs text-white font-mono w-10">{aiNode.temperature}</span>
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <label className="block text-xs text-gray-400 mb-1">Max Tokens</label>
                                    <input
                                      type="number"
                                      value={aiNode.maxTokens}
                                      onChange={(e) => {
                                        const newNodes = [...subEngineEditData.nodes]
                                        const nodeIdx = newNodes.findIndex(n => n.id === aiNode.id)
                                        if (nodeIdx !== -1) {
                                          newNodes[nodeIdx] = {
                                            ...newNodes[nodeIdx],
                                            data: {
                                              ...newNodes[nodeIdx].data,
                                              maxTokens: parseInt(e.target.value)
                                            }
                                          }
                                          setSubEngineEditData({ ...subEngineEditData, nodes: newNodes })
                                        }
                                      }}
                                      min="100"
                                      max="8000"
                                      step="100"
                                      className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                  </div>
                                </div>
                                
                                {/* Prompt Fields */}
                                <div className="grid grid-cols-1 gap-3 mt-3 pt-3 border-t border-slate-600">
                                  <div>
                                    <label className="block text-xs font-bold text-gray-300 mb-1.5">System Prompt</label>
                                    <textarea
                                      value={aiNode.systemPrompt || ''}
                                      onChange={(e) => {
                                        const newNodes = [...subEngineEditData.nodes]
                                        const nodeIdx = newNodes.findIndex(n => n.id === aiNode.id)
                                        if (nodeIdx !== -1) {
                                          newNodes[nodeIdx] = {
                                            ...newNodes[nodeIdx],
                                            data: {
                                              ...newNodes[nodeIdx].data,
                                              systemPrompt: e.target.value
                                            }
                                          }
                                          setSubEngineEditData({ ...subEngineEditData, nodes: newNodes })
                                        }
                                      }}
                                      rows={3}
                                      placeholder="System-level instructions for the AI..."
                                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                  </div>
                                  
                                  <div>
                                    <label className="block text-xs font-bold text-gray-300 mb-1.5">User Prompt / Prompt Template</label>
                                    <textarea
                                      value={aiNode.userPrompt || ''}
                                      onChange={(e) => {
                                        const newNodes = [...subEngineEditData.nodes]
                                        const nodeIdx = newNodes.findIndex(n => n.id === aiNode.id)
                                        if (nodeIdx !== -1) {
                                          newNodes[nodeIdx] = {
                                            ...newNodes[nodeIdx],
                                            data: {
                                              ...newNodes[nodeIdx].data,
                                              userPrompt: e.target.value,
                                              promptTemplate: e.target.value
                                            }
                                          }
                                          setSubEngineEditData({ ...subEngineEditData, nodes: newNodes })
                                        }
                                      }}
                                      rows={3}
                                      placeholder="User prompt template with {variables}..."
                                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                  </div>
                                  
                                  <div>
                                    <label className="block text-xs font-bold text-gray-300 mb-1.5">Additional Instructions</label>
                                    <textarea
                                      value={aiNode.instructions || ''}
                                      onChange={(e) => {
                                        const newNodes = [...subEngineEditData.nodes]
                                        const nodeIdx = newNodes.findIndex(n => n.id === aiNode.id)
                                        if (nodeIdx !== -1) {
                                          newNodes[nodeIdx] = {
                                            ...newNodes[nodeIdx],
                                            data: {
                                              ...newNodes[nodeIdx].data,
                                              instructions: e.target.value,
                                              additionalInstructions: e.target.value
                                            }
                                          }
                                          setSubEngineEditData({ ...subEngineEditData, nodes: newNodes })
                                        }
                                      }}
                                      rows={3}
                                      placeholder="Additional context or instructions..."
                                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-gray-400">
                            <Brain className="w-12 h-12 mx-auto mb-2 opacity-50" />
                            <div className="font-medium">No AI configured</div>
                            <div className="text-xs text-gray-500">This engine has no AI nodes in its workflow</div>
                          </div>
                        )}
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
                    setEditingSubEngine(null)
                    setSubEngineEditData({})
                  }}
                  className="px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveSubEngine}
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EpicEngineAssignmentModal
