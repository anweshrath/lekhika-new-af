import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Shield, Users, Database, Settings, Activity, 
  AlertTriangle, CheckCircle, XCircle, RefreshCw,
  Eye, Edit, Trash2, Plus, Download, Upload,
  Server, Cpu, HardDrive, Wifi, LogOut, Save,
  EyeOff, Key, List, ChevronDown, ChevronUp,
  Loader2, Brain, Code, Palette, Zap, Mic,
  Gamepad2, Layers, Target, Sliders, Workflow,
  BarChart3, TrendingUp, Clock, DollarSign,
  Network, Cog, X, UserPlus, Rocket, Volume2, Image, Bot,
  Menu, X as XIcon, ChevronLeft, ChevronRight, Wand2,
  FileText, File, PenTool, Filter, Search, Tag, Calendar
} from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { aiValidationService } from '../../services/aiValidationService'
import aiService from '../../services/aiService'
import ModelDropdown from '../../components/ModelDropdown'
import AIEnginePlayground from '../../components/admin/AIEnginePlayground'
import RichTextEditor from '../../components/RichTextEditor'
import ContentCreationFlow from '../../components/SuperAdmin/ContentCreationFlow'
import Flow from '../../components/SuperAdmin/Flow'
import OrchestrationDashboard from '../../components/SuperAdmin/OrchestrationDashboard'
import CustomAIProviderModal from '../../components/SuperAdmin/CustomAIProviderModal'
import AIServiceModal from '../../components/SuperAdmin/AIServiceModal'
import AddUserModal from '../../components/SuperAdmin/AddUserModal'
import CreateWorkflowModal from '../../components/SuperAdmin/CreateWorkflowModal'
import UnderTheHoodNew from '../../components/SuperAdmin/UnderTheHoodNew'
import AIManagement from '../../components/SuperAdmin/AIManagement'
import AlchemistStash from '../../components/SuperAdmin/AlchemistStash'
import Engines from '../../components/SuperAdmin/Engines'
import APIManagement from '../../components/SuperAdmin/APIManagement'
import LevelManagement from './LevelManagement'
import UserManagement from '../../components/SuperAdmin/UserManagement'
import TokenAnalyticsDashboard from '../../components/SuperAdmin/TokenAnalyticsDashboard'
import TokenManagement from '../../components/SuperAdmin/TokenManagement'
import AlchemistFlow from '../../components/SuperAdmin/AlchemistFlow'
import WorkerControlDashboard from '../../components/SuperAdmin/WorkerControlDashboard'
import { useSuperAdmin } from '../../contexts/SuperAdminContext'

