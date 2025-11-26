import React, { useState, useEffect } from 'react'
import { X, Search, Plus, Minus, GripVertical, Filter, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react'
import { alchemistNodePaletteService } from '../../services/alchemistNodePaletteService'
import { getAlchemistVariablesByType, getAllAlchemistVariables } from '../../data/alchemistVariables'

const AlchemistNodeSelectionModal = ({ isOpen, onClose, onNodeSelect, onVariablesChange }) => {
  const [activeTab, setActiveTab] = useState('nodes')
  const [nodeTypes, setNodeTypes] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedNodes, setSelectedNodes] = useState([])
  const [variables, setVariables] = useState([])
  const [variableSearchTerm, setVariableSearchTerm] = useState('')
  const [draggedVariable, setDraggedVariable] = useState(null)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadNodeTypes()
      loadVariables()
    }
  }, [isOpen])

  const loadNodeTypes = async () => {
    try {
      setLoading(true)
      const nodes = await alchemistNodePaletteService.getAllNodeTypes()
      const cats = await alchemistNodePaletteService.getCategories()
      
      setNodeTypes(nodes)
      setCategories(cats)
    } catch (error) {
      console.error('Error loading node types:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadVariables = () => {
    const allVariables = getAllAlchemistVariables()
    setVariables(allVariables)
  }

  const syncWithDatabase = async () => {
    setSyncing(true)
    try {
      await loadNodeTypes()
      console.log('✅ Node Selection Modal synced with database')
    } catch (error) {
      console.error('❌ Error syncing with database:', error)
    } finally {
      setSyncing(false)
    }
  }

  const filteredNodes = nodeTypes.filter(node => {
    const matchesSearch = node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         node.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || node.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const filteredVariables = variables.filter(variable => {
    const searchLower = variableSearchTerm.toLowerCase()
    return variable.name.toLowerCase().includes(searchLower) ||
           variable.description.toLowerCase().includes(searchLower) ||
           variable.type.toLowerCase().includes(searchLower)
  })

  const handleNodeSelect = (node) => {
    setSelectedNodes(prev => [...prev, node])
  }

  const handleNodeRemove = (nodeId) => {
    setSelectedNodes(prev => prev.filter(node => node.node_id !== nodeId))
  }

  const handleVariableAdd = (variable) => {
    // Add variable to selected nodes or create a global variable
    console.log('Adding variable:', variable)
  }

  const handleVariableRemove = (variableId) => {
    setVariables(prev => prev.filter(v => v.id !== variableId))
  }

  const handleDragStart = (e, variable) => {
    setDraggedVariable(variable)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, targetIndex) => {
    e.preventDefault()
    if (draggedVariable) {
      const newVariables = [...variables]
      const draggedIndex = newVariables.findIndex(v => v.id === draggedVariable.id)
      newVariables.splice(draggedIndex, 1)
      newVariables.splice(targetIndex, 0, draggedVariable)
      setVariables(newVariables)
      setDraggedVariable(null)
    }
  }

  const handleCreateFlow = () => {
    onNodeSelect(selectedNodes)
    onClose()
  }

  const groupedNodes = filteredNodes.reduce((acc, node) => {
    if (!acc[node.category]) {
      acc[node.category] = []
    }
    acc[node.category].push(node)
    return acc
  }, {})

  const getCategoryDisplayName = (category) => {
    const categoryMap = {
      'input': 'Input Nodes',
      'process': 'Process Nodes', 
      'condition': 'Condition Nodes',
      'structural': 'Structural Nodes',
      'output': 'Output Nodes'
    }
    return categoryMap[category] || category
  }

  const getCategoryIcon = (category) => {
    const iconMap = {
      'input': '📥',
      'process': '⚙️',
      'condition': '🔀',
      'structural': '🏗️',
      'output': '📤'
    }
    return iconMap[category] || '📦'
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl w-[90vw] h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Create Custom Alchemist Flow</h2>
            <p className="text-gray-400 mt-1">Select nodes and configure variables for your workflow</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={syncWithDatabase}
              disabled={syncing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              {syncing ? 'Syncing...' : 'Sync Database'}
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('nodes')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'nodes'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Node Selection
          </button>
          <button
            onClick={() => setActiveTab('variables')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'variables'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Variables Configuration
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'nodes' && (
            <div className="h-full flex">
              {/* Node Palette */}
              <div className="w-2/3 p-6 overflow-y-auto">
                {/* Search and Filter */}
                <div className="mb-6 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search nodes..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        selectedCategory === 'all'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 text-gray-400 hover:text-white'
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map(category => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`px-4 py-2 rounded-lg transition-colors ${
                          selectedCategory === category
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-800 text-gray-400 hover:text-white'
                        }`}
                      >
                        {getCategoryDisplayName(category)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Node Grid */}
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-gray-400">Loading nodes...</div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {Object.entries(groupedNodes).map(([category, nodes]) => (
                      <div key={category} className="space-y-3">
                        <div className="flex items-center gap-2 text-lg font-semibold text-white">
                          <span>{getCategoryIcon(category)}</span>
                          <span>{getCategoryDisplayName(category)}</span>
                          <span className="text-sm text-gray-400">({nodes.length})</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {nodes.map(node => (
                            <div
                              key={node.node_id}
                              className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer"
                              onClick={() => handleNodeSelect(node)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-2">
                                    <span className="text-2xl">{node.icon}</span>
                                    <h3 className="font-semibold text-white">{node.name}</h3>
                                  </div>
                                  <p className="text-gray-400 text-sm mb-3">{node.description}</p>
                                  
                                  {node.configuration?.features && (
                                    <div className="flex flex-wrap gap-1 mb-2">
                                      {node.configuration.features.slice(0, 3).map((feature, idx) => (
                                        <span
                                          key={idx}
                                          className="text-xs bg-blue-600 text-white px-2 py-1 rounded"
                                        >
                                          {feature}
                                        </span>
                                      ))}
                                      {node.configuration.features.length > 3 && (
                                        <span className="text-xs text-gray-400">
                                          +{node.configuration.features.length - 3} more
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                
                                <button className="p-1 hover:bg-gray-700 rounded">
                                  <Plus className="w-4 h-4 text-green-400" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Selected Nodes */}
              <div className="w-1/3 p-6 bg-gray-800 border-l border-gray-700 overflow-y-auto">
                <h3 className="text-lg font-semibold text-white mb-4">Selected Nodes ({selectedNodes.length})</h3>
                
                {selectedNodes.length === 0 ? (
                  <div className="text-gray-400 text-center py-8">
                    No nodes selected yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedNodes.map((node, index) => (
                      <div
                        key={node.node_id}
                        className="bg-gray-700 rounded-lg p-3 border border-gray-600"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{node.icon}</span>
                            <div>
                              <div className="font-medium text-white">{node.name}</div>
                              <div className="text-xs text-gray-400">Step {index + 1}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleNodeRemove(node.node_id)}
                            className="p-1 hover:bg-gray-600 rounded"
                          >
                            <Minus className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'variables' && (
            <div className="h-full flex">
              {/* Available Variables */}
              <div className="w-1/2 p-6 overflow-y-auto">
                <h3 className="text-lg font-semibold text-white mb-4">Available Variables</h3>
                
                {/* Variable Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search variables..."
                    value={variableSearchTerm}
                    onChange={(e) => setVariableSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Variable List */}
                <div className="space-y-2">
                  {filteredVariables.map(variable => (
                    <div
                      key={variable.id}
                      className="bg-gray-800 rounded-lg p-3 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer"
                      onClick={() => handleVariableAdd(variable)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-white">{variable.name}</h4>
                            <span className="text-xs bg-gray-600 text-gray-300 px-2 py-1 rounded">
                              {variable.type}
                            </span>
                            {variable.required && (
                              <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">
                                Required
                              </span>
                            )}
                          </div>
                          <p className="text-gray-400 text-sm">{variable.description}</p>
                        </div>
                        <button className="p-1 hover:bg-gray-700 rounded">
                          <Plus className="w-4 h-4 text-green-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Selected Variables */}
              <div className="w-1/2 p-6 bg-gray-800 border-l border-gray-700 overflow-y-auto">
                <h3 className="text-lg font-semibold text-white mb-4">Flow Variables</h3>
                
                <div className="space-y-2">
                  {variables.map((variable, index) => (
                    <div
                      key={variable.id}
                      className="bg-gray-700 rounded-lg p-3 border border-gray-600"
                      draggable
                      onDragStart={(e) => handleDragStart(e, variable)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, index)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                          <div>
                            <div className="font-medium text-white">{variable.name}</div>
                            <div className="text-xs text-gray-400">{variable.type}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleVariableRemove(variable.id)}
                          className="p-1 hover:bg-gray-600 rounded"
                        >
                          <Minus className="w-4 h-4 text-red-400" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <div className="text-sm text-gray-400">
            {activeTab === 'nodes' && `${selectedNodes.length} nodes selected`}
            {activeTab === 'variables' && `${variables.length} variables configured`}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateFlow}
              disabled={selectedNodes.length === 0}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              Create Flow
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AlchemistNodeSelectionModal
