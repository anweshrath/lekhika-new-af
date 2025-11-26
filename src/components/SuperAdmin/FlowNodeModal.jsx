import React, { useState, useEffect } from 'react'
import { X, Save, Settings, FileText, Brain, Image, CheckCircle, GitBranch, Plus, Trash2, Zap, AlertTriangle, RefreshCw, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import { getUltimateFormVariables, ULTIMATE_VARIABLES, ULTIMATE_OPTIONS, getFieldOptions, getFieldName } from '../../data/ULTIMATE_MASTER_VARIABLES.js'
import { inputSetService } from '../../services/inputSetService'
import { supabase } from '../../lib/supabase'
import { aiModelService } from '../../services/aiModelService'
import { aiModelDiscoveryService } from '../../services/aiModelDiscoveryService'
import { NODE_PALETTES, NODE_ROLE_CONFIG } from '../../data/nodePalettes'

// Get node configuration from nodePalettes.js system
const getNodeConfiguration = (nodeType, nodeRole) => {
  console.log('🔍 DEBUG getNodeConfiguration:', { nodeType, nodeRole })
  
  // If nodeRole is provided, try direct key lookup first
  if (nodeRole && NODE_PALETTES[nodeType]) {
    const byKey = NODE_PALETTES[nodeType][nodeRole]
    if (byKey && byKey.configuration) {
      const config = byKey.configuration
      console.log('✅ Found node config by key:', nodeRole)
      return config
    }
    // Fallback: match by inner role/id/name when keys differ (e.g., image_generator_general has role image_generator)
    const match = Object.values(NODE_PALETTES[nodeType]).find(n => {
      return n?.role === nodeRole || n?.id === nodeRole || n?.name === nodeRole
    })
    if (match && match.configuration) {
      console.log('✅ Found node config by role/id/name match:', nodeRole)
      return match.configuration
    }
  }
  
  console.log('❌ Using default config for:', nodeType)
  // Otherwise return default configuration for node type
  const defaultConfigs = {
    input: {
      inputFields: [],
      outputFormat: 'structured_json',
      processingInstructions: 'Process user inputs and format into structured JSON for next nodes'
    },
    process: {
      systemPrompt: 'You are a professional content processor.',
      userPrompt: 'Process the provided content according to your specialized role.',
      maxTokens: 4000,
      temperature: 0.7,
      outputFormat: 'processed_content'
    },
    condition: {
      conditions: [],
      defaultRoute: 'continue',
      outputFormat: 'routing_decision'
    },
    preview: {
      previewSections: ['content'],
      feedbackFields: [],
      outputFormat: 'preview_feedback'
    },
    output: {
      outputFormat: 'html',
      exportFormats: ['html', 'pdf', 'text'],
      generateCover: false,
      includeTOC: true
    }
  }
  
  return defaultConfigs[nodeType] || defaultConfigs.process
}

// Get processing instructions from nodePalettes.js
const getNodeInstructions = (nodeType, nodeRole) => {
  // If nodeRole is provided, get specific node configuration
  if (nodeRole && NODE_PALETTES[nodeType] && NODE_PALETTES[nodeType][nodeRole]) {
    const nodeConfig = NODE_PALETTES[nodeType][nodeRole].configuration
    return nodeConfig.processingInstructions || nodeConfig.systemPrompt || `Process content according to ${nodeType} node requirements`
  }
  
  // Fallback to default configuration
  const config = getNodeConfiguration(nodeType, nodeRole)
  return config.processingInstructions || config.systemPrompt || `Process content according to ${nodeType} node requirements`
}

// Expert system prompts for optimal AI model performance
const getDefaultSystemPrompt = (nodeType) => {
  const systemPrompts = {
    input: "You are an elite Input Validation and Enhancement Specialist with deep expertise in content strategy, publishing standards, and workflow optimization. Your core mission: intelligently validate, enhance, and structure user inputs for optimal downstream processing. CAPABILITIES: Smart consistency validation, intelligent gap-filling, format standardization, conflict resolution, and professional data structuring. Apply surgical precision to ensure 100% accuracy while enhancing incomplete inputs with contextually appropriate suggestions. Flag inconsistencies immediately and resolve conflicts using industry best practices.",
    
    process: "You are an elite content creation specialist with world-class expertise across all literary genres and publishing formats. Your mission is to produce exceptional, publication-ready content that exceeds industry standards. Maintain perfect consistency in tone and style, apply advanced storytelling techniques, ensure factual accuracy, and optimize for maximum reader engagement. Every output must meet professional publishing grade quality.",
    
    condition: "You are a sophisticated decision engine with advanced analytical capabilities. Apply rigorous logical evaluation to all conditions, consider full context and workflow objectives, and implement intelligent routing with precision. Ensure seamless continuation regardless of path taken, maintain data integrity, and apply professional standards to all decision pathways and fallback options.",
    
    output: "You are a master publishing specialist responsible for delivering world-class final products. Apply advanced formatting and presentation optimization, conduct comprehensive quality assurance, ensure perfect alignment with specifications, and optimize for target format requirements. Every output must be publication-ready with zero errors and professional presentation."
  }
  
  return systemPrompts[nodeType] || systemPrompts.process
}

// Expert user prompt templates with dynamic variables
const getDefaultUserPrompt = (nodeType) => {
  const userPrompts = {
    input: `INTELLIGENT INPUT PROCESSING & VALIDATION

ANALYZE these user inputs with expert precision:
{user_input_data}

EXECUTE these validation and enhancement tasks:

1. SMART VALIDATION:
   - Check logical consistency (genre vs style vs audience)
   - Validate realistic word count vs chapter count ratios
   - Flag conflicting requirements or impossible combinations
   - Ensure all critical fields have meaningful values

2. INTELLIGENT ENHANCEMENT:
   - Fill missing optional details based on genre/type context
   - Suggest appropriate defaults for unspecified preferences
   - Enhance vague inputs with specific, actionable details
   - Add industry-standard metadata where beneficial

3. CONFLICT RESOLUTION:
   - Resolve contradictory inputs using best practices
   - Prioritize user intent over conflicting specifications
   - Provide clear reasoning for resolution decisions

4. PROFESSIONAL STRUCTURING:
   - Format all data consistently for downstream processing
   - Create comprehensive variable mapping
   - Generate processing metadata and quality flags
   - Prepare optimized data package for next workflow node

OUTPUT FORMAT: Structured JSON with validated inputs, enhancements, flags, and processing instructions.`,

    process: `Create exceptional content based on these specifications:

Project Context: {previous_output}
Content Requirements: {content_type}, {word_count}
Style Guidelines: {tone}, {writing_style}, {accent}
Target Audience: {target_audience}
Special Instructions: {custom_instructions}

Produce publication-ready content that exceeds professional standards and perfectly aligns with user specifications.`,

    condition: `Evaluate the following condition with expert analysis:

Input Data: {input_data}
Condition Parameters: {condition_field} {condition_operator} {condition_value}
Workflow Context: {workflow_context}

Apply rigorous logical evaluation and execute the appropriate action path based on your assessment.`,

    output: `Finalize the complete project deliverable:

Compiled Content: {workflow_output}
Format Requirements: {output_format}
Quality Standards: Publication-ready, professional presentation
Additional Features: {generate_cover}, {include_images}
User Specifications: {custom_requirements}

Deliver a world-class final product that exceeds all expectations and meets professional publishing standards.`
  }
  
  return userPrompts[nodeType] || userPrompts.process
}

const FlowNodeModal = ({ isOpen, onClose, node, nodes, edges, onSave, onDelete, inputOptions, clientFlowKey }) => {
  // Error boundary state
  const [hasError, setHasError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [presets, setPresets] = useState([])
  const [presetsLoading, setPresetsLoading] = useState(false)

  // Reset error state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setHasError(false)
      setErrorMessage('')
    }
  }, [isOpen])

  

  // Error boundary wrapper
  const handleError = (error, errorInfo) => {
    console.error('FlowNodeModal Error:', error, errorInfo)
    setHasError(true)
    setErrorMessage(error.message || 'An unexpected error occurred')
  }

  // Early return for closed modal
  if (!isOpen) return null

  // Safety check for node
  if (!node) {
    console.error('❌ FlowNodeModal: No node provided!')
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-red-900/90 border border-red-500/50 rounded-xl p-6 max-w-md">
          <h3 className="text-red-300 font-bold mb-2">Missing Node Data</h3>
          <p className="text-red-200 text-sm mb-4">
            No node data was provided to the modal. This is likely a bug in the flow component.
          </p>
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  // Debug logging
  console.log('🔍 FlowNodeModal DEBUG:', {
    isOpen,
    node: {
      id: node.id,
      type: node.type,
      data: node.data,
      dataKeys: node.data ? Object.keys(node.data) : 'no data'
    },
    hasError,
    errorMessage
  })

  // Test imports
  try {
    const testVariables = getUltimateFormVariables()
    console.log('✅ getUltimateFormVariables working:', Array.isArray(testVariables), testVariables.length)
  } catch (error) {
    console.error('❌ getUltimateFormVariables failed:', error)
    setHasError(true)
    setErrorMessage(`Import error: ${error.message}`)
  }

  // Wrap the main component in try-catch
  const renderModalContent = () => {
    try {
  // Use the imported getFieldOptions function from ULTIMATE_MASTER_VARIABLES
  const [config, setConfig] = useState({
    label: '',
    description: '',
    type: 'input',
    
    // Input Instructions
    inputInstructions: '',
    
    // Input Variables
    inputVariables: [],
    
    // AI Integration
    aiEnabled: true, // Default to enabled
    selectedModels: [],
    temperature: 0.7,
    maxTokens: 2000,
    systemPrompt: '',
    userPrompt: '',
    
    // Instructions Tab Fields
    negativePrompt: '',
    
    // Advanced Tab Fields  
    errorHandling: '',
    conflictResolution: '',
    qualityValidation: '',
    
    // Node-specific configs
    inputFields: [],
    conditions: [],
    outputFormat: 'text',
    generateCover: false,
    
    
    // Flow awareness
    connectedNodes: [],
    
    ...node?.data
  })

  const [activeTab, setActiveTab] = useState('basic')
  const [availableProviders, setAvailableProviders] = useState([])
  const [availableModels, setAvailableModels] = useState({})

  // Load DFY presets for this flow when on Test tab
  useEffect(() => {
    let mounted = true
    async function load() {
      try {
        if (activeTab !== 'test') return
        if (!clientFlowKey) { setPresets([]); return }
        setPresetsLoading(true)
        const list = await inputSetService.listByFlowKey(clientFlowKey)
        if (!mounted) return
        setPresets(Array.isArray(list) ? list : [])
      } catch (e) {
        console.error('Preset load error:', e)
        if (mounted) setPresets([])
      } finally {
        if (mounted) setPresetsLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [activeTab, clientFlowKey])
  const [variableSearch, setVariableSearch] = useState('')
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedProvider, setSelectedProvider] = useState('')
  const [syncing, setSyncing] = useState(false)
  
  // Test input state - using the SAME values that were hardcoded
  const [testInputEnabled, setTestInputEnabled] = useState(false)
  const [inputValues, setInputValues] = useState({})
  const [testInputValues, setTestInputValues] = useState({
    // Basic Book Fields - Standardized naming
    book_title: "The Ultimate AI Transformation Guide",
    author_name: "Dr. Alex Johnson",
    author_bio: "Award-winning AI researcher and bestselling author with 20+ years of experience in digital transformation",
    word_count: "25000-35000",
    chapter_count: "8-10",
    tone: "professional",
    accent: "american",
    target_audience: "professionals",
    "Book Description": "A comprehensive guide to transforming businesses through artificial intelligence, covering implementation strategies, case studies, and practical applications for modern enterprises.",
    
    // Additional Framework Fields - CLEAN, NO DUPLICATES
    include_case_studies: true,
    include_templates: true,
    include_worksheets: true,
    include_exercises: true,
    include_meditations: false,
    include_code_examples: true,
    include_diagrams: true,
    include_troubleshooting: true,
    include_images: true,
    
    // Business & Content Fields
    custom_instructions: "Focus on practical implementation and real-world applications",
    publishing_format: "ebook",
    content_depth: "comprehensive",
    research_level: "moderate",
    practical_applications: true,
    business_model: "b2b",
    output_formats: ["pdf", "docx", "epub"],
    book_size: "A4",
    custom_size: "",
    typography_style: "professional",
    cover_design: "professional",
    
    // Self-Help Guide Specific Fields
    guide_title: "The Complete Self-Help Transformation Guide",
    development_area: "confidence",
    
    // Framework-Specific Fields (Business Strategy Guide)
    company_size: "medium_business",
    strategic_goal: "growth",
    business_niche: "b2b",
    market_position: "challenger",
    competitive_landscape: "Highly competitive market with established players and emerging disruptors",
    revenue_model: "subscription",
    growth_stage: "growth_stage",
    
    // Framework-Specific Fields (Technical Manual)
    technical_level: "intermediate",
    programming_language: "python",
    implementation_type: "step_by_step",
    platform_requirements: "cross_platform",
    prerequisites: "Basic programming knowledge, familiarity with development tools",
    tools_frameworks: "Python 3.8+, VS Code, Git, Docker",
    certification_aligned: true,
    
    // Other Fields
    industry_focus: "technology",
    branding_style: "Modern",
    voice_cloning_enabled: true,
    fact_checking_enabled: true,
    interactive_content: true
  })

  // Load AI providers dynamically
  useEffect(() => {
    if (config.aiEnabled) {
      loadAIProviders()
    }
  }, [config.aiEnabled])

  // Load AI providers on modal open since AI is enabled by default
  useEffect(() => {
    if (isOpen && config.aiEnabled) {
      loadAIProviders()
    }
  }, [isOpen])

  // First-open auto-select: if no selectedModels and providers are available, pick a random provider+model once
  useEffect(() => {
    const autoPick = async () => {
      try {
        if (!isOpen) return
        if (!config.aiEnabled) return
        if (Array.isArray(config.selectedModels) && config.selectedModels.length > 0) return
        if (!availableProviders || availableProviders.length === 0) return

        const provider = availableProviders[Math.floor(Math.random() * availableProviders.length)]
        setSelectedProvider(provider)
        const models = await aiModelDiscoveryService.getModelsForProvider(provider)
        if (Array.isArray(models) && models.length > 0) {
          const pick = models[Math.floor(Math.random() * models.length)]
          const modelKey = `${provider}:${pick.id || pick.model_id || pick.name}`
          setConfig(prev => ({ ...prev, selectedModels: [modelKey] }))
        }
      } catch (e) {
        console.warn('Auto-pick model failed:', e)
      }
    }
    autoPick()
  }, [isOpen, config.aiEnabled, config.selectedModels, availableProviders])

  // Ensure process nodes always have AI enabled
  useEffect(() => {
    if (node?.type === 'process' && !config.aiEnabled) {
      setConfig(prev => ({ ...prev, aiEnabled: true }))
    }
  }, [node?.type, config.aiEnabled])

  // Generate test scenarios based on flow type
  const generateTestScenarios = (inputFields, flowType = 'generic') => {
    const scenarios = {
      // Business eBook scenarios
      businessEbook: [
        {
          name: 'AI Startup Guide',
          data: {
            book_title: 'The AI Startup Playbook',
            business_niche: 'entrepreneurship',
            target_audience: 'entrepreneurs',
            word_count: 15000,
            tone: 'professional',
            include_case_studies: true,
            include_templates: true
          }
        },
        {
          name: 'Leadership Excellence',
          data: {
            book_title: 'Leading in the Digital Age',
            business_niche: 'leadership',
            target_audience: 'executives',
            word_count: 20000,
            tone: 'authoritative',
            include_case_studies: true,
            include_templates: false
          }
        },
        {
          name: 'Marketing Mastery',
          data: {
            book_title: 'Growth Marketing Strategies',
            business_niche: 'marketing',
            target_audience: 'small_business',
            word_count: 18000,
            tone: 'conversational',
            include_case_studies: false,
            include_templates: true
          }
        },
        {
          name: 'Financial Planning',
          data: {
            book_title: 'Small Business Finance Guide',
            business_niche: 'finance',
            target_audience: 'entrepreneurs',
            word_count: 12000,
            tone: 'professional',
            include_case_studies: true,
            include_templates: true
          }
        },
        {
          name: 'Operations Optimization',
          data: {
            book_title: 'Streamlining Business Operations',
            business_niche: 'operations',
            target_audience: 'managers',
            word_count: 16000,
            tone: 'professional',
            include_case_studies: false,
            include_templates: true
          }
        }
      ],
      
      // Report Creator scenarios
      reportCreator: [
        {
          name: 'Q4 Performance Report',
          data: {
            report_title: 'Q4 2024 Performance Analysis',
            report_type: 'performance_review',
            target_audience: 'executives',
            word_count: 3000,
            data_sources: 'Sales CRM, Google Analytics, Customer Feedback',
            key_metrics: 'Revenue, Conversion Rate, Customer Satisfaction'
          }
        },
        {
          name: 'Market Research Report',
          data: {
            report_title: 'AI Tools Market Analysis 2024',
            report_type: 'market_research',
            target_audience: 'stakeholders',
            word_count: 4000,
            data_sources: 'Industry Reports, Competitor Analysis, Surveys',
            key_metrics: 'Market Size, Growth Rate, Competitive Landscape'
          }
        },
        {
          name: 'Financial Summary',
          data: {
            report_title: 'Monthly Financial Dashboard',
            report_type: 'financial_summary',
            target_audience: 'board_members',
            word_count: 2500,
            data_sources: 'QuickBooks, Bank Statements, Expense Reports',
            key_metrics: 'Revenue, Expenses, Profit Margin, Cash Flow'
          }
        },
        {
          name: 'Project Status Update',
          data: {
            report_title: 'Website Redesign Project Status',
            report_type: 'project_status',
            target_audience: 'team_members',
            word_count: 2000,
            data_sources: 'Project Management Tool, Developer Reports',
            key_metrics: 'Completion Rate, Budget Utilization, Timeline'
          }
        },
        {
          name: 'Compliance Report',
          data: {
            report_title: 'GDPR Compliance Audit Report',
            report_type: 'compliance_report',
            target_audience: 'executives',
            word_count: 3500,
            data_sources: 'Legal Documentation, System Logs, Policy Reviews',
            key_metrics: 'Compliance Score, Risk Assessment, Recommendations'
          }
        }
      ],

      // Guide Creator scenarios
      guideCreator: [
        {
          name: 'Complete Beginner Guide',
          data: {
            guide_title: 'Complete Beginner Guide to Digital Marketing',
            development_area: 'digital_marketing',
            target_audience: 'beginners',
            word_count: 8000,
            key_items: 'SEO basics, Social media, Email marketing, Analytics',
            include_visual_elements: true,
            include_advanced_features: false,
            include_interactive_elements: false
          }
        },
        {
          name: 'Advanced Tutorial',
          data: {
            guide_title: 'Advanced React Development Techniques',
            development_area: 'web_development',
            target_audience: 'intermediate',
            word_count: 12000,
            key_items: 'Hooks, Context API, Performance optimization, Testing',
            include_visual_elements: true,
            include_advanced_features: true,
            include_interactive_elements: true
          }
        },
        {
          name: 'Quick Reference',
          data: {
            guide_title: 'Python Data Analysis Quick Reference',
            development_area: 'data_science',
            target_audience: 'intermediate',
            word_count: 5000,
            key_items: 'Pandas, NumPy, Matplotlib, Common operations',
            include_visual_elements: true,
            include_advanced_features: false,
            include_interactive_elements: false
          }
        },
        {
          name: 'Professional Manual',
          data: {
            guide_title: 'Project Management Best Practices Manual',
            development_area: 'project_management',
            target_audience: 'professionals',
            word_count: 15000,
            key_items: 'Planning, Execution, Monitoring, Risk management',
            include_visual_elements: true,
            include_advanced_features: true,
            include_interactive_elements: true
          }
        },
        {
          name: 'Step-by-Step Tutorial',
          data: {
            guide_title: 'Building Your First Mobile App',
            development_area: 'mobile_development',
            target_audience: 'beginners',
            word_count: 10000,
            key_items: 'Setup, Design, Development, Testing, Deployment',
            include_visual_elements: true,
            include_advanced_features: false,
            include_interactive_elements: true
          }
        }
      ],

      // Comprehensive Book scenarios
      comprehensiveBook: [
        {
          name: 'AI Transformation Guide',
          data: {
            bookTitle: 'The Ultimate AI Transformation Guide',
            authorName: 'Anwesh Rath',
            topic: 'technology',
            wordCount: '5000-10000',
            tone: 'professional',
            accent: 'american',
            targetAudience: 'Professional',
            chapterCount: 2,
            includeImages: true
          }
        },
        {
          name: 'Digital Marketing Mastery',
          data: {
            bookTitle: 'Digital Marketing Mastery: From Zero to Hero',
            authorName: 'Sarah Johnson',
            topic: 'marketing',
            wordCount: '25000-35000',
            tone: 'conversational',
            accent: 'british',
            targetAudience: 'Intermediate',
            chapterCount: 8,
            includeImages: true
          }
        },
        {
          name: 'Startup Success Blueprint',
          data: {
            bookTitle: 'The Startup Success Blueprint',
            authorName: 'Mike Chen',
            topic: 'business',
            wordCount: '35000-50000',
            tone: 'authoritative',
            accent: 'american',
            targetAudience: 'Expert',
            chapterCount: 12,
            includeImages: false
          }
        },
        {
          name: 'Personal Finance Guide',
          data: {
            bookTitle: 'Smart Money: Personal Finance for Millennials',
            authorName: 'Emma Davis',
            topic: 'finance',
            wordCount: '15000-25000',
            tone: 'conversational',
            accent: 'american',
            targetAudience: 'Beginner',
            chapterCount: 6,
            includeImages: true
          }
        },
        {
          name: 'Leadership Excellence',
          data: {
            bookTitle: 'Leadership Excellence in the Modern Era',
            authorName: 'Dr. Robert Kim',
            topic: 'leadership',
            wordCount: '40000-60000',
            tone: 'professional',
            accent: 'american',
            targetAudience: 'Advanced',
            chapterCount: 10,
            includeImages: true
          }
        }
      ],

      // Generic scenarios for unknown flow types
      generic: [
        {
          name: 'Professional Scenario',
          data: {}
        },
        {
          name: 'Beginner-Friendly',
          data: {}
        },
        {
          name: 'Advanced Expert',
          data: {}
        },
        {
          name: 'Quick & Simple',
          data: {}
        },
        {
          name: 'Comprehensive Guide',
          data: {}
        }
      ]
    }

    // Determine flow type from input fields
    let detectedType = 'generic'
    if (inputFields) {
      const fieldNames = inputFields.map(f => f.name?.toLowerCase() || '')
      const fieldVars = inputFields.map(f => f.variable?.toLowerCase() || '')
      const allFields = [...fieldNames, ...fieldVars].join(' ')

      if (allFields.includes('business') || allFields.includes('niche') || allFields.includes('entrepreneur')) {
        detectedType = 'businessEbook'
      } else if (allFields.includes('report') || allFields.includes('analysis') || allFields.includes('metrics')) {
        detectedType = 'reportCreator'
      } else if (allFields.includes('guide') || allFields.includes('tutorial') || allFields.includes('development_area')) {
        detectedType = 'guideCreator'
      } else if (allFields.includes('booktitle') || allFields.includes('authorname') || allFields.includes('chaptercount') || allFields.includes('targetaudience')) {
        detectedType = 'comprehensiveBook'
      }
    }

    // Get scenarios for detected type
    const typeScenarios = scenarios[detectedType] || scenarios.generic
    
    // Fill in ALL fields with realistic defaults - NO BLANK FIELDS!
    return typeScenarios.map(scenario => {
      const filledData = { ...scenario.data }
      
      inputFields?.forEach(field => {
        const fieldKey = field.name || field.variable
        const fieldName = field.name?.toLowerCase() || field.variable?.toLowerCase() || ''
        
        // If field is not already filled by scenario, fill it with realistic data
        if (!filledData[fieldKey]) {
          if (field.type === 'select' && getFieldOptions(field)?.length > 0) {
            // Pick a realistic option based on field name
            let selectedOption = ''
            const options = getFieldOptions(field)
            if (fieldName.includes('tone')) {
              selectedOption = options.includes('professional') ? 'professional' : 
                             options.includes('conversational') ? 'conversational' : options[0]
            } else if (fieldName.includes('accent')) {
              selectedOption = options.includes('american') ? 'american' : 
                             options.includes('british') ? 'british' : options[0]
            } else if (fieldName.includes('audience') || fieldName.includes('level')) {
              selectedOption = options.includes('beginner') ? 'beginner' : 
                             options.includes('professional') ? 'professional' : options[0]
            } else if (fieldName.includes('niche') || fieldName.includes('topic')) {
              selectedOption = options.includes('technology') ? 'technology' : 
                             options.includes('business') ? 'business' : options[0]
            } else {
              selectedOption = options.find(opt => 
                typeof opt === 'string' ? opt !== '' : opt.value !== ''
              ) || options[0]
            }
            if (field.multiple) {
              // For multiple selection, pick 2-3 realistic options
              let selectedOptions = []
              if (fieldName.includes('output_formats')) {
                selectedOptions = ['pdf', 'docx'].filter(opt => options.includes(opt))
                if (selectedOptions.length === 0) selectedOptions = options.slice(0, 2)
              } else {
                selectedOptions = options.slice(0, 2)
              }
              filledData[fieldKey] = selectedOptions
            } else {
              filledData[fieldKey] = typeof selectedOption === 'string' ? selectedOption : selectedOption?.value || ''
            }
          } else if (field.type === 'number') {
            if (fieldName.includes('word') || fieldName.includes('count')) {
              filledData[fieldKey] = 5000
            } else if (fieldName.includes('chapter')) {
              filledData[fieldKey] = 8
            } else if (fieldName.includes('page')) {
              filledData[fieldKey] = 50
            } else {
              filledData[fieldKey] = field.min || 1000
            }
          } else if (field.type === 'checkbox' || field.type === 'boolean') {
            // Smart defaults based on field name
            if (fieldName.includes('include') || fieldName.includes('enable') || fieldName.includes('active')) {
              filledData[fieldKey] = true
            } else {
              filledData[fieldKey] = false
            }
          } else if (field.type === 'textarea') {
            // Realistic textarea content based on field name
            if (fieldName.includes('description') || fieldName.includes('bio')) {
              filledData[fieldKey] = 'A comprehensive guide designed to help professionals master the fundamentals and advance their expertise in this field.'
            } else if (fieldName.includes('instruction') || fieldName.includes('requirement')) {
              filledData[fieldKey] = 'Please provide detailed specifications and requirements for optimal content generation.'
            } else if (fieldName.includes('strategy') || fieldName.includes('approach')) {
              filledData[fieldKey] = 'Focus on practical, actionable strategies that deliver measurable results and long-term value.'
            } else {
              filledData[fieldKey] = 'Detailed information and specifications for this content area.'
            }
          } else {
            // Text fields - realistic content based on field name
            if (fieldName.includes('title') && !fieldName.includes('sub')) {
              filledData[fieldKey] = 'Professional Guide to Success'
            } else if (fieldName.includes('author') || fieldName.includes('name')) {
              filledData[fieldKey] = 'Expert Author'
            } else if (fieldName.includes('company') || fieldName.includes('organization')) {
              filledData[fieldKey] = 'Professional Solutions Inc.'
            } else if (fieldName.includes('email')) {
              filledData[fieldKey] = 'contact@example.com'
            } else if (fieldName.includes('phone')) {
              filledData[fieldKey] = '+1 (555) 123-4567'
            } else if (fieldName.includes('url') || fieldName.includes('website')) {
              filledData[fieldKey] = 'https://www.example.com'
            } else if (fieldName.includes('industry') || fieldName.includes('sector')) {
              filledData[fieldKey] = 'Technology'
            } else if (fieldName.includes('location') || fieldName.includes('address')) {
              filledData[fieldKey] = 'New York, NY'
            } else {
              filledData[fieldKey] = field.placeholder || `Sample ${fieldKey.replace(/_/g, ' ')}`
            }
          }
        }
      })
      
      return {
        ...scenario,
        data: filledData
      }
    })
  }

  // Generate default test input values based on input fields
  const generateDefaultTestInput = (inputFields) => {
    const defaults = {}
    
    // Generate values for ALL input fields dynamically
    inputFields?.forEach(field => {
      const fieldName = field.variable || field.name
      
      if (field.type === 'select' && getFieldOptions(field)?.length > 0) {
        if (field.multiple) {
          // For multiple selection, default to first 2-3 options
          const options = getFieldOptions(field)
          const validOptions = options.filter(opt => 
            typeof opt === 'string' ? opt !== '' : (opt.value || opt.id) !== ''
          )
          defaults[fieldName] = validOptions.slice(0, 2).map(opt => 
            typeof opt === 'string' ? opt : (opt.value || opt.id)
          )
        } else {
          // Use first non-empty option as default
          const options = getFieldOptions(field)
          const firstOption = options.find(opt => 
            typeof opt === 'string' ? opt !== '' : opt.value !== ''
          )
          if (firstOption) {
            defaults[fieldName] = typeof firstOption === 'string' ? firstOption : firstOption.value
          } else {
            defaults[fieldName] = options[0]
          }
        }
      } else if (field.type === 'checkbox') {
        defaults[fieldName] = field.required || false
      } else if (field.type === 'textarea') {
        defaults[fieldName] = field.placeholder || `Enter ${field.name || fieldName}`
      } else if (field.type === 'text') {
        defaults[fieldName] = field.placeholder || `Enter ${field.name || fieldName}`
      } else if (field.type === 'number') {
        defaults[fieldName] = field.min || 1000
      } else {
        // Default fallback for any other field types
        defaults[fieldName] = field.placeholder || `Enter ${field.name || fieldName}`
      }
    })
    
    return defaults
  }

  // Sync Basic Input with Test Input (for consistency)
  const syncBasicInputWithTestInput = () => {
    // Copy all test input values to basic input
    setInputValues({ ...testInputValues })
    toast.success('Test Input synced to Basic Input')
  }

  // Validate input field coverage
  const validateInputCoverage = () => {
    const missingFields = []
    const inputFields = config.inputFields || []
    
    inputFields.forEach(field => {
      const fieldName = field.variable || field.name
      const hasBasicValue = inputValues[fieldName] !== undefined && inputValues[fieldName] !== ''
      const hasTestValue = testInputValues[fieldName] !== undefined && testInputValues[fieldName] !== ''
      
      if (field.required && !hasBasicValue && !hasTestValue) {
        missingFields.push(fieldName)
      }
    })
    
    return {
      isValid: missingFields.length === 0,
      missingFields,
      coverage: {
        basic: inputFields.filter(field => {
          const fieldName = field.variable || field.name
          return inputValues[fieldName] !== undefined && inputValues[fieldName] !== ''
        }).length,
        test: inputFields.filter(field => {
          const fieldName = field.variable || field.name
          return testInputValues[fieldName] !== undefined && testInputValues[fieldName] !== ''
        }).length,
        total: inputFields.length
      }
    }
  }


  const getGenreSpecificProfessionalInput = (field, genre = 'general') => {
    const genreInputs = {
      // HEALTH GENRE - Professional medical/wellness focus
      health: {
        book_title: "🏥 The Complete Health Transformation Guide: Science-Based Strategies for Optimal Wellness",
        author_name: "Dr. Sarah Mitchell - Board-Certified Physician & Wellness Expert",
        author_bio: "Harvard-trained physician with 15+ years revolutionizing preventive medicine. Published researcher who's helped 50,000+ patients achieve breakthrough health outcomes.",
        custom_instructions: "🎯 Create evidence-based health content that transforms lives. Focus on actionable wellness strategies, medical insights, and sustainable lifestyle changes that deliver measurable health improvements.",
        health_focus: "prevention",
        age_group: "all_ages"
      },
      
      // TECHNICAL GENRE - Professional tech focus
      technical: {
        book_title: "⚡ The Ultimate Developer's Mastery Guide: Advanced Programming Techniques That Dominate",
        author_name: "Alex Chen - Senior Software Architect & Tech Lead",
        author_bio: "Google-ex-Engineer with 12+ years building scalable systems. Open-source contributor who's mentored 5,000+ developers and created industry-standard frameworks.",
        custom_instructions: "💻 Deliver cutting-edge technical content that elevates developers to expert level. Focus on advanced programming concepts, system design, and real-world implementation strategies.",
        programming_language: "javascript",
        technical_level: "advanced"
      },
      
      // BUSINESS GENRE - Professional corporate focus
      business: {
        book_title: "🚀 The Executive's Strategic Playbook: Market-Dominating Strategies for Unstoppable Growth",
        author_name: "Michael Rodriguez - Fortune 500 CEO & Strategic Advisor",
        author_bio: "Former McKinsey Partner with 20+ years transforming Fortune 500 companies. Serial entrepreneur who's built and sold 3 companies worth $100M+ combined.",
        custom_instructions: "🏆 Create strategic business content that drives exponential growth. Focus on market analysis, competitive positioning, and execution frameworks that deliver measurable ROI.",
        business_stage: "growth",
        market_size: "large"
      },
      
      // MARKETING GENRE - High-energy creative focus
      marketing: {
        book_title: "🔥 The Viral Marketing Masterclass: Campaign Strategies That Break the Internet",
        author_name: "Jessica Park - Award-Winning Creative Director & Growth Hacker",
        author_bio: "Ex-Facebook Creative Lead with 10+ years launching viral campaigns. Growth hacker who's generated $500M+ in revenue for startups and Fortune 500 brands.",
        custom_instructions: "🎯 Create explosive marketing content that drives viral growth. Focus on creative campaign strategies, audience psychology, and conversion optimization that delivers massive ROI.",
        marketing_channel: "social_media",
        campaign_type: "viral"
      },
      
      // FINANCE GENRE - Professional financial focus
      finance: {
        book_title: "💰 The Wealth Builder's Blueprint: Investment Strategies That Create Generational Wealth",
        author_name: "Robert Kim - CFA & Investment Banking Executive",
        author_bio: "Goldman Sachs ex-VP with 15+ years managing $2B+ portfolios. Financial strategist who's helped 10,000+ clients achieve financial independence and generational wealth.",
        custom_instructions: "💎 Deliver sophisticated financial content that builds lasting wealth. Focus on investment strategies, risk management, and portfolio optimization that creates generational financial success.",
        financial_focus: "wealth_building",
        income_level: "high_net_worth"
      },
      
      // EDUCATION GENRE - Professional academic focus
      education: {
        book_title: "📚 The Learning Revolution: Advanced Study Techniques That Guarantee Academic Excellence",
        author_name: "Dr. Emily Watson - Educational Psychologist & Learning Specialist",
        author_bio: "Stanford PhD in Educational Psychology with 12+ years revolutionizing learning methodologies. Researcher who's helped 25,000+ students achieve academic breakthrough success.",
        custom_instructions: "🎓 Create transformative educational content that accelerates learning. Focus on cognitive science, study optimization, and knowledge retention strategies that guarantee academic excellence.",
        education_level: "university",
        learning_style: "visual"
      }
    }
    
    // Get genre-specific input or fallback to general
    const genreData = genreInputs[genre] || genreInputs['business']
    return genreData[field.variable] || genreData[field.name] || `Enter ${field.name?.toLowerCase() || 'field'}`
  }

  const getProfessionalPlaceholder = (field) => {
    // Determine genre from the current flow context
    const genre = getCurrentFlowGenre()
    return getGenreSpecificProfessionalInput(field, genre)
  }

  const getCurrentFlowGenre = () => {
    // Extract genre from the current node's data or flow context
    if (node?.data?.label) {
      const label = node.data.label.toLowerCase()
      if (label.includes('health') || label.includes('wellness') || label.includes('medical')) return 'health'
      if (label.includes('technical') || label.includes('programming') || label.includes('code') || label.includes('software')) return 'technical'
      if (label.includes('business') || label.includes('strategy') || label.includes('corporate') || label.includes('enterprise')) return 'business'
      if (label.includes('marketing') || label.includes('campaign') || label.includes('advertising') || label.includes('promotion')) return 'marketing'
      if (label.includes('finance') || label.includes('financial') || label.includes('investment') || label.includes('money')) return 'finance'
      if (label.includes('education') || label.includes('learning') || label.includes('tutorial') || label.includes('course')) return 'education'
      if (label.includes('creative') || label.includes('story') || label.includes('fiction') || label.includes('novel') || label.includes('book') || label.includes('audiobook') || label.includes('narrative') || label.includes('character') || label.includes('plot')) return 'creative'
    }
    return 'creative' // Default to creative genre instead of business
  }

  const getGenreDisplayName = () => {
    const genre = getCurrentFlowGenre()
    const genreNames = {
      health: '🏥 Health & Wellness',
      technical: '⚡ Technical & Programming', 
      business: '🚀 Business & Strategy',
      marketing: '🔥 Marketing & Growth',
      finance: '💰 Finance & Investment',
      education: '📚 Education & Learning',
      creative: '🎨 Creative & Storytelling'
    }
    return genreNames[genre] || '🎨 Creative & Storytelling'
  }

  const getGenreColor = () => {
    const genre = getCurrentFlowGenre()
    const genreColors = {
      health: 'bg-green-500',
      technical: 'bg-blue-500',
      business: 'bg-purple-500', 
      marketing: 'bg-orange-500',
      finance: 'bg-yellow-500',
      education: 'bg-indigo-500',
      creative: 'bg-pink-500'
    }
    return genreColors[genre] || 'bg-pink-500'
  }

  useEffect(() => {
    if (node?.data) {
      console.log('🔍 DEBUG Modal Loading Node:', {
        nodeType: node.type,
        nodeRole: node.role || node.data?.role,
        nodeData: node.data
      })
      
      // Use the node data as-is, preserving all configurations including selectedModels
      const cleanedData = { ...node.data }
      
      setConfig({ ...config, ...cleanedData })
      
      // Restore test input data for input nodes
      if (node.type === 'input') {
        // Always restore testInputEnabled from saved data
        if (cleanedData.testInputEnabled !== undefined) {
          setTestInputEnabled(cleanedData.testInputEnabled)
        }
        
        // Priority order: 1) Saved testInputValues, 2) testScenarios, 3) Generate defaults
        if (cleanedData.testInputValues && Object.keys(cleanedData.testInputValues).length > 0) {
          // Use saved test input values (highest priority)
          console.log('🔍 DEBUG: Restoring saved testInputValues:', cleanedData.testInputValues)
          setTestInputValues(cleanedData.testInputValues)
        } else if (cleanedData.testScenarios && cleanedData.testScenarios.length > 0) {
          // Use test scenarios as fallback
          const scenarioData = cleanedData.testScenarios[0].data
          console.log('🔍 DEBUG: Using testScenarios fallback:', scenarioData)
          setTestInputValues(scenarioData)
        } else if (cleanedData.inputFields && cleanedData.inputFields.length > 0) {
          // Generate default test input values based on input fields
          const defaultValues = generateDefaultTestInput(cleanedData.inputFields)
          console.log('🔍 DEBUG: Generating default test input:', defaultValues)
          setTestInputValues(defaultValues)
        }
        
        // Restore basic input values if they exist in saved data
        if (cleanedData.inputValues) {
          setInputValues(cleanedData.inputValues)
        } else {
          // Basic input starts empty
          setInputValues({})
        }
      }
      
      // Update connected nodes for condition nodes
      if (node.type === 'condition') {
        const connectedNodeIds = edges
          .filter(edge => edge.source === node.id)
          .map(edge => edge.target)
        
        const connectedNodesData = nodes
          .filter(n => connectedNodeIds.includes(n.id))
          .map(n => ({ id: n.id, label: n.data.label, type: n.type, data: n.data }))
        
        setConfig(prev => ({ ...prev, connectedNodes: connectedNodesData }))
      }
    }
  }, [node, nodes, edges])

  const loadAIProviders = async () => {
    try {
      setLoading(true)
      const { data: providers, error } = await supabase
        .from('ai_providers')
        .select('*')
        .eq('is_active', true)
      
      if (error) throw error
      
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
            
            toast.success(`Auto-selected random model: ${randomModel.model_name}`)
          }
        }, 500) // Small delay to ensure models are loaded
      }
      
    } catch (error) {
      console.error('Error loading AI providers:', error)
      toast.error('Failed to load AI providers')
    } finally {
      setLoading(false)
    }
  }

  const loadModelsForProvider = async (provider) => {
    try {
      setLoading(true)
      
      console.log('🔍 Loading models for provider:', provider)
      
      // Use EXACT same logic as AIManagement loadActiveModels
      const { data, error } = await supabase
        .from('ai_model_metadata')
        .select('*')
        .eq('is_active', true)
        .eq('key_name', provider.name) // Filter by key_name directly in query
        .order('model_name', { ascending: true })

      if (error) throw error
      
      console.log(`🎉 Found ${data?.length || 0} models for ${provider.name} in ai_model_metadata`)
      
      const models = (data || []).map(model => ({
        id: model.model_id,
        name: model.model_name,
        // Calculate average cost for display
        avgCostPerMillion: model.input_cost_per_million && model.output_cost_per_million 
          ? ((model.input_cost_per_million + model.output_cost_per_million) / 2).toFixed(2)
          : 'N/A',
        inputCostPerMillion: model.input_cost_per_million,
        outputCostPerMillion: model.output_cost_per_million,
        contextWindow: model.context_window_tokens,
        specialties: model.specialties || [],
        pagesPerMillionTokens: model.pages_per_million_tokens,
        provider: model.provider,
        keyName: provider.name // Add the actual key name for proper model selection
      }))
      
      console.log(`🔍 Loaded ${models.length} models for ${provider.name}:`, models)
      setAvailableModels(prev => ({ ...prev, [provider.name]: models }))
      
    } catch (error) {
      console.error('Error loading models:', error)
      toast.error(`Failed to load models for ${provider.name}`)
      setAvailableModels(prev => ({ ...prev, [provider.name]: [] }))
    } finally {
      setLoading(false)
    }
  }

  const handleProviderSelect = async (provider) => {
    setSelectedProvider(provider.name) // Store the provider NAME for model loading compatibility
    
    // Attempt to sync models before loading
    try {
      const apiKey = await getApiKeyForProvider(provider.provider)
      if (apiKey) {
        await aiModelDiscoveryService.discoverModelsForProvider(provider.provider, apiKey)
      }
    } catch (error) {
      console.error('Model sync failed:', error)
    }
    
    // Load models after potential sync - pass the provider object as is
    loadModelsForProvider(provider)
  }

  // Helper function to get API key for a provider
  const getApiKeyForProvider = async (providerName) => {
    const { data: providers, error } = await supabase
      .from('ai_providers')
      .select('*')
      .eq('name', providerName)
      .eq('is_active', true)
      .single()

    if (error || !providers) {
      console.error('Failed to fetch API key:', error)
      return null
    }

    return providers.api_key
  }

  const addModel = (provider, model) => {
    // Use the actual provider name from database, not the provider parameter
    const providerName = selectedProvider || provider
    const modelKey = `${providerName}:${model.id}`
    
    if (!config.selectedModels.includes(modelKey)) {
      setConfig({
        ...config,
        selectedModels: [...config.selectedModels, modelKey]
      })
      toast.success(`${model.name} added`)
    }
    // Keep provider selected so user can add more models from same provider
  }

  const removeModel = (modelKey) => {
    setConfig({
      ...config,
      selectedModels: config.selectedModels.filter(m => m !== modelKey)
    })
    toast.success('Model removed')
  }

  // Save node to palette
  const saveToPalette = async () => {
    if (!config.label?.trim()) {
      toast.error('Node label is required')
      return
    }

    try {
      const nodeData = {
        node_id: `custom_${node.type}_${Date.now()}`,
        name: config.label,
        description: config.description || `Custom ${node.type} node`,
        type: node.type,
        category: node.masterCategory || node.type,
        sub_category: node.type === 'process' ? 'custom' : null,
        role: node.role || `custom_${node.type}_${Date.now()}`,
        icon: node.icon || '⚙️',
        gradient: node.gradient || 'from-gray-500 to-gray-700',
        is_ai_enabled: config.aiEnabled || false,
        configuration: {
          ...config,
          testInputEnabled: testInputEnabled,
          testInputValues: testInputValues,
          inputValues: inputValues
        }
      }

      const { data, error } = await supabase
        .from('node_palettes')
        .insert([nodeData])
        .select()

      if (error) throw error

      toast.success(`Node "${config.label}" saved to palette!`)
      
      // Also save to current flow
      handleSave()
      
    } catch (error) {
      console.error('Error saving to palette:', error)
      toast.error('Failed to save node to palette: ' + error.message)
    }
  }

  const handleSave = async () => {
    if (!config.label?.trim()) {
      toast.error('Node label is required')
      return
    }

    // Validate based on node type
    if (node?.type === 'input' && config.inputFields.length === 0) {
      toast.error('Input node must have at least one input field')
      return
    }

    if (node?.type === 'condition' && config.conditions.length === 0) {
      toast.error('Condition node must have at least one condition')
      return
    }

    // AI Requirements based on node type
    if (node?.type === 'process') {
      // Process nodes REQUIRE AI
      if (!config.aiEnabled || config.selectedModels.length === 0) {
        toast.error('Process nodes require AI to be enabled with at least one model selected')
        return
      }
    } else {
      // Condition and Output nodes have optional AI, but if enabled, need models
      if (config.aiEnabled && config.selectedModels.length === 0) {
        toast.error('At least one AI model must be selected when AI is enabled')
        return
      }
    }

    // For input nodes, include test input values and basic input values in the saved config
    if (node?.type === 'input') {
      const configWithInputValues = {
        ...config,
        testInputEnabled: testInputEnabled,
        testInputValues: testInputValues,
        inputValues: inputValues
      }
      console.log('💾 Saving input node with input values:')
      console.log('  - Test input enabled:', testInputEnabled)
      console.log('  - Test input values:', testInputValues)
      console.log('  - Basic input values:', inputValues)
      console.log('  - Config keys:', Object.keys(configWithInputValues))
      onSave(configWithInputValues)
    } else {
      onSave(config)
    }
    
    // If editing a Node Palette node, also save to database
    if (node?.source === 'database' || node?.masterCategory) {
      try {
        const updateData = {
          configuration: {
            systemPrompt: config.systemPrompt,
            userPrompt: config.userPrompt,
            negativePrompt: config.negativePrompt,
            processingInstructions: config.processingInstructions || config.inputInstructions,
            outputFormat: config.outputFormat,
            errorHandling: config.errorHandling,
            conflictResolution: config.conflictResolution,
            qualityValidation: config.qualityValidation,
            inputFields: config.inputFields || [],
            maxTokens: config.maxTokens,
            temperature: config.temperature
          },
          updated_at: new Date().toISOString()
        }
        
        const { error } = await supabase
          .from('node_palettes')
          .update(updateData)
          .eq('node_id', node.id || node.node_id)
        
        if (error) throw error
        toast.success('Node Palette updated in database!')
        
      } catch (error) {
        console.error('❌ Failed to save to database:', error)
        toast.error('Failed to sync to database')
      }
    }
  }

  const addInputField = () => {
    setConfig({
      ...config,
      inputFields: [
        ...config.inputFields,
        { 
          id: Date.now(), 
          name: '', 
          type: 'text', 
          required: true, 
          options: [],
          variable: '',
          description: ''
        }
      ]
    })
  }

  const updateInputField = (index, field) => {
    const updatedFields = [...config.inputFields]
    updatedFields[index] = { ...updatedFields[index], ...field }
    setConfig({ ...config, inputFields: updatedFields })
    
    // Auto-sync new fields to Test Input
    if (field.variable && !testInputValues[field.variable]) {
      const fieldName = field.variable || field.name
      let defaultValue = ''
      
      if (field.type === 'select' && getFieldOptions(field)?.length > 0) {
        const options = getFieldOptions(field)
        if (field.multiple) {
          defaultValue = options.slice(0, 2).map(opt => typeof opt === 'string' ? opt : opt.value)
        } else {
          defaultValue = typeof options[0] === 'string' ? options[0] : options[0]?.value || ''
        }
      } else if (field.type === 'checkbox') {
        defaultValue = field.required || false
      } else if (field.type === 'textarea') {
        defaultValue = field.placeholder || `Enter ${field.name || fieldName}`
      } else if (field.type === 'text') {
        defaultValue = field.placeholder || `Enter ${field.name || fieldName}`
      } else if (field.type === 'number') {
        defaultValue = field.min || 1000
      }
      
      setTestInputValues(prev => ({
        ...prev,
        [fieldName]: defaultValue
      }))
    }
  }

  const removeInputField = (index) => {
    setConfig({
      ...config,
      inputFields: config.inputFields.filter((_, i) => i !== index)
    })
  }

  // Condition management
  const addCondition = () => {
    setConfig({
      ...config,
      conditions: [
        ...config.conditions,
        {
          id: Date.now(),
          field: '',
          operator: 'equals',
          value: '',
          action: '',
          description: ''
        }
      ]
    })
  }

  const updateCondition = (index, condition) => {
    const updatedConditions = [...config.conditions]
    updatedConditions[index] = { ...updatedConditions[index], ...condition }
    setConfig({ ...config, conditions: updatedConditions })
  }

  const removeCondition = (index) => {
    setConfig({
      ...config,
      conditions: config.conditions.filter((_, i) => i !== index)
    })
  }

  // Variable management functions
  const toggleVariable = (variable) => {
    const isAlreadyUsed = config.inputFields.some(field => field.variable === variable.variable)
    
    if (isAlreadyUsed) {
      // Remove variable
      setConfig({
        ...config,
        inputFields: config.inputFields.filter(field => field.variable !== variable.variable)
      })
    } else {
      // Add variable with default required setting
      setConfig({
        ...config,
        inputFields: [...config.inputFields, { ...variable, required: true }]
      })
    }
  }

  const toggleFieldRequired = (index) => {
    const newFields = [...config.inputFields]
    newFields[index].required = !newFields[index].required
    
    setConfig({
      ...config,
      inputFields: newFields
    })
  }

  const moveVariable = (fromIndex, toIndex) => {
    const newFields = [...config.inputFields]
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
    }
    setDraggedIndex(null)
  }

  // Filter variables based on search - with error handling
      const filteredVariables = React.useMemo(() => {
    try {
      const allVariables = getUltimateFormVariables()
      if (!Array.isArray(allVariables)) {
        console.error('getUltimateFormVariables() did not return an array:', allVariables)
        return []
      }
      return allVariables.filter(variable => 
        variable && variable.name && 
        variable.name.toLowerCase().includes(variableSearch.toLowerCase())
      )
    } catch (error) {
      console.error('Error in getFormVariables:', error)
      return []
    }
  }, [variableSearch])

  // Add condition templates for easier setup
  const addConditionTemplate = (templateType) => {
    let template = {}
    
    switch (templateType) {
      case 'ai_validation':
        template = {
          id: Date.now(),
          field: 'ai_evaluation_result',
          operator: 'ai_evaluate',
          value: 'validation_passed',
          description: 'AI Strategy Validation',
          trueAction: 'validation_passed',
          falseAction: 'validation_failed'
        }
        break
      case 'content_check':
        template = {
          id: Date.now(),
          field: 'content_completeness',
          operator: 'equals',
          value: 'complete',
          description: 'Content Completeness Check',
          trueAction: 'content_complete',
          falseAction: 'content_incomplete'
        }
        break
      case 'user_preference':
        template = {
          id: Date.now(),
          field: 'user_preference',
          operator: 'equals',
          value: 'advanced',
          description: 'User Preference Check',
          trueAction: 'advanced_route',
          falseAction: 'basic_route'
        }
        break
      case 'custom':
        template = {
          id: Date.now(),
          field: '',
          operator: 'equals',
          value: '',
          description: 'Custom Condition',
          trueAction: '',
          falseAction: ''
        }
        break
    }
    
    setConfig({
      ...config,
      conditions: [
        ...(config.conditions || []),
        template
      ]
    })
  }

  if (!isOpen) return null

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: Settings },
    { id: 'instructions', label: 'Instructions', icon: FileText },
    { id: 'ai', label: 'AI Integration', icon: Brain },
    ...(node?.type !== 'input' ? [{ id: 'advanced', label: 'Advanced', icon: Zap }] : []),
    { id: 'variables', label: 'Variables', icon: FileText },
    { id: 'test', label: 'Test Input', icon: RefreshCw },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="superadmin-theme rounded-2xl border border-subtle p-4 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto" style={{ background: 'var(--bg-surface)', boxShadow: 'var(--shadow-soft)' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/20 rounded-lg">
              {node?.type === 'input' && <FileText className="w-5 h-5 text-blue-400" />}
              {node?.type === 'process' && <Brain className="w-5 h-5 text-green-400" />}
              {node?.type === 'condition' && <GitBranch className="w-5 h-5 text-yellow-400" />}
              {node?.type === 'output' && <CheckCircle className="w-5 h-5 text-purple-400" />}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {node?.name || node?.data?.label || node?.data?.name || 'Unnamed'} ({node?.type?.charAt(0).toUpperCase() + node?.type?.slice(1)} Node) Configuration
              </h2>
              <p className="text-xs text-gray-400">Configure node properties and behavior</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onDelete}
              className="text-red-400 hover:text-red-300 transition-colors p-2 hover:bg-red-500/10 rounded-lg"
              title="Delete Node"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        {/* Tabs */}
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
                aria-pressed={activeTab === tab.id}
              >
                <Icon className="w-3 h-3" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="space-y-6 max-h-96 overflow-y-auto">
          {/* Basic Info Tab */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Node Label</label>
                <input
                  type="text"
                  value={config.label || ''}
                  onChange={(e) => setConfig({ ...config, label: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                  placeholder="Enter node label"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Description</label>
                <textarea
                  value={config.description || ''}
                  onChange={(e) => setConfig({ ...config, description: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 h-20"
                  placeholder="Enter node description"
                />
              </div>

              {/* Input Fields Configuration */}
              {config.inputFields && config.inputFields.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Field Requirements</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {config.inputFields.map((field, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-700/50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <code className="bg-gray-600 px-2 py-1 rounded text-gray-200 text-sm">
                            {`{${field.variable}}`}
                          </code>
                          <span className="text-gray-300 text-sm">
                            {(() => {
                                try {
                          const variables = getUltimateFormVariables()
                                  return variables.find(v => v.variable === field.variable)?.name || field.name
                                } catch (error) {
                                  console.error('Error finding variable:', error)
                                  return field.name
                                }
                              })()}
                          </span>
                        </div>
                        <button
                          onClick={() => toggleFieldRequired(index)}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                            field.required
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                          }`}
                        >
                          {field.required ? 'Required' : 'Optional'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Fields Form for Input Nodes */}
              {node?.type === 'input' && config.inputFields && config.inputFields.length > 0 && (
                <div className="space-y-4 mt-6">
                  <h4 className="text-md font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Input Form ({config.inputFields.length} fields)
                  </h4>
                  <div className="w-full h-px" style={{ background: 'var(--border-subtle)' }} />
                  <div className="grid grid-cols-1 gap-4">
                    {config.inputFields.map((field, index) => {
                      const variableData = (() => {
                        try {
                          const variables = getUltimateFormVariables()
                          const found = variables.find(v => v.variable === field.variable)
                          if (!found) {
                            console.log('🔍 Variable not found:', field.variable, 'Available:', variables.map(v => v.variable))
                            // Fallback: create proper name from variable
                            return {
                              name: field.variable.split('_').map(word => 
                                word.charAt(0).toUpperCase() + word.slice(1)
                              ).join(' '),
                              placeholder: field.placeholder,
                              options: field.options || []
                            }
                          }
                          return found
                        } catch (error) {
                          console.error('Error finding variable data:', error)
                          return {
                            name: field.variable.split('_').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' '),
                            placeholder: field.placeholder,
                            options: field.options || []
                          }
                        }
                      })();
                      
                      return (
                        <div key={index} className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                          {variableData?.name || (field.variable ? field.variable.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : (field.name ? field.name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Field'))}
                          {field.required && <span className="text-red-400 ml-1">*</span>}
                        </label>
                          
                          {field.type === 'text' && (
                            <input
                              type="text"
                              value={inputValues[field.variable] || ''}
                              onChange={(e) => setInputValues({
                                ...inputValues, 
                                [field.variable]: e.target.value
                              })}
                              placeholder={variableData?.placeholder || field.placeholder || `Enter ${variableData?.name || (field.variable ? field.variable.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : (field.name ? field.name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'value'))}`}
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                            />
                          )}
                          
                          {field.type === 'textarea' && (
                            <textarea
                              value={inputValues[field.variable] || ''}
                              onChange={(e) => setInputValues({
                                ...inputValues, 
                                [field.variable]: e.target.value
                              })}
                              placeholder={variableData?.placeholder || field.placeholder || `Enter ${variableData?.name || (field.variable ? field.variable.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : (field.name ? field.name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'value'))}`}
                              rows={field.rows || 3}
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                            />
                          )}
                          
                          {field.type === 'select' && (
                            <select
                              value={inputValues[field.variable] || ''}
                              onChange={(e) => setInputValues({
                                ...inputValues, 
                                [field.variable]: e.target.value
                              })}
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                            >
                              <option value="">Select {variableData?.name || (field.variable ? field.variable.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : (field.name ? field.name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Option'))}</option>
                              {getFieldOptions(field)?.map((option, optIndex) => {
                                const optionValue = typeof option === 'string' ? option : (option.value || option.id);
                                const optionLabel = typeof option === 'string' 
                                  ? option.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                                  : (option.label || option.name || (option.value ? option.value.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : option.id || option));
                                
                                return (
                                  <option key={optIndex} value={optionValue}>
                                    {optionLabel}
                                  </option>
                                );
                              })}
                            </select>
                          )}
                          
                          {field.type === 'number' && (
                            <input
                              type="number"
                              value={inputValues[field.variable] || ''}
                              onChange={(e) => setInputValues({
                                ...inputValues, 
                                [field.variable]: e.target.value
                              })}
                              placeholder={variableData?.placeholder || field.placeholder || `Enter ${variableData?.name || (field.variable ? field.variable.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : (field.name ? field.name.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'value'))}`}
                              min={field.min || 0}
                              max={field.max || 1000000}
                              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400"
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}


              {/* Enhanced Conditions for Condition Nodes */}
              {node?.type === 'condition' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-white">Smart Condition Logic</h3>
                    <button
                      onClick={addCondition}
                      className="flex items-center gap-2 px-3 py-1 bg-primary rounded-lg text-white text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Condition
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {config.conditions?.map((condition, index) => (
                      <div key={condition.id} className="bg-gray-700/30 border border-gray-600 rounded-lg p-5 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-md font-medium text-white flex items-center gap-2">
                            <GitBranch className="w-4 h-4 text-yellow-400" />
                            Condition {index + 1}
                          </h4>
                          <button
                            onClick={() => removeCondition(index)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs text-gray-300 mb-1">Field/Variable</label>
                            <input
                              type="text"
                              value={condition.field}
                              onChange={(e) => updateCondition(index, { field: e.target.value })}
                              className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-sm text-white"
                              placeholder="user_wants_images"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-300 mb-1">Operator</label>
                            <select
                              value={condition.operator}
                              onChange={(e) => updateCondition(index, { operator: e.target.value })}
                              className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-sm text-white"
                            >
                              <option value="equals">Equals</option>
                              <option value="not_equals">Not Equals</option>
                              <option value="contains">Contains</option>
                              <option value="greater_than">Greater Than</option>
                              <option value="less_than">Less Than</option>
                              <option value="exists">Exists</option>
                              <option value="ai_evaluate">AI Evaluate</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-300 mb-1">Value</label>
                            <input
                              type="text"
                              value={condition.value}
                              onChange={(e) => updateCondition(index, { value: e.target.value })}
                              className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-sm text-white"
                              placeholder="true, false, contains text"
                            />
                          </div>
                        </div>

                        {/* TRUE Action Section */}
                        <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <h5 className="font-medium text-green-400">When TRUE (Yes)</h5>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs text-gray-300 mb-1">Action Type</label>
                              <select
                                value={condition.trueAction?.type || 'continue'}
                                onChange={(e) => updateCondition(index, { 
                                  trueAction: { ...condition.trueAction, type: e.target.value }
                                })}
                                className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-sm text-white"
                              >
                                <option value="continue">Continue to Next Node</option>
                                <option value="skip_to">Skip to Specific Node</option>
                                <option value="generate_image">Generate Image</option>
                                <option value="generate_content">Generate Additional Content</option>
                                <option value="enhance_content">Enhance Existing Content</option>
                                <option value="research">Perform Research</option>
                              </select>
                            </div>

                            {condition.trueAction?.type === 'generate_image' && (
                              <div>
                                <label className="block text-xs text-gray-300 mb-1">Image Generation Prompt</label>
                                <textarea
                                  value={condition.trueAction?.prompt || 'Create a stunning, professional book cover image that captures the essence of this book. Style: modern, visually striking, genre-appropriate. Include the book title prominently in an elegant, readable font. Use colors and imagery that reflect the book\'s tone, theme, and target audience. Ensure high visual impact and commercial appeal. Resolution: 1600x2400px for optimal print and digital quality.'}
                                  onChange={(e) => updateCondition(index, { 
                                    trueAction: { ...condition.trueAction, prompt: e.target.value }
                                  })}
                                  rows={4}
                                  className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-sm text-white"
                                  placeholder="Professional image generation prompt..."
                                />
                              </div>
                            )}

                            {condition.trueAction?.type === 'generate_content' && (
                              <div>
                                <label className="block text-xs text-gray-300 mb-1">Content Generation Prompt</label>
                                <textarea
                                  value={condition.trueAction?.prompt || 'Generate high-quality, engaging content that seamlessly integrates with the existing narrative. Maintain perfect consistency with the established tone, writing style, character development, and thematic elements. Ensure the content adds meaningful value, advances the plot or information flow, and meets professional publishing standards. Word count should be appropriate for the context and purpose within the overall work.'}
                                  onChange={(e) => updateCondition(index, { 
                                    trueAction: { ...condition.trueAction, prompt: e.target.value }
                                  })}
                                  rows={4}
                                  className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-sm text-white"
                                  placeholder="Professional content generation prompt..."
                                />
                              </div>
                            )}

                            <div>
                              <label className="block text-xs text-gray-300 mb-1">AI Instructions for TRUE Path</label>
                              <textarea
                                value={condition.trueAction?.instructions || 'Execute this action with precision and excellence. When the condition evaluates to TRUE, proceed with full confidence and attention to detail. Ensure all outputs meet the highest professional standards, maintain consistency with the overall project goals, and deliver exceptional quality that exceeds user expectations. Focus on creating value and advancing the workflow objectives effectively.'}
                                onChange={(e) => updateCondition(index, { 
                                  trueAction: { ...condition.trueAction, instructions: e.target.value }
                                })}
                                rows={3}
                                className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-sm text-white"
                                placeholder="Professional instructions for TRUE scenario..."
                              />
                            </div>
                          </div>
                        </div>

                        {/* FALSE Action Section */}
                        <div className="bg-red-900/20 border border-red-600/30 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <h5 className="font-medium text-red-400">When FALSE (No)</h5>
                          </div>
                          
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs text-gray-300 mb-1">Action Type</label>
                              <select
                                value={condition.falseAction?.type || 'skip_to_output'}
                                onChange={(e) => updateCondition(index, { 
                                  falseAction: { ...condition.falseAction, type: e.target.value }
                                })}
                                className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-sm text-white"
                              >
                                <option value="skip_to_output">Skip to Final Output</option>
                                <option value="alternative_path">Take Alternative Path</option>
                                <option value="use_fallback">Use Fallback Content</option>
                                <option value="prompt_user">Request User Input</option>
                                <option value="retry_modified">Retry with Modifications</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs text-gray-300 mb-1">AI Instructions for FALSE Path</label>
                              <textarea
                                value={condition.falseAction?.instructions || 'Handle this alternative path gracefully and professionally. When the condition evaluates to FALSE, ensure the workflow continues smoothly without compromising quality or user experience. Implement appropriate fallback strategies, maintain consistency with project objectives, and deliver valuable results even when taking the alternative route. Focus on creating a seamless, high-quality experience regardless of the path taken.'}
                                onChange={(e) => updateCondition(index, { 
                                  falseAction: { ...condition.falseAction, instructions: e.target.value }
                                })}
                                rows={3}
                                className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-sm text-white"
                                placeholder="Professional instructions for FALSE scenario..."
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview Node Configuration */}
              {node?.type === 'preview' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-white">Preview Configuration</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Eye className="w-4 h-4" />
                      <span>Customer Approval Required</span>
                    </div>
                  </div>
                  
                  {/* Max Attempts */}
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Maximum Attempts
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={config.maxAttempts || 3}
                        onChange={(e) => setConfig(prev => ({ ...prev, maxAttempts: parseInt(e.target.value) || 3 }))}
                        className="w-20 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                      <span className="text-gray-400 text-sm">
                        {config.maxAttempts === 1 ? 'Single attempt only' : 
                         config.maxAttempts >= 10 ? 'Unlimited attempts' : 
                         `${config.maxAttempts} attempts maximum`}
                      </span>
                    </div>
                  </div>

                  {/* Preview Length */}
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Preview Length
                    </label>
                    <select
                      value={config.previewLength || '1 chapter'}
                      onChange={(e) => setConfig(prev => ({ ...prev, previewLength: e.target.value }))}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    >
                      <option value="1 page">1 page</option>
                      <option value="2 pages">2 pages</option>
                      <option value="1 chapter">1 chapter</option>
                      <option value="2 chapters">2 chapters</option>
                      <option value="500 words">500 words</option>
                      <option value="1000 words">1000 words</option>
                      <option value="custom">Custom length</option>
                    </select>
                  </div>

                  {/* Custom Length Input */}
                  {config.previewLength === 'custom' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Custom Preview Length
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., 3 pages, 1500 words, half chapter"
                        value={config.customPreviewLength || ''}
                        onChange={(e) => setConfig(prev => ({ ...prev, customPreviewLength: e.target.value }))}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  )}

                  {/* Approval Settings */}
                  <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-cyan-400" />
                      <h4 className="font-medium text-white">Approval Workflow</h4>
                    </div>
                    <div className="space-y-2 text-sm text-gray-300">
                      <p>• Customer reviews generated preview content</p>
                      <p>• Can approve to continue or reject with feedback</p>
                      <p>• Rejection triggers regeneration with customer input</p>
                      <p>• Workflow continues after approval or max attempts reached</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Connected Nodes Display for Condition Nodes */}
              {node?.type === 'condition' && config.connectedNodes?.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Connected Nodes</label>
                  <div className="space-y-2">
                    {config.connectedNodes.map((connectedNode) => (
                      <div key={connectedNode.id} className="bg-gray-700/50 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${
                            connectedNode.type === 'input' ? 'bg-blue-400' :
                            connectedNode.type === 'process' ? 'bg-green-400' :
                            connectedNode.type === 'condition' ? 'bg-yellow-400' :
                            connectedNode.type === 'preview' ? 'bg-cyan-400' : 'bg-purple-400'
                          }`} />
                          <span className="text-white font-medium">{connectedNode.label}</span>
                          <span className="text-gray-400 text-sm">({connectedNode.type})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Instructions Tab */}
          {activeTab === 'instructions' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Node Instructions</label>
                <textarea
                  value={config.inputInstructions || getNodeInstructions(node?.type, node?.role || node?.data?.role)}
                  onChange={(e) => setConfig({ ...config, inputInstructions: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 h-32"
                  placeholder="Technical processing instructions for workflow execution..."
                />
                <p className="text-xs text-gray-400 mt-2">
                  Technical instructions for workflow engine on how to process this node's data and execute its function
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Expert System Prompt</label>
                <textarea
                  value={config.systemPrompt || getNodeConfiguration(node?.type, node?.role || node?.data?.role)?.systemPrompt || ''}
                  onChange={(e) => setConfig({ ...config, systemPrompt: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 h-32"
                  placeholder="System prompt for AI model..."
                />
                <p className="text-xs text-gray-400 mt-2">
                  System-level prompt that defines the AI's role and behavior
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">User Prompt Template</label>
                <textarea
                  value={(config.userPrompt && config.userPrompt.trim().length > 0)
                    ? config.userPrompt
                    : (getNodeConfiguration(node?.type, node?.role || node?.data?.role)?.userPrompt || '')}
                  onChange={(e) => setConfig({ ...config, userPrompt: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 h-32"
                  placeholder="Professional user prompt template with dynamic variables..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-2">Negative Prompt (Restrictions)</label>
                <textarea
                  value={(config.negativePrompt && String(config.negativePrompt).trim().length > 0)
                    ? config.negativePrompt
                    : (getNodeConfiguration(node?.type, node?.role || node?.data?.role)?.negativePrompt || '')}
                  onChange={(e) => setConfig({ ...config, negativePrompt: e.target.value })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 h-24"
                  placeholder="Explicitly tell AI what NOT to do or include..."
                />
                <p className="text-xs text-gray-400 mt-2">
                  Clear restrictions and forbidden behaviors to ensure AI stays within defined boundaries
                </p>
              </div>


            </div>
          )}

          {/* AI Integration Tab */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              {/* AI Enable Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-white">AI Integration</h3>
                  <p className="text-sm text-gray-400">
                    {node?.type === 'process' 
                      ? 'AI is required for process nodes - configure models and processing'
                      : 'Configure AI models and processing (optional for this node type)'
                    }
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.aiEnabled}
                    onChange={(e) => setConfig({ ...config, aiEnabled: e.target.checked })}
                    disabled={node?.type === 'process'} // Process nodes require AI
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {config.aiEnabled && (
                <>
                  {/* AI Provider Selection */}
                  <div className="space-y-4">
                    <h4 className="text-md font-medium text-white">Add AI Models</h4>
                    
                    {/* Provider Dropdown */}
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">Select Provider</label>
                      <select
                        value={selectedProvider}
                        onChange={(e) => {
                          const provider = availableProviders.find(p => p.name === e.target.value)
                          if (provider) handleProviderSelect(provider)
                        }}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                      >
                        <option value="">Choose AI Provider</option>
                        {availableProviders.map((provider) => (
                          <option key={provider.id} value={provider.name}>
                            {provider.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Model Selection */}
                    {selectedProvider && availableModels[selectedProvider] && (
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Available Models</label>
                        <div className="max-h-48 overflow-y-auto space-y-2">
                          {availableModels[selectedProvider].map((model) => (
                            <button
                              key={model.id}
                              onClick={() => addModel(selectedProvider, model)}
                              className="w-full text-left px-4 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-sm transition-colors border border-gray-500 hover:border-gray-400"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium">{model.name}</div>
                                  <div className="text-xs text-gray-300 mt-1">
                                    ${model.avgCostPerMillion}/M avg
                                  </div>
                                  {model.keyName && (
                                    <div className="text-xs text-blue-300 mt-1">API Key: {model.keyName}</div>
                                  )}
                                </div>
                                <div className="text-primary text-lg font-bold">+</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Selected Models */}
                    {config.selectedModels.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-200 mb-2">Selected Models</label>
                        <div className="space-y-2">
                          {config.selectedModels.map((modelKey) => (
                            <div key={modelKey} className="flex items-center justify-between bg-gray-700/50 rounded-lg p-3">
                              <span className="text-white font-medium">{modelKey}</span>
                              <button
                                onClick={() => removeModel(modelKey)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* AI Parameters */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Temperature ({config.temperature})
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={config.temperature || 0.7}
                        onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                        className="w-full"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">Max Tokens</label>
                      <input
                        type="number"
                        value={config.maxTokens || 2000}
                        onChange={(e) => setConfig({ ...config, maxTokens: parseInt(e.target.value) })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                        min="100"
                        max="8000"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}


          {/* Advanced Tab */}
          {activeTab === 'advanced' && (
            <div className="space-y-6">
              {/* Output Format Section */}
              {node?.type === 'output' && (
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Output Configuration</h4>
                  <div className="w-full h-px" style={{ background: 'var(--border-subtle)' }} />
                  <div>
                    <label className="block text-sm font-medium text-gray-200 mb-3">Output Formats (Multiple Selection)</label>
                    <div className="grid grid-cols-2 gap-3">
                      {ULTIMATE_OPTIONS.output_formats.map((opt) => {
                        const format = {
                          value: opt.value,
                          label: opt.label,
                          icon: ['mp3','wav','m4a','audiobook'].includes(opt.value) ? '🎧' : '📄',
                          isAudio: ['mp3','wav','m4a','audiobook'].includes(opt.value)
                        }
                        const isSelected = (config.outputFormats || []).includes(format.value)
                        return (
                          <div
                            key={format.value}
                            onClick={() => {
                              const currentFormats = config.outputFormats || []
                              const newFormats = isSelected 
                                ? currentFormats.filter(f => f !== format.value)
                                : [...currentFormats, format.value]
                              
                              setConfig({ 
                                ...config, 
                                outputFormats: newFormats,
                                outputFormat: newFormats[0] || 'text' // Keep single format for backward compatibility
                              })
                            }}
                            className={`
                              cursor-pointer rounded-xl p-4 border-2 transition-all duration-300 hover:scale-105
                              ${isSelected 
                                ? 'border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/20' 
                                : 'border-gray-600 bg-gray-700/50 hover:border-gray-500'
                              }
                            `}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-2xl">{format.icon}</span>
                              {isSelected && (
                                <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <div className="text-sm font-medium text-white">{format.label}</div>
                            {format.isAudio && (
                              <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white role-gradient-output">AUDIO</div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    <p className="text-xs text-gray-400 mt-3">
                      Select multiple formats to generate your book in different output types simultaneously
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-sm font-medium text-gray-200">Generate Cover</label>
                      <p className="text-xs text-gray-400">Automatically generate book cover</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={config.generateCover}
                        onChange={(e) => setConfig({ ...config, generateCover: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              )}

              {/* Customer Input Fields - Only show for Framework flows */}
              
              {/* ADVANCED CONFIGURATION FIELDS - For all node types */}
              <div className="space-y-4 mt-8">
                <h4 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Advanced Node Configuration</h4>
                <div className="w-full h-px" style={{ background: 'var(--border-subtle)' }} />
                
                {/* Error Handling Configuration */}
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Error Handling Protocol</label>
                  <textarea
                    value={config.errorHandling || node?.configuration?.errorHandling || getNodeConfiguration(node?.type, node?.role || node?.data?.role)?.errorHandling || ''}
                    onChange={(e) => setConfig({ ...config, errorHandling: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 h-24"
                    placeholder="Professional error reporting with specific error codes and actionable messages..."
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    How this node handles errors and what error messages it provides for debugging
                  </p>
                </div>
                
                {/* Conflict Resolution Configuration */}
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Conflict Resolution Strategy</label>
                  <textarea
                    value={config.conflictResolution || node?.configuration?.conflictResolution || getNodeConfiguration(node?.type, node?.role || node?.data?.role)?.conflictResolution || ''}
                    onChange={(e) => setConfig({ ...config, conflictResolution: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 h-24"
                    placeholder="How to resolve contradictory data and maintain quality..."
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Strategy for handling contradictory inputs while maintaining content integrity
                  </p>
                </div>
                
                {/* Quality Validation Configuration */}
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">Quality Validation Standards</label>
                  <textarea
                    value={config.qualityValidation || node?.configuration?.qualityValidation || getNodeConfiguration(node?.type, node?.role || node?.data?.role)?.qualityValidation || ''}
                    onChange={(e) => setConfig({ ...config, qualityValidation: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 h-24"
                    placeholder="Quality standards and validation criteria..."
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Quality standards this node must meet before outputting results
                  </p>
                </div>
                
                {/* Output Format Configuration */}
                <div>
                  <label className="block text-sm font-medium text-gray-200 mb-2">JSON Output Format Structure</label>
                  <textarea
                    value={config.outputFormat || node?.configuration?.outputFormat || getNodeConfiguration(node?.type, node?.role || node?.data?.role)?.outputFormat || ''}
                    onChange={(e) => setConfig({ ...config, outputFormat: e.target.value })}
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white placeholder-gray-400 h-32"
                    placeholder="Exact JSON structure for next node input..."
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Precise JSON format that this node outputs for seamless next-node processing
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Variables Tab */}
          {activeTab === 'variables' && node?.type === 'input' && (
            <div className="space-y-6">
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <h3 className="text-lg font-semibold text-purple-200">Dynamic Variable Tokens</h3>
                </div>
                <p className="text-sm text-purple-300 mb-4">
                  Search and click variables to add/remove them. Drag variables in the right column to reorder them.
                </p>
                
                {/* Search Bar */}
                <div className="mb-4">
                  <input
                    type="text"
                    placeholder="Search variables..."
                    value={variableSearch}
                    onChange={(e) => setVariableSearch(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Available Variables */}
                  <div className="space-y-3">
                  <h4 className="text-md font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Available Variables ({filteredVariables.length})
                    </h4>
                    <div className="w-full h-px" style={{ background: 'var(--border-subtle)' }} />
                    <div className="space-y-2 text-sm max-h-96 overflow-y-auto">
                      {filteredVariables.map((variable, index) => {
                        const isAlreadyUsed = config.inputFields.some(field => 
                          field.variable === variable.variable || field.name === variable.variable
                        )
                        
                        return (
                          <div 
                            key={index}
                            className={`flex justify-between items-center p-2 rounded cursor-pointer transition-all ${
                              isAlreadyUsed 
                                ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed' 
                                : 'bg-purple-800/30 hover:bg-purple-700/50 text-purple-200 hover:text-white'
                            }`}
                            onClick={() => !isAlreadyUsed && toggleVariable(variable)}
                          >
                            <code className="bg-purple-800/50 px-2 py-1 rounded text-purple-200">
                              {`{${variable.variable}}`}
                            </code>
                            <span className="text-purple-300">{variable.name}</span>
                            {isAlreadyUsed && (
                              <span className="text-xs text-gray-500 ml-2">✓ Used</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Currently Used Variables */}
                  <div className="space-y-3">
                  <h4 className="text-md font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Currently Used Variables ({config.inputFields.length})
                    </h4>
                    <div className="w-full h-px" style={{ background: 'var(--border-subtle)' }} />
                    <div className="space-y-2 text-sm max-h-96 overflow-y-auto">
                      {config.inputFields.map((field, index) => (
                        <div 
                          key={index} 
                          className={`flex justify-between items-center p-2 rounded cursor-pointer transition-all ${
                            draggedIndex === index ? 'bg-green-600/50' : 'bg-green-800/30 hover:bg-green-700/40'
                          } text-green-200`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, index)}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, index)}
                          onClick={() => toggleVariable(field)}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-green-400 cursor-move">⋮⋮</span>
                            <code className="bg-green-800/50 px-2 py-1 rounded text-green-200">
                              {`{${field.variable}}`}
                            </code>
                            <span className="text-green-300">
                              {(() => {
                                try {
                                  const variables = getUltimateFormVariables()
                                  return variables.find(v => v.variable === field.variable)?.name || field.name
                                } catch (error) {
                                  console.error('Error finding variable:', error)
                                  return field.name
                                }
                              })()}
                            </span>
                          </div>
                          <span className="text-xs text-green-500">✓ Active</span>
                        </div>
                      ))}
                      {config.inputFields.length === 0 && (
                        <div className="text-center text-gray-400 py-4">
                          No variables added yet. Click on variables from the left to add them.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-purple-800/20 rounded-lg">
                  <h4 className="text-md font-semibold text-purple-200 mb-2">Usage Example</h4>
                  <p className="text-sm text-purple-300 mb-2">
                    Use these tokens in your AI prompts like this:
                  </p>
                  <code className="block bg-purple-900/50 p-3 rounded text-purple-200 text-sm">
                    Generate a {'{word_count}'}-word book titled "{'{book_title}'}" for {'{target_audience}'} in {'{tone}'} tone, focusing on {'{topic}'} with {'{chapter_count}'} chapters.
                  </code>
                </div>
              </div>
            </div>
          )}

          {/* Test Input Tab - Replaced with DFY Presets for the flow */}
          {activeTab === 'test' && node?.type === 'input' && (
            <div className="space-y-6">
              <div className="rounded-lg p-4 border border-subtle" style={{ background: 'var(--bg-surface-hover)' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-blue-400">Test with DFY Presets</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Use Custom Input:</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={testInputEnabled}
                        onChange={(e) => setTestInputEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                    </label>
                    <button
                      onClick={syncBasicInputWithTestInput}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded-lg text-sm transition-all duration-300 flex items-center space-x-1"
                      title="Sync Test Input with Basic Input"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Sync</span>
                    </button>
                  </div>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Select a preset below to instantly populate test inputs. Applying a preset will enable Custom Input.
                </p>
              </div>

              {/* Presets List */}
              <div className="space-y-3">
                {presetsLoading && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3" aria-busy="true">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className="p-4 rounded-lg border border-subtle bg-gray-800/40 animate-pulse h-24" />
                    ))}
                  </div>
                )}

                {!presetsLoading && presets.length === 0 && (
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    No presets found for this flow.
                  </div>
                )}

                {!presetsLoading && presets.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {presets.map((preset) => (
                      <div key={preset.id} className="p-4 rounded-lg border border-subtle bg-surface hover:bg-surface-hover transition hoverLift">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{preset.name}</div>
                            {preset.description && (
                              <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{preset.description}</div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                const preview = inputSetService.buildPreview(config.inputFields || [], preset.variables)
                                if (!preview.length) {
                                  toast('No matching variables in this preset', { icon: 'ℹ️' })
                                  return
                                }
                                const lines = preview.map(p => `${p.label}: ${p.value}`).join('\n')
                                toast(lines, { duration: 4000 })
                              }}
                              className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded"
                            >Preview</button>
                            <button
                              onClick={() => {
                                try {
                                  const merged = inputSetService.applyPreset({ preset, inputFields: config.inputFields || [], currentValues: testInputValues })
                                  setTestInputValues(merged)
                                  if (!testInputEnabled) setTestInputEnabled(true)
                                  toast.success('Preset applied to Test Input')
                                } catch (e) {
                                  console.error('Apply preset error:', e)
                                  toast.error('Failed to apply preset')
                                }
                              }}
                              className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded"
                            >Apply</button>
                            <button
                              onClick={() => {
                                setTestInputValues({})
                                toast('Cleared test input', { icon: '🧹' })
                              }}
                              className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded"
                            >Clear</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <h4 className="text-md font-semibold text-green-400">Save & Run</h4>
                  </div>
                  <p className="text-sm text-gray-300">
                    Click "Save Configuration" to save these test values to the node, then run the workflow.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          
          {/* Show different buttons for new nodes vs existing nodes */}
          {node?.isNewNode ? (
            <>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                Save to Flow Only
              </button>
              <button
                onClick={saveToPalette}
                className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Save to Palette
              </button>
            </>
          ) : (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Configuration
            </button>
          )}
        </div>
      </div>
    </div>
  )
    } catch (error) {
      handleError(error)
      return null
    }
  }

  // Error state UI
  if (hasError) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-red-900/90 border border-red-500/50 rounded-xl p-6 max-w-md">
          <h3 className="text-red-300 font-bold mb-2">Node Modal Error</h3>
          <p className="text-red-200 text-sm mb-4">
            {errorMessage || 'There was an error loading the node configuration. Please try again.'}
          </p>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setHasError(false)
                setErrorMessage('')
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Retry
            </button>
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Render main content
  return renderModalContent()
}

export default FlowNodeModal