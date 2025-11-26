import React, { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { 
  Settings, 
  Plus, 
  Play, 
  Pause, 
  Trash2, 
  Copy, 
  Edit3, 
  Zap, 
  Shield, 
  Users, 
  Crown,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Layers,
  ArrowRight,
  RotateCcw,
  Target,
  Sliders
} from 'lucide-react'
// COMMENTED OUT - FAKE ENGINE SERVICE
// import { aiEngineService } from '../../services/aiEngineService'
import CreateEngineModal from './CreateEngineModal'
import EngineEditor from './EngineEditor'
import UserAssignments from './UserAssignments'
import EngineAnalytics from './EngineAnalytics'
import ContentCreationFlow from './ContentCreationFlow'
import toast from 'react-hot-toast'

const AIEnginePlayground = ({ aiServices }) => {
  const [engines, setEngines] = useState([])
  const [selectedEngine, setSelectedEngine] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [serviceStatus, setServiceStatus] = useState({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('content-flow')

  useEffect(() => {
    loadEngines()
    checkServiceStatus()
  }, [aiServices])

  const loadEngines = async () => {
    try {
      // COMMENTED OUT - FAKE ENGINE SERVICE
      // const engineData = await aiEngineService.getAllEngines()
      setEngines([])
      console.log('⚠️ AIEnginePlayground uses fake service - disabled')
    } catch (error) {
      toast.error('Failed to load AI engines')
    } finally {
      setLoading(false)
    }
  }

  const checkServiceStatus = () => {
    const status = {}
    
    // First check aiServices prop (from AI Services tab validation)
    if (aiServices) {
      Object.entries(aiServices).forEach(([service, serviceData]) => {
        status[service] = {
          valid: serviceData.success,
          configured: serviceData.success
        }
      })
    }
    
    // Fallback to localStorage check
    const apiKeys = {
      openai: localStorage.getItem('openai_api_key'),
      claude: localStorage.getItem('claude_api_key'),
      gemini: localStorage.getItem('gemini_api_key'),
      mistral: localStorage.getItem('mistral_api_key'),
      grok: localStorage.getItem('grok_api_key'),
      perplexity: localStorage.getItem('perplexity_api_key')
    }

    Object.entries(apiKeys).forEach(([service, key]) => {
      // Only update if not already set from aiServices
      if (!status[service]) {
        status[service] = {
          valid: key && key !== '••••••••••••••••' && key.length > 10,
          configured: !!key
        }
      }
    })

    setServiceStatus(status)
  }

  const handleDragEnd = (result) => {
    if (!result.destination) return

    const items = Array.from(engines)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setEngines(items)
    // COMMENTED OUT - FAKE ENGINE SERVICE
    // aiEngineService.updateEngineOrder(items.map(engine => engine.id))
  }

  const duplicateEngine = async (engine) => {
    try {
      // COMMENTED OUT - FAKE ENGINE SERVICE
      // const duplicated = await aiEngineService.duplicateEngine(engine.id)
      toast.error('This component uses fake service - duplicate via Engines page instead')
    } catch (error) {
      toast.error('Failed to duplicate engine')
    }
  }

  const deleteEngine = async (engineId) => {
    if (!confirm('Are you sure you want to delete this engine?')) return
    
    try {
      // COMMENTED OUT - FAKE ENGINE SERVICE
      // await aiEngineService.deleteEngine(engineId)
      toast.error('This component uses fake service - delete via Engines page instead')
    } catch (error) {
      toast.error('Failed to delete engine')
    }
  }

  const toggleEngineStatus = async (engineId) => {
    try {
      // COMMENTED OUT - FAKE ENGINE SERVICE
      // const engine = engines.find(e => e.id === engineId)
      // const updated = await aiEngineService.updateEngine(engineId, {
      //   ...engine,
      //   active: !engine.active
      // })
      toast.error('This component uses fake service - toggle via Engines page instead')
      return
      const engine = engines.find(e => e.id === engineId)
      const updated = null
      
      setEngines(engines.map(e => e.id === engineId ? updated : e))
      toast.success(`Engine ${updated.active ? 'activated' : 'deactivated'}`)
    } catch (error) {
      toast.error('Failed to update engine status')
    }
  }

  const getEngineStatusColor = (engine) => {
    if (!engine.active) return 'bg-gray-500'
    
    const workingModels = engine.models.filter(model => 
      serviceStatus[model.service]?.valid
    ).length
    
    if (workingModels === 0) return 'bg-red-500'
    if (workingModels < engine.models.length) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getEnginePerformanceScore = (engine) => {
    const workingModels = engine.models.filter(model => 
      serviceStatus[model.service]?.valid
    ).length
    
    const totalModels = engine.models.length
    if (totalModels === 0) return 0
    
    const baseScore = (workingModels / totalModels) * 100
    const fallbackBonus = engine.fallbackConfig?.enabled ? 10 : 0
    const parallelBonus = engine.executionMode === 'parallel' ? 5 : 0
    
    return Math.min(100, baseScore + fallbackBonus + parallelBonus)
  }

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
          <h1 className="text-3xl font-bold text-white">🚀 AI Engine Playground</h1>
          <p className="text-gray-400 mt-1">Design and orchestrate multi-LLM engines for book generation</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => checkServiceStatus()}
            className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Refresh Status</span>
          </button>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Engine</span>
          </button>
        </div>
      </div>

      {/* Service Status Debug */}
      <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-3">Service Status Debug</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(serviceStatus).map(([service, status]) => (
            <div key={service} className={`p-3 rounded-lg border ${
              status.valid ? 'border-green-500 bg-green-900/20' : 'border-red-500 bg-red-900/20'
            }`}>
              <div className="text-sm font-medium text-white capitalize">{service}</div>
              <div className={`text-xs ${status.valid ? 'text-green-400' : 'text-red-400'}`}>
                {status.valid ? 'Available' : 'Not configured'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'content-flow', label: 'Content Creation Flow', icon: Target },
            { id: 'engines', label: 'Engines', icon: Layers },
            { id: 'assignments', label: 'User Assignments', icon: Users },
            { id: 'analytics', label: 'Performance', icon: Activity }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-red-500 text-red-400'
                  : 'border-transparent text-gray-500 hover:text-gray-300 hover:border-gray-600'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Content Creation Flow Tab */}
      {activeTab === 'content-flow' && (
        <ContentCreationFlow serviceStatus={serviceStatus} />
      )}

      {/* Engines Tab */}
      {activeTab === 'engines' && (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="engines">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {engines.map((engine, index) => (
                  <Draggable key={engine.id} draggableId={engine.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`bg-gray-800 rounded-xl shadow-sm border-2 transition-all duration-200 ${
                          snapshot.isDragging 
                            ? 'border-red-400 shadow-lg transform rotate-2' 
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                      >
                        <EngineCard
                          engine={engine}
                          serviceStatus={serviceStatus}
                          onEdit={() => setSelectedEngine(engine)}
                          onDuplicate={() => duplicateEngine(engine)}
                          onDelete={() => deleteEngine(engine.id)}
                          onToggleStatus={() => toggleEngineStatus(engine.id)}
                          performanceScore={getEnginePerformanceScore(engine)}
                          statusColor={getEngineStatusColor(engine)}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* User Assignments Tab */}
      {activeTab === 'assignments' && (
        <UserAssignments 
          engines={engines}
          onShowAssignModal={() => setShowAssignModal(true)}
        />
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <EngineAnalytics 
          engines={engines}
          serviceStatus={serviceStatus}
        />
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateEngineModal
          onClose={() => setShowCreateModal(false)}
          onEngineCreated={(newEngine) => {
            setEngines([...engines, newEngine])
            setShowCreateModal(false)
          }}
          serviceStatus={serviceStatus}
        />
      )}

      {selectedEngine && (
        <EngineEditor
          engine={selectedEngine}
          onClose={() => setSelectedEngine(null)}
          onEngineUpdated={(updatedEngine) => {
            setEngines(engines.map(e => e.id === updatedEngine.id ? updatedEngine : e))
            setSelectedEngine(null)
          }}
          serviceStatus={serviceStatus}
        />
      )}
    </div>
  )
}

// Engine Card Component
const EngineCard = ({ 
  engine, 
  serviceStatus, 
  onEdit, 
  onDuplicate, 
  onDelete, 
  onToggleStatus,
  performanceScore,
  statusColor
}) => {
  const workingModels = engine.models.filter(model => 
    serviceStatus[model.service]?.valid
  ).length

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${statusColor}`}></div>
          <div>
            <h3 className="font-semibold text-white">{engine.name}</h3>
            <p className="text-sm text-gray-400">{engine.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={onToggleStatus}
            className={`p-1 rounded ${engine.active ? 'text-green-400' : 'text-gray-500'}`}
          >
            {engine.active ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
          
          <button
            onClick={onEdit}
            className="p-1 text-gray-400 hover:text-red-400"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Performance Score */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-400">Performance</span>
          <span className="font-medium text-white">{Math.round(performanceScore)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-300 ${
              performanceScore >= 80 ? 'bg-green-500' :
              performanceScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${performanceScore}%` }}
          ></div>
        </div>
      </div>

      {/* Models Status */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-400">Models</span>
          <span className="text-white">{workingModels}/{engine.models.length}</span>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {engine.models.slice(0, 4).map((model, index) => (
            <div
              key={index}
              className={`px-2 py-1 rounded text-xs ${
                serviceStatus[model.service]?.valid
                  ? 'bg-green-900/30 text-green-400'
                  : 'bg-red-900/30 text-red-400'
              }`}
            >
              {model.service}
            </div>
          ))}
          {engine.models.length > 4 && (
            <div className="px-2 py-1 rounded text-xs bg-gray-700 text-gray-400">
              +{engine.models.length - 4}
            </div>
          )}
        </div>
      </div>

      {/* Configuration Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Execution</span>
          <span className="capitalize text-white">{engine.executionMode}</span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Fallback</span>
          <span className={`${engine.fallbackConfig?.enabled ? 'text-green-400' : 'text-gray-500'}`}>
            {engine.fallbackConfig?.enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Tasks</span>
          <span className="text-white">{engine.taskAssignments?.length || 0}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-700">
        <div className="flex items-center space-x-2">
          <button
            onClick={onDuplicate}
            className="p-1 text-gray-400 hover:text-blue-400"
            title="Duplicate"
          >
            <Copy className="w-4 h-4" />
          </button>
          
          <button
            onClick={onDelete}
            className="p-1 text-gray-400 hover:text-red-400"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center space-x-1 text-xs text-gray-500">
          <Crown className="w-3 h-3" />
          <span>{engine.tier || 'All'}</span>
        </div>
      </div>
    </div>
  )
}

export default AIEnginePlayground
