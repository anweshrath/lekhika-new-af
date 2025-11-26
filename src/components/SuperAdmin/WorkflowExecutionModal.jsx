import React, { useState, useEffect, useRef } from 'react'
// import ReactQuill from 'react-quill'
// import 'react-quill/dist/quill.snow.css'
import { 
  X, Play, Pause, AlertCircle, CheckCircle, Loader, 
  DollarSign, Clock, Zap, BookOpen, TrendingUp, Cpu, 
  Database, Network, Activity, Brain, Target, Rocket, 
  Shield, Sparkles, Download, Layers, BarChart3, 
  FileText, Users, Settings, ArrowRight, Star,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Eye, EyeOff, RefreshCw, Edit3, RotateCcw
} from 'lucide-react'
import testingStorageService from '../../services/testingStorageService'
import AIThinkingModal from './AIThinkingModal'
import PreviewApprovalModal from './PreviewApprovalModal'
import RichTextEditor from '../RichTextEditor'
import { supabase } from '../../lib/supabase'
import sessionManager from '../../services/sessionManager'
import { workflowExecutionService } from '../../services/workflowExecutionService'
import bookRecoveryService from '../../services/bookRecoveryService'

// Advanced CSS animations and styles
const advancedStyles = `
  @keyframes pulse-glow {
    0%, 100% { 
      box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
      transform: scale(1);
    }
    50% { 
      box-shadow: 0 0 40px rgba(59, 130, 246, 0.6);
      transform: scale(1.02);
    }
  }
  
  @keyframes slide-in-right {
    0% { 
      transform: translateX(100%);
      opacity: 0;
    }
    100% { 
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slide-in-left {
    0% { 
      transform: translateX(-100%);
      opacity: 0;
    }
    100% { 
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes fade-in-up {
    0% { 
      transform: translateY(30px);
      opacity: 0;
    }
    100% { 
      transform: translateY(0);
      opacity: 1;
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
  
  @keyframes spin-slow {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes progress-fill {
    0% { width: 0%; }
    100% { width: var(--progress-width); }
  }
  
  @keyframes heartbeat {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  }
  
  .animate-pulse-glow {
    animation: pulse-glow 2s ease-in-out infinite;
  }
  
  .animate-slide-in-right {
    animation: slide-in-right 0.6s ease-out;
  }
  
  .animate-slide-in-left {
    animation: slide-in-left 0.6s ease-out;
  }
  
  .animate-fade-in-up {
    animation: fade-in-up 0.8s ease-out;
  }
  
  .animate-shimmer {
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
  }
  
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
  
  .animate-spin-slow {
    animation: spin-slow 3s linear infinite;
  }
  
  .animate-progress-fill {
    animation: progress-fill 1s ease-out;
  }
  
  .animate-heartbeat {
    animation: heartbeat 1.5s ease-in-out infinite;
  }
  
  .glass-effect {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .neon-border {
    border: 2px solid transparent;
    background: linear-gradient(45deg, #667eea, #764ba2) border-box;
    border-radius: 12px;
  }
  
  .gradient-text {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
  
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
  }
  
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 4px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #667eea, #764ba2);
    border-radius: 4px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #5a67d8, #6b46c1);
  }
  
  .hover-lift {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .hover-lift:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
  
  .progress-ring {
    transform: rotate(-90deg);
  }
  
  .progress-ring-circle {
    stroke-dasharray: 283;
    stroke-dashoffset: 283;
    transition: stroke-dashoffset 0.5s ease-in-out;
  }
  
  /* GALACTIC MAGIC STYLES */
  .galactic-card {
    background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(139, 92, 246, 0.4);
    box-shadow: 
      0 8px 32px rgba(0, 0, 0, 0.4),
      inset 0 1px 0 rgba(255, 255, 255, 0.1),
      0 0 30px rgba(139, 92, 246, 0.2);
    position: relative;
    overflow: hidden;
  }
  
  .galactic-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.15), transparent);
    animation: shimmer 4s infinite;
  }
  
  @keyframes shimmer {
    0% { left: -100%; }
    100% { left: 100%; }
  }
  
  .cosmic-glow {
    box-shadow: 
      0 0 20px rgba(139, 92, 246, 0.5),
      0 0 40px rgba(59, 130, 246, 0.3),
      0 0 60px rgba(16, 185, 129, 0.2);
    animation: pulse-glow 3s ease-in-out infinite alternate;
  }
  
  @keyframes pulse-glow {
    0% {
      box-shadow: 
        0 0 20px rgba(139, 92, 246, 0.5),
        0 0 40px rgba(59, 130, 246, 0.3),
        0 0 60px rgba(16, 185, 129, 0.2);
    }
    100% {
      box-shadow: 
        0 0 40px rgba(139, 92, 246, 0.7),
        0 0 80px rgba(59, 130, 246, 0.4),
        0 0 120px rgba(16, 185, 129, 0.3);
    }
  }
  
  .holographic-text {
    background: linear-gradient(45deg, #8B5CF6, #3B82F6, #10B981, #F59E0B);
    background-size: 300% 300%;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: holographic 4s ease-in-out infinite;
  }
  
  @keyframes holographic {
    0%, 100% { background-position: 0% 50%; }
    25% { background-position: 100% 50%; }
    50% { background-position: 100% 100%; }
    75% { background-position: 0% 100%; }
  }
  
  .stats-counter {
    animation: countUp 2s ease-out;
  }
  
  @keyframes countUp {
    from {
      transform: scale(0.5) rotate(-10deg);
      opacity: 0;
    }
    50% {
      transform: scale(1.1) rotate(5deg);
    }
    to {
      transform: scale(1) rotate(0deg);
      opacity: 1;
    }
  }
  
  .galactic-progress {
    background: linear-gradient(90deg, #8B5CF6, #3B82F6, #10B981, #F59E0B);
    background-size: 400% 100%;
    animation: progress-flow 3s linear infinite;
  }
  
  @keyframes progress-flow {
    0% { background-position: -400% 0; }
    100% { background-position: 400% 0; }
  }
  
  .floating-orb {
    position: absolute;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(139, 92, 246, 0.8), transparent);
    animation: float-orb 8s linear infinite;
  }
  
  .floating-orb:nth-child(2n) {
    background: radial-gradient(circle, rgba(59, 130, 246, 0.8), transparent);
    animation-duration: 10s;
    animation-delay: -2s;
  }
  
  .floating-orb:nth-child(3n) {
    background: radial-gradient(circle, rgba(16, 185, 129, 0.8), transparent);
    animation-duration: 12s;
    animation-delay: -4s;
  }
  
  @keyframes float-orb {
    0% {
      transform: translateY(100vh) translateX(0px) scale(0);
      opacity: 0;
    }
    10% {
      opacity: 1;
      transform: translateY(90vh) translateX(10px) scale(1);
    }
    90% {
      opacity: 1;
      transform: translateY(10vh) translateX(90px) scale(1);
    }
    100% {
      transform: translateY(-10vh) translateX(100px) scale(0);
      opacity: 0;
    }
  }
  
  @keyframes wave {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
  
  .wave-container {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  
  .wave {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 200%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.3), transparent);
    animation: wave 3s linear infinite;
  }
  
  .wave1 {
    animation-delay: 0s;
    opacity: 0.7;
  }
  
  .wave2 {
    animation-delay: 1s;
    opacity: 0.5;
  }
  
  .wave3 {
    animation-delay: 2s;
    opacity: 0.3;
  }
`

