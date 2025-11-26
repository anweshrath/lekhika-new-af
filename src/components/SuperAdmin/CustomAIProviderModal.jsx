import React, { useState } from 'react'
import { 
  X, 
  Save, 
  Plus, 
  Settings, 
  Code, 
  Globe, 
  Key, 
  Zap,
  AlertTriangle,
  CheckCircle,
  Info,
  ExternalLink
} from 'lucide-react'
import toast from 'react-hot-toast'

const CustomAIProviderModal = ({ 
  isOpen, 
  onClose, 
  onSave,
  existingProviders = []
}) => {
  const [activeTab, setActiveTab] = useState('basic')
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    provider_name: '',
    display_name: '',
    description: '',
    base_url: '',
    api_key: '',
    model: '',
    sdk_type: 'rest', // rest, openai, anthropic, custom
    auth_type: 'bearer', // bearer, header, query, none
    headers: {},
    parameters: {},
    capabilities: [],
    rate_limits: {
      requests_per_minute: 60,
      requests_per_hour: 1000,
      tokens_per_minute: 10000
    },
    metadata: {}
  })

  const [customHeaders, setCustomHeaders] = useState([
    { key: '', value: '' }
  ])

  const [customParams, setCustomParams] = useState([
    { key: '', value: '' }
  ])

  const tabs = [
    { id: 'basic', name: 'Basic Config', icon: Settings },
    { id: 'endpoint', name: 'Endpoint', icon: Globe },
    { id: 'sdk', name: 'SDK & Auth', icon: Code },
    { id: 'advanced', name: 'Advanced', icon: Zap }
  ]

  const sdkTypes = [
    { value: 'rest', label: 'REST API', description: 'Standard HTTP REST endpoints' },
    { value: 'openai', label: 'OpenAI Compatible', description: 'OpenAI-style API structure' },
    { value: 'anthropic', label: 'Anthropic Compatible', description: 'Claude-style API structure' },
    { value: 'custom', label: 'Custom', description: 'Fully custom API structure' }
  ]

  const authTypes = [
    { value: 'bearer', label: 'Bearer Token', description: 'Authorization: Bearer <token>' },
    { value: 'header', label: 'Custom Header', description: 'Custom header name for API key' },
    { value: 'query', label: 'Query Parameter', description: 'API key as URL parameter' },
    { value: 'none', label: 'No Auth', description: 'No authentication required' }
  ]

  const capabilities = [
    'text_generation', 'chat_completion', 'image_generation', 'embeddings', 
    'function_calling', 'vision', 'audio', 'streaming', 'fine_tuning'
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleHeaderChange = (index, field, value) => {
    const newHeaders = [...customHeaders]
    newHeaders[index][field] = value
    setCustomHeaders(newHeaders)
    
    // Update formData headers
    const headersObj = {}
    newHeaders.forEach(h => {
      if (h.key && h.value) {
        headersObj[h.key] = h.value
      }
    })
    setFormData(prev => ({
      ...prev,
      headers: headersObj
    }))
  }

  const handleParamChange = (index, field, value) => {
    const newParams = [...customParams]
    newParams[index][field] = value
    setCustomParams(newParams)
    
    // Update formData parameters
    const paramsObj = {}
    newParams.forEach(p => {
      if (p.key && p.value) {
        paramsObj[p.key] = value
      }
    })
    setFormData(prev => ({
      ...prev,
      parameters: paramsObj
    }))
  }

  const addHeader = () => {
    setCustomHeaders([...customHeaders, { key: '', value: '' }])
  }

  const removeHeader = (index) => {
    const newHeaders = customHeaders.filter((_, i) => i !== index)
    setCustomHeaders(newHeaders)
    
    // Update formData headers
    const headersObj = {}
    newHeaders.forEach(h => {
      if (h.key && h.value) {
        headersObj[h.key] = h.value
      }
    })
    setFormData(prev => ({
      ...prev,
      headers: headersObj
    }))
  }

  const addParam = () => {
    setCustomParams([...customParams, { key: '', value: '' }])
  }

  const removeParam = (index) => {
    const newParams = customParams.filter((_, i) => i !== index)
    setCustomParams(newParams)
    
    // Update formData parameters
    const paramsObj = {}
    newParams.forEach(p => {
      if (p.key && p.value) {
        paramsObj[p.key] = value
      }
    })
    setFormData(prev => ({
      ...prev,
      parameters: paramsObj
    }))
  }

  const handleCapabilityToggle = (capability) => {
    setFormData(prev => ({
      ...prev,
      capabilities: prev.capabilities.includes(capability)
        ? prev.capabilities.filter(c => c !== capability)
        : [...prev.capabilities, capability]
    }))
  }

  const validateForm = () => {
    if (!formData.provider_name.trim()) {
      toast.error('Provider name is required')
      return false
    }
    if (!formData.display_name.trim()) {
      toast.error('Display name is required')
      return false
    }
    if (!formData.base_url.trim()) {
      toast.error('Base URL is required')
      return false
    }
    if (formData.auth_type !== 'none' && !formData.api_key.trim()) {
      toast.error('API key is required for authentication')
      return false
    }
    if (!formData.model.trim()) {
      toast.error('Default model is required')
      return false
    }
    return true
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setSaving(true)
    try {
      // Check if provider name already exists
      if (existingProviders.includes(formData.provider_name)) {
        toast.error('Provider name already exists')
        return
      }

      const providerData = {
        ...formData,
        provider: formData.provider_name,
        type: 'custom',
        is_custom: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      await onSave(providerData)
      toast.success('Custom AI Provider saved successfully!')
      onClose()
    } catch (error) {
      console.error('Error saving custom provider:', error)
      toast.error('Failed to save custom provider')
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-purple-900/20 flex items-center justify-center">
              <Plus className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">New AI Provider</h2>
              <p className="text-gray-400">Configure custom AI service with advanced options</p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-700 mb-6">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-purple-500 text-purple-400'
                    : 'border-transparent text-gray-400 hover:text-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Basic Config Tab */}
          {activeTab === 'basic' && (
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Provider Name *
                </label>
                <input
                  type="text"
                  value={formData.provider_name}
                  onChange={(e) => handleInputChange('provider_name', e.target.value)}
                  placeholder="e.g., custom_llm, enterprise_ai"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">Internal identifier (no spaces, lowercase)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Display Name *
                </label>
                <input
                  type="text"
                  value={formData.display_name}
                  onChange={(e) => handleInputChange('display_name', e.target.value)}
                  placeholder="e.g., Custom LLM, Enterprise AI"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">User-friendly name shown in UI</p>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe what this AI provider does and its capabilities..."
                  rows={3}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Default Model *
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  placeholder="e.g., gpt-4, claude-3, custom-model"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  API Key *
                </label>
                <input
                  type="password"
                  value={formData.api_key}
                  onChange={(e) => handleInputChange('api_key', e.target.value)}
                  placeholder="Enter your API key"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          )}

          {/* Endpoint Tab */}
          {activeTab === 'endpoint' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Base URL *
                </label>
                <input
                  type="url"
                  value={formData.base_url}
                  onChange={(e) => handleInputChange('base_url', e.target.value)}
                  placeholder="https://api.custom-ai.com/v1"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">Base URL for all API endpoints</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    SDK Type
                  </label>
                  <select
                    value={formData.sdk_type}
                    onChange={(e) => handleInputChange('sdk_type', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {sdkTypes.map(sdk => (
                      <option key={sdk.value} value={sdk.value}>
                        {sdk.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {sdkTypes.find(s => s.value === formData.sdk_type)?.description}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Authentication Type
                  </label>
                  <select
                    value={formData.auth_type}
                    onChange={(e) => handleInputChange('auth_type', e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {authTypes.map(auth => (
                      <option key={auth.value} value={auth.value}>
                        {auth.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    {authTypes.find(a => a.value === formData.auth_type)?.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SDK & Auth Tab */}
          {activeTab === 'sdk' && (
            <div className="space-y-6">
              {/* Custom Headers */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-300">
                    Custom Headers
                  </label>
                  <button
                    onClick={addHeader}
                    className="flex items-center space-x-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Header</span>
                  </button>
                </div>
                
                <div className="space-y-2">
                  {customHeaders.map((header, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={header.key}
                        onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                        placeholder="Header name"
                        className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      />
                      <input
                        type="text"
                        value={header.value}
                        onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                        placeholder="Header value"
                        className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      />
                      <button
                        onClick={() => removeHeader(index)}
                        className="px-2 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Parameters */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-300">
                    Custom Parameters
                  </label>
                  <button
                    onClick={addParam}
                    className="flex items-center space-x-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Parameter</span>
                  </button>
                </div>
                
                <div className="space-y-2">
                  {customParams.map((param, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={param.key}
                        onChange={(e) => handleParamChange(index, 'key', e.target.value)}
                        placeholder="Parameter name"
                        className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      />
                      <input
                        type="text"
                        value={param.value}
                        onChange={(e) => handleParamChange(index, 'value', e.target.value)}
                        placeholder="Parameter value"
                        className="flex-1 bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      />
                      <button
                        onClick={() => removeParam(index)}
                        className="px-2 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <div className="space-y-6">
              {/* Capabilities */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  AI Capabilities
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {capabilities.map(capability => (
                    <label key={capability} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.capabilities.includes(capability)}
                        onChange={() => handleCapabilityToggle(capability)}
                        className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                      />
                      <span className="text-sm text-gray-300 capitalize">
                        {capability.replace('_', ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Rate Limits */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">
                  Rate Limits
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Requests/Min</label>
                    <input
                      type="number"
                      value={formData.rate_limits.requests_per_minute}
                      onChange={(e) => handleInputChange('rate_limits', {
                        ...formData.rate_limits,
                        requests_per_minute: parseInt(e.target.value) || 0
                      })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Requests/Hour</label>
                    <input
                      type="number"
                      value={formData.rate_limits.requests_per_hour}
                      onChange={(e) => handleInputChange('rate_limits', {
                        ...formData.rate_limits,
                        requests_per_hour: parseInt(e.target.value) || 0
                      })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Tokens/Min</label>
                    <input
                      type="number"
                      value={formData.rate_limits.tokens_per_minute}
                      onChange={(e) => handleInputChange('rate_limits', {
                        ...formData.rate_limits,
                        tokens_per_minute: parseInt(e.target.value) || 0
                      })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Additional Metadata (JSON)
                </label>
                <textarea
                  value={JSON.stringify(formData.metadata, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value)
                      handleInputChange('metadata', parsed)
                    } catch (error) {
                      // Invalid JSON, ignore
                    }
                  }}
                  placeholder='{"version": "1.0", "region": "us-east-1"}'
                  rows={4}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">Optional JSON metadata for additional configuration</p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-700">
          <div className="flex items-center space-x-2 text-gray-400">
            <Info className="w-4 h-4" />
            <span className="text-sm">Custom providers will be saved to ai_providers table</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Custom Provider</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomAIProviderModal
