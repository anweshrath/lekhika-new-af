import React, { useState, useEffect } from 'react'
import { 
  Star, 
  Clock, 
  Users, 
  ChevronDown, 
  ChevronUp, 
  Search,
  Filter,
  SortAsc,
  Calendar,
  Zap,
  Crown,
  Copy,
  Trash2,
  MoreVertical,
  Plus
} from 'lucide-react'
import { flowPersistenceService } from '../../services/flowPersistenceService'
import toast from 'react-hot-toast'

const FlowSelector = ({ selectedFlow, onFlowSelect, onDuplicateFlow, onCreateNew, className = '' }) => {
  const [flows, setFlows] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [filterType, setFilterType] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [expandedFlow, setExpandedFlow] = useState(null)
  const [actionMenuOpen, setActionMenuOpen] = useState(null)

  useEffect(() => {
    loadFlows()
  }, [])

  const loadFlows = async () => {
    try {
      setLoading(true)
      const flowList = await flowPersistenceService.getAllFlows()
      setFlows(flowList)
    } catch (error) {
      console.error('Error loading flows:', error)
      toast.error('Failed to load flows')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteFlow = async (flowId, flowName) => {
    if (window.confirm(`Are you sure you want to delete "${flowName}"?`)) {
      try {
        await flowPersistenceService.deleteFlow(flowId)
        await loadFlows()
        toast.success(`Flow "${flowName}" deleted`)
        
        // Clear selection if deleted flow was selected
        if (selectedFlow?.id === flowId) {
          onFlowSelect(null)
        }
      } catch (error) {
        console.error('Error deleting flow:', error)
        toast.error('Failed to delete flow')
      }
    }
    setActionMenuOpen(null)
  }

  const handleSetDefault = async (flowId) => {
    try {
      await flowPersistenceService.setDefaultFlow(flowId)
      await loadFlows()
      toast.success('Default flow updated')
    } catch (error) {
      console.error('Error setting default flow:', error)
      toast.error('Failed to set default flow')
    }
    setActionMenuOpen(null)
  }

  const filteredAndSortedFlows = flows
    .filter(flow => {
      const matchesSearch = flow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           flow.description?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = filterType === 'all' || flow.type === filterType
      return matchesSearch && matchesType
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name)
        case 'usage':
          return (b.usageCount || 0) - (a.usageCount || 0)
        case 'recent':
        default:
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      }
    })

  const getFlowTypeIcon = (type) => {
    return type === 'full' ? Crown : Zap
  }

  const getFlowTypeLabel = (type) => {
    return type === 'full' ? 'Comprehensive' : 'Streamlined'
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className={`bg-gray-700 rounded-xl p-4 sm:p-6 lg:p-8 ${className}`}>
        <div className="text-center">
          <div className="animate-spin w-6 h-6 sm:w-8 sm:h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400 text-sm sm:text-base">Loading flows...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-gray-700 rounded-xl p-4 sm:p-6 ${className}`}>
      {/* Header - Mobile responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
        <h3 className="text-lg sm:text-xl font-semibold text-white">Saved Flows</h3>
        <div className="flex items-center justify-between sm:justify-end space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 bg-gray-600 hover:bg-gray-500 text-gray-300 rounded-lg transition-colors touch-manipulation"
            style={{ minWidth: '40px', minHeight: '40px' }}
          >
            <Filter className="w-4 h-4" />
          </button>
          <span className="text-xs sm:text-sm text-gray-400">{filteredAndSortedFlows.length} flows</span>
        </div>
      </div>

      {/* Search and Filters - Mobile responsive */}
      <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search flows..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 sm:py-3 bg-gray-600 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
            style={{ minHeight: '44px' }}
          />
        </div>

        {/* Filters - Mobile responsive */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 sm:py-3 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm sm:text-base touch-manipulation"
              style={{ minHeight: '44px' }}
            >
              <option value="recent">Recent</option>
              <option value="name">Name</option>
              <option value="usage">Usage</option>
            </select>
            
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 sm:py-3 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:border-blue-500 text-sm sm:text-base touch-manipulation"
              style={{ minHeight: '44px' }}
            >
              <option value="all">All Types</option>
              <option value="full">Comprehensive</option>
              <option value="simplified">Streamlined</option>
            </select>
          </div>
        )}
      </div>

      {/* Flow List - Mobile responsive */}
      <div className="space-y-2 sm:space-y-3 max-h-80 sm:max-h-96 overflow-y-auto">
        {filteredAndSortedFlows.length === 0 ? (
          <div className="text-center py-6 sm:py-8">
            <div className="text-gray-400 mb-4 text-sm sm:text-base">
              {searchTerm || filterType !== 'all' ? 'No flows match your criteria' : 'No saved flows yet'}
            </div>
            <button
              onClick={onCreateNew}
              className="flex items-center justify-center space-x-2 px-4 py-2 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm sm:text-base touch-manipulation mx-auto"
              style={{ minHeight: '44px' }}
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Flow</span>
            </button>
          </div>
        ) : (
          <>
            {/* CREATE NEW FLOW BUTTON - ALWAYS VISIBLE WHEN FLOWS EXIST */}
            <div className="mb-4 p-3 bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-700/50 rounded-lg">
              <button
                onClick={onCreateNew}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm sm:text-base touch-manipulation"
                style={{ minHeight: '44px' }}
              >
                <Plus className="w-4 h-4" />
                <span>Create New Flow</span>
              </button>
            </div>

            {/* EXISTING FLOWS LIST */}
            {filteredAndSortedFlows.map((flow) => {
              const TypeIcon = getFlowTypeIcon(flow.type)
              const isSelected = selectedFlow?.id === flow.id
              const isExpanded = expandedFlow === flow.id
              
              return (
                <div
                  key={flow.id}
                  className={`border-2 rounded-lg transition-all ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-900/20' 
                      : 'border-gray-600 bg-gray-600 hover:border-gray-500'
                  }`}
                >
                  {/* Main Flow Card - Mobile optimized */}
                  <div 
                    className="p-3 sm:p-4 cursor-pointer touch-manipulation"
                    onClick={() => onFlowSelect(flow)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                        {/* Flow Icon and Type */}
                        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                          <TypeIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${
                            flow.type === 'full' ? 'text-purple-400' : 'text-green-400'
                          }`} />
                          {flow.isDefault && (
                            <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 fill-current" />
                          )}
                        </div>
                        
                        {/* Flow Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                            <h4 className="font-medium text-white truncate text-sm sm:text-base">{flow.name}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full mt-1 sm:mt-0 self-start ${
                              flow.type === 'full' 
                                ? 'bg-purple-900/30 text-purple-300' 
                                : 'bg-green-900/30 text-green-300'
                            }`}>
                              {getFlowTypeLabel(flow.type)}
                            </span>
                          </div>
                          
                          {flow.description && (
                            <p className="text-xs sm:text-sm text-gray-400 truncate mt-1 line-clamp-2">{flow.description}</p>
                          )}
                          
                          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-2 text-xs text-gray-500 space-y-1 sm:space-y-0">
                            <span className="flex items-center space-x-1">
                              <Users className="w-3 h-3" />
                              <span>Used {flow.usageCount || 0} times</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(flow.createdAt)}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Actions - Mobile optimized */}
                      <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                        {/* Duplicate Button - ALWAYS VISIBLE */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onDuplicateFlow(flow)
                          }}
                          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors touch-manipulation"
                          title="Duplicate Flow"
                          style={{ minWidth: '36px', minHeight: '36px' }}
                        >
                          <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        
                        {/* More Actions Menu */}
                        <div className="relative">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setActionMenuOpen(actionMenuOpen === flow.id ? null : flow.id)
                            }}
                            className="p-2 bg-gray-500 hover:bg-gray-400 text-gray-300 rounded-lg transition-colors touch-manipulation"
                            style={{ minWidth: '36px', minHeight: '36px' }}
                          >
                            <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4" />
                          </button>
                          
                          {actionMenuOpen === flow.id && (
                            <div className="absolute right-0 top-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10 min-w-40 sm:min-w-48">
                              {!flow.isDefault && (
                                <button
                                  onClick={() => handleSetDefault(flow.id)}
                                  className="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm text-gray-300 hover:bg-gray-700 flex items-center space-x-2 touch-manipulation"
                                  style={{ minHeight: '40px' }}
                                >
                                  <Star className="w-4 h-4" />
                                  <span>Set as Default</span>
                                </button>
                              )}
                              <button
                                onClick={() => handleDeleteFlow(flow.id, flow.name)}
                                className="w-full px-3 sm:px-4 py-2 text-left text-xs sm:text-sm text-red-400 hover:bg-gray-700 flex items-center space-x-2 touch-manipulation"
                                style={{ minHeight: '40px' }}
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Delete Flow</span>
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {/* Expand/Collapse */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setExpandedFlow(isExpanded ? null : flow.id)
                          }}
                          className="p-2 bg-gray-500 hover:bg-gray-400 text-gray-300 rounded-lg transition-colors touch-manipulation"
                          style={{ minWidth: '36px', minHeight: '36px' }}
                        >
                          {isExpanded ? <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" /> : <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded Details - Mobile responsive */}
                  {isExpanded && (
                    <div className="px-3 sm:px-4 pb-3 sm:pb-4 border-t border-gray-500">
                      <div className="mt-3 space-y-2 text-xs sm:text-sm">
                        <div className="grid grid-cols-2 gap-2 sm:gap-4">
                          <div>
                            <span className="text-gray-400">Steps:</span>
                            <span className="text-white ml-2">{flow.steps?.length || 0}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Type:</span>
                            <span className="text-white ml-2">{getFlowTypeLabel(flow.type)}</span>
                          </div>
                        </div>
                        
                        {flow.steps && flow.steps.length > 0 && (
                          <div>
                            <span className="text-gray-400">Process Steps:</span>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {flow.steps.map((stepId, index) => (
                                <span
                                  key={stepId}
                                  className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs"
                                >
                                  {stepId.replace('_', ' ')}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* DUPLICATE BUTTON IN EXPANDED VIEW TOO */}
                        <div className="pt-2 border-t border-gray-600">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onDuplicateFlow(flow)
                            }}
                            className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition-colors text-sm touch-manipulation"
                            style={{ minHeight: '40px' }}
                          >
                            <Copy className="w-4 h-4" />
                            <span>Duplicate This Flow</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </>
        )}
      </div>

      {/* Click outside to close action menu */}
      {actionMenuOpen && (
        <div 
          className="fixed inset-0 z-5"
          onClick={() => setActionMenuOpen(null)}
        />
      )}
    </div>
  )
}

export default FlowSelector
