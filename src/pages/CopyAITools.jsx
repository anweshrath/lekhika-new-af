import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Wand2, 
  FileText, 
  Mail, 
  Megaphone, 
  Users, 
  TrendingUp,
  Lightbulb,
  Target,
  Zap,
  Search,
  Filter,
  Star,
  Clock,
  Copy,
  Download,
  Play,
  Settings,
  Brain,
  Sparkles,
  PenTool,
  MessageSquare,
  Globe,
  Share2,
  Bookmark,
  Heart,
  Eye,
  ChevronRight,
  Plus,
  Layers,
  Palette,
  Code,
  Image,
  Video,
  Mic,
  BarChart3,
  Rocket,
  Crown,
  Gem,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react'
import CopyAITemplates from '../components/CopyAITemplates'
import AIWorkflowBuilder from '../components/AIWorkflowBuilder'
import toast from 'react-hot-toast'
import { ultraToast } from '../utils/ultraToast'
import alchemistService from '../services/alchemistService'
import { useUserAuth } from '../contexts/UserAuthContext'
import { useTheme } from '../contexts/ThemeContext'
import UltraCard from '../components/UltraCard'
import UltraButton from '../components/UltraButton'
import UltraInput from '../components/UltraInput'
import UltraLoader from '../components/UltraLoader'
import UltraProgress from '../components/UltraProgress'
import CelebrationModal from '../components/CelebrationModal'
import AlchemistDataFlow from '../services/alchemistDataFlow'