const WorkflowExecutionModal = ({ 
  isOpen, 
  onClose, 
  executionData, 
  onForceStop,
  onRestart,
  onPause,
  onResume,
  onOpenOutputEditor,
  flowId,
  userId
}) => {
  const [currentStatus, setCurrentStatus] = useState(null)
  const [executionLog, setExecutionLog] = useState([])
  const [sessionStatus, setSessionStatus] = useState(null)
  const [showResumeDialog, setShowResumeDialog] = useState(false)
  const [isResuming, setIsResuming] = useState(false)
  const [sessionProgress, setSessionProgress] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCost, setTotalCost] = useState(0)
  
  // Page navigation functions
  const totalPages = currentStatus?.metadata?.totalChapters || currentStatus?.chapterInfo?.totalChapters || 1
  
  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1))
  }
  
  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1))
  }
  const [totalTokens, setTotalTokens] = useState(0)
  const [totalWords, setTotalWords] = useState(0)
  const [apiCalls, setApiCalls] = useState([])
  const [isCompleted, setIsCompleted] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [testRunStored, setTestRunStored] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [workflowProgress, setWorkflowProgress] = useState(0)
  const [currentNode, setCurrentNode] = useState(null)
  const [expandedLogs, setExpandedLogs] = useState(false)
  const [showDetails, setShowDetails] = useState(true)
  const [animationPhase, setAnimationPhase] = useState('entering')
  const [realTimeTokens, setRealTimeTokens] = useState(0)
  const [tokenUpdateAnimation, setTokenUpdateAnimation] = useState(false)
  const [showAIThinking, setShowAIThinking] = useState(false)
  const [aiThinkingData, setAiThinkingData] = useState([])
  const [showPreviewApproval, setShowPreviewApproval] = useState(false)
  const [showBookNamingModal, setShowBookNamingModal] = useState(false)
  const [customBookTitle, setCustomBookTitle] = useState('')
  const [previewData, setPreviewData] = useState(null)
  
  const modalRef = useRef(null)
  const progressRingRef = useRef(null)

  // Store test run in database
  const storeTestRunInDatabase = async (executionData) => {
    try {
      console.log('🧪 Storing test run in books table...')
      
      const testData = {
        userId: executionData.superAdminUser?.id || executionData.userInput?.superAdminUser?.id || '5950cad6-810b-4c5b-9d40-4485ea249770',
        scenarioName: executionData.scenarioName || 'Manual Test Run',
        workflowId: executionData.workflowId || 'unknown',
        nodeId: executionData.nodeId || 'unknown'
      }
      
      const userInput = executionData.userInput || executionData.compiledData?.userInput || {}
      
      const executionStats = {
        totalCost: totalCost,
        totalTokens: totalTokens,
        totalWords: totalWords,
        apiCalls: apiCalls.length,
        executionTime: Date.now() - (executionData.startTime || Date.now()),
        providersUsed: apiCalls.map(call => call.provider).filter(Boolean)
      }
      
      const storedBook = await testingStorageService.storeTestRun(
        testData,
        userInput,
        executionData.output,
        executionStats
      )
      
      console.log('✅ Test run stored successfully:', storedBook.id)
      setTestRunStored(true)
      
      if (typeof window !== 'undefined' && window.toast) {
        window.toast.success(`Test run stored in books table (ID: ${storedBook.id})`)
      }
      
    } catch (error) {
      console.error('❌ Error storing test run:', error)
      
      if (typeof window !== 'undefined' && window.toast) {
        window.toast.error(`Failed to store test run: ${error.message}`)
      }
    }
  }

  // Pause/Resume functionality
  const handlePause = () => {
    console.log('🛑 PAUSE CLICKED')
    setIsPaused(true)
    // Call the actual pause function
    if (onPause) {
      onPause()
    }
  }

  const handleResume = () => {
    console.log('▶️ RESUME CLICKED')
    setIsPaused(false)
    // Call the actual resume function
    if (onResume) {
      onResume()
    }
  }

  // Enhanced download functionality with custom naming
  const downloadContent = (format, content, filename) => {
    try {
      // Prompt user for custom filename
      const bookTitle = currentStatus?.output?.metadata?.bookTitle || 
                       currentStatus?.rawData?.inputData?.book_title ||
                       currentStatus?.rawData?.inputData?.story_title ||
                       'lekhika_masterpiece'
      
      const customFilename = prompt(
        `🎯 Enter filename for your ${format.toUpperCase()} download:`, 
        bookTitle
      )
      
      if (!customFilename) return // User cancelled
      
      const finalFilename = `${customFilename.trim()}.${format}`
      
      // Check if content is a blob URL (for binary formats like PDF/DOCX)
      if (typeof content === 'string' && content.startsWith('blob:')) {
        // Handle blob URL - use directly
        const a = document.createElement('a')
        a.href = content
        a.download = finalFilename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        
        if (typeof window !== 'undefined' && window.toast) {
          window.toast.success(`🎉 ${format.toUpperCase()} downloaded as "${finalFilename}"!`)
        } else {
          alert(`✅ ${format.toUpperCase()} downloaded as "${finalFilename}"!`)
        }
        return
      }
      
      // Check if content is a data URI (for base64 encoded formats)
      if (typeof content === 'string' && content.startsWith('data:')) {
        // Handle base64 data URI
        const a = document.createElement('a')
        a.href = content
        a.download = finalFilename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        
        if (typeof window !== 'undefined' && window.toast) {
          window.toast.success(`🎉 ${format.toUpperCase()} downloaded as "${finalFilename}"!`)
        } else {
          alert(`✅ ${format.toUpperCase()} downloaded as "${finalFilename}"!`)
        }
        return
      }
      
      // Handle text content
      const mimeTypes = {
        'pdf': 'application/pdf',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'html': 'text/html',
        'markdown': 'text/markdown',
        'md': 'text/markdown',
        'txt': 'text/plain',
        'text': 'text/plain',
        'json': 'application/json',
        'epub': 'application/epub+zip',
        'xml': 'application/xml'
      }
      
      const mimeType = mimeTypes[format.toLowerCase()] || 'text/plain'
      const blob = new Blob([content], { type: mimeType })
      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = finalFilename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      if (typeof window !== 'undefined' && window.toast) {
        window.toast.success(`🎉 ${format.toUpperCase()} downloaded as "${finalFilename}"!`)
      } else {
        alert(`✅ ${format.toUpperCase()} downloaded as "${finalFilename}"!`)
      }
    } catch (error) {
      console.error('Download error:', error)
      if (typeof window !== 'undefined' && window.toast) {
        window.toast.error(`Download failed: ${error.message}`)
      } else {
        alert(`❌ Download failed: ${error.message}`)
      }
    }
  }

  // Helper functions for book saving
  const extractAIServicesUsed = () => {
    try {
      const nodes = execution?.selectedEngine?.nodes || selectedEngine?.nodes || []
      const usedServices = new Set()
      
      nodes.forEach(node => {
        if (node.data?.selectedModels && Array.isArray(node.data.selectedModels)) {
          node.data.selectedModels.forEach(modelKey => {
            const [provider] = modelKey.split(':')
            if (provider) usedServices.add(provider)
          })
        }
      })
      
      return usedServices.size > 0 ? Array.from(usedServices).join(', ') : 'mixed'
    } catch (error) {
      console.warn('Failed to extract AI services:', error)
      return 'mixed'
    }
  }

  const getAuthorInfo = () => {
    if (userId === '5950cad6-810b-4c5b-9d40-4485ea249770' || !userId) {
      return 'SuperAdmin'
    }
    return executionData?.userInput?.author || 'User Generated'
  }

  // Save book to Supabase with custom title
  const saveBookToDatabaseWithCustomTitle = async (customTitle) => {
    try {
      if (!currentStatus?.output) {
        alert('❌ No content to save')
        return
      }

      // Use userId from props (passed from parent component)
      // Fallback to superadmin ID if not provided
      const bookUserId = userId || '5950cad6-810b-4c5b-9d40-4485ea249770'
      
      if (!bookUserId) {
        alert('❌ Unable to identify user for saving books')
        return
      }

      // SURGICAL FIX: Extract complete book content - prioritize compiled book over individual node outputs
      const bookContent = editContent || 
                         currentStatus.output.content ||
                         currentStatus.output.lastNodeOutput?.content || 
                         currentStatus.output.nodeOutputs?.['writer-1']?.content ||
                         currentStatus.output.nodeOutputs?.['process-1']?.content ||
                         'Book content'

      // Extract title from workflow input with proper fallbacks
      const bookTitle = customTitle || 
                       executionData?.userInput?.story_title || 
                       executionData?.userInput?.book_title || 
                       executionData?.userInput?.title ||
                       currentStatus.input?.story_title || 
                       currentStatus.input?.book_title || 
                       currentStatus.input?.title ||
                       'Untitled Book'

      const bookType = executionData?.userInput?.book_type || 
                      currentStatus.input?.book_type || 
                      currentStatus.input?.type || 
                      'ebook'

      const niche = executionData?.userInput?.genre || 
                   currentStatus.input?.niche || 
                   currentStatus.input?.genre || 
                   'general'

      // Prepare book data for database
      const bookData = {
        user_id: bookUserId,
        title: bookTitle,
        author: getAuthorInfo(),
        type: bookType,
        niche: niche,
        status: 'completed',
        content: bookContent,
        word_count: bookContent.length,
        ai_service: extractAIServicesUsed(),
        metadata: {
          execution_id: executionData?.executionId || executionData?.workflowId || 'manual_execution',
          flow_id: executionData?.selectedEngine?.id || executionData?.engineId || 'unknown',
          ai_engines_used: extractAIServicesUsed().split(', '),
          formats_generated: ['text'],
          created_by: userId === '5950cad6-810b-4c5b-9d40-4485ea249770' ? 'superadmin' : 'user'
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Insert book into database
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
      alert(`✅ Book "${bookTitle}" saved successfully!`)
      
      // Book saved successfully
      console.log('✅ Book saved to database:', data[0])

    } catch (error) {
      console.error('Save book error:', error)
      alert(`❌ Failed to save book: ${error.message}`)
    }
  }

  // Save book to Supabase
  const saveBookToDatabase = async () => {
    try {
      if (!currentStatus?.output) {
        alert('❌ No content to save')
        return
      }

      // Use userId from props (passed from parent component)
      // Fallback to superadmin ID if not provided
      const bookUserId = userId || '5950cad6-810b-4c5b-9d40-4485ea249770'
      
      if (!bookUserId) {
        alert('❌ Unable to identify user for saving books')
        return
      }

      // SURGICAL FIX: Extract complete book content - prioritize compiled book over individual node outputs
      const bookContent = editContent || 
                         currentStatus.output.content ||
                         currentStatus.output.lastNodeOutput?.content || 
                         currentStatus.output.nodeOutputs?.['writer-1']?.content ||
                         currentStatus.output.nodeOutputs?.['process-1']?.content ||
                         'Book content'

      // Extract book metadata from workflow input
      const bookTitle = executionData?.userInput?.story_title || 
                       executionData?.userInput?.book_title || 
                       currentStatus.input?.book_title || 
                       currentStatus.input?.title || 
                       'Generated Book'

      const bookType = executionData?.userInput?.book_type || 
                      currentStatus.input?.book_type || 
                      currentStatus.input?.type || 
                      'ebook'

      const niche = executionData?.userInput?.genre || 
                   currentStatus.input?.niche || 
                   currentStatus.input?.genre || 
                   'general'

      // Prepare book data for database
      const bookData = {
        user_id: bookUserId,
        title: bookTitle,
        author: getAuthorInfo(),
        type: bookType,
        niche: niche,
        status: 'completed',
        content: bookContent,
        word_count: bookContent.length,
        ai_service: extractAIServicesUsed(),
        metadata: {
          execution_id: executionData?.executionId || executionData?.workflowId || 'manual_execution',
          flow_id: executionData?.selectedEngine?.id || executionData?.engineId || 'unknown',
          ai_engines_used: extractAIServicesUsed().split(', '),
          formats_generated: ['text'],
          created_by: userId === '5950cad6-810b-4c5b-9d40-4485ea249770' ? 'superadmin' : 'user'
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Insert book into database
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
      alert(`✅ Book "${bookTitle}" saved successfully!`)
      
      // Book saved successfully
      console.log('✅ Book saved to database:', data[0])

    } catch (error) {
      console.error('Save book error:', error)
      alert(`❌ Failed to save book: ${error.message}`)
    }
  }

  // Extract deliverables from execution data
  const getDeliverables = () => {
    if (!currentStatus?.output) return []
    
    // SURGICAL FIX: Check multiple locations for deliverables
    let deliverables = []
    
    // 1. Direct deliverables from output node
    if (currentStatus.output.deliverables && Array.isArray(currentStatus.output.deliverables)) {
      deliverables = currentStatus.output.deliverables
    }
    // 2. Check lastNodeOutput for deliverables (from final output node)
    else if (currentStatus.output.lastNodeOutput?.deliverables && Array.isArray(currentStatus.output.lastNodeOutput.deliverables)) {
      deliverables = currentStatus.output.lastNodeOutput.deliverables
    }
    // 3. Check nodeOutputs for any output node deliverables
    else if (currentStatus.output.nodeOutputs) {
      Object.values(currentStatus.output.nodeOutputs).forEach(nodeOutput => {
        if (nodeOutput.type === 'final_output' && nodeOutput.deliverables && Array.isArray(nodeOutput.deliverables)) {
          deliverables = nodeOutput.deliverables
        }
      })
    }
    
    // 4. Fallback: create basic text deliverable from compiled book content
    if (deliverables.length === 0) {
      const content = currentStatus.output.content || currentStatus.output.lastNodeOutput?.content || currentStatus.output
      if (content && typeof content === 'string' && content.length > 0) {
        deliverables = [{
          format: 'text',
          content: content,
          filename: `lekhika_output_${new Date().toISOString().split('T')[0]}.txt`,
          size: content.length,
          mimeType: 'text/plain',
          isBinary: false
        }, {
          format: 'html',
          content: content,
          filename: `lekhika_output_${new Date().toISOString().split('T')[0]}.html`,
          size: content.length,
          mimeType: 'text/html',
          isBinary: false
        }]
      }
    }
    
    console.log('📥 Found deliverables:', deliverables.length, deliverables.map(d => d.format))
    return deliverables
  }

  // Animation effects
  useEffect(() => {
    if (isOpen) {
      setAnimationPhase('entering')
      setTimeout(() => setAnimationPhase('entered'), 100)
    } else {
      setAnimationPhase('exiting')
    }
  }, [isOpen])

  // Session management useEffect
  useEffect(() => {
    if (isOpen && flowId && userId) {
      checkForExistingSession()
    }
  }, [isOpen, flowId, userId])

  // Check for existing session
  const checkForExistingSession = async () => {
    try {
      const sessionStatus = workflowExecutionService.checkForExistingSession(flowId, userId)
      setSessionStatus(sessionStatus)
      
      if (sessionStatus.canResume) {
        setShowResumeDialog(true)
        setSessionProgress(sessionStatus.progress)
      }
    } catch (error) {
      console.error('❌ Failed to check for existing session:', error)
    }
  }

  // Resume existing session
  const handleResumeSession = async () => {
    setIsResuming(true)
    try {
      const session = workflowExecutionService.resumeSession(flowId, userId)
      
      // Update UI with resumed session data
      setExecutionLog(session.executionLog || [])
      setCurrentStatus(session.currentStatus || null)
      setSessionProgress(session.progress || 0)
      
      // Continue execution from where it left off
      if (onResume) {
        onResume(session)
      }
      
      setShowResumeDialog(false)
    } catch (error) {
      console.error('❌ Failed to resume session:', error)
      setShowResumeDialog(false)
    } finally {
      setIsResuming(false)
    }
  }

  // Start new session
  const handleStartNewSession = () => {
    setShowResumeDialog(false)
    // Clear any existing session
    sessionManager.clearSession(flowId, userId)
  }

  // Update progress ring
  useEffect(() => {
    if (progressRingRef.current) {
      const circle = progressRingRef.current.querySelector('.progress-ring-circle')
      if (circle) {
        const radius = circle.r.baseVal.value
        const circumference = radius * 2 * Math.PI
        const offset = circumference - (workflowProgress / 100) * circumference
        circle.style.strokeDashoffset = offset
      }
    }
  }, [workflowProgress])

  useEffect(() => {
    if (executionData) {
      console.log('🔍 EXECUTION DATA RECEIVED:', executionData)
      
      setCurrentStatus(executionData)
      setWorkflowProgress(executionData.progress || 0)
      setCurrentNode(executionData.nodeName || null)
      
      // Update real-time tokens and cost
      if (executionData.tokens > 0) {
        setTotalTokens(prev => prev + executionData.tokens)
        setTokenUpdateAnimation(true)
        setTimeout(() => setTokenUpdateAnimation(false), 1000)
      }
      
      if (executionData.cost > 0) {
        setTotalCost(prev => prev + executionData.cost)
      }
      
      if (executionData.words > 0) {
        setTotalWords(prev => prev + executionData.words)
      }
      
      if (executionData.status === 'completed' && (executionData.progress === 100 || executionData.progress >= 100)) {
        setIsCompleted(true)
        setWorkflowProgress(100)
        
        if (executionData.output && !executionData.testRunStored) {
          storeTestRunInDatabase(executionData)
        }
      } else if (executionData.status === 'stopped' && executionData.stopped) {
        // CRITICAL: Handle stopped workflows with partial results
        setIsCompleted(true)
        setWorkflowProgress(executionData.progress || 0)
        
        console.log('🛑 WORKFLOW STOPPED - PRESERVING PARTIAL RESULTS:', executionData)
        
        // Extract partial content from stopped workflow
        if (executionData.partialOutputs || executionData.results) {
          const partialContent = executionData.partialOutputs || executionData.results
          console.log('📦 PARTIAL CONTENT FOUND:', partialContent)
          
          // Update currentStatus with partial results
          setCurrentStatus(prev => ({
            ...prev,
            output: {
              ...prev.output,
              content: executionData.content || 'Partial content generated',
              partialResults: partialContent,
              stopped: true,
              message: executionData.message || 'Workflow stopped with partial results'
            }
          }))
        }
        
        if (executionData.output && !executionData.testRunStored) {
          storeTestRunInDatabase(executionData)
        }
      } else if (executionData.status === 'executing') {
        setIsCompleted(false)
        setWorkflowProgress(executionData.progress || 0)
      }
      
      const logEntry = {
        timestamp: new Date().toLocaleTimeString(),
        nodeId: executionData.nodeId,
        nodeName: executionData.nodeName,
        status: executionData.status,
        progress: executionData.progress,
        error: executionData.error,
        output: executionData.output,
        providerName: executionData.providerName,
        cost: executionData.cost || 0,
        tokens: executionData.tokens || 0,
        words: executionData.words || 0,
        duration: executionData.duration || 0
      }
      
      setExecutionLog(prev => [...prev, logEntry])
      
      // Add to AI thinking data - capture complete data flow
      console.log('🔍 AI THINKING DEBUG:', {
        nodeName: executionData.nodeName,
        hasAiResponse: !!executionData.aiResponse,
        hasProcessedContent: !!executionData.processedContent,
        hasRawData: !!executionData.rawData,
        tokens: executionData.tokens,
        cost: executionData.cost,
        executionData: executionData
      })
      
      // Always add AI thinking data for any node with AI activity
      if (executionData.nodeName && (executionData.aiResponse || executionData.processedContent || executionData.rawData || executionData.tokens > 0 || executionData.status === 'executing' || executionData.status === 'processing')) {
        const thinkingEntry = {
          ...logEntry,
          aiResponse: executionData.aiResponse,
          processedContent: executionData.processedContent,
          rawData: executionData.rawData,
          inputReceived: executionData.rawData?.inputData,
          dynamicInputs: executionData.rawData?.dynamicInputs,
          modelUsed: executionData.rawData?.model,
          providerUsed: executionData.rawData?.provider,
          actualTokens: executionData.tokens,
          actualCost: executionData.cost,
          modelCostPer1k: executionData.rawData?.modelCostPer1k
        }
        console.log('🔍 ADDING AI THINKING DATA:', thinkingEntry)
        setAiThinkingData(prev => [...prev, thinkingEntry])
      }

      // Check if this is a preview node that needs approval
      if (executionData.nodeName && executionData.rawData?.currentAttempt && executionData.processedContent) {
        const isPreviewNode = executionData.rawData?.previewLength || executionData.nodeName.toLowerCase().includes('preview')
        if (isPreviewNode) {
          setPreviewData({
            content: executionData.processedContent,
            nodeName: executionData.nodeName,
            currentAttempt: executionData.rawData.currentAttempt,
            maxAttempts: executionData.rawData.maxAttempts,
            nodeId: executionData.nodeId
          })
          setShowPreviewApproval(true)
        }
      }
      
      if (executionData.cost) {
        setTotalCost(prev => prev + (executionData.cost || 0))
      }
      if (executionData.tokens) {
        const newTokens = executionData.tokens || 0
        setTotalTokens(prev => prev + newTokens)
        setRealTimeTokens(newTokens)
        setTokenUpdateAnimation(true)
        setTimeout(() => setTokenUpdateAnimation(false), 1000)
      }
      if (executionData.words) {
        setTotalWords(prev => prev + (executionData.words || 0))
      }
      
      // Calculate words from characters if words is 0 but characters exist
      if (executionData.output?.metadata?.totalCharacters && executionData.words === 0) {
        const calculatedWords = Math.floor(executionData.output.metadata.totalCharacters / 5)
        setTotalWords(prev => prev + calculatedWords)
      }
      
      if (executionData.providerName && executionData.status === 'executing') {
        const apiCall = {
          id: Date.now(),
          provider: executionData.providerName,
          node: executionData.nodeName,
          timestamp: new Date().toLocaleTimeString(),
          status: 'calling'
        }
        setApiCalls(prev => [...prev, apiCall])
      }
    }
  }, [executionData])

  if (!isOpen) return null

  const getStatusIcon = (status) => {
    switch (status) {
      case 'executing':
        return <Loader className="w-5 h-5 animate-spin text-blue-400" />
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />
      case 'stopped':
        return <Pause className="w-5 h-5 text-yellow-400" />
      default:
        return <Play className="w-5 h-5 text-gray-400" />
    }
  }

  const formatProviderName = (providerName) => {
    if (!providerName) return 'Unknown Provider'
    const parts = providerName.split('-')
    if (parts.length >= 2) {
      return `${parts[0]} ${parts[1]}`.toUpperCase()
    }
    return providerName.toUpperCase()
  }

  const getMotivationalMessage = (status, progress) => {
    if (status === 'error') return null
    
    if (status === 'executing') {
      if (progress < 25) return "🚀 Initializing AI systems..."
      if (progress < 50) return "⚡ Processing your content..."
      if (progress < 75) return "🔥 Almost there..."
      if (progress < 100) return "💎 Finalizing your masterpiece..."
    }
    
    if (status === 'completed') {
      return "🎉 Your content is ready!"
    }
    
    return "🔄 Preparing workflow..."
  }

  return (
    <>
      {/* Resume Session Dialog */}
      {showResumeDialog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[60] p-4">
          <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 rounded-2xl shadow-2xl max-w-md w-full border border-indigo-500/30">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Resume Session?</h3>
                  <p className="text-indigo-300 text-sm">Previous execution found</p>
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="bg-indigo-800/30 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-indigo-300 text-sm">Progress</span>
                    <span className="text-indigo-400 font-medium">{sessionProgress}%</span>
                  </div>
                  <div className="w-full bg-indigo-900/50 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${sessionProgress}%` }}
                    />
                  </div>
                </div>
                
                <div className="text-gray-300 text-sm">
                  <p>• {sessionStatus?.message}</p>
                  <p>• {sessionStatus?.session?.completedNodes?.length || 0} nodes completed</p>
                  <p>• Last updated: {sessionStatus?.session?.metadata?.lastUpdated ? new Date(sessionStatus.session.metadata.lastUpdated).toLocaleString() : 'Unknown'}</p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleResumeSession}
                  disabled={isResuming}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isResuming ? (
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Resuming...
                    </div>
                  ) : (
                    'Resume Session'
                  )}
                </button>
                <button
                  onClick={handleStartNewSession}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-3 rounded-xl font-medium transition-all duration-200"
                >
                  Start Fresh
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="fixed inset-0 bg-black/50 dark:bg-black/95 flex items-center justify-center z-50 backdrop-blur-xl p-4">
        <style>{advancedStyles}</style>
      
      <div 
        ref={modalRef}
        className={`
          bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 
          backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-8xl h-[95vh] 
          flex flex-col border border-gray-700/50 overflow-hidden
          ${animationPhase === 'entering' ? 'animate-slide-in-right' : ''}
          ${animationPhase === 'exiting' ? 'animate-slide-in-left' : ''}
        `}
      >
        {/* Magical Header */}
        <div className={`
          relative overflow-hidden
          ${isCompleted 
            ? 'bg-gradient-to-r from-emerald-900/30 via-green-800/20 to-emerald-900/30' 
            : 'bg-gradient-to-r from-blue-900/30 via-purple-800/20 to-blue-900/30'
          }
          border-b border-gray-700/50
        `}>
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
            <div className="absolute top-4 left-4 w-2 h-2 bg-blue-400 rounded-full animate-float"></div>
            <div className="absolute top-8 right-8 w-1 h-1 bg-purple-400 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
            <div className="absolute bottom-4 left-8 w-1.5 h-1.5 bg-emerald-400 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
          </div>
          
          <div className="relative p-6 flex-shrink-0">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                {/* Animated status icon */}
                <div className={`
                  p-4 rounded-2xl glass-effect
                  ${isCompleted 
                    ? 'bg-emerald-500/20 border border-emerald-500/30 animate-pulse-glow' 
                    : 'bg-blue-500/20 border border-blue-500/30 animate-pulse-glow'
                  }
                `}>
                  {isCompleted ? (
                    <CheckCircle className="w-8 h-8 text-emerald-400 animate-heartbeat" />
                  ) : (
                    <Activity className="w-8 h-8 text-blue-400 animate-pulse" />
                  )}
                </div>
                
                <div className="animate-fade-in-up">
                  <h2 className="text-3xl font-bold text-white mb-2 gradient-text">
                    {isCompleted ? '✨ Workflow Complete!' : '⚡ Workflow Execution'}
                  </h2>
                  <p className="text-gray-300 text-sm">
                    {isCompleted ? 'All tasks completed successfully' : currentNode ? `Processing: ${currentNode}` : 'Initializing workflow...'}
                  </p>
                  {getMotivationalMessage(currentStatus?.status, workflowProgress) && (
                    <p className="text-blue-300 text-sm mt-1 animate-pulse">
                      {getMotivationalMessage(currentStatus?.status, workflowProgress)}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                {/* Restart Button */}
                {executionData?.isUserExecution && onRestart && (
                  <button
                    onClick={() => {
                      if (confirm('Restart this generation? Current progress will be stopped and a new execution will begin.')) {
                        onRestart()
                      }
                    }}
                    className="p-3 bg-orange-600/20 hover:bg-orange-600/40 border border-orange-500/30 rounded-xl text-orange-400 transition-all duration-200 hover:scale-105"
                    title="Restart Generation"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                )}
                
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="p-3 bg-gray-700/50 hover:bg-gray-600/50 border border-gray-600/30 rounded-xl text-gray-300 hover:text-white transition-all duration-200 hover:scale-105"
                  title="Close Modal"
                >
                  <X className="w-5 h-5" />
                </button>
                
                {/* Circular Progress Indicator - EXTREME RIGHT */}
                <div className="relative">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                    {/* Background Circle */}
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="rgba(55, 65, 81, 0.3)"
                      strokeWidth="4"
                      fill="none"
                    />
                    {/* Progress Circle */}
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      stroke="url(#circularGradient)"
                      strokeWidth="4"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 28}`}
                      strokeDashoffset={`${2 * Math.PI * 28 * (1 - (workflowProgress || 0) / 100)}`}
                      transition={{ duration: 0.5 }}
                      className="transition-all duration-500 ease-out"
                    />
                    <defs>
                      <linearGradient id="circularGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="50%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                  {/* Percentage Text */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {Math.round(workflowProgress || 0)}%
                    </span>
                  </div>
                </div>

                {/* Control Buttons */}
                <div className="flex space-x-3">
                  {currentStatus?.status === 'executing' && !isCompleted && !isPaused && (
                    <button
                      onClick={handlePause}
                      className="bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-400 px-4 py-2 rounded-xl flex items-center space-x-2 transition-all duration-300 text-sm font-medium hover-lift"
                    >
                      <Pause className="w-4 h-4" />
                      <span>Pause</span>
                    </button>
                  )}
                  
                  {isPaused && !isCompleted && (
                    <button
                      onClick={handleResume}
                      className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 px-4 py-2 rounded-xl flex items-center space-x-2 transition-all duration-300 text-sm font-medium hover-lift"
                    >
                      <Play className="w-4 h-4" />
                      <span>Resume</span>
                    </button>
                  )}
                  
                {(currentStatus?.status === 'executing' || !isCompleted) && !isPaused && (
                  <button
                    onClick={() => {
                      console.log('🛑 STOP CLICKED - KILLING PROCESS INSTANTLY')
                      // Kill the process immediately
                      if (onForceStop) {
                        onForceStop()
                      }
                      // Force stop all execution
                      setIsCompleted(true)
                      setIsPaused(false)
                      setCurrentStatus(prev => prev ? { ...prev, status: 'stopped', progress: prev.progress } : null)
                      // Clear any intervals or timers
                      if (typeof window !== 'undefined') {
                        const highestId = window.setTimeout(() => {}, 0)
                        for (let i = 0; i < highestId; i++) {
                          window.clearTimeout(i)
                        }
                      }
                    }}
                    className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 px-4 py-2 rounded-xl flex items-center space-x-2 transition-all duration-300 text-sm font-medium hover-lift"
                  >
                    <Shield className="w-4 h-4" />
                    <span>KILL</span>
                  </button>
                )}
                  <button
                    onClick={onClose}
                    className="bg-gray-700/50 hover:bg-gray-700/70 border border-gray-600/30 text-gray-300 p-2 rounded-xl transition-all duration-300 hover-lift"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
            
            {/* CHAPTER INDICATORS - VISIBLE AT TOP */}
            {currentStatus?.chapterInfo && (
              <div className="glass-effect rounded-2xl p-4 border border-blue-500/30 bg-blue-500/5 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-white flex items-center">
                    📚 Chapter Progress
                  </h3>
                  <div className="text-sm text-blue-400">
                    {currentStatus.chapterInfo.currentChapter} of {currentStatus.chapterInfo.totalChapters}
                  </div>
                </div>
                
                {/* Chapter Timeline */}
                <div className="flex space-x-2">
                  {Array.from({length: currentStatus.chapterInfo.totalChapters}).map((_, i) => {
                    const chapterNum = i + 1
                    const isCompleted = chapterNum < currentStatus.chapterInfo.currentChapter
                    const isCurrent = chapterNum === currentStatus.chapterInfo.currentChapter
                    const isPending = chapterNum > currentStatus.chapterInfo.currentChapter
                    
                    return (
                      <div key={i} className="flex-1">
                        <div className={`
                          rounded-lg p-3 text-center transition-all duration-500 border
                          ${isCompleted ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' :
                            isCurrent ? 'bg-blue-500/20 border-blue-500/50 text-blue-300 animate-pulse' :
                            'bg-gray-700/20 border-gray-600/50 text-gray-400'}
                        `}>
                          <div className="text-lg font-bold">
                            {isCompleted ? '✅' : isCurrent ? '🔄' : '⏳'} {chapterNum}
                          </div>
                          <div className="text-xs mt-1">
                            {isCompleted ? 'Done' : 
                             isCurrent ? 'Writing...' : 
                             'Pending'}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
            
                
                {/* MAGICAL GRAPHICS & ANIMATIONS - REPLACING PROGRESS BAR */}
                <div className="relative w-full h-20 mb-4 overflow-hidden rounded-2xl bg-gradient-to-r from-purple-900/20 via-blue-900/20 to-indigo-900/20 border border-purple-500/30">
                  {/* Floating Particles */}
                  <div className="absolute inset-0">
                    {[...Array(8)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-2 h-2 bg-blue-400/60 rounded-full animate-pulse"
                        style={{
                          left: `${10 + i * 12}%`,
                          top: `${20 + (i % 3) * 20}%`,
                          animationDelay: `${i * 0.5}s`,
                          animationDuration: `${2 + i * 0.3}s`
                        }}
                      />
                    ))}
                  </div>
                  
                  {/* Wave Animation */}
                  <div className="absolute inset-0">
                    <div className="wave-container">
                      <div className="wave wave1"></div>
                      <div className="wave wave2"></div>
                      <div className="wave wave3"></div>
                    </div>
                  </div>
                  
                  {/* Central Glowing Orb */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse-glow opacity-80"></div>
                      <div className="absolute inset-0 w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-ping opacity-30"></div>
                    </div>
                  </div>
                  
                  {/* Status Text */}
                  <div className="absolute bottom-2 left-4 text-xs text-blue-300 font-medium">
                    {currentStatus?.chapterInfo?.chapterStatus === 'completed' ? '✨ Chapter Complete!' : '⚡ Generating Magic...'}
                  </div>
                  
                  {/* Progress Indicator */}
                  <div className="absolute bottom-2 right-4 text-xs text-purple-300 font-bold">
                    {Math.round(currentStatus?.progress || 0)}% Complete
                  </div>
                </div>

            {/* GALACTIC STATS DASHBOARD */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 animate-fade-in-up">
              {/* Token Usage - PRIMARY METRIC */}
              <div className="galactic-card rounded-2xl p-6 hover-lift cosmic-glow">
                {/* Floating Orbs */}
                <div className="floating-orb" style={{left: '10%', animationDelay: '0s'}}></div>
                <div className="floating-orb" style={{left: '60%', animationDelay: '-3s'}}></div>
                <div className="floating-orb" style={{left: '85%', animationDelay: '-6s'}}></div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl">
                    <Cpu className="w-6 h-6 text-purple-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400 font-medium">TOKENS USED</div>
                    <div className="text-xs text-purple-400 font-semibold animate-pulse">● LIVE</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className={`text-3xl font-bold holographic-text stats-counter transition-all duration-500 ${
                    tokenUpdateAnimation ? 'scale-110 cosmic-glow' : ''
                  }`}>
                    {totalTokens.toLocaleString()}
                    {realTimeTokens > 0 && (
                      <span className="text-lg holographic-text ml-2 animate-pulse">
                        +{realTimeTokens.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-300">AI Processing Tokens</div>
                  <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                    <div 
                      className="galactic-progress h-3 rounded-full transition-all duration-1000"
                      style={{width: `${Math.min((totalTokens / 10000) * 100, 100)}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            
              {/* Cost Tracking - Only show for SuperAdmin */}
              {!executionData?.isUserExecution && (
                <div className="galactic-card rounded-2xl p-6 hover-lift">
                  {/* Floating Orbs */}
                  <div className="floating-orb" style={{left: '20%', animationDelay: '-1s'}}></div>
                  <div className="floating-orb" style={{left: '70%', animationDelay: '-4s'}}></div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl">
                      <DollarSign className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400 font-medium">TOTAL COST</div>
                      <div className="text-xs text-blue-400 font-semibold animate-pulse">● LIVE</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="text-3xl font-bold holographic-text stats-counter">${totalCost.toFixed(4)}</div>
                    <div className="text-sm text-gray-300">Processing Cost</div>
                    <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                      <div 
                        className="galactic-progress h-3 rounded-full transition-all duration-1000"
                        style={{width: `${Math.min((totalCost / 0.1) * 100, 100)}%`}}
                      ></div>
                    </div>
                  </div>
                </div>
              )}
            
              {/* Content Generation */}
              <div className="galactic-card rounded-2xl p-6 hover-lift cosmic-glow">
                {/* Floating Orbs */}
                <div className="floating-orb" style={{left: '15%', animationDelay: '-2s'}}></div>
                <div className="floating-orb" style={{left: '75%', animationDelay: '-5s'}}></div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 rounded-xl">
                    <BookOpen className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400 font-medium">CONTENT</div>
                    <div className="text-xs text-emerald-400 font-semibold animate-pulse">● GENERATED</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="text-3xl font-bold holographic-text stats-counter">{totalWords.toLocaleString()}</div>
                  <div className="text-sm text-gray-300">Words Generated</div>
                  <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                    <div 
                      className="galactic-progress h-3 rounded-full transition-all duration-1000"
                      style={{width: `${Math.min((totalWords / 5000) * 100, 100)}%`}}
                    ></div>
                  </div>
                </div>
              </div>

              {/* FOURTH CARD - PROGRESS BAR */}
              <div className="galactic-card rounded-2xl p-6 hover-lift cosmic-glow">
                {/* Floating Orbs */}
                <div className="floating-orb" style={{left: '25%', animationDelay: '-1.5s'}}></div>
                <div className="floating-orb" style={{left: '80%', animationDelay: '-4.5s'}}></div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-orange-500/20 to-orange-600/20 rounded-xl">
                    <TrendingUp className="w-6 h-6 text-orange-400" />
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400 font-medium">WORKFLOW</div>
                    <div className="text-xs text-orange-400 font-semibold animate-pulse">● PROGRESS</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="text-3xl font-bold holographic-text stats-counter">{Math.round(currentStatus?.progress || 0)}%</div>
                  <div className="text-sm text-gray-300">
                    {currentStatus?.status === 'completed' ? 'Delivered' : 
                     currentStatus?.progress >= 100 ? 'Generated' : 'Progress'}
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`h-3 rounded-full transition-all duration-1000 ${
                        currentStatus?.status === 'completed' || currentStatus?.progress >= 100
                          ? 'bg-gradient-to-r from-emerald-500 to-green-500'
                          : 'galactic-progress'
                      }`}
                      style={{width: `${Math.min(currentStatus?.progress || 0, 100)}%`}}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Clean Node Progress */}
            {currentStatus && (
              <div className="glass-effect rounded-2xl p-6 border border-gray-700/50 animate-fade-in-up">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className={`p-4 rounded-2xl ${
                      currentStatus.status === 'completed' ? 'bg-gradient-to-br from-emerald-500/20 to-green-500/20' :
                      currentStatus.status === 'error' ? 'bg-gradient-to-br from-red-500/20 to-red-600/20' :
                      'bg-gradient-to-br from-blue-500/20 to-purple-500/20'
                    }`}>
                      {getStatusIcon(currentStatus.status)}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        {currentStatus.nodeName || 'Processing...'}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          currentStatus.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' :
                          currentStatus.status === 'error' ? 'bg-red-500/20 text-red-300' :
                          'bg-blue-500/20 text-blue-300'
                        }`}>
                          {currentStatus.status === 'completed' ? '✅ COMPLETED' :
                           currentStatus.status === 'error' ? '❌ ERROR' :
                           '⚡ PROCESSING'}
                        </span>
                        {currentStatus.providerName && (
                          <span className="text-sm text-gray-400">
                            via {formatProviderName(currentStatus.providerName)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Clean Progress Display */}
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white mb-1">
                      {Math.round(currentStatus.progress || 0)}%
                    </div>
                    <div className="text-sm text-gray-400">Progress</div>
                    {currentStatus.tokens > 0 && (
                      <div className="text-sm text-purple-400 mt-1">
                        {currentStatus.tokens.toLocaleString()} tokens
                      </div>
                    )}
                  </div>
                </div>


                {/* Error Display - Simplified */}
                {currentStatus.error && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="text-red-300 font-bold">Error</h4>
                        <p className="text-red-200 text-sm mt-1">{currentStatus.error}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Success Output */}
            {currentStatus?.output && currentStatus.status === 'completed' && (
              <div className="space-y-6 animate-fade-in-up">
                {/* Content Statistics */}
                <div className="glass-effect rounded-2xl p-6 border border-emerald-500/30 bg-emerald-500/10">
                  <div className="flex items-start space-x-4">
                    <div className="p-4 bg-emerald-500/20 rounded-2xl">
                      <CheckCircle className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="text-emerald-300 font-bold text-2xl">🎉 Content Generated Successfully!</h4>
                        {testRunStored && (
                          <div className="flex items-center space-x-2 bg-emerald-500/20 px-4 py-2 rounded-xl">
                            <Database className="w-4 h-4 text-emerald-400" />
                            <span className="text-emerald-300 text-sm font-medium">Stored in Books Table</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Enhanced Statistics Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="glass-effect rounded-xl p-4 border border-emerald-500/20 hover-lift">
                          <div className="text-2xl font-bold text-emerald-300">{totalWords.toLocaleString()}</div>
                          <div className="text-sm text-emerald-400">Words Generated</div>
                          {currentStatus.output?.metadata?.totalCharacters && (
                            <div className="text-xs text-gray-400 mt-1">
                              {currentStatus.output.metadata.totalCharacters.toLocaleString()} characters
                            </div>
                          )}
                        </div>
                        <div className="glass-effect rounded-xl p-4 border border-emerald-500/20 hover-lift">
                          <div className="text-2xl font-bold text-emerald-300">{apiCalls.length}</div>
                          <div className="text-sm text-emerald-400">AI Processing Steps</div>
                          {currentStatus.output?.metadata?.nodeCount && (
                            <div className="text-xs text-gray-400 mt-1">
                              {currentStatus.output.metadata.nodeCount} content nodes
                            </div>
                          )}
                        </div>
                        {!executionData?.isUserExecution && (
                          <div className="glass-effect rounded-xl p-4 border border-emerald-500/20 hover-lift">
                            <div className="text-2xl font-bold text-emerald-300">${totalCost.toFixed(4)}</div>
                            <div className="text-sm text-emerald-400">Total Cost</div>
                            {currentStatus.output?.metadata?.generationStats && (
                              <div className="text-xs text-gray-400 mt-1">
                                {currentStatus.output.metadata.generationStats.averageWordsPerSection} avg words/section
                              </div>
                            )}
                          </div>
                        )}
                        <div className="glass-effect rounded-xl p-4 border border-emerald-500/20 hover-lift">
                          <div className="text-2xl font-bold text-emerald-300">{totalTokens.toLocaleString()}</div>
                          <div className="text-sm text-emerald-400">Tokens Used</div>
                          {currentStatus.output?.metadata?.generationStats && (
                            <div className="text-xs text-gray-400 mt-1">
                              {currentStatus.output.metadata.generationStats.totalSections} sections
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* FLIP BOOK PREVIEW SECTION */}
                      <div className="glass-effect rounded-xl p-6 border border-emerald-500/20 mb-6">
                        <h5 className="font-semibold text-emerald-300 mb-4 flex items-center space-x-2">
                          <BookOpen className="w-5 h-5" />
                          <span>Your Generated Book</span>
                        </h5>
                        
                        {/* FLIP BOOK WITH EDIT TOGGLE */}
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <BookOpen className="w-5 h-5 text-emerald-400" />
                              <span className="text-emerald-300 font-medium">Interactive Preview</span>
                            </div>
                            <button
                              onClick={async () => {
                                if (isEditMode) {
                                  // SAVE MODE - UPDATE MASTER CONTENT AND REGENERATE ALL FORMATS
                                  console.log('💾 Saving edited content and regenerating all formats...')
                                  
                                  // Update master content with edited version
                                  const updatedStatus = {
                                    ...currentStatus,
                                    output: {
                                      ...currentStatus.output,
                                      content: editContent,
                                      lastNodeOutput: {
                                        ...currentStatus.output?.lastNodeOutput,
                                        content: editContent
                                      }
                                    }
                                  }
                                  
                                  setCurrentStatus(updatedStatus)
                                  
                                  // Regenerate all format deliverables with edited content
                                  try {
                                    // Get user's selected output formats
                                    const selectedFormats = executionData?.userInput?.output_formats || 
                                                          executionData?.userInput?.outputFormats || 
                                                          ['markdown', 'html']
                                    
                                    console.log('🔄 Regenerating formats:', selectedFormats)
                                    
                                    // Import services dynamically
                                    const { WorkflowExecutionService } = await import('../../services/workflowExecutionService')
                                    const workflowService = new WorkflowExecutionService()
                                    
                                    // Prepare compiled content structure for formatting
                                    const compiledContent = {
                                      userInput: executionData?.userInput || {},
                                      generatedContent: {
                                        'edited-content': editContent
                                      },
                                      content: editContent
                                    }
                                    
                                    // Regenerate all formats with edited content
                                    const regeneratedFormats = await workflowService.formatFinalOutput(compiledContent, {
                                      exportFormats: selectedFormats
                                    })
                                    
                                    console.log('✅ Formats regenerated:', Object.keys(regeneratedFormats.allFormats || {}))
                                    
                                    // Generate new deliverables
                                    const newDeliverables = workflowService.generateDeliverables(regeneratedFormats, {})
                                    
                                    // Update status with new deliverables
                                    const finalStatus = {
                                      ...updatedStatus,
                                      output: {
                                        ...updatedStatus.output,
                                        deliverables: newDeliverables,
                                        formattedOutputs: regeneratedFormats.allFormats
                                      }
                                    }
                                    
                                    setCurrentStatus(finalStatus)
                                    
                                    console.log('✅ Content saved and all formats regenerated successfully!')
                                    alert('✅ Changes saved! All export formats have been updated with your edits.')
                                    
                                  } catch (error) {
                                    console.error('❌ Failed to regenerate formats:', error)
                                    alert('⚠️ Content saved but format regeneration failed. You may need to re-run the workflow.')
                                  }
                                  
                                  setIsEditMode(false)
                                  
                                } else {
                                  // EDIT MODE - LOAD CURRENT CONTENT
                                  const rawContent = currentStatus.output?.content || 
                                                   currentStatus.output?.lastNodeOutput?.content || 
                                                   currentStatus.output?.nodeOutputs?.['process-1']?.content ||
                                                   'Content to edit...'
                                  setEditContent(typeof rawContent === 'string' ? rawContent : JSON.stringify(rawContent))
                                  setIsEditMode(true)
                                }
                              }}
                              className="flex items-center px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all duration-300 hover:scale-105"
                            >
                              <Edit3 className="w-4 h-4 mr-2" />
                              {isEditMode ? 'Save Changes' : 'Edit Book'}
                            </button>
                            
                            <button
                              onClick={() => {
                                // Get default title from workflow input
                                const defaultTitle = executionData?.userInput?.story_title || 
                                                   executionData?.userInput?.book_title || 
                                                   'Generated Book'
                                setCustomBookTitle(defaultTitle)
                                setShowBookNamingModal(true)
                              }}
                              className="flex items-center px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all duration-300 hover:scale-105 ml-2"
                            >
                              <BookOpen className="w-4 h-4 mr-2" />
                              Save to Books
                            </button>
                            
                          </div>
                          
                          {/* CONDITIONAL DISPLAY: EDIT MODE OR FLIP BOOK */}
                          {isEditMode ? (
                            /* RICH TEXT EDITOR MODE */
                            <div className="bg-gray-900 rounded-xl p-6 min-h-[500px]">
                              <div className="h-full flex flex-col">
                                {/* Editor Header */}
                                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-700">
                                  <h3 className="text-lg font-bold text-white">Edit Your Book</h3>
                                  <div className="flex items-center space-x-4">
                                    <span className="text-sm text-purple-300 font-medium">
                                      {editContent.split(/\s+/).filter(word => word.length > 0).length.toLocaleString()} words
                                    </span>
                                    <span className="text-sm text-gray-400">
                                      {editContent.length.toLocaleString()} characters
                                    </span>
                                  </div>
                                </div>

                                {/* Rich Text Editor */}
                                <div className="flex-1">
                                  <RichTextEditor
                                    value={editContent}
                                    onChange={setEditContent}
                                    placeholder="Edit your book content here..."
                                    height={400}
                                    className="w-full"
                                  />
                                </div>
                              </div>
                            </div>
                          ) : (
                            /* FLIP BOOK MODE */
                            <div className="bg-gradient-to-br from-amber-50 to-orange-100 rounded-xl p-6 min-h-[500px] relative overflow-hidden" style={{ perspective: '1000px' }}>
                            {/* Book spine */}
                            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-4/5 bg-gradient-to-r from-amber-800 to-amber-900 shadow-xl z-10 rounded-sm" />
                            
                            {/* Left page */}
                            <div className="absolute left-0 top-0 w-1/2 h-full bg-white shadow-xl rounded-l-lg overflow-hidden">
                              <div className="p-6 h-full overflow-y-auto">
                                <div 
                                  className="text-gray-800 leading-relaxed"
                                  style={{
                                    fontFamily: 'Georgia, serif',
                                    fontSize: '14px',
                                    lineHeight: '1.7',
                                    textAlign: 'justify'
                                  }}
                                >
                                  <h1 style={{color: '#1f2937', marginBottom: '1rem', fontSize: '1.8rem', fontWeight: '700', textAlign: 'center'}}>
                                    {currentStatus.output?.metadata?.title || currentStatus.output?.userInput?.story_title || 'Your Book Title'}
                                  </h1>
                                  <p style={{textAlign: 'center', marginBottom: '2rem', color: '#6b7280'}}>
                                    by {currentStatus.output?.metadata?.author || currentStatus.output?.userInput?.author_name || 'The Author'}
                                  </p>
                                  <div style={{marginBottom: '2rem'}}>
                                    <h2 style={{color: '#374151', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: '600'}}>Foreword</h2>
                                    <p>Dear Reader, welcome to this comprehensive guide...</p>
                                  </div>
                                </div>
                              </div>
                              <div className="absolute bottom-4 left-6 text-xs text-gray-500">{currentPage}</div>
                            </div>
                            
                            {/* Right page */}
                            <div className="absolute right-0 top-0 w-1/2 h-full bg-white shadow-xl rounded-r-lg overflow-hidden">
                              <div className="p-6 h-full overflow-y-auto">
                                <div 
                                  className="text-gray-800 leading-relaxed"
                                  style={{
                                    fontFamily: 'Georgia, serif',
                                    fontSize: '14px',
                                    lineHeight: '1.7',
                                    textAlign: 'justify'
                                  }}
                                  dangerouslySetInnerHTML={{ 
                                    __html: (() => {
                                      // Get clean content and format it properly for display
                                      const rawContent = currentStatus.output?.content || 
                                                       currentStatus.output?.lastNodeOutput?.content || 
                                                       currentStatus.output?.nodeOutputs?.['process-1']?.content ||
                                                       'Content preview will appear here...'
                                      
                                      if (typeof rawContent === 'string') {
                                        // Clean and format the content for display
                                        return rawContent
                                          .replace(/\n/g, '<br>')
                                          .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                                          .replace(/\*([^*]+)\*/g, '<em>$1</em>')
                                          .replace(/# ([^\n]+)/g, '<h2 style="color: #1f2937; margin: 1.5rem 0 1rem 0; font-size: 1.5rem; font-weight: 700;">$1</h2>')
                                          .replace(/## ([^\n]+)/g, '<h3 style="color: #374151; margin: 1.2rem 0 0.8rem 0; font-size: 1.2rem; font-weight: 600;">$1</h3>')
                                          .substring(0, 2000) + (rawContent.length > 2000 ? '...' : '')
                                      }
                                      return rawContent
                                    })()
                                  }}
                                />
                              </div>
                              <div className="absolute bottom-4 right-6 text-xs text-gray-500">{currentPage + 1}</div>
                            </div>
                            
                            {/* Page navigation */}
                            <button 
                              onClick={goToPreviousPage}
                              disabled={currentPage <= 1}
                              className={`absolute left-2 top-1/2 transform -translate-y-1/2 p-2 text-white rounded-full shadow-lg transition-all hover:scale-110 ${
                                currentPage <= 1 
                                  ? 'bg-gray-400 cursor-not-allowed' 
                                  : 'bg-purple-600 hover:bg-purple-700'
                              }`}
                            >
                              <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={goToNextPage}
                              disabled={currentPage >= totalPages}
                              className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-white rounded-full shadow-lg transition-all hover:scale-110 ${
                                currentPage >= totalPages 
                                  ? 'bg-gray-400 cursor-not-allowed' 
                                  : 'bg-purple-600 hover:bg-purple-700'
                              }`}
                            >
                              <ChevronRight className="w-5 h-5" />
                            </button>
                          </div>
                          )}
                        </div>
                      </div>

                      {/* Download Section */}
                      <div className="glass-effect rounded-xl p-4 border border-emerald-500/20 mb-6">
                        <h5 className="font-semibold text-emerald-300 mb-3 flex items-center space-x-2">
                          <Download className="w-5 h-5" />
                          <span>Download Your Content</span>
                        </h5>
                        <div className="space-y-3">
                          {getDeliverables().length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                              {getDeliverables().map((deliverable, index) => (
                                <button
                                  key={index}
                                  onClick={() => downloadContent(deliverable.format, deliverable.content, deliverable.filename)}
                                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-3 rounded-xl flex items-center space-x-2 transition-all duration-300 text-sm font-medium hover-lift"
                                >
                                  <Download className="w-4 h-4" />
                                  <span>Download {deliverable.format.toUpperCase()}</span>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-gray-400 text-sm">No downloadable formats available</p>
                              <button
                                onClick={() => {
                                  const content = currentStatus.output?.content || currentStatus.output
                                  if (content) {
                                    downloadContent('txt', content, `lekhika_output_${new Date().toISOString().split('T')[0]}.txt`)
                                  }
                                }}
                                className="mt-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 hover-lift"
                              >
                                Download as Text
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Clean Node Status List */}
            <div className="glass-effect rounded-2xl p-6 border border-gray-700/50 animate-fade-in-up">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl">
                    <Activity className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Node Status</h3>
                    <p className="text-sm text-gray-400">Workflow execution progress</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowAIThinking(true)}
                    className="flex items-center space-x-2 text-sm bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 px-3 py-2 rounded-xl transition-all duration-300"
                    title="View AI thinking process"
                  >
                    <Brain className="w-4 h-4" />
                    <span>AI Thinking</span>
                  </button>
                  <button
                    onClick={() => {
                      setExecutionLog([])
                      setTotalCost(0)
                      setTotalTokens(0)
                      setTotalWords(0)
                      setCurrentStatus(null)
                      setAiThinkingData([])
                    }}
                    className="flex items-center space-x-2 text-sm bg-red-600/20 hover:bg-red-600/30 text-red-400 px-3 py-2 rounded-xl transition-all duration-300"
                    title="Clear execution logs"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Clear</span>
                  </button>
                  <div className="flex items-center space-x-2 text-sm bg-gray-700/50 px-3 py-2 rounded-xl">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-300">Live</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                {executionLog.length === 0 ? (
                  <div className="text-center py-8">
                    <Loader className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-spin" />
                    <p className="text-gray-400">Waiting for execution to start...</p>
                  </div>
                ) : (
                  executionLog.map((log, index) => (
                    <div 
                      key={index} 
                      className={`
                        rounded-xl p-4 border-l-4 transition-all duration-300
                        ${log.status === 'completed' ? 'border-l-emerald-500 bg-emerald-500/5' : 
                          log.status === 'error' ? 'border-l-red-500 bg-red-500/5' : 
                          'border-l-blue-500 bg-blue-500/5'}
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            {getStatusIcon(log.status)}
                          </div>
                          <div>
                            <div className="flex items-center space-x-3">
                              <span className="font-semibold text-white text-base">
                                {log.nodeName}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                log.status === 'completed' ? 'bg-emerald-500/20 text-emerald-300' :
                                log.status === 'error' ? 'bg-red-500/20 text-red-300' :
                                'bg-blue-500/20 text-blue-300'
                              }`}>
                                {log.status === 'completed' ? 'COMPLETED' :
                                 log.status === 'error' ? 'ERROR' :
                                 'PROCESSING'}
                              </span>
                            </div>
                            {log.providerName && (
                              <div className="text-sm text-gray-400 mt-1">
                                via {formatProviderName(log.providerName)}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          {/* Trigger Button for Failed Nodes */}
                          {log.status === 'error' && (
                            <button
                              onClick={() => {
                                // Trigger retry for this specific node
                                if (window.workflowExecutionService && log.nodeId) {
                                  window.workflowExecutionService.retryNode(log.nodeId)
                                }
                              }}
                              className="flex items-center space-x-2 px-3 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 text-orange-400 rounded-lg transition-all duration-300 text-sm font-medium"
                              title="Retry this node"
                            >
                              <RefreshCw className="w-4 h-4" />
                              <span>Retry</span>
                            </button>
                          )}
                          
                          {/* Resume Button for Completed Nodes (Checkpoint Resume) */}
                          {log.status === 'completed' && log.checkpointCreated && (
                            <button
                              onClick={async () => {
                                // Resume from this node's checkpoint
                                if (window.workflowExecutionService && log.nodeId) {
                                  const currentWorkflowId = window.currentWorkflowId || Object.keys(window.workflowExecutionService.getAllExecutionStates())[0]
                                  console.log(`🔄 UI: Resuming from checkpoint ${log.nodeId}`)
                                  
                                  // Check if execution context is available
                                  if (!window.currentNodes || !window.currentEdges) {
                                    console.error(`❌ Missing execution context - cannot resume`)
                                    alert('Cannot resume: Missing workflow context. Please restart the workflow.')
                                    return
                                  }
                                  
                                  try {
                                    const result = await workflowExecutionService.restartFromCheckpoint(
                                      currentWorkflowId, 
                                      log.nodeId,
                                      window.currentNodes,
                                      window.currentEdges,
                                      window.currentInitialInput,
                                      window.currentProgressCallback,
                                      window.currentSuperAdminUser
                                    )
                                    
                                    if (result.success) {
                                      console.log(`✅ Successfully resumed from checkpoint ${log.nodeId}`)
                                    } else {
                                      console.error(`❌ Failed to resume from checkpoint:`, result.error)
                                      alert(`Failed to resume: ${result.error}`)
                                    }
                                  } catch (error) {
                                    console.error(`❌ Error resuming from checkpoint:`, error)
                                    alert(`Error resuming: ${error.message}`)
                                  }
                                }
                              }}
                              className="flex items-center space-x-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 rounded-lg transition-all duration-300 text-sm font-medium"
                              title="Resume from this checkpoint"
                            >
                              <RotateCcw className="w-4 h-4" />
                              <span>Resume From Here</span>
                            </button>
                          )}

                          {/* Book Recovery Button - Always Available */}
                          <button
                              onClick={async () => {
                                // Recover book from AI thinking logs
                                const currentWorkflowId = window.currentWorkflowId || Object.keys(window.workflowExecutionService?.getAllExecutionStates() || {})[0]
                                console.log(`📚 Attempting book recovery for workflow ${currentWorkflowId}`)
                                
                                try {
                                  // Get recovery options with AI thinking data from state
                                  const recoveryOptions = await bookRecoveryService.getRecoveryOptions(currentWorkflowId, aiThinkingData)
                                  
                                  if (recoveryOptions.canRecover) {
                                    // Show recovery dialog
                                    const userChoice = confirm(
                                      `Book recovery available!\n\n` +
                                      `Title: ${recoveryOptions.recoveredBook.title}\n` +
                                      `Chapters: ${recoveryOptions.recoveredBook.metadata.totalChapters}\n` +
                                      `Words: ${recoveryOptions.recoveredBook.metadata.totalWords}\n\n` +
                                      `Would you like to save this as a draft book?`
                                    )
                                    
                                    if (userChoice) {
                                      // Save the recovered book
                                      const savedBook = await bookRecoveryService.saveRecoveredBook(
                                        recoveryOptions.recoveredBook,
                                        window.currentSuperAdminUser?.id || 'anonymous'
                                      )
                                      
                                      alert(`✅ Book recovered and saved successfully!\nBook ID: ${savedBook.id}`)
                                    }
                                  } else {
                                    alert(`❌ Cannot recover book: ${recoveryOptions.reason}`)
                                  }
                                } catch (error) {
                                  console.error(`❌ Book recovery failed:`, error)
                                  alert(`Book recovery failed: ${error.message}`)
                                }
                              }}
                              className="flex items-center space-x-2 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 rounded-lg transition-all duration-300 text-sm font-medium"
                              title="Recover book from AI thinking logs"
                            >
                              <BookOpen className="w-4 h-4" />
                              <span>Recover Book</span>
                            </button>

                          {/* Trigger Button for Paused Nodes */}
                          {log.status === 'paused' && (
                            <button
                              onClick={() => {
                                // Trigger resume for this specific node
                                if (window.workflowExecutionService && log.nodeId) {
                                  window.workflowExecutionService.resumeFromNode(log.nodeId)
                                }
                              }}
                              className="flex items-center space-x-2 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 rounded-lg transition-all duration-300 text-sm font-medium"
                              title="Resume from this node"
                            >
                              <Play className="w-4 h-4" />
                              <span>Resume</span>
                            </button>
                          )}
                          
                          <div className="text-right">
                            <div className="text-lg font-bold text-white">
                              {log.progress}%
                            </div>
                            <div className="flex items-center space-x-3 text-sm text-gray-400">
                              {log.tokens > 0 && (
                                <span className="text-purple-400">
                                  {log.tokens.toLocaleString()} tokens
                                </span>
                              )}
                              {log.cost > 0 && (
                                <span className="text-emerald-400">
                                  ${log.cost.toFixed(4)}
                                </span>
                              )}
                              <span>{log.timestamp}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Error Display - Only show if there's an error */}
                      {log.error && (
                        <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                          <div className="flex items-center space-x-2 mb-1">
                            <AlertCircle className="w-4 h-4 text-red-400" />
                            <span className="font-semibold text-red-300 text-sm">Error</span>
                          </div>
                          <p className="text-red-200 text-sm">{log.error}</p>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* AI Thinking Modal */}
        <AIThinkingModal
          isOpen={showAIThinking}
          onClose={() => setShowAIThinking(false)}
          thinkingData={aiThinkingData}
        />

        <PreviewApprovalModal
          isOpen={showPreviewApproval}
          onClose={() => setShowPreviewApproval(false)}
          previewContent={previewData?.content || ''}
          nodeName={previewData?.nodeName || ''}
          currentAttempt={previewData?.currentAttempt || 1}
          maxAttempts={previewData?.maxAttempts || 3}
          onApprove={async () => {
            // Handle approval - continue workflow
            console.log('✅ Preview approved, continuing workflow')
            setShowPreviewApproval(false)
            setPreviewData(null)
          }}
          onReject={async (feedback) => {
            // Handle rejection - regenerate with feedback
            console.log('❌ Preview rejected with feedback:', feedback)
            setShowPreviewApproval(false)
            setPreviewData(null)
            // TODO: Trigger regeneration with feedback
          }}
        />

        {/* Book Naming Modal */}
        {showBookNamingModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[70] p-4">
            <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-900 rounded-2xl shadow-2xl max-w-md w-full border border-indigo-500/30">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Name Your Book</h3>
                    <p className="text-indigo-300 text-sm">Give your masterpiece a title</p>
                  </div>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-indigo-300 mb-2">
                      Book Title
                    </label>
                    <input
                      type="text"
                      value={customBookTitle}
                      onChange={(e) => setCustomBookTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter book title..."
                      autoFocus
                    />
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowBookNamingModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-600/20 hover:bg-gray-600/30 border border-gray-500/30 text-gray-300 rounded-xl transition-all duration-300 text-sm font-medium hover-lift"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (customBookTitle.trim()) {
                        saveBookToDatabaseWithCustomTitle(customBookTitle.trim())
                        setShowBookNamingModal(false)
                      } else {
                        alert('Please enter a book title')
                      }
                    }}
                    className="flex-1 px-4 py-3 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/30 text-indigo-300 rounded-xl transition-all duration-300 text-sm font-medium hover-lift"
                  >
                    Save Book
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  )
}

export default WorkflowExecutionModal