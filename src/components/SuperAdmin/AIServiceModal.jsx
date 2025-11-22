import React, { useState, useEffect } from 'react'
import { 
  X, Plus, Edit, Trash2, Eye, EyeOff, 
  CheckCircle, XCircle, Loader2, Key, Copy
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { aiValidationService } from '../../services/aiValidationService'
import toast from 'react-hot-toast'

const AIServiceModal = ({ 
  isOpen, 
  onClose, 
  service, 
  config, 
  existingKeys, 
  onKeysUpdated,
  getSuperAdminUserId 
}) => {
  const [isValidating, setIsValidating] = useState(false)
  const [showApiKey, setShowApiKey] = useState({})
  const [editingKey, setEditingKey] = useState(null)
  const [nameAvailability, setNameAvailability] = useState({ available: true, message: '' })
  const [validationResult, setValidationResult] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    apiKey: '',
    description: ''
  })

  // Generate provider prefix and next available number
  const getProviderPrefix = (provider) => {
    const prefixes = {
      'openai': 'OPENA',
      'claude': 'CLAUD',
      'gemini': 'GEMIN',
      'mistral': 'MISTR',
      'perplexity': 'PERPL',
      'cohere': 'COHER',
      'grok': 'GROK-'
    }
    return prefixes[provider] || provider.toUpperCase().substring(0, 5)
  }

  const getNextAvailableNumber = (provider) => {
    const prefix = getProviderPrefix(provider)
    const existingNames = existingKeys
      .filter(key => key.name && key.name.startsWith(prefix))
      .map(key => {
        const match = key.name.match(new RegExp(`^${prefix}-(\\d+)-`))
        return match ? parseInt(match[1]) : 0
      })
      .sort((a, b) => b - a)
    
    return existingNames.length > 0 ? existingNames[0] + 1 : 1
  }

  const generateSuggestedName = (provider) => {
    const prefix = getProviderPrefix(provider)
    const nextNumber = getNextAvailableNumber(provider)
    return `${prefix}-${nextNumber.toString().padStart(2, '0')}-`
  }

  useEffect(() => {
    if (isOpen && editingKey) {
      setFormData({
        name: editingKey.name || '',
        apiKey: '••••••••••••••••',
        description: editingKey.description || ''
      })
      setValidationResult(null)
      setNameAvailability({ available: true, message: '' })
    } else if (isOpen) {
      const suggestedName = generateSuggestedName(service)
      setFormData({
        name: suggestedName,
        apiKey: '',
        description: ''
      })
      setValidationResult(null)
      setNameAvailability({ available: true, message: '' })
    }
  }, [isOpen, editingKey, service])

  // Check name availability in real-time
  const checkNameAvailability = (name) => {
    if (!name.trim()) {
      setNameAvailability({ available: true, message: '' })
      return
    }

    const isAvailable = !existingKeys.some(key => 
      key.name && key.name.toLowerCase() === name.toLowerCase()
    )

    if (isAvailable) {
      setNameAvailability({ available: true, message: '✅ Name is available' })
    } else {
      setNameAvailability({ available: false, message: '❌ Name already exists' })
    }
  }

  // Auto-validate API key as user types (with debouncing)
  useEffect(() => {
    if (!formData.apiKey.trim() || formData.apiKey === '••••••••••••••••') {
      setValidationResult(null)
      return
    }

    const validationTimer = setTimeout(async () => {
      if (formData.apiKey.trim().length > 20) { // Only validate if key looks complete
        setIsValidating(true)
        try {
          const result = await aiValidationService.validateApiKey(service, formData.apiKey.trim())
          setValidationResult(result)
        } catch (error) {
          console.error('Auto-validation error:', error)
          setValidationResult({ success: false, error: 'Auto-validation failed' })
        } finally {
          setIsValidating(false)
        }
      }
    }, 1000) // 1 second debounce

    return () => clearTimeout(validationTimer)
  }, [formData.apiKey, service])

  const handleNameChange = (e) => {
    const value = e.target.value
    setFormData(prev => ({ ...prev, name: value }))
    checkNameAvailability(value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Please enter a name for this API key')
      return
    }

    if (!nameAvailability.available) {
      toast.error('Please choose a different name - this one already exists')
      return
    }
    
    if (!formData.apiKey || formData.apiKey.trim() === '') {
      toast.error('Please enter a valid API key')
      return
    }

    setIsValidating(true)
    
    try {
      // Save to database first
      const superAdminId = getSuperAdminUserId()
      
      if (!superAdminId) {
        toast.error('SuperAdmin authentication required')
        return
      }

      const keyData = {
        user_id: superAdminId,
        provider: service,
        name: formData.name.trim(),
        api_key: formData.apiKey,
        description: formData.description.trim(),
        model: 'default',
        is_active: true,
        failures: 0,
        usage_count: 0,
        metadata: {
          source: 'superadmin_dashboard',
          display_name: config.name,
          description: formData.description.trim()
        }
      }

      // STEP 1: Validate API key FIRST before saving anything
      const validationResult = await aiValidationService.validateApiKey(service, formData.apiKey)
      setValidationResult(validationResult)
      
      if (!validationResult.success) {
        toast.error(`❌ Validation failed: ${validationResult.error}`)
        setIsValidating(false)
        return // Don't save anything if validation fails
      }

      // STEP 2: Only save to database if validation succeeds
      const validatedKeyData = {
        ...keyData,
        metadata: {
          ...keyData.metadata,
          models: validationResult.models,
          validated_at: new Date().toISOString(),
          model_count: validationResult.models.length,
          last_validation: new Date().toISOString()
        }
      }

      if (editingKey) {
        // Update existing key with new validation data
        const { error } = await supabase
          .from('ai_providers')
          .update(validatedKeyData)
          .eq('id', editingKey.id)
        
        if (error) throw error
        toast.success(`✅ ${validationResult.models.length} models available and updated`)
      } else {
        // Insert new key with validation data
        const { error } = await supabase
          .from('ai_providers')
          .insert([validatedKeyData])
        
        if (error) throw error
        toast.success(`✅ ${validationResult.models.length} models available and saved`)
      }

        // Reset form and close modal
        setFormData({ name: '', apiKey: '', description: '' })
        setEditingKey(null)
        onKeysUpdated()
        onClose()
      
    } catch (error) {
      console.error('Error saving API key:', error)
      
      // Provide more specific error messages
      if (error.message) {
        toast.error(`Failed to save API key: ${error.message}`)
      } else if (error.details) {
        toast.error(`Database error: ${error.details}`)
      } else if (error.hint) {
        toast.error(`Database hint: ${error.hint}`)
      } else {
        toast.error('Failed to save API key. Please check your connection and try again.')
      }
    } finally {
      setIsValidating(false)
    }
  }

  const handleDeleteKey = async (keyId) => {
    if (!confirm('Are you sure you want to delete this API key?')) return
    
    try {
      const { error } = await supabase
        .from('ai_providers')
        .delete()
        .eq('id', keyId)
      
      if (error) throw error
      
      toast.success('API key deleted successfully')
      onKeysUpdated()
      
    } catch (error) {
      console.error('Error deleting API key:', error)
      toast.error('Failed to delete API key')
    }
  }

  const handleEditKey = (key) => {
    setEditingKey(key)
    setFormData({
      name: key.name || '',
      apiKey: key.api_key || '',
      description: key.description || ''
    })
  }

  const handleCancelEdit = () => {
    setEditingKey(null)
    setFormData({ name: '', apiKey: '', description: '' })
  }

  const handleCopyKey = async (keyText) => {
    try {
      await navigator.clipboard.writeText(keyText)
      toast.success('API key copied to clipboard')
    } catch (error) {
      console.error('Failed to copy:', error)
      toast.error('Failed to copy API key')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              config.color === 'green' ? 'bg-green-600' :
              config.color === 'blue' ? 'bg-blue-600' :
              config.color === 'orange' ? 'bg-orange-600' :
              config.color === 'purple' ? 'bg-purple-600' :
              config.color === 'red' ? 'bg-red-600' :
              config.color === 'indigo' ? 'bg-indigo-600' :
              'bg-gray-600'
            }`}>
              <config.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{config.name} API Keys</h2>
              <p className="text-gray-400 text-sm">{config.description}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Existing Keys */}
          {existingKeys && existingKeys.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-white">Existing API Keys</h3>
              {existingKeys.map((key) => (
                <div key={key.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg border border-gray-600">
                  <div className="flex items-center space-x-3">
                    <Key className="w-5 h-5 text-blue-400" />
                    <div className="flex-1">
                      <p className="text-white font-medium">{key.name}</p>
                      {key.description && (
                        <p className="text-gray-400 text-sm">{key.description}</p>
                      )}
                      {showApiKey[key.id] && (
                        <div className="mt-2 p-2 bg-gray-600 rounded border border-gray-500">
                          <p className="text-xs text-gray-300 mb-1">API Key:</p>
                          <p className="text-white text-sm font-mono break-all">{key.api_key}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Status and Model Count */}
                    <div className="flex items-center space-x-2">
                      <span className="text-green-400 text-sm flex items-center space-x-1">
                        <CheckCircle className="w-4 h-4" />
                        <span>Active</span>
                      </span>
                      {key.metadata?.model_count && (
                        <span className="text-blue-400 text-sm flex items-center space-x-1">
                          <span>{key.metadata.model_count} models</span>
                        </span>
                      )}
                      {key.metadata?.validated_at && (
                        <span className="text-gray-400 text-xs">
                          Validated: {new Date(key.metadata.validated_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setShowApiKey(prev => ({ ...prev, [key.id]: !prev[key.id] }))}
                      className="text-gray-400 hover:text-gray-300 p-1"
                      title={showApiKey[key.id] ? 'Hide API Key' : 'Show API Key'}
                    >
                      {showApiKey[key.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    {showApiKey[key.id] && (
                      <button
                        onClick={() => handleCopyKey(key.api_key)}
                        className="text-blue-400 hover:text-blue-300 p-1"
                        title="Copy API Key"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleEditKey(key)}
                      className="text-blue-400 hover:text-blue-300 p-1"
                      title="Edit Key"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteKey(key.id)}
                      className="text-red-400 hover:text-red-300 p-1"
                      title="Delete Key"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add/Edit Form */}
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              {editingKey ? 'Edit API Key' : 'Add New API Key'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Key Name *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={handleNameChange}
                    placeholder="Enter a descriptive name for this key..."
                    className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                  {nameAvailability.message && (
                    <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-sm ${
                      nameAvailability.available ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {nameAvailability.message}
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Format: {generateSuggestedName(service)}<span className="text-blue-400">Your Custom Name</span>
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description for this key..."
                  rows="2"
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  API Key *
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={formData.apiKey}
                    onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                    placeholder={`Enter your ${config.name} API key...`}
                    className={`w-full bg-gray-700 border rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
                      validationResult 
                        ? validationResult.success 
                          ? 'border-green-500' 
                          : 'border-red-500'
                        : 'border-gray-600'
                    }`}
                    required
                  />
                  {/* Real-time validation status */}
                  {formData.apiKey && formData.apiKey !== '••••••••••••••••' && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {isValidating ? (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                      ) : validationResult ? (
                        validationResult.success ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )
                      ) : null}
                    </div>
                  )}
                </div>
                {/* Real-time validation message */}
                {formData.apiKey && formData.apiKey !== '••••••••••••••••' && validationResult && (
                  <div className={`mt-2 text-sm ${
                    validationResult.success ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {validationResult.success 
                      ? `✅ ${validationResult.models.length} models available` 
                      : `❌ ${validationResult.error}`
                    }
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4">
                {editingKey && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isValidating || !nameAvailability.available}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Validating...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>{editingKey ? 'Update Key' : 'Add Key'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Validation Results Display */}
            {validationResult && (
              <div className="mt-6 p-4 bg-gray-800 rounded-xl border border-gray-600">
                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  Validation Results
                </h4>
                
                {validationResult.success ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm">Status:</span>
                      <span className="text-green-400 text-sm font-medium">✅ Valid</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm">Models Available:</span>
                      <span className="text-blue-400 text-sm font-medium">{validationResult.models.length} models</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm">Service:</span>
                      <span className="text-purple-400 text-sm font-medium capitalize">{validationResult.service}</span>
                    </div>
                    
                    {/* Model Details */}
                    <div className="mt-3">
                      <span className="text-gray-300 text-sm">Available Models:</span>
                      <div className="mt-2 space-y-2">
                        {validationResult.models.slice(0, 3).map((model, index) => (
                          <div key={index} className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">{model.name}</span>
                            <span className="text-gray-500">{model.contextSize} • {model.costPer1k}</span>
                          </div>
                        ))}
                        {validationResult.models.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{validationResult.models.length - 3} more models...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm">Status:</span>
                      <span className="text-red-400 text-sm font-medium">❌ Invalid</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm">Error:</span>
                      <span className="text-red-400 text-sm font-medium">{validationResult.error}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIServiceModal
