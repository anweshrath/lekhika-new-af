import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Shield, Lock, AlertCircle, Wifi, Database, User, Key } from 'lucide-react'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import { useSuperAdmin } from '../../contexts/SuperAdminContext'

const SuperAdminLogin = () => {
  const navigate = useNavigate()
  const { loginSuperAdmin, isAuthenticated } = useSuperAdmin()
  const [credentials, setCredentials] = useState({
    username: 'superadmin',
    password: 'BookMagic2024!Admin'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState([])
  const [currentStep, setCurrentStep] = useState('')
  const [error, setError] = useState('')

  // AUTO-FILL CREDENTIALS ON MOUNT
  useEffect(() => {
    setCredentials({
      username: 'superadmin',
      password: 'BookMagic2024!Admin'
    })
  }, [])

  const addDebugInfo = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    const logMessage = `${timestamp}: ${message}`
    console.log(logMessage)
    setDebugInfo(prev => [...prev, { message: logMessage, type }])
  }

  const setStep = (step) => {
    setCurrentStep(step)
    addDebugInfo(`📍 STEP: ${step}`, 'step')
  }

  // Direct authentication without db wrapper
  const authenticateDirect = async (username, password) => {
    setStep('DIRECT_AUTH_START')
    
    try {
      // Test basic connection first
      setStep('TESTING_CONNECTION')
      addDebugInfo('🔌 Testing Supabase connection...')
      
      const connectionTest = await Promise.race([
        supabase.from('superadmin_users').select('count').limit(1),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 5000))
      ])
      
      addDebugInfo(`🔌 Connection test result: ${JSON.stringify(connectionTest)}`)
      
      if (connectionTest.error) {
        addDebugInfo(`❌ Connection failed: ${connectionTest.error.message}`, 'error')
        throw new Error(`Database connection failed: ${connectionTest.error.message}`)
      }
      
      setStep('QUERYING_USER')
      addDebugInfo(`🔍 Searching for user: ${username}`)
      
      // Query with timeout
      const userQuery = await Promise.race([
        supabase
          .from('superadmin_users')
          .select('*')
          .eq('username', username),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Query timeout')), 10000))
      ])
      
      addDebugInfo(`🔍 User query result: ${JSON.stringify(userQuery)}`)
      
      if (userQuery.error) {
        addDebugInfo(`❌ User query failed: ${userQuery.error.message}`, 'error')
        if (userQuery.error.code === 'PGRST116') {
          addDebugInfo('❌ No user found with that username', 'error')
          return null
        }
        throw new Error(`User query failed: ${userQuery.error.message}`)
      }
      
      const user = userQuery.data
      if (!user) {
        addDebugInfo('❌ No user data returned', 'error')
        return null
      }
      
      setStep('VALIDATING_USER')
      addDebugInfo(`👤 Found user: ${user.username} (ID: ${user.id})`)
      addDebugInfo(`👤 User active: ${user.is_active}`)
      
      if (!user.is_active) {
        addDebugInfo('❌ User account is inactive', 'error')
        return null
      }
      
      setStep('CHECKING_PASSWORD')
      addDebugInfo('🔑 Validating password...')
      
      // Simple password check
      const isValidPassword = user.password_hash === password
      addDebugInfo(`🔑 Password valid: ${isValidPassword}`)
      
      if (!isValidPassword) {
        addDebugInfo('❌ Invalid password', 'error')
        return null
      }
      
      setStep('UPDATING_LOGIN_TIME')
      addDebugInfo('⏰ Updating last login time...')
      
      try {
        const updateResult = await Promise.race([
          supabase
            .from('superadmin_users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', user.id),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Update timeout')), 5000))
        ])
        
        if (updateResult.error) {
          addDebugInfo(`⚠️ Could not update login time: ${updateResult.error.message}`, 'warning')
        } else {
          addDebugInfo('✅ Login time updated')
        }
      } catch (updateError) {
        addDebugInfo(`⚠️ Login time update failed: ${updateError.message}`, 'warning')
      }
      
      setStep('AUTH_SUCCESS')
      addDebugInfo('🎉 Authentication successful!')
      return user
      
    } catch (error) {
      setStep('AUTH_ERROR')
      addDebugInfo(`💥 Authentication error: ${error.message}`, 'error')
      throw error
    }
  }

  // Fallback authentication
  const fallbackAuth = (username, password) => {
    setStep('FALLBACK_AUTH')
    addDebugInfo('🔄 Using fallback authentication...')
    
    if (username === 'superadmin' && password === 'BookMagic2024!Admin') {
      addDebugInfo('✅ Fallback authentication successful!')
      return {
        id: 'fallback-admin-id',
        username: 'superadmin',
        email: 'admin@bookmagic.ai',
        is_active: true,
        permissions: ['all']
      }
    }
    
    addDebugInfo('❌ Fallback authentication failed', 'error')
    return null
  }

  // Create session
  const createSession = async (adminUser) => {
    setStep('CREATING_SESSION')
    addDebugInfo('📝 Creating admin session...')
    
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const sessionData = {
      username: adminUser.username,
      loginTime: new Date().toISOString(),
      permissions: adminUser.permissions || ['all']
    }
    
    try {
      // Try database session creation with timeout
              const sessionResult = await Promise.race([
          supabase
            .from('admin_sessions')
            .insert({
              id: sessionId,
              admin_id: adminUser.id,
              session_data: sessionData,
              expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            })
            .select(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Session creation timeout')), 5000))
      ])
      
      if (sessionResult.error) {
        addDebugInfo(`⚠️ Database session creation failed: ${sessionResult.error.message}`, 'warning')
        addDebugInfo('📝 Using fallback session...')
        return {
          id: sessionId,
          admin_id: adminUser.id,
          session_data: sessionData,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
          fallback: true
        }
      }
      
      addDebugInfo('✅ Database session created successfully')
      return sessionResult.data
      
    } catch (error) {
      addDebugInfo(`⚠️ Session creation error: ${error.message}`, 'warning')
      addDebugInfo('📝 Using fallback session...')
      return {
        id: sessionId,
        admin_id: adminUser.id,
        session_data: sessionData,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
        fallback: true
      }
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setDebugInfo([])
    setCurrentStep('')
    
    addDebugInfo('🚀 Starting SuperAdmin login process...', 'info')
    addDebugInfo(`👤 Username: ${credentials.username}`)
    addDebugInfo(`🔑 Password length: ${credentials.password.length}`)

    try {
      setStep('AUTHENTICATING')
      addDebugInfo('🔐 Using new SuperAdmin context for authentication...')
      
      // Use the new SuperAdmin context for authentication
      const result = await loginSuperAdmin(credentials.username, credentials.password)
      
      if (!result.success) {
        setStep('LOGIN_FAILED')
        addDebugInfo(`❌ Authentication failed: ${result.error}`, 'error')
        setError(result.error || 'Authentication failed')
        toast.error(`Login failed: ${result.error}`)
        return
      }
      
      setStep('LOGIN_SUCCESS')
      addDebugInfo('🎉 SuperAdmin login successful!')
      addDebugInfo(`👤 User: ${result.user.username}`)
      addDebugInfo(`🆔 ID: ${result.user.id}`)
      addDebugInfo(`🔑 Session: ${result.user.sessionId}`)
      
      toast.success('SuperAdmin access granted')
      
      // Navigate to dashboard
      setTimeout(() => {
        navigate('/superadmin/dashboard')
      }, 1000)
      
    } catch (error) {
      setStep('CRITICAL_ERROR')
      addDebugInfo(`💥 Critical error: ${error.message}`, 'error')
      console.error('Login error:', error)
      setError(error.message)
      toast.error(`Login failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const getStepIcon = (step) => {
    switch (step) {
      case 'TESTING_CONNECTION': return <Wifi className="w-4 h-4" />
      case 'QUERYING_USER': return <Database className="w-4 h-4" />
      case 'VALIDATING_USER': return <User className="w-4 h-4" />
      case 'CHECKING_PASSWORD': return <Key className="w-4 h-4" />
      default: return <AlertCircle className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-black flex items-center justify-center p-4">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Login Form */}
        <div className="max-w-md w-full mx-auto">
          {/* Header with Logo */}
          <div className="text-center mb-8">
            {/* Prominent Logo */}
            <div className="flex justify-center mb-6">
              <img 
                src="/src/components/img/11.png" 
                alt="LEKHIKA SuperAdmin"
                className="h-20 w-auto object-contain"
              />
            </div>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-full mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">SuperAdmin Access</h1>
            <p className="text-red-300">Restricted Area - Authorized Personnel Only</p>
          </div>

          {/* Current Step Indicator */}
          {currentStep && (
            <div className="mb-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <div className="flex items-center text-blue-300">
                {getStepIcon(currentStep)}
                <span className="ml-2 text-sm font-medium">Current: {currentStep.replace(/_/g, ' ')}</span>
              </div>
            </div>
          )}

          {/* Login Form */}
          <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 border border-red-500/20">
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter superadmin username"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={credentials.password}
                    onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent pr-12"
                    placeholder="Enter superadmin password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                ) : (
                  <>
                    <Lock className="w-5 h-5 mr-2" />
                    Access SuperAdmin
                  </>
                )}
              </button>
            </form>

            {/* Default Credentials Hint */}
            <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
              <p className="text-xs text-blue-300 text-center">
                💡 Auto-filled: superadmin / BookMagic2024!Admin
              </p>
            </div>
          </div>

          {/* Back to App */}
          <div className="text-center mt-6">
            <button
              onClick={() => navigate('/')}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              ← Back to Application
            </button>
          </div>
        </div>

        {/* Enhanced Debug Panel */}
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-700">
          <div className="flex items-center mb-4">
            <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
            <h3 className="text-lg font-semibold text-white">Real-Time Debug Log</h3>
          </div>
          
          <div className="bg-gray-900 rounded-lg p-4 h-96 overflow-y-auto">
            {debugInfo.length === 0 ? (
              <p className="text-gray-400 text-sm">Debug information will appear here during login...</p>
            ) : (
              <div className="space-y-1">
                {debugInfo.map((info, index) => (
                  <div key={index} className={`text-xs font-mono break-words ${
                    info.type === 'error' ? 'text-red-400' :
                    info.type === 'warning' ? 'text-yellow-400' :
                    info.type === 'step' ? 'text-blue-400 font-bold' :
                    'text-gray-300'
                  }`}>
                    {info.message}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
            <p className="text-xs text-yellow-300">
              This enhanced debug panel shows step-by-step authentication progress with timeouts and fallbacks.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SuperAdminLogin
