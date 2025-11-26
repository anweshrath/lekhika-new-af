import React, { useState } from 'react'
import { X, Save, Plus, Trash2, Settings, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import { aiEngineService } from '../../services/aiEngineService'

const EngineEditor = ({ engine, onClose, onEngineUpdated, serviceStatus }) => {
  const [formData, setFormData] = useState({
    name: engine.name,
    description: engine.description,
    tier: engine.tier || 'hobby',
    executionMode: engine.executionMode || 'sequential',
    models: [...engine.models],
    fallbackConfig: { ...engine.fallbackConfig },
    taskAssignments: [...(engine.taskAssignments || [])]
  })
  const [loading, setLoading] = useState(false)

  const availableServices = Object.keys(serviceStatus).filter(service => 
    serviceStatus[service]?.valid
  )

  const tierOptions = [
    { value: 'hobby', label: 'Hobby' },
    { value: 'expert', label: 'Expert' },
    { value: 'enterprise', label: 'Enterprise' }
  ]

  const executionModes = [
    { value: 'sequential', label: 'Sequential', description: 'Execute models one after another' },
    { value: 'parallel', label: 'Parallel', description: 'Execute models simultaneously' },
    { value: 'hybrid', label: 'Hybrid', description: 'Smart execution based on task' }
  ]

  const addModel = () => {
    if (availableServices.length === 0) {
      toast.error('No AI services available. Please configure API keys first.')
      return
    }

    setFormData(prev => ({
      ...prev,
      models: [...prev.models, {
        service: availableServices[0],
        model: '',
        weight: 1,
        temperature: 0.7,
        maxTokens: 2000
      }]
    }))
  }

  const removeModel = (index) => {
    setFormData(prev => ({
      ...prev,
      models: prev.models.filter((_, i) => i !== index)
    }))
  }

  const updateModel = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      models: prev.models.map((model, i) => 
        i === index ? { ...model, [field]: value } : model
      )
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Engine name is required')
      return
    }

    if (formData.models.length === 0) {
      toast.error('At least one model is required')
      return
    }

    setLoading(true)
    
    try {
      const updatedEngine = await aiEngineService.updateEngine(engine.id, formData)
      toast.success('Engine updated successfully!')
      onEngineUpdated(updatedEngine)
    } catch (error) {
      toast.error('Failed to update engine')
      console.error('Engine update error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Edit AI Engine</h2>
            <p className="text-gray-400 text-sm">ID: {engine.id}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Engine Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tier
              </label>
              <select
                value={formData.tier}
                onChange={(e) => setFormData(prev => ({ ...prev, tier: e.target.value }))}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {tierOptions.map(tier => (
                  <option key={tier.value} value={tier.value}>
                    {tier.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={3}
            />
          </div>

          {/* Execution Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-3">
              Execution Mode
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {executionModes.map(mode => (
                <label key={mode.value} className="cursor-pointer">
                  <input
                    type="radio"
                    name="executionMode"
                    value={mode.value}
                    checked={formData.executionMode === mode.value}
                    onChange={(e) => setFormData(prev => ({ ...prev, executionMode: e.target.value }))}
                    className="sr-only"
                  />
                  <div className={`p-4 rounded-lg border-2 transition-colors ${
                    formData.executionMode === mode.value
                      ? 'border-red-500 bg-red-900/20'
                      : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                  }`}>
                    <div className="font-medium text-white mb-1">{mode.label}</div>
                    <div className="text-sm text-gray-400">{mode.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Models Configuration */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-300">
                Models Configuration *
              </label>
              <button
                type="button"
                onClick={addModel}
                className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Model</span>
              </button>
            </div>

            {formData.models.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No models configured</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formData.models.map((model, index) => {
                  const isServiceWorking = serviceStatus[model.service]?.valid
                  
                  return (
                    <div key={index} className={`p-4 rounded-lg border ${
                      isServiceWorking ? 'bg-gray-700 border-gray-600' : 'bg-red-900/20 border-red-700'
                    }`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-medium text-white">Model {index + 1}</h4>
                          {!isServiceWorking && (
                            <div className="flex items-center space-x-1 text-red-400">
                              <AlertTriangle className="w-4 h-4" />
                              <span className="text-xs">Service unavailable</span>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeModel(index)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">
                            Service
                          </label>
                          <select
                            value={model.service}
                            onChange={(e) => updateModel(index, 'service', e.target.value)}
                            className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white text-sm"
                          >
                            {Object.keys(serviceStatus).map(service => (
                              <option key={service} value={service}>
                                {service.charAt(0).toUpperCase() + service.slice(1)}
                                {!serviceStatus[service]?.valid && ' (Unavailable)'}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">
                            Model ID
                          </label>
                          <input
                            type="text"
                            value={model.model}
                            onChange={(e) => updateModel(index, 'model', e.target.value)}
                            className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white text-sm"
                            placeholder="e.g., gpt-4"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">
                            Weight
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="10"
                            step="0.1"
                            value={model.weight}
                            onChange={(e) => updateModel(index, 'weight', parseFloat(e.target.value))}
                            className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">
                            Temperature
                          </label>
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
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Fallback Configuration */}
          <div>
            <label className="flex items-center space-x-3 mb-4">
              <input
                type="checkbox"
                checked={formData.fallbackConfig?.enabled || false}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  fallbackConfig: { ...prev.fallbackConfig, enabled: e.target.checked }
                }))}
                className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
              />
              <span className="text-sm font-medium text-gray-300">Enable Fallback Configuration</span>
            </label>

            {formData.fallbackConfig?.enabled && (
              <div className="bg-gray-700 p-4 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Max Retries
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.fallbackConfig.maxRetries || 3}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      fallbackConfig: { ...prev.fallbackConfig, maxRetries: parseInt(e.target.value) }
                    }))}
                    className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Retry Delay (ms)
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="10000"
                    step="100"
                    value={formData.fallbackConfig.retryDelay || 1000}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      fallbackConfig: { ...prev.fallbackConfig, retryDelay: parseInt(e.target.value) }
                    }))}
                    className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || formData.models.length === 0}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              <Save className="w-4 h-4" />
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EngineEditor
