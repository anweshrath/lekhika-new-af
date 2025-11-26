import React, { useState, useMemo, useEffect } from 'react'
import { X, Plus, Search, Copy, Zap, Filter, RefreshCw, Edit, Check } from 'lucide-react'
import { NODE_PALETTES, NODE_ROLE_CONFIG } from '../data/nodePalettes'
import { nodePaletteSyncService } from '../services/nodePaletteSyncService'
import NodePaletteEditModal from './SuperAdmin/NodePaletteEditModal'
import toast from 'react-hot-toast'

const NodePaletteModal = ({ isOpen, onClose, onNodeSelect, onNodeDuplicate, onNodeCreate, onNodeEdit }) => {
  const [selectedMasterType, setSelectedMasterType] = useState('all')
  const [selectedSubCategory, setSelectedSubCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [databaseNodes, setDatabaseNodes] = useState([])
  const [loading, setLoading] = useState(false)
  const [syncingUpsert, setSyncingUpsert] = useState(false)
  const [syncingFromSupabase, setSyncingFromSupabase] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedNodeForEdit, setSelectedNodeForEdit] = useState(null)
  const [lastUpsertStatus, setLastUpsertStatus] = useState(null)
  const [lastSyncFromDbStatus, setLastSyncFromDbStatus] = useState(null)

  // Load nodes from database
  useEffect(() => {
    if (isOpen) {
      loadNodesFromDatabase()
    }
  }, [isOpen])

  const loadNodesFromDatabase = async () => {
    setLoading(true)
    try {
      const nodes = await nodePaletteSyncService.getAllNodes()
      setDatabaseNodes(nodes)
      console.log(`✅ Loaded ${nodes.length} nodes from database`)
    } catch (error) {
      console.error('❌ Failed to load nodes from database:', error)
      toast.error('Failed to load nodes from database')
    } finally {
      setLoading(false)
    }
  }

  const syncWithDatabase = async () => {
    setSyncingUpsert(true)
    try {
      const result = await nodePaletteSyncService.manualSync()
      await loadNodesFromDatabase()
      setLastUpsertStatus({ success: true, count: result.synced || 0, time: new Date().toISOString() })
      toast.success('Node palette synced with database')
    } catch (error) {
      console.error('❌ Failed to sync with database:', error)
      setLastUpsertStatus({ success: false, error: error.message, time: new Date().toISOString() })
      toast.error('Failed to sync with database')
    } finally {
      setSyncingUpsert(false)
    }
  }

  const syncFromSupabase = async () => {
    setSyncingFromSupabase(true)
    try {
      const result = await nodePaletteSyncService.syncFromDatabase()
      if (result.success) {
        setLastSyncFromDbStatus({ success: true, count: result.count, time: new Date().toISOString() })
        toast.success(`✅ Synced ${result.count} nodes from Supabase to code`)
        await loadNodesFromDatabase()
      } else {
        setLastSyncFromDbStatus({ success: false, error: result.error, time: new Date().toISOString() })
        toast.error(`❌ Sync failed: ${result.error}`)
      }
    } catch (error) {
      console.error('❌ Failed to sync from Supabase:', error)
      setLastSyncFromDbStatus({ success: false, error: error.message, time: new Date().toISOString() })
      toast.error('Failed to sync from Supabase')
    } finally {
      setSyncingFromSupabase(false)
    }
  }

  // Handle creating new node with selected type
  const handleCreateNew = (nodeType) => {
    setShowCreateModal(false)
    if (onNodeCreate) {
      onNodeCreate(nodeType)
    }
  }

  // Master Node Types with counts and colors
  const masterNodeTypes = {
    all: { label: 'All Nodes', icon: '🎯', color: 'from-slate-500 to-slate-700' },
    input: { label: 'Input', icon: '📝', color: 'from-blue-500 to-blue-700' },
    process: { label: 'Process', icon: '⚙️', color: 'from-green-500 to-green-700' },
    condition: { label: 'Condition', icon: '🔀', color: 'from-yellow-500 to-yellow-700' },
    preview: { label: 'Preview', icon: '👁️', color: 'from-purple-500 to-purple-700' },
    output: { label: 'Output', icon: '📤', color: 'from-pink-500 to-pink-700' }
  }

  // Process SubCategories
  const processSubCategories = {
    all: { label: 'All Process', icon: '⚙️' },
    outlining: { label: 'Outlining & Structure', icon: '📋' },
    research: { label: 'Research & Analysis', icon: '🔍' },
    creative: { label: 'Creative Development', icon: '🎨' },
    content: { label: 'Content Creation', icon: '✍️' },
    polishing: { label: 'Polishing & Formatting', icon: '✨' },
    quality: { label: 'Quality Control', icon: '✅' },
    imaging: { label: 'Imaging', icon: '🖼️' }
  }

  // Get all nodes with proper categorization
  const getAllNodes = useMemo(() => {
    const allNodes = []
    
    // First, add nodes from database
    databaseNodes.forEach(node => {
      allNodes.push({
        id: node.node_id,
        name: node.name,
        description: node.description,
        type: node.type,
        icon: node.icon,
        gradient: node.gradient,
        masterCategory: node.category,
        subCategory: node.sub_category,
        role: node.role,
        configuration: node.configuration,
        source: 'database'
      })
    })
    
    // Always include hardcoded palette nodes as a baseline (merge with DB), then dedupe by id
    Object.values(NODE_PALETTES.input || {}).forEach(node => {
      allNodes.push({ 
        ...node, 
        masterCategory: 'input',
        subCategory: null,
        source: 'hardcoded'
      })
    })
    
    Object.values(NODE_PALETTES.process || {}).forEach(node => {
      allNodes.push({ 
        ...node, 
        masterCategory: 'process',
        subCategory: node.subCategory || 'general',
        source: 'hardcoded'
      })
    })
    
    Object.values(NODE_PALETTES.condition || {}).forEach(node => {
      allNodes.push({ 
        ...node, 
        masterCategory: 'condition',
        subCategory: null,
        source: 'hardcoded'
      })
    })
    
    Object.values(NODE_PALETTES.preview || {}).forEach(node => {
      allNodes.push({ 
        ...node, 
        masterCategory: 'preview',
        subCategory: null,
        source: 'hardcoded'
      })
    })
    
    Object.values(NODE_PALETTES.output || {}).forEach(node => {
      allNodes.push({ 
        ...node, 
        masterCategory: 'output',
        subCategory: null,
        source: 'hardcoded'
      })
    })

    // Deduplicate by id (prefer database version over hardcoded)
    const uniqueById = new Map()
    for (const n of allNodes) {
      if (!uniqueById.has(n.id) || uniqueById.get(n.id).source === 'hardcoded') {
        uniqueById.set(n.id, n)
      }
    }
    
    return Array.from(uniqueById.values())
  }, [databaseNodes])

  // Advanced filtering logic
  const filteredNodes = useMemo(() => {
    return getAllNodes.filter(node => {
      // Master type filter
      const matchesMasterType = selectedMasterType === 'all' || node.masterCategory === selectedMasterType
      
      // Subcategory filter (only for process nodes)
      const matchesSubCategory = selectedSubCategory === 'all' || 
        (node.masterCategory === 'process' && node.subCategory === selectedSubCategory) ||
        (node.masterCategory !== 'process')
      
      // Search filter
      const matchesSearch = searchTerm === '' || 
        node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (node.subCategory && node.subCategory.toLowerCase().includes(searchTerm.toLowerCase()))
      
      return matchesMasterType && matchesSubCategory && matchesSearch
    })
  }, [getAllNodes, selectedMasterType, selectedSubCategory, searchTerm])

  const handleNodeSelect = (node) => {
    onNodeSelect(node)
    onClose()
  }

  const handleNodeDuplicate = (node) => {
    // Create a duplicate node with modified properties
    const duplicateNode = {
      ...node,
      id: `${node.id}_copy_${Date.now()}`,
      name: `${node.name} (Copy)`,
      role: `${node.role}_copy`,
      configuration: { ...node.configuration }
    }
    
    // Open the edit modal with the duplicate node
    setSelectedNodeForEdit(duplicateNode)
    setShowEditModal(true)
  }

  const clearFilters = () => {
    setSelectedMasterType('all')
    setSelectedSubCategory('all')
    setSearchTerm('')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="superadmin-theme bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-gray-800 dark:to-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Node Palette</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {loading ? 'Loading nodes...' : `Choose from ${getAllNodes.length} specialized nodes (${databaseNodes.length} from database)`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={syncWithDatabase}
              disabled={syncingUpsert || loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${syncingUpsert ? 'animate-spin' : ''}`} />
              {syncingUpsert ? 'Upserting...' : 'Upsert to Supabase'}
            </button>
            <button
              onClick={syncFromSupabase}
              disabled={syncingFromSupabase || loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${syncingFromSupabase ? 'animate-spin' : ''}`} />
              {syncingFromSupabase ? 'Syncing...' : 'Sync from Supabase'}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Filters Section */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search nodes by name, role, description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Master Type Filter */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Master Node Types</h3>
              <button
                onClick={clearFilters}
                className="text-xs px-3 py-1 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Clear Filters
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              {Object.entries(masterNodeTypes).map(([key, config]) => {
                const nodeCount = key === 'all' ? getAllNodes.length : getAllNodes.filter(n => n.masterCategory === key).length
                return (
                  <button
                    key={key}
                    onClick={() => {
                      setSelectedMasterType(key)
                      if (key !== 'process') setSelectedSubCategory('all')
                    }}
                    className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                      selectedMasterType === key
                        ? `bg-gradient-to-r ${config.color} text-white shadow-lg transform scale-105`
                        : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 hover:scale-105'
                    }`}
                  >
                    <span>{config.icon}</span>
                    <span>{config.label}</span>
                    <span className="bg-white/20 dark:bg-black/20 px-2 py-1 rounded-full text-xs">{nodeCount}</span>
                  </button>
                )
              })}
              
              {/* Create New Node Button */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 hover:scale-105 shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Create New</span>
              </button>
            </div>
          </div>

          {/* SubCategory Filter (only for Process nodes) */}
          {selectedMasterType === 'process' && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Process SubCategories</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(processSubCategories).map(([key, config]) => {
                  const nodeCount = key === 'all' 
                    ? getAllNodes.filter(n => n.masterCategory === 'process').length 
                    : getAllNodes.filter(n => n.masterCategory === 'process' && n.subCategory === key).length
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedSubCategory(key)}
                      className={`flex items-center space-x-2 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                        selectedSubCategory === key
                          ? 'bg-green-500 text-white shadow-md transform scale-105'
                          : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 hover:scale-105'
                      }`}
                    >
                      <span>{config.icon}</span>
                      <span>{config.label}</span>
                      <span className="bg-white/20 dark:bg-black/20 px-1.5 py-0.5 rounded-full text-xs">{nodeCount}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Nodes Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredNodes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNodes.map((node, index) => {
                const roleConfig = NODE_ROLE_CONFIG[node.role] || {}
                const masterConfig = masterNodeTypes[node.masterCategory] || {}
                const typeAccent = {
                  input: { border: '#3B82F6', glow: 'rgba(59,130,246,0.35)' },
                  process: { border: '#10B981', glow: 'rgba(16,185,129,0.35)' },
                  condition: { border: '#F59E0B', glow: 'rgba(245,158,11,0.35)' },
                  preview: { border: '#8B5CF6', glow: 'rgba(139,92,246,0.35)' },
                  output: { border: '#EC4899', glow: 'rgba(236,72,153,0.35)' },
                  all: { border: '#64748B', glow: 'rgba(100,116,139,0.35)' }
                }[node.masterCategory || 'all']
                
                return (
                  <div
                    key={`${node.id}-${index}`}
                    className="rounded-xl p-4 transition-all duration-300 group"
                    style={{
                      background: 'linear-gradient(180deg, rgba(17,24,39,0.85), rgba(17,24,39,0.7))',
                      border: `1.5px solid ${typeAccent.border}`,
                      boxShadow: `0 10px 30px ${typeAccent.glow}`,
                    }}
                  >
                    {/* Node Header */}
                    <div className="flex items-center justify-between mb-3">
                      <div 
                        className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg bg-gradient-to-r ${node.gradient || masterConfig.color} shadow-lg`}
                      >
                        {node.icon || masterConfig.icon || '⚙️'}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedNodeForEdit(node)
                            setShowEditModal(true)
                          }}
                          className="p-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus-ring"
                          title="Edit Master Node Configuration"
                          aria-label="Edit Master Node Configuration"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleNodeDuplicate(node)}
                          className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus-ring"
                          title="Duplicate Node"
                          aria-label="Duplicate Node"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleNodeSelect(node)}
                          className="p-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors focus-ring"
                          title="Add Node"
                          aria-label="Add Node"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Node Details */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-white text-sm">
                          {node.name}
                        </h4>
                        <div className="flex items-center space-x-1">
                          {/* Master Category Badge */}
                          <span className={`px-2 py-1 bg-gradient-to-r ${masterConfig.color} text-white text-xs rounded-full font-bold tracking-wide`}>
                            {masterConfig.label}
                          </span>
                          
                          {/* Content Writer Badge */}
                          {roleConfig.canWriteContent && (
                            <span className="px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs rounded-full font-black flex items-center space-x-1 shadow">
                              <Zap className="w-3 h-3" />
                              <span>WRITER</span>
                            </span>
                          )}
                          
                          {/* Structural Editor Badge */}
                          {roleConfig.canEditStructure && !roleConfig.canWriteContent && (
                            <span className="px-2 py-1 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs rounded-full font-black flex items-center space-x-1 shadow">
                              <Edit className="w-3 h-3" />
                              <span>STRUCTURAL EDITOR</span>
                            </span>
                          )}

                          {/* Proofreader Badge */}
                          {roleConfig.canProofRead && !roleConfig.canWriteContent && !roleConfig.canEditStructure && (
                            <span className="px-2 py-1 bg-gradient-to-r from-orange-500 to-red-600 text-white text-xs rounded-full font-black flex items-center space-x-1 shadow">
                              <Check className="w-3 h-3" />
                              <span>PROOFREADER</span>
                            </span>
                          )}
                          
                          {/* AI Enabled Badge */}
                          {node.is_ai_enabled && (
                            <span className="px-2 py-1 bg-gradient-to-r from-blue-500 to-cyan-600 text-white text-xs rounded-full font-bold shadow">
                              AI
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-200/90 line-clamp-2">
                        {node.description}
                      </p>
                      
                      {/* SubCategory Badge (for process nodes) */}
                      {node.subCategory && (
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-1 bg-white/10 text-white text-xs rounded-full font-medium border border-white/20">
                            {processSubCategories[node.subCategory]?.label || node.subCategory}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-3 text-xs text-gray-300 pt-2 border-t border-white/10">
                        <span className="flex items-center space-x-1">
                          <span className="w-2 h-2 rounded-full" style={{ background: typeAccent.border }}></span>
                          <span>Role: {node.role}</span>
                        </span>
                        {roleConfig.maxTokens > 0 && (
                          <span className="flex items-center space-x-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            <span>{roleConfig.maxTokens} tokens</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 dark:text-gray-400">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-2">No nodes found</h3>
              <p className="text-sm mb-4">Try adjusting your filters or search terms</p>
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Footer Stats */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4 text-gray-600 dark:text-gray-400">
              <span>Showing {filteredNodes.length} of {getAllNodes.length} nodes</span>
              {(selectedMasterType !== 'all' || selectedSubCategory !== 'all' || searchTerm) && (
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4" />
                  <span>Filters active</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
              {Object.entries(masterNodeTypes).slice(1).map(([key, config]) => {
                const count = getAllNodes.filter(n => n.masterCategory === key).length
                return (
                  <span key={key} className="flex items-center space-x-1">
                    <span>{config.icon}</span>
                    <span>{count}</span>
                  </span>
                )
              })}
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex gap-4">
            {lastUpsertStatus && (
              <div>
                <strong>Last Upsert:</strong> {lastUpsertStatus.success ? `Success (${lastUpsertStatus.count})` : `Failed (${lastUpsertStatus.error})`} at {new Date(lastUpsertStatus.time).toLocaleString()}
              </div>
            )}
            {lastSyncFromDbStatus && (
              <div>
                <strong>Last Sync From DB:</strong> {lastSyncFromDbStatus.success ? `Success (${lastSyncFromDbStatus.count})` : `Failed (${lastSyncFromDbStatus.error})`} at {new Date(lastSyncFromDbStatus.time).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create New Node Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Create New Node</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Choose the type of node to create:</p>
            
            <div className="space-y-2">
              {Object.entries(masterNodeTypes).slice(1).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => handleCreateNew(key)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg bg-gradient-to-r ${config.color} text-white hover:scale-105 transition-transform`}
                >
                  <span className="text-lg">{config.icon}</span>
                  <span className="font-medium">{config.label}</span>
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setShowCreateModal(false)}
              className="w-full mt-4 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {/* Node Palette Edit Modal */}
      <NodePaletteEditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedNodeForEdit(null)
        }}
        node={selectedNodeForEdit}
      />
    </div>
  )
}

export default NodePaletteModal
