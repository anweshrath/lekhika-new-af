/**
 * SESSION MANAGER SERVICE
 * Production-level session persistence for workflow execution
 * Handles crash recovery, resume functionality, and state management
 */

class SessionManager {
  constructor() {
    this.SESSION_PREFIX = 'flow_session_'
    this.MAX_SESSION_AGE = 24 * 60 * 60 * 1000 // 24 hours
    this.CLEANUP_INTERVAL = 60 * 60 * 1000 // 1 hour
    this.startCleanupTimer()
  }

  /**
   * Generate session key for a specific flow and user
   * @param {string} flowId - Flow identifier
   * @param {string} userId - User identifier
   * @returns {string} Session key
   */
  generateSessionKey(flowId, userId) {
    return `${this.SESSION_PREFIX}${flowId}_${userId}`
  }

  /**
   * Save execution session to localStorage
   * @param {string} flowId - Flow identifier
   * @param {string} userId - User identifier
   * @param {Object} sessionData - Session data to save
   */
  saveSession(flowId, userId, sessionData) {
    try {
      const sessionKey = this.generateSessionKey(flowId, userId)
      const session = {
        ...sessionData,
        timestamp: Date.now(),
        version: '1.0',
        flowId,
        userId
      }

      // Add metadata
      session.metadata = {
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        nodeCount: sessionData.nodes?.length || 0,
        completedNodes: sessionData.completedNodes?.length || 0,
        currentPhase: sessionData.currentPhase || 'initialization'
      }

      localStorage.setItem(sessionKey, JSON.stringify(session))
      console.log(`💾 Session saved: ${sessionKey}`)
      return true
    } catch (error) {
      console.error('❌ Failed to save session:', error)
      return false
    }
  }

  /**
   * Load execution session from localStorage
   * @param {string} flowId - Flow identifier
   * @param {string} userId - User identifier
   * @returns {Object|null} Session data or null if not found
   */
  loadSession(flowId, userId) {
    try {
      const sessionKey = this.generateSessionKey(flowId, userId)
      const sessionData = localStorage.getItem(sessionKey)
      
      if (!sessionData) {
        return null
      }

      const session = JSON.parse(sessionData)
      
      // Check if session is expired
      if (this.isSessionExpired(session)) {
        this.clearSession(flowId, userId)
        return null
      }

      console.log(`📂 Session loaded: ${sessionKey}`)
      return session
    } catch (error) {
      console.error('❌ Failed to load session:', error)
      return null
    }
  }

  /**
   * Clear execution session from localStorage
   * @param {string} flowId - Flow identifier
   * @param {string} userId - User identifier
   */
  clearSession(flowId, userId) {
    try {
      const sessionKey = this.generateSessionKey(flowId, userId)
      localStorage.removeItem(sessionKey)
      console.log(`🗑️ Session cleared: ${sessionKey}`)
      return true
    } catch (error) {
      console.error('❌ Failed to clear session:', error)
      return false
    }
  }

  /**
   * Check if session exists and is valid
   * @param {string} flowId - Flow identifier
   * @param {string} userId - User identifier
   * @returns {Object} Session status
   */
  checkSessionStatus(flowId, userId) {
    const session = this.loadSession(flowId, userId)
    
    if (!session) {
      return {
        exists: false,
        canResume: false,
        message: 'No saved session found'
      }
    }

    if (this.isSessionExpired(session)) {
      return {
        exists: false,
        canResume: false,
        message: 'Session expired'
      }
    }

    return {
      exists: true,
      canResume: true,
      session,
      message: `Session found from ${new Date(session.timestamp).toLocaleString()}`,
      progress: this.calculateProgress(session)
    }
  }

  /**
   * Calculate execution progress percentage
   * @param {Object} session - Session data
   * @returns {number} Progress percentage (0-100)
   */
  calculateProgress(session) {
    if (!session.nodes || !session.completedNodes) {
      return 0
    }

    const totalNodes = session.nodes.length
    const completedNodes = session.completedNodes.length
    
    if (totalNodes === 0) return 0
    
    return Math.round((completedNodes / totalNodes) * 100)
  }

  /**
   * Check if session is expired
   * @param {Object} session - Session data
   * @returns {boolean} True if expired
   */
  isSessionExpired(session) {
    const now = Date.now()
    const sessionAge = now - session.timestamp
    return sessionAge > this.MAX_SESSION_AGE
  }

  /**
   * Get all sessions for a user
   * @param {string} userId - User identifier
   * @returns {Array} Array of session info
   */
  getUserSessions(userId) {
    const sessions = []
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(this.SESSION_PREFIX) && key.includes(`_${userId}`)) {
          const sessionData = localStorage.getItem(key)
          if (sessionData) {
            const session = JSON.parse(sessionData)
            if (!this.isSessionExpired(session)) {
              sessions.push({
                flowId: session.flowId,
                timestamp: session.timestamp,
                progress: this.calculateProgress(session),
                nodeCount: session.metadata?.nodeCount || 0,
                completedNodes: session.completedNodes?.length || 0,
                currentPhase: session.metadata?.currentPhase || 'unknown'
              })
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Failed to get user sessions:', error)
    }

    return sessions.sort((a, b) => b.timestamp - a.timestamp)
  }

  /**
   * Clean up expired sessions
   */
  cleanupExpiredSessions() {
    try {
      const keysToRemove = []
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(this.SESSION_PREFIX)) {
          const sessionData = localStorage.getItem(key)
          if (sessionData) {
            const session = JSON.parse(sessionData)
            if (this.isSessionExpired(session)) {
              keysToRemove.push(key)
            }
          }
        }
      }

      keysToRemove.forEach(key => {
        localStorage.removeItem(key)
        console.log(`🧹 Cleaned up expired session: ${key}`)
      })

      if (keysToRemove.length > 0) {
        console.log(`🧹 Cleaned up ${keysToRemove.length} expired sessions`)
      }
    } catch (error) {
      console.error('❌ Failed to cleanup sessions:', error)
    }
  }

  /**
   * Start cleanup timer
   */
  startCleanupTimer() {
    setInterval(() => {
      this.cleanupExpiredSessions()
    }, this.CLEANUP_INTERVAL)
  }

  /**
   * Create session data structure for workflow execution
   * @param {Object} params - Session parameters
   * @returns {Object} Structured session data
   */
  createSessionData({
    flowId,
    userId,
    nodes,
    edges,
    initialInput,
    currentPhase = 'initialization',
    completedNodes = [],
    currentNode = null,
    executionData = {},
    errors = [],
    warnings = []
  }) {
    return {
      flowId,
      userId,
      nodes,
      edges,
      initialInput,
      currentPhase,
      completedNodes,
      currentNode,
      executionData,
      errors,
      warnings,
      timestamp: Date.now(),
      version: '1.0'
    }
  }

  /**
   * Update session with new execution state
   * @param {string} flowId - Flow identifier
   * @param {string} userId - User identifier
   * @param {Object} updates - Updates to apply
   */
  updateSession(flowId, userId, updates) {
    const session = this.loadSession(flowId, userId)
    if (!session) {
      console.warn('⚠️ No session found to update')
      return false
    }

    const updatedSession = {
      ...session,
      ...updates,
      timestamp: Date.now(),
      metadata: {
        ...session.metadata,
        lastUpdated: new Date().toISOString()
      }
    }

    return this.saveSession(flowId, userId, updatedSession)
  }
}

// Export singleton instance
export default new SessionManager()
