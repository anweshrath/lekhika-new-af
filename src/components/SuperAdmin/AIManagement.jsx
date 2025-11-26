import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../../lib/supabase'
import { aiModelDiscoveryService } from '../../services/aiModelDiscoveryService'
import PricingScraper from '../PricingScraper'
import toast from 'react-hot-toast'
import { 
  Bot, 
  Play, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Database,
  Zap,
  AlertTriangle,
  MessageSquare,
  Terminal,
  X,
  Calculator,
  Download,
  Globe
} from 'lucide-react'

const AIManagement = () => {
  const [providers, setProviders] = useState([])
  const [selectedProvider, setSelectedProvider] = useState('')
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResults, setTestResults] = useState({})
  const [showChatModal, setShowChatModal] = useState(false)
  const [showConsoleModal, setShowConsoleModal] = useState(false)
  const [showActiveModelsModal, setShowActiveModelsModal] = useState(false)
  const [chatMessages, setChatMessages] = useState([])
  const [consoleLogs, setConsoleLogs] = useState([])
  const [activeModels, setActiveModels] = useState({})
  const [stopTesting, setStopTesting] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [chatHistory, setChatHistory] = useState([])
  const [selectedChatModel, setSelectedChatModel] = useState('')
  const [chatMode, setChatMode] = useState('test') // 'test' or 'chat'
  const [activeTab, setActiveTab] = useState('test') // 'test', 'manage', 'active'
  const [selectedModels, setSelectedModels] = useState([])
  const [batchUpdateData, setBatchUpdateData] = useState({
    input_cost_per_million: '',
    output_cost_per_million: '',
    context_window_tokens: '',
    tokens_per_page: '',
    specialties: '',
    description: ''
  })
  const [filters, setFilters] = useState({
    showActiveOnly: false,
    provider: '',
    status: '',
    minInputCost: '',
    maxInputCost: '',
    minOutputCost: '',
    maxOutputCost: '',
    minContextWindow: '',
    maxContextWindow: '',
    specialty: ''
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState({ key: 'provider', direction: 'asc' })
  const [allModels, setAllModels] = useState({})
  const [editingCell, setEditingCell] = useState(null) // { modelId, field }
  const [editingValue, setEditingValue] = useState('')
  const [scraperUrl, setScraperUrl] = useState('')
  const [scraping, setScraping] = useState(false)
  const [costCalculation, setCostCalculation] = useState(null)
  
  // Use ref to track stop state that persists across renders
  const stopTestingRef = useRef(false)

  // Load available providers on mount
  useEffect(() => {
    loadProviders()
  }, [])

  const loadProviders = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_providers')
        .select('*')
        .eq('is_active', true)

      if (error) throw error
      setProviders(data || [])
    } catch (error) {
      console.error('Error loading providers:', error)
      toast.error('Failed to load AI providers')
    }
  }

  const loadModels = async (forceReload = false) => {
    // This function is only used for Active Models section, not TEST section
    // TEST section should only show API-fetched models, not database models
    try {
      const { data, error } = await supabase
        .from('ai_model_metadata')
        .select('*')
        .eq('is_active', true) // Only load active models
        .order('provider', { ascending: true })
        .order('model_name', { ascending: true })

      if (error) throw error
      
      // Only update active models, not the test models
      if (data && data.length > 0) {
        console.log(`📊 Loading ${data.length} active models from database`)
        
        // Organize models by provider for better display
        const organizedModels = {}
        data.forEach(model => {
          if (!organizedModels[model.provider]) {
            organizedModels[model.provider] = []
          }
          organizedModels[model.provider].push(model)
        })
        
        setActiveModels(organizedModels)
      } else if (forceReload) {
        console.log('⚠️ No active models found in database')
        setActiveModels({})
      }
    } catch (error) {
      console.error('Error loading active models:', error)
      if (forceReload) {
        toast.error('Failed to load active models')
      }
    }
  }

  const loadActiveModels = async () => {
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
      
      setActiveModels(organizedModels)
    } catch (error) {
      console.error('Error loading active models:', error)
      toast.error('Failed to load active models')
    }
  }

  const loadAllModels = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_model_metadata')
        .select('*')
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
      
      setAllModels(organizedModels)
    } catch (error) {
      console.error('Error loading all models:', error)
      toast.error('Failed to load models')
    }
  }

  // Filter and sort models
  const getFilteredAndSortedModels = () => {
    let models = Object.values(allModels).flat()
    
    // Apply filters
    if (filters.showActiveOnly) {
      models = models.filter(model => model.is_active)
    }
    
    if (filters.provider) {
      models = models.filter(model => model.provider === filters.provider)
    }
    
    if (filters.status) {
      const isActive = filters.status === 'active'
      models = models.filter(model => model.is_active === isActive)
    }
    
    if (filters.minInputCost) {
      models = models.filter(model => model.input_cost_per_million >= parseFloat(filters.minInputCost))
    }
    
    if (filters.maxInputCost) {
      models = models.filter(model => model.input_cost_per_million <= parseFloat(filters.maxInputCost))
    }
    
    if (filters.minOutputCost) {
      models = models.filter(model => model.output_cost_per_million >= parseFloat(filters.minOutputCost))
    }
    
    if (filters.maxOutputCost) {
      models = models.filter(model => model.output_cost_per_million <= parseFloat(filters.maxOutputCost))
    }
    
    if (filters.minContextWindow) {
      models = models.filter(model => model.context_window_tokens >= parseInt(filters.minContextWindow))
    }
    
    if (filters.maxContextWindow) {
      models = models.filter(model => model.context_window_tokens <= parseInt(filters.maxContextWindow))
    }
    
    if (filters.specialty) {
      models = models.filter(model => 
        Array.isArray(model.specialties) 
          ? model.specialties.some(s => s.toLowerCase().includes(filters.specialty.toLowerCase()))
          : model.specialties?.toLowerCase().includes(filters.specialty.toLowerCase())
      )
    }
    
    // Apply search
    if (searchTerm) {
      models = models.filter(model => 
        model.model_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.provider.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    // Apply sorting
    models.sort((a, b) => {
      let aVal = a[sortConfig.key]
      let bVal = b[sortConfig.key]
      
      if (typeof aVal === 'string') {
        aVal = aVal.toLowerCase()
        bVal = bVal.toLowerCase()
      }
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
    
    return models
  }

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleBatchUpdate = async () => {
    if (selectedModels.length === 0) return
    
    try {
      const updateData = {}
      
      if (batchUpdateData.input_cost_per_million) {
        updateData.input_cost_per_million = parseFloat(batchUpdateData.input_cost_per_million)
      }
      if (batchUpdateData.output_cost_per_million) {
        updateData.output_cost_per_million = parseFloat(batchUpdateData.output_cost_per_million)
      }
      if (batchUpdateData.context_window_tokens) {
        updateData.context_window_tokens = parseInt(batchUpdateData.context_window_tokens)
      }
      if (batchUpdateData.tokens_per_page) {
        updateData.tokens_per_page = parseInt(batchUpdateData.tokens_per_page)
      }
      if (batchUpdateData.specialties) {
        updateData.specialties = batchUpdateData.specialties.split(',').map(s => s.trim()).filter(s => s)
      }
      if (batchUpdateData.description) {
        updateData.description = batchUpdateData.description
      }
      
      updateData.last_updated = new Date().toISOString()
      
      const { error } = await supabase
        .from('ai_model_metadata')
        .update(updateData)
        .in('id', selectedModels)
      
      if (error) throw error
      
      toast.success(`Updated ${selectedModels.length} models successfully`)
      setSelectedModels([])
      setBatchUpdateData({
        input_cost_per_million: '',
        output_cost_per_million: '',
        context_window_tokens: '',
        tokens_per_page: '',
        specialties: '',
        description: ''
      })
      
      // Reload models
      await loadAllModels()
      
    } catch (error) {
      console.error('Error updating models:', error)
      toast.error('Failed to update models')
    }
  }

  const handleBulkAction = async (action) => {
    if (selectedModels.length === 0) return
    
    try {
      let updateData = {}
      
      switch (action) {
        case 'activate':
          updateData = { is_active: true }
          break
        case 'deactivate':
          updateData = { is_active: false }
          break
        case 'delete':
          const { error: deleteError } = await supabase
            .from('ai_model_metadata')
            .delete()
            .in('id', selectedModels)
          
          if (deleteError) throw deleteError
          toast.success(`Deleted ${selectedModels.length} models successfully`)
          break
        default:
          return
      }
      
      if (action !== 'delete') {
        updateData.last_updated = new Date().toISOString()
        
        const { error } = await supabase
          .from('ai_model_metadata')
          .update(updateData)
          .in('id', selectedModels)
        
        if (error) throw error
        
        toast.success(`${action === 'activate' ? 'Activated' : 'Deactivated'} ${selectedModels.length} models successfully`)
      }
      
      setSelectedModels([])
      await loadAllModels()
      
    } catch (error) {
      console.error(`Error ${action}ing models:`, error)
      toast.error(`Failed to ${action} models`)
    }
  }

  const startEditing = (modelId, field, currentValue) => {
    setEditingCell({ modelId, field })
    setEditingValue(currentValue || '')
  }

  const saveEdit = async () => {
    if (!editingCell) return
    
    try {
      const updateData = {
        [editingCell.field]: editingValue,
        last_updated: new Date().toISOString()
      }
      
      // Handle special field types
      if (editingCell.field === 'input_cost_per_million' || editingCell.field === 'output_cost_per_million') {
        updateData[editingCell.field] = parseFloat(editingValue) || 0
      } else if (editingCell.field === 'context_window_tokens' || editingCell.field === 'tokens_per_page') {
        updateData[editingCell.field] = parseInt(editingValue) || 0
      } else if (editingCell.field === 'specialties') {
        updateData[editingCell.field] = editingValue.split(',').map(s => s.trim()).filter(s => s)
      } else if (editingCell.field === 'is_active') {
        updateData[editingCell.field] = editingValue === 'true' || editingValue === 'active'
      }
      
      const { error } = await supabase
        .from('ai_model_metadata')
        .update(updateData)
        .eq('id', editingCell.modelId)
      
      if (error) throw error
      
      toast.success('Model updated successfully')
      setEditingCell(null)
      setEditingValue('')
      
      // Reload models
      await loadAllModels()
      
    } catch (error) {
      console.error('Error updating model:', error)
      toast.error('Failed to update model')
    }
  }

  const cancelEdit = () => {
    setEditingCell(null)
    setEditingValue('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      saveEdit()
    } else if (e.key === 'Escape') {
      cancelEdit()
    }
  }

  const calculateTokenCosts = (inputCost, outputCost, contextWindow) => {
    if (!inputCost || !outputCost || !contextWindow) return null
    
    const inputPerMillion = parseFloat(inputCost) * 1000000
    const outputPerMillion = parseFloat(outputCost) * 1000000
    const tokensPerPage = Math.floor(contextWindow * 0.8) // 80% of context window for content
    
    return {
      inputPerMillion: inputPerMillion.toFixed(2),
      outputPerMillion: outputPerMillion.toFixed(2),
      tokensPerPage,
      pagesPerMillion: Math.floor(1000000 / tokensPerPage),
      costPerPage: ((inputPerMillion + outputPerMillion) / 2 / tokensPerPage).toFixed(6)
    }
  }

  const scrapePricingFromUrl = async () => {
    if (!scraperUrl.trim()) {
      toast.error('Please enter a pricing URL')
      return
    }

    setScraping(true)
    try {
      console.log(`🔍 Scraping pricing from: ${scraperUrl}`)
      
      // Fetch real pricing data from ai_model_metadata table
      console.log('🔍 Fetching real pricing data from database...')

      const { data: modelsData, error: modelsError } = await supabase
        .from('ai_model_metadata')
        .select('*')
        .eq('is_active', true)
        .order('provider', { ascending: true })
        .order('model_name', { ascending: true })

      if (modelsError) {
        console.error('❌ Error fetching models:', modelsError)
        toast.error('Failed to fetch model data from database')
        return
      }

      if (!modelsData || modelsData.length === 0) {
        toast.error('No active models found in database')
        return
      }

      console.log(`✅ Found ${modelsData.length} active models in database`)

      // Group models by provider for the scraper
      const pricingData = {
        models: modelsData.map(model => ({
          provider: model.provider,
          modelId: model.model_id, // Use the actual model_id from database
          inputCostPerMillion: model.input_cost_per_million || 0,
          outputCostPerMillion: model.output_cost_per_million || 0,
          contextWindow: model.context_window_tokens || 0,
          specialties: model.specialties || [],
          description: model.description || `${model.model_name} AI model`
        }))
      }
      
      console.log('✅ Using pricing data from database:', pricingData)

      // Update models with database data
      if (pricingData.models && pricingData.models.length > 0) {
        let updatedCount = 0
        
        for (const modelData of pricingData.models) {
          const { error } = await supabase
            .from('ai_model_metadata')
            .update({
              input_cost_per_million: modelData.inputCostPerMillion || 0,
              output_cost_per_million: modelData.outputCostPerMillion || 0,
              context_window_tokens: modelData.contextWindow || 0,
              specialties: modelData.specialties || [],
              description: modelData.description || '',
              last_updated: new Date().toISOString()
            })
            .eq('provider', modelData.provider)
            .eq('model_id', modelData.modelId)
          
          if (!error) {
            updatedCount++
          } else {
            console.error(`❌ Failed to update model ${modelData.modelId}:`, error)
          }
        }
        
        toast.success(`Updated ${updatedCount} models with scraped pricing data`)
        await loadAllModels() // Refresh the table
        
      } else {
        toast.error('No pricing data found on the page')
      }
      
    } catch (error) {
      console.error('❌ Failed to scrape pricing:', error)
      toast.error(`Failed to scrape pricing: ${error.message}`)
    } finally {
      setScraping(false)
    }
  }

  const updateCostCalculation = (inputCost, outputCost, contextWindow) => {
    const calculation = calculateTokenCosts(inputCost, outputCost, contextWindow)
    setCostCalculation(calculation)
  }

  const handleProviderSelect = async (providerName) => {
    if (!providerName) return

    setSelectedProvider(providerName)
    setLoading(true)

    try {
      // Find the provider with API key by NAME
      const provider = providers.find(p => p.name === providerName)
      if (!provider) {
        toast.error('Provider not found')
        return
      }

      console.log(`🚀 Fetching models for ${provider.name} (${provider.provider})...`)
      
      // Fetch models from API and store in database with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Model fetching timeout after 30 seconds')), 30000)
      )
      
      const fetchPromise = aiModelDiscoveryService.discoverModelsForProvider(provider.provider, provider.api_key)
      
      const fetchedModels = await Promise.race([fetchPromise, timeoutPromise])
      
      // Display fetched models even if database storage fails
      if (fetchedModels && fetchedModels.length > 0) {
        // Update the provider field to match our naming convention
        const updatedModels = fetchedModels.map(model => ({
          ...model,
          provider: provider.provider // Use the provider type, not the provider name
        }))
        setModels(updatedModels)
        toast.success(`Fetched ${fetchedModels.length} models for ${provider.name}`)
        
        // Don't reload from database - keep the fetched models for testing
        // Database is only for storing/updating, not for displaying in TEST section
      } else {
        toast.error(`No models fetched for ${provider.name}`)
        setModels([])
      }
      
    } catch (error) {
      console.error('Error fetching models:', error)
      toast.error(`Failed to fetch models for ${providerName}: ${error.message}`)
      setModels([])
    } finally {
      setLoading(false)
    }
  }

  const testAllModels = async (selectedProvider = null) => {
    if (models.length === 0) {
      toast.error('No models to test')
      return
    }

    if (!selectedProvider) {
      toast.error('No provider selected for testing')
      return
    }

    setTesting(true)
    setStopTesting(false)
    stopTestingRef.current = false // Reset the ref
    setTestResults({})
    setChatMessages([])
    setConsoleLogs([])
    setChatMode('test')
    setShowChatModal(true)
    setShowConsoleModal(true)
    
    const testPrompt = "Checking whether you are AI. Respond in 4 words"
    const results = {}

    const addConsoleLog = (message, type = 'info') => {
      const log = {
        timestamp: new Date().toISOString(),
        type,
        message
      }
      setConsoleLogs(prev => [...prev, log])
    }

    const addChatMessage = (model, response, success) => {
      const message = {
        timestamp: new Date().toISOString(),
        model: `${model.provider}:${model.model_name}`,
        prompt: testPrompt,
        response: success ? response : 'Failed to get response',
        success
      }
      setChatMessages(prev => [...prev, message])
    }

    // Use ref to check stop state - this will always have the latest value
    const checkStopState = () => {
      return stopTestingRef.current
    }

    try {
      addConsoleLog(`🧪 Starting test of ${models.length} models...`, 'info')
      
      // Test each model sequentially to avoid rate limits
      for (const model of models) {
        // Check if stop was requested - use current state
        if (checkStopState()) {
          addConsoleLog(`🛑 Testing stopped by user`, 'info')
          break
        }

        // Use the selected provider directly
        const provider = selectedProvider
        if (!provider) {
          results[model.id] = { success: false, error: 'No API key found' }
          addConsoleLog(`❌ No API key found for ${model.provider}`, 'error')
          addChatMessage(model, 'No API key found', false)
          continue
        }

        try {
          // Check if stop was requested before starting test
          if (checkStopState()) {
            addConsoleLog(`🛑 Testing stopped by user`, 'info')
            break
          }
          
          addConsoleLog(`Testing ${model.provider}:${model.model_id}...`, 'info')

          // Make API call based on provider
          const response = await testModelWithProvider(model, provider.api_key, testPrompt)
          
          if (response && response.length > 0) {
            results[model.id] = { success: true, response: response.substring(0, 100) }
            addConsoleLog(`✅ ${model.provider}:${model.model_id} responded successfully`, 'success')
            addChatMessage(model, response, true)
            
            // Check if stop was requested before database operation
            if (checkStopState()) {
              addConsoleLog(`🛑 Testing stopped by user`, 'info')
              break
            }
            
            // Upsert model as active in database (create if doesn't exist, update if exists)
            console.log(`🔍 Upserting model ${model.provider}:${model.model_id} as active`)
            
            // Get current user for RLS compliance
            const { data: { user } } = await supabase.auth.getUser()
            
            const modelData = {
              provider: (() => {
                const providerMap = { 'claude': 'anthropic', 'google': 'gemini' };
                return providerMap[provider.provider] || provider.provider;
              })(), // Use mapped provider TYPE (anthropic, gemini, etc.)
              model_id: model.model_id, // Use original model_id
              model_name: model.model_name || model.model_id,
              key_name: provider.name, // Store the key name (OPENA-02-2222, etc.)
              key_model: `${provider.name}_${model.model_name || model.model_id}`, // Combined key_name + model_name
              input_cost_per_million: model.input_cost_per_million || 0,
              output_cost_per_million: model.output_cost_per_million || 0,
              context_window_tokens: model.context_window_tokens || 0,
              specialties: [],
              tokens_per_page: model.tokens_per_page || 0,
              description: model.description || `${provider.name} AI model`,
              is_active: true,
              last_updated: new Date().toISOString(),
              metadata: model.metadata || JSON.stringify({}),
              user_id: user?.id || null
            }
            
            // Use upsert with key_model conflict resolution
            const { error: upsertError } = await supabase
              .from('ai_model_metadata')
              .upsert(modelData, {
                onConflict: 'key_model',
                ignoreDuplicates: false
              })
              
            if (upsertError) {
              console.error(`❌ Failed to upsert model as active:`, upsertError)
              console.error(`❌ Model data being upserted:`, modelData)
              addConsoleLog(`❌ Failed to upsert ${model.provider}:${model.model_id} as active in database: ${upsertError.message}`, 'error')
            } else {
              addConsoleLog(`✅ Upserted ${model.provider}:${model.model_id} as active in database`, 'success')
            }
              
          } else {
            results[model.id] = { success: false, error: 'Empty response' }
            addConsoleLog(`❌ ${model.provider}:${model.model_id} returned empty response`, 'error')
            addChatMessage(model, 'Empty response', false)
            
            // Upsert model as inactive in database
            // Get current user for RLS compliance
            const { data: { user } } = await supabase.auth.getUser()
            
            const modelData = {
              provider: (() => {
                const providerMap = { 'claude': 'anthropic', 'google': 'gemini' };
                return providerMap[provider.provider] || provider.provider;
              })(), // Use mapped provider TYPE (anthropic, gemini, etc.)
              model_id: model.model_id, // Use original model_id
              model_name: model.model_name || model.model_id,
              key_name: provider.name, // Store the key name (OPENA-02-2222, etc.)
              key_model: `${provider.name}_${model.model_name || model.model_id}`, // Combined key_name + model_name
              input_cost_per_million: model.input_cost_per_million || 0,
              output_cost_per_million: model.output_cost_per_million || 0,
              context_window_tokens: model.context_window_tokens || 0,
              specialties: [],
              tokens_per_page: model.tokens_per_page || 0,
              description: model.description || `${provider.name} AI model`,
              is_active: false,
              last_updated: new Date().toISOString(),
              metadata: model.metadata || JSON.stringify({}),
              user_id: user?.id || null
            }
            
            // Try to insert first, if it fails due to duplicate, update instead
            const { error: insertError } = await supabase
              .from('ai_model_metadata')
              .insert(modelData)
              
            let upsertError = insertError
            
            // If insert failed due to duplicate, try update
            if (insertError && insertError.code === '23505') {
              const { error: updateError } = await supabase
                .from('ai_model_metadata')
                .update({
                  is_active: modelData.is_active,
                  last_updated: modelData.last_updated,
                  metadata: modelData.metadata
                })
                .eq('key_name', modelData.key_name)
                .eq('model_id', modelData.model_id)
                
              upsertError = updateError
            }
              
            if (upsertError) {
              console.error(`❌ Failed to upsert model as inactive:`, upsertError)
              console.error(`❌ Model data being upserted:`, modelData)
              addConsoleLog(`❌ Failed to upsert ${model.provider}:${model.model_id} as inactive in database: ${upsertError.message}`, 'error')
            } else {
              addConsoleLog(`✅ Upserted ${model.provider}:${model.model_id} as inactive in database`, 'success')
            }
          }
          
        } catch (error) {
          // Check if stop was requested even in error case
          if (checkStopState()) {
            addConsoleLog(`🛑 Testing stopped by user`, 'info')
            break
          }
          
          console.error(`Test failed for ${model.model_id}:`, error)
          results[model.id] = { success: false, error: error.message }
          addConsoleLog(`❌ ${model.provider}:${model.model_id} failed: ${error.message}`, 'error')
          addChatMessage(model, error.message, false)
          
          // Upsert model as inactive in database
          // Get current user for RLS compliance
          const { data: { user } } = await supabase.auth.getUser()
          
          const modelData = {
            provider: provider.provider, // Use provider TYPE (openai, mistral, etc.)
            model_id: model.model_id, // Use original model_id
            model_name: model.model_name || model.model_id,
            key_name: provider.name, // Store the key name (OPENA-02-2222, etc.)
            key_model: `${provider.name}_${model.model_name || model.model_id}`, // Combined key_name + model_name
            input_cost_per_million: model.input_cost_per_million || 0,
            output_cost_per_million: model.output_cost_per_million || 0,
            context_window_tokens: model.context_window_tokens || 0,
            specialties: model.specialties || '',
            tokens_per_page: model.tokens_per_page || 0,
            description: model.description || `${provider.name} AI model`,
            is_active: false,
            last_updated: new Date().toISOString(),
            metadata: model.metadata || JSON.stringify({}),
            user_id: user?.id || null
          }
          
          // Use upsert with key_model conflict resolution
          const { error: upsertError } = await supabase
            .from('ai_model_metadata')
            .upsert(modelData, {
              onConflict: 'key_model',
              ignoreDuplicates: false
            })
            
          if (upsertError) {
            console.error(`❌ Failed to upsert model as inactive:`, upsertError)
            console.error(`❌ Model data being upserted:`, modelData)
            addConsoleLog(`❌ Failed to upsert ${model.provider}:${model.model_id} as inactive in database: ${upsertError.message}`, 'error')
          } else {
            addConsoleLog(`✅ Upserted ${model.provider}:${model.model_id} as inactive in database`, 'success')
          }
        }

        // Update UI with current results
        setTestResults({ ...results })
        
        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Check if stop was requested after delay
        if (checkStopState()) {
          addConsoleLog(`🛑 Testing stopped by user`, 'info')
          break
        }
      }

      // Reload active models to show updated status (TEST section keeps its own models)
      await loadActiveModels()
      
      const totalTested = Object.keys(results).length
      const activeCount = Object.values(results).filter(r => r.success).length
      
      // Only show completion alert when testing is actually finished
      if (stopTestingRef.current) {
        addConsoleLog(`🛑 Testing stopped: ${activeCount}/${totalTested} models active`, 'info')
        toast.info(`Testing stopped: ${activeCount}/${totalTested} models active`)
      } else if (totalTested > 0) {
        addConsoleLog(`🎉 Testing complete: ${activeCount}/${totalTested} models active`, 'success')
        toast.success(`Testing complete: ${activeCount}/${totalTested} models active`)
      }
      
    } catch (error) {
      console.error('Error during testing:', error)
      addConsoleLog(`💥 Testing failed: ${error.message}`, 'error')
      toast.error('Testing failed')
    } finally {
      setTesting(false)
      // Don't reset stopTesting here - let it stay true until user starts testing again
    }
  }

  const stopTestingModels = () => {
    console.log('🛑 Stop button clicked - setting stopTesting to true')
    setStopTesting(true)
    stopTestingRef.current = true // Set the ref immediately
    setTesting(false) // Immediately stop the testing state
    toast.info('Stopping tests...')
    
    // Add console log if the modal is open
    if (showConsoleModal) {
      const addConsoleLog = (message, type = 'info') => {
        const log = {
          timestamp: new Date().toISOString(),
          type,
          message
        }
        setConsoleLogs(prev => [...prev, log])
      }
      addConsoleLog('🛑 Stop requested by user', 'info')
    }
  }

  const handleSendMessage = async () => {
    if (!selectedChatModel || !chatInput.trim()) return

    const selectedModel = models.find(m => m.id === selectedChatModel)
    if (!selectedModel) return

    const userMessage = {
      role: 'user',
      content: chatInput,
      timestamp: new Date().toISOString(),
      model: `${selectedModel.provider}:${selectedModel.model_name}`
    }

    // Add user message to chat history
    setChatHistory(prev => [...prev, userMessage])
    setChatInput('')

    try {
      // Find provider with API key
      const provider = providers.find(p => p.provider === selectedModel.provider)
      if (!provider) {
        toast.error('No API key found for this provider')
        return
      }

      // Send message to AI model
      const response = await testModelWithProvider(selectedModel, provider.api_key, chatInput)
      
      const aiMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
        model: `${selectedModel.provider}:${selectedModel.model_name}`
      }

      // Add AI response to chat history
      setChatHistory(prev => [...prev, aiMessage])

    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage = {
        role: 'assistant',
        content: `Error: ${error.message}`,
        timestamp: new Date().toISOString(),
        model: `${selectedModel.provider}:${selectedModel.model_name}`
      }
      setChatHistory(prev => [...prev, errorMessage])
      toast.error('Failed to send message')
    }
  }

  const testModelWithProvider = async (model, apiKey, prompt) => {
    const { provider, model_id } = model
    
    switch (provider) {
      case 'openai':
        return await testOpenAIModel(model_id, apiKey, prompt)
      case 'anthropic':
      case 'claude': // Map claude to anthropic for backward compatibility
        return await testAnthropicModel(model_id, apiKey, prompt)
      case 'gemini':
        return await testGoogleModel(model_id, apiKey, prompt)
      case 'mistral':
        return await testMistralModel(model_id, apiKey, prompt)
      case 'perplexity':
        return await testPerplexityModel(model_id, apiKey, prompt)
      case 'grok':
        return await testGrokModel(model_id, apiKey, prompt)
      default:
        throw new Error(`Unsupported provider: ${provider}`)
    }
  }

  const testOpenAIModel = async (modelId, apiKey, prompt) => {
    const response = await fetch('/api/openai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 10
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || ''
  }

  const testAnthropicModel = async (modelId, apiKey, prompt) => {
    const response = await fetch('/api/claude/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: modelId,
        max_tokens: 10,
        messages: [{ role: 'user', content: prompt }]
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    return data.content[0]?.text || ''
  }

  const testGoogleModel = async (modelId, apiKey, prompt) => {
    const response = await fetch(`/api/gemini/models/${modelId}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          maxOutputTokens: 10
        }
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    return data.candidates[0]?.content?.parts[0]?.text || ''
  }

  const testMistralModel = async (modelId, apiKey, prompt) => {
    const response = await fetch('/api/mistral/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 10
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || ''
  }

  const testPerplexityModel = async (modelId, apiKey, prompt) => {
    const response = await fetch('/api/perplexity/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 10
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || ''
  }

  const testGrokModel = async (modelId, apiKey, prompt) => {
    const response = await fetch('/api/grok/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelId,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 10
      })
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const data = await response.json()
    return data.choices[0]?.message?.content || ''
  }

  // Load models on component mount
  useEffect(() => {
    loadModels(true) // Force reload on mount
  }, [])

  // Load models when switching to manage tab
  useEffect(() => {
    if (activeTab === 'manage') {
      loadAllModels()
    } else if (activeTab === 'active') {
      loadActiveModels()
    }
  }, [activeTab])

  const uniqueProviders = [...new Set(providers.map(p => p.provider))]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">AI Model Management</h2>
            <p className="text-gray-400">Fetch, test, and manage AI models</p>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('test')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'test' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Test Models
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'manage' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Manage Models
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'active' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Active Models
          </button>
          <button
            onClick={() => setActiveTab('scraper')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'scraper' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Pricing Scraper
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setChatMode('chat')
              setShowChatModal(true)
            }}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            Chat
          </button>
          
          
          <button
            onClick={() => setShowConsoleModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <Terminal className="w-4 h-4" />
            Console
          </button>
          
          {testing ? (
            <button
              onClick={stopTestingModels}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Stop Testing
            </button>
          ) : (
            <button
              onClick={() => {
                const provider = providers.find(p => p.name === selectedProvider)
                testAllModels(provider)
              }}
              disabled={models.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
            >
              <Play className="w-4 h-4" />
              Test All Models
            </button>
          )}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'test' && (
        <>
          {/* Provider Selection */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-400" />
          Fetch Models from Provider
        </h3>
        
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <select
              value={selectedProvider}
              onChange={(e) => handleProviderSelect(e.target.value)}
              disabled={loading}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
            >
              <option value="">Select AI Provider</option>
              {providers.map((provider) => (
                <option key={provider.id} value={provider.name}>
                  {provider.name} ({provider.provider})
                </option>
              ))}
            </select>
          </div>
          
          {loading && (
            <div className="flex items-center gap-3 text-blue-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Fetching models...</span>
              <button
                onClick={() => setLoading(false)}
                className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Models List */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-green-400" />
          Available Models ({models.length})
        </h3>
        
        {models.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <p className="text-gray-400">No models found. Select a provider to fetch models.</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {models.map((model) => (
              <div
                key={model.id}
                className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    model.is_active ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <div className="font-medium text-white">
                      {model.provider}:{model.model_name}
                    </div>
                    <div className="text-sm text-gray-400">
                      {model.context_window_tokens} tokens • Updated: {new Date(model.last_updated).toLocaleString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {testResults[model.id] && (
                    <div className="text-sm">
                      {testResults[model.id].success ? (
                        <div className="flex items-center gap-1 text-green-400">
                          <CheckCircle className="w-4 h-4" />
                          <span>Active</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-red-400">
                          <XCircle className="w-4 h-4" />
                          <span>Failed</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {model.is_active ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
        </>
      )}

      {/* Manage Models Tab */}
      {activeTab === 'manage' && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-blue-400" />
                Model Management Table
              </h3>
              <p className="text-gray-400">Click any cell to edit • {getFilteredAndSortedModels().length} models</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => loadAllModels()}
                className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
              >
                Refresh
              </button>
              <button
                onClick={() => {
                  const csvData = getFilteredAndSortedModels().map(model => ({
                    provider: model.provider,
                    model_name: model.model_name,
                    input_cost: model.input_cost_per_million,
                    output_cost: model.output_cost_per_million,
                    context_window: model.context_window_tokens,
                    specialties: Array.isArray(model.specialties) ? model.specialties.join(', ') : model.specialties,
                    description: model.description,
                    is_active: model.is_active
                  }))
                  
                  const csv = [
                    Object.keys(csvData[0]).join(','),
                    ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
                  ].join('\n')
                  
                  const blob = new Blob([csv], { type: 'text/csv' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'ai_models.csv'
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
              >
                Export CSV
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            {/* Search */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search models, providers, descriptions..."
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="showActiveOnly"
                  checked={filters.showActiveOnly}
                  onChange={(e) => setFilters({...filters, showActiveOnly: e.target.checked})}
                  className="rounded"
                />
                <label htmlFor="showActiveOnly" className="text-sm text-gray-300">Active only</label>
              </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Provider</label>
                <select
                  value={filters.provider}
                  onChange={(e) => setFilters({...filters, provider: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                >
                  <option value="">All Providers</option>
                  {Object.keys(allModels).map(provider => (
                    <option key={provider} value={provider}>{provider}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                >
                  <option value="">All</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Min Input Cost</label>
                <input
                  type="number"
                  step="0.000001"
                  value={filters.minInputCost}
                  onChange={(e) => setFilters({...filters, minInputCost: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                  placeholder="0.000001"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Max Input Cost</label>
                <input
                  type="number"
                  step="0.000001"
                  value={filters.maxInputCost}
                  onChange={(e) => setFilters({...filters, maxInputCost: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm"
                  placeholder="0.01"
                />
              </div>
            </div>
          </div>

          {/* Pricing Scraper Section */}
          <div className="mb-6 p-4 bg-gray-700 rounded-lg">
            <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              Pricing Scraper
            </h4>
            <p className="text-gray-400 text-sm mb-3">Enter a pricing page URL to automatically scrape and update model costs</p>
            <div className="flex gap-3">
              <input
                type="url"
                value={scraperUrl}
                onChange={(e) => setScraperUrl(e.target.value)}
                placeholder="https://openai.com/pricing or https://www.anthropic.com/pricing"
                className="flex-1 bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white placeholder-gray-400"
              />
              <button
                onClick={scrapePricingFromUrl}
                disabled={scraping || !scraperUrl.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {scraping ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Scraping...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Scrape & Update
                  </>
                )}
              </button>
            </div>
            <div className="mt-3 text-xs text-gray-400">
              <p>Supported: OpenAI, Anthropic, Google, Mistral, Perplexity, Grok pricing pages</p>
            </div>
          </div>

          {/* Cost Calculator Section */}
          <div className="mb-6 p-4 bg-gray-700 rounded-lg">
            <h4 className="text-md font-semibold text-white mb-3 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-green-400" />
              Cost Calculator
            </h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Input Cost (per token)</label>
                <input
                  type="number"
                  step="0.000000001"
                  onChange={(e) => {
                    const inputCost = e.target.value
                    const outputCost = costCalculation?.outputPerMillion ? costCalculation.outputPerMillion / 1000000 : 0
                    const contextWindow = costCalculation?.tokensPerPage ? costCalculation.tokensPerPage / 0.8 : 0
                    updateCostCalculation(inputCost, outputCost, contextWindow)
                  }}
                  className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white text-sm"
                  placeholder="0.000000001"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Output Cost (per token)</label>
                <input
                  type="number"
                  step="0.000000001"
                  onChange={(e) => {
                    const outputCost = e.target.value
                    const inputCost = costCalculation?.inputPerMillion ? costCalculation.inputPerMillion / 1000000 : 0
                    const contextWindow = costCalculation?.tokensPerPage ? costCalculation.tokensPerPage / 0.8 : 0
                    updateCostCalculation(inputCost, outputCost, contextWindow)
                  }}
                  className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white text-sm"
                  placeholder="0.000000003"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Context Window (tokens)</label>
                <input
                  type="number"
                  onChange={(e) => {
                    const contextWindow = e.target.value
                    const inputCost = costCalculation?.inputPerMillion ? costCalculation.inputPerMillion / 1000000 : 0
                    const outputCost = costCalculation?.outputPerMillion ? costCalculation.outputPerMillion / 1000000 : 0
                    updateCostCalculation(inputCost, outputCost, contextWindow)
                  }}
                  className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white text-sm"
                  placeholder="128000"
                />
              </div>
            </div>
            
            {costCalculation && (
              <div className="mt-4 p-3 bg-gray-600 rounded-lg">
                <h5 className="text-sm font-semibold text-white mb-2">Cost Analysis</h5>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-300">Input Cost (per million tokens):</p>
                    <p className="text-white font-mono">${costCalculation.inputPerMillion}</p>
                  </div>
                  <div>
                    <p className="text-gray-300">Output Cost (per million tokens):</p>
                    <p className="text-white font-mono">${costCalculation.outputPerMillion}</p>
                  </div>
                  <div>
                    <p className="text-gray-300">Tokens per Page (80% context):</p>
                    <p className="text-white font-mono">{costCalculation.tokensPerPage.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-300">Pages per Million Tokens:</p>
                    <p className="text-white font-mono">{costCalculation.pagesPerMillion.toLocaleString()}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-300">Average Cost per Page:</p>
                    <p className="text-white font-mono text-lg">${costCalculation.costPerPage}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Batch Update Section */}
          {selectedModels.length > 0 && (
            <div className="mb-6 p-4 bg-gray-700 rounded-lg">
              <h4 className="text-md font-semibold text-white mb-3">Batch Update {selectedModels.length} Selected Models</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Input Cost (per million tokens)</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={batchUpdateData.input_cost_per_million}
                    onChange={(e) => setBatchUpdateData({...batchUpdateData, input_cost_per_million: e.target.value})}
                    className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white"
                    placeholder="0.000001"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Output Cost (per million tokens)</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={batchUpdateData.output_cost_per_million}
                    onChange={(e) => setBatchUpdateData({...batchUpdateData, output_cost_per_million: e.target.value})}
                    className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white"
                    placeholder="0.000003"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Context Window (tokens)</label>
                  <input
                    type="number"
                    value={batchUpdateData.context_window_tokens}
                    onChange={(e) => setBatchUpdateData({...batchUpdateData, context_window_tokens: e.target.value})}
                    className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white"
                    placeholder="128000"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Specialties (comma-separated)</label>
                  <input
                    type="text"
                    value={batchUpdateData.specialties}
                    onChange={(e) => setBatchUpdateData({...batchUpdateData, specialties: e.target.value})}
                    className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white"
                    placeholder="text generation, coding, analysis"
                  />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleBatchUpdate}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Update Selected Models
                </button>
                <button
                  onClick={() => handleBulkAction('activate')}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                >
                  Activate Selected
                </button>
                <button
                  onClick={() => handleBulkAction('deactivate')}
                  className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
                >
                  Deactivate Selected
                </button>
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Delete Selected
                </button>
                <button
                  onClick={() => setSelectedModels([])}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}

          {/* Models Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-600">
                  <th className="text-left py-3 px-2">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        const filteredModels = getFilteredAndSortedModels()
                        if (e.target.checked) {
                          setSelectedModels(filteredModels.map(m => m.id))
                        } else {
                          setSelectedModels([])
                        }
                      }}
                      className="rounded"
                    />
                  </th>
                  <th 
                    className="text-left py-3 px-2 text-white font-semibold cursor-pointer hover:bg-gray-700 rounded"
                    onClick={() => handleSort('provider')}
                  >
                    Provider {sortConfig.key === 'provider' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="text-left py-3 px-2 text-white font-semibold cursor-pointer hover:bg-gray-700 rounded"
                    onClick={() => handleSort('model_name')}
                  >
                    Model Name {sortConfig.key === 'model_name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="text-left py-3 px-2 text-white font-semibold cursor-pointer hover:bg-gray-700 rounded"
                    onClick={() => handleSort('key_model')}
                  >
                    Key Model {sortConfig.key === 'key_model' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="text-left py-3 px-2 text-white font-semibold cursor-pointer hover:bg-gray-700 rounded"
                    onClick={() => handleSort('input_cost_per_million')}
                  >
                    Input Cost {sortConfig.key === 'input_cost_per_million' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="text-left py-3 px-2 text-white font-semibold cursor-pointer hover:bg-gray-700 rounded"
                    onClick={() => handleSort('output_cost_per_million')}
                  >
                    Output Cost {sortConfig.key === 'output_cost_per_million' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    className="text-left py-3 px-2 text-white font-semibold cursor-pointer hover:bg-gray-700 rounded"
                    onClick={() => handleSort('context_window_tokens')}
                  >
                    Context Window {sortConfig.key === 'context_window_tokens' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th className="text-left py-3 px-2 text-white font-semibold">Specialties</th>
                  <th className="text-left py-3 px-2 text-white font-semibold">Description</th>
                  <th 
                    className="text-left py-3 px-2 text-white font-semibold cursor-pointer hover:bg-gray-700 rounded"
                    onClick={() => handleSort('is_active')}
                  >
                    Status {sortConfig.key === 'is_active' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {getFilteredAndSortedModels().length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center py-8 text-gray-400">
                      No models found. Test some models first to populate this table.
                    </td>
                  </tr>
                ) : (
                  getFilteredAndSortedModels().map((model) => (
                    <tr key={model.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                      <td className="py-3 px-2">
                        <input
                          type="checkbox"
                          checked={selectedModels.includes(model.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedModels([...selectedModels, model.id])
                            } else {
                              setSelectedModels(selectedModels.filter(id => id !== model.id))
                            }
                          }}
                          className="rounded"
                        />
                      </td>
                      <td 
                        className="py-3 px-2 text-white cursor-pointer hover:bg-gray-600 rounded"
                        onClick={() => startEditing(model.id, 'provider', model.provider)}
                      >
                        {editingCell?.modelId === model.id && editingCell?.field === 'provider' ? (
                          <input
                            type="text"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={saveEdit}
                            onKeyDown={handleKeyPress}
                            className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm"
                            autoFocus
                          />
                        ) : (
                          model.provider
                        )}
                      </td>
                      <td 
                        className="py-3 px-2 text-white cursor-pointer hover:bg-gray-600 rounded"
                        onClick={() => startEditing(model.id, 'model_name', model.model_name)}
                      >
                        {editingCell?.modelId === model.id && editingCell?.field === 'model_name' ? (
                          <input
                            type="text"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={saveEdit}
                            onKeyDown={handleKeyPress}
                            className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm"
                            autoFocus
                          />
                        ) : (
                          model.model_name
                        )}
                      </td>
                      <td 
                        className="py-3 px-2 text-white cursor-pointer hover:bg-gray-600 rounded"
                        onClick={() => startEditing(model.id, 'key_model', model.key_model)}
                      >
                        {editingCell?.modelId === model.id && editingCell?.field === 'key_model' ? (
                          <input
                            type="text"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={saveEdit}
                            onKeyDown={handleKeyPress}
                            className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm"
                            autoFocus
                          />
                        ) : (
                          <span className="text-purple-400 font-medium">{model.key_model || 'N/A'}</span>
                        )}
                      </td>
                      <td 
                        className="py-3 px-2 text-white cursor-pointer hover:bg-gray-600 rounded"
                        onClick={() => startEditing(model.id, 'input_cost_per_million', model.input_cost_per_million)}
                      >
                        {editingCell?.modelId === model.id && editingCell?.field === 'input_cost_per_million' ? (
                          <input
                            type="number"
                            step="0.000001"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={saveEdit}
                            onKeyDown={handleKeyPress}
                            className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm"
                            autoFocus
                          />
                        ) : (
                          `$${model.input_cost_per_million}`
                        )}
                      </td>
                      <td 
                        className="py-3 px-2 text-white cursor-pointer hover:bg-gray-600 rounded"
                        onClick={() => startEditing(model.id, 'output_cost_per_million', model.output_cost_per_million)}
                      >
                        {editingCell?.modelId === model.id && editingCell?.field === 'output_cost_per_million' ? (
                          <input
                            type="number"
                            step="0.000001"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={saveEdit}
                            onKeyDown={handleKeyPress}
                            className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm"
                            autoFocus
                          />
                        ) : (
                          `$${model.output_cost_per_million}`
                        )}
                      </td>
                      <td 
                        className="py-3 px-2 text-white cursor-pointer hover:bg-gray-600 rounded"
                        onClick={() => startEditing(model.id, 'context_window_tokens', model.context_window_tokens)}
                      >
                        {editingCell?.modelId === model.id && editingCell?.field === 'context_window_tokens' ? (
                          <input
                            type="number"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={saveEdit}
                            onKeyDown={handleKeyPress}
                            className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm"
                            autoFocus
                          />
                        ) : (
                          model.context_window_tokens?.toLocaleString()
                        )}
                      </td>
                      <td 
                        className="py-3 px-2 text-white cursor-pointer hover:bg-gray-600 rounded"
                        onClick={() => startEditing(model.id, 'specialties', Array.isArray(model.specialties) ? model.specialties.join(', ') : model.specialties)}
                      >
                        {editingCell?.modelId === model.id && editingCell?.field === 'specialties' ? (
                          <input
                            type="text"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={saveEdit}
                            onKeyDown={handleKeyPress}
                            className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm"
                            placeholder="comma-separated"
                            autoFocus
                          />
                        ) : (
                          Array.isArray(model.specialties) ? model.specialties.join(', ') : model.specialties
                        )}
                      </td>
                      <td 
                        className="py-3 px-2 text-white cursor-pointer hover:bg-gray-600 rounded max-w-xs"
                        onClick={() => startEditing(model.id, 'description', model.description)}
                      >
                        {editingCell?.modelId === model.id && editingCell?.field === 'description' ? (
                          <textarea
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={saveEdit}
                            onKeyDown={handleKeyPress}
                            className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm"
                            rows="2"
                            autoFocus
                          />
                        ) : (
                          <span className="truncate block">{model.description}</span>
                        )}
                      </td>
                      <td 
                        className="py-3 px-2 cursor-pointer hover:bg-gray-600 rounded"
                        onClick={() => startEditing(model.id, 'is_active', model.is_active ? 'active' : 'inactive')}
                      >
                        {editingCell?.modelId === model.id && editingCell?.field === 'is_active' ? (
                          <select
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={saveEdit}
                            className="w-full bg-gray-600 border border-gray-500 rounded px-2 py-1 text-white text-sm"
                            autoFocus
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        ) : (
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            model.is_active 
                              ? 'bg-green-900 text-green-300' 
                              : 'bg-red-900 text-red-300'
                          }`}>
                            {model.is_active ? 'Active' : 'Inactive'}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Active Models Tab */}
      {activeTab === 'active' && (
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                Active Models
              </h3>
              <p className="text-gray-400">
                {Object.values(activeModels).flat().length} active models across {Object.keys(activeModels).length} providers
              </p>
            </div>
            <button
              onClick={() => loadActiveModels()}
              className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
            >
              Refresh
            </button>
          </div>
          
          {Object.keys(activeModels).length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No active models found. Test some models to activate them.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-600">
                    <th className="text-left py-3 px-2 text-white font-semibold">Provider</th>
                    <th className="text-left py-3 px-2 text-white font-semibold">Model Name</th>
                    <th className="text-left py-3 px-2 text-white font-semibold">Context Window</th>
                    <th className="text-left py-3 px-2 text-white font-semibold">Input Cost</th>
                    <th className="text-left py-3 px-2 text-white font-semibold">Output Cost</th>
                    <th className="text-left py-3 px-2 text-white font-semibold">Last Updated</th>
                    <th className="text-left py-3 px-2 text-white font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(activeModels).map(([providerName, models]) =>
                    models.map((model) => (
                      <tr key={model.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                        <td className="py-3 px-2 text-white font-medium">{providerName}</td>
                        <td className="py-3 px-2 text-white">{model.model_name}</td>
                        <td className="py-3 px-2 text-gray-300">{model.context_window_tokens?.toLocaleString() || 'N/A'}</td>
                        <td className="py-3 px-2 text-gray-300">${model.input_cost_per_million || 'N/A'}</td>
                        <td className="py-3 px-2 text-gray-300">${model.output_cost_per_million || 'N/A'}</td>
                        <td className="py-3 px-2 text-gray-400 text-xs">
                          {new Date(model.last_updated).toLocaleString()}
                        </td>
                        <td className="py-3 px-2">
                          <span className="px-2 py-1 rounded-full text-xs bg-green-900 text-green-300">
                            Active
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Pricing Scraper Tab */}
      {activeTab === 'scraper' && (
        <PricingScraper />
      )}

      {/* Chat Modal */}
      {showChatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-4xl h-3/4 flex flex-col ml-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">AI Model Testing & Chat</h3>
              </div>
              <button
                onClick={() => setShowChatModal(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            {/* Model Selection */}
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <select
                    value={selectedChatModel}
                    onChange={(e) => setSelectedChatModel(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                  >
                    <option value="">Select AI Model to Chat With</option>
                    {models.filter(m => m.is_active).map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.provider}:{model.model_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-sm text-gray-400">
                  {models.filter(m => m.is_active).length} active models
                </div>
              </div>
            </div>
            
            {/* Test Responses */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No test responses yet. Click "Test All Models" to start testing.</p>
                </div>
              ) : (
                chatMessages.map((message, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${
                    message.success 
                      ? 'bg-green-900/20 border-green-700' 
                      : 'bg-red-900/20 border-red-700'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          message.success ? 'bg-green-500' : 'bg-red-500'
                        }`} />
                        <span className="font-medium text-white">{message.model}</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm text-gray-400">Prompt:</span>
                        <p className="text-white text-sm bg-gray-700 p-2 rounded mt-1">
                          {message.prompt}
                        </p>
                      </div>
                      
                      <div>
                        <span className="text-sm text-gray-400">Response:</span>
                        <p className={`text-sm p-2 rounded mt-1 ${
                          message.success 
                            ? 'text-green-100 bg-green-800/30' 
                            : 'text-red-100 bg-red-800/30'
                        }`}>
                          {message.response}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
              
              {/* Chat History */}
              {chatHistory.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-600">
                  <h4 className="text-sm font-medium text-gray-400 mb-3">Chat History</h4>
                  {chatHistory.map((message, index) => (
                    <div key={`chat-${index}`} className={`p-3 rounded-lg mb-2 ${
                      message.role === 'user' 
                        ? 'bg-blue-900/20 border border-blue-700 ml-8' 
                        : 'bg-gray-700/50 border border-gray-600 mr-8'
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${
                            message.role === 'user' ? 'bg-blue-500' : 'bg-green-500'
                          }`} />
                          <span className="font-medium text-white text-sm">
                            {message.role === 'user' ? 'You' : message.model}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      
                      <p className="text-white text-sm">
                        {message.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Chat Input - Always show */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type your message here..."
                    disabled={!selectedChatModel}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 disabled:opacity-50"
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!selectedChatModel || !chatInput.trim()}
                  className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white rounded-lg transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Console Modal */}
      {showConsoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-4xl h-3/4 flex flex-col mr-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-green-400" />
                <h3 className="text-lg font-semibold text-white">Console Logs</h3>
              </div>
              <button
                onClick={() => setShowConsoleModal(false)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
              {consoleLogs.length === 0 ? (
                <div className="text-center py-8">
                  <Terminal className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400">No console logs yet. Start testing models to see debug information.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {consoleLogs.map((log, index) => (
                    <div key={index} className={`flex items-start gap-3 ${
                      log.type === 'error' ? 'text-red-400' :
                      log.type === 'success' ? 'text-green-400' :
                      'text-gray-300'
                    }`}>
                      <span className="text-gray-500 text-xs mt-1 min-w-[80px]">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="flex-1">{log.message}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default AIManagement