const CopyAITools = () => {
  const { user } = useUserAuth()
  const { isDark } = useTheme()
  const [activeTab, setActiveTab] = useState('templates')
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [selectedFlow, setSelectedFlow] = useState(null)
  const [flows, setFlows] = useState([])
  const [generatedContent, setGeneratedContent] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [inputData, setInputData] = useState({})
  const [savedContent, setSavedContent] = useState([])
  const [showWorkflowBuilder, setShowWorkflowBuilder] = useState(false)
  const [loadingFlows, setLoadingFlows] = useState(true)
  const [loadingContent, setLoadingContent] = useState(true)
  const [executionProgress, setExecutionProgress] = useState(null)
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrationData, setCelebrationData] = useState(null)
  
  // Refs for scroll management
  const contentRef = useRef(null)
  const generatorRef = useRef(null)
  const templatesRef = useRef(null)

  // Fetch alchemist flows from database on mount
  useEffect(() => {
    const fetchFlows = async () => {
      try {
        setLoadingFlows(true)
        const flowsData = await alchemistService.getFlows()
        setFlows(flowsData)
        console.log('✅ Loaded flows from database:', flowsData.length)
    } catch (error) {
        console.error('❌ Failed to load flows:', error)
        ultraToast.error('Failed to load templates from database')
      } finally {
        setLoadingFlows(false)
    }
    }
    fetchFlows()
  }, [])

  // Fetch user's saved content from database on mount
  useEffect(() => {
    const fetchSavedContent = async () => {
      if (!user?.id) {
        setLoadingContent(false)
        return
      }

      try {
        setLoadingContent(true)
        const content = await alchemistService.getUserContent(user.id)
        setSavedContent(content)
        console.log('✅ Loaded user content from database:', content.length)
    } catch (error) {
        console.error('❌ Failed to load user content:', error)
        toast.error('Failed to load your saved content')
      } finally {
        setLoadingContent(false)
    }
    }
    fetchSavedContent()
  }, [user?.id])

  const tabs = [
    { id: 'templates', name: 'AI Templates', icon: Wand2, description: 'Browse 100+ proven templates' },
    { id: 'generator', name: 'Content Generator', icon: Brain, description: 'Create custom content' },
    { id: 'workflows', name: 'Workflows', icon: Layers, description: 'Automate your process' },
    { id: 'library', name: 'My Content', icon: Bookmark, description: 'Saved creations' }
  ]

  const quickActions = [
    {
      id: 'blog-post',
      name: 'Blog Post',
      description: 'SEO-optimized blog content',
      icon: FileText,
      color: 'blue',
      popular: true,
      inputs: ['Topic', 'Target Audience', 'Tone', 'Word Count', 'Keywords']
    },
    {
      id: 'email-campaign',
      name: 'Email Campaign',
      description: 'High-converting email sequences',
      icon: Mail,
      color: 'green',
      popular: true,
      inputs: ['Subject Line', 'Audience', 'Goal', 'Call to Action', 'Tone']
    },
    {
      id: 'social-media',
      name: 'Social Posts',
      description: 'Engaging social media content',
      icon: Users,
      color: 'purple',
      popular: true,
      inputs: ['Platform', 'Topic', 'Tone', 'Hashtags', 'Call to Action']
    },
    {
      id: 'sales-copy',
      name: 'Sales Copy',
      description: 'Persuasive sales pages',
      icon: TrendingUp,
      color: 'orange',
      popular: false,
      inputs: ['Product/Service', 'Target Market', 'Benefits', 'Price Point', 'Urgency']
    },
    {
      id: 'ad-copy',
      name: 'Ad Copy',
      description: 'High-converting advertisements',
      icon: Target,
      color: 'red',
      popular: false,
      inputs: ['Platform', 'Product', 'Audience', 'Budget', 'Objective']
    },
    {
      id: 'video-script',
      name: 'Video Script',
      description: 'Engaging video content',
      icon: Video,
      color: 'pink',
      popular: false,
      inputs: ['Video Type', 'Duration', 'Topic', 'Audience', 'Call to Action']
    }
  ]

  // Map action colors to theme variables
  const getActionColor = (colorName) => {
    const colorMap = {
      'blue': 'var(--theme-primary)',
      'green': 'var(--theme-success)',
      'purple': 'var(--theme-secondary)',
      'orange': 'var(--theme-warning)',
      'red': 'var(--theme-error)',
      'pink': 'var(--theme-accent)'
    }
    return colorMap[colorName] || 'var(--theme-primary)'
  }

  // Smooth scroll to element
  const scrollToElement = (elementRef, offset = 100) => {
    if (elementRef.current) {
      const element = elementRef.current
      const container = contentRef.current
      
      if (container) {
        const containerRect = container.getBoundingClientRect()
        const elementRect = element.getBoundingClientRect()
        const scrollTop = container.scrollTop + elementRect.top - containerRect.top - offset
        
        container.scrollTo({
          top: scrollTop,
          behavior: 'smooth'
        })
      }
    }
  }

  // Handle tab changes with proper scrolling
  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    
    // Scroll to appropriate section after tab change
    setTimeout(() => {
      switch (tabId) {
        case 'generator':
          scrollToElement(generatorRef, 50)
          break
        case 'templates':
          scrollToElement(templatesRef, 50)
          break
        default:
          // Scroll to top for other tabs
          if (contentRef.current) {
            contentRef.current.scrollTo({ top: 0, behavior: 'smooth' })
          }
      }
    }, 100)
  }

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template)
    setInputData({}) // Clear previous input data
    setActiveTab('generator')
    ultraToast.success(`✨ Template "${template.name}" loaded!`)
    
    // Scroll to generator section after template selection
    setTimeout(() => {
      scrollToElement(generatorRef, 50)
    }, 200)
  }

  const handleFlowSelect = (flow) => {
    setSelectedFlow(flow)
    setSelectedTemplate(null)
    setInputData({})
    setGeneratedContent('')
    setActiveTab('generator')
    ultraToast.success(`✨ Flow "${flow.name}" loaded!`)
    
    // Scroll to generator section
    setTimeout(() => {
      scrollToElement(generatorRef, 50)
    }, 200)
  }

  const generateContent = async () => {
    if (!selectedFlow) {
      toast.error('Please select a flow first')
      return
    }

    if (!user?.id) {
      toast.error('Please log in to generate content')
      return
    }

    // Extract input fields from flow's input node
    const inputFields = alchemistService.extractInputFields(selectedFlow)

    // Validate required inputs
    const requiredFields = inputFields.filter(field => field.required)
    const missingFields = requiredFields.filter(field => !inputData[field.name]?.trim())
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in: ${missingFields.map(f => f.label || f.name).join(', ')}`)
      return
    }

    setIsGenerating(true)
    setExecutionProgress({ stage: 'Initializing...', percent: 0 })
    
    try {
      const startTime = Date.now()
      
      // Execute flow using AlchemistDataFlow
      console.log('🚀 Executing flow:', selectedFlow.name)
      console.log('📥 Input data:', inputData)
      
      const alchemistFlow = new AlchemistDataFlow()
      
      // Execute with progress callback
      const result = await alchemistFlow.executeFlowNodes(
        selectedFlow.nodes,
        selectedFlow.edges,
        inputData,
        { workflowId: selectedFlow.id, workflowName: selectedFlow.name },
        (progress) => {
          setExecutionProgress({
            stage: progress.stage || 'Processing...',
            percent: progress.percent || 0
          })
        }
      )
      
      const generationTimeMs = Date.now() - startTime
      
      console.log('✅ Flow execution result:', result)
      
      // Extract generated content from result
      const content = result.finalOutput || result.outputData || JSON.stringify(result, null, 2)
      setGeneratedContent(content)
      
      // Calculate stats
      const wordCount = content.split(/\s+/).length
      const characterCount = content.length
      
      // Save to database
      const savedItem = await alchemistService.saveContent(user.id, {
        flowId: selectedFlow.id,
        flowName: selectedFlow.name,
        flowCategory: selectedFlow.category || 'general',
        inputData: inputData,
        generatedContent: content,
        metadata: {
          framework: selectedFlow.framework,
          executionId: result.executionId
        },
        wordCount: wordCount,
        characterCount: characterCount,
        tokensUsed: result.totalTokens || 0,
        // costUsd: result.totalCost || 0, // Removed - not shown to users
        providerUsed: result.providerUsed || 'unknown',
        modelUsed: result.modelUsed || 'unknown',
        generationTimeMs: generationTimeMs
      })
      
      // Update saved content list
      setSavedContent(prev => [savedItem, ...prev])
      
      // Show celebration modal
      setCelebrationData({
        title: '🎉 Content Created!',
        message: `Your ${selectedFlow.name} is ready!`,
        stats: {
          wordCount,
          tokensUsed: result.totalTokens || 0,
          timeMs: generationTimeMs
        }
      })
      setShowCelebration(true)
      setExecutionProgress(null)
      
      // Also show toast for quick feedback
      ultraToast.celebration(`🎉 ${selectedFlow.name} Generated Successfully!`)
      
    } catch (error) {
      console.error('❌ Generation error:', error)
      ultraToast.error(`Failed to generate content: ${error.message}`)
      setExecutionProgress(null)
    } finally {
      setIsGenerating(false)
    }
  }

  const saveContentManually = async () => {
    // Content is already auto-saved during generation
    // This function is kept for manual re-save if needed
    if (!generatedContent) {
      toast.error('No content to save')
      return
    }
    
    if (!user?.id) {
      toast.error('Please log in to save content')
      return
    }

    if (!selectedFlow) {
      toast.error('No flow selected')
      return
    }

    try {
      const savedItem = await alchemistService.saveContent(user.id, {
        flowId: selectedFlow.id,
        flowName: selectedFlow.name,
        flowCategory: selectedFlow.category || 'general',
        inputData: inputData,
        generatedContent: generatedContent,
        metadata: {
          framework: selectedFlow.framework,
          manualSave: true
        },
        wordCount: generatedContent.split(/\s+/).length,
        characterCount: generatedContent.length,
        tokensUsed: 0,
        // costUsd: 0, // Removed - not shown to users
        providerUsed: 'manual',
        modelUsed: 'manual',
        generationTimeMs: 0
      })

      setSavedContent(prev => [savedItem, ...prev])
    ultraToast.success('💾 Content saved to your library!')
    } catch (error) {
      console.error('❌ Save error:', error)
      toast.error('Failed to save content')
    }
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      ultraToast.success('📋 Copied to clipboard!')
    } catch (error) {
      console.error('Copy failed:', error)
      toast.error('Failed to copy to clipboard')
    }
  }

  const exportContent = (format = 'txt') => {
    if (!generatedContent) {
      toast.error('No content to export')
      return
    }
    
    try {
      const blob = new Blob([generatedContent], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${selectedTemplate?.name || 'content'}-${Date.now()}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      ultraToast.success(`📥 Exported as ${format.toUpperCase()}`)
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Failed to export content')
    }
  }

  const deleteContent = async (contentId) => {
    if (!user?.id) {
      toast.error('Please log in to delete content')
      return
    }

    try {
      await alchemistService.deleteContent(contentId, user.id)
    setSavedContent(prev => prev.filter(item => item.id !== contentId))
      ultraToast.success('🗑️ Content deleted from database')
    } catch (error) {
      console.error('❌ Delete error:', error)
      toast.error('Failed to delete content')
    }
  }

  const loadSavedContent = async (content) => {
    try {
      // Load the generated content
      setGeneratedContent(content.generated_content)
      
      // Try to find and load the flow
      if (content.flow_id) {
        const flow = flows.find(f => f.id === content.flow_id)
        if (flow) {
          setSelectedFlow(flow)
          setSelectedTemplate(null)
        }
      }
      
      // Load input data
      setInputData(content.input_data || {})
    setActiveTab('generator')
    toast.success('📂 Content loaded!')
    } catch (error) {
      console.error('❌ Load error:', error)
      toast.error('Failed to load content')
    }
    
    setTimeout(() => {
      scrollToElement(generatorRef, 50)
    }, 200)
  }

  return (
    <div ref={contentRef} className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header - Premium */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="inline-flex items-center justify-center space-x-3 mb-2"
        >
          <motion.div
            className="p-3 rounded-xl theme-animate"
            style={{ 
              background: 'var(--bg-elevated)',
              border: '2px solid var(--theme-primary)'
            }}
            animate={{ 
              rotate: [0, 5, -5, 0],
              scale: [1, 1.05, 1]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Wand2 className="w-8 h-8" style={{ color: 'var(--theme-primary)' }} />
          </motion.div>
        <motion.h1 
            className="text-4xl font-bold"
            style={{
              background: 'var(--theme-gradient-primary)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: 'var(--weight-bold)',
              letterSpacing: 'var(--tracking-tight)'
            }}
          >
            Alchemist's Lab
        </motion.h1>
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg"
          style={{ 
            color: 'var(--text-secondary)',
            lineHeight: 'var(--leading-relaxed)',
            maxWidth: '600px',
            margin: '0 auto'
          }}
        >
          Transform ideas into high-converting content with AI-powered precision
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full shimmer"
          style={{ 
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)'
          }}
        >
          <Crown className="w-4 h-4" style={{ color: 'var(--theme-accent)' }} />
          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
            Professional Writing Suite
          </span>
        </motion.div>
      </div>

      {/* Quick Actions - Flow Cards from Database */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {loadingFlows ? (
          // Loading state - ULTRA VERSION
          Array.from({ length: 6 }).map((_, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="skeleton-ultra h-32 rounded-2xl" />
            </motion.div>
          ))
        ) : flows.length > 0 ? (
          flows.slice(0, 6).map((flow, idx) => (
          <motion.div
              key={flow.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              whileHover={{ scale: 1.03, y: -6 }}
              whileTap={{ scale: 0.97 }}
              className="card-elevated cursor-pointer group relative overflow-hidden"
              style={{
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-4)'
              }}
              onClick={() => handleFlowSelect(flow)}
            >
              {/* Subtle gradient overlay on hover */}
              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 0.03 }}
                transition={{ duration: 0.3 }}
                style={{
                  background: 'var(--theme-gradient-primary)',
                  pointerEvents: 'none'
                }}
              />
              
              {idx < 3 && (
                <motion.div 
                  className="absolute top-2 right-2 shimmer"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <Star className="w-4 h-4 fill-current" style={{ color: 'var(--theme-accent)' }} />
                </motion.div>
              )}
              
              <div className="relative z-10">
                <motion.div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 theme-animate"
                  style={{ 
                    background: 'var(--bg-hover)',
                    border: `2px solid var(--theme-primary)`
                  }}
                  whileHover={{ scale: 1.15, rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.4 }}
                >
                  <Wand2 className="w-6 h-6" style={{ color: 'var(--theme-primary)' }} />
                </motion.div>
                
                <h3 
                  className="font-semibold text-sm mb-1"
                  style={{ 
                    color: 'var(--text-primary)',
                    fontWeight: 'var(--weight-semibold)'
                  }}
                >
                  {flow.name}
            </h3>
                <p 
                  className="text-xs line-clamp-2"
                  style={{ 
                    color: 'var(--text-secondary)',
                    lineHeight: 'var(--leading-relaxed)'
                  }}
                >
                  {flow.description || 'AI-powered content generation'}
                </p>
              </div>
          </motion.div>
          ))
        ) : (
          <div className="col-span-full text-center py-8" style={{ color: 'var(--text-secondary)' }}>
            No flows available. Please contact admin.
          </div>
        )}
      </div>

      {/* Navigation Tabs - Premium Design */}
      <div className="card-elevated" style={{ padding: 'var(--space-2)', borderRadius: 'var(--radius-xl)' }}>
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleTabChange(tab.id)}
              className="flex-1 flex flex-col items-center px-4 py-4 rounded-lg transition-all relative overflow-hidden"
              style={{
                background: activeTab === tab.id ? 'var(--bg-elevated)' : 'transparent',
                border: activeTab === tab.id ? `2px solid var(--theme-primary)` : '2px solid transparent',
                fontWeight: activeTab === tab.id ? 'var(--weight-semibold)' : 'var(--weight-medium)'
              }}
            >
              {/* Active indicator */}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 rounded-lg"
                  style={{ background: 'var(--theme-primary)', opacity: 0.05 }}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              <tab.icon 
                className="w-5 h-5 mb-2" 
                style={{ 
                  color: activeTab === tab.id ? 'var(--theme-primary)' : 'var(--text-tertiary)'
                }} 
              />
              <div className="text-center relative z-10">
                <div 
                  className="font-medium text-sm"
                  style={{ 
                    color: activeTab === tab.id ? 'var(--theme-primary)' : 'var(--text-secondary)'
                  }}
                >
                  {tab.name}
                </div>
                <div 
                  className="text-xs mt-0.5"
                  style={{ 
                    color: activeTab === tab.id ? 'var(--text-secondary)' : 'var(--text-tertiary)',
                    opacity: 0.9
                  }}
                >
                  {tab.description}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <motion.div
            ref={templatesRef}
            key="templates"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <CopyAITemplates onSelectTemplate={handleTemplateSelect} />
          </motion.div>
        )}

        {/* Content Generator Tab */}
        {activeTab === 'generator' && (
          <motion.div
            ref={generatorRef}
            key="generator"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid lg:grid-cols-2 gap-6"
          >
            {/* Input Panel - Premium */}
            <div className="space-y-6">
              <div className="card-elevated" style={{ 
                padding: 'var(--space-6)', 
                borderRadius: 'var(--radius-xl)' 
              }}>
                <div className="flex items-center gap-3 mb-6">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ background: 'var(--bg-hover)' }}
                  >
                    <Target className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />
                  </div>
                  <h3 
                    className="text-xl font-semibold" 
                    style={{ 
                      color: 'var(--text-primary)',
                      fontWeight: 'var(--weight-semibold)'
                    }}
                  >
                    Content Configuration
                </h3>
                </div>
                
                {selectedFlow ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg" style={{ 
                      background: 'var(--bg-elevated)', 
                      border: '1px solid var(--border-default)' 
                    }}>
                      <div className="flex items-center mb-2">
                        <Wand2 className="w-5 h-5 mr-2" style={{ color: 'var(--theme-primary)' }} />
                        <span className="font-medium" style={{ color: 'var(--theme-primary)' }}>
                          {selectedFlow.name}
                        </span>
                      </div>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        {selectedFlow.description || 'AI-powered content generation'}
                      </p>
                      {selectedFlow.framework && (
                        <div className="mt-2">
                          <span className="text-xs px-3 py-1 rounded-full" style={{ 
                            background: 'var(--bg-canvas)', 
                            color: 'var(--theme-accent)',
                            border: '1px solid var(--border-default)'
                          }}>
                            {selectedFlow.framework} Framework
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Dynamic form fields from flow's input node - ULTRA VERSION */}
                    {alchemistService.extractInputFields(selectedFlow).map((field, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <UltraFormField
                          field={field}
                          value={inputData[field.name] || ''}
                          onChange={(value) => setInputData({ ...inputData, [field.name]: value })}
                        />
                      </motion.div>
                    ))}

                    {/* Execution progress - ULTRA VERSION */}
                    {executionProgress && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <UltraProgress
                          value={executionProgress.percent || 0}
                          label={executionProgress.stage || 'Processing...'}
                          size="lg"
                          animated={true}
                        />
                      </motion.div>
                    )}

                    <UltraButton
                      onClick={generateContent}
                      disabled={isGenerating}
                      loading={isGenerating}
                      icon={isGenerating ? null : Brain}
                      variant="primary"
                      size="xl"
                      fullWidth
                    >
                      {isGenerating ? (
                        'AI Creating Magic...'
                      ) : (
                        '✨ Generate Amazing Content'
                      )}
                    </UltraButton>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Wand2 className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-tertiary)' }} />
                    <h4 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      Select a Flow
                    </h4>
                    <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>
                      Choose from our AI workflows to generate professional content
                    </p>
                    <button
                      onClick={() => handleTabChange('templates')}
                      className="btn-secondary"
                    >
                      Browse Flows
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Output Panel - Premium */}
            <div className="space-y-6">
              <div className="card-elevated" style={{ 
                padding: 'var(--space-6)', 
                borderRadius: 'var(--radius-xl)' 
              }}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div 
                      className="p-2 rounded-lg theme-animate"
                      style={{ background: 'var(--bg-hover)' }}
                    >
                      <Sparkles className="w-5 h-5" style={{ color: 'var(--theme-secondary)' }} />
                    </div>
                    <h3 
                      className="text-xl font-semibold" 
                      style={{ 
                        color: 'var(--text-primary)',
                        fontWeight: 'var(--weight-semibold)'
                      }}
                    >
                      Generated Content
                  </h3>
                  </div>
                  {generatedContent && (
                    <div className="flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => copyToClipboard(generatedContent)}
                        className="px-3 py-2 rounded-lg flex items-center gap-2 professional-hover focus-ring"
                        style={{ 
                          color: 'var(--text-primary)',
                          background: 'var(--bg-hover)',
                          border: '1px solid var(--border-default)'
                        }}
                        title="Copy to clipboard"
                      >
                        <Copy className="w-4 h-4" />
                        <span className="text-xs font-medium">Copy</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={saveContent}
                        className="px-3 py-2 rounded-lg flex items-center gap-2 subtle-glow"
                        style={{ 
                          color: 'white',
                          background: 'var(--theme-success)',
                          border: '1px solid var(--theme-success)'
                        }}
                        title="Save to library"
                      >
                        <Bookmark className="w-4 h-4" />
                        <span className="text-xs font-medium">Save</span>
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => exportContent('txt')}
                        className="px-3 py-2 rounded-lg flex items-center gap-2 professional-hover focus-ring"
                        style={{ 
                          color: 'var(--text-primary)',
                          background: 'var(--bg-hover)',
                          border: '1px solid var(--border-default)'
                        }}
                        title="Export content"
                      >
                        <Download className="w-4 h-4" />
                        <span className="text-xs font-medium">Export</span>
                      </motion.button>
                    </div>
                  )}
                </div>

                {generatedContent ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="rounded-lg p-6 min-h-[400px] max-h-[600px] overflow-y-auto relative"
                    style={{ 
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <pre className="whitespace-pre-wrap text-sm leading-relaxed" style={{ 
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 'var(--text-sm)'
                    }}>
                      {generatedContent}
                    </pre>
                    <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--border-default)' }}>
                      <div className="flex items-center justify-between">
                        <div className="flex gap-4">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ background: 'var(--theme-success)' }}
                            />
                            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                              {generatedContent.split(' ').length} words
                        </span>
                      </div>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-2 h-2 rounded-full"
                              style={{ background: 'var(--theme-secondary)' }}
                            />
                            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                              {generatedContent.length} chars
                            </span>
                    </div>
                  </div>
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full success-feedback" style={{ 
                          background: 'var(--theme-success)',
                          opacity: 0.9
                        }}>
                          <CheckCircle className="w-3 h-3" style={{ color: 'white' }} />
                          <span className="text-xs font-semibold" style={{ color: 'white' }}>
                            Ready
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <div className="rounded-lg p-12 text-center min-h-[400px] flex items-center justify-center" style={{ 
                    background: 'var(--bg-surface)',
                    border: '2px dashed var(--border-default)'
                  }}>
                    <div>
                      <motion.div
                        animate={{ 
                          y: [0, -10, 0],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <PenTool className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-tertiary)' }} />
                      </motion.div>
                      <p className="text-base font-medium" style={{ color: 'var(--text-secondary)' }}>
                        Your AI-generated content will appear here
                      </p>
                      <p className="text-sm mt-2" style={{ color: 'var(--text-tertiary)' }}>
                        Configure and generate to see magic happen
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Workflows Tab */}
        {activeTab === 'workflows' && (
          <motion.div
            key="workflows"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <AIWorkflowBuilder />
          </motion.div>
        )}

        {/* My Content Tab */}
        {activeTab === 'library' && (
          <motion.div
            key="library"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div 
                  className="p-2 rounded-lg"
                  style={{ background: 'var(--bg-elevated)' }}
                >
                  <Bookmark className="w-5 h-5" style={{ color: 'var(--theme-accent)' }} />
                </div>
                <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  My Content Library
              </h3>
              </div>
              <div 
                className="px-4 py-2 rounded-full"
                style={{ 
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)'
                }}
              >
                <span className="text-sm font-semibold" style={{ color: 'var(--theme-primary)' }}>
                  {savedContent.length}
                </span>
                <span className="text-sm ml-1" style={{ color: 'var(--text-secondary)' }}>
                  saved
                </span>
              </div>
            </div>

            {loadingContent ? (
              <UltraLoader type="pulse" size="lg" message="Loading your masterpieces..." />
            ) : savedContent.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {savedContent.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    whileHover={{ y: -3, scale: 1.01 }}
                    className="card-elevated cursor-pointer"
                    style={{
                      padding: 'var(--space-5)',
                      borderRadius: 'var(--radius-lg)'
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {item.flow_name}
                        </h4>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {new Date(item.created_at).toLocaleDateString()} • {item.word_count} words
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => loadSavedContent(item)}
                          className="p-2 rounded-lg subtle-glow"
                          style={{ 
                            background: 'var(--theme-primary)',
                            color: 'white'
                          }}
                          title="Load content"
                        >
                          <Play className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => copyToClipboard(item.generated_content)}
                          className="p-2 rounded-lg professional-hover focus-ring"
                          style={{ color: 'var(--text-secondary)' }}
                          title="Copy content"
                        >
                          <Copy className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            const blob = new Blob([item.generated_content], { type: 'text/plain' })
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = `${item.flow_name}-${item.id}.txt`
                            a.click()
                            URL.revokeObjectURL(url)
                            toast.success('📥 Content exported!')
                          }}
                          className="p-2 rounded-lg professional-hover focus-ring"
                          style={{ color: 'var(--theme-success)' }}
                          title="Export content"
                        >
                          <Download className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => deleteContent(item.id)}
                          className="p-2 rounded-lg professional-hover focus-ring"
                          style={{ color: 'var(--theme-error)' }}
                          title="Delete content"
                        >
                          <X className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>
                    <div className="rounded-lg p-4 mt-3" style={{ 
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)'
                    }}>
                      <p className="text-sm line-clamp-3 leading-relaxed" style={{ 
                        color: 'var(--text-primary)',
                        fontFamily: 'var(--font-primary)'
                      }}>
                        {item.generated_content.substring(0, 200)}...
                      </p>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex gap-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--theme-secondary)' }} />
                          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                            {item.characterCount} chars
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3" style={{ color: 'var(--text-tertiary)' }} />
                          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                            {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full" style={{ 
                        background: 'var(--theme-success)',
                        opacity: 0.1
                      }}>
                        <CheckCircle className="w-3 h-3" style={{ color: 'var(--theme-success)' }} />
                        <span className="text-xs font-medium" style={{ color: 'var(--theme-success)' }}>
                        Saved
                      </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card-elevated text-center py-16"
                style={{
                  borderRadius: 'var(--radius-xl)',
                  border: '2px dashed var(--border-default)'
                }}
              >
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Bookmark className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--text-tertiary)' }} />
                </motion.div>
                <h4 className="text-lg font-semibold mb-2" style={{ 
                  color: 'var(--text-primary)',
                  fontWeight: 'var(--weight-semibold)'
                }}>
                  No Content Saved Yet
                </h4>
                <p className="mb-6 max-w-md mx-auto" style={{ 
                  color: 'var(--text-secondary)',
                  lineHeight: 'var(--leading-relaxed)'
                }}>
                  Generate and save content to build your professional library
                </p>
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleTabChange('templates')}
                  className="btn-primary subtle-glow"
                >
                  Start Creating
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Celebration Modal */}
      <CelebrationModal
        isOpen={showCelebration}
        onClose={() => setShowCelebration(false)}
        title={celebrationData?.title}
        message={celebrationData?.message}
        stats={celebrationData?.stats}
        onView={() => {
          setShowCelebration(false)
          handleTabChange('library')
        }}
      />
    </div>
  )
}

export default CopyAITools
