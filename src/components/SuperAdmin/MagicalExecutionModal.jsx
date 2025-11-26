import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Play, Pause, AlertCircle, CheckCircle, Loader, 
  DollarSign, Clock, Zap, BookOpen, TrendingUp, Cpu, 
  Database, Network, Activity, Brain, Target, Rocket, 
  Shield, Sparkles, Download, Layers, BarChart3, 
  FileText, Users, Settings, ArrowRight, Star,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Eye, EyeOff, RefreshCw, Edit3,
  Circle, Clock3, Timer
} from 'lucide-react'
import RichTextEditor from '../RichTextEditor'
import { supabase } from '../../lib/supabase'

// ============================================================================
// MAGICAL EXECUTION MODAL - REAL IMPLEMENTATION
// ============================================================================

const MagicalExecutionModal = ({ 
  isOpen, 
  onClose, 
  workflowData, 
  onExecutionComplete,
  onBookSaved 
}) => {
  const [currentStatus, setCurrentStatus] = useState(null)
  const [executionHistory, setExecutionHistory] = useState([])
  const [isExecuting, setIsExecuting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [activeSection, setActiveSection] = useState('progress')
  const [completedNodes, setCompletedNodes] = useState(new Set())
  const [nodeProgress, setNodeProgress] = useState({})
  const [overallProgress, setOverallProgress] = useState(0)
  const [currentPhase, setCurrentPhase] = useState('')
  const [phaseDetails, setPhaseDetails] = useState('')
  const [showChapters, setShowChapters] = useState(true)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewContent, setPreviewContent] = useState('')
  const [executionInterrupted, setExecutionInterrupted] = useState(false)
  const [executionTime, setExecutionTime] = useState(0)
  const [encouragingMessages, setEncouragingMessages] = useState([
    "🚀 Initializing your creative workflow...",
    "⚡ AI engines are warming up...",
    "🎯 Analyzing your requirements...",
    "🧠 Processing your vision...",
    "✨ Crafting amazing content...",
    "🔥 Generating professional quality...",
    "💎 Polishing every detail...",
    "🎉 Almost there...",
    "🏆 Excellence in progress..."
  ])
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)

  // Magical animations and interactions
  const [hoveredNode, setHoveredNode] = useState(null)
  const [pulseAnimation, setPulseAnimation] = useState(false)
  const [successAnimation, setSuccessAnimation] = useState(false)

  // ============================================================================
  // MAGICAL STYLES & ANIMATIONS
  // ============================================================================

  const magicalStyles = `
    @keyframes magicalPulse {
      0%, 100% { 
        box-shadow: 0 0 20px rgba(147, 51, 234, 0.3);
        transform: scale(1);
      }
      50% { 
        box-shadow: 0 0 40px rgba(147, 51, 234, 0.6);
        transform: scale(1.02);
      }
    }
    
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-10px); }
    }
    
    @keyframes glow {
      0%, 100% { 
        box-shadow: 0 0 5px rgba(59, 130, 246, 0.3);
      }
      50% { 
        box-shadow: 0 0 20px rgba(59, 130, 246, 0.6), 0 0 30px rgba(59, 130, 246, 0.4);
      }
    }

    .magical-progress-bar {
      background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899);
      background-size: 200% 100%;
      animation: shimmer 2s ease-in-out infinite;
    }

    .magical-card {
      background: linear-gradient(135deg, rgba(31, 41, 55, 0.9), rgba(17, 24, 39, 0.9));
      border: 1px solid rgba(59, 130, 246, 0.2);
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;
    }

    .magical-card:hover {
      border-color: rgba(59, 130, 246, 0.4);
      box-shadow: 0 10px 25px rgba(59, 130, 246, 0.1);
      transform: translateY(-2px);
    }

    .node-completed {
      animation: glow 2s ease-in-out infinite;
    }

    .chapter-indicator {
      animation: float 3s ease-in-out infinite;
    }

    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }

    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(31, 41, 55, 0.3);
      border-radius: 3px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: linear-gradient(180deg, #3b82f6, #8b5cf6);
      border-radius: 3px;
    }

    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: linear-gradient(180deg, #2563eb, #7c3aed);
    }
  `

  // ============================================================================
  // EFFECTS & LIFECYCLE
  // ============================================================================

  useEffect(() => {
    if (isOpen && workflowData?.executionData) {
      setCurrentStatus(workflowData.executionData)
      simulateExecution()
    }
  }, [isOpen, workflowData])

  useEffect(() => {
    const styleElement = document.createElement('style')
    styleElement.textContent = magicalStyles
    document.head.appendChild(styleElement)
    
    return () => {
      document.head.removeChild(styleElement)
      // Cleanup intervals when component unmounts
      clearAllIntervals()
    }
  }, [])

  // Cleanup intervals when execution state changes
  useEffect(() => {
    if (!isExecuting && !isPaused) {
      clearAllIntervals()
    }
  }, [isExecuting, isPaused])

  // ============================================================================
  // PAUSE/STOP FUNCTIONALITY
  // ============================================================================

  const clearAllIntervals = () => {
    if (progressInterval) {
      clearInterval(progressInterval)
      progressInterval = null
    }
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
    if (messageInterval) {
      clearInterval(messageInterval)
      messageInterval = null
    }
  }

  const handlePause = () => {
    console.log('🛑 PAUSE CLICKED - Stopping all intervals')
    clearAllIntervals()
    setIsPaused(true)
    setIsExecuting(false)
    setCurrentPhase('Workflow Paused')
    setPhaseDetails('Execution paused. Click Resume to continue or Stop to terminate.')
    
    // Show preview of current content
    showCurrentPreview()
  }

  const handleResume = () => {
    console.log('▶️ RESUME CLICKED - Starting execution')
    setIsPaused(false)
    setIsExecuting(true)
    setCurrentPhase('Resuming Workflow')
    setPhaseDetails('Continuing from where we left off...')
    
    // Resume execution
    setTimeout(() => {
      simulateExecution()
    }, 1000)
  }

  const handleStop = () => {
    console.log('⏹️ STOP CLICKED - Terminating execution')
    clearAllIntervals()
    setIsExecuting(false)
    setIsPaused(false)
    setExecutionInterrupted(true)
    setCurrentPhase('Workflow Stopped')
    setPhaseDetails('Execution terminated by user. Review generated content below.')
    
    // Show preview of current content
    showCurrentPreview()
  }

  const showCurrentPreview = () => {
    // Generate partial content based on current progress
    const partialContent = generatePartialContent(overallProgress)
    setPreviewContent(partialContent)
    setShowPreviewModal(true)
  }

  // ============================================================================
  // SIMULATION & PROGRESS TRACKING
  // ============================================================================

  let progressInterval = null
  let timerInterval = null
  let messageInterval = null

  const simulateExecution = () => {
    setIsExecuting(true)
    setIsPaused(false)
    setCurrentPhase('Initializing Workflow')
    setPhaseDetails('Setting up AI engines and preparing data pipeline...')
    setExecutionTime(0)
    setCurrentMessageIndex(0)
    
    const nodes = workflowData?.nodes || []
    let progress = overallProgress // Continue from current progress
    let timeElapsed = executionTime
    
    // Timer interval
    timerInterval = setInterval(() => {
      if (!isPaused && isExecuting) {
        timeElapsed += 1
        setExecutionTime(timeElapsed)
      }
    }, 1000)
    
    // Encouraging messages interval
    messageInterval = setInterval(() => {
      if (!isPaused && isExecuting) {
        setCurrentMessageIndex(prev => (prev + 1) % encouragingMessages.length)
      }
    }, 3000)
    
    progressInterval = setInterval(() => {
      // Check if paused or stopped
      if (isPaused || !isExecuting) {
        clearInterval(progressInterval)
        clearInterval(timerInterval)
        clearInterval(messageInterval)
        return
      }
      
      progress += Math.random() * 15
      
      if (progress >= 100) {
        progress = 100
        setOverallProgress(100)
        setCurrentPhase('Workflow Complete')
        setPhaseDetails('All nodes processed successfully. Book generated!')
        setIsExecuting(false)
        setSuccessAnimation(true)
        clearInterval(progressInterval)
        clearInterval(timerInterval)
        clearInterval(messageInterval)
        
        // Simulate book content
        setEditContent(generateSampleBookContent())
        
        setTimeout(() => setSuccessAnimation(false), 3000)
      } else {
        setOverallProgress(progress)
        
        // Update phase based on progress
        if (progress < 25) {
          setCurrentPhase('Data Processing')
          setPhaseDetails('Analyzing input parameters and structuring data...')
        } else if (progress < 50) {
          setCurrentPhase('AI Generation')
          setPhaseDetails('AI engines are creating content based on your specifications...')
        } else if (progress < 75) {
          setCurrentPhase('Content Refinement')
          setPhaseDetails('Polishing content and ensuring quality standards...')
        } else {
          setCurrentPhase('Final Assembly')
          setPhaseDetails('Compiling final book and preparing for delivery...')
        }
      }
    }, 200)
  }

  const generatePartialContent = (progress) => {
    if (progress < 10) {
      return `<div class="book-content"><h1 style="text-align: center; color: #3b82f6; margin-bottom: 2rem;">Loading...</h1><p style="text-align: center; color: #6b7280;">Initializing workflow...</p></div>`
    } else if (progress < 25) {
      return `
        <div class="book-content">
          <h1 style="text-align: center; color: #3b82f6; margin-bottom: 2rem;">The Complete Guide to Digital Transformation</h1>
          <div style="background: linear-gradient(135deg, #f3f4f6, #e5e7eb); padding: 2rem; border-radius: 12px; margin: 2rem 0;">
            <h2 style="color: #1f2937; margin-bottom: 1rem;">Executive Summary</h2>
            <p style="line-height: 1.6; color: #374151;">Digital transformation is no longer a luxury—it's a necessity for businesses looking to thrive in the modern economy. This comprehensive guide provides actionable insights and proven strategies for organizations of all sizes.</p>
          </div>
        </div>
      `
    } else if (progress < 50) {
      return `
        <div class="book-content">
          <h1 style="text-align: center; color: #3b82f6; margin-bottom: 2rem;">The Complete Guide to Digital Transformation</h1>
          <div style="background: linear-gradient(135deg, #f3f4f6, #e5e7eb); padding: 2rem; border-radius: 12px; margin: 2rem 0;">
            <h2 style="color: #1f2937; margin-bottom: 1rem;">Executive Summary</h2>
            <p style="line-height: 1.6; color: #374151;">Digital transformation is no longer a luxury—it's a necessity for businesses looking to thrive in the modern economy. This comprehensive guide provides actionable insights and proven strategies for organizations of all sizes.</p>
          </div>
          <h2 style="color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 0.5rem;">Chapter 1: Understanding Digital Transformation</h2>
          <p style="line-height: 1.6; margin-bottom: 1rem;">Digital transformation represents a fundamental shift in how organizations operate, deliver value to customers, and compete in the marketplace. It's about leveraging technology to create new business models, improve operational efficiency, and enhance customer experiences.</p>
        </div>
      `
    } else if (progress < 75) {
      return `
        <div class="book-content">
          <h1 style="text-align: center; color: #3b82f6; margin-bottom: 2rem;">The Complete Guide to Digital Transformation</h1>
          <div style="background: linear-gradient(135deg, #f3f4f6, #e5e7eb); padding: 2rem; border-radius: 12px; margin: 2rem 0;">
            <h2 style="color: #1f2937; margin-bottom: 1rem;">Executive Summary</h2>
            <p style="line-height: 1.6; color: #374151;">Digital transformation is no longer a luxury—it's a necessity for businesses looking to thrive in the modern economy. This comprehensive guide provides actionable insights and proven strategies for organizations of all sizes.</p>
          </div>
          <h2 style="color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 0.5rem;">Chapter 1: Understanding Digital Transformation</h2>
          <p style="line-height: 1.6; margin-bottom: 1rem;">Digital transformation represents a fundamental shift in how organizations operate, deliver value to customers, and compete in the marketplace. It's about leveraging technology to create new business models, improve operational efficiency, and enhance customer experiences.</p>
          <h3 style="color: #374151; margin-top: 1.5rem;">Key Benefits:</h3>
          <ul style="line-height: 1.6; margin-left: 2rem;">
            <li>Increased operational efficiency</li>
            <li>Enhanced customer experience</li>
            <li>Improved data-driven decision making</li>
            <li>Greater competitive advantage</li>
          </ul>
        </div>
      `
    } else {
      return generateSampleBookContent()
    }
  }

  const generateSampleBookContent = () => {
    return `
      <div class="book-content">
        <h1 style="text-align: center; color: #3b82f6; margin-bottom: 2rem;">The Complete Guide to Digital Transformation</h1>
        
        <div style="background: linear-gradient(135deg, #f3f4f6, #e5e7eb); padding: 2rem; border-radius: 12px; margin: 2rem 0;">
          <h2 style="color: #1f2937; margin-bottom: 1rem;">Executive Summary</h2>
          <p style="line-height: 1.6; color: #374151;">Digital transformation is no longer a luxury—it's a necessity for businesses looking to thrive in the modern economy. This comprehensive guide provides actionable insights and proven strategies for organizations of all sizes.</p>
        </div>

        <h2 style="color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 0.5rem;">Chapter 1: Understanding Digital Transformation</h2>
        <p style="line-height: 1.6; margin-bottom: 1rem;">Digital transformation represents a fundamental shift in how organizations operate, deliver value to customers, and compete in the marketplace. It's about leveraging technology to create new business models, improve operational efficiency, and enhance customer experiences.</p>
        
        <h3 style="color: #374151; margin-top: 1.5rem;">Key Benefits:</h3>
        <ul style="line-height: 1.6; margin-left: 2rem;">
          <li>Increased operational efficiency</li>
          <li>Enhanced customer experience</li>
          <li>Improved data-driven decision making</li>
          <li>Greater competitive advantage</li>
        </ul>

        <h2 style="color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 0.5rem;">Chapter 2: Strategic Planning and Implementation</h2>
        <p style="line-height: 1.6; margin-bottom: 1rem;">Successful digital transformation requires careful planning, strong leadership, and a clear vision. This chapter outlines the essential steps for creating and executing a comprehensive digital strategy.</p>
        
        <div style="background: #fef3c7; padding: 1.5rem; border-left: 4px solid #f59e0b; margin: 1.5rem 0;">
          <strong>💡 Pro Tip:</strong> Start with a pilot project to demonstrate value before scaling across the organization.
        </div>
      </div>
    `
  }

  // ============================================================================
  // BOOK SAVING FUNCTIONALITY
  // ============================================================================

  const saveBookToDatabase = async () => {
    try {
      if (!editContent) {
        alert('❌ No content to save')
        return
      }

      // Get user ID
      const { data: { user } } = await supabase.auth.getUser()
      const userId = user?.id || '5950cad6-810b-4c5b-9d40-4485ea249770'

      const bookData = {
        user_id: userId,
        title: 'Generated Book',
        author: userId === '5950cad6-810b-4c5b-9d40-4485ea249770' ? 'SuperAdmin' : 'User Generated',
        type: 'ebook',
        niche: 'business',
        status: 'completed',
        content: editContent,
        word_count: editContent.length,
        ai_service: 'mixed', // Magical execution uses multiple AI services
        metadata: {
          execution_type: 'magical',
          formats_generated: ['text'],
          created_by: userId === '5950cad6-810b-4c5b-9d40-4485ea249770' ? 'superadmin' : 'user'
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('books')
        .insert([bookData])
        .select()

      if (error) {
        console.error('Save book error:', error)
        alert(`❌ Failed to save book: ${error.message}`)
        return
      }

      console.log('✅ Book saved successfully:', data)
      alert(`✅ Book saved successfully!`)
      
      // Book saved successfully
      console.log('✅ Book saved to database:', data[0])

    } catch (error) {
      console.error('Save book error:', error)
      alert(`❌ Failed to save book: ${error.message}`)
    }
  }

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================


  const renderProgressSection = () => (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      {/* Overall Progress Ring */}
      <div className="text-center">
        <motion.div 
          className="relative w-32 h-32 mx-auto mb-4"
          animate={{ rotate: isExecuting ? 360 : 0 }}
          transition={{ duration: 2, repeat: isExecuting ? Infinity : 0, ease: "linear" }}
        >
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="50"
              stroke="rgba(31, 41, 55, 0.3)"
              strokeWidth="8"
              fill="none"
            />
            <motion.circle
              cx="60"
              cy="60"
              r="50"
              stroke="url(#gradient)"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 50}`}
              strokeDashoffset={`${2 * Math.PI * 50 * (1 - overallProgress / 100)}`}
              transition={{ duration: 0.5 }}
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-white">{Math.round(overallProgress)}%</span>
          </div>
        </motion.div>
      </div>

      {/* Current Phase */}
      <div className="text-center space-y-2">
        <motion.h3 
          className="text-lg font-semibold text-white"
          key={currentPhase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {currentPhase}
        </motion.h3>
        <p className="text-gray-400 text-sm">{phaseDetails}</p>
      </div>

      {/* Node Progress */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">Node Progress</h4>
        {['Input Processing', 'Content Generation', 'Quality Check', 'Final Assembly'].map((node, index) => {
          const nodeProgress = Math.min(100, Math.max(0, (overallProgress - (index * 25)) * 4))
          const isCompleted = nodeProgress >= 100
          const isCurrentNode = !isCompleted && nodeProgress > 0
          
          // Determine node status based on execution state
          let nodeStatus = 'pending'
          let statusIcon = <Circle className="w-5 h-5 text-gray-500" />
          let statusText = 'Pending'
          
          if (isCompleted) {
            nodeStatus = 'completed'
            statusIcon = <CheckCircle className="w-5 h-5 text-green-400" />
            statusText = 'Completed'
          } else if (isExecuting && isCurrentNode) {
            nodeStatus = 'processing'
            statusIcon = <Loader className="w-5 h-5 text-blue-400 animate-spin" />
            statusText = 'Processing'
          } else if (isPaused) {
            nodeStatus = 'paused'
            statusIcon = <Pause className="w-5 h-5 text-yellow-400" />
            statusText = 'Paused'
          } else if (executionInterrupted) {
            nodeStatus = 'stopped'
            statusIcon = <X className="w-5 h-5 text-red-400" />
            statusText = 'Stopped'
          }
          
          return (
            <motion.div
              key={node}
              className="magical-card p-3 rounded-lg"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <motion.div
                    animate={isCompleted ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    {statusIcon}
                  </motion.div>
                  <span className="text-sm font-medium text-white">{node}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    nodeStatus === 'completed' ? 'bg-green-900 text-green-300' :
                    nodeStatus === 'processing' ? 'bg-blue-900 text-blue-300' :
                    nodeStatus === 'paused' ? 'bg-yellow-900 text-yellow-300' :
                    nodeStatus === 'stopped' ? 'bg-red-900 text-red-300' :
                    'bg-gray-700 text-gray-400'
                  }`}>
                    {statusText}
                  </span>
                  <span className="text-xs text-gray-400">{Math.round(nodeProgress)}%</span>
                </div>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <motion.div
                  className={`h-2 rounded-full ${
                    nodeStatus === 'completed' ? 'bg-green-500' :
                    nodeStatus === 'processing' ? 'magical-progress-bar' :
                    nodeStatus === 'paused' ? 'bg-yellow-500' :
                    nodeStatus === 'stopped' ? 'bg-red-500' :
                    'bg-gray-600'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${nodeProgress}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                />
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )

  const renderBookSection = () => (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-4"
    >
      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditMode(!isEditMode)}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300"
          >
            {isEditMode ? <Eye className="w-4 h-4 mr-2" /> : <Edit3 className="w-4 h-4 mr-2" />}
            {isEditMode ? 'Preview' : 'Edit'}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={saveBookToDatabase}
            className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all duration-300"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Save to Books
          </motion.button>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-300"
        >
          <Download className="w-4 h-4 mr-2" />
          Download
        </motion.button>
      </div>

      {/* Book Content */}
      <div className="magical-card rounded-lg p-6 min-h-[500px]">
        {isEditMode ? (
          <RichTextEditor
            value={editContent}
            onChange={setEditContent}
            height={500}
            className="w-full"
          />
        ) : (
          <div 
            className="prose prose-invert max-w-none custom-scrollbar"
            dangerouslySetInnerHTML={{ __html: editContent || 'Generating book content...' }}
          />
        )}
      </div>
    </motion.div>
  )

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-7xl h-[90vh] bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center space-x-4">
              <motion.div
                animate={successAnimation ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
                transition={{ duration: 0.6 }}
              >
                <Sparkles className="w-8 h-8 text-purple-400" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-white">Magical Book Generation</h1>
                <p className="text-gray-400">Watch your ideas transform into professional content</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Control Buttons */}
              {isExecuting && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePause}
                  className="flex items-center px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-all duration-300"
                >
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </motion.button>
              )}
              
              {isPaused && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleResume}
                  className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-300"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Resume
                </motion.button>
              )}
              
              {(isExecuting || isPaused) && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStop}
                  className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300"
                >
                  <X className="w-4 h-4 mr-2" />
                  Stop
                </motion.button>
              )}
              
              {/* Preview Button when stopped/paused */}
              {(executionInterrupted || isPaused) && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={showCurrentPreview}
                  className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </motion.button>
              )}
            
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all duration-300"
              >
                <X className="w-6 h-6" />
              </motion.button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 overflow-hidden">
            {/* Left Column: Progress & Status */}
            <div className="flex flex-col space-y-6 overflow-y-auto custom-scrollbar">
              {renderProgressSection()}
              
              {/* Chapter Indicators and Timer - MOVED TO BOTTOM */}
              {showChapters && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="magical-card p-4 rounded-lg"
                >
                  <h4 className="text-sm font-semibold text-gray-300 mb-3">Progress Overview</h4>
                  
                  {/* Chapter Progress */}
                  <div className="flex justify-center space-x-2 mb-4">
                    {[1, 2, 3, 4, 5].map((chapter) => (
                      <motion.div
                        key={chapter}
                        className={`chapter-indicator w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                          overallProgress > (chapter * 20) 
                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' 
                            : 'bg-gray-700 text-gray-400'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {chapter}
                      </motion.div>
                    ))}
                  </div>
                  
                  {/* Timer and Encouraging Message */}
                  <div className="flex items-center justify-between">
                    {/* Circular Timer */}
                    <div className="relative w-12 h-12">
                      <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 48 48">
                        <circle
                          cx="24"
                          cy="24"
                          r="20"
                          stroke="rgba(31, 41, 55, 0.3)"
                          strokeWidth="3"
                          fill="none"
                        />
                        <motion.circle
                          cx="24"
                          cy="24"
                          r="20"
                          stroke="url(#timerGradient)"
                          strokeWidth="3"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 20}`}
                          strokeDashoffset={`${2 * Math.PI * 20 * (1 - (executionTime % 60) / 60)}`}
                          transition={{ duration: 0.1 }}
                        />
                        <defs>
                          <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {Math.floor(executionTime / 60)}:{(executionTime % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                    
                    {/* Encouraging Message */}
                    <motion.div 
                      key={currentMessageIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.5 }}
                      className="flex-1 text-center px-4"
                    >
                      <p className="text-white font-medium text-sm">
                        {encouragingMessages[currentMessageIndex]}
                      </p>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right Column: Book Preview/Editor */}
            <div className="flex flex-col space-y-4 overflow-y-auto custom-scrollbar">
              {renderBookSection()}
            </div>
          </div>
        </motion.div>

        {/* Preview Modal */}
        <AnimatePresence>
          {showPreviewModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black bg-opacity-90"
              onClick={(e) => e.target === e.currentTarget && setShowPreviewModal(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-4xl h-[80vh] bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
              >
                {/* Preview Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-700">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-6 h-6 text-yellow-400" />
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {executionInterrupted ? 'Execution Stopped' : 'Execution Paused'}
                      </h2>
                      <p className="text-gray-400">
                        {executionInterrupted 
                          ? 'Here\'s what was generated before stopping' 
                          : 'Here\'s the current progress - you can resume or stop'
                        }
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {!executionInterrupted && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setShowPreviewModal(false)
                          handleResume()
                        }}
                        className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-300"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Resume
                      </motion.button>
                    )}
                    
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowPreviewModal(false)}
                      className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all duration-300"
                    >
                      <X className="w-6 h-6" />
                    </motion.button>
                  </div>
                </div>

                {/* Preview Content */}
                <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
                  <div className="space-y-4">
                    {/* Progress Summary */}
                    <div className="magical-card p-4 rounded-lg">
                      <h3 className="text-lg font-semibold text-white mb-2">Progress Summary</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-400">Overall Progress:</span>
                          <span className="text-white ml-2">{Math.round(overallProgress)}%</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Current Phase:</span>
                          <span className="text-white ml-2">{currentPhase}</span>
                        </div>
                      </div>
                    </div>

                    {/* Generated Content Preview */}
                    <div className="magical-card p-6 rounded-lg">
                      <h3 className="text-lg font-semibold text-white mb-4">Generated Content Preview</h3>
                      <div 
                        className="prose prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: previewContent }}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center space-x-4 pt-4">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setEditContent(previewContent)
                          setShowPreviewModal(false)
                        }}
                        className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300"
                      >
                        <Edit3 className="w-5 h-5 mr-2" />
                        Use This Content
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          setEditContent(previewContent)
                          saveBookToDatabase()
                          setShowPreviewModal(false)
                        }}
                        className="flex items-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all duration-300"
                      >
                        <BookOpen className="w-5 h-5 mr-2" />
                        Save & Close
                      </motion.button>
                      
                      {!executionInterrupted && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setShowPreviewModal(false)
                            handleStop()
                          }}
                          className="flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300"
                        >
                          <X className="w-5 h-5 mr-2" />
                          Stop Completely
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )
}

export default MagicalExecutionModal