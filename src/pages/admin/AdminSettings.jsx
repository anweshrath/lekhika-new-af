import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Settings, 
  Database, 
  Key, 
  Mail, 
  Shield, 
  Globe,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  Zap,
  Brain,
  Image as ImageIcon,
  Search,
  PenTool,
  Palette,
  ChevronDown
} from 'lucide-react'
import toast from 'react-hot-toast'
import { openaiService } from '../../services/openaiService'
import { claudeService } from '../../services/claudeService'
import { geminiService } from '../../services/geminiService'
import { grokService } from '../../services/grokService'
import { perplexityService } from '../../services/perplexityService'

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('general')
  const [showPasswords, setShowPasswords] = useState({})
  const [loadingModels, setLoadingModels] = useState({})
  const [availableModels, setAvailableModels] = useState({})
  const [selectedModels, setSelectedModels] = useState({})
  const [modelDropdownOpen, setModelDropdownOpen] = useState({})
  
  const [settings, setSettings] = useState({
    general: {
      siteName: 'Multi-Agent eBook Creator',
      siteDescription: 'AI-powered content generation platform',
      maintenanceMode: false,
      registrationEnabled: true,
      maxBooksPerUser: 50
    },
    api: {
      openaiApiKey: '',
      claudeApiKey: '',
      geminiApiKey: '',
      grokApiKey: '',
      perplexityApiKey: '',
      rateLimitPerHour: 100,
      maxTokensPerRequest: 4000
    },
    email: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: '',
      fromEmail: 'noreply@ebookcreator.com'
    },
    security: {
      sessionTimeout: 24,
      passwordMinLength: 8,
      requireEmailVerification: false,
      enableTwoFactor: false
    }
  })

  const aiServices = [
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'GPT models for research & DALL-E for images',
      role: 'Research + Images',
      icon: Brain,
      color: 'green',
      service: openaiService,
      keyField: 'openaiApiKey'
    },
    {
      id: 'claude',
      name: 'Claude (Anthropic)',
      description: 'Advanced reasoning for research',
      role: 'Research',
      icon: Search,
      color: 'orange',
      service: claudeService,
      keyField: 'claudeApiKey'
    },
    {
      id: 'gemini',
      name: 'Google Gemini',
      description: 'Multimodal AI for content writing',
      role: 'Writing',
      icon: PenTool,
      color: 'blue',
      service: geminiService,
      keyField: 'geminiApiKey'
    },
    {
      id: 'grok',
      name: 'GROK (xAI)',
      description: 'Real-time AI for images & content',
      role: 'Images + Writing',
      icon: Zap,
      color: 'purple',
      service: grokService,
      keyField: 'grokApiKey'
    },
    {
      id: 'perplexity',
      name: 'Perplexity',
      description: 'Research-focused AI for writing',
      role: 'Writing',
      icon: Palette,
      color: 'indigo',
      service: perplexityService,
      keyField: 'perplexityApiKey'
    }
  ]

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'api', name: 'AI Services', icon: Key },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'security', name: 'Security', icon: Shield }
  ]

  // Handle API key changes and load models
  const handleApiKeyChange = async (serviceId, keyField, value) => {
    console.log(`API key changed for ${serviceId}:`, value.length)
    
    setSettings(prev => ({
      ...prev,
      api: { ...prev.api, [keyField]: value }
    }))

    // Clear models if key is too short
    if (!value || value.length < 20) {
      setAvailableModels(prev => ({ ...prev, [serviceId]: [] }))
      setSelectedModels(prev => ({ ...prev, [serviceId]: '' }))
      return
    }

    // Load models for valid-looking keys
    await loadModelsForService(serviceId, value)
  }

  const loadModelsForService = async (serviceId, apiKey) => {
    const service = aiServices.find(s => s.id === serviceId)
    if (!service) return

    console.log(`Loading models for ${serviceId}...`)
    setLoadingModels(prev => ({ ...prev, [serviceId]: true }))

    try {
      // Mock models for testing - replace with actual API calls
      const mockModels = {
        openai: [
          { id: 'gpt-4', description: 'Most capable GPT-4 model' },
          { id: 'gpt-4-turbo', description: 'Faster GPT-4 variant' },
          { id: 'gpt-3.5-turbo', description: 'Fast and efficient' }
        ],
        claude: [
          { id: 'claude-3-opus-20240229', description: 'Most powerful Claude model' },
          { id: 'claude-3-sonnet-20240229', description: 'Balanced performance' },
          { id: 'claude-3-haiku-20240307', description: 'Fastest Claude model' }
        ],
        gemini: [
          { id: 'gemini-pro', description: 'Google\'s most capable model' },
          { id: 'gemini-pro-vision', description: 'Multimodal capabilities' }
        ],
        grok: [
          { id: 'grok-beta', description: 'xAI\'s conversational model' }
        ],
        perplexity: [
          { id: 'llama-3.1-sonar-small-128k-online', description: 'Fast online model' },
          { id: 'llama-3.1-sonar-large-128k-online', description: 'Large online model' }
        ]
      }

      const models = mockModels[serviceId] || []
      
      setAvailableModels(prev => ({ ...prev, [serviceId]: models }))
      
      // Auto-select first model
      if (models.length > 0) {
        const defaultModel = models[0]
        setSelectedModels(prev => ({ ...prev, [serviceId]: defaultModel.id }))
        toast.success(`✅ ${service.name}: ${models.length} models loaded - ${defaultModel.id} selected`)
      }
      
    } catch (error) {
      console.error(`Failed to load models for ${serviceId}:`, error)
      setAvailableModels(prev => ({ ...prev, [serviceId]: [] }))
      setSelectedModels(prev => ({ ...prev, [serviceId]: '' }))
      toast.error(`❌ Failed to load ${service.name} models`)
    } finally {
      setLoadingModels(prev => ({ ...prev, [serviceId]: false }))
    }
  }

  const handleModelSelection = (serviceId, modelId, event) => {
    event.preventDefault()
    event.stopPropagation()
    
    console.log(`Model selected: ${serviceId} -> ${modelId}`)
    
    setSelectedModels(prev => ({ ...prev, [serviceId]: modelId }))
    setModelDropdownOpen(prev => ({ ...prev, [serviceId]: false }))
    
    const service = aiServices.find(s => s.id === serviceId)
    toast.success(`🎯 ${service.name} model selected: ${modelId}`)
    
    // Save to localStorage
    const updatedModels = { ...selectedModels, [serviceId]: modelId }
    localStorage.setItem('selectedAIModels', JSON.stringify(updatedModels))
  }

  const toggleModelDropdown = (serviceId, event) => {
    event.preventDefault()
    event.stopPropagation()
    
    console.log(`Toggling dropdown for ${serviceId}`)
    
    setModelDropdownOpen(prev => {
      const newState = { ...prev, [serviceId]: !prev[serviceId] }
      console.log('New dropdown state:', newState)
      return newState
    })
  }

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleSave = (section) => {
    if (section === 'api') {
      localStorage.setItem('selectedAIModels', JSON.stringify(selectedModels))
      localStorage.setItem('apiSettings', JSON.stringify(settings.api))
    }
    toast.success(`${section.charAt(0).toUpperCase() + section.slice(1)} settings saved successfully`)
  }

  const testConnection = (type) => {
    toast.loading(`Testing ${type} connection...`)
    setTimeout(() => {
      toast.dismiss()
      toast.success(`${type} connection successful`)
    }, 2000)
  }

  // Load saved settings on mount
  useEffect(() => {
    const savedModels = localStorage.getItem('selectedAIModels')
    const savedApiSettings = localStorage.getItem('apiSettings')
    
    if (savedModels) {
      try {
        const parsed = JSON.parse(savedModels)
        setSelectedModels(parsed)
        console.log('Loaded saved models:', parsed)
      } catch (error) {
        console.error('Error parsing saved models:', error)
      }
    }
    
    if (savedApiSettings) {
      try {
        const parsed = JSON.parse(savedApiSettings)
        setSettings(prev => ({
          ...prev,
          api: { ...prev.api, ...parsed }
        }))
        console.log('Loaded saved API settings:', parsed)
      } catch (error) {
        console.error('Error parsing saved API settings:', error)
      }
    }
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.model-dropdown')) {
        setModelDropdownOpen({})
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            System Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure specialized AI teams and platform settings
          </p>
        </div>
      </div>

      <div className="flex space-x-6">
        {/* Sidebar */}
        <div className="w-64 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <tab.icon className="w-5 h-5 mr-3" />
              {tab.name}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    General Settings
                  </h2>
                  <button
                    onClick={() => handleSave('general')}
                    className="btn-primary"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Site Name
                    </label>
                    <input
                      type="text"
                      value={settings.general.siteName}
                      onChange={(e) => setSettings({
                        ...settings,
                        general: { ...settings.general, siteName: e.target.value }
                      })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Max Books Per User
                    </label>
                    <input
                      type="number"
                      value={settings.general.maxBooksPerUser}
                      onChange={(e) => setSettings({
                        ...settings,
                        general: { ...settings.general, maxBooksPerUser: parseInt(e.target.value) }
                      })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Site Description
                  </label>
                  <textarea
                    value={settings.general.siteDescription}
                    onChange={(e) => setSettings({
                      ...settings,
                      general: { ...settings.general, siteDescription: e.target.value }
                    })}
                    className="input-field h-24 resize-none"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        Maintenance Mode
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Temporarily disable the platform for maintenance
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.general.maintenanceMode}
                        onChange={(e) => setSettings({
                          ...settings,
                          general: { ...settings.general, maintenanceMode: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        User Registration
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Allow new users to register accounts
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.general.registrationEnabled}
                        onChange={(e) => setSettings({
                          ...settings,
                          general: { ...settings.general, registrationEnabled: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* AI Services Settings */}
            {activeTab === 'api' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    🤖 Specialized AI Teams
                  </h2>
                  <button
                    onClick={() => handleSave('api')}
                    className="btn-primary"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </button>
                </div>

                {/* AI Team Roles Info */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-3">
                    🎯 Specialized Team Assignments
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                      <div className="flex items-center mb-2">
                        <Search className="w-4 h-4 text-green-600 mr-2" />
                        <span className="font-medium text-green-700 dark:text-green-400">Research Team</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">OpenAI + Claude</p>
                      <p className="text-xs text-gray-500 mt-1">Deep research & fact-finding</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                      <div className="flex items-center mb-2">
                        <PenTool className="w-4 h-4 text-blue-600 mr-2" />
                        <span className="font-medium text-blue-700 dark:text-blue-400">Writing Team</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">Gemini + Perplexity</p>
                      <p className="text-xs text-gray-500 mt-1">Content creation & writing</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg">
                      <div className="flex items-center mb-2">
                        <ImageIcon className="w-4 h-4 text-purple-600 mr-2" />
                        <span className="font-medium text-purple-700 dark:text-purple-400">Image Team</span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400">DALL-E + GROK</p>
                      <p className="text-xs text-gray-500 mt-1">Image generation & visuals</p>
                    </div>
                  </div>
                </div>

                {/* AI Services Configuration */}
                <div className="space-y-6">
                  {aiServices.map((service) => (
                    <div key={service.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-lg bg-${service.color}-100 dark:bg-${service.color}-900/20 flex items-center justify-center mr-4`}>
                            <service.icon className={`w-5 h-5 text-${service.color}-600`} />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {service.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {service.description}
                            </p>
                            <span className={`inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full bg-${service.color}-100 dark:bg-${service.color}-900/20 text-${service.color}-700 dark:text-${service.color}-400`}>
                              {service.role}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* API Key Input */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            API Key
                          </label>
                          <div className="relative">
                            <input
                              type={showPasswords[service.keyField] ? 'text' : 'password'}
                              value={settings.api[service.keyField]}
                              onChange={(e) => handleApiKeyChange(service.id, service.keyField, e.target.value)}
                              className="input-field pr-10"
                              placeholder={`Enter your ${service.name} API key...`}
                            />
                            <button
                              type="button"
                              onClick={() => togglePasswordVisibility(service.keyField)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center"
                            >
                              {showPasswords[service.keyField] ? (
                                <EyeOff className="h-4 w-4 text-gray-400" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-400" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Content Creation Model Selection */}
                        {settings.api[service.keyField] && (
                          <div className="mt-4">
                            <div className="flex items-center justify-between mb-3">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Content Creation Model
                              </label>
                              {loadingModels[service.id] && (
                                <div className="flex items-center text-sm text-blue-600">
                                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                  Loading models...
                                </div>
                              )}
                            </div>

                            {availableModels[service.id] && availableModels[service.id].length > 0 ? (
                              <div className="space-y-2">
                                {/* Custom Dropdown */}
                                <div className="relative model-dropdown">
                                  <button
                                    type="button"
                                    onClick={(e) => toggleModelDropdown(service.id, e)}
                                    className="w-full input-field flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500"
                                  >
                                    <span className={selectedModels[service.id] ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}>
                                      {selectedModels[service.id] || 'Select a model for content creation...'}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${modelDropdownOpen[service.id] ? 'rotate-180' : ''}`} />
                                  </button>

                                  {/* Dropdown Menu */}
                                  {modelDropdownOpen[service.id] && (
                                    <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                      {availableModels[service.id].map((model) => (
                                        <button
                                          key={model.id}
                                          type="button"
                                          onClick={(e) => handleModelSelection(service.id, model.id, e)}
                                          className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 focus:outline-none focus:bg-gray-50 dark:focus:bg-gray-700 ${
                                            selectedModels[service.id] === model.id 
                                              ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' 
                                              : 'text-gray-900 dark:text-white'
                                          }`}
                                        >
                                          <div className="flex items-center justify-between">
                                            <div>
                                              <div className="font-medium">{model.id}</div>
                                              {model.description && (
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                  {model.description}
                                                </div>
                                              )}
                                            </div>
                                            {selectedModels[service.id] === model.id && (
                                              <CheckCircle className="w-4 h-4 text-primary-600" />
                                            )}
                                          </div>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                {/* Status Info */}
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-green-600 dark:text-green-400 flex items-center">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    {availableModels[service.id].length} models available
                                  </span>
                                  {selectedModels[service.id] && (
                                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                                      ✓ Selected: {selectedModels[service.id]}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ) : settings.api[service.keyField] && !loadingModels[service.id] ? (
                              <div className="text-sm text-red-600 dark:text-red-400 flex items-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                No models found or invalid API key
                              </div>
                            ) : null}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Rate Limiting */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Rate Limit (per hour)
                    </label>
                    <input
                      type="number"
                      value={settings.api.rateLimitPerHour}
                      onChange={(e) => setSettings({
                        ...settings,
                        api: { ...settings.api, rateLimitPerHour: parseInt(e.target.value) }
                      })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Max Tokens per Request
                    </label>
                    <input
                      type="number"
                      value={settings.api.maxTokensPerRequest}
                      onChange={(e) => setSettings({
                        ...settings,
                        api: { ...settings.api, maxTokensPerRequest: parseInt(e.target.value) }
                      })}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Email Settings */}
            {activeTab === 'email' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Email Settings
                  </h2>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => testConnection('SMTP')}
                      className="btn-secondary"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Test SMTP
                    </button>
                    <button
                      onClick={() => handleSave('email')}
                      className="btn-primary"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      SMTP Host
                    </label>
                    <input
                      type="text"
                      value={settings.email.smtpHost}
                      onChange={(e) => setSettings({
                        ...settings,
                        email: { ...settings.email, smtpHost: e.target.value }
                      })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      SMTP Port
                    </label>
                    <input
                      type="number"
                      value={settings.email.smtpPort}
                      onChange={(e) => setSettings({
                        ...settings,
                        email: { ...settings.email, smtpPort: parseInt(e.target.value) }
                      })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      SMTP Username
                    </label>
                    <input
                      type="text"
                      value={settings.email.smtpUser}
                      onChange={(e) => setSettings({
                        ...settings,
                        email: { ...settings.email, smtpUser: e.target.value }
                      })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      SMTP Password
                    </label>
                    <input
                      type="password"
                      value={settings.email.smtpPassword}
                      onChange={(e) => setSettings({
                        ...settings,
                        email: { ...settings.email, smtpPassword: e.target.value }
                      })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    From Email Address
                  </label>
                  <input
                    type="email"
                    value={settings.email.fromEmail}
                    onChange={(e) => setSettings({
                      ...settings,
                      email: { ...settings.email, fromEmail: e.target.value }
                    })}
                    className="input-field"
                  />
                </div>
              </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Security Settings
                  </h2>
                  <button
                    onClick={() => handleSave('security')}
                    className="btn-primary"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </button>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Session Timeout (hours)
                    </label>
                    <input
                      type="number"
                      value={settings.security.sessionTimeout}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: { ...settings.security, sessionTimeout: parseInt(e.target.value) }
                      })}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Minimum Password Length
                    </label>
                    <input
                      type="number"
                      value={settings.security.passwordMinLength}
                      onChange={(e) => setSettings({
                        ...settings,
                        security: { ...settings.security, passwordMinLength: parseInt(e.target.value) }
                      })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        Email Verification Required
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Require users to verify their email before accessing the platform
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.security.requireEmailVerification}
                        onChange={(e) => setSettings({
                          ...settings,
                          security: { ...settings.security, requireEmailVerification: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        Two-Factor Authentication
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Enable two-factor authentication for enhanced security
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.security.enableTwoFactor}
                        onChange={(e) => setSettings({
                          ...settings,
          security: { ...settings.security, enableTwoFactor: e.target.checked }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default AdminSettings
