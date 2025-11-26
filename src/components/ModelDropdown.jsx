import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Check, Zap, Brain, Code, Palette, Mic } from 'lucide-react'
import { aiValidationService } from '../services/aiValidationService'

const ModelDropdown = ({ 
  models, 
  selectedModel, 
  onModelSelect, 
  loading = false,
  placeholder = "Select a model..."
}) => {
  const [isOpen, setIsOpen] = useState(false)

  const getCapabilityIcon = (capability) => {
    const icons = {
      'thinking': Brain,
      'coding': Code,
      'writing': Palette,
      'image': Palette,
      'audio': Mic
    }
    return icons[capability] || Zap
  }

  const selectedModelData = models.find(m => m.id === selectedModel)

  return (
    <div className="relative">
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading || models.length === 0}
        className={`w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-left text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
          loading || models.length === 0 
            ? 'opacity-50 cursor-not-allowed' 
            : 'hover:bg-gray-600'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            {selectedModelData ? (
              <div className="flex items-center justify-between">
                <span className="font-medium">{selectedModelData.name}</span>
                <div className="flex items-center space-x-2 text-sm text-gray-300">
                  <span>{selectedModelData.contextSize}</span>
                  <span>•</span>
                  <span>{selectedModelData.costPer1k}</span>
                </div>
              </div>
            ) : (
              <span className="text-gray-400">
                {loading ? 'Loading models...' : 
                 models.length === 0 ? 'No models available' : 
                 placeholder}
              </span>
            )}
          </div>
          {!loading && models.length > 0 && (
            isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && models.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl max-h-80 overflow-y-auto">
          {models.map((model) => {
            const isSelected = selectedModel === model.id
            
            return (
              <button
                key={model.id}
                type="button"
                onClick={() => {
                  onModelSelect(model.id)
                  setIsOpen(false)
                }}
                className={`w-full px-4 py-3 text-left hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0 focus:outline-none focus:bg-gray-700 ${
                  isSelected ? 'bg-blue-900/30 border-blue-500/50' : ''
                }`}
              >
                <div className="space-y-2">
                  {/* Model Name and Selection */}
                  <div className="flex items-center justify-between">
                    <span className={`font-medium ${isSelected ? 'text-blue-400' : 'text-white'}`}>
                      {model.name}
                    </span>
                    {isSelected && <Check className="w-4 h-4 text-blue-400" />}
                  </div>
                  
                  {/* Model Info Row */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-3 text-gray-300">
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-400">Context:</span>
                        <span className="font-mono">{model.contextSize}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-xs text-gray-400">Cost:</span>
                        <span className="font-mono text-green-400">{model.costPer1k}</span>
                      </div>
                    </div>
                    
                    {/* Capabilities */}
                    <div className="flex items-center space-x-1">
                      {model.capabilities.map((capability) => {
                        const Icon = getCapabilityIcon(capability)
                        return (
                          <span
                            key={capability}
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${aiValidationService.getCapabilityColor(capability)}`}
                          >
                            <Icon className="w-3 h-3 mr-1" />
                            {capability}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                  
                  {/* Description */}
                  {model.description && (
                    <div className="text-xs text-gray-400 italic">
                      {model.description}
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ModelDropdown
