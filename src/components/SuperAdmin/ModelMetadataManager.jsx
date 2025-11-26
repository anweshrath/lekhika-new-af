import React, { useState, useEffect } from 'react'
import { aiModelDiscoveryService } from '../../services/aiModelDiscoveryService'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

const ModelMetadataManager = () => {
  const [providers, setProviders] = useState([
    'OpenAI', 'Anthropic', 'Google', 'Mistral', 'Perplexity'
  ])
  const [selectedProvider, setSelectedProvider] = useState('')
  const [models, setModels] = useState([])
  const [apiKey, setApiKey] = useState('')

  const discoverModels = async () => {
    try {
      const discoveredModels = await aiModelDiscoveryService.discoverModelsForProvider(
        selectedProvider, 
        apiKey
      )
      setModels(discoveredModels)
      toast.success(`Discovered ${discoveredModels.length} models for ${selectedProvider}`)
    } catch (error) {
      toast.error(`Failed to discover models: ${error.message}`)
    }
  }

  const updateModelMetadata = async (modelId, updates) => {
    try {
      const updatedModel = await aiModelDiscoveryService.updateModelMetadata(modelId, updates)
      toast.success('Model metadata updated successfully')
      
      // Update local state
      setModels(prev => 
        prev.map(model => 
          model.id === modelId ? { ...model, ...updates } : model
        )
      )
    } catch (error) {
      toast.error(`Failed to update model: ${error.message}`)
    }
  }

  return (
    <div className="p-6 bg-gray-900 text-white">
      <h2 className="text-2xl font-bold mb-4">AI Model Metadata Management</h2>
      
      <div className="flex space-x-4 mb-6">
        <select 
          value={selectedProvider}
          onChange={(e) => setSelectedProvider(e.target.value)}
          className="bg-gray-700 text-white p-2 rounded"
        >
          <option value="">Select Provider</option>
          {providers.map(provider => (
            <option key={provider} value={provider}>{provider}</option>
          ))}
        </select>
        
        <input 
          type="text" 
          placeholder="API Key" 
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="bg-gray-700 text-white p-2 rounded flex-grow"
        />
        
        <button 
          onClick={discoverModels}
          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
        >
          Discover Models
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {models.map(model => (
          <div 
            key={model.model_id} 
            className="bg-gray-800 p-4 rounded-lg shadow-lg"
          >
            <h3 className="text-lg font-semibold mb-2">{model.model_name}</h3>
            
            <div className="space-y-2">
              <div>
                <label className="block text-sm text-gray-400">Input Cost per Million</label>
                <input 
                  type="number" 
                  value={model.input_cost_per_million || 0}
                  onChange={(e) => updateModelMetadata(model.id, { 
                    input_cost_per_million: parseFloat(e.target.value) 
                  })}
                  className="w-full bg-gray-700 text-white p-1 rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400">Output Cost per Million</label>
                <input 
                  type="number" 
                  value={model.output_cost_per_million || 0}
                  onChange={(e) => updateModelMetadata(model.id, { 
                    output_cost_per_million: parseFloat(e.target.value) 
                  })}
                  className="w-full bg-gray-700 text-white p-1 rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400">Context Window Tokens</label>
                <input 
                  type="number" 
                  value={model.context_window_tokens || 0}
                  onChange={(e) => updateModelMetadata(model.id, { 
                    context_window_tokens: parseInt(e.target.value) 
                  })}
                  className="w-full bg-gray-700 text-white p-1 rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400">Tokens per Page</label>
                <input 
                  type="number" 
                  value={model.tokens_per_page || 500}
                  onChange={(e) => updateModelMetadata(model.id, { 
                    tokens_per_page: parseInt(e.target.value) 
                  })}
                  className="w-full bg-gray-700 text-white p-1 rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400">Active</label>
                <input 
                  type="checkbox" 
                  checked={model.is_active}
                  onChange={(e) => updateModelMetadata(model.id, { 
                    is_active: e.target.checked 
                  })}
                  className="mr-2"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ModelMetadataManager
