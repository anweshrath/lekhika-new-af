import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Play, 
  Loader2, 
  CheckCircle, 
  AlertTriangle, 
  Settings, 
  FileText,
  Brain,
  Clock,
  Download,
  Eye,
  RefreshCw,
  Sparkles,
  Wand2,
  Zap,
  Star,
  Rocket,
  Crown,
  Gem,
  ArrowRight,
  ArrowLeft,
  Send,
  Sparkle,
  Target,
  Flame,
  Trophy,
  Code,
  Upload,
  Copy,
  Type,
  UserCheck,
  Hash,
  Users,
  BookOpen
} from 'lucide-react'
import FormFieldRenderer from './FormFieldRenderer'
import { engineFormService } from '../services/engineFormService'
import { useUserAuth } from '../contexts/UserAuthContext'
import { supabase } from '../lib/supabase'
import storageService from '../services/storageService'
import toast from 'react-hot-toast'

const EngineFormModal = ({ 
  isOpen, 
  onClose, 
  engine,
  onExecutionComplete 
}) => {
  const { user } = useUserAuth()
  const [formData, setFormData] = useState({})
  const [formErrors, setFormErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isExecuting, setIsExecuting] = useState(false)
  const [executionResult, setExecutionResult] = useState(null)
  const [formConfig, setFormConfig] = useState(null)
  const [activeTab, setActiveTab] = useState('basic')
  const [userReferences, setUserReferences] = useState([])
  const [userPreferences, setUserPreferences] = useState({})
  const [currentStep, setCurrentStep] = useState(1)
  const [apiKey, setApiKey] = useState('')
  const [embedCode, setEmbedCode] = useState('')
  const [colorScheme, setColorScheme] = useState({
    primary: '#8B5CF6',
    secondary: '#3B82F6',
    accent: '#10B981'
  })
  const [selectedTheme, setSelectedTheme] = useState('modern')
  const [customFont, setCustomFont] = useState('Inter')
  const [formStyle, setFormStyle] = useState({
    borderRadius: '12px',
    shadow: 'lg',
    animation: 'smooth'
  })
  const [totalTokens, setTotalTokens] = useState(0)
  const [tokenBreakdown, setTokenBreakdown] = useState([])
  const [showTokenAnimation, setShowTokenAnimation] = useState(false)
  const [userLevel, setUserLevel] = useState('Creator')
  const [userXP, setUserXP] = useState(0)
  const [achievements, setAchievements] = useState([])
  const [storagePreference, setStoragePreference] = useState(storageService.getStoragePreference())
  const [uploadingFiles, setUploadingFiles] = useState(false)

  // Form themes configuration
  const formThemes = {
    modern: {
      name: 'Modern Minimal',
      description: 'Clean and contemporary design',
      font: 'Inter',
      colors: { primary: '#6366F1', secondary: '#8B5CF6', accent: '#10B981', text: '#1F2937', bg: '#FFFFFF' },
      style: { borderRadius: '16px', shadow: 'xl', animation: 'smooth' }
    },
    vintage: {
      name: 'Vintage Classic',
      description: 'Timeless elegance with warm tones',
      font: 'Playfair Display',
      colors: { primary: '#D97706', secondary: '#B45309', accent: '#059669', text: '#451A03', bg: '#FEF3C7' },
      style: { borderRadius: '8px', shadow: 'lg', animation: 'gentle' }
    },
    neon: {
      name: 'Cyber Neon',
      description: 'Futuristic with glowing effects',
      font: 'Orbitron',
      colors: { primary: '#06FFA5', secondary: '#3B82F6', accent: '#F59E0B', text: '#000000', bg: '#0F0F23' },
      style: { borderRadius: '20px', shadow: '2xl', animation: 'pulse' }
    },
    nature: {
      name: 'Earth Natural',
      description: 'Organic and nature-inspired',
      font: 'Poppins',
      colors: { primary: '#16A34A', secondary: '#059669', accent: '#D97706', text: '#1F2937', bg: '#F0FDF4' },
      style: { borderRadius: '24px', shadow: 'md', animation: 'bounce' }
    },
    luxury: {
      name: 'Luxury Gold',
      description: 'Premium and sophisticated',
      font: 'Cormorant Garamond',
      colors: { primary: '#D4AF37', secondary: '#B8860B', accent: '#8B5CF6', text: '#1F2937', bg: '#FFFEF7' },
      style: { borderRadius: '12px', shadow: 'xl', animation: 'elegant' }
    }
  }

  useEffect(() => {
    if (isOpen && engine) {
      initializeForm()
      loadApiKey()
    }
  }, [isOpen, engine])

  useEffect(() => {
    if (formConfig && engine) {
      generateEmbedCode()
    }
  }, [formConfig, engine, selectedTheme, customFont, formStyle])

  useEffect(() => {
    const loadReferences = async () => {
      try {
        const files = await storageService.getFiles()
        setUserReferences(files)
      } catch (error) {
        console.error('Error loading references:', error)
      }
    }
    loadReferences()
  }, [storagePreference])

  const initializeForm = async () => {
    try {
      // Get form configuration from engine
      const config = engineFormService.getEngineFormConfig(engine)
      setFormConfig(config)

      // Initialize form data - NO PRESELECTED VALUES
      const initialData = {}
      config.inputFields.forEach(field => {
        // Use field.name or field.id as the key, with field.variable as fallback
        const fieldKey = field.name || field.id || field.variable
        // NO PRESELECTED DEFAULTS - Start empty
        if (field.type === 'multiselect' || field.multiple) {
          initialData[fieldKey] = []
        } else if (field.type === 'checkbox') {
          initialData[fieldKey] = false
        } else {
          initialData[fieldKey] = ''
        }
      })
      setFormData(initialData)

      // Load user references and preferences
      await loadUserData()

    } catch (error) {
      console.error('Error initializing form:', error)
      toast.error('Failed to initialize form')
    }
  }

  // Format option labels for display (snake_case → Title Case)
  const formatOptionLabel = (value) => {
    if (!value) return ''
    if (typeof value === 'number') return String(value)
    const strValue = String(value)
    return strValue
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  const loadUserData = async () => {
    try {
      // Get user ID from user object (handle different user object structures)
      const userId = user?.user_id || user?.id
      if (!userId) {
        console.warn('No user ID available for loading user data')
        return
      }

      // Load user references and preferences
      const { data, error } = await supabase
        .rpc('get_user_global_preferences', { p_user_id: userId })

      if (error) throw error

      setUserReferences(data?.references || [])
      setUserPreferences(data?.preferences || {})
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const handleFieldChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }))

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

  const handleSubmit = async () => {
    const validation = validateForm()
    if (!validation.isValid) {
      toast.error('Please fix the form errors before submitting')
      return
    }

    setIsSubmitting(true)
    setIsExecuting(true)
    setTotalTokens(0)
    setTokenBreakdown([])
    setShowTokenAnimation(true)

    try {
      // Get user's API key for this engine
      const apiKey = await engineFormService.getUserApiKey(user.id, engine.id)
      if (!apiKey) {
        throw new Error('No API key found for this engine')
      }

      // Prepare submission data
      const submissionData = {
        ...formData,
        userReferences,
        userPreferences,
        executionMetadata: {
          timestamp: new Date().toISOString(),
          userId: user.id,
          engineId: engine.id,
          formConfig: formConfig
        }
      }

      // Submit to engine API
      const result = await engineFormService.submitFormData(
        submissionData, 
        engine.id, 
        apiKey
      )

      // Extract token information from result
      const tokens = result?.tokens || 0
      const breakdown = result?.tokenBreakdown || []
      
      setTotalTokens(tokens)
      setTokenBreakdown(breakdown)
      
      // Gamification: Award XP based on tokens used
      const xpGained = Math.floor(tokens / 100) + 10 // 1 XP per 100 tokens + 10 base XP
      setUserXP(prev => prev + xpGained)
      
      // Check for achievements
      checkAchievements(tokens)

      setExecutionResult(result)
      
      // Magical success animation with token count
      setTimeout(() => {
        toast.success(`✨ Engine executed successfully! Used ${tokens.toLocaleString()} tokens (+${xpGained} XP)`)
        setShowTokenAnimation(false)
      }, 1000)
      
      if (onExecutionComplete) {
        onExecutionComplete(result)
      }

    } catch (error) {
      console.error('Execution error:', error)
      toast.error(`Execution failed: ${error.message}`)
      setShowTokenAnimation(false)
    } finally {
      setIsSubmitting(false)
      setIsExecuting(false)
    }
  }

  const checkAchievements = (tokens) => {
    const newAchievements = []
    
    if (tokens >= 1000 && !achievements.includes('token_master')) {
      newAchievements.push({
        id: 'token_master',
        title: 'Token Master',
        description: 'Used 1,000+ tokens in a single execution',
        icon: '🏆',
        xp: 50
      })
    }
    
    if (tokens >= 5000 && !achievements.includes('ai_powerhouse')) {
      newAchievements.push({
        id: 'ai_powerhouse',
        title: 'AI Powerhouse',
        description: 'Used 5,000+ tokens in a single execution',
        icon: '⚡',
        xp: 100
      })
    }
    
    if (totalTokens >= 10000 && !achievements.includes('content_legend')) {
      newAchievements.push({
        id: 'content_legend',
        title: 'Content Legend',
        description: 'Accumulated 10,000+ total tokens',
        icon: '👑',
        xp: 200
      })
    }
    
    if (newAchievements.length > 0) {
      setAchievements(prev => [...prev, ...newAchievements])
      newAchievements.forEach(achievement => {
        setTimeout(() => {
          toast.success(`🎉 Achievement Unlocked: ${achievement.title}! (+${achievement.xp} XP)`)
        }, 2000)
      })
    }
  }

  const handleDownloadResult = () => {
    if (!executionResult) return

    const dataStr = JSON.stringify(executionResult, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${engine.name}_result_${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files)
    if (files.length === 0) return

    setUploadingFiles(true)
    try {
      const uploadPromises = files.map(async (file) => {
        const result = await storageService.uploadFile(file, {
          description: `Reference document for ${engine?.name || 'engine'}`,
          summary: 'Uploaded reference material'
        })
        return result
      })

      const uploadedFiles = await Promise.all(uploadPromises)
      console.log('Files uploaded successfully:', uploadedFiles)
      
      // Refresh the files list
      const updatedFiles = await storageService.getFiles()
      setUserReferences(updatedFiles)
      
    } catch (error) {
      console.error('Upload error:', error)
      setError(`Upload failed: ${error.message}`)
    } finally {
      setUploadingFiles(false)
      // Reset the input
      event.target.value = ''
    }
  }

  const loadApiKey = async () => {
    try {
      if (!engine?.id) {
        console.log('❌ No engine ID available for API key loading')
        toast.error('No engine ID available')
        return
      }

      // Get user ID from session - check multiple possible fields
      const userId = user?.id || user?.user_id || user?.uid
      if (!userId) {
        console.error('❌ No user ID available. User object:', user)
        toast.error('User not authenticated')
        return
      }

      console.log('🔑 Loading API key for user:', userId, 'engine:', engine.id)
      console.log('🔍 Full engine object:', engine)
      console.log('🔍 Full user object:', user)

      // Fetch user's API key for this engine from user_engines table
      // Use engine.engine_id if it exists (from user_engines), otherwise use engine.id (from ai_engines)
      const engineIdToQuery = engine.engine_id || engine.id
      console.log('🔍 Querying with engine_id:', engineIdToQuery)

      const { data, error } = await supabase
        .from('user_engines')
        .select('api_key, engine_id, user_id, id')
        .eq('user_id', userId)
        .eq('engine_id', engineIdToQuery)

      console.log('🔍 Query result - data:', data)
      console.log('🔍 Query result - error:', error)

      if (error) {
        console.error('❌ API key fetch error:', error)
        toast.error(`Failed to load API key: ${error.message}`)
        return
      }

      if (!data || data.length === 0) {
        console.error('❌ No user_engines record found for user:', userId, 'engine:', engineIdToQuery)
        toast.error('Engine not assigned to you. Contact admin.')
        return
      }

      if (data.length > 1) {
        console.warn('⚠️ Multiple user_engines records found, using first one:', data)
      }

      const apiKeyValue = data[0]?.api_key
      if (!apiKeyValue) {
        console.error('❌ user_engines record exists but api_key is null')
        toast.error('API key missing. Contact admin to regenerate.')
        return
      }

      console.log('✅ API key loaded:', apiKeyValue)
      setApiKey(apiKeyValue)
    } catch (error) {
      console.error('❌ Error loading API key:', error)
      toast.error('Failed to load API key')
    }
  }

  const generateEmbedCode = () => {
    if (!formConfig || !engine) return

    const currentTheme = formThemes[selectedTheme]
    const themeColors = currentTheme.colors
    const themeStyle = currentTheme.style

    const code = `<div id="lekhika-engine-${engine?.id || 'engine'}" 
     style="max-width: 700px; margin: 0 auto; font-family: '${customFont}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  
  <!-- Glassmorphic Background Container -->
  <div style="position: relative; padding: 3rem; border-radius: 2rem; overflow: hidden;
              background: linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary});
              backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
              border: 1px solid rgba(255, 255, 255, 0.2);
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.4), 
                          0 0 0 1px rgba(255, 255, 255, 0.1),
                          inset 0 1px 0 rgba(255, 255, 255, 0.2);
              position: relative;">
    
    <!-- Animated Background Elements -->
    <div style="position: absolute; top: -50%; left: -50%; width: 200%; height: 200%; 
                background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
                animation: float 6s ease-in-out infinite; pointer-events: none;"></div>
    <div style="position: absolute; bottom: -30%; right: -30%; width: 60%; height: 60%; 
                background: radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%);
                animation: float 8s ease-in-out infinite reverse; pointer-events: none;"></div>
    
    <!-- Mascot Background -->
    <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
                background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJtYXNjb3QiIHBhdHRlcm5Vbml0cz0ib2JqZWN0Qm91bmRpbmdCb3giIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPgogICAgICA8aW1hZ2UgeD0iMCIgeT0iMCIgd2lkdGg9IjQwMCIgaGVpZ2h0PSI2MDAiIGhyZWY9ImRhdGE6aW1hZ2Uvc3ZnK3htbDtiYXNlNjQsUEhOMlp5QjNhV1IwYUQwaU1UWTNJaUJvWldsbmFIUTlJakV3TURBaUlIWnBaWGRDYjNnOUlqRTNNREFpSUhocFpYUWlQand2YzNabklDOD0iLz4KICAgIDwvcGF0dGVybj4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNtYXNjb3QpIiBvcGFjaXR5PSIwLjMiLz4KPC9zdmc+');
                background-size: cover; background-position: center; background-repeat: no-repeat;
                opacity: 0.2; pointer-events: none;"></div>

  <form id="lekhika-form" style="position: relative; z-index: 10;">
    
    <!-- Header with Glow Effect -->
    <div style="text-align: center; margin-bottom: 2.5rem; position: relative;">
      <div style="background: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05));
                  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
                  border-radius: 1.5rem; padding: 2rem; border: 1px solid rgba(255,255,255,0.1);
                  box-shadow: 0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2);">
        
        <h2 style="color: white; margin: 0; font-size: 2rem; font-weight: 700; 
                   background: linear-gradient(135deg, #ffffff, rgba(255,255,255,0.8));
                   -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                   background-clip: text; text-shadow: 0 0 30px rgba(255,255,255,0.3);
                   letter-spacing: -0.02em;">
          ${engine?.ai_engines?.name || engine?.name || 'Content Generator'}
        </h2>
        
        <div style="width: 60px; height: 3px; background: linear-gradient(90deg, rgba(255,255,255,0.6), rgba(255,255,255,0.2));
                    margin: 1rem auto; border-radius: 2px; box-shadow: 0 0 10px rgba(255,255,255,0.3);"></div>
        
        <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 1.1rem; line-height: 1.6; 
                  font-weight: 300; text-shadow: 0 1px 3px rgba(0,0,0,0.3);">
          ${engine?.ai_engines?.description || engine?.description || 'Generate amazing content with AI'}
        </p>
      </div>
    </div>
    
    ${formConfig?.inputFields?.map((field, index) => `
      <div style="margin-bottom: 2rem; position: relative; animation: slideInUp 0.6s ease-out ${index * 0.1}s both;">
        <label style="display: flex; align-items: center; color: white; margin-bottom: 0.75rem; font-weight: 600; font-size: 1rem;
                      text-shadow: 0 1px 3px rgba(0,0,0,0.3); letter-spacing: 0.01em; gap: 0.5rem;">
          <span class="field-icon" style="font-size: 1.2rem; transition: all 0.3s ease; animation: bounce 2s infinite;">
            ${field.type === 'textarea' ? '📝' : 
              field.type === 'select' ? '🔽' : 
              field.type === 'number' ? '🔢' : 
              field.type === 'checkbox' ? '☑️' : 
              field.type === 'email' ? '📧' : 
              field.type === 'password' ? '🔒' : '📝'}
          </span>
          <span>${field.label || field.variable}</span>
          ${field.required ? '<span style="color: #ff6b6b; margin-left: 0.25rem; animation: pulse 1.5s infinite;">*</span>' : ''}
        </label>
        ${field.type === 'textarea' ? 
          `<div style="position: relative;">
            <textarea name="${field.variable}" 
                     style="width: 100%; padding: 1.25rem; border: none; border-radius: 1rem; 
                            background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
                            border: 1px solid rgba(255,255,255,0.2); color: white; resize: vertical;
                            font-family: inherit; font-size: 1rem; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                            box-shadow: 0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2);
                            outline: none;"
                     placeholder="${field.placeholder || ''}"
                     rows="${field.rows || 3}"
                     ${field.required ? 'required' : ''}
                     onfocus="this.style.transform='translateY(-3px) scale(1.02)'; this.style.boxShadow='0 12px 40px rgba(0,0,0,0.2), 0 0 0 2px rgba(255,255,255,0.3), inset 0 1px 0 rgba(255,255,255,0.3)'; this.style.background='rgba(255,255,255,0.15)'; this.previousElementSibling.querySelector('.field-icon').style.transform='scale(1.3) rotate(10deg)'"
                     onblur="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'; this.style.background='rgba(255,255,255,0.1)'; this.previousElementSibling.querySelector('.field-icon').style.transform='scale(1) rotate(0deg)'"
                     oninput="this.style.transform='translateY(-1px)'; setTimeout(() => this.style.transform='translateY(-3px)', 50)"
                     onmouseenter="this.style.transform='translateY(-1px) scale(1.01)'"
                     onmouseleave="this.style.transform='translateY(0) scale(1)'"></textarea>
          </div>` :
          field.type === 'select' ?
          `<div style="position: relative;">
            <select name="${field.variable}" 
                   style="width: 100%; padding: 1.25rem; border: none; border-radius: 1rem; 
                          background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
                          border: 1px solid rgba(255,255,255,0.2); color: white;
                          font-family: inherit; font-size: 1rem; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                          box-shadow: 0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2);
                          outline: none; appearance: none; cursor: pointer;"
                   ${field.required ? 'required' : ''}
                   onfocus="this.style.transform='translateY(-3px) scale(1.02)'; this.style.boxShadow='0 12px 40px rgba(0,0,0,0.2), 0 0 0 2px rgba(255,255,255,0.3), inset 0 1px 0 rgba(255,255,255,0.3)'; this.style.background='rgba(255,255,255,0.15)'; this.previousElementSibling.querySelector('.field-icon').style.transform='scale(1.3) rotate(-10deg)'"
                   onblur="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'; this.style.background='rgba(255,255,255,0.1)'; this.previousElementSibling.querySelector('.field-icon').style.transform='scale(1) rotate(0deg)'"
                   onchange="this.nextElementSibling.style.transform='rotate(180deg)'; this.nextElementSibling.style.color='rgba(255,255,255,1)'"
                   onmouseenter="this.style.transform='translateY(-1px) scale(1.01)'"
                   onmouseleave="this.style.transform='translateY(0) scale(1)'">
              <option value="" style="background: rgba(0,0,0,0.8); color: white;">${field.placeholder || 'Select an option'}</option>
              ${field.options?.map(option => 
                `<option value="${option.value || option}" style="background: rgba(0,0,0,0.8); color: white;">${option.label || option}</option>`
              ).join('') || ''}
            </select>
            <div class="dropdown-arrow" style="position: absolute; right: 1.25rem; top: 50%; transform: translateY(-50%); 
                        pointer-events: none; color: rgba(255,255,255,0.7); transition: all 0.3s ease; font-size: 1.2rem;">▼</div>
          </div>` :
          field.type === 'number' ?
          `<div style="display: flex; align-items: center; gap: 1rem;">
            <button type="button" onclick="this.nextElementSibling.stepDown(); this.nextElementSibling.dispatchEvent(new Event('input', { bubbles: true }));"
                    style="width: 3rem; height: 3rem; background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
                           border: 1px solid rgba(255,255,255,0.2); border-radius: 1rem; color: white; font-weight: bold; font-size: 1.2rem;
                           cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; align-items: center; justify-content: center;
                           box-shadow: 0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2);"
                    onmouseover="this.style.background='rgba(255,255,255,0.2)'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 12px 40px rgba(0,0,0,0.2), 0 0 0 2px rgba(255,255,255,0.3), inset 0 1px 0 rgba(255,255,255,0.3)'"
                    onmouseout="this.style.background='rgba(255,255,255,0.1)'; this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'">−</button>
            <input type="number" name="${field.variable}" 
                   style="flex: 1; padding: 1.25rem; border: none; border-radius: 1rem; 
                          background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
                          border: 1px solid rgba(255,255,255,0.2); color: white;
                          font-family: inherit; font-size: 1rem; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                          box-shadow: 0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2);
                          text-align: center; outline: none;"
                   placeholder="${field.placeholder || ''}"
                   min="0"
                   ${field.required ? 'required' : ''}
                   onfocus="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 12px 40px rgba(0,0,0,0.2), 0 0 0 2px rgba(255,255,255,0.3), inset 0 1px 0 rgba(255,255,255,0.3)'; this.style.background='rgba(255,255,255,0.15)'"
                   onblur="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'; this.style.background='rgba(255,255,255,0.1)'" />
            <button type="button" onclick="this.previousElementSibling.stepUp(); this.previousElementSibling.dispatchEvent(new Event('input', { bubbles: true }));"
                    style="width: 3rem; height: 3rem; background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
                           border: 1px solid rgba(255,255,255,0.2); border-radius: 1rem; color: white; font-weight: bold; font-size: 1.2rem;
                           cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; align-items: center; justify-content: center;
                           box-shadow: 0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2);"
                    onmouseover="this.style.background='rgba(255,255,255,0.2)'; this.style.transform='translateY(-2px)'; this.style.boxShadow='0 12px 40px rgba(0,0,0,0.2), 0 0 0 2px rgba(255,255,255,0.3), inset 0 1px 0 rgba(255,255,255,0.3)'"
                    onmouseout="this.style.background='rgba(255,255,255,0.1)'; this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'">+</button>
          </div>` :
          field.type === 'checkbox' ?
          `<div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; border-radius: 1rem;
                      background: rgba(255,255,255,0.05); backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px);
                      border: 1px solid rgba(255,255,255,0.1); transition: all 0.3s ease;"
               onmouseover="this.style.background='rgba(255,255,255,0.1)'"
               onmouseout="this.style.background='rgba(255,255,255,0.05)'">
            <input type="checkbox" name="${field.variable}" 
                   style="width: 1.25rem; height: 1.25rem; accent-color: #ff6b6b; cursor: pointer;"
                   ${field.required ? 'required' : ''} />
            <span style="color: white; font-size: 1rem; font-weight: 500; cursor: pointer;">${field.placeholder || 'Check this option'}</span>
          </div>` :
          `<div style="position: relative;">
            <input type="${field.type || 'text'}" 
                  name="${field.variable}" 
                  style="width: 100%; padding: 1.25rem; border: none; border-radius: 1rem; 
                         background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
                         border: 1px solid rgba(255,255,255,0.2); color: white;
                         font-family: inherit; font-size: 1rem; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                         box-shadow: 0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2);
                         outline: none;"
                  placeholder="${field.placeholder || ''}"
                  ${field.required ? 'required' : ''}
                  onfocus="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 12px 40px rgba(0,0,0,0.2), 0 0 0 2px rgba(255,255,255,0.3), inset 0 1px 0 rgba(255,255,255,0.3)'; this.style.background='rgba(255,255,255,0.15)'"
                  onblur="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 32px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.2)'; this.style.background='rgba(255,255,255,0.1)'" />
          </div>`
        }
      </div>
    `).join('') || ''}
    
    <!-- Submit Button with Glassmorphic Design -->
    <div style="margin-top: 3rem; position: relative;">
      <button type="submit" 
              style="width: 100%; background: linear-gradient(135deg, ${themeColors.accent}, ${themeColors.secondary}); 
                     color: white; padding: 1.5rem 2.5rem; border: none; border-radius: 1.5rem; 
                     font-weight: 700; font-size: 1.2rem; cursor: pointer; 
                     transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden;
                     font-family: inherit; letter-spacing: 0.02em;
                     backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
                     border: 1px solid rgba(255,255,255,0.2);
                     box-shadow: 0 15px 35px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.1),
                                inset 0 1px 0 rgba(255,255,255,0.3);"
              onmouseover="this.style.transform='translateY(-5px)'; this.style.boxShadow='0 20px 45px rgba(0,0,0,0.3), 0 0 0 2px rgba(255,255,255,0.3), inset 0 1px 0 rgba(255,255,255,0.4)'"
              onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 15px 35px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.3)'">
        <span style="position: relative; z-index: 2; display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
          <span>✨</span>
          <span>Generate Content</span>
          <span>✨</span>
        </span>
        <div style="position: absolute; top: 0; left: -100%; width: 100%; height: 100%; 
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent); 
                    transition: left 0.6s ease;"></div>
      </button>
    </div>
  </form>
  </div>
</div>

<style>
  @keyframes float {
    0%, 100% { transform: translate(0, 0) rotate(0deg); }
    33% { transform: translate(30px, -30px) rotate(120deg); }
    66% { transform: translate(-20px, 20px) rotate(240deg); }
  }
  
  @keyframes shimmer {
    0% { left: -100%; }
    100% { left: 100%; }
  }
  
  @keyframes bounce {
    0%, 20%, 50%, 80%, 100% { transform: translateY(0) rotate(0deg); }
    40% { transform: translateY(-10px) rotate(5deg); }
    60% { transform: translateY(-5px) rotate(-3deg); }
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.1); }
  }
  
  @keyframes slideInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes wiggle {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(1deg); }
    75% { transform: rotate(-1deg); }
  }
  
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 20px rgba(255,255,255,0.1); }
    50% { box-shadow: 0 0 30px rgba(255,255,255,0.3), 0 0 40px rgba(255,255,255,0.1); }
  }
  
  button:hover .shimmer {
    animation: shimmer 0.6s ease;
  }
  
  /* Enhanced focus styles with micro-interactions */
  input:focus, textarea:focus, select:focus {
    transform: translateY(-3px) scale(1.02) !important;
    box-shadow: 0 12px 40px rgba(0,0,0,0.2), 0 0 0 2px rgba(255,255,255,0.3), inset 0 1px 0 rgba(255,255,255,0.3) !important;
    background: rgba(255,255,255,0.15) !important;
    animation: glow 2s ease-in-out infinite !important;
  }
  
  /* Field icon animations */
  .field-icon:hover {
    animation: wiggle 0.5s ease-in-out infinite !important;
    transform: scale(1.2) !important;
  }
  
  /* Input hover effects */
  input:hover, textarea:hover, select:hover {
    transform: translateY(-1px) scale(1.01) !important;
    box-shadow: 0 10px 35px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.25) !important;
  }
  
  /* Button micro-interactions */
  button {
    position: relative;
    overflow: hidden;
  }
  
  button::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: rgba(255,255,255,0.2);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }
  
  button:hover::before {
    width: 300px;
    height: 300px;
  }
  
  /* Custom scrollbar with glow */
  ::-webkit-scrollbar {
    width: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: rgba(255,255,255,0.1);
    border-radius: 4px;
    box-shadow: inset 0 0 5px rgba(0,0,0,0.1);
  }
  
  ::-webkit-scrollbar-thumb {
    background: linear-gradient(45deg, rgba(255,255,255,0.3), rgba(255,255,255,0.5));
    border-radius: 4px;
    box-shadow: 0 0 10px rgba(255,255,255,0.3);
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(45deg, rgba(255,255,255,0.5), rgba(255,255,255,0.7));
    box-shadow: 0 0 15px rgba(255,255,255,0.5);
  }
  
  /* Dropdown arrow animation */
  .dropdown-arrow {
    animation: bounce 2s infinite;
  }
  
  /* Form field entrance animations */
  .form-field {
    animation: slideInUp 0.6s ease-out both;
  }
  
  /* Ripple effect for buttons */
  button:active {
    animation: ripple 0.6s ease-out;
  }
  
  @keyframes ripple {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
  
  /* Enhanced color picker styling */
  input[type="color"] {
    border-radius: 50% !important;
    width: 40px !important;
    height: 40px !important;
    border: 3px solid rgba(255,255,255,0.3) !important;
    box-shadow: 0 0 20px rgba(0,0,0,0.3) !important;
    transition: all 0.3s ease !important;
  }
  
  input[type="color"]:hover {
    transform: scale(1.1) rotate(5deg) !important;
    box-shadow: 0 0 30px rgba(0,0,0,0.4) !important;
    border-color: rgba(255,255,255,0.5) !important;
  }
</style>

<script>
  document.getElementById('lekhika-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    const data = Object.fromEntries(formData);
    
    const submitBtn = this.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<span style="position: relative; z-index: 2;">Generating...</span>';
    submitBtn.style.opacity = '0.7';
    submitBtn.disabled = true;
    
    try {
      const response = await fetch('${window.location.origin}/api/engines/${engine?.id}/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ${apiKey}'
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (result.success) {
        submitBtn.innerHTML = '<span style="position: relative; z-index: 2;">✓ Generated!</span>';
        submitBtn.style.background = '#10B981';
        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.style.background = '${themeColors.accent}';
          submitBtn.style.opacity = '1';
          submitBtn.disabled = false;
        }, 2000);
      } else {
        throw new Error(result.message || 'Generation failed');
      }
      
    } catch (error) {
      console.error('Error:', error);
      submitBtn.innerHTML = '<span style="position: relative; z-index: 2;">✗ Error</span>';
      submitBtn.style.background = '#EF4444';
      setTimeout(() => {
        submitBtn.innerHTML = originalText;
        submitBtn.style.background = '${themeColors.accent}';
        submitBtn.style.opacity = '1';
        submitBtn.disabled = false;
      }, 2000);
    }
  });
</script>`

    setEmbedCode(code)
  }

  if (!isOpen || !engine || !formConfig) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="bg-gradient-to-br from-white via-purple-50/30 to-blue-50/30 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 rounded-3xl shadow-2xl w-full max-w-7xl mx-2 sm:mx-4 max-h-[95vh] overflow-hidden border border-purple-200/50 dark:border-purple-700/50 flex flex-col"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 p-4 sm:p-6 lg:p-8 text-white">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 via-blue-600/90 to-indigo-600/90"></div>
              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                  <motion.div 
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0"
                  >
                    <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </motion.div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 truncate">
                      {engine?.ai_engines?.name || engine?.name || 'Content Engine'}
                    </h2>
                    <p className="text-purple-100 text-sm sm:text-base lg:text-lg line-clamp-2">
                      {engine?.ai_engines?.description || engine?.description || 'Generate amazing content with AI'}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center hover:bg-white/30 transition-all duration-200 flex-shrink-0"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </motion.button>
              </div>
              
              {/* Progress indicator */}
              <div className="relative z-10 mt-4 sm:mt-6">
                <div className="flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2 overflow-x-auto">
                  <div className="flex items-center space-x-1 sm:space-x-2 whitespace-nowrap">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white rounded-full"></div>
                    <span className="text-xs sm:text-sm font-medium">Configure</span>
                  </div>
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-white/60 flex-shrink-0" />
                  <div className="flex items-center space-x-1 sm:space-x-2 whitespace-nowrap">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white/40 rounded-full"></div>
                    <span className="text-xs sm:text-sm text-white/80">Generate</span>
                  </div>
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 text-white/60 flex-shrink-0" />
                  <div className="flex items-center space-x-1 sm:space-x-2 whitespace-nowrap">
                    <div className="w-2 h-2 sm:w-3 sm:h-3 bg-white/40 rounded-full"></div>
                    <span className="text-xs sm:text-sm text-white/80">Complete</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-900/10 dark:to-blue-900/10 border-b border-purple-200/30 dark:border-purple-700/30">
              <div className="flex overflow-x-auto">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab('basic')}
                  className={`px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center space-x-1 sm:space-x-2 whitespace-nowrap flex-shrink-0 ${
                    activeTab === 'basic'
                      ? 'text-purple-700 dark:text-purple-300 bg-white/80 dark:bg-purple-900/30 border-b-2 border-purple-500 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-white/40 dark:hover:bg-purple-900/20'
                  }`}
                >
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Basic Input</span>
                  <span className="sm:hidden">Basic</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab('advanced')}
                  className={`px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center space-x-1 sm:space-x-2 whitespace-nowrap flex-shrink-0 ${
                    activeTab === 'advanced'
                      ? 'text-purple-700 dark:text-purple-300 bg-white/80 dark:bg-purple-900/30 border-b-2 border-purple-500 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-white/40 dark:hover:bg-purple-900/20'
                  }`}
                >
                  <Brain className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Advanced Settings</span>
                  <span className="sm:hidden">Advanced</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab('api')}
                  className={`px-4 sm:px-6 lg:px-8 py-3 sm:py-4 text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center space-x-1 sm:space-x-2 whitespace-nowrap flex-shrink-0 ${
                    activeTab === 'api'
                      ? 'text-purple-700 dark:text-purple-300 bg-white/80 dark:bg-purple-900/30 border-b-2 border-purple-500 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-white/40 dark:hover:bg-purple-900/20'
                  }`}
                >
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">API & Embed</span>
                  <span className="sm:hidden">API</span>
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-white/50 to-purple-50/30 dark:from-gray-800/50 dark:to-purple-900/20 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-purple-100 dark:scrollbar-thumb-purple-600 dark:scrollbar-track-purple-900">
              {activeTab === 'basic' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-8"
                >
                  {/* Instructions */}
                  {formConfig.instructions && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-700/50 rounded-2xl shadow-sm"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                          <Sparkle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Instructions</h3>
                          <p className="text-blue-700 dark:text-blue-300 leading-relaxed">{formConfig.instructions}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Beautiful Form - Exact same as API & Embed */}
                  {formConfig.inputFields && formConfig.inputFields.length > 0 ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="relative overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${formThemes[selectedTheme].colors.primary}, ${formThemes[selectedTheme].colors.secondary})`,
                        backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJtYXNjb3QiIHBhdHRlcm5Vbml0cz0ib2JqZWN0Qm91bmRpbmdCb3giIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPgogICAgICA8aW1hZ2UgeD0iMCIgeT0iMCIgd2lkdGg9IjQwMCIgaGVpZ2h0PSI2MDAiIGhyZWY9ImRhdGE6aW1hZ2Uvc3ZnK3htbDtiYXNlNjQsUEhOMlp5QjNhV1IwYUQwaU1UWTNJaUJvWldsbmFIUTlJakV3TURBaUlIWnBaWGRDYjNnOUlqRTNNREFpSUhocFpYUWlQand2YzNabklDOD0iLz4KICAgIDwvcGF0dGVybj4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNtYXNjb3QpIiBvcGFjaXR5PSIwLjMiLz4KPC9zdmc+')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        padding: '2rem',
                        borderRadius: formThemes[selectedTheme].style.borderRadius,
                        boxShadow: formThemes[selectedTheme].style.shadow === 'xl' ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' : 
                                   formThemes[selectedTheme].style.shadow === '2xl' ? '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(6, 255, 165, 0.3)' :
                                   '0 10px 25px rgba(0,0,0,0.1)',
                        fontFamily: customFont,
                        position: 'relative'
                      }}
                    >
                      <motion.h2 
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-center mb-4 text-xl font-semibold"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {engine?.ai_engines?.name || engine?.name || 'Content Generator'}
                      </motion.h2>
                      
                      <motion.p 
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-center mb-6 text-sm leading-relaxed"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {engine?.ai_engines?.description || engine?.description || 'Generate amazing content with AI'}
                      </motion.p>
                      
                      {/* Dynamic Form Fields - Beautiful Layout */}
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                          {formConfig.inputFields.slice(0, Math.ceil(formConfig.inputFields.length / 2)).map((field, index) => (
                            <motion.div
                              key={field.variable}
                              initial={{ y: 20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.4 + index * 0.1 }}
                            >
                              <label className="block font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                {field.label || field.variable} {field.required && '*'}
                              </label>
                              
                              {field.type === 'textarea' ? (
                                <motion.textarea
                                  whileFocus={{ scale: 1.02, y: -2 }}
                                  whileHover={{ scale: 1.01 }}
                                  name={field.variable}
                                  value={formData[field.variable] || ''}
                                  onChange={handleFieldChange}
                                  placeholder={field.placeholder || ''}
                                  rows={field.rows || 3}
                                  required={field.required}
                                  disabled={isSubmitting}
                                  className="w-full px-4 py-3 rounded-lg border-0 focus:ring-2 transition-all duration-200 resize-vertical"
                                  style={{
                                    background: 'var(--bg-elevated)',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--border-subtle)',
                                    fontFamily: 'inherit'
                                  }}
                                />
                              ) : field.type === 'select' ? (
                                <motion.select
                                  whileFocus={{ scale: 1.02, y: -2 }}
                                  whileHover={{ scale: 1.01 }}
                                  name={field.variable}
                                  value={formData[field.variable] || ''}
                                  onChange={handleFieldChange}
                                  required={field.required}
                                  disabled={isSubmitting}
                                  className="w-full px-4 py-3 rounded-lg border-0 focus:ring-2 transition-all duration-200"
                                  style={{
                                    background: 'var(--bg-elevated)',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--border-subtle)',
                                    fontFamily: 'inherit'
                                  }}
                                >
                                  <option value="">{field.placeholder || 'Select an option'}</option>
                                  {field.options?.map((option, optIndex) => {
                                    const value = typeof option === 'object' ? option.value : option
                                    const rawLabel = typeof option === 'object' ? (option.label || option.value) : option
                                    const label = formatOptionLabel(rawLabel)
                                    return (
                                      <option key={optIndex} value={value}>
                                        {label}
                                      </option>
                                    )
                                  })}
                                </motion.select>
                              ) : field.type === 'number' ? (
                                <div className="flex items-center space-x-3">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    type="button"
                                    onClick={() => {
                                      const currentValue = parseInt(formData[field.variable]) || 0
                                      handleFieldChange({ target: { name: field.variable, value: Math.max(0, currentValue - 1) } })
                                    }}
                                    className="w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-all duration-200"
                                    style={{
                                      background: 'var(--bg-elevated)',
                                      color: 'var(--text-primary)',
                                      border: '1px solid var(--border-subtle)'
                                    }}
                                  >
                                    −
                                  </motion.button>
                                  <motion.input
                                    whileFocus={{ scale: 1.02, y: -2 }}
                                    type="number"
                                    name={field.variable}
                                    value={formData[field.variable] || ''}
                                    onChange={handleFieldChange}
                                    placeholder={field.placeholder || ''}
                                    min="0"
                                    required={field.required}
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 transition-all duration-200 text-center"
                                    style={{
                                      background: 'var(--bg-elevated)',
                                      color: 'var(--text-primary)',
                                      border: '1px solid var(--border-subtle)',
                                      fontFamily: 'inherit'
                                    }}
                                  />
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    type="button"
                                    onClick={() => {
                                      const currentValue = parseInt(formData[field.variable]) || 0
                                      handleFieldChange({ target: { name: field.variable, value: currentValue + 1 } })
                                    }}
                                    className="w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-all duration-200"
                                    style={{
                                      background: 'var(--bg-elevated)',
                                      color: 'var(--text-primary)',
                                      border: '1px solid var(--border-subtle)'
                                    }}
                                  >
                                    +
                                  </motion.button>
                                </div>
                              ) : (
                                <motion.input
                                  whileFocus={{ scale: 1.02, y: -2 }}
                                  whileHover={{ scale: 1.01 }}
                                  type={field.type || 'text'}
                                  name={field.variable}
                                  value={formData[field.variable] || ''}
                                  onChange={handleFieldChange}
                                  placeholder={field.placeholder || ''}
                                  required={field.required}
                                  disabled={isSubmitting}
                                  className="w-full px-4 py-3 rounded-lg border-0 focus:ring-2 transition-all duration-200"
                                  style={{
                                    background: 'var(--bg-elevated)',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--border-subtle)',
                                    fontFamily: 'inherit'
                                  }}
                                />
                              )}
                              
                              {formErrors[field.variable] && (
                                <motion.p 
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="text-red-200 text-xs mt-1"
                                >
                                  {formErrors[field.variable]}
                                </motion.p>
                              )}
                            </motion.div>
                          ))}
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                          {formConfig.inputFields.slice(Math.ceil(formConfig.inputFields.length / 2)).map((field, index) => (
                            <motion.div
                              key={field.variable}
                              initial={{ y: 20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.4 + (index + Math.ceil(formConfig.inputFields.length / 2)) * 0.1 }}
                            >
                              <label className="block font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                {field.label || field.variable} {field.required && '*'}
                              </label>
                              
                              {field.type === 'textarea' ? (
                                <motion.textarea
                                  whileFocus={{ scale: 1.02, y: -2 }}
                                  whileHover={{ scale: 1.01 }}
                                  name={field.variable}
                                  value={formData[field.variable] || ''}
                                  onChange={handleFieldChange}
                                  placeholder={field.placeholder || ''}
                                  rows={field.rows || 3}
                                  required={field.required}
                                  disabled={isSubmitting}
                                  className="w-full px-4 py-3 rounded-lg border-0 focus:ring-2 transition-all duration-200 resize-vertical"
                                  style={{
                                    background: 'var(--bg-elevated)',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--border-subtle)',
                                    fontFamily: 'inherit'
                                  }}
                                />
                              ) : field.type === 'select' ? (
                                <motion.select
                                  whileFocus={{ scale: 1.02, y: -2 }}
                                  whileHover={{ scale: 1.01 }}
                                  name={field.variable}
                                  value={formData[field.variable] || ''}
                                  onChange={handleFieldChange}
                                  required={field.required}
                                  disabled={isSubmitting}
                                  className="w-full px-4 py-3 rounded-lg border-0 focus:ring-2 transition-all duration-200"
                                  style={{
                                    background: 'var(--bg-elevated)',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--border-subtle)',
                                    fontFamily: 'inherit'
                                  }}
                                >
                                  <option value="">{field.placeholder || 'Select an option'}</option>
                                  {field.options?.map((option, optIndex) => {
                                    const value = typeof option === 'object' ? option.value : option
                                    const rawLabel = typeof option === 'object' ? (option.label || option.value) : option
                                    const label = formatOptionLabel(rawLabel)
                                    return (
                                      <option key={optIndex} value={value}>
                                        {label}
                                      </option>
                                    )
                                  })}
                                </motion.select>
                              ) : field.type === 'number' ? (
                                <div className="flex items-center space-x-3">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    type="button"
                                    onClick={() => {
                                      const currentValue = parseInt(formData[field.variable]) || 0
                                      handleFieldChange({ target: { name: field.variable, value: Math.max(0, currentValue - 1) } })
                                    }}
                                    className="w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-all duration-200"
                                    style={{
                                      background: 'var(--bg-elevated)',
                                      color: 'var(--text-primary)',
                                      border: '1px solid var(--border-subtle)'
                                    }}
                                  >
                                    −
                                  </motion.button>
                                  <motion.input
                                    whileFocus={{ scale: 1.02, y: -2 }}
                                    type="number"
                                    name={field.variable}
                                    value={formData[field.variable] || ''}
                                    onChange={handleFieldChange}
                                    placeholder={field.placeholder || ''}
                                    min="0"
                                    required={field.required}
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 transition-all duration-200 text-center"
                                    style={{
                                      background: 'var(--bg-elevated)',
                                      color: 'var(--text-primary)',
                                      border: '1px solid var(--border-subtle)',
                                      fontFamily: 'inherit'
                                    }}
                                  />
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    type="button"
                                    onClick={() => {
                                      const currentValue = parseInt(formData[field.variable]) || 0
                                      handleFieldChange({ target: { name: field.variable, value: currentValue + 1 } })
                                    }}
                                    className="w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-all duration-200"
                                    style={{
                                      background: 'var(--bg-elevated)',
                                      color: 'var(--text-primary)',
                                      border: '1px solid var(--border-subtle)'
                                    }}
                                  >
                                    +
                                  </motion.button>
                                </div>
                              ) : (
                                <motion.input
                                  whileFocus={{ scale: 1.02, y: -2 }}
                                  whileHover={{ scale: 1.01 }}
                                  type={field.type || 'text'}
                                  name={field.variable}
                                  value={formData[field.variable] || ''}
                                  onChange={handleFieldChange}
                                  placeholder={field.placeholder || ''}
                                  required={field.required}
                                  disabled={isSubmitting}
                                  className="w-full px-4 py-3 rounded-lg border-0 focus:ring-2 transition-all duration-200"
                                  style={{
                                    background: 'var(--bg-elevated)',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--border-subtle)',
                                    fontFamily: 'inherit'
                                  }}
                                />
                              )}
                              
                              {formErrors[field.variable] && (
                                <motion.p 
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="text-red-200 text-xs mt-1"
                                >
                                  {formErrors[field.variable]}
                                </motion.p>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Beautiful Submit Button */}
                      <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full mt-8 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                        style={{
                          fontFamily: customFont,
                          boxShadow: '0 8px 25px rgba(0,0,0,0.2)'
                        }}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center justify-center">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"
                            />
                            Generating Magic...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center">
                            <Sparkles className="w-5 h-5 mr-2" />
                            Generate Content
                          </span>
                        )}
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-center py-12"
                    >
                      <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No Form Configuration</h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        This engine doesn't have any input fields configured yet.
                      </p>
                    </motion.div>
                  )}
                </motion.div>
          )}

          {activeTab === 'advanced' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6 sm:space-y-8"
            >
              {/* Storage Preference Toggle */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200/50 dark:border-emerald-700/50 rounded-2xl p-6 shadow-sm"
              >
                <div className="flex items-start space-x-3 mb-6">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Settings className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100 mb-2">Storage Preference</h3>
                    <p className="text-emerald-700 dark:text-emerald-300 text-sm">Choose how your files are stored</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Privacy-First Storage */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      storagePreference === 'local' 
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600'
                    }`}
                    onClick={() => {
                      storageService.setStoragePreference('local')
                      setStoragePreference('local')
                    }}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="text-2xl">🔒</div>
                      <div>
                        <h4 className="font-semibold text-emerald-900 dark:text-emerald-100">Privacy-First</h4>
                        <p className="text-sm text-emerald-700 dark:text-emerald-300">Local Storage</p>
                      </div>
                      {storagePreference === 'local' && (
                        <div className="ml-auto w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <ul className="text-xs text-emerald-600 dark:text-emerald-400 space-y-1">
                      <li>• Files never leave your device</li>
                      <li>• Complete privacy & control</li>
                      <li>• Instant access, no network needed</li>
                      <li>• GDPR compliant by design</li>
                    </ul>
                  </motion.div>

                  {/* Cloud Sync Storage */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      storagePreference === 'cloud' 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                    }`}
                    onClick={() => {
                      storageService.setStoragePreference('cloud')
                      setStoragePreference('cloud')
                    }}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="text-2xl">☁️</div>
                      <div>
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100">Cloud Sync</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">Supabase Storage</p>
                      </div>
                      {storagePreference === 'cloud' && (
                        <div className="ml-auto w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                      <li>• Access from any device</li>
                      <li>• Automatic backup & sync</li>
                      <li>• Larger storage capacity</li>
                      <li>• Team sharing capabilities</li>
                    </ul>
                  </motion.div>

                  {/* Google Cloud Storage */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      storagePreference === 'google_cloud' 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                        : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                    }`}
                    onClick={() => {
                      storageService.setStoragePreference('google_cloud')
                      setStoragePreference('google_cloud')
                    }}
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="text-2xl">🔵</div>
                      <div>
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100">Google Cloud</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300">Enterprise Storage</p>
                      </div>
                      {storagePreference === 'google_cloud' && (
                        <div className="ml-auto w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <CheckCircle className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                      <li>• Enterprise-grade security</li>
                      <li>• Global CDN for fast access</li>
                      <li>• Advanced AI integration</li>
                      <li>• Cost-effective pricing</li>
                    </ul>
                  </motion.div>
                </div>
              </motion.div>

              {/* File Upload Section */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200/50 dark:border-indigo-700/50 rounded-2xl p-6 shadow-sm"
              >
                <div className="flex items-start space-x-3 mb-6">
                  <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-2">Upload Reference Materials</h3>
                    <p className="text-indigo-700 dark:text-indigo-300 text-sm">
                      Upload documents, PDFs, or text files to use as context for AI generation
                      {storagePreference === 'local' ? ' (stored locally)' : 
                       storagePreference === 'google_cloud' ? ' (stored in Google Cloud)' : 
                       ' (stored in Supabase)'}
                    </p>
                  </div>
                </div>
                
                <div className="border-2 border-dashed border-indigo-300 dark:border-indigo-600 rounded-xl p-8 text-center hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors cursor-pointer">
                  <div className="space-y-4">
                    <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto">
                      <Upload className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-indigo-900 dark:text-indigo-100 font-medium">Drop files here or click to upload</p>
                      <p className="text-indigo-600 dark:text-indigo-400 text-sm mt-1">PDF, DOC, TXT files up to 10MB each</p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.txt"
                      className="hidden"
                      id="file-upload"
                      onChange={handleFileUpload}
                    />
                    <label
                      htmlFor="file-upload"
                      className={`inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer ${uploadingFiles ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {uploadingFiles ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          <span className="font-semibold">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 mr-2" />
                          <span className="font-semibold">Choose Files</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>
              </motion.div>

              {/* User References */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200/50 dark:border-blue-700/50 rounded-2xl p-6 shadow-sm"
              >
                <div className="flex items-start space-x-3 mb-6">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Your Reference Library</h3>
                    <p className="text-blue-700 dark:text-blue-300 text-sm">Manage your uploaded reference materials</p>
                  </div>
                </div>
                
                {userReferences.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {userReferences.map((ref) => (
                      <motion.div 
                        key={ref.id}
                        whileHover={{ scale: 1.02 }}
                        className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl p-4 border border-blue-200/30 dark:border-blue-700/30 shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-blue-900 dark:text-blue-100 font-medium truncate">{ref.name}</h4>
                            <p className="text-blue-600 dark:text-blue-400 text-sm truncate">{ref.description}</p>
                          </div>
                          <div className="flex space-x-2 ml-2">
                            <button className="text-blue-500 hover:text-blue-600 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={async () => {
                                try {
                                  await storageService.deleteFile(ref.id)
                                  const updatedFiles = await storageService.getFiles()
                                  setUserReferences(updatedFiles)
                                } catch (error) {
                                  console.error('Delete error:', error)
                                  setError(`Failed to delete file: ${error.message}`)
                                }
                              }}
                              className="text-red-500 hover:text-red-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="text-xs text-blue-500 dark:text-blue-400 flex items-center justify-between">
                          <span>{ref.size ? (ref.size / 1024 / 1024).toFixed(1) + 'MB' : 'Unknown size'}</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            ref.storageType === 'local' 
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                              : ref.storageType === 'google_cloud'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                          }`}>
                            {ref.storageType === 'local' ? '🔒 Local' : 
                             ref.storageType === 'google_cloud' ? '🔵 Google Cloud' : 
                             '☁️ Supabase'}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-blue-500 dark:text-blue-400" />
                    </div>
                    <p className="text-blue-700 dark:text-blue-300 font-medium">No references uploaded yet</p>
                    <p className="text-blue-600 dark:text-blue-400 text-sm mt-1">Upload documents to enhance AI generation</p>
                  </div>
                )}
              </motion.div>

              {/* Engine-Specific Settings */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200/50 dark:border-emerald-700/50 rounded-2xl p-6 shadow-sm"
              >
                <div className="flex items-start space-x-3 mb-6">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Settings className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100 mb-2">Engine-Specific Settings</h3>
                    <p className="text-emerald-700 dark:text-emerald-300 text-sm">Configure master prompt and references for this engine only</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-emerald-900 dark:text-emerald-100 mb-2">Default Writing Style for This Engine</label>
                      <select className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 border border-emerald-200/50 dark:border-emerald-700/50 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200">
                        <option>Professional</option>
                        <option>Casual</option>
                        <option>Academic</option>
                        <option>Creative</option>
                        <option>Technical</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-emerald-900 dark:text-emerald-100 mb-2">Default Tone for This Engine</label>
                      <select className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 border border-emerald-200/50 dark:border-emerald-700/50 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200">
                        <option>Neutral</option>
                        <option>Friendly</option>
                        <option>Authoritative</option>
                        <option>Persuasive</option>
                        <option>Empathetic</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-emerald-900 dark:text-emerald-100 mb-2">Master Prompt for This Engine</label>
                    <textarea
                      rows={4}
                      placeholder="Enter the master prompt and instructions specific to this engine. This will be applied to all content generation for this engine only..."
                      className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 border border-emerald-200/50 dark:border-emerald-700/50 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 resize-none"
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <span className="font-semibold">Save Engine Settings</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === 'api' && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6 sm:space-y-8"
            >
              {/* API Key Section */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border border-purple-200/50 dark:border-purple-700/50 rounded-2xl p-6 shadow-sm"
              >
                <div className="flex items-start space-x-3 mb-6">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">Your API Key</h3>
                    <p className="text-purple-700 dark:text-purple-300 text-sm">Use this API key to embed this engine on your website or blog</p>
                  </div>
                </div>
                
                <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-4 border border-purple-200/30 dark:border-purple-700/30">
                  <div className="flex items-center justify-between">
                    {apiKey ? (
                      <>
                        <code className="text-purple-900 dark:text-purple-100 font-mono text-sm break-all">
                          {apiKey}
                        </code>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            navigator.clipboard.writeText(apiKey)
                            toast.success('API key copied!')
                          }}
                          className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm font-medium"
                        >
                          Copy
                        </motion.button>
                      </>
                    ) : (
                      <div className="text-purple-700 dark:text-purple-300 text-sm flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Loading API key...</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Theme Selector */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200/50 dark:border-blue-700/50 rounded-2xl p-6 shadow-sm"
              >
                <div className="flex items-start space-x-3 mb-6">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">Choose Your Theme</h3>
                    <p className="text-blue-700 dark:text-blue-300 text-sm">Select from 5 stunning themes and customize to your heart's content</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {Object.entries(formThemes).map(([themeKey, theme]) => (
                    <motion.div
                      key={themeKey}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedTheme(themeKey)}
                      className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        selectedTheme === themeKey
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100">{theme.name}</h4>
                        {selectedTheme === themeKey && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center"
                          >
                            <CheckCircle className="w-3 h-3 text-white" />
                          </motion.div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{theme.description}</p>
                      
                      {/* Theme Preview */}
                      <div 
                        className="h-16 rounded-lg flex items-center justify-center text-white text-sm font-medium"
                        style={{
                          background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`,
                          fontFamily: theme.font
                        }}
                      >
                        {theme.name}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Customization Options */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Color Customization */}
                    <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-4">Color Customization</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-blue-700 dark:text-blue-300 mb-2">Primary</label>
                      <input
                        type="color"
                          value={formThemes[selectedTheme].colors.primary}
                          onChange={(e) => {
                            const newThemes = { ...formThemes }
                            newThemes[selectedTheme].colors.primary = e.target.value
                            setFormThemes(newThemes)
                            // Regenerate embed code with new colors
                            setTimeout(() => {
                              if (formConfig && engine) {
                                generateEmbedCode()
                              }
                            }, 100)
                          }}
                        className="w-full h-10 rounded-lg border border-blue-200/50 dark:border-blue-700/50 cursor-pointer hover:scale-105 transition-transform"
                      />
                    </div>
                    <div>
                        <label className="block text-xs text-blue-700 dark:text-blue-300 mb-2">Secondary</label>
                      <input
                        type="color"
                          value={formThemes[selectedTheme].colors.secondary}
                          onChange={(e) => {
                            const newThemes = { ...formThemes }
                            newThemes[selectedTheme].colors.secondary = e.target.value
                            setFormThemes(newThemes)
                            // Regenerate embed code with new colors
                            setTimeout(() => {
                              if (formConfig && engine) {
                                generateEmbedCode()
                              }
                            }, 100)
                          }}
                        className="w-full h-10 rounded-lg border border-blue-200/50 dark:border-blue-700/50 cursor-pointer hover:scale-105 transition-transform"
                      />
                    </div>
                    <div>
                        <label className="block text-xs text-blue-700 dark:text-blue-300 mb-2">Accent</label>
                      <input
                        type="color"
                          value={formThemes[selectedTheme].colors.accent}
                          onChange={(e) => {
                            const newThemes = { ...formThemes }
                            newThemes[selectedTheme].colors.accent = e.target.value
                            setFormThemes(newThemes)
                            // Regenerate embed code with new colors
                            setTimeout(() => {
                              if (formConfig && engine) {
                                generateEmbedCode()
                              }
                            }, 100)
                          }}
                        className="w-full h-10 rounded-lg border border-blue-200/50 dark:border-blue-700/50 cursor-pointer hover:scale-105 transition-transform"
                      />
                    </div>
                  </div>
                </div>

                  {/* Font Selection */}
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-4">Font Selection</h4>
                    <select
                      value={customFont}
                      onChange={(e) => {
                        setCustomFont(e.target.value)
                        // Regenerate embed code with new font
                        setTimeout(() => {
                          if (formConfig && engine) {
                            generateEmbedCode()
                          }
                        }, 100)
                      }}
                      className="w-full px-4 py-3 bg-white/80 dark:bg-gray-800/80 border border-blue-200/50 dark:border-blue-700/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 hover:scale-105"
                    >
                      <option value="Inter">Inter - Modern & Clean</option>
                      <option value="Playfair Display">Playfair Display - Elegant</option>
                      <option value="Orbitron">Orbitron - Futuristic</option>
                      <option value="Poppins">Poppins - Friendly</option>
                      <option value="Cormorant Garamond">Cormorant Garamond - Luxury</option>
                      <option value="Roboto">Roboto - Google Style</option>
                      <option value="Open Sans">Open Sans - Readable</option>
                      <option value="Montserrat">Montserrat - Bold</option>
                    </select>
                  </div>
                </div>
              </motion.div>

              {/* Live Preview */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200/50 dark:border-emerald-700/50 rounded-2xl p-6 shadow-sm"
              >
                <div className="flex items-start space-x-3 mb-6">
                  <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100 mb-2">Live Preview</h3>
                    <p className="text-emerald-700 dark:text-emerald-300 text-sm">See your form with micro-interactions and animations</p>
                  </div>
                </div>
                
                <div className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-6 border border-emerald-200/30 dark:border-emerald-700/30 overflow-hidden">
                  <div className="max-w-2xl mx-auto">
                    <motion.div 
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      className="relative overflow-hidden"
                    style={{
                        background: `linear-gradient(135deg, ${formThemes[selectedTheme].colors.primary}, ${formThemes[selectedTheme].colors.secondary})`,
                        backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJtYXNjb3QiIHBhdHRlcm5Vbml0cz0ib2JqZWN0Qm91bmRpbmdCb3giIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPgogICAgICA8aW1hZ2UgeD0iMCIgeT0iMCIgd2lkdGg9IjQwMCIgaGVpZ2h0PSI2MDAiIGhyZWY9ImRhdGE6aW1hZ2Uvc3ZnK3htbDtiYXNlNjQsUEhOMlp5QjNhV1IwYUQwaU1UWTNJaUJvWldsbmFIUTlJakV3TURBaUlIWnBaWGRDYjNnOUlqRTNNREFpSUhocFpYUWlQand2YzNabklDOD0iLz4KICAgIDwvcGF0dGVybj4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNtYXNjb3QpIiBvcGFjaXR5PSIwLjMiLz4KPC9zdmc+')`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                      padding: '2rem',
                        borderRadius: formThemes[selectedTheme].style.borderRadius,
                        boxShadow: formThemes[selectedTheme].style.shadow === 'xl' ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' : 
                                   formThemes[selectedTheme].style.shadow === '2xl' ? '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(6, 255, 165, 0.3)' :
                                   '0 10px 25px rgba(0,0,0,0.1)',
                        fontFamily: customFont,
                        position: 'relative'
                      }}
                    >
                      <motion.h2 
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-white text-center mb-4 text-xl font-semibold"
                      >
                      {engine?.ai_engines?.name || engine?.name || 'Content Generator'}
                      </motion.h2>
                      
                      <motion.p 
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-white/80 text-center mb-6 text-sm leading-relaxed"
                      >
                      {engine?.ai_engines?.description || engine?.description || 'Generate amazing content with AI'}
                      </motion.p>
                      
                      {/* Dynamic Form Fields - Same as Basic Input */}
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Left Column */}
                        <div className="space-y-4">
                          {formConfig.inputFields.slice(0, Math.ceil(formConfig.inputFields.length / 2)).map((field, index) => (
                            <motion.div
                              key={field.variable}
                              initial={{ y: 20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.4 + index * 0.1 }}
                            >
                              <label className="block font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                {field.label || field.variable} {field.required && '*'}
                              </label>
                              
                              {field.type === 'textarea' ? (
                                <motion.textarea
                                  whileFocus={{ scale: 1.02, y: -2 }}
                                  whileHover={{ scale: 1.01 }}
                                  placeholder={field.placeholder || ''}
                                  rows={field.rows || 3}
                                  className="w-full px-4 py-3 rounded-lg border-0 focus:ring-2 transition-all duration-200 resize-vertical"
                                  style={{
                                    background: 'var(--bg-elevated)',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--border-subtle)',
                                    fontFamily: 'inherit'
                                  }}
                                />
                              ) : field.type === 'select' ? (
                                <motion.select
                                  whileFocus={{ scale: 1.02, y: -2 }}
                                  whileHover={{ scale: 1.01 }}
                                  className="w-full px-4 py-3 rounded-lg border-0 focus:ring-2 transition-all duration-200"
                                  style={{
                                    background: 'var(--bg-elevated)',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--border-subtle)',
                                    fontFamily: 'inherit'
                                  }}
                                >
                                  <option value="">{field.placeholder || 'Select an option'}</option>
                                  {field.options?.map((option, optIndex) => {
                                    const value = typeof option === 'object' ? option.value : option
                                    const rawLabel = typeof option === 'object' ? (option.label || option.value) : option
                                    const label = formatOptionLabel(rawLabel)
                                    return (
                                      <option key={optIndex} value={value}>
                                        {label}
                                      </option>
                                    )
                                  })}
                                </motion.select>
                              ) : field.type === 'number' ? (
                                <div className="flex items-center space-x-3">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-all duration-200"
                                    style={{
                                      background: 'var(--bg-elevated)',
                                      color: 'var(--text-primary)',
                                      border: '1px solid var(--border-subtle)'
                                    }}
                                  >
                                    −
                                  </motion.button>
                                  <motion.input
                                    whileFocus={{ scale: 1.02, y: -2 }}
                                    type="number"
                                    placeholder={field.placeholder || ''}
                                    min="0"
                                    className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 transition-all duration-200 text-center"
                                    style={{
                                      background: 'var(--bg-elevated)',
                                      color: 'var(--text-primary)',
                                      border: '1px solid var(--border-subtle)',
                                      fontFamily: 'inherit'
                                    }}
                                  />
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-all duration-200"
                                    style={{
                                      background: 'var(--bg-elevated)',
                                      color: 'var(--text-primary)',
                                      border: '1px solid var(--border-subtle)'
                                    }}
                                  >
                                    +
                                  </motion.button>
                                </div>
                              ) : (
                                <motion.input
                                  whileFocus={{ scale: 1.02, y: -2 }}
                                  whileHover={{ scale: 1.01 }}
                                  type={field.type || 'text'}
                                  placeholder={field.placeholder || ''}
                                  className="w-full px-4 py-3 rounded-lg border-0 focus:ring-2 transition-all duration-200"
                                  style={{
                                    background: 'var(--bg-elevated)',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--border-subtle)',
                                    fontFamily: 'inherit'
                                  }}
                                />
                              )}
                            </motion.div>
                          ))}
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                          {formConfig.inputFields.slice(Math.ceil(formConfig.inputFields.length / 2)).map((field, index) => (
                            <motion.div
                              key={field.variable}
                              initial={{ y: 20, opacity: 0 }}
                              animate={{ y: 0, opacity: 1 }}
                              transition={{ delay: 0.4 + (index + Math.ceil(formConfig.inputFields.length / 2)) * 0.1 }}
                            >
                              <label className="block font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                {field.label || field.variable} {field.required && '*'}
                              </label>
                              
                              {field.type === 'textarea' ? (
                                <motion.textarea
                                  whileFocus={{ scale: 1.02, y: -2 }}
                                  whileHover={{ scale: 1.01 }}
                                  placeholder={field.placeholder || ''}
                                  rows={field.rows || 3}
                                  className="w-full px-4 py-3 rounded-lg border-0 focus:ring-2 transition-all duration-200 resize-vertical"
                                  style={{
                                    background: 'var(--bg-elevated)',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--border-subtle)',
                                    fontFamily: 'inherit'
                                  }}
                                />
                              ) : field.type === 'select' ? (
                                <motion.select
                                  whileFocus={{ scale: 1.02, y: -2 }}
                                  whileHover={{ scale: 1.01 }}
                                  className="w-full px-4 py-3 rounded-lg border-0 focus:ring-2 transition-all duration-200"
                                  style={{
                                    background: 'var(--bg-elevated)',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--border-subtle)',
                                    fontFamily: 'inherit'
                                  }}
                                >
                                  <option value="">{field.placeholder || 'Select an option'}</option>
                                  {field.options?.map((option, optIndex) => {
                                    const value = typeof option === 'object' ? option.value : option
                                    const rawLabel = typeof option === 'object' ? (option.label || option.value) : option
                                    const label = formatOptionLabel(rawLabel)
                                    return (
                                      <option key={optIndex} value={value}>
                                        {label}
                                      </option>
                                    )
                                  })}
                                </motion.select>
                              ) : field.type === 'number' ? (
                                <div className="flex items-center space-x-3">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-all duration-200"
                                    style={{
                                      background: 'var(--bg-elevated)',
                                      color: 'var(--text-primary)',
                                      border: '1px solid var(--border-subtle)'
                                    }}
                                  >
                                    −
                                  </motion.button>
                                  <motion.input
                                    whileFocus={{ scale: 1.02, y: -2 }}
                                    type="number"
                                    placeholder={field.placeholder || ''}
                                    min="0"
                                    className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 transition-all duration-200 text-center"
                                    style={{
                                      background: 'var(--bg-elevated)',
                                      color: 'var(--text-primary)',
                                      border: '1px solid var(--border-subtle)',
                                      fontFamily: 'inherit'
                                    }}
                                  />
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="w-10 h-10 rounded-lg flex items-center justify-center font-bold transition-all duration-200"
                                    style={{
                                      background: 'var(--bg-elevated)',
                                      color: 'var(--text-primary)',
                                      border: '1px solid var(--border-subtle)'
                                    }}
                                  >
                                    +
                                  </motion.button>
                                </div>
                              ) : (
                                <motion.input
                                  whileFocus={{ scale: 1.02, y: -2 }}
                                  whileHover={{ scale: 1.01 }}
                                  type={field.type || 'text'}
                                  placeholder={field.placeholder || ''}
                                  className="w-full px-4 py-3 rounded-lg border-0 focus:ring-2 transition-all duration-200"
                                  style={{
                                    background: 'var(--bg-elevated)',
                                    color: 'var(--text-primary)',
                                    border: '1px solid var(--border-subtle)',
                                    fontFamily: 'inherit'
                                  }}
                                />
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                      
                      <motion.button
                        whileHover={{ scale: 1.05, y: -3 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.9 }}
                        className="w-full py-4 px-8 backdrop-blur-sm text-white rounded-xl font-semibold transition-all duration-300 border border-white/20 hover:border-white/40 mt-6"
                        style={{
                          background: `linear-gradient(135deg, ${formThemes[selectedTheme].colors.accent}, ${formThemes[selectedTheme].colors.secondary})`,
                          boxShadow: '0 15px 35px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.3)'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-5px) scale(1.05)'
                          e.target.style.boxShadow = '0 20px 45px rgba(0,0,0,0.3), 0 0 0 2px rgba(255,255,255,0.3), inset 0 1px 0 rgba(255,255,255,0.4)'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0) scale(1)'
                          e.target.style.boxShadow = '0 15px 35px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.3)'
                        }}
                      >
                        <span className="flex items-center justify-center">
                          <Sparkles className="w-5 h-5 mr-2" />
                          Generate Content
                        </span>
                      </motion.button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Embed Code Generator */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200/50 dark:border-indigo-700/50 rounded-2xl p-6 shadow-sm"
              >
                <div className="flex items-start space-x-3 mb-6">
                  <div className="w-8 h-8 bg-indigo-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Code className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-100 mb-2">Generated Embed Code</h3>
                    <p className="text-indigo-700 dark:text-indigo-300 text-sm">Copy this code to embed your customized form anywhere</p>
                  </div>
                </div>
                
                <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto max-h-96">
                  <pre className="text-green-400 text-sm whitespace-pre-wrap">
                    {embedCode}
                  </pre>
                </div>

                <div className="flex justify-end mt-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigator.clipboard.writeText(embedCode)}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    <span className="font-semibold">Copy Embed Code</span>
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>

            {/* Footer */}
            <div className="p-8 bg-gradient-to-r from-purple-50/50 to-blue-50/50 dark:from-purple-900/10 dark:to-blue-900/10 border-t border-purple-200/30 dark:border-purple-700/30">
              {executionResult ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <motion.div 
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200/50 dark:border-green-700/50 rounded-2xl shadow-sm"
                  >
                    <div className="flex items-center gap-3 text-green-700 dark:text-green-300 mb-3">
                      <motion.div
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <CheckCircle className="w-6 h-6" />
                      </motion.div>
                      <span className="text-xl font-bold">Execution Completed!</span>
                    </div>
                    <p className="text-green-600 dark:text-green-400 mb-4">
                      Engine executed successfully at {new Date(executionResult.timestamp).toLocaleString()}
                    </p>
                    
                    {/* Token Usage Display */}
                    {totalTokens > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/80 dark:bg-gray-800/80 rounded-xl p-4 border border-green-200/30 dark:border-green-700/30"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <motion.div
                              animate={{ 
                                scale: showTokenAnimation ? [1, 1.2, 1] : 1,
                                rotate: showTokenAnimation ? [0, 10, -10, 0] : 0
                              }}
                              transition={{ duration: 0.5 }}
                            >
                              <Sparkles className="w-5 h-5 text-purple-600" />
                            </motion.div>
                            <span className="font-semibold text-gray-900 dark:text-gray-100">Token Usage</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                              {totalTokens.toLocaleString()}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">tokens</span>
                          </div>
                        </div>
                        
                        {/* Token Breakdown */}
                        {tokenBreakdown.length > 0 && (
                          <div className="space-y-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Breakdown:</span>
                            {tokenBreakdown.map((item, index) => (
                              <motion.div 
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex justify-between items-center text-sm"
                              >
                                <span className="text-gray-600 dark:text-gray-400">{item.node || item.provider}</span>
                                <span className="font-medium text-purple-600 dark:text-purple-400">
                                  {item.tokens?.toLocaleString() || 0} tokens
                                </span>
                              </motion.div>
                            ))}
                          </div>
                        )}
                        
                        {/* XP Gained */}
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          className="mt-3 pt-3 border-t border-green-200/30 dark:border-green-700/30"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Star className="w-4 h-4 text-yellow-500" />
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">XP Gained</span>
                            </div>
                            <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                              +{Math.floor(totalTokens / 100) + 10} XP
                            </span>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </motion.div>
                  
                  <div className="flex gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleDownloadResult}
                      className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <Download className="w-5 h-5" />
                      <span className="font-semibold">Download Result</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setExecutionResult(null)}
                      className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <span className="font-semibold">Run Again</span>
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <div className="flex justify-end gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onClose}
                    className="px-8 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                    style={{
                      background: 'var(--bg-elevated)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-subtle)'
                    }}
                  >
                    <span className="font-semibold">Cancel</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-8 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'var(--theme-gradient-primary)',
                      color: 'var(--text-on-primary)',
                      border: '1px solid var(--border-primary)'
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="font-semibold">Executing...</span>
                      </>
                    ) : (
                      <>
                        <Rocket className="w-5 h-5" />
                        <span className="font-semibold">Execute Engine</span>
                      </>
                    )}
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default EngineFormModal
