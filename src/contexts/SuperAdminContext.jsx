import React, { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// Create SuperAdmin Context
const SuperAdminContext = createContext()

// Custom hook to use SuperAdmin context
export const useSuperAdmin = () => {
  const context = useContext(SuperAdminContext)
  if (!context) {
    throw new Error('useSuperAdmin must be used within a SuperAdminProvider')
  }
  return context
}

// SuperAdmin Provider Component
export const SuperAdminProvider = ({ children }) => {
  const [superAdminUser, setSuperAdminUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Initialize SuperAdmin session
  useEffect(() => {
    initializeSuperAdminSession()
  }, [])

  // Initialize SuperAdmin session from localStorage
  const initializeSuperAdminSession = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔍 Initializing SuperAdmin session...')

      // Check for existing session in localStorage
      const sessionData = localStorage.getItem('superadmin_session')
      console.log('🔍 Session data from localStorage:', sessionData)
      
      if (!sessionData) {
        console.log('❌ No session data found in localStorage')
        setLoading(false)
        return
      }

      const sessionInfo = JSON.parse(sessionData)
      console.log('🔍 Parsed session info:', sessionInfo)
      
      // Validate session exists in database
      if (sessionInfo.sessionId) {
        console.log('🔍 Validating session in database...')
        const { data: sessionRecord, error: sessionError } = await supabase
          .from('admin_sessions')
          .select('*')
          .eq('id', sessionInfo.sessionId)
          .eq('is_active', true)

        if (sessionError) {
          console.error('Database session validation error:', sessionError)
          localStorage.removeItem('superadmin_session')
          setLoading(false)
          return
        }

        if (!sessionRecord || sessionRecord.length === 0) {
          localStorage.removeItem('superadmin_session')
          setLoading(false)
          return
        }

        // Check if session is expired
        if (new Date(sessionRecord[0].expires_at) < new Date()) {
          localStorage.removeItem('superadmin_session')
          setLoading(false)
          return
        }

        // Get SuperAdmin user details
        const { data: superAdminRecord, error: userError } = await supabase
          .from('superadmin_users')
          .select('*')
          .eq('id', sessionInfo.adminId)
          .eq('is_active', true)

        if (userError) {
          console.error('Database user validation error:', userError)
          localStorage.removeItem('superadmin_session')
          setLoading(false)
          return
        }

        if (!superAdminRecord || superAdminRecord.length === 0) {
          setError('SuperAdmin user not found or inactive')
          setLoading(false)
          return
        }

        // Create SuperAdmin user object
        const superAdminUser = {
          id: superAdminRecord[0].id,
          username: superAdminRecord[0].username,
          email: superAdminRecord[0].email,
          role: 'superadmin',
          tier: 'enterprise',
          access_level: 10,
          permissions: ['all'],
          sessionId: sessionInfo.sessionId,
          loginTime: sessionInfo.loginTime
        }

        setSuperAdminUser(superAdminUser)
        setSession(sessionRecord[0])
        
        // Update last activity
        updateLastActivity(superAdminRecord[0].id)
      }
    } catch (error) {
      console.error('SuperAdmin session initialization error:', error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Update last activity
  const updateLastActivity = async (adminId) => {
    try {
      await supabase
        .from('superadmin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', adminId)
    } catch (error) {
      console.error('Failed to update last activity:', error)
    }
  }

  // Login SuperAdmin
  const loginSuperAdmin = async (username, password) => {
    try {
      setLoading(true)
      setError(null)

      console.log('🔍 Starting SuperAdmin authentication...')
      console.log('👤 Username:', username)
      console.log('🔑 Password length:', password.length)

      // Authenticate against superadmin_users table
      console.log('🗄️ Querying superadmin_users table...')
      const { data: user, error: authError } = await supabase
        .from('superadmin_users')
        .select('*')
        .eq('username', username)
        .eq('is_active', true)

      console.log('📊 Query result:', { user, authError })

      if (authError) {
        console.error('❌ Database error:', authError)
        throw new Error(`Database error: ${authError.message}`)
      }

      if (!user || user.length === 0) {
        console.log('❌ No user found with username:', username)
        throw new Error('Invalid SuperAdmin credentials')
      }

      // Get first user from array since we're not using .single()
      const userRecord = Array.isArray(user) ? user[0] : user
      console.log('👤 Found user:', userRecord)

      // Simple password validation (in production, use proper hashing)
      console.log('🔑 Validating password...')
      console.log('🔑 Stored hash:', userRecord.password_hash)
      console.log('🔑 Entered password:', password)
      
      if (userRecord.password_hash !== password) {
        console.log('❌ Password mismatch')
        throw new Error('Invalid SuperAdmin credentials')
      }
      
      console.log('✅ Password validation successful')

      // Create session
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const sessionData = {
        username: userRecord.username,
        loginTime: new Date().toISOString(),
        permissions: ['all']
      }

      console.log('📝 Creating session...')
      const { data: sessionRecord, error: sessionError } = await supabase
        .from('admin_sessions')
        .insert({
          id: sessionId,
          admin_id: userRecord.id,
          session_data: sessionData,
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
        .select()

      if (sessionError) {
        console.error('❌ Session creation failed:', sessionError)
        throw new Error('Failed to create session')
      }

      console.log('✅ Session created successfully')

      // Store session in localStorage
      const sessionInfo = {
        sessionId: sessionRecord[0].id,
        adminId: userRecord.id,
        username: userRecord.username,
        authenticated: true,
        loginTime: new Date().toISOString()
      }

      localStorage.setItem('superadmin_session', JSON.stringify(sessionInfo))

      // Create SuperAdmin user object
      const superAdminUser = {
        id: userRecord.id,
        username: userRecord.username,
        email: userRecord.email,
        role: 'superadmin',
        tier: 'enterprise',
        access_level: 10,
        permissions: ['all'],
        sessionId: sessionRecord[0].id,
        loginTime: sessionInfo.loginTime
      }

      setSuperAdminUser(superAdminUser)
      setSession(sessionRecord[0])

      // Update last login time
      await supabase
        .from('superadmin_users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userRecord.id)

      return { success: true, user: superAdminUser }
    } catch (error) {
      setError(error.message)
      return { success: false, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  // Logout SuperAdmin
  const logoutSuperAdmin = async () => {
    try {
      if (session?.id) {
        // Deactivate session in database
        await supabase
          .from('admin_sessions')
          .update({ is_active: false })
          .eq('id', session.id)
      }

      // Clear localStorage
      localStorage.removeItem('superadmin_session')
      
      // Clear state
      setSuperAdminUser(null)
      setSession(null)
      setError(null)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  // Check if user has permission
  const hasPermission = (permission) => {
    if (!superAdminUser) return false
    return superAdminUser.permissions.includes('all') || superAdminUser.permissions.includes(permission)
  }

  // Get SuperAdmin user ID for database operations
  const getSuperAdminUserId = () => {
    if (!superAdminUser) {
      // Try to get from localStorage as fallback
      try {
        const sessionData = localStorage.getItem('superadmin_session')
        if (sessionData) {
          const sessionInfo = JSON.parse(sessionData)
          if (sessionInfo.adminId) {
            console.log('🔄 Using fallback SuperAdmin ID from localStorage:', sessionInfo.adminId)
            return sessionInfo.adminId
          }
        }
      } catch (error) {
        console.error('Error parsing session data:', error)
      }
      
      console.error('SuperAdmin user not authenticated - getSuperAdminUserId called without valid session')
      return null
    }
    
    return superAdminUser.id
  }

  // Check if SuperAdmin is authenticated
  const isAuthenticated = () => {
    return !!superAdminUser && !!session
  }

  // Context value
  const value = {
    superAdminUser,
    session,
    loading,
    error,
    loginSuperAdmin,
    logoutSuperAdmin,
    hasPermission,
    getSuperAdminUserId,
    isAuthenticated,
    refreshSession: initializeSuperAdminSession
  }

  return (
    <SuperAdminContext.Provider value={value}>
      {children}
    </SuperAdminContext.Provider>
  )
}

export default SuperAdminContext
