import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { 
  X, 
  Sparkles, 
  Loader2, 
  CheckCircle, 
  AlertTriangle, 
  Rocket,
  Download,
  Eye,
  FileText,
  Type,
  Hash,
  Mail,
  Link as LinkIcon,
  Calendar,
  Image as ImageIcon,
  Video,
  Music,
  CheckSquare,
  List,
  Upload,
  BookOpen,
  Target,
  Zap,
  Star,
  Wand2,
  Layers,
  Compass,
  Trophy,
  Crown,
  Heart,
  Minimize2
} from 'lucide-react'
import FormFieldRenderer from './FormFieldRenderer'
import UserExecutionModal from './UserExecutionModal'
import TokenLimitExceededModal from './TokenLimitExceededModal'
import { engineFormService } from '../services/engineFormService'
import { useUserAuth } from '../contexts/UserAuthContext'
import { useTheme } from '../contexts/ThemeContext'
import useTokenWallet from '../hooks/useTokenWallet'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import UltraButton from './UltraButton'
import UltraFormField from './UltraFormField'
import { inputSetService } from '../services/inputSetService'
import { runPresetLint } from '../dev/presetLinter'

const GenerateModal = ({ 
  isOpen, 
  onClose, 
  engine,
  onExecutionComplete,
  initialFormData
}) => {
  // Add custom styles for enhanced scrollbar and animations
  React.useEffect(() => {
    const styles = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: rgba(var(--color-surface), 0.5);
        border-radius: 4px;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: var(--theme-primary);
        border-radius: 4px;
        opacity: 0.6;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        opacity: 0.8;
      }
      .field-glow {
        box-shadow: 0 0 0 1px var(--theme-primary), 0 0 20px rgba(var(--theme-primary-rgb), 0.3);
      }
    `;
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  const { user } = useUserAuth()
  const { currentTheme, isDark } = useTheme()
  const { stats: walletStats, wallet, policy } = useTokenWallet()
  const modalControls = useAnimation()
  const particleControls = useAnimation()
  const [formData, setFormData] = useState({})
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formConfig, setFormConfig] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [completedFields, setCompletedFields] = useState(new Set())
  const [fieldCharCounts, setFieldCharCounts] = useState({})
  const [focusedField, setFocusedField] = useState(null)
  const [touchedFields, setTouchedFields] = useState(new Set())
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false)
  const [presets, setPresets] = useState([])
  const [loadingPresets, setLoadingPresets] = useState(false)
  const [applyingPresetId, setApplyingPresetId] = useState(null)
  const [previewPresetId, setPreviewPresetId] = useState(null)
  const initialDataRef = useRef(null)
  const previousFormBeforeApplyRef = useRef(null)
  
  // Execution modal states
  const [showExecutionModal, setShowExecutionModal] = useState(false)
  const [executionModalData, setExecutionModalData] = useState(null)
  const [currentExecutionId, setCurrentExecutionId] = useState(null)
  const pollingIntervalRef = useRef(null)
  const [currentApiKey, setCurrentApiKey] = useState(null) // Store API key for stop requests
  const [pollingIssue, setPollingIssue] = useState(false)
  const consecutiveErrorCountRef = useRef(0) // Track consecutive errors to stop polling
  const [celebrationMode, setCelebrationMode] = useState(false)
  const [fieldCompletionAnimations, setFieldCompletionAnimations] = useState({})
  const [particles, setParticles] = useState([])
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isFormMinimized, setIsFormMinimized] = useState(false)
  const [showTokenLimitModal, setShowTokenLimitModal] = useState(false)

  // Enhanced particle system for celebrations
  const createCelebrationParticles = useCallback((count = 20) => {
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 2,
      color: currentTheme.colors.accent,
      emoji: ['✨', '🎉', '⭐', '💫', '🌟', '🚀', '💎', '🔥'][Math.floor(Math.random() * 8)],
      duration: Math.random() * 2 + 1
    }))
    setParticles(prev => [...prev, ...newParticles])
    
    // Clear particles after animation
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.includes(p)))
    }, 3000)
  }, [currentTheme])

  useEffect(() => {
    if (isOpen && engine) {
      initializeForm()
      setIsModalVisible(true)
      modalControls.start({ opacity: 1, scale: 1 })
    } else {
      setIsModalVisible(false)
      setIsFormMinimized(false)
      modalControls.start({ opacity: 0, scale: 0.95 })
    }
  }, [isOpen, engine, modalControls])

  // Poll execution status when execution is running
  useEffect(() => {
    if (currentExecutionId && showExecutionModal) {
      startPolling()
    }
    
    // Stop polling when tab is hidden, resume when visible
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden - stop polling
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null
        }
      } else {
        // Tab is visible - resume polling if execution is still running
        if (currentExecutionId && showExecutionModal && !pollingIntervalRef.current) {
          startPolling()
        }
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [currentExecutionId, showExecutionModal])

  const stopPolling = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
      console.log('🛑 Polling stopped due to persistent errors')
    }
  }

  const startPolling = () => {
    // Clear any existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
    }
    
    // Reset error count when starting fresh
    consecutiveErrorCountRef.current = 0

    // Poll every 10 seconds (reduced frequency to minimize database load)
    const interval = setInterval(async () => {
      // Skip polling if tab is hidden
      if (document.hidden) {
        return
      }
      
      try {
        const { data, error } = await supabase
          .from('engine_executions')
          .select('id, status, execution_data, completed_at, created_at')
          .eq('id', currentExecutionId)
          .maybeSingle()

        if (error) {
          consecutiveErrorCountRef.current += 1
          console.error('❌ Polling error:', error)
          
          // Check if it's an authentication/session error
          const isAuthError = error.message?.includes('session') || 
                             error.message?.includes('Session') ||
                             error.message?.includes('authentication') ||
                             error.message?.includes('unauthorized') ||
                             error.code === 'PGRST301' || // RLS policy violation
                             error.code === '42501' // Insufficient privilege
          
          // Stop polling immediately on auth errors - they won't resolve themselves
          if (isAuthError) {
            console.error('🛑 Authentication error detected - stopping polling. Please refresh the page.')
            stopPolling()
            setPollingIssue(true)
            toast.error('Session expired. Please refresh the page to continue.')
            return
          }
          
          // Stop polling after 5 consecutive errors (15 seconds of failures)
          if (consecutiveErrorCountRef.current >= 5) {
            console.error('🛑 Too many consecutive polling errors - stopping polling')
            stopPolling()
            setPollingIssue(true)
            toast.error('Unable to fetch execution status. Please refresh the page.')
            return
          }
          
          setPollingIssue(true)
          // Try fallback only once per error sequence
          if (consecutiveErrorCountRef.current === 1) {
            await fallbackStatusCheck()
          }
          return
        }

        if (!data) {
          consecutiveErrorCountRef.current += 1
          console.warn('⚠️ Execution not found:', currentExecutionId)
          
          // Stop polling if execution not found after 3 attempts
          if (consecutiveErrorCountRef.current >= 3) {
            console.warn('🛑 Execution not found after multiple attempts - stopping polling')
            stopPolling()
            setPollingIssue(true)
            return
          }
          
          setPollingIssue(true)
          return
        }
        
        // Success - reset error count
        if (consecutiveErrorCountRef.current > 0) {
          consecutiveErrorCountRef.current = 0
        }

        if (pollingIssue) setPollingIssue(false)

        console.log('📊 Execution status:', data.status, 'Progress:', data.execution_data?.progress)
        console.log('🔍 Full execution_data:', JSON.stringify(data.execution_data, null, 2))

        // Only update if there's actual change in progress or status
        if (data.execution_data || data.nodeName || data.status) {
          setExecutionModalData(prev => {
            // SURGICAL FIX: Worker sends data directly, not in execution_data
            const currentProgress = data.execution_data?.progress || data.progress || 0
            const currentStatus = data.status
            const currentNode = data.execution_data?.currentNode || data.execution_data?.nodeName || data.nodeName
            
            // Skip update if nothing meaningful changed
            if (prev?.progress === currentProgress && 
                prev?.status === currentStatus && 
                prev?.nodeName === currentNode &&
                !data.execution_data?.error && !data.error) {
              return prev
            }

            // Update execution modal with latest data - map worker format to modal format
            
            const backendSteps = Array.isArray(data.execution_data?.processingSteps)
              ? data.execution_data.processingSteps
              : null

            let updatedSteps

            if (backendSteps) {
              updatedSteps = backendSteps.filter(step => step?.nodeId && step.nodeId !== 'initializing')
            } else {
              const existingSteps = prev?.processingSteps || []
              updatedSteps = [...existingSteps]

              const currentNodeId = data.execution_data?.currentNodeId || data.node_id || currentNode

              if (
                currentNode &&
                currentNodeId &&
                currentNode !== prev?.currentNode &&
                currentNode !== 'Initializing...'
              ) {
                const newStep = {
                  id: currentNodeId,
                  nodeId: currentNodeId,
                  name: currentNode,
                  status: 'running',
                  progress: currentProgress,
                  tokens: data.execution_data?.tokens || data.tokens || 0,
                  words: data.execution_data?.words || data.words || 0,
                  duration: data.execution_data?.duration || 0,
                  provider: data.execution_data?.providerName || data.providerName || null,
                  nodeIndex: typeof data.execution_data?.nodeIndex === 'number'
                    ? data.execution_data.nodeIndex
                    : null,
                  totalNodes: data.execution_data?.totalNodes || null,
                  timestamp: new Date().toISOString()
                }
                updatedSteps.push(newStep)
              } else if (currentNodeId && existingSteps.length > 0) {
                const existingIndex = existingSteps.findIndex(step => step.nodeId === currentNodeId || step.id === currentNodeId)
                if (existingIndex >= 0) {
                  updatedSteps[existingIndex] = {
                    ...existingSteps[existingIndex],
                    progress: currentProgress,
                    tokens: data.execution_data?.tokens || data.tokens || 0,
                    words: data.execution_data?.words || data.words || 0,
                    duration: data.execution_data?.duration || 0,
                    provider: data.execution_data?.providerName || data.providerName || existingSteps[existingIndex].provider || null
                  }
                }
              }

              if (currentNodeId !== prev?.currentNodeId && updatedSteps.length > 0) {
                const prevNodeId = prev?.currentNodeId || prev?.nodeId || prev?.currentNode
                const prevIndex = updatedSteps.findIndex(step => step.nodeId === prevNodeId || step.id === prevNodeId)
                if (prevIndex >= 0) {
                  updatedSteps[prevIndex] = {
                    ...updatedSteps[prevIndex],
                    status: 'completed',
                    progress: 100
                  }
                }
              }
            }
            
            return {
            ...prev,
              // Core status
              status: currentStatus,
              executionStatus: currentStatus,
              progress: currentProgress,
              // Node info
              nodeName: currentNode || prev?.nodeName,
              nodeId: data.execution_data?.currentNodeId || currentNode || prev?.nodeId,
              nodeType: data.execution_data?.nodeType || data.nodeType || prev?.nodeType,
              currentNode: currentNode || prev?.currentNode,
              currentNodeId: data.execution_data?.currentNodeId || currentNode || prev?.currentNodeId,
              // AI data - SURGICAL FIX: Map worker data directly (not execution_data)
              aiThinking: data.execution_data?.aiResponse || 
                         data.execution_data?.processedContent ||
                         data.execution_data?.aiThinking || 
                         data.execution_data?.currentThinking || 
                         data.execution_data?.thinking || 
                         data.execution_data?.currentAIResponse ||
                         data.aiResponse ||
                         data.processedContent ||
                         prev?.aiThinking,
              aiResponse: data.execution_data?.aiResponse || data.aiResponse || prev?.aiResponse,
              // Results - Merge with previous to preserve completed nodes
              nodeResults: {
                ...(prev?.nodeResults || {}),
                ...(data.execution_data?.nodeResults || data.nodeResults || {})
              },
              allFormats: {
                ...(prev?.allFormats || {}),
                ...(data.execution_data?.allFormats || {})
              },
              userInput: data.execution_data?.userInput || prev?.userInput || {},
              nodes: data.execution_data?.workflow?.nodes || data.execution_data?.nodes || prev?.nodes || [],
              edges: data.execution_data?.workflow?.edges || data.execution_data?.edges || prev?.edges || [],
              // NEW: Current output for live updates
              currentOutput: data.execution_data?.currentOutput || prev?.currentOutput,
              // SURGICAL FIX: Add processingSteps to preserve execution history
              processingSteps: updatedSteps,
              // Metrics - ACCUMULATE, don't replace
              tokens: Math.max(data.execution_data?.tokens || data.tokens || 0, prev?.tokens || 0),
              words: Math.max(data.execution_data?.words || data.words || 0, prev?.words || 0),
              cost: (prev?.cost || 0) + (data.execution_data?.cost || data.cost || 0),
              duration: data.execution_data.duration || Math.round((new Date() - new Date(data.created_at)) / 1000) || prev?.duration || 0,
              // Provider
              providerName: data.execution_data?.providerName || data.providerName || prev?.providerName,
              // Thinking History
              thinkingHistory: data.execution_data.thinkingHistory || prev?.thinkingHistory || [],
              // Phase Information
              currentPhase: data.execution_data.currentPhase || prev?.currentPhase,
              phaseDescription: data.execution_data.phaseDescription || prev?.phaseDescription,
              // Chapter Information
              chapterInfo: data.execution_data.chapterInfo || prev?.chapterInfo,
              lastValidationError: data.execution_data.lastValidationError || prev?.lastValidationError || null,
              error: data.execution_data?.error || data.error || prev?.error || null,
              failedNode: data.execution_data?.failedNodeId || data.execution_data?.failedNode || prev?.failedNode || null,
              failedNodeId: data.execution_data?.failedNodeId || prev?.failedNodeId || null,
              executionData: {
                ...(prev?.executionData || {}),
                ...(data.execution_data || {})
              },
              // Error
              error: data.execution_data.error || prev?.error,
              // Message
              message: data.execution_data.message || prev?.message,
              // Timestamp
              timestamp: data.execution_data.timestamp || prev?.timestamp,
              // Execution ID
              executionId: currentExecutionId || prev?.executionId
            }
          })
        }

        // Stop polling if completed or failed
        if (data.status === 'completed' || data.status === 'failed' || data.status === 'cancelled') {
          console.log('✅ Execution finished with status:', data.status)
          
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
            pollingIntervalRef.current = null
          }

          // Final update with results
          if (data.status === 'completed' && data.execution_data) {
            // Map nodeResults from execution_data to match polling format
            const nodeResults = data.execution_data.nodeResults || data.execution_data.result?.nodeOutputs || {}
            
            setExecutionModalData(prev => ({
              ...prev, // SURGICAL FIX: PRESERVE all existing process data (tokens, steps, logs)
              status: 'completed',
              progress: 100,
              output: data.execution_data.result || data.execution_data,
              // MERGE nodeResults instead of replacing to preserve process data
              nodeResults: {
                ...(prev?.nodeResults || {}), // Keep existing process data
                ...nodeResults // Add final results
              },
              allFormats: data.execution_data.allFormats || 
                         Object.values(nodeResults).find(r => r.metadata?.allFormats)?.metadata?.allFormats ||
                         prev?.allFormats, // Preserve existing formats if new ones missing
              completedAt: data.completed_at,
              // CRITICAL FIX: PRESERVE processingSteps array - this is what shows on screen
              // Prefer backend-provided steps, fallback to prior state
              processingSteps: Array.isArray(data.execution_data.processingSteps)
                ? data.execution_data.processingSteps.map(step => ({
                    ...step,
                    status: 'completed',
                    progress: 100
                  }))
                : (prev?.processingSteps || []).map(step => ({
                    ...step,
                    status: 'completed',
                    progress: 100
                  })),
              // PRESERVE detailed execution metrics that were accumulated during polling
              tokens: prev?.tokens || 0, // Keep accumulated tokens
              words: prev?.words || 0,   // Keep accumulated words  
              cost: prev?.cost || 0,     // Keep accumulated cost
              duration: prev?.duration || 0 // Keep duration
            }))
            
            toast.success('✨ Generation completed!')
          } else if (data.status === 'failed') {
            const errorMessage = data.execution_data?.error_message || 
                               data.execution_data?.error || 
                               data.execution_data?.message || 
                               'Generation failed due to an unexpected error'
            toast.error(`Generation failed: ${errorMessage}`)
            setExecutionModalData(prev => ({
              ...prev,
              status: 'failed',
              error: errorMessage,
              message: errorMessage
            }))
          } else if (data.status === 'cancelled') {
            setExecutionModalData(prev => ({
              ...prev,
              status: 'cancelled',
              message: 'Execution stopped by user'
            }))
            toast.success('✅ Execution stopped successfully')
          }
        }

      } catch (error) {
        consecutiveErrorCountRef.current += 1
        console.error('❌ Polling error:', error)
        
        // Check if it's an authentication/session error
        const isAuthError = error.message?.includes('session') || 
                           error.message?.includes('Session') ||
                           error.message?.includes('authentication') ||
                           error.message?.includes('unauthorized')
        
        // Stop polling immediately on auth errors
        if (isAuthError) {
          console.error('🛑 Authentication error in polling - stopping')
          stopPolling()
          setPollingIssue(true)
          toast.error('Session expired. Please refresh the page to continue.')
          return
        }
        
        // Stop polling after 5 consecutive errors
        if (consecutiveErrorCountRef.current >= 5) {
          console.error('🛑 Too many consecutive polling errors - stopping polling')
          stopPolling()
          setPollingIssue(true)
          toast.error('Unable to fetch execution status. Please refresh the page.')
          return
        }
        
        setPollingIssue(true)
        // Try fallback only once per error sequence
        if (consecutiveErrorCountRef.current === 1) {
          await fallbackStatusCheck()
        }
      }
    }, 10000)

    pollingIntervalRef.current = interval
  }

  // Fallback status check via Edge Function (worker) when DB polling fails
  const fallbackStatusCheck = async () => {
    try {
      if (!currentExecutionId || !currentApiKey) {
        console.warn('⚠️ Cannot check status: missing execution ID or API key')
        // Stop polling if we don't have required data
        stopPolling()
        return
      }
      const statusUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/engines-api/executions/${currentExecutionId}`
      const resp = await fetch(statusUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'X-API-Key': currentApiKey,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
        }
      })
      
      // Handle non-OK responses - stop polling on auth errors
      if (!resp.ok) {
        const errorText = await resp.text().catch(() => 'Unknown error')
        const isAuthError = errorText.includes('session') || 
                           errorText.includes('Session') ||
                           errorText.includes('authentication') ||
                           errorText.includes('unauthorized') ||
                           resp.status === 401 ||
                           resp.status === 403
        
        if (isAuthError) {
          console.error('🛑 Authentication error in fallback check - stopping polling')
          stopPolling()
          toast.error('Session expired. Please refresh the page to continue.')
          return
        }
        
        console.warn('⚠️ Fallback status check failed:', resp.status, errorText.substring(0, 100))
        return
      }
      
      const json = await resp.json().catch(() => ({}))
      const payload = json?.data || json // handle both shapes
      if (!payload) return
      const executionDataPayload = payload.executionData || {}

      const status = payload.status || executionModalData?.status
      const progress = payload.metadata?.progress || executionDataPayload.progress || payload.progress || executionModalData?.progress || 0
      const nodeResultsPatch = executionDataPayload.nodeResults || payload.nodeResults || {}

      setExecutionModalData(prev => ({
        ...prev,
        status,
        progress,
        nodeName: executionDataPayload.currentNode || prev?.nodeName,
        nodeId: executionDataPayload.currentNode || prev?.nodeId,
        nodeResults: {
          ...(prev?.nodeResults || {}),
          ...nodeResultsPatch
        },
        aiThinking: executionDataPayload.aiResponse || prev?.aiThinking,
        lastValidationError: executionDataPayload.lastValidationError || prev?.lastValidationError,
        message: status === 'running' ? 'Recovering from polling error...' : prev?.message
      }))

      if (status === 'completed' || status === 'failed' || status === 'cancelled') {
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current)
          pollingIntervalRef.current = null
        }
        if (status === 'completed') toast.success('✨ Generation completed!')
        if (status === 'failed') toast.error('Generation failed (from worker status)')
        if (status === 'cancelled') toast.success('✅ Execution stopped successfully')
      }
      } catch (e) {
        console.warn('Worker fallback status check failed:', e)
        
        // Check if it's an authentication error
        const isAuthError = e.message?.includes('session') || 
                           e.message?.includes('Session') ||
                           e.message?.includes('authentication') ||
                           e.message?.includes('unauthorized') ||
                           String(e).includes('session')
        
        if (isAuthError) {
          console.error('🛑 Authentication error in fallback check - stopping polling')
          stopPolling()
          toast.error('Session expired. Please refresh the page.')
        }
      }
  }

  const initializeForm = async () => {
    try {
      // Get form configuration from engine
      const config = engineFormService.getEngineFormConfig(engine)
      setFormConfig(config)

      // Initialize form data - NO PRESELECTED VALUES
      const initialData = {}
      config.inputFields.forEach(field => {
        const fieldKey = field.variable || field.name || field.id
        
        // NO PRESELECTED DEFAULTS - All fields start empty unless explicitly required
        if (field.type === 'multiselect' || field.multiple) {
          // For multiselect, always initialize as empty array
          initialData[fieldKey] = []
        } else if (field.type === 'checkbox') {
          // For checkboxes, default to false
          initialData[fieldKey] = false
        } else {
          // For ALL other fields (including select), start empty
          initialData[fieldKey] = ''
        }
      })
      // Overlay provided initialFormData onto known fields (surgically; no unknown keys)
      let hydratedData = { ...initialData }
      if (initialFormData && typeof initialFormData === 'object') {
        Object.keys(initialData).forEach(k => {
          if (Object.prototype.hasOwnProperty.call(initialFormData, k)) {
            hydratedData[k] = initialFormData[k]
          }
        })
      }
      setFormData(hydratedData)
      initialDataRef.current = hydratedData
      previousFormBeforeApplyRef.current = null
      setTouchedFields(new Set())
      setHasAttemptedSubmit(false)

      // SURGICAL FIX: Mark all prefilled fields as completed and update char counts
      const newCompletedFields = new Set()
      const newCharCounts = {}
      config.inputFields.forEach(field => {
        const fieldKey = field.variable || field.name || field.id
        const value = hydratedData[fieldKey]
        
        // Check if field has a meaningful value
        const hasValue = (() => {
          if (value === null || value === undefined) return false
          if (field.type === 'multiselect' || field.multiple) {
            return Array.isArray(value) && value.length > 0
          }
          if (field.type === 'checkbox') {
            return value === true || value === 'true'
          }
          if (typeof value === 'string') {
            return value.trim().length > 0
          }
          return !!value
        })()
        
        if (hasValue) {
          newCompletedFields.add(fieldKey)
          if (typeof value === 'string') {
            newCharCounts[fieldKey] = value.length
          }
        }
      })
      setCompletedFields(newCompletedFields)
      setFieldCharCounts(prev => ({ ...prev, ...newCharCounts }))
      
      // Run validation to clear false errors for prefilled fields
      setTimeout(() => {
        const validation = engineFormService.validateFormData(hydratedData, config)
        setFormErrors(validation.errors)
      }, 100)

      // Load client presets for this form based on flow_key if available
      try {
        setLoadingPresets(true)
        const flowKey = engine?.flow_config?.metadata?.flow_key 
          || engine?.metadata?.flow_key 
          || engine?.ai_engines?.metadata?.flow_key 
          || engine?.flow_key
          || engine?.name?.toLowerCase().replace(/\s+/g, '_') // Fallback: derive from engine name
        
        console.log('🎯 Loading presets for flowKey:', flowKey)
        console.log('🎯 Engine structure:', { 
          flow_config_metadata: engine?.flow_config?.metadata, 
          metadata: engine?.metadata,
          flow_key: engine?.flow_key,
          name: engine?.name
        })
        
        if (flowKey) {
          const list = await inputSetService.listByFlowKey(flowKey)
          console.log('🎯 Presets loaded:', list?.length || 0, list)
          setPresets(Array.isArray(list) ? list : [])
        } else {
          console.warn('⚠️ No flow_key found, cannot load presets')
          setPresets([])
        }
      } catch (e) {
        console.error('❌ Preset fetch failed:', e)
        setPresets([])
      } finally {
        setLoadingPresets(false)
      }

    } catch (error) {
      console.error('Error initializing form:', error)
      toast.error('Failed to initialize form')
    }
  }

  const handleFieldChange = (fieldName, value) => {
    console.log(`🔄 Field change: ${fieldName} = ${value} (type: ${typeof value})`)
    
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }))

    setTouchedFields(prev => {
      const next = new Set(prev)
      next.add(fieldName)
      return next
    })

    // Update character count
    if (typeof value === 'string') {
      setFieldCharCounts(prev => ({
        ...prev,
        [fieldName]: value.length
      }))
    }

    // Mark field as completed if it has a value
    // Handle both string values and boolean (checkbox) values
    if (value !== null && value !== undefined && value !== '' && value !== false) {
      setCompletedFields(prev => new Set([...prev, fieldName]))
    } else {
      setCompletedFields(prev => {
        const newSet = new Set(prev)
        newSet.delete(fieldName)
        return newSet
      })
    }

    // Clear error for this field
    if (formErrors[fieldName]) {
      setFormErrors(prev => ({
        ...prev,
        [fieldName]: null
      }))
    }
  }

  const validateForm = () => {
    if (!formConfig) return { isValid: false, errors: {} }
    const validation = engineFormService.validateFormData(formData, formConfig)
    setFormErrors(validation.errors)
    return validation
  }

  const handleFormMinimize = useCallback(() => {
    setIsFormMinimized(true)
    setIsModalVisible(false)
  }, [])

  const handleFormRestore = useCallback(() => {
    setIsFormMinimized(false)
    setIsModalVisible(true)
  }, [])

  // SURGICAL FIX: Make filtered fields reactive to formData changes
  const flowKey = useMemo(() => {
    return engine?.flow_config?.metadata?.flow_key 
      || engine?.metadata?.flow_key 
      || engine?.ai_engines?.metadata?.flow_key 
      || engine?.flow_key
  }, [engine])

  const allowsAudioOutputs = useMemo(() => {
    const audioKeywords = ['audio', 'audiobook', 'narration', 'narrative audio', 'podcast', 'voice', 'voiceover', 'spoken', 'narrated', 'tts']
    const audioToggleKeys = ['include_audio', 'include_audiobook', 'enable_audio', 'generate_audio', 'audio_package', 'include_narration', 'include_voiceover']

    const parseBoolean = (value) => {
      if (typeof value === 'boolean') return value
      if (typeof value === 'string') return value.toLowerCase() === 'true'
      if (typeof value === 'number') return value === 1
      return false
    }

    const toggleEnabled = audioToggleKeys.some(key => parseBoolean(formData?.[key]))

    const searchValues = []
    Object.entries(formData || {}).forEach(([key, value]) => {
      if (!value) return
      if (typeof value === 'string') {
        searchValues.push(value.toLowerCase())
      } else if (Array.isArray(value)) {
        value.forEach(item => {
          if (typeof item === 'string') {
            searchValues.push(item.toLowerCase())
          }
        })
      }
    })

    const keywordMatch = searchValues.some(value =>
      audioKeywords.some(keyword => value.includes(keyword))
    )

    const isAudiobookFlow = (flowKey || '').toLowerCase().includes('audio')

    return isAudiobookFlow || toggleEnabled || keywordMatch
  }, [flowKey, formData])

  const filteredInputFields = useMemo(() => {
    if (!formConfig?.inputFields) return []
    
    const isAudiobookFlow = (flowKey || '').toLowerCase().includes('audio')
    const allowAudioFormats = allowsAudioOutputs
    
    return formConfig.inputFields.filter((field) => {
      // Hide image-related fields unless include_images is checked
      const imageRelatedFields = ['image_style', 'art_type', 'aspect_ratio', 'camera_angle', 'focal_length', 
                                  'lighting_style', 'background', 'color_palette', 'mood', 'composition', 
                                  'negative_prompt', 'num_images', 'seed', 'upscaler', 'image_placement']
      if (imageRelatedFields.includes(field.variable)) {
        const shouldHide = !formData.include_images
        if (shouldHide) {
          console.log(`🚫 Hiding image field: ${field.variable} (include_images = ${formData.include_images})`)
          return false
        } else {
          console.log(`✅ Showing image field: ${field.variable} (include_images = ${formData.include_images})`)
        }
      }
      
      // Hide e-cover related fields unless include_ecover is checked
      const ecoverRelatedFields = ['ecover_layout', 'ecover_style', 'title_text', 'subtitle_text', 
                                   'author_text', 'brand_colors', 'logo_url']
      if (ecoverRelatedFields.includes(field.variable)) {
        const shouldHide = !formData.include_ecover
        if (shouldHide) {
          console.log(`🚫 Hiding ecover field: ${field.variable} (include_ecover = ${formData.include_ecover})`)
          return false
        } else {
          console.log(`✅ Showing ecover field: ${field.variable} (include_ecover = ${formData.include_ecover})`)
        }
      }
      
      return true
    }).map((field) => {
      // SURGICAL FIX: Filter output_formats options based on book type / audio capability
      if (field.variable === 'output_formats') {
        const originalOptions = field.options || []
        const AUDIO_PATTERNS = ['.mp3', '.m4a', '.wav', 'audiobook']

        const filterOption = (option) => {
          const label = typeof option === 'object' ? (option.label || option.value || '') : String(option)
          const optionValue = typeof option === 'object' ? option.value : option
          const optionLabel = String(label).toLowerCase()
          const optionValueStr = optionValue != null ? String(optionValue).toLowerCase() : ''
          const isAudioFormat = AUDIO_PATTERNS.some(pattern => optionLabel.includes(pattern) || optionValueStr.includes(pattern))
          if (!allowAudioFormats && isAudioFormat) {
            return false
          }
          return true
        }

        const filteredOptions = Array.isArray(originalOptions)
          ? originalOptions.filter(filterOption)
          : originalOptions

        if (!allowAudioFormats && filteredOptions.length !== originalOptions.length) {
          const removed = originalOptions.length - filteredOptions.length
          console.log(`🎵 Filtered out ${removed} audio format(s) based on current configuration (flow=${flowKey || 'unknown'})`)
        }

        return {
          ...field,
          options: filteredOptions
        }
      }
      
      return field
    })
  }, [formConfig, formData.include_images, formData.include_ecover, flowKey, allowsAudioOutputs])

  useEffect(() => {
    if (!formData?.output_formats) return
    if (allowsAudioOutputs) return

    const AUDIO_VALUES = ['mp3', 'm4a', 'wav', 'audiobook']
    const selected = Array.isArray(formData.output_formats)
      ? formData.output_formats
      : [formData.output_formats]

    const sanitized = selected.filter(value => {
      if (value == null) return false
      const valueStr = String(value).toLowerCase()
      return !AUDIO_VALUES.includes(valueStr)
    })

    if (sanitized.length !== selected.length) {
      console.log('🎧 Removing disallowed audio output formats due to current configuration', {
        original: formData.output_formats,
        sanitized
      })
      setFormData(prev => ({
        ...prev,
        output_formats: sanitized
      }))
    }
  }, [formData.output_formats, allowsAudioOutputs, setFormData])

  const getRequiredFieldsStatus = () => {
    if (!formConfig) return { completed: 0, total: 0, allFilled: false }
    
    const requiredFields = formConfig.inputFields.filter(f => f.required)
    const completedRequired = requiredFields.filter(f => {
      const fieldKey = f.variable || f.name
      return completedFields.has(fieldKey)
    })
    
    return {
      completed: completedRequired.length,
      total: requiredFields.length,
      allFilled: completedRequired.length === requiredFields.length
    }
  }

  const getFieldIcon = (field) => {
    const fieldName = (field.name || '').toLowerCase()
    const fieldLabel = (field.label || '').toLowerCase()
    
    // Check field type first
    switch (field.type) {
      case 'email': return Mail
      case 'url': return LinkIcon
      case 'number': return Hash
      case 'date': return Calendar
      case 'file': return Upload
      case 'textarea': return FileText
      case 'checkbox': return CheckSquare
      case 'select': return List
      case 'multiselect': return CheckSquare
      default: break
    }
    
    // Smart icon based on field name/label
    if (fieldName.includes('book') || fieldLabel.includes('book')) return BookOpen
    if (fieldName.includes('title') || fieldLabel.includes('title')) return Star
    if (fieldName.includes('description') || fieldLabel.includes('description')) return FileText
    if (fieldName.includes('target') || fieldLabel.includes('target') || fieldName.includes('audience')) return Target
    if (fieldName.includes('genre') || fieldLabel.includes('genre') || fieldName.includes('category')) return Zap
    if (fieldName.includes('tone') || fieldLabel.includes('style')) return Wand2
    if (fieldName.includes('image') || fieldLabel.includes('image')) return ImageIcon
    if (fieldName.includes('video')) return Video
    if (fieldName.includes('audio') || fieldName.includes('music')) return Music
    
    return Type
  }

  const handleSubmit = async () => {
    setHasAttemptedSubmit(true)
    const validation = validateForm()
    if (!validation.isValid) {
      toast.error('Please fix the form errors before submitting')
      return
    }

    // SURGICAL FIX: Check token limit before execution
    if (walletStats && policy?.effective) {
      const policyLimit = policy.effective.monthlyCap || policy.effective.baseAllocation
      const currentTokens = walletStats.used || 0
      const availableTokens = walletStats.available || 0

      // Check if user has exceeded policy limit
      if (policyLimit && policyLimit > 0 && currentTokens >= policyLimit) {
        console.warn('🚫 Token limit exceeded:', { currentTokens, policyLimit, availableTokens })
        setShowTokenLimitModal(true)
        setIsSubmitting(false)
        return
      }

      // Check if available tokens are insufficient (less than 1000 as safety buffer)
      if (availableTokens < 1000) {
        console.warn('⚠️ Low token balance:', { availableTokens, policyLimit })
        setShowTokenLimitModal(true)
        setIsSubmitting(false)
        return
      }
    }

    setIsSubmitting(true)

    try {
      // Get user ID
      const userId = user?.id || user?.user_id || user?.uid
      if (!userId) {
        throw new Error('User not authenticated')
      }

      // Get user's API key for this engine from user_engines table
      const engineIdToQuery = engine.engine_id || engine.id
      console.log('🔑 Loading API key for user:', userId, 'engine:', engineIdToQuery)
      
      const { data, error } = await supabase
        .from('user_engines')
        .select('api_key, engine_id, user_id, id')
        .eq('user_id', userId)
        .eq('engine_id', engineIdToQuery)

      if (error) {
        console.error('❌ API key fetch error:', error)
        throw new Error(`Failed to load API key: ${error.message}`)
      }

      if (!data || data.length === 0) {
        console.error('❌ No API key found for this engine')
        throw new Error('No API key found for this engine. Please contact support.')
      }

      const userEngineRecord = data[0]
      const apiKey = userEngineRecord.api_key
      const userEngineId = userEngineRecord.id // User's engine copy ID (for API URL)
      const masterEngineId = userEngineRecord.engine_id // Master engine ID (for foreign key)
      
      // Store API key for stop requests
      setCurrentApiKey(apiKey)
      
      console.log('✅ API key loaded:', apiKey)
      console.log('✅ User engine ID:', userEngineId)
      console.log('✅ Master engine ID:', masterEngineId)
      console.log('🔍 API key format check:', {
        hasKey: !!apiKey,
        length: apiKey?.length,
        startsWithLEKH: apiKey?.startsWith('LEKH-2-'),
        fullKey: apiKey
      })

      if (!apiKey) {
        throw new Error('API key is empty')
      }

      if (!apiKey.startsWith('LEKH-2-')) {
        throw new Error(`Invalid API key format: ${apiKey}. Expected format: LEKH-2-xxxxx`)
      }

      // SURGICAL FIX: Use prefilled initial values for untouched fields (no need to click every field)
      const effectiveFormData = (() => {
        const base = {}
        const initial = initialDataRef.current || {}
        const keys = new Set([...Object.keys(initial), ...Object.keys(formData || {})])
        keys.forEach((k) => {
          const v = formData?.[k]
          const isEmptyArray = Array.isArray(v) && v.length === 0
          const isEmptyString = typeof v === 'string' && v.trim() === ''
          base[k] = (v === undefined || v === null || isEmptyArray || isEmptyString) ? initial[k] : v
        })
        return base
      })()

      // SURGICAL FIX: Clean field values that use label format instead of raw values
      const cleanedFormData = { ...effectiveFormData }
      
      // Clean output_formats: "PDF Document (.pdf)" -> "pdf"
      if (cleanedFormData.output_formats && Array.isArray(cleanedFormData.output_formats)) {
        cleanedFormData.output_formats = cleanedFormData.output_formats.map(format => {
          // If format contains parentheses like "PDF Document (.pdf)", extract the extension
          const match = format.match(/\(\.(\w+)\)/)
          if (match) {
            return match[1] // Return just "pdf" from "PDF Document (.pdf)"
          }
          return format // Return as-is if no parentheses (already clean)
        })
        console.log('🧹 Cleaned output_formats from:', formData.output_formats)
        console.log('🧹 Cleaned output_formats to:', cleanedFormData.output_formats)
      }
      
      // SURGICAL FIX: Clean chapter_count: "4 Chapters" -> "4"
      if (cleanedFormData.chapter_count && typeof cleanedFormData.chapter_count === 'string') {
        const originalValue = cleanedFormData.chapter_count
        // Remove " Chapters", " Chapter", or any text suffix - extract just the number
        cleanedFormData.chapter_count = cleanedFormData.chapter_count.replace(/\s+chapters?/i, '').trim()
        if (originalValue !== cleanedFormData.chapter_count) {
          console.log('🧹 Cleaned chapter_count from:', originalValue, 'to:', cleanedFormData.chapter_count)
        }
      }
      
      // SURGICAL FIX: Clean word_count if it has label format
      if (cleanedFormData.word_count && typeof cleanedFormData.word_count === 'string') {
        const originalValue = cleanedFormData.word_count
        // Extract just the range/number, remove any descriptive text like "(Brief)"
        const match = cleanedFormData.word_count.match(/^[\d,\-\s]+/)
        if (match) {
          cleanedFormData.word_count = match[0].trim()
          if (originalValue !== cleanedFormData.word_count) {
            console.log('🧹 Cleaned word_count from:', originalValue, 'to:', cleanedFormData.word_count)
          }
        }
      }

      // Prepare submission data
      const submissionData = {
        ...cleanedFormData,
        executionMetadata: {
          timestamp: new Date().toISOString(),
          userId: userId,
          engineId: engineIdToQuery,
          formConfig: formConfig
        }
      }
      
      // SURGICAL FIX: Add exhaustive logging to prove data integrity.
      console.log('📤 FINAL SUBMISSION PAYLOAD:');
      console.log('  - Full Data:', JSON.stringify(submissionData, null, 2));
      console.log('  - CRITICAL CHECK - chapter_count:', submissionData.chapter_count);
      console.log('  - CRITICAL CHECK - word_count:', submissionData.word_count);
      console.log('  - CRITICAL CHECK - output_formats:', submissionData.output_formats);

      console.log('📤 Submitting form data:', submissionData)

      // Parse nodes and edges if they're JSON strings
      let nodes = engine.ai_engines?.nodes || engine.nodes || []
      let edges = engine.ai_engines?.edges || engine.edges || []
      
      if (typeof nodes === 'string') {
        try {
          nodes = JSON.parse(nodes)
          console.log('✅ Parsed nodes from JSON string')
        } catch (e) {
          console.error('❌ Failed to parse nodes:', e)
        }
      }
      
      if (typeof edges === 'string') {
        try {
          edges = JSON.parse(edges)
          console.log('✅ Parsed edges from JSON string')
        } catch (e) {
          console.error('❌ Failed to parse edges:', e)
        }
      }
      
      console.log('🔍 Engine data check:', {
        hasNodes: nodes?.length > 0,
        hasEdges: edges?.length > 0,
        nodeCount: nodes?.length,
        edgeCount: edges?.length,
        engineName: engine.ai_engines?.name || engine.name
      })
      
      // Prepare execution data for WorkflowExecutionModal
      const executionData = {
        nodes: nodes,
        edges: edges,
        userInput: submissionData,
        engineId: masterEngineId, // Master engine ID for database foreign key
        userEngineId: userEngineId, // User copy ID for API calls
        engineName: engine.ai_engines?.name || engine.name,
        // SURGICAL ADDITION: Plumb the engine's image URL into the execution data.
        engineImage: engine.ai_engines?.metadata?.image_url || engine.metadata?.image_url,
        apiKey: apiKey,
        userId: userId,
        isUserExecution: true, // Flag to indicate this is from user area
        // Initialize with proper status and progress for the modal
        status: 'running',
        progress: 0,
        currentNode: 'Initializing...',
        nodeName: 'Initializing...',
        nodeType: 'initialize',
        aiThinking: null,
        nodeResults: {},
        tokens: 0,
        cost: 0,
        words: 0,
        duration: 0,
        providerName: null,
        error: null,
        message: 'Starting execution...',
        timestamp: new Date().toISOString()
      }

      console.log('🚀 Opening execution modal with data:', executionData)
      console.log('🔍 showExecutionModal will be set to:', true)
      console.log('🔍 executionModalData will be set to:', executionData)
      
      // Open execution modal (don't close form modal yet)
      setShowExecutionModal(true)
      setExecutionModalData(executionData)
      
      // Call the Supabase Edge Function to start execution
      // Uses engine API key for authentication (custom auth, not Supabase Auth)
      // Authorization header uses Supabase anon key (required for Edge Functions)
      // X-API-Key header has the engine API key (for validation)
      // IMPORTANT: Use userEngineId (user's copy ID), not master engine ID
      const engineApiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/engines-api/${userEngineId}/execute`
      console.log('📡 Calling execution API:', engineApiUrl)
      console.log('🔑 Using engine API key:', apiKey)
      console.log('🎯 User engine ID:', userEngineId)
      
      const requestBody = {
        userInput: submissionData,
        options: {
          userId: userId,
          isUserExecution: true
        }
      }
      
      console.log('📤 Request details:', {
        url: engineApiUrl,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer [ANON_KEY]',
          'X-API-Key': apiKey
        },
        body: requestBody
      })
      
      const response = await fetch(engineApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`, // Supabase anon key for Edge Function access
          'X-API-Key': apiKey, // Lekhika API key for validation
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY // Backup Supabase anon key
        },
        body: JSON.stringify(requestBody)
      })

      console.log('📥 Response status:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ API Error Response (raw):', errorText)
        console.error('❌ Response headers:', Object.fromEntries(response.headers.entries()))
        
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch (e) {
          errorData = { message: errorText || response.statusText }
        }
        
        console.error('❌ API Error Details (parsed):', errorData)
        throw new Error(errorData.error || errorData.message || 'Failed to start execution')
      }

      const result = await response.json()
      console.log('✅ Execution queued:', result)
      
      // Store execution ID for restart functionality
      if (result.data?.executionId) {
        setCurrentExecutionId(result.data.executionId)
      }
      
      toast.success('🚀 Generation started! Watch the magic happen...')

    } catch (error) {
      console.error('❌ Execution error:', error)
      toast.error(`Generation failed: ${error.message}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  // NEW: Soft-close/minimize the execution modal without stopping the worker.
  // Execution keeps running in the background; user can reopen the modal.
  const closeExecutionModal = () => {
    // Stop local polling, but DO NOT stop the worker execution.
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = null
    }
    
    setShowExecutionModal(false)
  }

  const handleForceStop = async () => {
    if (!currentExecutionId) return
    
    try {
      if (!currentApiKey) {
        console.error('❌ No API key available for stop request')
        toast.error('Cannot stop execution: API key missing')
        return
      }
      
      // Update UI to show cancelling state
      setExecutionModalData(prev => ({
        ...prev,
        status: 'cancelling',
        message: 'Stopping execution...'
      }))
      
      console.log('🛑 Stopping execution:', currentExecutionId)
      console.log('🔑 Using API key:', currentApiKey)
      
      // Call Edge Function stop endpoint with API key
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/engines-api/stop/${currentExecutionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'X-API-Key': currentApiKey, // Use stored API key
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ Worker stop response:', result)
        
        // Update execution status to cancelled in database
        await supabase
          .from('engine_executions')
          .update({ status: 'cancelled' })
          .eq('id', currentExecutionId)
        
        // Immediately reflect cancelled state in UI so user isn't lied to
        setExecutionModalData(prev => ({
          ...prev,
          status: 'cancelled',
          message: 'Execution stopped by user'
        }))
        // Clear execution id so floating pill disappears
        setCurrentExecutionId(null)
        toast.success('Execution stopped')
      } else {
        console.error('❌ Worker stop failed:', response.status)
        toast.error('Failed to stop execution on worker')
        // Revert status
        setExecutionModalData(prev => ({
          ...prev,
          status: 'running',
          message: 'Failed to stop execution'
        }))
      }
    } catch (error) {
      console.error('Error stopping execution:', error)
      toast.error('Failed to stop execution')
      // Revert status
      setExecutionModalData(prev => ({
        ...prev,
        status: 'running',
        message: 'Error stopping execution'
      }))
    }
    // DO NOT close modal - keep it open
  }

  const handleRestart = async () => {
    // Stop current execution if running
    if (currentExecutionId) {
      await handleForceStop()
    }
    
    // Reset modal state
    setShowExecutionModal(false)
    setExecutionModalData(null)
    setCurrentExecutionId(null)
    setCurrentApiKey(null)
    
    // Small delay to ensure state is cleared
    setTimeout(() => {
      // Trigger new execution with same form data
      handleSubmit()
    }, 500)
  }

  // NEW: Floating execution pill when modal is minimized but execution is still running/known.
  const shouldShowExecutionPill =
    currentExecutionId &&
    !showExecutionModal &&
    (!executionModalData ||
      ['running', 'cancelling'].includes(executionModalData.status))

  return (
    <>
      {/* Token Limit Exceeded Modal */}
      <TokenLimitExceededModal
        isOpen={showTokenLimitModal}
        onClose={() => setShowTokenLimitModal(false)}
        currentTokens={walletStats?.used || 0}
        policyLimit={policy?.effective?.monthlyCap || policy?.effective?.baseAllocation || 0}
        availableTokens={walletStats?.available || 0}
      />

      {/* Form Modal */}
      {isOpen && engine && formConfig && !isFormMinimized && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6"
            style={{
              background: `linear-gradient(135deg, 
                rgba(0, 0, 0, 0.8), 
                rgba(15, 23, 42, 0.75))`,
              backdropFilter: 'blur(16px) saturate(150%)'
            }}
            // IMPORTANT: Backdrop click should never kill an in-flight execution – just ignore it.
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              if (currentExecutionId) {
                handleFormMinimize()
              } else {
                onClose()
              }
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 40, rotateX: -15 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: 0, 
                rotateX: 0,
                transition: {
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                  mass: 0.8
                }
              }}
              exit={{ 
                opacity: 0, 
                scale: 0.9, 
                y: -20,
                rotateX: 10,
                transition: { 
                  duration: 0.3,
                  ease: "easeInOut"
                }
              }}
              className="relative w-full h-full max-w-[95vw] max-h-[95vh] 
                         sm:max-w-[90vw] sm:max-h-[85vh]
                         md:max-w-7xl md:h-auto md:aspect-video
                         overflow-hidden rounded-2xl sm:rounded-3xl"
              style={{
                background: `linear-gradient(145deg, 
                  var(--color-surface), 
                  rgba(var(--color-background), 0.95))`,
                backdropFilter: 'blur(24px) saturate(180%)',
                border: '2px solid rgba(var(--theme-primary-rgb), 0.2)',
                boxShadow: `
                  0 25px 50px -12px rgba(0, 0, 0, 0.4),
                  0 0 0 1px rgba(var(--theme-primary-rgb), 0.15),
                  inset 0 1px 0 rgba(255, 255, 255, 0.1)
                `
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Dynamic Gradient Orb Background */}
              <motion.div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  background: `conic-gradient(from 0deg at 50% 50%, 
                    var(--theme-primary) 0deg,
                    var(--theme-secondary) 120deg,
                    var(--theme-accent) 240deg,
                    var(--theme-primary) 360deg)`,
                  filter: 'blur(100px)'
                }}
                animate={{
                  rotate: [0, 360]
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />

              {/* Animated Border Glow */}
              <motion.div
                className="absolute inset-0 rounded-2xl sm:rounded-3xl pointer-events-none"
                style={{
                  background: `linear-gradient(45deg, 
                    transparent 30%, 
                    rgba(var(--theme-primary-rgb), 0.3) 50%, 
                    transparent 70%)`,
                  mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                  maskComposite: 'xor',
                  padding: '2px'
                }}
                animate={{
                  opacity: [0.3, 0.8, 0.3]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
          {/* Enhanced Header with Glassmorphism */}
          <motion.div 
            className="relative flex items-center justify-between p-4 sm:p-6 border-b backdrop-blur-xl"
            style={{ 
              borderColor: 'rgba(var(--theme-primary-rgb), 0.2)',
              background: 'rgba(var(--color-surface), 0.8)'
            }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3 sm:gap-4">
              <motion.div 
                className="relative p-2 sm:p-3 rounded-xl overflow-hidden"
                style={{ 
                  background: 'var(--theme-gradient-primary)',
                }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute inset-0 bg-white/20"
                  animate={{
                    x: ['-100%', '100%']
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
                <Sparkles className="relative w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </motion.div>
              
              <div className="min-w-0 flex-1">
                <motion.h2 
                  className="text-xl sm:text-2xl font-bold truncate"
                  style={{ color: 'var(--color-text)' }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Create Magic with {engine?.ai_engines?.name || engine?.name || 'AI Engine'}
                </motion.h2>
                <motion.p 
                  className="text-xs sm:text-sm opacity-75"
                  style={{ color: 'var(--color-text-muted)' }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 0.75, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  {engine?.ai_engines?.description || engine?.description || 'Create amazing content with AI-powered workflows'}
                </motion.p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-3">
              <motion.button
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  handleFormMinimize()
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative p-2 sm:p-3 rounded-full transition-all duration-300 group"
                style={{
                  background: 'rgba(var(--theme-primary-rgb), 0.08)',
                  border: '2px solid rgba(var(--theme-primary-rgb), 0.25)'
                }}
              >
                <motion.div
                  className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100"
                  style={{ background: 'rgba(var(--theme-primary-rgb), 0.15)' }}
                  transition={{ duration: 0.2 }}
                />
                <Minimize2 
                  className="relative w-5 h-5 sm:w-6 sm:h-6 transition-colors"
                  style={{ color: 'var(--theme-primary)' }}
                />
              </motion.button>

              <motion.button
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  // If an execution is in-flight or the execution modal is open, treat X as "minimize", not "destroy"
                  if (currentExecutionId || showExecutionModal) {
                    handleFormMinimize()
                  } else {
                    onClose()
                  }
                }}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="relative p-2 sm:p-3 rounded-full transition-all duration-300 group"
                style={{
                  background: 'rgba(var(--theme-error-rgb), 0.1)',
                  border: '2px solid rgba(var(--theme-error-rgb), 0.2)'
                }}
              >
                <motion.div
                  className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100"
                  style={{ background: 'rgba(var(--theme-error-rgb), 0.2)' }}
                  transition={{ duration: 0.2 }}
                />
                <X 
                  className="relative w-5 h-5 sm:w-6 sm:h-6 transition-colors"
                  style={{ color: 'var(--theme-error)' }}
                />
              </motion.button>
            </div>
          </motion.div>

          {/* Enhanced Scrollable Content with Custom Scrollbar */}
          <div 
            className="flex-1 overflow-y-auto custom-scrollbar relative"
            style={{ 
              maxHeight: 'calc(100% - 120px)',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(var(--theme-primary-rgb), 0.3) transparent'
            }}
          >
            {/* Dynamic Background Particles */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={`particle-${i}`}
                  className="absolute w-1 h-1 rounded-full opacity-20"
                  style={{ 
                    background: 'var(--theme-accent)',
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`
                  }}
                  animate={{
                    x: [Math.random() * 100 + '%', Math.random() * 100 + '%'],
                    y: [Math.random() * 100 + '%', Math.random() * 100 + '%'],
                    scale: [0, 1, 0],
                    opacity: [0, 0.4, 0]
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: i * 0.2
                  }}
                />
              ))}
            </div>

            {/* Epic Progress Bar */}
            {formConfig && formConfig.inputFields.length > 0 && (
              <div className="px-6 pt-4 pb-3 relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <Sparkles className="w-5 h-5 text-purple-500" />
                    </motion.div>
                    <span className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                      {completedFields.size} of {formConfig.inputFields.length} fields
                    </span>
                  </div>
                  <motion.div
                    key={completedFields.size}
                    initial={{ scale: 1.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="px-3 py-1 rounded-full font-black text-lg"
                    style={{
                      background: completedFields.size === formConfig.inputFields.length
                        ? 'linear-gradient(135deg, #10b981, #059669)'
                        : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      color: 'white',
                      boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)'
                    }}
                  >
                    {Math.round((completedFields.size / formConfig.inputFields.length) * 100)}%
                  </motion.div>
                </div>
                
                {/* Progress Bar with Glow */}
                <div className="relative w-full h-3 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full overflow-hidden shadow-inner">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ 
                      background: completedFields.size === formConfig.inputFields.length
                        ? 'linear-gradient(90deg, #10b981, #059669, #34d399)'
                        : 'linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899)',
                      boxShadow: '0 0 20px rgba(59, 130, 246, 0.6)'
                    }}
                    initial={{ width: 0 }}
                    animate={{ 
                      width: `${(completedFields.size / formConfig.inputFields.length) * 100}%` 
                    }}
                    transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                  />
                  {/* Shimmer Effect */}
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                      width: '50%'
                    }}
                    animate={{
                      x: ['-100%', '200%']
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                  />
                </div>

                {/* Completion Message */}
                <AnimatePresence>
                  {completedFields.size === formConfig.inputFields.length && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-2 text-center"
                    >
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">
                        🎉 All set! Ready to create magic ✨
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-220px)]">
            {loadingPresets && (
              <div className="mb-6 rounded-xl p-4 bg-surface border border-subtle shadow-soft" aria-busy="true">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                    <h4 className="text-sm font-semibold text-emerald-300">Prefilled Inputs</h4>
                  </div>
                  <span className="text-xs text-muted">Loading presets…</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[1,2,3,4].map(i => (
                    <div key={`preset-shimmer-${i}`} className="p-3 rounded-lg bg-surface border border-subtle shadow-soft">
                      <div className="h-4 w-40 rounded mb-2" style={{ background: 'var(--bg-surface-hover)' }} />
                      <div className="h-3 w-full rounded mb-1" style={{ background: 'var(--bg-surface-hover)' }} />
                      <div className="h-3 w-3/4 rounded" style={{ background: 'var(--bg-surface-hover)' }} />
                    </div>
                  ))}
                </div>
              </div>
            )}
            {presets && presets.length > 0 && !loadingPresets && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8 rounded-2xl p-6 bg-gradient-to-br from-purple-900/20 to-blue-900/20 border border-purple-500/30 shadow-xl backdrop-blur-sm"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                        Premium Presets
                      </h4>
                      <p className="text-xs text-gray-400 mt-0.5">Quick start with professional templates</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {import.meta?.env?.MODE !== 'production' && (
                      <button
                        onClick={async () => {
                          try {
                            const issues = await runPresetLint()
                            const total = issues?.reduce((acc, s) => acc + (s.issues?.length || 0), 0) || 0
                            if (total === 0) {
                              toast.success('Preset lint: 0 issues')
                            } else {
                              toast.error(`Preset lint found ${total} issues (see console)`) 
                            }
                          } catch (e) {
                            console.error('Preset lint failed', e)
                            toast.error('Preset lint failed')
                          }
                        }}
                        className="px-3 py-1 text-xs bg-purple-700 hover:bg-purple-600 text-white rounded-md"
                        title="Run preset validation (dev-only)"
                      >
                        Lint Presets
                      </button>
                    )}
                    {previousFormBeforeApplyRef.current && (
                      <button
                        onClick={() => {
                          setFormData(previousFormBeforeApplyRef.current || initialDataRef.current || {})
                          previousFormBeforeApplyRef.current = null
                          toast.success('Cleared preset inputs')
                        }}
                        className="px-3 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded-md"
                      >
                        Clear
                      </button>
                    )}
                    <span className="text-xs text-muted">Apply and edit freely</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {presets.slice(0,5).map((preset, idx) => (
                    <motion.div 
                      key={preset.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className="relative group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="relative p-5 rounded-xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 group-hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors">
                              {preset.name}
                            </h3>
                            <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                              {preset.description}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setPreviewPresetId(prev => (prev === preset.id ? null : preset.id))
                              }}
                              className="px-4 py-2 text-xs font-semibold bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg shadow-md transition-all duration-200"
                            >
                              {previewPresetId === preset.id ? '👁 Hide' : '👁 Preview'}
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={async () => {
                                try {
                                  setApplyingPresetId(preset.id)
                                  console.log('🔧 APPLY PRESET DEBUG:')
                                  console.log('  - Preset:', preset)
                                console.log('  - Input fields:', formConfig.inputFields)
                                
                                // SURGICAL FIX: Use functional update to ensure latest formData
                                let mergedData = null
                                setFormData(currentFormData => {
                                  console.log('  - Current formData (fresh):', currentFormData)
                                  
                                  if (!previousFormBeforeApplyRef.current) {
                                    previousFormBeforeApplyRef.current = { ...currentFormData }
                                  }
                                  
                                  mergedData = inputSetService.applyPreset({ 
                                    preset, 
                                    inputFields: formConfig.inputFields, 
                                    currentValues: currentFormData // Use fresh state
                                  })
                                  console.log('  - Merged result:', mergedData)
                                  
                                  return mergedData // Return the merged data
                                })
                                
                                // Use setTimeout to ensure state has updated before processing
                                setTimeout(() => {
                                  // CRITICAL: Update completedFields to mark all filled fields as completed
                                  const newCompletedFields = new Set()
                                  Object.entries(mergedData).forEach(([key, value]) => {
                                    // Mark field as completed if it has a value
                                    const hasValue = value !== null && value !== undefined && value !== '' && 
                                        !(Array.isArray(value) && value.length === 0) &&
                                        value !== false  // Don't count false checkboxes as completed
                                    
                                    if (hasValue) {
                                      newCompletedFields.add(key)
                                    }
                                    
                                    console.log(`📋 Field "${key}": value="${value}", hasValue=${hasValue}`)
                                  })
                                  console.log('✅ Completed fields after preset:', Array.from(newCompletedFields))
                                  setCompletedFields(newCompletedFields)
                                  
                                  // Update character counts for text fields
                                  const newCharCounts = {}
                                  Object.entries(mergedData).forEach(([key, value]) => {
                                    if (typeof value === 'string') {
                                      newCharCounts[key] = value.length
                                    }
                                  })
                                  setFieldCharCounts(prev => ({ ...prev, ...newCharCounts }))
                                  
                                  // SURGICAL FIX: Clear form errors and trigger validation after preset application
                                  setFormErrors({}) // Clear all existing errors
                                  
                                  // Trigger validation to update form state properly
                                  setTimeout(() => {
                                    const validation = engineFormService.validateFormData(mergedData, formConfig)
                                    setFormErrors(validation.errors)
                                    console.log('✅ Post-preset validation:', validation)
                                  }, 100) // Small delay to ensure state updates
                                  
                                  toast.success('Applied preset')
                                }, 0) // Execute after state update
                              } catch (e) {
                                console.error('Apply preset error', e)
                                toast.error('Failed to apply preset')
                              } finally {
                                setApplyingPresetId(null)
                              }
                              }}
                              className="px-4 py-2 text-xs font-semibold bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white rounded-lg shadow-md transition-all duration-200"
                              disabled={!!applyingPresetId}
                            >
                              {applyingPresetId === preset.id ? '⏳ Applying...' : '✨ Apply'}
                            </motion.button>
                          </div>
                        </div>
                        {preset.tags && preset.tags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {preset.tags.slice(0,3).map((t,i) => (
                              <span 
                                key={`tag-${preset.id}-${i}-${t}`} 
                                className="px-2 py-1 text-[10px] font-medium rounded-full bg-gradient-to-r from-purple-800/30 to-blue-800/30 border border-purple-500/30 text-purple-300"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                        {previewPresetId === preset.id && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 rounded-lg bg-black/30 border border-purple-500/20 p-4 backdrop-blur-sm"
                          >
                            <div className="text-xs font-semibold text-purple-400 mb-3">Preset Configuration:</div>
                            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                              {inputSetService
                                .buildPreview(formConfig.inputFields, preset.variables)
                                .map((row) => (
                                  <div key={row.token} className="flex items-start gap-2 text-xs">
                                    <span className="text-purple-400 font-medium min-w-[100px]">{row.label}:</span>
                                    <span className="text-gray-300 break-words">{row.value}</span>
                                  </div>
                                ))}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
                {/* Form Fields - Smart Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredInputFields.map((field, index) => {
                    const fieldKey = field.variable || field.name
                    const isCompleted = completedFields.has(fieldKey)
                    const charCount = fieldCharCounts[fieldKey] || 0
                    const fieldError = formErrors[fieldKey]
                    const showFieldError = Boolean(fieldError && (hasAttemptedSubmit || touchedFields.has(fieldKey)))
                    const FieldIcon = getFieldIcon(field)
                    const isFocused = focusedField === fieldKey
                    
                    // Full width for textareas, multiselect, and file uploads
                    const isFullWidth = field.type === 'textarea' || 
                                       field.type === 'multiselect' || 
                                       field.type === 'file' ||
                                       (field.label && field.label.length > 30)
                    
                    return (
                  <motion.div
                        key={fieldKey || index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`${isFullWidth ? 'md:col-span-2' : ''}`}
                      >
                        <motion.div 
                          className="relative p-5 rounded-2xl transition-all duration-300 border bg-slate-900/40 backdrop-blur-xl"
                          style={{
                            borderColor: isFocused
                              ? 'rgba(59,130,246,0.6)'
                              : isCompleted
                              ? 'rgba(16,185,129,0.4)'
                              : 'rgba(148,163,184,0.35)',
                            boxShadow: isFocused
                              ? '0 0 30px rgba(59,130,246,0.25)'
                              : isCompleted
                              ? '0 0 24px rgba(16,185,129,0.2)'
                              : '0 6px 20px rgba(15,23,42,0.4)'
                          }}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-11 h-11 rounded-xl flex items-center justify-center border ${
                                  isCompleted
                                    ? 'bg-emerald-500/10 border-emerald-400 text-emerald-300'
                                    : isFocused
                                    ? 'bg-blue-500/10 border-blue-400 text-blue-300'
                                    : 'bg-slate-800/60 border-slate-600 text-slate-300'
                                }`}
                                  >
                                <FieldIcon className="w-5 h-5" />
                          </div>
                              <div>
                                <div className="text-sm font-semibold text-slate-100">
                                  {field.label || field.name}
                                </div>
                                {field.description && (
                                  <p className="text-xs text-slate-400">
                                    {field.description}
                                  </p>
                                )}
                          {field.type === 'textarea' && charCount > 0 && (
                                  <p className="text-[11px] text-slate-400 mt-1">
                                {charCount} chars • {Math.ceil(charCount / 5)} words
                                  </p>
                                )}
                            </div>
                            </div>
                            {field.required && (
                              <span className="text-[10px] font-semibold uppercase tracking-wide text-rose-300 bg-rose-500/10 px-2 py-1 rounded-full">
                                Required
                              </span>
                          )}
                          </div>

                          <div
                            onFocus={() => setFocusedField(fieldKey)}
                            onBlur={() => setFocusedField(null)}
                  >
                    <FormFieldRenderer
                      field={field}
                              value={formData[fieldKey]}
                      onChange={handleFieldChange}
                              error={showFieldError ? fieldError : null}
                      disabled={isSubmitting}
                    />
                          </div>

                          {showFieldError && (
                            <motion.div
                              initial={{ opacity: 0, y: -6 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-3 flex items-center gap-2 text-sm text-rose-300"
                            >
                              <AlertTriangle className="w-4 h-4" />
                              {fieldError}
                  </motion.div>
                          )}

                          {!showFieldError && isCompleted && (
                            <motion.div
                              initial={{ opacity: 0, y: 4 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-3 flex items-center gap-2 text-xs text-emerald-300"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Looks great
                            </motion.div>
                          )}
                        </motion.div>
                      </motion.div>
                    )
                  })}
              </div>

                {/* EPIC Submit Button */}
              <motion.div 
                  className="pt-8 pb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                  {/* Divider with Glow */}
                  <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t" style={{ borderColor: 'var(--border-subtle)' }} />
                    </div>
                    <div className="relative flex justify-center">
                      <span 
                        className="px-4 py-1 text-xs font-bold rounded-full"
                        style={{
                          background: 'var(--bg-elevated)',
                          color: 'var(--text-muted)'
                        }}
                      >
                        {completedFields.size === 0 ? 'START FILLING FIELDS' : 
                         completedFields.size === formConfig?.inputFields?.length ? 'READY TO GENERATE' :
                         `${formConfig?.inputFields?.length - completedFields.size} MORE TO GO`}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <motion.div
                      animate={completedFields.size === formConfig?.inputFields?.length ? {
                        scale: [1, 1.05, 1],
                        rotate: [0, 2, -2, 0]
                      } : {}}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 1
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative"
                    >
                      {/* Button Glow Effect */}
                      {completedFields.size === formConfig?.inputFields?.length && (
                        <motion.div
                          className="absolute inset-0 rounded-2xl blur-2xl"
                          animate={{
                            opacity: [0.5, 0.8, 0.5],
                            scale: [0.95, 1.05, 0.95]
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity
                          }}
                          style={{
                            background: 'linear-gradient(135deg, #10b981, #059669, #34d399)',
                          }}
                        />
                      )}
                      
                      <button
                  onClick={handleSubmit}
                        disabled={isSubmitting || !getRequiredFieldsStatus().allFilled}
                        className="relative px-12 py-5 rounded-2xl font-black text-lg flex items-center gap-3 overflow-hidden transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                          background: completedFields.size === formConfig?.inputFields?.length
                            ? 'linear-gradient(135deg, #10b981, #059669, #34d399)'
                            : 'linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899)',
                          color: 'white',
                          boxShadow: completedFields.size === formConfig?.inputFields?.length
                            ? '0 10px 40px rgba(16, 185, 129, 0.4)'
                            : '0 10px 40px rgba(59, 130, 246, 0.3)',
                          border: 'none'
                        }}
                      >
                        {/* Ambient top progress bar while submitting */}
                        {isSubmitting && (
                          <motion.div
                            className="absolute left-0 top-0 h-0.5 w-full"
                            style={{ background: 'rgba(255,255,255,0.6)' }}
                            initial={{ x: '-100%' }}
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                          />
                        )}
                        {/* Shimmer Effect */}
                        {!isSubmitting && (
                          <motion.div
                            className="absolute inset-0"
                            style={{
                              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                            }}
                            animate={{
                              x: ['-100%', '200%']
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: 'linear'
                            }}
                          />
                        )}
                        
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span>Preparing Magic...</span>
                          </>
                        ) : completedFields.size === formConfig?.inputFields?.length ? (
                          <>
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            >
                              <Sparkles className="w-6 h-6" />
              </motion.div>
                            <span>CREATE MAGIC ✨</span>
                            <Rocket className="w-6 h-6" />
                          </>
                        ) : (
                          <>
                            <Rocket className="w-6 h-6" />
                            <span>Generate Content</span>
                          </>
                        )}
                      </button>
            </motion.div>
                  </div>

                  {/* Helper Text */}
                  {(() => {
                    const reqStatus = getRequiredFieldsStatus()
                    if (reqStatus.total === 0) return null
                    if (reqStatus.allFilled) return null
                    
                    return (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center text-sm mt-4 font-medium"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        {reqStatus.completed === 0 ? (
                          <>Fill all <span className="text-red-500 font-bold">{reqStatus.total} required</span> fields to continue</>
                        ) : (
                          <>
                            <span className="text-green-500 font-bold">{reqStatus.completed}</span> of{' '}
                            <span className="text-red-500 font-bold">{reqStatus.total}</span> required fields completed
                          </>
                        )}
                      </motion.p>
                    )
                  })()}
                </motion.div>
              </motion.div>
            </div>
          </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}

      {isOpen && isFormMinimized && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, x: -20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.9, x: -20 }}
          className="fixed bottom-6 left-6 z-40"
        >
          <button
            onClick={handleFormRestore}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl text-sm font-semibold transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.92), rgba(15, 23, 42, 0.95))',
              border: '1px solid rgba(148, 163, 184, 0.35)',
              color: 'white'
            }}
          >
            <Minimize2 className="w-4 h-4 rotate-90" />
            <span>Open Generate Form</span>
          </button>
        </motion.div>
      )}

      {/* Execution Modal */}
      {showExecutionModal && executionModalData && (
        <UserExecutionModal
          isOpen={showExecutionModal}
          onClose={closeExecutionModal}
          executionData={executionModalData}
          onForceStop={handleForceStop}
          onRestart={handleRestart}
          pollingIssue={pollingIssue}
          onMinimizeForm={handleFormMinimize}
          onRestoreForm={handleFormRestore}
        />
      )}

      {/* NEW: Mini execution status pill when modal is minimized */}
      {shouldShowExecutionPill && (
        <motion.div
          initial={{ opacity: 0, y: 20, x: 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 20, x: 20 }}
          className="fixed bottom-6 right-6 z-40"
        >
          <button
            onClick={() => setShowExecutionModal(true)}
            className="flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl text-sm font-semibold transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, rgba(30, 64, 175, 0.95), rgba(8, 47, 73, 0.98))',
              border: '1px solid rgba(191, 219, 254, 0.4)',
              color: 'white'
            }}
          >
            <Loader2 className="w-4 h-4 animate-spin text-sky-300" />
            <span>View Running Execution</span>
          </button>
        </motion.div>
      )}
    </>
  )
}

export default GenerateModal
