import React, { useState, useEffect } from 'react'
import { Plus, Settings, Play, Pause, MoreVertical, Search, Filter } from 'lucide-react'
import CreateEngineModal from './CreateEngineModal'
import EngineEditor from './EngineEditor'
import UserAssignments from './UserAssignments'
import ContentCreationFlow from './ContentCreationFlow'
// COMMENTED OUT - FAKE ENGINE SERVICE
// import { aiEngineService } from '../../services/aiEngineService'
import toast from 'react-hot-toast'

const AIEngines = ({ serviceStatus }) => {
  const [activeTab, setActiveTab] = useState('flow')
  const [engines, setEngines] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingEngine, setEditingEngine] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    loadEngines()
  }, [])

  const loadEngines = async () => {
    try {
      // COMMENTED OUT - FAKE ENGINE SERVICE
      // const data = await aiEngineService.getAllEngines()
      setEngines([]) // No fake engines
      console.log('⚠️ AIEngines component uses fake service - disabled')
    } catch (error) {
      console.error('Failed to load engines:', error)
      toast.error('Failed to load engines')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEngine = async (engineData) => {
    try {
      // COMMENTED OUT - FAKE ENGINE SERVICE
      // const newEngine = await aiEngineService.createEngine(engineData)
      toast.error('This component uses fake service - create engines via Flow page instead')
      setShowCreateModal(false)
    } catch (error) {
      console.error('Failed to create engine:', error)
      toast.error('Failed to create engine')
    }
  }

  const handleUpdateEngine = async (engineId, updates) => {
    try {
      // COMMENTED OUT - FAKE ENGINE SERVICE
      // const updatedEngine = await aiEngineService.updateEngine(engineId, updates)
      toast.error('This component uses fake service - edit engines via Flow page instead')
      setEditingEngine(null)
    } catch (error) {
      console.error('Failed to update engine:', error)
      toast.error('Failed to update engine')
    }
  }

  const handleDeleteEngine = async (engineId) => {
    if (!confirm('Are you sure you want to delete this engine?')) return
    
    try {
      // COMMENTED OUT - FAKE ENGINE SERVICE
      // await aiEngineService.deleteEngine(engineId)
      toast.error('This component uses fake service - delete via Engines page instead')
    } catch (error) {
      console.error('Failed to delete engine:', error)
      toast.error('Failed to delete engine')
    }
  }

  const handleToggleEngine = async (engineId, active) => {
    try {
      await handleUpdateEngine(engineId, { active })
    } catch (error) {
      console.error('Failed to toggle engine:', error)
    }
  }

  const filteredEngines = engines.filter(engine => {
    const matchesSearch = engine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         engine.description?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && engine.active) ||
                         (filterStatus === 'inactive' && !engine.active)
    
    return matchesSearch && matchesFilter
  })

  const tabs = [
    { id: 'flow', name: 'Content Creation Flow', icon: Settings },
    { id: 'engines', name: 'Engine Management', icon: Settings },
    { id: 'assignments', name: 'User Assignments', icon: Settings }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Engines</h1>
          <p className="text-gray-400">Configure and manage your AI processing engines</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'flow' && (
          <ContentCreationFlow serviceStatus={serviceStatus} />
        )}

        {activeTab === 'engines' && (
          <div className="space-y-6">
            {/* Controls */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search engines..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Engines</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>Create Engine</span>
              </button>
            </div>

            {/* Engines Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEngines.map((engine) => (
                <div key={engine.id} className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${engine.active ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                      <h3 className="font-semibold text-white">{engine.name}</h3>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleToggleEngine(engine.id, !engine.active)}
                        className={`p-1 rounded ${engine.active ? 'text-green-400 hover:text-green-300' : 'text-gray-400 hover:text-gray-300'}`}
                      >
                        {engine.active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      
                      <button
                        onClick={() => setEditingEngine(engine)}
                        className="p-1 text-gray-400 hover:text-gray-300"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm mb-4">{engine.description}</p>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Models:</span>
                      <span className="text-white">{engine.models?.length || 0}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Mode:</span>
                      <span className="text-white capitalize">{engine.executionMode || 'sequential'}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Tier:</span>
                      <span className="text-white capitalize">{engine.tier || 'hobby'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredEngines.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  {searchTerm || filterStatus !== 'all' ? 'No engines match your filters' : 'No engines created yet'}
                </div>
                {!searchTerm && filterStatus === 'all' && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Create Your First Engine
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'assignments' && (
          <UserAssignments engines={engines} />
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <CreateEngineModal
          serviceStatus={serviceStatus}
          onClose={() => setShowCreateModal(false)}
          onSave={handleCreateEngine}
        />
      )}

      {editingEngine && (
        <EngineEditor
          engine={editingEngine}
          serviceStatus={serviceStatus}
          onClose={() => setEditingEngine(null)}
          onSave={(updates) => handleUpdateEngine(editingEngine.id, updates)}
          onDelete={() => handleDeleteEngine(editingEngine.id)}
        />
      )}
    </div>
  )
}

export default AIEngines
