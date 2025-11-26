import React, { useState, useMemo } from 'react'
import { ChevronDown, Plus, Search, Filter, Zap, X, Copy, Edit3 } from 'lucide-react'
import { NODE_PALETTES, NODE_ROLE_CONFIG } from '../data/nodePalettes'

const NewNodePaletteDropdown = ({ onNodeSelect, onNodeDuplicate, onNodeCreate, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedMasterType, setSelectedMasterType] = useState('all')
  const [selectedSubCategory, setSelectedSubCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

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
    research: { label: 'Research & Analysis', icon: '🔍' },
    creative: { label: 'Creative Development', icon: '🎨' },
    content: { label: 'Content Creation', icon: '✍️' },
    quality: { label: 'Quality Control', icon: '✅' }
  }

  // Get all nodes with proper categorization
  const getAllNodes = useMemo(() => {
    const allNodes = []
    
    // Input nodes
    Object.values(NODE_PALETTES.input || {}).forEach(node => {
      allNodes.push({ 
        ...node, 
        masterCategory: 'input',
        subCategory: null,
        nodeCount: Object.keys(NODE_PALETTES.input).length
      })
    })
    
    // Process nodes with subcategories
    Object.values(NODE_PALETTES.process || {}).forEach(node => {
      allNodes.push({ 
        ...node, 
        masterCategory: 'process',
        subCategory: node.subCategory || 'general',
        nodeCount: Object.keys(NODE_PALETTES.process).length
      })
    })
    
    // Condition nodes
    Object.values(NODE_PALETTES.condition || {}).forEach(node => {
      allNodes.push({ 
        ...node, 
        masterCategory: 'condition',
        subCategory: null,
        nodeCount: Object.keys(NODE_PALETTES.condition).length
      })
    })
    
    // Preview nodes
    Object.values(NODE_PALETTES.preview || {}).forEach(node => {
      allNodes.push({ 
        ...node, 
        masterCategory: 'preview',
        subCategory: null,
        nodeCount: Object.keys(NODE_PALETTES.preview).length
      })
    })
    
    // Output nodes
    Object.values(NODE_PALETTES.output || {}).forEach(node => {
      allNodes.push({ 
        ...node, 
        masterCategory: 'output',
        subCategory: null,
        nodeCount: Object.keys(NODE_PALETTES.output).length
      })
    })
    
    return allNodes
  }, [])

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

  // Get subcategory counts for process nodes
  const getSubCategoryCounts = () => {
    const processNodes = getAllNodes.filter(node => node.masterCategory === 'process')
    const counts = {}
    processNodes.forEach(node => {
      const subCat = node.subCategory || 'general'
      counts[subCat] = (counts[subCat] || 0) + 1
    })
    return counts
  }

  const handleNodeSelect = (node) => {
    onNodeSelect(node)
    setIsOpen(false)
    setSearchTerm('') // Clear search on selection
  }

  const handleNodeDuplicate = (node, e) => {
    e.stopPropagation() // Prevent node selection
    if (onNodeDuplicate) {
      onNodeDuplicate(node)
    }
  }

  const handleCreateNew = (nodeType) => {
    if (onNodeCreate) {
      onNodeCreate(nodeType)
    }
    setShowCreateModal(false)
    setIsOpen(false)
  }

  const clearFilters = () => {
    setSelectedMasterType('all')
    setSelectedSubCategory('all')
    setSearchTerm('')
  }

  const subCategoryCounts = getSubCategoryCounts()

  return (
    <div className={`relative ${className}`}>
      {/* Dropdown trigger - Completely redesigned */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
      >
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
            <Plus className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <div className="font-bold text-white">Add Node</div>
            <div className="text-xs text-white/80">{getAllNodes.length} specialized nodes available</div>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-white/80 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown content - Completely rebuilt */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl z-50 max-h-[85vh] overflow-hidden backdrop-blur-sm">
          
          {/* Header with search */}
          <div className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border-b border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Node Palette</h3>
              <button
                onClick={clearFilters}
                className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Clear Filters
              </button>
            </div>
            
            {/* Advanced Search */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, role, description, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Master Type Filter */}
            <div className="mb-3">
              <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Master Node Types</div>
              <div className="flex flex-wrap gap-2">
                {Object.entries(masterNodeTypes).map(([key, config]) => {
                  const nodeCount = key === 'all' ? getAllNodes.length : getAllNodes.filter(n => n.masterCategory === key).length
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedMasterType(key)
                        if (key !== 'process') setSelectedSubCategory('all')
                      }}
                      className={`flex items-center space-x-2 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                        selectedMasterType === key
                          ? `bg-gradient-to-r ${config.color} text-white shadow-md transform scale-105`
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105'
                      }`}
                    >
                      <span>{config.icon}</span>
                      <span>{config.label}</span>
                      <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-xs">{nodeCount}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* SubCategory Filter (only for Process nodes) */}
            {selectedMasterType === 'process' && (
              <div>
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">Process SubCategories</div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(processSubCategories).map(([key, config]) => {
                    const nodeCount = key === 'all' 
                      ? getAllNodes.filter(n => n.masterCategory === 'process').length 
                      : subCategoryCounts[key] || 0
                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedSubCategory(key)}
                        className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                          selectedSubCategory === key
                            ? 'bg-green-500 text-white shadow-md transform scale-105'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-105'
                        }`}
                      >
                        <span>{config.icon}</span>
                        <span>{config.label}</span>
                        <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-xs">{nodeCount}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Node Grid - Completely redesigned */}
          <div className="max-h-[60vh] overflow-y-auto p-4">
            {filteredNodes.length > 0 ? (
              <div className="space-y-4">
                {/* Results summary */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {filteredNodes.length} of {getAllNodes.length} nodes
                  </div>
                  {(selectedMasterType !== 'all' || selectedSubCategory !== 'all' || searchTerm) && (
                    <div className="flex items-center space-x-2 text-xs">
                      {selectedMasterType !== 'all' && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                          {masterNodeTypes[selectedMasterType].label}
                        </span>
                      )}
                      {selectedSubCategory !== 'all' && (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full">
                          {processSubCategories[selectedSubCategory].label}
                        </span>
                      )}
                      {searchTerm && (
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-full">
                          "{searchTerm}"
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Node Grid */}
                <div className="grid grid-cols-1 gap-3">
                  {filteredNodes.map((node, index) => {
                    const roleConfig = NODE_ROLE_CONFIG[node.role] || {}
                    const masterConfig = masterNodeTypes[node.masterCategory] || {}
                    
                    return (
                      <button
                        key={`${node.id}-${index}`}
                        onClick={() => handleNodeSelect(node)}
                        className="w-full flex items-center space-x-4 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600 hover:shadow-lg transition-all duration-300 text-left group hover:transform hover:scale-[1.02]"
                      >
                        {/* Node Icon with gradient */}
                        <div 
                          className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg bg-gradient-to-r ${node.gradient || masterConfig.color} group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                        >
                          {node.icon || masterConfig.icon || '⚙️'}
                        </div>
                        
                        {/* Node Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-bold text-gray-900 dark:text-white text-base truncate">
                              {node.name}
                            </h4>
                            <div className="flex items-center space-x-1">
                              {/* Master Category Badge */}
                              <span className={`px-2 py-1 bg-gradient-to-r ${masterConfig.color} text-white text-xs rounded-full font-medium`}>
                                {masterConfig.label}
                              </span>
                              
                              {/* SubCategory Badge (for process nodes) */}
                              {node.subCategory && (
                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded-full font-medium">
                                  {processSubCategories[node.subCategory]?.label || node.subCategory}
                                </span>
                              )}
                              
                              {/* Content Writer Badge */}
                              {roleConfig.canWriteContent && (
                                <span className="px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs rounded-full font-bold flex items-center space-x-1">
                                  <Zap className="w-3 h-3" />
                                  <span>WRITER</span>
                                </span>
                              )}
                              
                              {/* AI Enabled Badge */}
                              {node.is_ai_enabled && (
                                <span className="px-2 py-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs rounded-full font-medium">
                                  AI
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                            {node.description}
                          </p>
                          
                          <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center space-x-1">
                              <span className="w-2 h-2 bg-primary-500 rounded-full"></span>
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
                      </button>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-semibold mb-2">No nodes found</h3>
                <p className="text-sm">Try adjusting your filters or search terms</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>

          {/* Footer with stats */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-4">
                <span>Total: {getAllNodes.length} nodes</span>
                <span>•</span>
                <span>Filtered: {filteredNodes.length} shown</span>
              </div>
              <div className="flex items-center space-x-2">
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
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20"
          onClick={() => setIsOpen(false)}
        />
      )}

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
    </div>
  )
}

export default NewNodePaletteDropdown