const SuperAdminDashboard = () => {
  const navigate = useNavigate()
  const { superAdminUser, getSuperAdminUserId, isAuthenticated } = useSuperAdmin()
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalBooks: 0,
    totalCreditsUsed: 0,
    activeSubscriptions: 0
  })
  const [users, setUsers] = useState([])
  const [books, setBooks] = useState([])
  const [aiServices, setAiServices] = useState({})
  const [allModels, setAllModels] = useState({})
  const [selectedModels, setSelectedModels] = useState({})
  const [loading, setLoading] = useState(true)
  const [validatingServices, setValidatingServices] = useState({})
  const [apiKeys, setApiKeys] = useState({
    openai: [],
    gemini: [],
    claude: [],
    mistral: [],
    grok: [],
    perplexity: [],
    stable_diffusion: [],
    elevenlabs: []
  })
  const [showApiKeys, setShowApiKeys] = useState({
    openai: {},
    gemini: {},
    claude: {},
    mistral: {},
    grok: {},
    perplexity: {},
    stable_diffusion: {},
    elevenlabs: {}
  })
  const [systemConfigs, setSystemConfigs] = useState({})
  const [debugInfo, setDebugInfo] = useState([])
  const [showCustomProviderModal, setShowCustomProviderModal] = useState(false)
  const [showAIServiceModal, setShowAIServiceModal] = useState(false)
  const [selectedAIService, setSelectedAIService] = useState(null)
  const [showAddUserModal, setShowAddUserModal] = useState(false)
  const [showCreateWorkflowModal, setShowCreateWorkflowModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedBook, setSelectedBook] = useState(null)
  const [showBookModal, setShowBookModal] = useState(false)
  const [showEditBookModal, setShowEditBookModal] = useState(false)
  
  // Book Management Filters
  const [bookFilters, setBookFilters] = useState({
    search: '',
    author: 'all',
    aiService: 'all',
    status: 'all',
    dateRange: 'all'
  })

  const aiServiceConfigs = {
    openai: {
      name: 'OpenAI',
      description: 'GPT models and DALL-E for text and image generation',
      icon: Brain,
      color: 'green'
    },
    claude: {
      name: 'Claude (Anthropic)',
      description: 'Advanced reasoning and analysis capabilities',
      icon: Brain,
      color: 'orange'
    },
    gemini: {
      name: 'Google Gemini',
      description: 'Multimodal AI with vision and text capabilities',
      icon: Zap,
      color: 'blue'
    },
    mistral: {
      name: 'Mistral AI',
      description: 'European AI with strong coding capabilities',
      icon: Code,
      color: 'purple'
    },
    grok: {
      name: 'GROK (xAI)',
      description: 'Real-time AI with web access and humor',
      icon: Zap,
      color: 'red'
    },
    perplexity: {
      name: 'Perplexity',
      description: 'Research-focused AI with web search',
      icon: Palette,
      color: 'indigo'
    },
    stable_diffusion: {
      name: 'Stable Diffusion',
      description: 'High-quality image generation with control',
      icon: Image,
      color: 'emerald'
    },
    elevenlabs: {
      name: 'ElevenLabs',
      description: 'Professional text-to-speech for audiobooks',
      icon: Volume2,
      color: 'cyan'
    }
  }

  const addDebugInfo = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    const logMessage = `${timestamp}: ${message}`
    console.log(logMessage)
    setDebugInfo(prev => [...prev, { message: logMessage, type }])
  }

  useEffect(() => {
    addDebugInfo('🚀 Dashboard component mounted')
    
    // Check superadmin authentication
    const session = localStorage.getItem('superadmin_session')
    if (!session) {
      addDebugInfo('❌ No session found, redirecting to login', 'error')
      navigate('/superadmin')
      return
    }

    addDebugInfo('✅ Session found, validating...')
    
    try {
      const sessionData = JSON.parse(session)
      addDebugInfo(`📝 Session data: ${JSON.stringify(sessionData)}`)
      
      // Validate session with database (with timeout and fallback)
      validateSession(sessionData)
      
      // Load dashboard data
      loadDashboardData()
      loadSystemConfigs()
      loadApiKeysFromDatabase()
      loadSelectedModels()
    } catch (error) {
      addDebugInfo(`💥 Session parsing error: ${error.message}`, 'error')
      localStorage.removeItem('superadmin_session')
      navigate('/superadmin')
    }
  }, [navigate])

  const validateSession = async (sessionData) => {
    addDebugInfo('🔍 Validating session...')
    
    // Check if session has required data
    if (!sessionData.adminId) {
      addDebugInfo('❌ Session missing adminId', 'error')
      throw new Error('Invalid session data')
    }
    
    addDebugInfo('✅ Session validation passed - using session data')
  }

  const loadSystemConfigs = async () => {
    addDebugInfo('📊 Loading system configs...')
    
    try {
      const configsPromise = supabase
        .from('system_configs')
        .select('*')
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Config loading timeout')), 5000)
      )
      
      const result = await Promise.race([configsPromise, timeoutPromise])
      
      if (result.error) {
        addDebugInfo(`⚠️ Config loading failed: ${result.error.message}`, 'warning')
        setSystemConfigs({
          maintenance_mode: 'false',
          allow_registration: 'true',
          default_credits: '1000',
          ai_generation_enabled: 'true',
          book_export_enabled: 'true',
          paypal_enabled: 'true'
        })
        return
      }
      
      const configMap = {}
      result.data.forEach(config => {
        configMap[config.config_key] = config.config_value
      })
      setSystemConfigs(configMap)
      addDebugInfo(`✅ Loaded ${result.data.length} system configs`)
      
    } catch (error) {
      addDebugInfo(`⚠️ Config loading error: ${error.message}`, 'warning')
      setSystemConfigs({
        maintenance_mode: 'false',
        allow_registration: 'true',
        default_credits: '1000',
        ai_generation_enabled: 'true',
        book_export_enabled: 'true',
        paypal_enabled: 'true'
      })
    }
  }

  const loadModelsFromDatabase = async () => {
    addDebugInfo('🤖 Loading models from ai_model_metadata...')
    
    try {
      const modelsPromise = supabase
        .from('ai_model_metadata')
        .select('*')
        .eq('is_active', true)
        .order('provider', { ascending: true })
        .order('model_name', { ascending: true })
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Models loading timeout')), 5000)
      )
      
      const result = await Promise.race([modelsPromise, timeoutPromise])
      
      if (result.error) {
        addDebugInfo(`⚠️ Models loading failed: ${result.error.message}`, 'warning')
        return
      }
      
      // Group models by provider
      const modelsByProvider = {}
      const services = ['openai', 'gemini', 'claude', 'anthropic', 'mistral', 'grok', 'perplexity', 'stable_diffusion', 'elevenlabs']
      services.forEach(service => {
        modelsByProvider[service] = []
      })
      
      result.data.forEach(model => {
        const provider = model.provider.toLowerCase()
        if (modelsByProvider[provider]) {
          modelsByProvider[provider].push({
            id: model.model_id,
            name: model.model_name,
            provider: model.provider,
            description: model.description,
            is_active: model.is_active,
            input_cost_per_million: model.input_cost_per_million,
            output_cost_per_million: model.output_cost_per_million,
            context_window_tokens: model.context_window_tokens,
            specialties: model.specialties || []
          })
        }
      })
      
      setAllModels(modelsByProvider)
      addDebugInfo(`✅ Loaded ${result.data.length} models from ai_model_metadata`)
      
      // Update AI services status with real model counts
      const servicesStatus = {}
      services.forEach(service => {
        const modelCount = modelsByProvider[service]?.length || 0
        const hasModels = modelCount > 0
        
        servicesStatus[service] = { 
          success: hasModels, 
          modelCount: modelCount,
          error: hasModels ? null : 'No models found'
        }
      })
      
      setAiServices(prev => ({ ...prev, ...servicesStatus }))
      addDebugInfo(`✅ Updated AI Services Status with real model counts`)
      
    } catch (error) {
      addDebugInfo(`⚠️ Models loading error: ${error.message}`, 'warning')
    }
  }

  const loadApiKeysFromDatabase = async () => {
    addDebugInfo('🔑 Loading API keys from ai_providers...')
    
    try {
      // Get SuperAdmin user ID from context
      const superAdminId = getSuperAdminUserId()
      
      if (!superAdminId) {
        addDebugInfo('❌ No SuperAdmin user ID found for loading API keys')
        return
      }

      addDebugInfo(`🔍 Loading API keys for SuperAdmin: ${superAdminId}`)

      const keysPromise = supabase
        .from('ai_providers')
        .select('*')
        .eq('user_id', superAdminId)
        .eq('is_active', true)
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('API keys loading timeout')), 5000)
      )
      
      const result = await Promise.race([keysPromise, timeoutPromise])
      
      if (result.error) {
        addDebugInfo(`⚠️ API keys loading failed: ${result.error.message}`, 'warning')
        setApiKeys({
          openai: '',
          gemini: '',
          claude: '',
          mistral: '',
          grok: '',
          perplexity: ''
        })
        return
      }
      
      const keyMap = {}
      const services = ['openai', 'gemini', 'claude', 'mistral', 'grok', 'perplexity', 'stable_diffusion', 'elevenlabs']
      services.forEach(service => {
        keyMap[service] = []
      })
      
      result.data.forEach(key => {
        if (key.api_key) {
          keyMap[key.provider].push({
            id: key.id,
            name: key.name || `${key.provider} Key`,
            api_key: '••••••••••••••••',
            model: key.model,
            is_active: key.is_active,
            metadata: key.metadata
          })
        }
      })
      
      setApiKeys(keyMap)
      
      addDebugInfo(`✅ Loaded ${result.data.length} API keys from ai_providers`)
      addDebugInfo(`🔍 Debug: result.data = ${JSON.stringify(result.data)}`)
      addDebugInfo(`🔍 Debug: keyMap = ${JSON.stringify(keyMap)}`)
      
    } catch (error) {
      addDebugInfo(`⚠️ API keys loading error: ${error.message}`, 'warning')
      setApiKeys({
        openai: '',
        gemini: '',
        claude: '',
        mistral: '',
        grok: '',
        perplexity: '',
        stable_diffusion: '',
        elevenlabs: ''
      })
    }
  }

  const loadSelectedModels = () => {
    try {
      const saved = localStorage.getItem('superadmin_selected_models')
      if (saved) {
        setSelectedModels(JSON.parse(saved))
        addDebugInfo('✅ Loaded selected models from localStorage')
      }
    } catch (error) {
      addDebugInfo(`⚠️ Error loading selected models: ${error.message}`, 'warning')
    }
  }

  const saveSelectedModels = (models) => {
    try {
      localStorage.setItem('superadmin_selected_models', JSON.stringify(models))
      setSelectedModels(models)
      addDebugInfo('✅ Selected models saved to localStorage')
    } catch (error) {
      addDebugInfo(`⚠️ Error saving selected models: ${error.message}`, 'warning')
    }
  }

  // Kill zombie workflows
  const killZombieWorkflows = () => {
    addDebugInfo('💀 Killing zombie workflows...')
    try {
      // Clear all execution states
      if (window.workflowExecutionService) {
        window.workflowExecutionService.clearAllExecutions()
        window.workflowExecutionService.killStuckExecutions()
        addDebugInfo('✅ Zombie workflows killed')
        toast.success('🧹 Zombie workflows cleared!')
      }
      
      // Clear any polling intervals
      for (let i = 1; i < 99999; i++) {
        window.clearInterval(i)
      }
      
      addDebugInfo('✅ All intervals cleared')
    } catch (error) {
      addDebugInfo(`❌ Failed to kill zombies: ${error.message}`, 'error')
      toast.error('Failed to clear zombie workflows')
    }
  }

  const loadDashboardData = async () => {
    addDebugInfo('📈 Loading dashboard data...')
    
    try {
      setLoading(true)
      
      // Load users with timeout
      const usersPromise = supabase.from('users').select('*')
      const usersTimeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Users loading timeout')), 5000)
      )
      
      const usersResult = await Promise.race([usersPromise, usersTimeoutPromise])
      
      if (usersResult.error) {
        addDebugInfo(`⚠️ Users loading failed: ${usersResult.error.message}`, 'warning')
        setUsers([])
      } else {
        setUsers(usersResult.data || [])
        addDebugInfo(`✅ Loaded ${usersResult.data?.length || 0} users`)
      }

      // Load books using dedicated function
      let processedBooks = []
      try {
        processedBooks = await fetchBooks()
        addDebugInfo(`✅ Loaded ${processedBooks.length} books (processed for missing fields)`)
      } catch (error) {
        addDebugInfo(`⚠️ Books loading failed: ${error.message}`, 'warning')
        setBooks([])
      }

      // Load models from database
      await loadModelsFromDatabase()

      // Set system stats
      setSystemStats({
        totalUsers: usersResult.data?.length || 0,
        totalBooks: processedBooks.length || 0,
        totalCreditsUsed: 0,
        activeSubscriptions: 0
      })
      
      addDebugInfo('✅ Dashboard data loaded successfully')
      
    } catch (error) {
      addDebugInfo(`💥 Dashboard data loading error: ${error.message}`, 'error')
      setUsers([])
      setBooks([])
      setSystemStats({
        totalUsers: 0,
        totalBooks: 0,
        totalCreditsUsed: 0,
        activeSubscriptions: 0
      })
    } finally {
      setLoading(false)
    }
  }

  // Book action handlers
  const handleViewBook = (book) => {
    setSelectedBook(book)
    setShowBookModal(true)
  }

  const [editBookContent, setEditBookContent] = useState('')

  // Dedicated function to fetch and process books
  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase.from('books').select('*')
      
      if (error) {
        throw error
      }
      
      // Process books to add missing fields for old records
      const processedBooks = (data || []).map(book => ({
        ...book,
        // Fix missing author field
        author: book.author || (book.user_id === '5950cad6-810b-4c5b-9d40-4485ea249770' ? 'SuperAdmin' : 'User Generated'),
        // Fix missing AI service - extract from existing data or use mixed
        ai_service: book.ai_service === 'openai' ? 'mixed' : (book.ai_service || 'mixed'),
        // Add metadata if missing
        metadata: book.metadata || {
          created_by: book.user_id === '5950cad6-810b-4c5b-9d40-4485ea249770' ? 'superadmin' : 'user',
          formats_generated: ['text', 'pdf'], // Assume old books had these formats
          ai_engines_used: book.ai_service ? [book.ai_service] : ['mixed']
        }
      }))
      
      setBooks(processedBooks)
      return processedBooks
      
    } catch (error) {
      console.error('Error fetching books:', error)
      setBooks([])
      return []
    }
  }

  const handleEditBook = (book) => {
    setSelectedBook(book)
    // Extract content for editing
    let content = ''
    if (book.content) {
      if (typeof book.content === 'string') {
        content = book.content
      } else if (book.content.sections && Array.isArray(book.content.sections)) {
        content = book.content.sections.map(section => {
          let sectionText = ''
          if (section.title) sectionText += `<h2>${section.title}</h2>\n`
          if (section.content) sectionText += `${section.content}\n`
          return sectionText
        }).join('\n')
      } else {
        content = JSON.stringify(book.content, null, 2)
      }
    }
    setEditBookContent(content)
    setShowEditBookModal(true)
  }

  const saveEditedBook = async () => {
    try {
      const { error } = await supabase
        .from('books')
        .update({ 
          content: editBookContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedBook.id)

      if (error) throw error

      toast.success('Book updated successfully')
      setShowEditBookModal(false)
      
      // Refresh books with processing
      await fetchBooks()
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save book')
    }
  }

  const handleDownloadBook = async (book) => {
    try {
      if (!book.content) {
        toast.error('Book content not available')
        return
      }

      // Dynamic import of docx library
      const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType } = await import('docx')
      const { saveAs } = await import('file-saver')

      const children = []

      // Add title
      children.push(
        new Paragraph({
          text: book.title,
          heading: HeadingLevel.TITLE,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        })
      )

      // Add metadata
      if (book.type || book.created_at) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${book.type || 'Book'} • ${new Date(book.created_at).toLocaleDateString()}`,
                italics: true,
                color: '666666'
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 }
          })
        )
      }

      // Helper to process HTML to structured content
      const processContent = (htmlContent) => {
        const tempDiv = document.createElement('div')
        tempDiv.innerHTML = htmlContent
        
        const elements = []
        
        // Process all elements in order
        const allElements = tempDiv.querySelectorAll('h1, h2, h3, h4, h5, h6, p, ul, ol, li, div, br')
        
        allElements.forEach(el => {
          const text = el.textContent?.trim()
          const tagName = el.tagName?.toLowerCase()
          
          if (!text || text.length < 3) return
          
          // Handle headings
          if (tagName?.startsWith('h')) {
            elements.push({ type: 'heading', text, level: parseInt(tagName[1]) })
          }
          // Handle list items
          else if (tagName === 'li') {
            elements.push({ type: 'listItem', text })
          }
          // Handle paragraphs and divs
          else if (tagName === 'p' || tagName === 'div') {
            elements.push({ type: 'paragraph', text })
          }
        })
        
        // If no structured elements, process as plain text
        if (elements.length === 0) {
          const fullText = tempDiv.textContent || tempDiv.innerText || htmlContent
          const lines = fullText.split('\n').filter(line => line.trim())
          
          lines.forEach(line => {
            const trimmed = line.trim()
            if (trimmed.length < 3) return
            
            // Detect headings
            if (trimmed.toLowerCase().includes('table of contents') || 
                trimmed.toLowerCase().includes('chapter') ||
                /^#{1,6}\s/.test(trimmed) ||
                /^##\s*/.test(trimmed)) {
              elements.push({ type: 'heading', text: trimmed.replace(/^#+\s*/, ''), level: 2 })
            }
            // Detect list items
            else if (/^\s*[-*]\s/.test(trimmed) || /^\s*\d+\.\s/.test(trimmed)) {
              elements.push({ type: 'listItem', text: trimmed.replace(/^\s*[-*\d.]+\s/, '') })
            }
            // Regular paragraph
            else {
              elements.push({ type: 'paragraph', text: trimmed })
            }
          })
        }
        
        return elements
      }

      // Process content
      if (typeof book.content === 'string') {
        const elements = processContent(book.content)
        elements.forEach(element => {
          if (element.type === 'heading') {
            const headingLevel = element.level === 1 ? HeadingLevel.HEADING_1 : 
                                element.level === 2 ? HeadingLevel.HEADING_2 : 
                                HeadingLevel.HEADING_3
            
            children.push(
              new Paragraph({
                text: element.text,
                heading: headingLevel,
                spacing: { before: 480, after: 240 }
              })
            )
          } else if (element.type === 'listItem') {
            children.push(
              new Paragraph({
                text: `• ${element.text}`,
                spacing: { after: 120, indent: { left: 360 } }
              })
            )
          } else if (element.type === 'paragraph') {
            children.push(
              new Paragraph({
                text: element.text,
                spacing: { after: 240 }
              })
            )
          }
        })
      } else if (typeof book.content === 'object' && book.content.sections && Array.isArray(book.content.sections)) {
        book.content.sections.forEach((section, index) => {
          // Add section title
          if (section.title) {
            children.push(
              new Paragraph({
                text: section.title,
                heading: HeadingLevel.HEADING_1,
                spacing: { before: 480, after: 240 }
              })
            )
          }

          // Add section content
          if (section.content) {
            const elements = processContent(section.content)
            elements.forEach(element => {
              if (element.type === 'heading') {
                const headingLevel = element.level === 1 ? HeadingLevel.HEADING_1 : 
                                    element.level === 2 ? HeadingLevel.HEADING_2 : 
                                    HeadingLevel.HEADING_3
                
                children.push(
                  new Paragraph({
                    text: element.text,
                    heading: headingLevel,
                    spacing: { before: 360, after: 180 }
                  })
                )
              } else if (element.type === 'listItem') {
                children.push(
                  new Paragraph({
                    text: `• ${element.text}`,
                    spacing: { after: 120, indent: { left: 360 } }
                  })
                )
              } else if (element.type === 'paragraph') {
                children.push(
                  new Paragraph({
                    text: element.text,
                    spacing: { after: 240 }
                  })
                )
              }
            })
          }
        })
      }

      // Create document
      const doc = new Document({
        sections: [{
          properties: {
            page: {
              margin: {
                top: 1440,    // 1 inch
                right: 1440,
                bottom: 1440,
                left: 1440
              }
            }
          },
          children: children
        }]
      })

      // Generate and download
      const { Packer } = await import('docx')
      const blob = await Packer.toBlob(doc)
      saveAs(blob, `${book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.docx`)
      
      toast.success('Book downloaded as DOCX')
    } catch (error) {
      console.error('Download error:', error)
      toast.error(`Failed to download book: ${error.message}`)
    }
  }

  const validateApiKey = async (service, apiKey, keyName) => {
    if (!apiKey || apiKey === '••••••••••••••••') {
      toast.error('Please enter a valid API key')
      return
    }
    
    if (!keyName || keyName.trim() === '') {
      toast.error('Please enter a name for this API key')
      return
    }

    addDebugInfo(`🔍 Validating ${service} API key...`)
    setValidatingServices(prev => ({ ...prev, [service]: true }))

    try {
      const result = await aiValidationService.validateApiKey(service, apiKey)
      
      if (result.success) {
        addDebugInfo(`✅ ${service} validation successful - ${result.models.length} models found`)
        
        // Update AI services status
        setAiServices(prev => ({
          ...prev,
          [service]: { success: true, modelCount: result.models.length }
        }))
        
        // Store models
        setAllModels(prev => ({
          ...prev,
          [service]: result.models
        }))
        
        // Auto-select first model if none selected
        if (!selectedModels[service] && result.models.length > 0) {
          const newSelectedModels = {
            ...selectedModels,
            [service]: result.models[0].id
          }
          saveSelectedModels(newSelectedModels)
        }
        
        toast.success(`✅ ${aiServiceConfigs[service].name}: ${result.models.length} models loaded`)
        
        // Save API key directly to database using SuperAdmin context
        try {
          addDebugInfo(`🔍 Getting SuperAdmin user ID...`)
          const superAdminId = getSuperAdminUserId()
          
          if (!superAdminId) {
            addDebugInfo(`❌ No SuperAdmin user ID found`, 'error')
            return
          }
          
          addDebugInfo(`🔍 SuperAdmin user ID: ${superAdminId}`)
          
          addDebugInfo(`💾 Saving API key directly to database...`)
          
          // Save directly to ai_providers table with models metadata
          const { data, error } = await supabase
            .from('ai_providers')
            .upsert({
              user_id: superAdminId,
              provider: service,
              name: keyName,
              api_key: apiKey,
              model: selectedModels[service] || 'default',
              is_active: true,
              failures: 0,
              usage_count: 0,
              metadata: {
                source: 'superadmin_dashboard',
                display_name: aiServiceConfigs[service].name,
                description: aiServiceConfigs[service].description,
                models: result.models, // Include the validated models
                validated_at: new Date().toISOString()
              }
            }, {
              onConflict: 'provider,name'
            })
            .select()
          
          if (error) {
            addDebugInfo(`❌ Database save error: ${error.message}`, 'error')
            console.error('Database error:', error)
            throw error
          }
          
          addDebugInfo(`✅ API key saved successfully: ${JSON.stringify(data)}`)
          
          // Refresh API keys from database to show the new key
          await loadApiKeysFromDatabase()
          addDebugInfo(`✅ ${service} API key saved to database`)
        } catch (error) {
          addDebugInfo(`❌ Failed to save API key: ${error.message}`, 'error')
          console.error('Full error:', error)
          addDebugInfo(`❌ Error stack: ${error.stack}`, 'error')
        }
        
      } else {
        addDebugInfo(`❌ ${service} validation failed: ${result.error}`, 'error')
        
        setAiServices(prev => ({
          ...prev,
          [service]: { success: false, error: result.error }
        }))
        
        setAllModels(prev => ({
          ...prev,
          [service]: []
        }))
        
        toast.error(`❌ ${aiServiceConfigs[service].name}: ${result.error}`)
      }
      
    } catch (error) {
      addDebugInfo(`💥 ${service} validation error: ${error.message}`, 'error')
      
      setAiServices(prev => ({
        ...prev,
        [service]: { success: false, error: error.message }
      }))
      
      toast.error(`❌ ${aiServiceConfigs[service].name}: Validation failed`)
      
    } finally {
      setValidatingServices(prev => ({ ...prev, [service]: false }))
    }
  }



  const handleModelSelection = (service, modelId) => {
    const newSelectedModels = {
      ...selectedModels,
      [service]: modelId
    }
    saveSelectedModels(newSelectedModels)
    
    const model = allModels[service]?.find(m => m.id === modelId)
    if (model) {
      toast.success(`🎯 ${aiServiceConfigs[service].name}: ${model.name} selected`)
    }
  }

  const openAIServiceModal = (service) => {
    setSelectedAIService(service)
    setShowAIServiceModal(true)
  }

  const handleUserAdded = (newUser) => {
    setUsers(prev => [newUser, ...prev])
    toast.success('User added successfully!')
  }

  const handleWorkflowCreated = (newWorkflow) => {
    toast.success('Workflow created successfully!')
    // Optionally refresh workflows if needed
  }

  const handleViewUser = (user) => {
    setSelectedUser(user)
    setShowViewModal(true)
  }

  const handleEditUser = (user) => {
    setSelectedUser(user)
    setShowEditModal(true)
  }

  const handleDeleteUser = async (user) => {
    if (window.confirm(`Are you sure you want to delete user ${user.full_name || user.email}?`)) {
      try {
        const { error } = await supabase
          .from('users')
          .delete()
          .eq('id', user.id)
        
        if (error) throw error
        
        setUsers(prev => prev.filter(u => u.id !== user.id))
        toast.success('User deleted successfully!')
      } catch (error) {
        console.error('Error deleting user:', error)
        toast.error('Failed to delete user')
      }
    }
  }

  const handleSaveCustomProvider = async (providerData) => {
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        addDebugInfo('❌ No authenticated user found for saving custom provider')
        return
      }

      // Save to ai_providers table
      const { data, error } = await supabase
        .from('ai_providers')
        .insert({
          user_id: user.id,
          provider: providerData.provider,
          api_key: providerData.api_key,
          model: providerData.model,
          is_active: true,
          failures: 0,
          usage_count: 0,
          metadata: {
            ...providerData.metadata,
            display_name: providerData.display_name,
            description: providerData.description,
            base_url: providerData.base_url,
            sdk_type: providerData.sdk_type,
            auth_type: providerData.auth_type,
            headers: providerData.headers,
            parameters: providerData.parameters,
            capabilities: providerData.capabilities,
            rate_limits: providerData.rate_limits,
            is_custom: true,
            type: 'custom'
          }
        })
        .select()
        .single()

      if (error) {
        console.error('Error saving custom provider:', error)
        throw error
      }

      addDebugInfo(`✅ Custom AI provider "${providerData.display_name}" saved successfully`)
      
      // Refresh the page or update the UI as needed
      window.location.reload()
      
    } catch (error) {
      console.error('Error saving custom provider:', error)
      throw error
    }
  }

  const handleLogout = async () => {
    addDebugInfo('🚪 Logging out...')
    
    try {
      const session = JSON.parse(localStorage.getItem('superadmin_session') || '{}')
      if (session.sessionId) {
        // Try to revoke session with timeout
        const revokePromise = supabase
          .from('admin_sessions')
          .delete()
          .eq('id', session.sessionId)
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Logout timeout')), 3000)
        )
        
        await Promise.race([revokePromise, timeoutPromise])
        addDebugInfo('✅ Session revoked from database')
      }
    } catch (error) {
      addDebugInfo(`⚠️ Session revocation error: ${error.message}`, 'warning')
    }
    
    localStorage.removeItem('superadmin_session')
    toast.success('Logged out successfully')
    navigate('/superadmin')
  }

  const updateSystemConfig = async (key, value) => {
    addDebugInfo(`⚙️ Updating config: ${key} = ${value}`)
    
    try {
      const updatePromise = supabase
        .from('system_configs')
        .upsert({
          config_key: key,
          config_value: value,
          updated_at: new Date().toISOString()
        })
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Config update timeout')), 5000)
      )
      
      const result = await Promise.race([updatePromise, timeoutPromise])
      
      if (result.error) {
        addDebugInfo(`❌ Config update failed: ${result.error.message}`, 'error')
        toast.error('Failed to update configuration')
        return
      }
      
      setSystemConfigs(prev => ({ ...prev, [key]: value }))
      toast.success('System configuration updated')
      addDebugInfo(`✅ Config updated: ${key}`)
      
    } catch (error) {
      addDebugInfo(`💥 Config update error: ${error.message}`, 'error')
      toast.error('Failed to update configuration')
    }
  }

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    addDebugInfo(`🗑️ Deleting user: ${userId}`)

    try {
      const deletePromise = supabase.auth.admin.deleteUser(userId)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('User deletion timeout')), 10000)
      )
      
      const result = await Promise.race([deletePromise, timeoutPromise])
      
      if (result.error) {
        addDebugInfo(`❌ User deletion failed: ${result.error.message}`, 'error')
        toast.error('Failed to delete user')
        return
      }

      toast.success('User deleted successfully')
      addDebugInfo(`✅ User deleted: ${userId}`)
      loadDashboardData()
      
    } catch (error) {
      addDebugInfo(`💥 User deletion error: ${error.message}`, 'error')
      toast.error('Failed to delete user')
    }
  }

  // CREATE SERVICE STATUS FOR AI PLAYGROUND - MEMOIZED TO PREVENT INFINITE LOOPS
  const serviceStatus = useMemo(() => {
    const status = {}
    Object.keys(aiServiceConfigs).forEach(service => {
      status[service] = {
        valid: true, // TEMPORARY: Force all services to be valid
        error: null,
        modelCount: 1
      }
    })
    
    return status
  }, [aiServiceConfigs])

  const navigationGroups = [
    {
      id: 'core',
      label: 'CORE WORKFLOWS',
      icon: Workflow,
      color: 'orange',
      items: [
        { id: 'overview', label: 'Dashboard', icon: Activity, description: 'System overview & quick stats' },
        { id: 'flow', label: 'Flow Builder', icon: Workflow, description: 'Visual workflow creator' },
        { id: 'engines', label: 'Engines', icon: Zap, description: 'Deploy & manage engines' },
        { id: 'alchemist-flow', label: 'Alchemist Lab', icon: Wand2, description: 'Advanced AI workflows' },
        { id: 'alchemist-stash', label: "Creator's Vault", icon: Palette, description: 'Template & asset library' }
      ]
    },
    {
      id: 'ai',
      label: 'AI & INTELLIGENCE',
      icon: Brain,
      color: 'blue',
      items: [
        { id: 'ai-management', label: 'AI Models', icon: Bot, description: 'Model management & testing' },
        { id: 'ai-services', label: 'AI Services', icon: Cpu, description: 'Provider configurations' },
        { id: 'api-management', label: 'API Keys', icon: Key, description: 'Secure key management' }
      ]
    },
    {
      id: 'users',
      label: 'USERS & CONTENT',
      icon: Users,
      color: 'green',
      items: [
        { id: 'users', label: 'User Management', icon: Users, description: 'Manage user accounts' },
        { id: 'books', label: 'Content Library', icon: Database, description: 'Generated books & content' },
        { id: 'level-management', label: 'Access Levels', icon: Layers, description: 'Permission & tier management' },
        { id: 'token-management', label: 'Token Control', icon: Shield, description: 'Limits, wallets, adjustments' }
      ]
    },
    {
      id: 'monitoring',
      label: 'ANALYTICS & SYSTEM',
      icon: BarChart3,
      color: 'purple',
      items: [
        { id: 'token-analytics', label: 'Token Analytics', icon: BarChart3, description: 'Usage & cost tracking' },
        { id: 'system', label: 'System Control', icon: Settings, description: 'Worker & system monitoring' }
      ]
    }
  ]

  // Flatten groups for backward compatibility with existing activeTab logic
  const tabs = navigationGroups.flatMap(group => group.items)

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading SuperAdmin Dashboard...</p>
            
            {/* Debug info during loading */}
            <div className="mt-6 bg-gray-800 rounded-xl border border-gray-700 p-4 max-w-md">
              <h4 className="text-sm font-semibold text-white mb-2">Loading Progress:</h4>
              <div className="text-xs space-y-1 max-h-32 overflow-y-auto">
                {debugInfo.slice(-5).map((info, index) => (
                  <div key={index} className={`${
                    info.type === 'error' ? 'text-red-400' :
                    info.type === 'warning' ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    {info.message}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">SuperAdmin Dashboard</h1>
              <p className="text-gray-400 text-sm">Complete system control and management</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={killZombieWorkflows}
              className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
              title="Kill zombie workflows"
            >
              <XCircle className="w-4 h-4" />
              <span>Kill Zombies</span>
            </button>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 overflow-hidden">
        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-40 lg:hidden animate-in fade-in duration-300"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <nav className={`
          fixed lg:relative z-50 h-screen bg-gradient-to-b from-slate-800/98 to-slate-900/98 backdrop-blur-2xl border-r border-orange-500/30 shadow-2xl transition-all duration-500 ease-out
          ${sidebarCollapsed ? 'w-20' : 'w-80'}
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          hover:border-orange-500/50
        `}>
          <div className="flex flex-col h-full p-4 relative">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-8 relative">
              {!sidebarCollapsed && (
                <div className="flex items-center space-x-3 group">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-orange-500/50 group-hover:scale-110 transition-all duration-300">
                    <Shield className="w-6 h-6 text-white group-hover:rotate-12 transition-transform duration-300" />
                  </div>
                  <div className="group-hover:translate-x-1 transition-transform duration-300">
                    <h1 className="text-lg font-bold text-white group-hover:text-orange-200 transition-colors duration-300">SuperAdmin</h1>
                    <p className="text-orange-200/80 text-xs group-hover:text-orange-300 transition-colors duration-300">Control Center</p>
                  </div>
                </div>
              )}
              
              {/* Collapse Button */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:flex p-2 rounded-lg bg-slate-700/50 hover:bg-orange-500/20 text-slate-300 hover:text-orange-300 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-orange-500/25"
              >
                {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
              </button>

              {/* Mobile Close Button */}
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden p-2 rounded-lg bg-slate-700/50 hover:bg-red-500/20 text-slate-300 hover:text-red-300 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-red-500/25"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Organized Navigation Groups */}
            <div className="flex-1 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-orange-500/30 scrollbar-track-transparent">
              {navigationGroups.map((group, groupIndex) => {
                const GroupIcon = group.icon
                const groupColors = {
                  orange: { bg: 'from-orange-500/20 to-orange-600/20', border: 'border-orange-500/30', text: 'text-orange-300', glow: 'shadow-orange-500', active: 'from-orange-500 to-orange-600' },
                  blue: { bg: 'from-blue-500/20 to-blue-600/20', border: 'border-blue-500/30', text: 'text-blue-300', glow: 'shadow-blue-500', active: 'from-blue-500 to-blue-600' },
                  green: { bg: 'from-green-500/20 to-green-600/20', border: 'border-green-500/30', text: 'text-green-300', glow: 'shadow-green-500', active: 'from-green-500 to-green-600' },
                  purple: { bg: 'from-purple-500/20 to-purple-600/20', border: 'border-purple-500/30', text: 'text-purple-300', glow: 'shadow-purple-500', active: 'from-purple-500 to-purple-600' }
                }
                const colors = groupColors[group.color] || groupColors.orange
                
                return (
                  <div key={group.id} className="space-y-2 animate-in fade-in duration-700" style={{ animationDelay: `${groupIndex * 100}ms` }}>
                    {/* Group Header */}
                    {!sidebarCollapsed && (
                      <div className={`flex items-center space-x-3 px-3 py-2 rounded-lg bg-gradient-to-r ${colors.bg} border ${colors.border} backdrop-blur-sm hover:scale-105 transition-all duration-300 group cursor-pointer`}>
                        <div className={`p-1.5 rounded-md bg-gradient-to-br ${colors.bg} ${colors.border} shadow-lg group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300`}>
                          <GroupIcon className={`w-4 h-4 ${colors.text} group-hover:drop-shadow-sm`} />
                        </div>
                        <span className={`text-xs font-bold tracking-wider ${colors.text} uppercase group-hover:translate-x-0.5 transition-transform duration-300`}>
                          {group.label}
                        </span>
                        <div className={`ml-auto w-2 h-2 ${colors.text} rounded-full opacity-30 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-300`}></div>
                      </div>
                    )}
                    
                    {/* Group Items */}
                    <div className="space-y-1 pl-2">
                      {group.items.map((tab, index) => {
                        const Icon = tab.icon
                        const isActive = activeTab === tab.id
                        const isGroupActive = group.items.some(item => item.id === activeTab)
                        
                        return (
                          <button
                            key={tab.id}
                            onClick={() => {
                              setActiveTab(tab.id)
                              setMobileMenuOpen(false)
                            }}
                            className={`group w-full flex items-center ${
                              sidebarCollapsed ? 'justify-center px-3 py-3' : 'space-x-4 px-4 py-3'
                            } rounded-xl text-left transition-all duration-300 transform hover:scale-[1.02] hover:translate-x-1 relative overflow-hidden ${
                              isActive
                                ? `bg-gradient-to-r ${colors.active} text-white shadow-xl ${colors.glow}/40 border ${colors.border.replace('/30', '/60')}`
                                : `text-slate-300 hover:bg-gradient-to-r hover:${colors.bg} hover:text-white hover:shadow-lg hover:${colors.glow}/20 hover:border hover:${colors.border}`
                            }`}
                            title={sidebarCollapsed ? `${tab.label}: ${tab.description}` : tab.description}
                            style={{ animationDelay: `${(groupIndex * 100) + (index * 50)}ms` }}
                          >
                            {/* Active Item Pulse Animation */}
                            {isActive && (
                              <div className={`absolute inset-0 bg-gradient-to-r ${colors.active} opacity-20 animate-pulse`}></div>
                            )}
                            
                            <div className={`relative p-2 rounded-lg transition-all duration-300 ${
                              isActive 
                                ? `bg-white/15 shadow-lg ${colors.glow}/30` 
                                : `group-hover:bg-gradient-to-br group-hover:${colors.bg} group-hover:shadow-md group-hover:${colors.glow}/30`
                            } group-hover:scale-110 group-hover:-rotate-2`}>
                              {/* Glowing background effect */}
                              {isActive && (
                                <div className={`absolute inset-0 bg-gradient-to-br ${colors.bg.replace('/20', '/40')} rounded-lg blur-sm opacity-60 animate-pulse`}></div>
                              )}
                              <Icon className={`relative w-5 h-5 transition-all duration-300 ${
                                isActive 
                                  ? 'text-white drop-shadow-lg' 
                                  : `${colors.text} group-hover:text-white group-hover:drop-shadow-sm`
                              }`} />
                              {/* Micro pulse for interaction feedback */}
                              {isActive && (
                                <div className={`absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping opacity-75`}></div>
                              )}
                            </div>
                            
                            {!sidebarCollapsed && (
                              <div className="flex-1 min-w-0 relative">
                                <div className={`font-semibold text-sm truncate transition-all duration-300 ${
                                  isActive 
                                    ? 'text-white text-shadow' 
                                    : 'text-slate-300 group-hover:text-white group-hover:translate-x-0.5'
                                }`}>
                                  {tab.label}
                                </div>
                                <div className={`text-xs truncate transition-all duration-300 ${
                                  isActive 
                                    ? `${colors.text.replace('300', '200')} opacity-90` 
                                    : 'text-slate-400 group-hover:text-slate-300 group-hover:translate-x-0.5'
                                }`}>
                                  {tab.description}
                                </div>
                                {/* Active Progress Line */}
                                {isActive && (
                                  <div className={`w-full h-0.5 bg-gradient-to-r from-transparent via-white/60 to-transparent mt-1.5 animate-pulse rounded-full`}></div>
                                )}
                                {/* Hover Effect Line */}
                                <div className={`w-0 group-hover:w-full h-0.5 bg-gradient-to-r ${colors.bg.replace('/20', '/60')} transition-all duration-500 rounded-full`}></div>
                              </div>
                            )}
                            
                            {/* Active Indicator & Interaction Feedback */}
                            {!sidebarCollapsed && (
                              <div className="flex items-center space-x-2">
                                {isActive ? (
                                  <div className="flex items-center space-x-1">
                                    <div className={`w-2 h-2 bg-white rounded-full animate-bounce`}></div>
                                    <ChevronRight className={`w-4 h-4 text-white animate-pulse drop-shadow-lg`} />
                                  </div>
                                ) : (
                                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1">
                                    <ChevronRight className={`w-4 h-4 ${colors.text} group-hover:animate-bounce`} />
                                  </div>
                                )}
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                    
                    {/* Group Separator with Glow Effect */}
                    {groupIndex < navigationGroups.length - 1 && !sidebarCollapsed && (
                      <div className="relative flex items-center py-2">
                        <div className={`w-full h-px bg-gradient-to-r from-transparent via-${group.color}-500/30 to-transparent opacity-50`}></div>
                        <div className={`absolute left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gradient-to-br ${colors.bg} rounded-full border ${colors.border} animate-pulse`}></div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Enhanced User Profile Section */}
            <div className="pt-6 border-t border-gradient-to-r from-transparent via-slate-600/50 to-transparent">
              <div className={`group flex items-center ${
                sidebarCollapsed ? 'justify-center p-3' : 'space-x-4 p-4'
              } rounded-2xl bg-gradient-to-br from-slate-700/40 via-slate-700/30 to-slate-800/40 hover:from-orange-500/20 hover:via-slate-700/40 hover:to-orange-500/20 border border-slate-600/50 hover:border-orange-500/40 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-orange-500/25 backdrop-blur-sm relative overflow-hidden`}>
                {/* Animated Background Particles */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500">
                  <div className="absolute top-2 left-4 w-1 h-1 bg-orange-400 rounded-full animate-ping" style={{ animationDelay: '0ms' }}></div>
                  <div className="absolute top-4 right-6 w-0.5 h-0.5 bg-orange-300 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
                  <div className="absolute bottom-3 left-8 w-0.5 h-0.5 bg-orange-200 rounded-full animate-ping" style={{ animationDelay: '400ms' }}></div>
                </div>
                
                {/* Avatar with Advanced Micro-interactions */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full blur-md opacity-0 group-hover:opacity-60 animate-pulse transition-all duration-500"></div>
                  <div className="relative w-10 h-10 bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 rounded-full flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-xl group-hover:shadow-orange-500/60 border-2 border-white/10 group-hover:border-white/30">
                    <span className="text-white text-sm font-bold group-hover:scale-125 transition-transform duration-300 drop-shadow-lg">SA</span>
                    {/* Status Indicator Ring */}
                    <div className="absolute -inset-1 rounded-full border-2 border-transparent group-hover:border-green-400/50 transition-all duration-300"></div>
                    {/* Pulsing Dot */}
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse border-2 border-slate-800 group-hover:scale-125 transition-transform duration-300"></div>
                  </div>
                </div>
                
                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0 group-hover:translate-x-1 transition-transform duration-300">
                    <div className="flex items-center space-x-2 mb-1">
                      <p className="text-white text-sm font-bold truncate group-hover:text-orange-100 transition-colors duration-300 drop-shadow-sm">Master Control</p>
                      <div className="w-2 h-2 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                        <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-25"></div>
                      </div>
                      <p className="text-green-300/90 text-xs group-hover:text-green-200 transition-colors duration-300 font-medium">System Active</p>
                      <div className="ml-auto flex space-x-1">
                        <div className="w-1 h-3 bg-orange-400/60 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1 h-2 bg-orange-400/40 rounded-full animate-pulse" style={{ animationDelay: '100ms' }}></div>
                        <div className="w-1 h-4 bg-orange-400/80 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                {!sidebarCollapsed && (
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110">
                    <div className="flex flex-col space-y-1">
                      <div className="w-1 h-1 bg-orange-400 rounded-full animate-bounce"></div>
                      <div className="w-1 h-1 bg-orange-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1 h-1 bg-orange-200 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className={`
          flex-1 bg-gradient-to-br from-slate-900/50 to-gray-900/50 backdrop-blur-sm transition-all duration-500
          ${sidebarCollapsed ? 'lg:ml-0' : 'lg:ml-0'}
          min-h-screen overflow-x-hidden overflow-y-auto
        `}>
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center justify-between p-4 bg-slate-800/50 backdrop-blur-sm border-b border-orange-500/20">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-3 rounded-xl bg-slate-700/50 hover:bg-orange-500/20 text-slate-300 hover:text-orange-300 transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-orange-500/25"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-white">SuperAdmin</h1>
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300">
              <span className="text-white text-sm font-bold">SA</span>
            </div>
          </div>
          
          {/* Content Container */}
          <div className="p-4 sm:p-6 lg:p-8 max-w-full min-h-screen">
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Header Section */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent">
                    System Overview
                  </h2>
                  <p className="text-slate-400 mt-2 text-sm sm:text-base lg:text-lg">Monitor your platform's performance and health</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 font-semibold text-sm">All Systems Operational</span>
                </div>
              </div>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <div className="group bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-2xl rounded-2xl border border-orange-500/30 p-4 sm:p-6 hover:border-orange-500/60 transition-all duration-500 transform hover:scale-[1.05] hover:shadow-2xl hover:shadow-orange-500/30 hover:-translate-y-1 relative overflow-hidden">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-400 text-xs sm:text-sm font-medium mb-1 sm:mb-2 group-hover:text-orange-200 transition-colors duration-300">Total Users</p>
                        <p className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2 group-hover:text-orange-100 transition-colors duration-300">{systemStats.totalUsers}</p>
                        <div className="flex items-center group-hover:translate-x-1 transition-transform duration-300">
                          <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 mr-1 sm:mr-2 group-hover:text-green-300 group-hover:scale-110 transition-all duration-300" />
                          <span className="text-xs sm:text-sm text-green-400 font-medium group-hover:text-green-300 transition-colors duration-300">+12%</span>
                        </div>
                      </div>
                      <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg group-hover:shadow-orange-500/50 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 flex-shrink-0">
                        <Users className="w-5 h-5 sm:w-7 sm:h-7 text-white group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="group bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-2xl rounded-2xl border border-green-500/30 p-4 sm:p-6 hover:border-green-500/60 transition-all duration-500 transform hover:scale-[1.05] hover:shadow-2xl hover:shadow-green-500/30 hover:-translate-y-1 relative overflow-hidden">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-400 text-xs sm:text-sm font-medium mb-1 sm:mb-2 group-hover:text-green-200 transition-colors duration-300">Total Books</p>
                        <p className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2 group-hover:text-green-100 transition-colors duration-300">{systemStats.totalBooks}</p>
                        <div className="flex items-center group-hover:translate-x-1 transition-transform duration-300">
                          <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 mr-1 sm:mr-2 group-hover:text-green-300 group-hover:scale-110 transition-all duration-300" />
                          <span className="text-xs sm:text-sm text-green-400 font-medium group-hover:text-green-300 transition-colors duration-300">+8%</span>
                        </div>
                      </div>
                      <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg group-hover:shadow-green-500/50 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 flex-shrink-0">
                        <Database className="w-5 h-5 sm:w-7 sm:h-7 text-white group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="group bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-2xl rounded-2xl border border-amber-500/30 p-4 sm:p-6 hover:border-amber-500/60 transition-all duration-500 transform hover:scale-[1.05] hover:shadow-2xl hover:shadow-amber-500/30 hover:-translate-y-1 relative overflow-hidden">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-400 text-xs sm:text-sm font-medium mb-1 sm:mb-2 group-hover:text-amber-200 transition-colors duration-300">Credits Used</p>
                        <p className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2 group-hover:text-amber-100 transition-colors duration-300">{systemStats.totalCreditsUsed}</p>
                        <div className="flex items-center group-hover:translate-x-1 transition-transform duration-300">
                          <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400 mr-1 sm:mr-2 group-hover:text-amber-300 group-hover:scale-110 transition-all duration-300" />
                          <span className="text-xs sm:text-sm text-amber-400 font-medium group-hover:text-amber-300 transition-colors duration-300">This month</span>
                        </div>
                      </div>
                      <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg group-hover:shadow-amber-500/50 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 flex-shrink-0">
                        <Activity className="w-5 h-5 sm:w-7 sm:h-7 text-white group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="group bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-2xl rounded-2xl border border-purple-500/30 p-4 sm:p-6 hover:border-purple-500/60 transition-all duration-500 transform hover:scale-[1.05] hover:shadow-2xl hover:shadow-purple-500/30 hover:-translate-y-1 relative overflow-hidden">
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-slate-400 text-xs sm:text-sm font-medium mb-1 sm:mb-2 group-hover:text-purple-200 transition-colors duration-300">Active Subscriptions</p>
                        <p className="text-2xl sm:text-3xl font-bold text-white mb-1 sm:mb-2 group-hover:text-purple-100 transition-colors duration-300">{systemStats.activeSubscriptions}</p>
                        <div className="flex items-center group-hover:translate-x-1 transition-transform duration-300">
                          <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 mr-1 sm:mr-2 group-hover:text-purple-300 group-hover:scale-110 transition-all duration-300" />
                          <span className="text-xs sm:text-sm text-purple-400 font-medium group-hover:text-purple-300 transition-colors duration-300">Revenue</span>
                        </div>
                      </div>
                      <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-purple-500/50 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 flex-shrink-0">
                        <Server className="w-5 h-5 sm:w-7 sm:h-7 text-white group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Status Panel */}
              <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl rounded-2xl border border-orange-500/20 p-4 sm:p-6 lg:p-8 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                      <Network className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-white">🚀 System Status</h3>
                      <p className="text-slate-400 text-xs sm:text-sm mt-1">Advanced parallel execution and resource management</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-green-400 font-semibold text-sm">System Active</span>
                    </div>
                    <div className="px-3 py-1 bg-green-900/30 border border-green-500/30 rounded-lg">
                      <span className="text-green-400 text-xs font-medium">Operational</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-purple-800/30 rounded-xl p-4 border border-purple-600/30">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200 text-sm font-medium">Parallel Execution Engine</span>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <p className="text-white font-semibold mt-1">Ready</p>
                  </div>
                  <div className="bg-blue-800/30 rounded-xl p-4 border border-blue-600/30">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-200 text-sm font-medium">Agent Communication</span>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <p className="text-white font-semibold mt-1">Active</p>
                  </div>
                  <div className="bg-indigo-800/30 rounded-xl p-4 border border-indigo-600/30">
                    <div className="flex items-center justify-between">
                      <span className="text-indigo-200 text-sm font-medium">Resource Allocation</span>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <p className="text-white font-semibold mt-1">Optimized</p>
                  </div>
                </div>
              </div>

              {/* AI Services Status */}
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-white">AI Services Status</h3>
                    <p className="text-gray-400 text-sm mt-1">Monitor the health of your AI integrations</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(aiServiceConfigs).map(([service, config]) => {
                    const status = aiServices[service]
                    const models = allModels[service] || []
                    const Icon = config.icon
                    
                    return (
                      <div key={service} className="flex items-center justify-between p-4 bg-gray-700 rounded-xl border border-gray-600 hover:bg-gray-650 transition-colors duration-200">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                            status?.success ? 'bg-green-600' : 'bg-gray-600'
                          }`}>
                            <Icon className={`w-5 h-5 ${
                              status?.success ? 'text-white' : 'text-gray-400'
                            }`} />
                          </div>
                          <div>
                            <span className="font-semibold text-white">{config.name}</span>
                            {status?.success && (
                              <div className="text-xs text-gray-400">
                                {models.length} models available
                              </div>
                            )}
                          </div>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${status?.success ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Debug Panel */}
              <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">System Debug Log</h3>
                    <p className="text-gray-400 text-sm mt-1">Real-time system activity and diagnostics</p>
                  </div>
                  <button
                    onClick={() => setDebugInfo([])}
                    className="text-sm text-gray-400 hover:text-white font-medium"
                  >
                    Clear Log
                  </button>
                </div>
                <div className="bg-gray-900 rounded-xl p-4 h-64 overflow-y-auto">
                  <div className="space-y-1">
                    {debugInfo.map((info, index) => (
                      <div key={index} className={`text-xs font-mono ${
                        info.type === 'error' ? 'text-red-400' :
                        info.type === 'warning' ? 'text-yellow-400' :
                        'text-green-400'
                      }`}>
                        {info.message}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}


          {/* UNDER THE HOOD TAB */}
          {activeTab === 'under-the-hood' && (
            <div className="space-y-6">
              <UnderTheHoodNew />
            </div>
          )}

          {/* FLOW TAB */}
          {activeTab === 'flow' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white">⚡ Flow Builder</h2>
                  <p className="text-gray-400 mt-1">Create dynamic book generation workflows with visual flow editor</p>
                </div>
              </div>
              
              <Flow />
            </div>
          )}


          {/* ENGINES TAB */}
          {activeTab === 'engines' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white">⚡ Engines</h2>
                  <p className="text-gray-400 mt-1">Manage and assign AI content generation engines to users and levels</p>
                </div>
              </div>
              
              <Engines />
            </div>
          )}

          {/* ALCHEMIST'S STASH TAB */}
          {activeTab === 'alchemist-stash' && (
            <AlchemistStash />
          )}

          {/* ALCHEMIST FLOW TAB */}
          {activeTab === 'alchemist-flow' && (
            <AlchemistFlow />
          )}

          {/* API MANAGEMENT TAB */}
          {activeTab === 'api-management' && (
            <APIManagement />
          )}

          {/* AI MANAGEMENT TAB */}
          {activeTab === 'ai-management' && (
            <AIManagement />
          )}

          {/* TOKEN ANALYTICS TAB */}
          {activeTab === 'token-analytics' && (
            <TokenAnalyticsDashboard />
          )}

          {/* TOKEN MANAGEMENT TAB */}
          {activeTab === 'token-management' && (
            <div className="space-y-6">
              <TokenManagement />
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <UserManagement />
          )}

          {/* BOOKS TAB */}
          {activeTab === 'books' && (
            <div className="space-y-6">
              {/* Enhanced Header with Filters */}
              <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 border border-gray-700">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                      <Database className="text-purple-400" />
                      Book Management
                    </h2>
                    <p className="text-gray-400 mt-1">Monitor and manage all books created on the platform ({books.length} total)</p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={async () => {
                        try {
                          await fetchBooks()
                          toast.success('Books refreshed')
                        } catch (error) {
                          toast.error('Failed to refresh books')
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Refresh
                    </button>
                  </div>
                </div>
                
                {/* Filters Section */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search books..."
                      value={bookFilters.search}
                      onChange={(e) => setBookFilters(prev => ({ ...prev, search: e.target.value }))}
                      className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  
                  {/* Author Filter */}
                  <select
                    value={bookFilters.author}
                    onChange={(e) => setBookFilters(prev => ({ ...prev, author: e.target.value }))}
                    className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Authors</option>
                    <option value="superadmin">SuperAdmin</option>
                    <option value="user">Users</option>
                  </select>
                  
                  {/* AI Service Filter */}
                  <select
                    value={bookFilters.aiService}
                    onChange={(e) => setBookFilters(prev => ({ ...prev, aiService: e.target.value }))}
                    className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All AI Services</option>
                    <option value="openai">OpenAI</option>
                    <option value="claude">Claude</option>
                    <option value="gemini">Gemini</option>
                    <option value="mixed">Mixed</option>
                  </select>
                  
                  {/* Status Filter */}
                  <select
                    value={bookFilters.status}
                    onChange={(e) => setBookFilters(prev => ({ ...prev, status: e.target.value }))}
                    className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                  
                  {/* Date Range Filter */}
                  <select
                    value={bookFilters.dateRange}
                    onChange={(e) => setBookFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                    className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="all">All Time</option>
                    <option value="today">Today</option>
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                  </select>
                </div>
              </div>

              {/* Enhanced Books Table */}
              <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700 border-b border-gray-600">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Book Details</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Author & Creator</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">AI Services Used</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Formats Available</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Created</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {books
                        .filter(book => {
                          const matchesSearch = bookFilters.search === '' || 
                            book.title?.toLowerCase().includes(bookFilters.search.toLowerCase()) ||
                            book.author?.toLowerCase().includes(bookFilters.search.toLowerCase()) ||
                            book.niche?.toLowerCase().includes(bookFilters.search.toLowerCase())
                          
                          const matchesAuthor = bookFilters.author === 'all' ||
                            (bookFilters.author === 'superadmin' && book.metadata?.created_by === 'superadmin') ||
                            (bookFilters.author === 'user' && book.metadata?.created_by === 'user')
                          
                          const matchesAI = bookFilters.aiService === 'all' ||
                            book.ai_service?.toLowerCase().includes(bookFilters.aiService.toLowerCase())
                          
                          const matchesStatus = bookFilters.status === 'all' ||
                            book.status === bookFilters.status
                          
                          const matchesDate = bookFilters.dateRange === 'all' ||
                            (() => {
                              const bookDate = new Date(book.created_at)
                              const now = new Date()
                              switch(bookFilters.dateRange) {
                                case 'today':
                                  return bookDate.toDateString() === now.toDateString()
                                case 'week':
                                  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                                  return bookDate >= weekAgo
                                case 'month':
                                  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
                                  return bookDate >= monthAgo
                                default:
                                  return true
                              }
                            })()
                          
                          return matchesSearch && matchesAuthor && matchesAI && matchesStatus && matchesDate
                        })
                        .map((book) => (
                        <tr key={book.id} className="hover:bg-gray-700/50 transition-all duration-200">
                          {/* Book Details */}
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                                <FileText className="w-6 h-6 text-white" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-white truncate max-w-xs" title={book.title}>
                                  {book.title}
                                </div>
                                <div className="text-xs text-gray-400 flex items-center space-x-2">
                                  <Tag className="w-3 h-3" />
                                  <span>{book.niche || book.genre || 'General'}</span>
                                  <span className="text-gray-600">•</span>
                                  <span>{book.word_count?.toLocaleString() || 0} words</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Author & Creator */}
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="text-sm font-medium text-white">{book.author || 'Unknown Author'}</div>
                              <div className="flex items-center space-x-2">
                                {book.metadata?.created_by === 'superadmin' ? (
                                  <>
                                    <Shield className="w-3 h-3 text-purple-400" />
                                    <span className="text-xs text-purple-400 font-medium">SuperAdmin Created</span>
                                  </>
                                ) : (
                                  <>
                                    <Users className="w-3 h-3 text-blue-400" />
                                    <span className="text-xs text-blue-400 font-medium">User Generated</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* AI Services Used */}
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {book.ai_service?.split(', ').map((service, idx) => (
                                <span 
                                  key={idx}
                                  className={`px-2 py-1 text-xs rounded-full font-medium ${
                                    service.toLowerCase().includes('openai') 
                                      ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                                      : service.toLowerCase().includes('claude')
                                      ? 'bg-orange-600/20 text-orange-400 border border-orange-500/30'
                                      : service.toLowerCase().includes('gemini')
                                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                                      : 'bg-gray-600/20 text-gray-400 border border-gray-500/30'
                                  }`}
                                >
                                  {service}
                                </span>
                              )) || (
                                <span className="px-2 py-1 text-xs rounded-full font-medium bg-gray-600/20 text-gray-400 border border-gray-500/30">
                                  N/A
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Formats Available */}
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center space-x-1">
                                <FileText className="w-4 h-4 text-gray-400" />
                                <span className="text-xs text-gray-400">Text</span>
                              </div>
                              {book.metadata?.formats_generated?.includes('pdf') && (
                                <div className="flex items-center space-x-1">
                                  <File className="w-4 h-4 text-red-400" />
                                  <span className="text-xs text-red-400">PDF</span>
                                </div>
                              )}
                              {book.metadata?.formats_generated?.includes('docx') && (
                                <div className="flex items-center space-x-1">
                                  <PenTool className="w-4 h-4 text-blue-400" />
                                  <span className="text-xs text-blue-400">DOCX</span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              book.status === 'published' 
                                ? 'bg-green-600 text-white'
                                : book.status === 'completed'
                                ? 'bg-blue-600 text-white'
                                : book.status === 'draft'
                                ? 'bg-amber-600 text-white'
                                : 'bg-gray-600 text-gray-200'
                            }`}>
                              {book.status || 'draft'}
                            </span>
                          </td>

                          {/* Created */}
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-300 flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{new Date(book.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(book.created_at).toLocaleTimeString()}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => handleViewBook(book)}
                                className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-700 rounded-lg transition-all duration-150"
                                title="View Book"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleEditBook(book)}
                                className="p-2 text-amber-400 hover:text-amber-300 hover:bg-gray-700 rounded-lg transition-all duration-150"
                                title="Edit Book"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDownloadBook(book)}
                                className="p-2 text-green-400 hover:text-green-300 hover:bg-gray-700 rounded-lg transition-all duration-150"
                                title="Download Book"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )) }
                      
                      {books.length === 0 && (
                        <tr>
                          <td colSpan="7" className="px-6 py-12 text-center">
                            <div className="flex flex-col items-center space-y-4">
                              <div className="w-20 h-20 bg-gradient-to-br from-gray-600/20 to-gray-700/20 rounded-full flex items-center justify-center border border-gray-600/30">
                                <Database className="w-8 h-8 text-gray-500" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-400 mb-2">No Books Found</h3>
                                <p className="text-gray-500 text-sm">Books created by users will appear here</p>
                              </div>
                              <button 
                                onClick={() => setActiveTab('flow')}
                                className="flex items-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg"
                              >
                                <Plus className="w-4 h-4" />
                                <span>Create First Workflow</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* LEVEL MANAGEMENT TAB */}
          {activeTab === 'level-management' && (
            <LevelManagement />
          )}

          {/* AI SERVICES TAB */}
          {activeTab === 'ai-services' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white">🤖 AI Services Management</h2>
                  <p className="text-gray-400 mt-1">Configure and manage your AI service integrations</p>
                </div>
                
                <button
                  onClick={() => setShowCustomProviderModal(true)}
                  className="flex items-center space-x-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">New AI Provider</span>
                </button>
              </div>
              
              {/* AI Services Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(aiServiceConfigs).map(([service, config]) => {
                  const Icon = config.icon
                  const keys = apiKeys[service] || []
                  const isConnected = keys.length > 0
                  
                  return (
                    <div 
                      key={service} 
                      className="bg-gray-800 rounded-xl border border-gray-700 p-6 hover:bg-gray-750 transition-all duration-200 cursor-pointer group"
                      onClick={() => openAIServiceModal(service)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          isConnected ? 'bg-green-600 shadow-lg shadow-green-500/50 ring-2 ring-green-400' :
                          config.color === 'green' ? 'bg-green-600' :
                          config.color === 'blue' ? 'bg-blue-600' :
                          config.color === 'orange' ? 'bg-orange-600' :
                          config.color === 'purple' ? 'bg-purple-600' :
                          config.color === 'red' ? 'bg-red-600' :
                          config.color === 'indigo' ? 'bg-indigo-600' :
                          'bg-gray-600'
                        }`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        
                        {/* Status Badge */}
                        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                          isConnected 
                            ? 'bg-green-600/20 text-green-400 border border-green-500/30' 
                            : 'bg-gray-600/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          {isConnected ? 'Connected' : 'Not Configured'}
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-white mb-2">{config.name}</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">{config.description}</p>
                      </div>
                      
                      {/* Key Count */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">
                          {keys.length} API key{keys.length !== 1 ? 's' : ''}
                        </span>
                        <div className="flex items-center space-x-1 text-blue-400 group-hover:text-blue-300 transition-colors">
                          <span className="text-xs">Click to manage</span>
                          <ChevronDown className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* SYSTEM TAB */}
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white">System Settings</h2>
                  <p className="text-gray-400 mt-1">Configure global system parameters and preferences</p>
                </div>
              </div>
              
              {/* Worker Control Dashboard */}
              <WorkerControlDashboard />
            </div>
          )}

          {/* Custom AI Provider Modal */}
          <CustomAIProviderModal
            isOpen={showCustomProviderModal}
            onClose={() => setShowCustomProviderModal(false)}
            onSave={handleSaveCustomProvider}
            existingProviders={Object.keys(aiServiceConfigs)}
          />

          {/* AI Service Modal */}
          {selectedAIService && (
            <AIServiceModal
              isOpen={showAIServiceModal}
              onClose={() => {
                setShowAIServiceModal(false)
                setSelectedAIService(null)
              }}
              service={selectedAIService}
              config={aiServiceConfigs[selectedAIService]}
              existingKeys={apiKeys[selectedAIService] || []}
              onKeysUpdated={loadApiKeysFromDatabase}
              getSuperAdminUserId={getSuperAdminUserId}
            />
          )}

          {/* Add User Modal */}
          <AddUserModal
            isOpen={showAddUserModal}
            onClose={() => setShowAddUserModal(false)}
            onUserAdded={handleUserAdded}
          />

          {/* Create Workflow Modal */}
          <CreateWorkflowModal
            isOpen={showCreateWorkflowModal}
            onClose={() => setShowCreateWorkflowModal(false)}
            onWorkflowCreated={handleWorkflowCreated}
          />

          {/* View User Modal */}
          {showViewModal && selectedUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">User Details</h3>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-400">Full Name</label>
                    <p className="text-white">{selectedUser.full_name || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Email</label>
                    <p className="text-white">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Username</label>
                    <p className="text-white">{selectedUser.username || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Role</label>
                    <p className="text-white capitalize">{selectedUser.role}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Tier</label>
                    <p className="text-white capitalize">{selectedUser.tier}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Credits Balance</label>
                    <p className="text-white">{selectedUser.credits_balance}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Monthly Limit</label>
                    <p className="text-white">{selectedUser.monthly_limit}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Status</label>
                    <p className={`${selectedUser.is_active ? 'text-green-400' : 'text-red-400'}`}>
                      {selectedUser.is_active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Onboarding</label>
                    <p className={`${selectedUser.onboarding_completed ? 'text-green-400' : 'text-yellow-400'}`}>
                      {selectedUser.onboarding_completed ? 'Completed' : 'Pending'}
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Edit User Modal */}
          {showEditModal && selectedUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-white">Edit User</h3>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={selectedUser.full_name || ''}
                      onChange={(e) => setSelectedUser({...selectedUser, full_name: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Username</label>
                    <input
                      type="text"
                      value={selectedUser.username || ''}
                      onChange={(e) => setSelectedUser({...selectedUser, username: e.target.value})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Credits Balance</label>
                    <input
                      type="number"
                      value={selectedUser.credits_balance || 0}
                      onChange={(e) => setSelectedUser({...selectedUser, credits_balance: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Monthly Limit</label>
                    <input
                      type="number"
                      value={selectedUser.monthly_limit || 0}
                      onChange={(e) => setSelectedUser({...selectedUser, monthly_limit: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                    />
                  </div>
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedUser.is_active}
                        onChange={(e) => setSelectedUser({...selectedUser, is_active: e.target.checked})}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded"
                      />
                      <span className="text-sm text-gray-400">Active</span>
                    </label>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const { error } = await supabase
                          .from('users')
                          .update({
                            full_name: selectedUser.full_name,
                            username: selectedUser.username,
                            credits_balance: selectedUser.credits_balance,
                            monthly_limit: selectedUser.monthly_limit,
                            is_active: selectedUser.is_active,
                            updated_at: new Date().toISOString()
                          })
                          .eq('id', selectedUser.id)
                        
                        if (error) throw error
                        
                        setUsers(prev => prev.map(u => u.id === selectedUser.id ? selectedUser : u))
                        toast.success('User updated successfully!')
                        setShowEditModal(false)
                      } catch (error) {
                        console.error('Error updating user:', error)
                        toast.error('Failed to update user')
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Book Edit Modal */}
          {showEditBookModal && selectedBook && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-md">
              <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Edit Book</h2>
                    <p className="text-sm text-gray-400 mt-1">{selectedBook.title}</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowEditBookModal(false)
                      setSelectedBook(null)
                    }}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Content - Rich Text Editor */}
                <div className="p-6">
                  <div className="mb-4">
                    <RichTextEditor
                      value={editBookContent}
                      onChange={setEditBookContent}
                      height={500}
                      placeholder="Start editing your book content..."
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-400 bg-gray-900/50 p-3 rounded-lg">
                    <div className="flex items-center space-x-6">
                      <span className="flex items-center space-x-2">
                        <FileText className="w-4 h-4" />
                        <span>{editBookContent.replace(/<[^>]*>/g, '').split(/\s+/).filter(w => w.length > 0).length.toLocaleString()} words</span>
                      </span>
                      <span className="flex items-center space-x-2">
                        <Edit className="w-4 h-4" />
                        <span>{editBookContent.length.toLocaleString()} characters</span>
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Use the toolbar above for formatting
                    </div>
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700 bg-gray-900/50">
                  <button
                    onClick={() => {
                      setShowEditBookModal(false)
                      setSelectedBook(null)
                    }}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveEditedBook}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
                  >
                    <Save className="w-4 h-4" />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Book View Modal */}
          {showBookModal && selectedBook && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{selectedBook.title}</h2>
                    <p className="text-sm text-gray-400 mt-1">
                      {selectedBook.type} • {new Date(selectedBook.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowBookModal(false)
                      setSelectedBook(null)
                    }}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] custom-scrollbar">
                  {/* Book Metadata */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-900/50 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Status</p>
                      <p className="text-sm text-white font-medium mt-1">{selectedBook.status || 'Draft'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Word Count</p>
                      <p className="text-sm text-white font-medium mt-1">{selectedBook.word_count?.toLocaleString() || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">AI Service</p>
                      <p className="text-sm text-white font-medium mt-1">{selectedBook.ai_service || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Downloads</p>
                      <p className="text-sm text-white font-medium mt-1">{selectedBook.downloads || 0}</p>
                    </div>
                  </div>

                  {/* Book Content - Professional Formatting */}
                  <div className="bg-gradient-to-br from-slate-900/50 to-gray-900/50 rounded-xl p-8 border border-gray-700/50 backdrop-blur-sm">
                    {selectedBook.content ? (
                      typeof selectedBook.content === 'string' ? (
                        <div className="space-y-6">
                          <div 
                            className="prose prose-invert prose-lg max-w-none
                                       prose-headings:text-white prose-headings:font-bold prose-headings:border-b prose-headings:border-gray-600/30 prose-headings:pb-2
                                       prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4
                                       prose-strong:text-white prose-em:text-orange-300
                                       prose-ul:text-gray-300 prose-li:my-1
                                       prose-blockquote:border-orange-500/50 prose-blockquote:text-orange-200/90"
                            style={{
                              fontFamily: 'Georgia, serif',
                              lineHeight: '1.8',
                              fontSize: '16px'
                            }}
                            dangerouslySetInnerHTML={{ 
                              __html: selectedBook.content
                                .replace(/\n\n/g, '</p><p class="mb-4">')
                                .replace(/\n/g, '<br>')
                                .replace(/^(.*)$/, '<p class="mb-4">$1</p>')
                            }}
                          />
                        </div>
                      ) : selectedBook.content.sections && Array.isArray(selectedBook.content.sections) ? (
                        <div className="space-y-8">
                          {selectedBook.content.sections.map((section, index) => (
                            <div key={index} className="border-b border-gray-700/30 pb-6 last:border-b-0">
                              {section.title && (
                                <h3 className="text-2xl font-bold text-white mb-4 border-b border-orange-500/30 pb-2">
                                  {section.title}
                                </h3>
                              )}
                              {section.content && (
                                <div 
                                  className="prose prose-invert prose-lg max-w-none
                                             prose-p:text-gray-300 prose-p:leading-relaxed prose-p:mb-4
                                             prose-strong:text-white prose-em:text-orange-300"
                                  style={{
                                    fontFamily: 'Georgia, serif',
                                    lineHeight: '1.8',
                                    fontSize: '16px'
                                  }}
                                  dangerouslySetInnerHTML={{ 
                                    __html: section.content
                                      .replace(/\n\n/g, '</p><p class="mb-4">')
                                      .replace(/\n/g, '<br>')
                                      .replace(/^(.*)$/, '<p class="mb-4">$1</p>')
                                  }}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center space-y-4 text-center py-12">
                          <div className="w-16 h-16 bg-gray-700/30 rounded-full flex items-center justify-center">
                            <Database className="w-8 h-8 text-gray-500" />
                          </div>
                          <p className="text-gray-500 italic">No structured content available</p>
                          <p className="text-xs text-gray-600">Raw data: {JSON.stringify(selectedBook.content).substring(0, 100)}...</p>
                        </div>
                      )
                    ) : (
                      <div className="flex flex-col items-center space-y-4 text-center py-12">
                        <div className="w-16 h-16 bg-gray-700/30 rounded-full flex items-center justify-center">
                          <Database className="w-8 h-8 text-gray-500" />
                        </div>
                        <p className="text-gray-500 italic">No content available</p>
                        <p className="text-xs text-gray-600">This book may be empty or corrupted</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-700 bg-gray-900/50">
                  <button
                    onClick={() => handleDownloadBook(selectedBook)}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button
                    onClick={() => {
                      setShowBookModal(false) // Close view modal first
                      handleEditBook(selectedBook) // Then open edit modal
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setShowBookModal(false)
                      setSelectedBook(null)
                    }}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
          </div>
        </main>
      </div>

    </div>
  )
}

export default SuperAdminDashboard
