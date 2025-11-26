import React, { useState, useEffect } from 'react'
import { 
  Settings, Users, Crown, Copy, Trash2, Edit, Play, Pause,
  MoreVertical, Search, Filter, Plus, Zap, Target, Layers, Clock,
  CheckCircle, AlertTriangle, Key, Eye, EyeOff, RefreshCw, X,
  Brain, Cpu, Database, Globe, Shield, Activity, BarChart3,
  ChevronDown, ChevronUp, Sparkles, Rocket, Star, TrendingUp,
  Grid, List
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useSuperAdmin } from '../../contexts/SuperAdminContext'
import { dbService } from '../../services/database'
import toast from 'react-hot-toast'
import EpicEngineAssignmentModal from './EpicEngineAssignmentModal'
import UserEnginesList from './UserEnginesList'

const Engines = () => {
  console.log('🚀 EPIC Engines component rendering...')
  
  const { superAdminUser, getSuperAdminUserId, isAuthenticated } = useSuperAdmin()
  console.log('🔍 SuperAdmin context:', { superAdminUser, isAuthenticated: isAuthenticated() })
  
  const [activeTab, setActiveTab] = useState('engines')
  const [engines, setEngines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [sortBy, setSortBy] = useState('created_at')
  const [showAssignmentModal, setShowAssignmentModal] = useState(false)
  const [selectedEngine, setSelectedEngine] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showActions, setShowActions] = useState({})
  const [apiKeys, setApiKeys] = useState({})
  const [viewMode, setViewMode] = useState('grid') // grid or list
  const [showFilters, setShowFilters] = useState(false)

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
        .order(sortBy, { ascending: false })

      if (error) {
        console.error('❌ Error loading ai_engines:', error)
        setError(`Database error: ${error.message}`)
        setEngines([])
        return
      }

      console.log('✅ Loaded engines:', data)
      console.log('📊 Engine count:', data?.length || 0)
      
      if (!data || data.length === 0) {
        console.log('⚠️ No engines found in ai_engines table')
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

  // Handle setting engine as default (Admin only)
  const handleSetAsDefault = async (engine) => {
    try {
      if (engine.is_default) {
        // Remove default status
        await dbService.removeMasterEngineDefault(engine.id)
        toast.success(`${engine.name} removed from defaults!`)
      } else {
        // Set as default
        await dbService.setMasterEngineAsDefault(engine.id)
        toast.success(`${engine.name} set as default engine!`)
      }
      
      // Reload engines to reflect changes
      await loadEngines()
    } catch (error) {
      console.error('Error setting engine as default:', error)
      toast.error(error.message || 'Failed to set as default')
    }
  }
  const loadAPIKeys = async () => {
    try {
      const { data, error } = await supabase
        .from('user_engines')
        .select('engine_id, api_key, status, user_id')

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
            status: ue.status,
            user_id: ue.user_id
          })
        }
      })

      setApiKeys(keysByEngine)
      console.log('✅ Loaded API keys:', keysByEngine)
    } catch (error) {
      console.error('❌ Error loading API keys:', error)
    }
  }

  useEffect(() => {
    loadEngines()
    loadAPIKeys()
  }, [sortBy])

  // Filter and sort engines
  const filteredEngines = engines.filter(engine => {
    const matchesSearch = engine.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         engine.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filterType === 'all') return matchesSearch
    if (filterType === 'active') return matchesSearch && engine.is_active === true
    if (filterType === 'inactive') return matchesSearch && engine.is_active === false
    
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
      case 'edit':
        setSelectedEngine(engine)
        setShowEditModal(true)
        break
      case 'delete':
        deleteEngine(engine.id, engine.name)
        break
      default:
        break
    }
    setShowActions({ ...showActions, [engine.id]: false })
  }

  // Delete engine (and detach user copies first to avoid FK issues)
  const deleteEngine = async (engineId, name = 'engine') => {
    const ok = confirm(`Delete "${name}"? This will remove the engine and any user assignments. This cannot be undone.`)
    if (!ok) return

    try {
      // Remove user assignments
      await supabase
        .from('user_engines')
        .delete()
        .eq('engine_id', engineId)

      // Delete engine
      const { error } = await supabase
        .from('ai_engines')
        .delete()
        .eq('id', engineId)

      if (error) {
        console.error('❌ Delete engine error:', error)
        toast.error(`Failed to delete engine: ${error.message}`)
        return
      }

      toast.success(`Deleted ${name}`)
      // Refresh lists
      await loadEngines()
      await loadAPIKeys()
    } catch (err) {
      console.error('Unexpected delete error:', err)
      toast.error('Failed to delete engine')
    }
  }

  // Copy API key to clipboard
  const copyAPIKey = (apiKey) => {
    navigator.clipboard.writeText(apiKey)
    toast.success('API Key copied to clipboard!')
  }

  // Get status color
  const getStatusColor = (isActive) => {
    return isActive ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'
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

  // Get engine stats
  const getEngineStats = (engine) => {
    const nodeCount = engine.nodes?.length || 0
    const hasAI = engine.nodes?.some(node => node.data?.aiEnabled) || false
    const hasConditions = engine.nodes?.some(node => node.type === 'condition') || false
    const apiKeyCount = apiKeys[engine.id]?.length || 0
    
    return { nodeCount, hasAI, hasConditions, apiKeyCount }
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
    <div className="space-y-8">
      {/* EPIC Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 rounded-2xl p-8 border border-slate-700">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-orange-500/10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 flex items-center space-x-3">
                {/* Lekhika Logo */}
                <div className="flex items-center justify-center">
                  <img 
                    src="/src/components/img/11.png" 
                    alt="LEKHIKA Logo"
                    className="h-12 w-auto object-contain"
                  />
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-white" />
                </div>
                <span>AI Engines</span>
                <Sparkles className="w-8 h-8 text-yellow-400" />
              </h1>
              <p className="text-gray-300 text-lg">Deploy, manage, and assign powerful AI content generation engines</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">{engines.length}</div>
              <div className="text-gray-400">Total Engines</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('engines')}
          className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'engines'
              ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Rocket className="w-5 h-5" />
            <span>Engines</span>
            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-900/50">
              {engines.length}
            </span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('user-engines')}
          className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'user-engines'
              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
              : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Users className="w-5 h-5" />
            <span>User Engines</span>
          </div>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'engines' ? (
        <>
          {/* Advanced Controls */}
          <div className="bg-slate-800/50 border border-slate-600 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search engines..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent w-80"
              />
            </div>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Engines</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-slate-900 border border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="created_at">Sort by Date</option>
              <option value="name">Sort by Name</option>
              <option value="tier">Sort by Tier</option>
            </select>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">View:</span>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-orange-600 text-white' : 'bg-slate-700 text-gray-400 hover:bg-slate-600'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-orange-600 text-white' : 'bg-slate-700 text-gray-400 hover:bg-slate-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors flex items-center space-x-2"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{filteredEngines.length}</div>
              <div className="text-sm text-gray-400">Filtered Results</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{Object.keys(apiKeys).length}</div>
              <div className="text-sm text-gray-400">With API Keys</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">
              {filteredEngines.length} of {engines.length} engines
            </span>
          </div>
        </div>
      </div>

      {/* EPIC Engine Grid */}
      {filteredEngines.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gradient-to-r from-gray-400 to-gray-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Zap className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">No Engines Found</h3>
          <p className="text-gray-400 mb-8 text-lg">
            {searchTerm || filterType !== 'all' 
              ? 'No engines match your search criteria' 
              : 'Create your first AI flow to get started'
            }
          </p>
          {!searchTerm && filterType === 'all' && (
            <div className="text-left max-w-lg mx-auto text-sm text-slate-400 bg-slate-800/50 rounded-xl p-6 border border-slate-600">
              <h4 className="font-bold text-white mb-4 flex items-center space-x-2">
                <Target className="w-5 h-5 text-orange-400" />
                <span>Getting Started Guide</span>
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
                  <span>Go to Flow section to create workflows</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
                  <span>Deploy flows as engines</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
                  <span>Assign engines to users and levels</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
                  <span>Generate API keys for access</span>
                </li>
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className={`grid gap-8 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
            : 'grid-cols-1'
        }`}>
          {filteredEngines.map((engine) => {
            const stats = getEngineStats(engine)
            return (
              <div
                key={engine.id}
                className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-600/50 rounded-2xl p-6 hover:border-orange-500/60 transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10 transform hover:-translate-y-1 backdrop-blur-sm"
              >
                {/* Compact Engine Card */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4 flex-1">
                    <button
                      onClick={() => handleEngineAction('assign', engine)}
                      className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg relative cursor-pointer hover:scale-105 transition-all ${
                        engine.is_active !== false && engine.status !== 'inactive'
                          ? 'bg-gradient-to-br from-orange-500 to-red-500'
                          : 'bg-gradient-to-br from-gray-400 to-gray-500'
                      }`}
                    >
                      <Brain className={`w-6 h-6 text-white ${engine.is_active !== false && engine.status !== 'inactive' ? 'drop-shadow-lg' : ''}`} />
                      {(engine.is_active !== false && engine.status !== 'inactive') && (
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-orange-400 to-red-400 opacity-10"></div>
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-bold text-white truncate">{engine.name || 'Unnamed Engine'}</h3>
                        <span className="text-xs text-gray-400 font-mono bg-slate-700/50 px-2 py-1 rounded">
                          {engine.id?.slice(0, 8)}...
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm line-clamp-2 mb-2">
                        {engine.description || 'No description available'}
                      </p>
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(engine.is_active !== false && engine.status !== 'inactive')}`}>
                          {engine.is_active !== false && engine.status !== 'inactive' ? 'Active' : 'Inactive'}
                        </span>
                        {engine.tier && (
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${getTierColor(engine.tier)}`}>
                            {engine.tier?.toUpperCase()}
                          </span>
                        )}
                        {engine.is_default && (
                          <span className="px-2 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                            DEFAULT
                          </span>
                        )}
                        <div className={`w-2 h-2 rounded-full ${
                          engine.is_active !== false && engine.status !== 'inactive' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                      </div>
                      
                      {/* Admin Action Buttons */}
                      <div className="flex items-center space-x-2 mt-3">
                        <button
                          onClick={() => handleEngineAction('edit', engine)}
                          className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-xs font-medium hover:from-green-600 hover:to-emerald-600 transition-all"
                        >
                          <Edit className="w-3 h-3 mr-1 inline" />
                          Edit
                        </button>
                        
                        <button
                          onClick={() => handleSetAsDefault(engine)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            engine.is_default
                              ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600'
                              : 'bg-slate-700 text-gray-300 hover:bg-slate-600 hover:text-white'
                          }`}
                        >
                          {engine.is_default ? (
                            <>
                              <Star className="w-3 h-3 mr-1 inline" />
                              Remove Default
                            </>
                          ) : (
                            <>
                              <Star className="w-3 h-3 mr-1 inline" />
                              Set as Default
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={() => handleEngineAction('assign', engine)}
                          className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-xs font-medium hover:from-blue-600 hover:to-purple-600 transition-all"
                        >
                          <Users className="w-3 h-3 mr-1 inline" />
                          Assign
                        </button>

                        <button
                          onClick={() => handleEngineAction('delete', engine)}
                          className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-lg text-xs font-medium hover:from-red-700 hover:to-rose-700 transition-all"
                          title="Delete Engine"
                        >
                          <Trash2 className="w-3 h-3 mr-1 inline" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                  
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* EPIC Assignment Modal */}
        </>
      ) : (
        <UserEnginesList />
      )}

      {showAssignmentModal && selectedEngine && (
        <EpicEngineAssignmentModal
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

      {/* Simple Edit Modal */}
      {showEditModal && selectedEngine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="superadmin-theme rounded-xl w-[480px] max-w-[90%] p-6 relative border border-subtle" style={{ background: 'var(--bg-surface)', boxShadow: 'var(--shadow-soft)' }}>
            <button
              onClick={() => { setShowEditModal(false); setSelectedEngine(null) }}
              className="absolute top-4 right-4 text-secondary hover:text-white focus-ring"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Edit Engine</h3>
            <EngineEditForm
              engine={selectedEngine}
              onCancel={() => { setShowEditModal(false); setSelectedEngine(null) }}
              onSaved={async () => {
                setShowEditModal(false)
                setSelectedEngine(null)
                await loadEngines()
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default Engines

// Inline form component for editing minimal engine fields
function EngineEditForm({ engine, onCancel, onSaved }) {
  const [name, setName] = React.useState(engine.name || '')
  const [description, setDescription] = React.useState(engine.description || '')
  const [status, setStatus] = React.useState(engine.status || 'active')
  const [saving, setSaving] = React.useState(false)

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Name is required')
      return
    }
    setSaving(true)
    try {
      const { error } = await supabase
        .from('ai_engines')
        .update({ name: name.trim(), description: description.trim(), status })
        .eq('id', engine.id)
      if (error) {
        console.error('❌ Update engine error:', error)
        toast.error(`Failed to update engine: ${error.message}`)
        return
      }
      toast.success('Engine updated')
      onSaved && onSaved()
    } catch (e) {
      console.error('Unexpected update error:', e)
      toast.error('Failed to update engine')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg px-3 py-2"
          style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
        />
      </div>
      <div>
        <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full rounded-lg px-3 py-2 min-h-[90px]"
          style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
        />
      </div>
      <div>
        <label className="block text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full rounded-lg px-3 py-2"
          style={{ background: 'var(--bg-surface-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="px-4 py-2 rounded-lg focus-ring" style={{ background: 'var(--bg-surface-hover)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}>Cancel</button>
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus-ring">{saving ? 'Saving...' : 'Save'}</button>
      </div>
    </div>
  )
}