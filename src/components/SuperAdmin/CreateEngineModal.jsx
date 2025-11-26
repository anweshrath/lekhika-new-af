import React, { useState, useEffect } from 'react'
import { X, Plus, Trash2, Info, DollarSign, Zap, Clock, AlertTriangle } from 'lucide-react'
// COMMENTED OUT - FAKE ENGINE SERVICE
// import { aiEngineService } from '../../services/aiEngineService'
import toast from 'react-hot-toast'

const CreateEngineModal = ({ onClose, onEngineCreated, serviceStatus }) => {
  const [engineData, setEngineData] = useState({
    name: '',
    description: '',
    executionMode: 'sequential',
    models: [],
    fallbackConfig: { enabled: false },
    taskAssignments: [],
    tier: 'hobby'
  })
  
  const [availableModels, setAvailableModels] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadAvailableModels()
  }, [serviceStatus])

  const loadAvailableModels = () => {
    const models = {}
    
    // Load models from localStorage for each configured service
    Object.entries(serviceStatus).forEach(([service, status]) => {
      if (status.valid) {
        try {
          const savedModels = localStorage.getItem(`superadmin_selected_models`)
          if (savedModels) {
            const selectedModels = JSON.parse(savedModels)
            if (selectedModels[service]) {
              // Get model details from validation service cache or create basic model info
              models[service] = [
                {
                  id: selectedModels[service],
                  name: selectedModels[service],
                  service: service,
                  contextWindow: getModelContextWindow(selectedModels[service]),
                  costPer1k: getModelCost(selectedModels[service])
                }
              ]
            }
          }
          
          // Fallback: create basic model entries for configured services
          if (!models[service]) {
            models[service] = [
              {
                id: getDefaultModelId(service),
                name: getDefaultModelName(service),
                service: service,
                contextWindow: getModelContextWindow(getDefaultModelId(service)),
                costPer1k: getModelCost(getDefaultModelId(service))
              }
            ]
          }
        } catch (error) {
          console.error(`Error loading models for ${service}:`, error)
        }
      }
    })
    
    setAvailableModels(models)
  }

  const getDefaultModelId = (service) => {
    const defaults = {
      openai: 'gpt-4',
      claude: 'claude-3-sonnet-20240229',
      gemini: 'gemini-pro',
      mistral: 'mistral-large-latest',
      grok: 'grok-beta',
      perplexity: 'llama-3.1-sonar-large-128k-online'
    }
    return defaults[service] || `${service}-default`
  }

  const getDefaultModelName = (service) => {
    const names = {
      openai: 'GPT-4',
      claude: 'Claude 3 Sonnet',
      gemini: 'Gemini Pro',
      mistral: 'Mistral Large',
      grok: 'Grok Beta',
      perplexity: 'Llama 3.1 Sonar Large'
    }
    return names[service] || `${service.charAt(0).toUpperCase() + service.slice(1)} Default`
  }

  const getModelContextWindow = (modelId) => {
    const contexts = {
      'gpt-4': 128000,
      'gpt-3.5-turbo': 16385,
      'claude-3-sonnet-20240229': 200000,
      'claude-3-haiku-20240307': 200000,
      'gemini-pro': 32768,
      'mistral-large-latest': 32768,
      'grok-beta': 131072,
      'llama-3.1-sonar-large-128k-online': 127072
    }
    return contexts[modelId] || 32000
  }

  const getModelCost = (modelId) => {
    const costs = {
      'gpt-4': 0.03,
      'gpt-3.5-turbo': 0.002,
      'claude-3-sonnet-20240229': 0.015,
      'claude-3-haiku-20240307': 0.0025,
      'gemini-pro': 0.001,
      'mistral-large-latest': 0.008,
      'grok-beta': 0.01,
      'llama-3.1-sonar-large-128k-online': 0.005
    }
    return costs[modelId] || 0.01
  }

  const addModel = (service, model) => {
    const newModel = {
      service,
      modelId: model.id,
      weight: 1,
      temperature: 0.7,
      maxTokens: 2000
    }
    
    setEngineData(prev => ({
      ...prev,
      models: [...prev.models, newModel]
    }))
  }

  const removeModel = (index) => {
    setEngineData(prev => ({
      ...prev,
      models: prev.models.filter((_, i) => i !== index)
    }))
  }

  const updateModel = (index, field, value) => {
    setEngineData(prev => ({
      ...prev,
      models: prev.models.map((model, i) => 
        i === index ? { ...model, [field]: value } : model
      )
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!engineData.name.trim()) {
      toast.error('Engine name is required')
      return
    }
    
    if (engineData.models.length === 0) {
      toast.error('At least one model is required')
      return
    }
    
    setLoading(true)
    
    try {
      // COMMENTED OUT - FAKE ENGINE SERVICE
      // const newEngine = await aiEngineService.createEngine(engineData)
      toast.error('This create engine modal uses fake service - use FlowSaveModal instead')
      onClose()
      // onEngineCreated(newEngine)
    } catch (error) {
      toast.error('Failed to create engine')
    } finally {
      setLoading(false)
    }
  }

  const getParameterTooltip = (param) => {
    const tooltips = {
      temperature: {
        title: "Temperature",
        description: "Controls creativity vs consistency",
        details: "Lower (0.1-0.3) = More focused, consistent responses. Higher (0.7-1.0) = More creative, varied responses.",
        economic: "Higher temperature may require more tokens for coherent output, increasing costs by 10-20%."
      },
      weight: {
        title: "Model Weight",
        description: "How much this model influences the final output",
        details: "Higher weight = More influence in the final result. Use 1 for equal influence, 2+ for primary models.",
        economic: "Higher weight models are used more frequently, directly impacting your API costs."
      },
      maxTokens: {
        title: "Max Tokens",
        description: "Maximum length of the response",
        details: "1 token ≈ 4 characters. 2000 tokens ≈ 1500 words. Adjust based on your content needs.",
        economic: "Directly affects cost - each token costs money. Set appropriately to avoid waste."
      }
    }
    return tooltips[param]
  }

  const TooltipIcon = ({ param }) => {
    const tooltip = getParameterTooltip(param)
    
    return (
      <div className="group relative">
        <Info className="w-4 h-4 text-gray-400 hover:text-blue-400 cursor-help" />
        <div className="absolute left-0 top-6 w-80 bg-gray-900 border border-gray-600 rounded-lg p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Info className="w-4 h-4 text-blue-400" />
              <h4 className="font-semibold text-white">{tooltip.title}</h4>
            </div>
            
            <p className="text-sm text-gray-300">{tooltip.description}</p>
            <p className="text-xs text-gray-400">{tooltip.details}</p>
            
            <div className="flex items-start space-x-2 p-2 bg-yellow-900/20 border border-yellow-700/50 rounded">
              <DollarSign className="w-3 h-3 text-yellow-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-yellow-300">{tooltip.economic}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const ExecutionModeCard = ({ mode, title, description, isSelected, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-4 rounded-lg border-2 transition-all text-left ${
        isSelected 
          ? 'border-red-500 bg-red-900/20' 
          : 'border-gray-600 bg-gray-700 hover:border-gray-500'
      }`}
    >
      <h4 className="font-medium text-white mb-1">{title}</h4>
      <p className="text-sm text-gray-400">{description}</p>
    </button>
  )

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">🚀 Create AI Engine</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Engine Name *
              </label>
              <input
                type="text"
                value={engineData.name}
                onChange={(e) => setEngineData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                placeholder="e.g., Creative Writing Engine"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tier
              </label>
              <select
                value={engineData.tier}
                onChange={(e) => setEngineData(prev => ({ ...prev, tier: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="hobby">Hobby</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={engineData.description}
              onChange={(e) => setEngineData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
              rows="3"
              placeholder="Describe what this engine is designed for..."
            />
          </div>

          {/* Execution Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Execution Mode
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <ExecutionModeCard
                mode="sequential"
                title="Sequential"
                description="Execute models one after another"
                isSelected={engineData.executionMode === 'sequential'}
                onClick={() => setEngineData(prev => ({ ...prev, executionMode: 'sequential' }))}
              />
              <ExecutionModeCard
                mode="parallel"
                title="Parallel"
                description="Execute models simultaneously"
                isSelected={engineData.executionMode === 'parallel'}
                onClick={() => setEngineData(prev => ({ ...prev, executionMode: 'parallel' }))}
              />
              <ExecutionModeCard
                mode="hybrid"
                title="Hybrid"
                description="Smart execution based on task"
                isSelected={engineData.executionMode === 'hybrid'}
                onClick={() => setEngineData(prev => ({ ...prev, executionMode: 'hybrid' }))}
              />
            </div>
          </div>

          {/* Models Configuration */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium text-gray-300">
                Models Configuration *
              </label>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-yellow-400">Configure at least one model</span>
              </div>
            </div>

            {/* Available Models */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-300 mb-2">Available Models</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                {Object.entries(availableModels).map(([service, models]) => (
                  models.map((model, index) => (
                    <button
                      key={`${service}-${index}`}
                      type="button"
                      onClick={() => addModel(service, model)}
                      className="p-2 bg-green-900/20 border border-green-700/50 rounded-lg hover:bg-green-900/30 transition-colors"
                    >
                      <div className="text-xs font-medium text-green-400 capitalize">{service}</div>
                      <div className="text-xs text-gray-300 truncate">{model.name}</div>
                    </button>
                  ))
                ))}
              </div>
              
              {Object.keys(availableModels).length === 0 && (
                <div className="p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
                  <p className="text-red-400 text-sm">No models available. Please configure API keys in the AI Services tab first.</p>
                </div>
              )}
            </div>

            {/* Selected Models */}
            <div className="space-y-4">
              {engineData.models.map((model, index) => (
                <div key={index} className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-sm font-medium text-white capitalize">
                        {model.service} - {model.modelId}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeModel(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <label className="text-xs font-medium text-gray-300">Weight</label>
                        <TooltipIcon param="weight" />
                      </div>
                      <input
                        type="number"
                        min="0.1"
                        max="10"
                        step="0.1"
                        value={model.weight}
                        onChange={(e) => updateModel(index, 'weight', parseFloat(e.target.value))}
                        className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white text-sm"
                      />
                    </div>

                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <label className="text-xs font-medium text-gray-300">Temperature</label>
                        <TooltipIcon param="temperature" />
                      </div>
                      <input
                        type="number"
                        min="0"
                        max="2"
                        step="0.1"
                        value={model.temperature}
                        onChange={(e) => updateModel(index, 'temperature', parseFloat(e.target.value))}
                        className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white text-sm"
                      />
                    </div>

                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <label className="text-xs font-medium text-gray-300">Max Tokens</label>
                        <TooltipIcon param="maxTokens" />
                      </div>
                      <input
                        type="number"
                        min="100"
                        max="8000"
                        step="100"
                        value={model.maxTokens}
                        onChange={(e) => updateModel(index, 'maxTokens', parseInt(e.target.value))}
                        className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fallback Configuration */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={engineData.fallbackConfig.enabled}
                onChange={(e) => setEngineData(prev => ({
                  ...prev,
                  fallbackConfig: { ...prev.fallbackConfig, enabled: e.target.checked }
                }))}
                className="rounded"
              />
              <span className="text-sm font-medium text-gray-300">Enable Fallback Configuration</span>
              <div className="group relative">
                <Info className="w-4 h-4 text-gray-400 hover:text-blue-400 cursor-help" />
                <div className="absolute left-0 top-6 w-64 bg-gray-900 border border-gray-600 rounded-lg p-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <p className="text-xs text-gray-300">
                    Automatically retry with backup models if primary models fail. Increases reliability but may increase costs.
                  </p>
                </div>
              </div>
            </label>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || engineData.models.length === 0}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white rounded-lg flex items-center space-x-2"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>{loading ? 'Creating...' : 'Create Engine'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateEngineModal
