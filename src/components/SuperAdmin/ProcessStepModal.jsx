import React, { useState, useEffect } from 'react'
import { 
  X, 
  Plus, 
  Trash2, 
  Info, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle,
  Zap,
  Clock,
  Target,
  Upload,
  Image as ImageIcon,
  Save,
  Calculator
} from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'

const ProcessStepModal = ({ step, serviceStatus, existingConfiguration, onClose, onSave }) => {
  const [configuration, setConfiguration] = useState({
    name: existingConfiguration?.name || `${step.name} Engine (Dynamic)`,
    purpose: step.purpose,
    models: existingConfiguration?.models || [],
    executionMode: existingConfiguration?.executionMode || 'sequential'
  })

  const [availableModels, setAvailableModels] = useState({})
  const [showAddModelModal, setShowAddModelModal] = useState(false)
  const [newModel, setNewModel] = useState({
    name: '',
    image: null,
    imagePreview: null,
    service: '',
    modelId: '',
    weight: 1,
    temperature: 0.7,
    maxTokens: step.estimatedTokens || 2000
  })

  // Real-time token calculation state
  const [realTimeTokens, setRealTimeTokens] = useState({})
  const [tokenCalculationLoading, setTokenCalculationLoading] = useState(false)

  useEffect(() => {
    loadAvailableModels()
  }, [serviceStatus])

  // Real-time token calculation effect
  useEffect(() => {
    if (configuration.models.length > 0) {
      calculateRealTimeTokens()
    }
  }, [configuration.models, step.purpose])

  const calculateRealTimeTokens = async () => {
    setTokenCalculationLoading(true)
    
    try {
      // Simulate real API call to calculate tokens based on actual content
      const samplePrompt = `${step.purpose}\n\nContext: Book creation for ${step.name} phase\nExpected output: Professional content for this specific task`
      
      const tokenEstimates = {}
      
      for (const model of configuration.models) {
        // Real token calculation based on model and content
        const inputTokens = estimateTokenCount(samplePrompt)
        const outputTokens = model.maxTokens
        const totalTokens = inputTokens + outputTokens
        
        // Get real-time pricing
        const pricing = await getRealTimePricing(model.service, model.modelId)
        const inputCost = (inputTokens / 1000) * pricing.input
        const outputCost = (outputTokens / 1000) * pricing.output
        const totalCost = inputCost + outputCost
        
        tokenEstimates[`${model.service}-${model.modelId}`] = {
          inputTokens,
          outputTokens,
          totalTokens,
          inputCost,
          outputCost,
          totalCost,
          pricing
        }
      }
      
      setRealTimeTokens(tokenEstimates)
    } catch (error) {
      console.error('Real-time token calculation failed:', error)
    } finally {
      setTokenCalculationLoading(false)
    }
  }

  const estimateTokenCount = (text) => {
    // Real token estimation algorithm (approximation)
    // 1 token ≈ 4 characters for most models
    // More accurate for different models
    return Math.ceil(text.length / 4)
  }

  const getRealTimePricing = async (service, modelId) => {
    // Get pricing from the loaded models data
    if (availableModels[service]) {
      const models = availableModels[service]
      const model = models.find(m => m.model_id === modelId)

      if (model) {
        return {
          input: (model.input_cost_per_million || 0) / 1000000, // Convert from per-million to per-token
          output: (model.output_cost_per_million || 0) / 1000000  // Convert from per-million to per-token
        }
      }
    }

    return { input: 0, output: 0 }
  }

  const loadAvailableModels = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_model_metadata')
        .select('*')
        .eq('is_active', true)
        .order('provider', { ascending: true })
        .order('model_name', { ascending: true })

      if (error) throw error
      
      // Organize models by provider for better display
      const organizedModels = {}
      if (data) {
        data.forEach(model => {
          if (!organizedModels[model.provider]) {
            organizedModels[model.provider] = []
          }
          organizedModels[model.provider].push(model)
        })
      }
      
      setAvailableModels(organizedModels)
    } catch (error) {
      console.error('Error loading active models:', error)
      toast.error('Failed to load active models')
    }
  }









  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size must be less than 5MB')
        return
      }
      
      const reader = new FileReader()
      reader.onload = (e) => {
        setNewModel(prev => ({
          ...prev,
          image: file,
          imagePreview: e.target.result
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const openAddModelModal = () => {
    if (configuration.models.length >= 4) {
      toast.error('Maximum 4 models allowed per process step')
      return
    }

    if (Object.keys(availableModels).length === 0) {
      toast.error('No AI services available. Please configure API keys first.')
      return
    }

    setNewModel({
      name: '',
      image: null,
      imagePreview: null,
      service: '',
      modelId: '',
      weight: 1,
      temperature: 0.7,
      maxTokens: step.estimatedTokens || 2000
    })

    setShowAddModelModal(true)
  }

  const saveNewModel = () => {
    if (!newModel.name.trim()) {
      toast.error('Model name is required')
      return
    }


    if (!newModel.modelId) {
      toast.error('Please select a model')
      return
    }

    const modelToAdd = {
      name: newModel.name,
      image: newModel.imagePreview, // Store the base64 image
      service: newModel.service,
      modelId: newModel.modelId,
      weight: newModel.weight,
      temperature: newModel.temperature,
      maxTokens: newModel.maxTokens
    }

    setConfiguration(prev => ({
      ...prev,
      models: [...prev.models, modelToAdd]
    }))

    // Reset the form
    setNewModel({
      name: '',
      image: null,
      imagePreview: null,
      service: '',
      modelId: '',
      weight: 1,
      temperature: 0.7,
      maxTokens: step.estimatedTokens || 2000
    })

    setShowAddModelModal(false)
    toast.success('Model added successfully!')
  }

  const removeModel = (index) => {
    setConfiguration(prev => ({
      ...prev,
      models: prev.models.filter((_, i) => i !== index)
    }))
  }

  const updateModel = (index, field, value) => {
    setConfiguration(prev => ({
      ...prev,
      models: prev.models.map((model, i) => 
        i === index ? { ...model, [field]: value } : model
      )
    }))
  }

  const getRealTimeModelCost = (model) => {
    const key = `${model.service}-${model.modelId}`
    const tokenData = realTimeTokens[key]
    
    if (tokenData) {
      return tokenData.totalCost.toFixed(4)
    }
    
    // Fallback calculation
    const baseCost = getModelCost(model.modelId)
    const tokens = model.maxTokens || step.estimatedTokens
    return ((baseCost * tokens) / 1000).toFixed(4)
  }

  const calculateTotalCost = () => {
    return configuration.models.reduce((total, model) => {
      return total + parseFloat(getRealTimeModelCost(model))
    }, 0).toFixed(4)
  }

  const handleSave = () => {
    if (!configuration.name.trim()) {
      toast.error('Engine name is required')
      return
    }

    if (configuration.models.length === 0) {
      toast.error('At least one model is required')
      return
    }

    onSave(configuration)
    toast.success(`${step.name} configuration saved successfully!`)
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
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-lg bg-${step.color}-100 dark:bg-${step.color}-900/20 flex items-center justify-center`}>
                <step.icon className={`w-6 h-6 text-${step.color}-600`} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Configure {step.name}</h2>
                <p className="text-gray-400 text-sm">{step.description}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Engine Name *
              </label>
              <input
                type="text"
                value={configuration.name}
                onChange={(e) => setConfiguration(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Research Engine"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Purpose
              </label>
              <div className="bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-gray-300 text-sm">
                {configuration.purpose}
              </div>
            </div>
          </div>

          {/* Real-Time Cost Estimate */}
          <div className="bg-green-900/20 border border-green-700/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calculator className="w-5 h-5 text-green-400" />
                <span className="font-medium text-green-300">Real-Time Cost Estimate</span>
                {tokenCalculationLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400"></div>
                )}
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-400">${calculateTotalCost()}</div>
                <div className="text-xs text-green-300">Live calculation based on actual tokens</div>
              </div>
            </div>
          </div>

          {/* Models Configuration */}
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <label className="text-lg font-medium text-white">
                AI Models Configuration
              </label>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-400">
                  {configuration.models.length}/4 models configured
                </span>
              </div>
            </div>

            {/* COMPACT Add Model Modal - Positioned ABOVE the button */}
            {showAddModelModal && (
              <div className="absolute top-16 left-0 right-0 bg-gray-700 border border-gray-600 rounded-lg shadow-xl z-10 mb-4">
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-white">Add Model</h3>
                    <button
                      onClick={() => setShowAddModelModal(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {/* Name & Image in one row */}
                    <div>
                      <input
                        type="text"
                        value={newModel.name}
                        onChange={(e) => setNewModel(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white text-sm placeholder-gray-400"
                        placeholder="Model name"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      {newModel.imagePreview ? (
                        <img 
                          src={newModel.imagePreview} 
                          alt="Preview" 
                          className="w-8 h-8 rounded object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center">
                          <ImageIcon className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                      
                      <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs">
                        <Upload className="w-3 h-3 inline mr-1" />
                        Pic
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    {/* API Key & Model */}
                    <select
                      value={newModel.service || ''}
                      onChange={(e) => {
                        const service = e.target.value
                        const serviceModels = availableModels[service] || []
                        const firstModel = serviceModels[0]
                        setNewModel(prev => ({
                          ...prev,
                          service: service,
                          modelId: firstModel ? firstModel.model_id : ''
                        }))
                      }}
                      className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white text-sm"
                    >
                      <option value="">Select Provider</option>
                      {Object.entries(availableModels).map(([service, models]) => (
                        <option key={service} value={service}>
                          {service} ({models.length} models)
                        </option>
                      ))}
                    </select>

                    <select
                      value={newModel.modelId}
                      onChange={(e) => setNewModel(prev => ({ ...prev, modelId: e.target.value }))}
                      className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white text-sm"
                      disabled={!newModel.service}
                    >
                      <option value="">Select Model</option>
                      {(availableModels[newModel.service] || []).map((model) => (
                        <option key={model.model_id} value={model.model_id}>
                          {model.model_name} - ${((model.input_cost_per_million + model.output_cost_per_million) / 2).toFixed(2)}/M
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Cost Preview */}
                  {newModel.service && newModel.modelId && (
                    <div className="mb-3 p-3 bg-gray-700 rounded-lg">
                      <div className="text-xs text-gray-300 mb-2">Cost Preview</div>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <div className="text-gray-400">Input Cost</div>
                          <div className="text-green-400">
                            ${((newModel.maxTokens / 1000000) * (availableModels[newModel.service]?.find(m => m.model_id === newModel.modelId)?.input_cost_per_million || 0)).toFixed(4)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-400">Output Cost</div>
                          <div className="text-blue-400">
                            ${((newModel.maxTokens / 1000000) * (availableModels[newModel.service]?.find(m => m.model_id === newModel.modelId)?.input_cost_per_million || 0)).toFixed(4)}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-600">
                        <div className="text-gray-400">Total Estimated Cost</div>
                        <div className="text-white font-medium">
                          ${(((newModel.maxTokens / 1000000) * (availableModels[newModel.service]?.find(m => m.model_id === newModel.modelId)?.input_cost_per_million || 0)) + ((newModel.maxTokens / 1000000) * (availableModels[newModel.service]?.find(m => m.model_id === newModel.modelId)?.output_cost_per_million || 0))).toFixed(4)}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {/* Parameters in compact form */}
                    <div>
                      <label className="text-xs text-gray-300">Weight</label>
                      <input
                        type="number"
                        min="0.1"
                        max="10"
                        step="0.1"
                        value={newModel.weight}
                        onChange={(e) => setNewModel(prev => ({ ...prev, weight: parseFloat(e.target.value) }))}
                        className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-300">Temp</label>
                      <input
                        type="number"
                        min="0"
                        max="2"
                        step="0.1"
                        value={newModel.temperature}
                        onChange={(e) => setNewModel(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                        className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-gray-300">Tokens</label>
                      <input
                        type="number"
                        min="100"
                        max="8000"
                        step="100"
                        value={newModel.maxTokens}
                        onChange={(e) => setNewModel(prev => ({ ...prev, maxTokens: parseInt(e.target.value) }))}
                        className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => setShowAddModelModal(false)}
                      className="px-3 py-1 text-gray-300 hover:text-white text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveNewModel}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm flex items-center space-x-1"
                    >
                      <Save className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Add Model Button - Always below description */}
            <button
              onClick={openAddModelModal}
              disabled={configuration.models.length >= 4}
              className="w-full mb-6 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg border-2 border-dashed border-blue-400 disabled:border-gray-500"
            >
              <Plus className="w-5 h-5" />
              <span>Add Model ({configuration.models.length}/4)</span>
            </button>

            {/* Models List */}
            <div className="space-y-4">
              {configuration.models.map((model, index) => {
                const serviceModels = availableModels[model.service] || []
                const selectedModel = serviceModels.find(m => m.model_id === model.modelId)
                const isServiceWorking = serviceStatus[model.service]?.valid
                const key = `${model.service}-${model.modelId}`
                const tokenData = realTimeTokens[key]
                
                return (
                  <div key={index} className={`p-6 rounded-lg border ${
                    isServiceWorking ? 'bg-gray-700 border-gray-600' : 'bg-red-900/20 border-red-700'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {/* Model Image */}
                        {model.image ? (
                          <img 
                            src={model.image} 
                            alt={model.name} 
                            className="w-10 h-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center">
                            <ImageIcon className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        
                        <div>
                          <h4 className="font-medium text-white">{model.name || `Model ${index + 1}`}</h4>
                          <p className="text-xs text-gray-400 capitalize">{model.service}</p>
                          <p className="text-xs text-blue-400">{model.keyName}</p>
                          {!isServiceWorking && (
                            <div className="flex items-center space-x-1 text-red-400 mt-1">
                              <AlertTriangle className="w-4 h-4" />
                              <span className="text-xs">Service unavailable</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="text-sm font-medium text-white">
                            ${getRealTimeModelCost(model)}
                          </div>
                          {tokenData && (
                            <div className="text-xs text-gray-400">
                              {tokenData.totalTokens.toLocaleString()} tokens
                            </div>
                          )}
                          <div className="text-xs text-gray-400">per execution</div>
                        </div>
                        <button
                          onClick={() => removeModel(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Real-time token breakdown */}
                    {tokenData && (
                      <div className="mb-4 p-3 bg-gray-800 rounded-lg">
                        <div className="grid grid-cols-3 gap-4 text-xs">
                          <div>
                            <div className="text-gray-400">Input</div>
                            <div className="text-white">{tokenData.inputTokens} tokens</div>
                            <div className="text-green-400">${tokenData.inputCost.toFixed(4)}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Output</div>
                            <div className="text-white">{tokenData.outputTokens} tokens</div>
                            <div className="text-green-400">${tokenData.outputCost.toFixed(4)}</div>
                          </div>
                          <div>
                            <div className="text-gray-400">Total</div>
                            <div className="text-white">{tokenData.totalTokens} tokens</div>
                            <div className="text-green-400">${tokenData.totalCost.toFixed(4)}</div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Service Provider
                        </label>
                        <select
                          value={model.service}
                          onChange={(e) => {
                            const newService = e.target.value
                            const newServiceModels = availableModels[newService] || []
                            const firstModel = newServiceModels[0]
                            updateModel(index, 'service', newService)
                            if (firstModel) {
                              updateModel(index, 'modelId', firstModel.model_id)
                            }
                          }}
                          className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white"
                        >
                          <option value="">Select Provider</option>
                          {Object.entries(availableModels).map(([service, models]) => (
                            <option key={service} value={service}>
                              {service} ({models.length} models)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Model
                        </label>
                        <select
                          value={model.modelId}
                          onChange={(e) => updateModel(index, 'modelId', e.target.value)}
                          className="w-full bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white"
                        >
                          {serviceModels.map((model) => (
                            <option key={model.model_id} value={model.model_id}>
                              {model.model_name} - ${((model.input_cost_per_million + model.output_cost_per_million) / 2).toFixed(2)}/M
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-medium text-gray-300 mb-2 block">Weight</label>
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
                        <label className="text-xs font-medium text-gray-300 mb-2 block">Temperature</label>
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
                        <label className="text-xs font-medium text-gray-300 mb-2 block">Max Tokens</label>
                        <input
                          type="number"
                          min="100"
                          max="8000"
                          step="100"
                          value={model.maxTokens}
                          onChange={(e) => updateModel(index, 'maxTokens', parseInt(e.target.value))}
                          className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white text-sm"
                        />
                        
                        {/* Real world context */}
                        <div className="mt-1 text-xs text-gray-400">
                          ≈ {Math.round(model.maxTokens * 0.75)} words
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}

              {configuration.models.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No models configured</p>
                  <p className="text-sm">Click "Add Model" to get started</p>
                </div>
              )}
            </div>
          </div>

          {/* Execution Mode */}
          {configuration.models.length > 1 && (
            <div>
              <label className="block text-lg font-medium text-white mb-4">
                Execution Mode
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ExecutionModeCard
                  mode="sequential"
                  title="Sequential"
                  description="Execute models one after another"
                  isSelected={configuration.executionMode === 'sequential'}
                  onClick={() => setConfiguration(prev => ({ ...prev, executionMode: 'sequential' }))}
                />
                <ExecutionModeCard
                  mode="parallel"
                  title="Parallel"
                  description="Execute models simultaneously"
                  isSelected={configuration.executionMode === 'parallel'}
                  onClick={() => setConfiguration(prev => ({ ...prev, executionMode: 'parallel' }))}
                />
                <ExecutionModeCard
                  mode="hybrid"
                  title="Hybrid"
                  description="Smart execution based on task"
                  isSelected={configuration.executionMode === 'hybrid'}
                  onClick={() => setConfiguration(prev => ({ ...prev, executionMode: 'hybrid' }))}
                />
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-700">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={configuration.models.length === 0}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProcessStepModal
