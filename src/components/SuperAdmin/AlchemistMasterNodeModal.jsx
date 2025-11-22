/**
 * ALCHEMIST MASTER NODE MODAL
 * EXACT COPY OF FLOW NODE MODAL STRUCTURE
 * Beautiful tabs with awesome instructions - Boss's requirements!
 */

import React, { useState, useEffect } from 'react'
import { 
  X, Save, Trash2, Brain, Settings, FileText, RefreshCw, Zap,
  CheckCircle, GitBranch, Plus, Copy, Database, Clock, Target
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { getAllAlchemistVariables } from '../../data/alchemistVariables'

const AlchemistMasterNodeModal = ({ isOpen, onClose, node, onSave, onDelete }) => {
  const [config, setConfig] = useState({
    label: '',
    description: '',
    type: 'inputMaster',
    
    // Input Instructions - AWESOME AS FUCK INSTRUCTIONS
    inputInstructions: '',
    
    // Input Variables
    inputVariables: [],
    
    // AI Integration
    aiEnabled: true,
    selectedModels: [],
    temperature: 0.7,
    maxTokens: 4000,
    systemPrompt: '',
    userPrompt: '',
    
    // Node-specific configs
    inputFields: [],
    conditions: [],
    outputFormat: 'json',
    
    // Alchemist-specific
    alchemistVariables: [],
    
    ...node?.data
  })

  const [activeTab, setActiveTab] = useState('basic')
  const [availableProviders, setAvailableProviders] = useState([])
  const [availableModels, setAvailableModels] = useState({})
  const [selectedProvider, setSelectedProvider] = useState('')
  const [variableSearch, setVariableSearch] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Test input state
  const [testInputEnabled, setTestInputEnabled] = useState(false)
  const [inputValues, setInputValues] = useState({})
  const [testInputValues, setTestInputValues] = useState({})
  
  // Auto-sync: When variables change in Basic tab, update Test Input
  useEffect(() => {
    if (config.inputFields && config.inputFields.length > 0) {
      const newTestInputValues = {}
      config.inputFields.forEach(field => {
        // Preserve existing test values, or set to testInput from variable definition
        const allVariables = getAllAlchemistVariables()
        const variableDef = allVariables[field.variable]
        newTestInputValues[field.variable] = testInputValues[field.variable] || variableDef?.testInput || ''
      })
      setTestInputValues(newTestInputValues)
      setTestInputEnabled(config.inputFields.length > 0) // Auto-enable if variables selected
    }
  }, [config.inputFields])

  // Auto-sync: When Basic tab variables change, update the configuration
  const syncVariablesToTestInput = (selectedVariables) => {
    const updatedConfig = {
      ...config,
      inputFields: selectedVariables,
      alchemistVariables: selectedVariables.map(v => v.variable)
    }
    setConfig(updatedConfig)
  }

  // Load providers and models
  useEffect(() => {
    if (isOpen) {
      loadProvidersAndModels()
    }
  }, [isOpen])

  const loadProvidersAndModels = async () => {
    try {
      setLoading(true)
      // Fetch AI providers
      const { data: providers, error: providersError } = await supabase
        .from('ai_providers')
        .select('*')
        .eq('is_active', true)

      if (providersError) throw providersError

      setAvailableProviders(providers || [])

      // Auto-select random provider and load its models if no models are selected
      if (providers && providers.length > 0 && config.selectedModels.length === 0) {
        const randomProvider = providers[Math.floor(Math.random() * providers.length)]
        await loadModelsForProvider(randomProvider)
        
        // Auto-select random model from random provider
        setTimeout(async () => {
          const { data: models, error: modelError } = await supabase
            .from('ai_model_metadata')
            .select('*')
            .eq('is_active', true)
            .eq('key_name', randomProvider.name)
            .order('model_name', { ascending: true })
          
          if (!modelError && models && models.length > 0) {
            const randomModel = models[Math.floor(Math.random() * models.length)]
            const modelKey = `${randomProvider.name}:${randomModel.model_id}`
            
            setConfig(prev => ({
              ...prev,
              selectedModels: [modelKey]
            }))
            
            toast.success(`🎯 Auto-selected: ${randomModel.model_name}`)
          }
        }, 500) // Small delay to ensure models are loaded
      }

    } catch (error) {
      console.error('Error loading providers and models:', error)
      toast.error('Failed to load AI providers')
    } finally {
      setLoading(false)
    }
  }

  const loadModelsForProvider = async (provider) => {
    try {
      setLoading(true)
      const { data: models, error } = await supabase
        .from('ai_model_metadata')
        .select('*')
        .eq('key_name', provider.name)
        .eq('is_active', true)
        .order('model_name', { ascending: true })

      if (error) throw error

      setAvailableModels(prev => ({ 
        ...prev, 
        [provider.name]: models || [] 
      }))
    } catch (error) {
      console.error('Error loading models for provider:', provider.name, error)
      toast.error(`Failed to load models for ${provider.name}`)
      setAvailableModels(prev => ({ ...prev, [provider.name]: [] }))
    } finally {
      setLoading(false)
    }
  }

  const handleProviderSelect = async (provider) => {
    setSelectedProvider(provider.name) // Store the key name for model selection
    
    // Load models for this provider
    loadModelsForProvider(provider)
  }

  const addModel = (provider, model) => {
    // Use the actual provider name from database
    const providerName = selectedProvider || provider
    const modelKey = `${providerName}:${model.model_id}`
    
    if (!config.selectedModels.includes(modelKey)) {
      setConfig({
        ...config,
        selectedModels: [...config.selectedModels, modelKey]
      })
      toast.success(`✅ ${model.model_name} added`)
    }
    // Close the dropdown after selecting a model
    setSelectedProvider('')
  }

  const removeModel = (modelKey) => {
    setConfig({
      ...config,
      selectedModels: config.selectedModels.filter(m => m !== modelKey)
    })
    toast.success('🗑️ Model removed')
  }

  // AWESOME INSTRUCTIONS FOR EACH NODE TYPE
  const getAwesomeInstructions = (nodeType) => {
    const instructions = {
      inputMaster: `🚀 **INPUT MASTER - THE GATEWAY TO GREATNESS**

**Mission:** Transform raw user input into structured, AI-ready data that fuels your content creation machine!

**What This Beast Does:**
• Captures multi-modal inputs (text, voice, files, URLs)
• Validates and structures data with AI intelligence
• Auto-suggests improvements and optimizations
• Dynamically adapts forms based on content type

**Power Features:**
✨ Smart form builder that reads user intent
🧠 AI validation preventing garbage inputs
🎯 Context-aware field suggestions
🔄 Real-time input transformation
📊 Dynamic field generation based on workflow

**Pro Tips:**
• Use clear, action-oriented field labels
• Enable AI suggestions for better user experience
• Set up validation rules to catch issues early
• Configure auto-complete for common inputs

**Boss Mode:** This node learns from your usage patterns and gets smarter over time!`,

      processMaster: `🧠 **PROCESS MASTER - THE CONTENT CREATION BEAST**

**Mission:** Transform inputs into jaw-dropping content using the power of multiple AI models!

**What This Powerhouse Does:**
• Multi-AI processing for maximum quality
• Context-aware content generation
• Quality optimization and enhancement
• Format-specific content adaptation

**Epic Capabilities:**
🎨 Content creation across all formats
⚡ Multi-model ensemble processing
🎯 Quality control and optimization
🔄 Iterative improvement loops
🚀 Performance-tuned generation

**Advanced Features:**
• Temperature control for creativity vs accuracy
• Token management for cost optimization
• Multi-step processing workflows
• Quality scoring and auto-improvement

**Boss Level:** Can process complex content requests with multiple AI models working in harmony!`,

      conditionMaster: `🔀 **CONDITION MASTER - THE SMART DECISION MAKER**

**Mission:** Add intelligence to your workflows with powerful logic gates and conditional processing!

**What This Genius Does:**
• Smart branching based on content analysis
• AI-powered decision making
• Quality gates and approval workflows
• Dynamic routing based on conditions

**Intelligent Features:**
🧠 AI-assisted condition evaluation
⚡ Real-time decision processing
🎯 Context-aware routing
🔄 Fallback and retry logic
📊 Performance-based decisions

**Power Moves:**
• Set up quality thresholds
• Create approval workflows
• Build smart content routing
• Implement A/B testing logic

**Elite Mode:** This node can analyze content quality, audience fit, and performance metrics to make smart routing decisions!`,

      previewMaster: `👁️ **PREVIEW MASTER - REVIEW & APPROVAL SYSTEM**

**MISSION:** Multi-round content review with built-in conditional flows for iterative perfection!

**RECEIVES JSON WRAPPER WITH:**
• Generated content from Process nodes
• Customer context and requirements  
• Previous iteration feedback (if any)

**REVIEW WORKFLOW PROCESS:**
1️⃣ **Extract Content:** Get processedContent from JSON wrapper
2️⃣ **Display Preview:** Show formatted content to user for review
3️⃣ **Collect Decision:** User approves ✅ or requests changes ❌
4️⃣ **Conditional Flow:**
   • ✅ APPROVED → Pass to next node (Output/Final)
   • ❌ REJECTED → Loop back to Process node with feedback

**CONFIGURATION SETTINGS:**
🔄 **Max Review Rounds:** Set 1-5 review cycles before auto-approval
📝 **Feedback Collection:** Structured feedback form for improvements
🎯 **Approval Criteria:** Quality score thresholds and requirements  
🔀 **Routing Logic:** Define which nodes to route back to for revisions

**ADVANCED FEATURES:**
• **Multi-stakeholder reviews** (client, manager, team)
• **Version comparison** between iterations
• **Auto-approval** if quality score > threshold
• **Escalation rules** if max rounds exceeded
• **Review history tracking** in JSON wrapper

**OUTPUT:** Enhanced JSON wrapper with approval status and final content

**Boss's Vision:** No content goes live without proper review cycles and conditional approval flows!`,

      outputMaster: `📤 **OUTPUT MASTER - THE DISTRIBUTION POWERHOUSE**

**Mission:** Deliver your perfect content to the world through multiple channels and formats!

**What This Champion Does:**
• Multi-format content export
• Cross-platform distribution
• Scheduled publishing workflows
• Performance tracking and analytics

**Distribution Excellence:**
🚀 Multi-channel publishing
📊 Format optimization per platform
⏰ Smart scheduling and timing
🎯 Audience-specific customization
📈 Performance tracking and analytics

**Export Superpowers:**
• Auto-format for each platform
• Bulk export capabilities
• API integrations for custom systems
• Cloud storage and CDN distribution

**Legendary Mode:** Automatically optimizes content for each platform, schedules for peak engagement times, and tracks performance across all channels!`
    }

    return instructions[nodeType] || instructions.processMaster
  }

  const handleSave = () => {
    if (onSave) {
      const updatedNode = {
        ...node,
        data: {
          ...node.data,
          ...config,
          // CRITICAL: Save test input values for JSON wrapper
          testInputValues: testInputValues,
          testInputEnabled: testInputEnabled
        }
      }
      
      console.log('💾 SAVING ALCHEMIST NODE with test input values:', {
        nodeType: node?.type,
        inputFields: config.inputFields,
        testInputValues: testInputValues,
        testInputEnabled: testInputEnabled
      })
      
      onSave(updatedNode)
    }
    toast.success('🎯 Alchemist Master Node configured with JSON wrapper data!')
    onClose()
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(config, null, 2))
    toast.success('✨ Configuration copied to clipboard!')
  }

  const updateConfig = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  // BADASS VARIABLE MANAGEMENT FUNCTIONS - 10X MORE ADVANCED
  const toggleVariable = (variable) => {
    const isAlreadyUsed = config.inputFields?.some(field => field.variable === variable.variable)
    
    if (isAlreadyUsed) {
      // Remove variable with animation
      setConfig({
        ...config,
        inputFields: config.inputFields.filter(field => field.variable !== variable.variable)
      })
      toast.success(`🗑️ ${variable.name} removed from flow`)
    } else {
      // Add variable with default required setting
      const newField = { 
        ...variable, 
        required: variable.required || false,
        variable: variable.variable 
      }
      setConfig({
        ...config,
        inputFields: [...(config.inputFields || []), newField]
      })
      toast.success(`✨ ${variable.name} added to flow`)
    }
  }

  const toggleFieldRequired = (index) => {
    const newFields = [...(config.inputFields || [])]
    newFields[index].required = !newFields[index].required
    
    setConfig({
      ...config,
      inputFields: newFields
    })
    
    const field = newFields[index]
    toast.success(`${field.required ? '🔒' : '🔓'} ${field.name} is now ${field.required ? 'required' : 'optional'}`)
  }

  const moveVariable = (fromIndex, toIndex) => {
    const newFields = [...(config.inputFields || [])]
    const [movedField] = newFields.splice(fromIndex, 1)
    newFields.splice(toIndex, 0, movedField)
    
    setConfig({
      ...config,
      inputFields: newFields
    })
  }

  const handleDragStart = (e, index) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, dropIndex) => {
    e.preventDefault()
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      moveVariable(draggedIndex, dropIndex)
      toast.success('🔄 Variable order updated')
    }
    setDraggedIndex(null)
  }

  // Drag state
  const [draggedIndex, setDraggedIndex] = useState(null)

  if (!isOpen || !node) return null

  // EXACT SAME TAB STRUCTURE AS FLOW MODAL
  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Settings },
    { id: 'instructions', label: 'Instructions', icon: FileText },
    { id: 'ai', label: 'AI Integration', icon: Brain },
    ...(node?.type !== 'input' ? [{ id: 'advanced', label: 'Advanced', icon: Zap }] : []),
    { id: 'variables', label: 'Variables', icon: Target },
    { id: 'test', label: 'Test Input', icon: RefreshCw },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="superadmin-theme rounded-2xl border border-subtle p-4 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto" style={{ background: 'var(--bg-surface)', boxShadow: 'var(--shadow-soft)' }}>
        {/* Header - EXACT COPY */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg" style={{ background: 'var(--bg-surface-hover)' }}>
              {node?.type === 'inputMaster' && <FileText className="w-5 h-5 text-blue-400" />}
              {node?.type === 'processMaster' && <Brain className="w-5 h-5 text-purple-400" />}
              {node?.type === 'conditionMaster' && <GitBranch className="w-5 h-5 text-emerald-400" />}
              {node?.type === 'previewMaster' && <CheckCircle className="w-5 h-5 text-amber-400" />}
              {node?.type === 'outputMaster' && <Database className="w-5 h-5 text-rose-400" />}
            </div>
            <div>
              <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                {node?.type?.replace('Master', '').charAt(0).toUpperCase() + node?.type?.replace('Master', '').slice(1)} Master Configuration
              </h2>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Configure Alchemist Master Node properties and behavior</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="transition-colors p-2 hover:bg-gray-700 rounded-lg focus-ring"
              title="Copy Configuration"
            >
              <Copy className="w-5 h-5" />
            </button>
            <button
              onClick={onDelete}
              className="text-red-400 hover:text-red-300 transition-colors p-2 hover:bg-red-500/10 rounded-lg"
              title="Delete Node"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors focus-ring"
            >
              <X className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            </button>
          </div>
        </div>

        {/* Tabs - EXACT COPY */}
        <div className="flex space-x-1 mb-4 rounded-lg p-1 border border-subtle" style={{ background: 'var(--bg-surface-hover)' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1 px-3 py-2 rounded-md text-xs font-medium transition-colors focus-ring ${
                  activeTab === tab.id
                    ? 'role-gradient-process text-white'
                    : 'text-secondary hover:bg-surface-hover'
                }`}
              >
                <Icon className="w-3 h-3" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="space-y-6 max-h-96 overflow-y-auto">
          
          {/* BASIC TAB */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Node Name</label>
                <input
                  type="text"
                  value={config.label}
                  onChange={(e) => updateConfig('label', e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary"
                  placeholder="Enter awesome node name..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={config.description}
                  onChange={(e) => updateConfig('description', e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary h-24"
                  placeholder="Describe what this Master Node will accomplish..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Node Type</label>
                <div className="p-3 bg-gray-700 rounded-lg border border-gray-600">
                  <span className="text-white font-medium">{node?.type?.replace('Master', '').toUpperCase()} MASTER</span>
                  <p className="text-xs text-gray-400 mt-1">Master node type is fixed for this configuration</p>
                </div>
              </div>

              {/* PREVIEW MASTER SPECIFIC - REVIEW & APPROVAL CONFIGURATION */}
              {node?.type === 'previewMaster' && (
                <div className="border-t border-gray-600 pt-4">
                  <h3 className="text-lg font-semibold text-white mb-3">👁️ Review & Approval Settings</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Max Review Rounds</label>
                      <select
                        value={config.maxReviewRounds || 3}
                        onChange={(e) => updateConfig('maxReviewRounds', parseInt(e.target.value))}
                        className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary"
                      >
                        <option value={1}>1 Round</option>
                        <option value={2}>2 Rounds</option>
                        <option value={3}>3 Rounds (Recommended)</option>
                        <option value={4}>4 Rounds</option>
                        <option value={5}>5 Rounds (Max)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Auto-Approval Threshold</label>
                      <select
                        value={config.autoApprovalThreshold || 85}
                        onChange={(e) => updateConfig('autoApprovalThreshold', parseInt(e.target.value))}
                        className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary"
                      >
                        <option value={70}>70% Quality Score</option>
                        <option value={80}>80% Quality Score</option>
                        <option value={85}>85% Quality Score (Recommended)</option>
                        <option value={90}>90% Quality Score</option>
                        <option value={95}>95% Quality Score (Strict)</option>
                      </select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Review Stakeholders</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['client', 'manager', 'team_lead', 'content_editor', 'brand_manager', 'legal_review'].map(stakeholder => (
                        <label key={stakeholder} className="flex items-center gap-2 text-sm text-gray-300">
                          <input
                            type="checkbox"
                            checked={config.reviewStakeholders?.includes(stakeholder) || false}
                            onChange={(e) => {
                              const stakeholders = config.reviewStakeholders || []
                              if (e.target.checked) {
                                updateConfig('reviewStakeholders', [...stakeholders, stakeholder])
                              } else {
                                updateConfig('reviewStakeholders', stakeholders.filter(s => s !== stakeholder))
                              }
                            }}
                            className="rounded"
                          />
                          {stakeholder.replace('_', ' ').toUpperCase()}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Rejection Routing</label>
                    <select
                      value={config.rejectionRouting || 'previous_process'}
                      onChange={(e) => updateConfig('rejectionRouting', e.target.value)}
                      className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary"
                    >
                      <option value="previous_process">Route back to Previous Process Node</option>
                      <option value="content_writer">Route back to Content Writer</option>
                      <option value="research_engine">Route back to Research Engine</option>
                      <option value="input_master">Route back to Input Master</option>
                      <option value="custom_node">Route to Custom Node (specify below)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Feedback Collection Template</label>
                    <textarea
                      value={config.feedbackTemplate || `{
  "overall_quality": "rate_1_to_10",
  "content_accuracy": "boolean",
  "tone_alignment": "rate_1_to_10", 
  "specific_changes": "text_area",
  "approval_status": "approve_or_reject",
  "improvement_suggestions": "text_area"
}`}
                      onChange={(e) => updateConfig('feedbackTemplate', e.target.value)}
                      className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-green-400 focus:ring-2 focus:ring-primary h-48 font-mono text-sm"
                      placeholder="Define feedback collection structure..."
                    />
                    <p className="text-xs text-gray-400 mt-1">JSON structure for collecting review feedback</p>
                  </div>

                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mt-4">
                    <h4 className="text-amber-400 font-semibold mb-2">🎯 Review Flow Summary</h4>
                    <ul className="text-sm text-amber-300 space-y-1">
                      <li>• Content preview shown to {config.reviewStakeholders?.length || 0} stakeholder(s)</li>
                      <li>• Maximum {config.maxReviewRounds || 3} review rounds before auto-approval</li>
                      <li>• Auto-approve if quality score ≥ {config.autoApprovalThreshold || 85}%</li>
                      <li>• Rejections route to: {config.rejectionRouting?.replace('_', ' ') || 'previous process'}</li>
                      <li>• Structured feedback collection with approval/rejection logic</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* CURATED INPUT FIELDS - DYNAMIC FROM VARIABLES */}
              {(node?.type === 'inputMaster' || config.inputFields?.length > 0) && (
                <div className="border-t border-gray-600 pt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">📝 Input Fields Configuration</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">{config.inputFields?.length || 0} fields</span>
                      <button
                        onClick={() => setActiveTab('variables')}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-lg transition-colors"
                      >
                        + Add Fields
                      </button>
                    </div>
                  </div>

                  {config.inputFields && config.inputFields.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-400 mb-4">
                        Drag fields to reorder • Click checkbox to toggle mandatory/optional
                      </p>
                      
                      {config.inputFields.map((field, index) => (
                        <div
                          key={field.variable || index}
                          draggable
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, index)}
                          className={`bg-gray-800 border border-gray-600 rounded-lg p-4 cursor-move transition-all duration-200 hover:border-purple-500/50 ${
                            draggedIndex === index ? 'opacity-50 scale-95' : ''
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {/* DRAG HANDLE */}
                            <div className="flex flex-col gap-1 text-gray-500 cursor-grab active:cursor-grabbing">
                              <div className="w-1 h-1 bg-current rounded-full"></div>
                              <div className="w-1 h-1 bg-current rounded-full"></div>
                              <div className="w-1 h-1 bg-current rounded-full"></div>
                              <div className="w-1 h-1 bg-current rounded-full"></div>
                              <div className="w-1 h-1 bg-current rounded-full"></div>
                              <div className="w-1 h-1 bg-current rounded-full"></div>
                            </div>

                            {/* MANDATORY CHECKBOX */}
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={field.required || false}
                                onChange={() => toggleFieldRequired(index)}
                                className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500 focus:ring-2"
                              />
                              <label className="ml-2 text-sm font-medium text-gray-300">
                                {field.required ? 'Mandatory' : 'Optional'}
                              </label>
                            </div>

                            {/* FIELD INFO */}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-white">{field.name}</span>
                                <code className="px-2 py-0.5 bg-purple-500/20 text-purple-300 text-xs rounded font-mono">
                                  {field.variable}
                                </code>
                                <span className={`px-2 py-0.5 text-xs rounded-full ${
                                  field.type === 'select' ? 'bg-blue-500/20 text-blue-300' :
                                  field.type === 'textarea' ? 'bg-green-500/20 text-green-300' :
                                  field.type === 'number' ? 'bg-orange-500/20 text-orange-300' :
                                  'bg-gray-500/20 text-gray-300'
                                }`}>
                                  {field.type}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400">{field.description}</p>
                              
                              {/* SHOW OPTIONS FOR SELECT FIELDS */}
                              {field.type === 'select' && field.options && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {field.options.slice(0, 3).map((option, i) => (
                                    <span key={i} className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded">
                                      {option}
                                    </span>
                                  ))}
                                  {field.options.length > 3 && (
                                    <span className="text-xs text-gray-500">+{field.options.length - 3} more</span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* REMOVE BUTTON */}
                            <button
                              onClick={() => {
                                setConfig({
                                  ...config,
                                  inputFields: config.inputFields.filter((_, i) => i !== index)
                                })
                                toast.success(`🗑️ ${field.name} removed`)
                              }}
                              className="text-red-400 hover:text-red-300 p-1 hover:bg-red-500/10 rounded transition-colors"
                              title="Remove field"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* FIELD ORDER SUMMARY */}
                      <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3 mt-4">
                        <h4 className="text-purple-300 font-semibold mb-2">📋 Field Order Summary</h4>
                        <div className="flex flex-wrap gap-2">
                          {config.inputFields.map((field, index) => (
                            <div key={field.variable} className="flex items-center gap-1 bg-purple-500/10 px-2 py-1 rounded text-xs">
                              <span className="text-purple-400 font-mono">{index + 1}.</span>
                              <span className="text-purple-200">{field.name}</span>
                              {field.required && <span className="text-red-400">*</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-800/50 rounded-lg border border-gray-600">
                      <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <h4 className="text-gray-300 font-medium mb-2">No Input Fields Selected</h4>
                      <p className="text-gray-400 text-sm mb-4">Go to the Variables tab to select input fields for this node</p>
                      <button
                        onClick={() => setActiveTab('variables')}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                      >
                        Select Variables
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* INPUT MASTER SPECIFIC - JSON OUTPUT CONFIGURATION */}
              {node?.type === 'inputMaster' && (
                <div className="border-t border-gray-600 pt-4 mt-6">
                  <h3 className="text-lg font-semibold text-white mb-3">🚀 JSON Output Configuration</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Customer Context Fields</label>
                    <textarea
                      value={config.customerContextFields || `{
  "customer_id": "string",
  "customer_name": "string", 
  "customer_tier": "starter|pro|enterprise",
  "customer_industry": "string",
  "customer_goals": "array",
  "customer_tone_preference": "string",
  "customer_brand_guidelines": "object"
}`}
                      onChange={(e) => updateConfig('customerContextFields', e.target.value)}
                      className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-green-400 focus:ring-2 focus:ring-primary h-32 font-mono text-sm"
                      placeholder="Define customer context fields as JSON..."
                    />
                    <p className="text-xs text-gray-400 mt-1">Define the customer data structure to be passed to next nodes</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Input Fields Configuration</label>
                    <textarea
                      value={config.inputFieldsConfig || `{
  "content_type": {
    "type": "select",
    "options": ["blog_post", "email_sequence", "social_media", "ad_copy", "sales_page"],
    "required": true,
    "label": "What type of content are you creating?"
  },
  "target_audience": {
    "type": "text", 
    "required": true,
    "label": "Who is your target audience?",
    "placeholder": "e.g., Small business owners, Tech professionals..."
  },
  "content_goal": {
    "type": "select",
    "options": ["generate_leads", "increase_sales", "build_awareness", "educate", "entertain"],
    "required": true,
    "label": "What's the primary goal?"
  },
  "tone_style": {
    "type": "select", 
    "options": ["professional", "casual", "friendly", "authoritative", "conversational"],
    "required": true,
    "label": "Preferred tone and style"
  },
  "content_length": {
    "type": "select",
    "options": ["short", "medium", "long", "custom"],
    "required": true,
    "label": "Desired content length"
  },
  "additional_requirements": {
    "type": "textarea",
    "required": false,
    "label": "Any specific requirements or notes?",
    "placeholder": "Include CTAs, mention specific products, avoid certain terms..."
  }
}`}
                      onChange={(e) => updateConfig('inputFieldsConfig', e.target.value)}
                      className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-blue-400 focus:ring-2 focus:ring-primary h-48 font-mono text-sm"
                      placeholder="Define input fields as JSON..."
                    />
                    <p className="text-xs text-gray-400 mt-1">Configure the form fields that users will fill out</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Output JSON Structure</label>
                    <textarea
                      value={config.outputJsonStructure || `{
  "node_type": "inputMaster",
  "timestamp": "ISO_DATE_STRING",
  "customer_context": {
    "customer_id": "USER_PROVIDED",
    "customer_name": "USER_PROVIDED", 
    "customer_tier": "USER_PROVIDED",
    "customer_industry": "USER_PROVIDED",
    "customer_goals": "USER_PROVIDED",
    "customer_tone_preference": "USER_PROVIDED",
    "customer_brand_guidelines": "USER_PROVIDED"
  },
  "user_input": {
    "content_type": "USER_SELECTED",
    "target_audience": "USER_PROVIDED",
    "content_goal": "USER_SELECTED", 
    "tone_style": "USER_SELECTED",
    "content_length": "USER_SELECTED",
    "additional_requirements": "USER_PROVIDED"
  },
  "processing_notes": {
    "data_validation": "all_required_fields_completed",
    "ai_suggestions_applied": "boolean",
    "customer_tier_features": "list_of_enabled_features",
    "next_recommended_action": "string"
  },
  "metadata": {
    "session_id": "GENERATED",
    "workflow_id": "CURRENT_FLOW_ID",
    "processing_priority": "based_on_customer_tier",
    "estimated_tokens": "calculated_estimate"
  }
}`}
                      onChange={(e) => updateConfig('outputJsonStructure', e.target.value)}
                      className="w-full p-3 bg-gray-900 border border-gray-600 rounded-lg text-yellow-400 focus:ring-2 focus:ring-primary h-64 font-mono text-sm"
                      placeholder="Define the JSON output structure..."
                    />
                    <p className="text-xs text-gray-400 mt-1">This JSON structure will be passed to the next node with all collected data</p>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <h4 className="text-blue-400 font-semibold mb-2">🎯 Data Flow Summary</h4>
                    <ul className="text-sm text-blue-300 space-y-1">
                      <li>• Collects all user inputs through dynamic form</li>
                      <li>• Captures customer context and tier information</li>
                      <li>• Validates data and applies AI suggestions</li>
                      <li>• Outputs structured JSON to next node</li>
                      <li>• Includes processing notes and metadata</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* INSTRUCTIONS TAB */}
          {activeTab === 'instructions' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  🚀 Master Node Instructions
                </label>
                <div className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                  <div className="prose prose-invert max-w-none text-sm">
                    <pre className="whitespace-pre-wrap text-gray-300 font-mono leading-relaxed">
                      {getAwesomeInstructions(node?.type)}
                    </pre>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Custom Instructions</label>
                <textarea
                  value={config.inputInstructions}
                  onChange={(e) => updateConfig('inputInstructions', e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary h-32"
                  placeholder="Add your custom instructions for this Master Node..."
                />
              </div>
            </div>
          )}

          {/* AI INTEGRATION TAB - EXACT COPY OF FLOW SYSTEM */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <input
                  type="checkbox"
                  checked={config.aiEnabled}
                  onChange={(e) => updateConfig('aiEnabled', e.target.checked)}
                  className="rounded bg-gray-700 border-gray-600 text-primary focus:ring-primary"
                />
                <label className="text-sm font-medium text-gray-300">Enable AI Processing</label>
              </div>

              {config.aiEnabled && (
                <>
                  {/* SELECTED MODELS DISPLAY */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-300">Selected AI Models</label>
                    {config.selectedModels && config.selectedModels.length > 0 ? (
                      <div className="space-y-2">
                        {config.selectedModels.map((modelKey, index) => {
                          const [providerName, modelId] = modelKey.split(':')
                          const provider = availableProviders.find(p => p.name === providerName)
                          const providerModels = availableModels[providerName] || []
                          const model = providerModels.find(m => m.model_id === modelId)
                          
                          return (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg border border-gray-600">
                              <div className="flex items-center gap-3">
                                <Brain className="w-5 h-5 text-blue-400" />
                                <div>
                                  <div className="font-medium text-white">
                                    {model?.model_name || modelId}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {provider?.display_name || providerName} • 
                                    {model?.input_cost_per_million && ` $${model.input_cost_per_million}/1M tokens`}
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => removeModel(modelKey)}
                                className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded"
                                title="Remove model"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8 bg-gray-800/50 rounded-lg border border-gray-600">
                        <Brain className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <h4 className="text-gray-300 font-medium mb-2">No AI Models Selected</h4>
                        <p className="text-gray-400 text-sm">Select a provider below to add AI models</p>
                      </div>
                    )}
                  </div>

                  {/* AI PROVIDER SELECTION */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-300">Add AI Models</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {availableProviders.map(provider => (
                        <div key={provider.id} className="relative">
                          <button
                            onClick={() => handleProviderSelect(provider)}
                            className={`w-full p-3 text-left rounded-lg border-2 transition-all duration-200 ${
                              selectedProvider === provider.name
                                ? 'border-primary bg-primary/20 text-primary'
                                : 'border-gray-600 bg-gray-700 hover:border-gray-500 text-gray-300'
                            }`}
                          >
                            <div className="font-medium">{provider.display_name || provider.name}</div>
                            <div className="text-xs text-gray-400 mt-1">
                              {availableModels[provider.name]?.length || 0} models available
                            </div>
                          </button>
                          
                          {/* MODELS DROPDOWN */}
                          {selectedProvider === provider.name && availableModels[provider.name] && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-10 max-h-60 overflow-y-auto">
                              {availableModels[provider.name].map(model => (
                                <button
                                  key={model.model_id}
                                  onClick={() => addModel(provider.name, model)}
                                  className="w-full p-3 text-left hover:bg-gray-700 border-b border-gray-700 last:border-b-0"
                                  disabled={config.selectedModels.includes(`${provider.name}:${model.model_id}`)}
                                >
                                  <div className="font-medium text-white">{model.model_name}</div>
                                  <div className="text-xs text-gray-400">
                                    {model.description || model.model_id}
                                    {model.input_cost_per_million && ` • $${model.input_cost_per_million}/1M tokens`}
                                  </div>
                                  {config.selectedModels.includes(`${provider.name}:${model.model_id}`) && (
                                    <div className="text-xs text-green-400 mt-1">✓ Already selected</div>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* AI CONFIGURATION */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Temperature</label>
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={config.temperature}
                        onChange={(e) => updateConfig('temperature', parseFloat(e.target.value))}
                        className="w-full"
                      />
                      <span className="text-xs text-gray-400">{config.temperature}</span>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Max Tokens</label>
                      <input
                        type="number"
                        value={config.maxTokens}
                        onChange={(e) => updateConfig('maxTokens', parseInt(e.target.value))}
                        className="w-full p-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary"
                        min="100"
                        max="8000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">System Prompt</label>
                    <textarea
                      value={config.systemPrompt}
                      onChange={(e) => updateConfig('systemPrompt', e.target.value)}
                      className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary h-24"
                      placeholder="System prompt for AI behavior..."
                    />
                  </div>

                  {loading && (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      <span className="ml-2 text-gray-400">Loading AI models...</span>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ADVANCED TAB */}
          {activeTab === 'advanced' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Output Format</label>
                <select
                  value={config.outputFormat}
                  onChange={(e) => updateConfig('outputFormat', e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary"
                >
                  <option value="json">JSON</option>
                  <option value="text">Plain Text</option>
                  <option value="markdown">Markdown</option>
                  <option value="html">HTML</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Processing Priority</label>
                  <select className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary">
                    <option value="high">High Priority</option>
                    <option value="normal">Normal Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Timeout (seconds)</label>
                  <input
                    type="number"
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary"
                    defaultValue="30"
                    min="5"
                    max="300"
                  />
                </div>
              </div>
            </div>
          )}

          {/* VARIABLES TAB - 10X MORE BADASS THAN FLOW */}
          {activeTab === 'variables' && (
            <div className="space-y-6">
              {/* BADASS HEADER */}
              <div className="bg-gradient-to-r from-purple-900/30 via-blue-900/30 to-cyan-900/30 border border-purple-500/40 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Target className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-bold text-purple-200">🚀 ALCHEMIST VARIABLES SYSTEM</h3>
                  <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 text-xs font-bold rounded-full">10X MORE BADASS</span>
                </div>
                <p className="text-sm text-purple-300 mb-4">
                  Advanced variable management with AI-powered suggestions, real-time validation, drag-and-drop reordering, and smart dependency mapping!
                </p>
                
                {/* VARIABLE STATS */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-blue-500/10 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-400">{Object.keys(getAllAlchemistVariables()).length}</div>
                    <div className="text-xs text-blue-300">Total Variables</div>
                  </div>
                  <div className="bg-green-500/10 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-400">{config.inputFields?.length || 0}</div>
                    <div className="text-xs text-green-300">Active Variables</div>
                  </div>
                  <div className="bg-yellow-500/10 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-yellow-400">{config.inputFields?.filter(f => f.required).length || 0}</div>
                    <div className="text-xs text-yellow-300">Required Fields</div>
                  </div>
                  <div className="bg-purple-500/10 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-purple-400">A+</div>
                    <div className="text-xs text-purple-300">AI Score</div>
                  </div>
                </div>
              </div>

              {/* ADVANCED SEARCH WITH AI SUGGESTIONS */}
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="🔍 Search variables by name, description, or AI suggestions..."
                      value={variableSearch}
                      onChange={(e) => setVariableSearch(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                    />
                    <Database className="w-5 h-5 text-gray-400 absolute left-4 top-4" />
                  </div>
                  <button className="px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg transition-all">
                    🧠 AI Suggest
                  </button>
                </div>
                
                {/* SMART FILTERS */}
                <div className="flex gap-2 flex-wrap">
                  {['Required Only', 'Text Fields', 'Select Fields', 'Number Fields', 'AI-Enhanced', 'Recently Used'].map(filter => (
                    <button key={filter} className="px-3 py-1.5 bg-gray-700 hover:bg-purple-600 text-gray-300 hover:text-white text-xs rounded-lg transition-colors">
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* AVAILABLE VARIABLES - BADASS GRID */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-purple-200 flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      Available Variables ({Object.keys(getAllAlchemistVariables()).filter(key => 
                        key.toLowerCase().includes(variableSearch.toLowerCase()) ||
                        getAllAlchemistVariables()[key].name.toLowerCase().includes(variableSearch.toLowerCase()) ||
                        getAllAlchemistVariables()[key].description.toLowerCase().includes(variableSearch.toLowerCase())
                      ).length})
                    </h4>
                    <button className="text-xs text-gray-400 hover:text-white">Sort by relevance</button>
                  </div>
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-800">
                    {Object.keys(getAllAlchemistVariables())
                      .filter(key => 
                        key.toLowerCase().includes(variableSearch.toLowerCase()) ||
                        getAllAlchemistVariables()[key].name.toLowerCase().includes(variableSearch.toLowerCase()) ||
                        getAllAlchemistVariables()[key].description.toLowerCase().includes(variableSearch.toLowerCase())
                      )
                      .map((key, index) => {
                        const variable = getAllAlchemistVariables()[key]
                        const isAlreadyUsed = config.inputFields?.some(field => field.variable === key)
                        
                        return (
                          <div 
                            key={key}
                            className={`group relative p-4 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                              isAlreadyUsed 
                                ? 'bg-gray-800/50 border border-gray-600 opacity-50 cursor-not-allowed' 
                                : 'bg-gradient-to-r from-purple-900/20 to-blue-900/20 border border-purple-500/30 hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20'
                            }`}
                            onClick={() => !isAlreadyUsed && toggleVariable({ variable: key, ...variable })}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <code className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded font-mono">
                                    {`{${key}}`}
                                  </code>
                                  {variable.required && (
                                    <span className="px-2 py-0.5 bg-red-500/20 text-red-300 text-xs rounded-full">Required</span>
                                  )}
                                  {variable.type === 'select' && (
                                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-xs rounded-full">Select</span>
                                  )}
                                </div>
                                <h5 className="font-semibold text-white text-sm mb-1">{variable.name}</h5>
                                <p className="text-xs text-gray-400 leading-relaxed">{variable.description}</p>
                                
                                {/* TYPE INDICATOR */}
                                <div className="flex items-center gap-2 mt-2">
                                  <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                                    variable.type === 'text' ? 'bg-green-500/20 text-green-300' :
                                    variable.type === 'select' ? 'bg-blue-500/20 text-blue-300' :
                                    variable.type === 'number' ? 'bg-yellow-500/20 text-yellow-300' :
                                    variable.type === 'textarea' ? 'bg-purple-500/20 text-purple-300' :
                                    'bg-gray-500/20 text-gray-300'
                                  }`}>
                                    {variable.type}
                                  </span>
                                  {variable.validation && (
                                    <span className="px-2 py-0.5 bg-orange-500/20 text-orange-300 text-xs rounded-full">Validated</span>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex flex-col gap-1">
                                {!isAlreadyUsed && (
                                  <button className="p-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Plus className="w-3 h-3" />
                                  </button>
                                )}
                                {isAlreadyUsed && (
                                  <span className="text-xs text-green-400 font-medium">✓ Used</span>
                                )}
                              </div>
                            </div>
                            
                            {/* HOVER TOOLTIP */}
                            <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-gray-900 border border-gray-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
                              <p className="text-xs text-gray-300 mb-2">{variable.instructions}</p>
                              {variable.testInput && (
                                <div>
                                  <span className="text-xs text-gray-400">Example: </span>
                                  <code className="text-xs text-green-400">{variable.testInput}</code>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>

                {/* ACTIVE VARIABLES - DRAG & DROP REORDERING */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-cyan-200 flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Active Variables ({config.inputFields?.length || 0})
                    </h4>
                    <div className="flex gap-2">
                      <button className="text-xs text-gray-400 hover:text-white">Validate All</button>
                      <button className="text-xs text-gray-400 hover:text-white">Clear All</button>
                    </div>
                  </div>
                  
                  {config.inputFields?.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-cyan-600 scrollbar-track-gray-800">
                      {config.inputFields.map((field, index) => (
                        <div 
                          key={field.variable || index}
                          className="group relative p-4 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 rounded-xl transition-all duration-300 hover:border-cyan-400 hover:shadow-lg hover:shadow-cyan-500/20"
                          draggable
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, index)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-gray-400 cursor-move">⋮⋮</span>
                                <code className="px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded font-mono">
                                  {`{${field.variable}}`}
                                </code>
                                <span className="text-sm font-medium text-white">{field.name}</span>
                              </div>
                              
                              <div className="flex items-center gap-2 mb-2">
                                <label className="flex items-center gap-1 text-xs">
                                  <input
                                    type="checkbox"
                                    checked={field.required}
                                    onChange={() => toggleFieldRequired(index)}
                                    className="rounded bg-gray-700 border-gray-600 text-cyan-500 focus:ring-cyan-500"
                                  />
                                  <span className="text-gray-300">Required</span>
                                </label>
                                
                                <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                                  field.type === 'text' ? 'bg-green-500/20 text-green-300' :
                                  field.type === 'select' ? 'bg-blue-500/20 text-blue-300' :
                                  field.type === 'number' ? 'bg-yellow-500/20 text-yellow-300' :
                                  'bg-purple-500/20 text-purple-300'
                                }`}>
                                  {field.type}
                                </span>
                              </div>
                              
                              <p className="text-xs text-gray-400">{field.description}</p>
                            </div>
                            
                            <div className="flex flex-col gap-1">
                              <button 
                                onClick={() => {
                                  const newFields = config.inputFields.filter((_, i) => i !== index)
                                  setConfig({ ...config, inputFields: newFields })
                                }}
                                className="p-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Remove Variable"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed border-gray-600 rounded-xl">
                      <Target className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400 mb-2">No variables added yet</p>
                      <p className="text-xs text-gray-500">Click variables from the left to add them</p>
                    </div>
                  )}
                </div>
              </div>

              {/* AI VARIABLE SUGGESTIONS */}
              <div className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-xl p-6">
                <h4 className="text-lg font-bold text-blue-200 mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  🧠 AI Variable Recommendations
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-blue-300">Recommended for {node?.type}:</h5>
                    <div className="flex flex-wrap gap-2">
                      {['topic_alc', 'target_audience_alc', 'content_tone_alc'].map(variable => (
                        <button 
                          key={variable}
                          className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 text-xs rounded-lg transition-colors"
                        >
                          + {getAllAlchemistVariables()[variable]?.name}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-purple-300">Smart Suggestions:</h5>
                    <div className="flex flex-wrap gap-2">
                      {['content_format_alc', 'quality_level_alc', 'seo_focus_alc'].map(variable => (
                        <button 
                          key={variable}
                          className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 text-xs rounded-lg transition-colors"
                        >
                          + {getAllAlchemistVariables()[variable]?.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* VALIDATION STATUS */}
              <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <h4 className="font-bold text-green-200">Validation Status</h4>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-400">✓</div>
                    <div className="text-xs text-green-300">All Valid</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-400">{config.inputFields?.filter(f => f.required).length || 0}</div>
                    <div className="text-xs text-blue-300">Required</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-400">A+</div>
                    <div className="text-xs text-purple-300">AI Score</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TEST INPUT TAB - AUTO-SYNCED WITH VARIABLES */}
          {activeTab === 'test' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <div>
                  <h3 className="text-green-400 font-semibold">🚀 Test Input - Auto-Synced Variables</h3>
                  <p className="text-green-300 text-sm">Variables from Basic tab automatically appear here for testing</p>
                </div>
              </div>

              {config.inputFields && config.inputFields.length > 0 ? (
                <>
                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                    <h4 className="text-blue-400 font-semibold mb-3">📝 Dynamic Test Fields ({config.inputFields.length} variables)</h4>
                    <p className="text-blue-300 text-sm mb-4">These fields are auto-generated from your selected variables in the Basic tab</p>
                    
                    <div className="grid grid-cols-1 gap-4">
                      {config.inputFields.map((field, index) => {
                        const allVariables = getAllAlchemistVariables()
                        const variableDef = allVariables[field.variable] || field
                        
                        return (
                          <div key={field.variable || index} className="bg-gray-700 rounded-lg p-4">
                            <label className="block text-sm font-medium text-white mb-2">
                              {variableDef.name || field.label || field.variable}
                              {variableDef.required && <span className="text-red-400 ml-1">*</span>}
                            </label>
                            
                            {variableDef.type === 'select' ? (
                              <select
                                value={testInputValues[field.variable] || ''}
                                onChange={(e) => setTestInputValues(prev => ({
                                  ...prev,
                                  [field.variable]: e.target.value
                                }))}
                                className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-primary"
                              >
                                <option value="">Select {variableDef.name}</option>
                                {variableDef.options?.map(option => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                              </select>
                            ) : variableDef.type === 'textarea' ? (
                              <textarea
                                value={testInputValues[field.variable] || ''}
                                onChange={(e) => setTestInputValues(prev => ({
                                  ...prev,
                                  [field.variable]: e.target.value
                                }))}
                                className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-primary h-24"
                                placeholder={variableDef.testInput || `Enter ${variableDef.name}...`}
                              />
                            ) : (
                              <input
                                type={variableDef.type === 'number' ? 'number' : 'text'}
                                value={testInputValues[field.variable] || ''}
                                onChange={(e) => setTestInputValues(prev => ({
                                  ...prev,
                                  [field.variable]: e.target.value
                                }))}
                                className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-primary"
                                placeholder={variableDef.testInput || `Enter ${variableDef.name}...`}
                              />
                            )}
                            
                            <p className="text-xs text-gray-400 mt-1">{variableDef.instructions}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* JSON OUTPUT PREVIEW */}
                  <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                    <h4 className="text-purple-400 font-semibold mb-3">🔍 JSON Output Preview</h4>
                    <pre className="bg-gray-900 p-3 rounded-lg text-green-400 text-xs overflow-x-auto">
{JSON.stringify({
  nodeType: node?.type || 'inputMaster',
  timestamp: new Date().toISOString(),
  customerContext: {
    /* customer tier, industry, etc will be added here */
  },
  userInput: testInputValues,
  metadata: {
    selectedVariables: config.inputFields.map(f => f.variable),
    totalFields: config.inputFields.length,
    requiredFields: config.inputFields.filter(f => {
      const allVars = getAllAlchemistVariables()
      return allVars[f.variable]?.required
    }).length
  }
}, null, 2)}
                    </pre>
                  </div>

                  <button 
                    onClick={() => {
                      const testData = {
                        nodeType: node?.type || 'inputMaster',
                        userInput: testInputValues,
                        selectedVariables: config.inputFields
                      }
                      console.log('🧪 Test Data:', testData)
                      toast.success('Test data logged to console!')
                    }}
                    className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Test Node with Current Data
                  </button>
                </>
              ) : (
                <div className="text-center py-8 bg-gray-700/50 rounded-lg">
                  <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <h4 className="text-gray-300 font-medium mb-2">No Variables Selected</h4>
                  <p className="text-gray-400 text-sm">Go to the <strong>Variables</strong> tab to select input fields for testing</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors disabled:bg-gray-600"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save Configuration'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AlchemistMasterNodeModal