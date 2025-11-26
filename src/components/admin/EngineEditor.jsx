import React, { useState, useEffect } from 'react'
import { 
  X, 
  Plus, 
  Trash2, 
  Settings, 
  Zap, 
  Shield, 
  ArrowRight,
  ArrowDown,
  RotateCcw,
  Target,
  Sliders,
  AlertTriangle,
  CheckCircle,
  Clock,
  Play,
  Pause
} from 'lucide-react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { aiEngineService } from '../../services/aiEngineService'
import toast from 'react-hot-toast'

const EngineEditor = ({ engine, onClose, onEngineUpdated, serviceStatus }) => {
  const [formData, setFormData] = useState({
    name: engine.name || '',
    description: engine.description || '',
    tier: engine.tier || 'hobby',
    active: engine.active || false,
    executionMode: engine.executionMode || 'sequential',
    models: engine.models || [],
    taskAssignments: engine.taskAssignments || [],
    fallbackConfig: engine.fallbackConfig || {
      enabled: true,
      strategy: 'auto',
      maxRetries: 3,
      retryDelay: 1000,
      customOrder: []
    },
    performanceConfig: engine.performanceConfig || {
      timeout: 30000,
      maxConcurrent: 3,
      rateLimiting: true,
      caching: true
    }
  })

  const [activeTab, setActiveTab] = useState('models')
  const [showAddModel, setShowAddModel] = useState(false)
  const [testResults, setTestResults] = useState({})
  const [testing, setTesting] = useState(false)

  const availableServices = [
    { id: 'openai', name: 'OpenAI', models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
    { id: 'claude', name: 'Claude', models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'] },
    { id: 'gemini', name: 'Google Gemini', models: ['gemini-pro', 'gemini-pro-vision'] },
    { id: 'grok', name: 'GROK', models: ['grok-beta'] },
    { id: 'perplexity', name: 'Perplexity', models: ['llama-3-sonar-large', 'llama-3-sonar-small'] },
    { id: 'mistral', name: 'Mistral', models: ['mistral-large', 'mistral-medium', 'mistral-small'] }
  ]

  const taskTypes = [
    { id: 'research', name: 'Research Generation', description: 'Market research and data gathering' },
    { id: 'outline', name: 'Outline Creation', description: 'Book structure and chapter planning' },
    { id: 'content', name: 'Content Writing', description: 'Chapter and section content generation' },
    { id: 'enhancement', name: 'Content Enhancement', description: 'Improving and refining existing content' },
    { id: 'images', name: 'Image Generation', description: 'Creating visual content and illustrations' }
  ]

  const handleModelDragEnd = (result) => {
    if (!result.destination) return

    const items = Array.from(formData.models)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setFormData({ ...formData, models: items })
  }

  const addModel = (service, model) => {
    const newModel = {
      id: `${service}-${model}-${Date.now()}`,
      service,
      model,
      priority: formData.models.length + 1,
      config: {
        temperature: 0.7,
        maxTokens: 2000,
        topP: 1.0
      }
    }

    setFormData({
      ...formData,
      models: [...formData.models, newModel]
    })
    setShowAddModel(false)
  }

  const removeModel = (modelId) => {
    setFormData({
      ...formData,
      models: formData.models.filter(m => m.id !== modelId)
    })
  }

  const updateModelConfig = (modelId, config) => {
    setFormData({
      ...formData,
      models: formData.models.map(m => 
        m.id === modelId ? { ...m, config: { ...m.config, ...config } } : m
      )
    })
  }

  const testEngine = async () => {
    setTesting(true)
    setTestResults({})

    try {
      const results = await aiEngineService.testEngine(engine.id, {
        prompt: "Write a brief introduction about artificial intelligence.",
        taskType: 'content'
      })
      
      setTestResults(results)
      toast.success('Engine test completed')
    } catch (error) {
      toast.error('Engine test failed')
      setTestResults({ error: error.message })
    } finally {
      setTesting(false)
    }
  }

  const saveEngine = async () => {
    try {
      const updatedEngine = await aiEngineService.updateEngine(engine.id, formData)
      onEngineUpdated(updatedEngine)
      toast.success('Engine updated successfully')
    } catch (error) {
      toast.error('Failed to update engine')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Edit Engine: {engine.name}</h2>
            <p className="text-gray-600 mt-1">Configure models, tasks, and fallback strategies</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={testEngine}
              disabled={testing}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
            >
              {testing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Test Engine</span>
                </>
              )}
            </button>
            
            <button
              onClick={saveEngine}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
            <div className="space-y-4">
              {/* Basic Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Engine Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tier
                </label>
                <select
                  value={formData.tier}
                  onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="hobby">Hobby</option>
                  <option value="expert">Expert</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Execution Mode
                </label>
                <select
                  value={formData.executionMode}
                  onChange={(e) => setFormData({ ...formData, executionMode: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="sequential">Sequential</option>
                  <option value="parallel">Parallel</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="active" className="ml-2 text-sm text-gray-700">
                  Engine Active
                </label>
              </div>
            </div>

            {/* Navigation */}
            <nav className="mt-8 space-y-1">
              {[
                { id: 'models', label: 'Models', icon: Zap },
                { id: 'tasks', label: 'Task Assignment', icon: Target },
                { id: 'fallback', label: 'Fallback Config', icon: Shield },
                { id: 'performance', label: 'Performance', icon: Sliders },
                { id: 'test', label: 'Test Results', icon: CheckCircle }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="text-sm">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'models' && (
              <ModelsTab
                models={formData.models}
                serviceStatus={serviceStatus}
                onModelDragEnd={handleModelDragEnd}
                onAddModel={() => setShowAddModel(true)}
                onRemoveModel={removeModel}
                onUpdateModelConfig={updateModelConfig}
              />
            )}

            {activeTab === 'tasks' && (
              <TasksTab
                taskAssignments={formData.taskAssignments}
                models={formData.models}
                taskTypes={taskTypes}
                onChange={(assignments) => setFormData({ ...formData, taskAssignments: assignments })}
              />
            )}

            {activeTab === 'fallback' && (
              <FallbackTab
                config={formData.fallbackConfig}
                models={formData.models}
                onChange={(config) => setFormData({ ...formData, fallbackConfig: config })}
              />
            )}

            {activeTab === 'performance' && (
              <PerformanceTab
                config={formData.performanceConfig}
                onChange={(config) => setFormData({ ...formData, performanceConfig: config })}
              />
            )}

            {activeTab === 'test' && (
              <TestResultsTab
                results={testResults}
                testing={testing}
                onTest={testEngine}
              />
            )}
          </div>
        </div>

        {/* Add Model Modal */}
        {showAddModel && (
          <AddModelModal
            availableServices={availableServices}
            serviceStatus={serviceStatus}
            onAddModel={addModel}
            onClose={() => setShowAddModel(false)}
          />
        )}
      </div>
    </div>
  )
}

// Models Tab Component
const ModelsTab = ({ models, serviceStatus, onModelDragEnd, onAddModel, onRemoveModel, onUpdateModelConfig }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Model Configuration</h3>
        <button
          onClick={onAddModel}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Model</span>
        </button>
      </div>

      <DragDropContext onDragEnd={onModelDragEnd}>
        <Droppable droppableId="models">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
              {models.map((model, index) => (
                <Draggable key={model.id} draggableId={model.id} index={index}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`bg-white border rounded-lg p-4 ${
                        snapshot.isDragging ? 'shadow-lg' : 'shadow-sm'
                      }`}
                    >
                      <ModelConfigCard
                        model={model}
                        serviceStatus={serviceStatus}
                        onRemove={() => onRemoveModel(model.id)}
                        onUpdateConfig={(config) => onUpdateModelConfig(model.id, config)}
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

      {models.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Zap className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>No models configured. Add your first model to get started.</p>
        </div>
      )}
    </div>
  )
}

// Model Config Card Component
const ModelConfigCard = ({ model, serviceStatus, onRemove, onUpdateConfig }) => {
  const isOnline = serviceStatus[model.service]?.valid

  return (
    <div className="flex items-start space-x-4">
      <div className={`w-3 h-3 rounded-full mt-2 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
      
      <div className="flex-1">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="font-medium text-gray-900">{model.service}</h4>
            <p className="text-sm text-gray-600">{model.model}</p>
          </div>
          
          <button
            onClick={onRemove}
            className="p-1 text-gray-400 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Temperature
            </label>
            <input
              type="number"
              min="0"
              max="2"
              step="0.1"
              value={model.config.temperature}
              onChange={(e) => onUpdateConfig({ temperature: parseFloat(e.target.value) })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Max Tokens
            </label>
            <input
              type="number"
              min="1"
              max="4000"
              value={model.config.maxTokens}
              onChange={(e) => onUpdateConfig({ maxTokens: parseInt(e.target.value) })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Top P
            </label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.1"
              value={model.config.topP}
              onChange={(e) => onUpdateConfig({ topP: parseFloat(e.target.value) })}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default EngineEditor
