/**
 * SESSION MANAGER - Node.js Compatible
 * Manages execution sessions with in-memory storage
 */

class SessionManager {
  constructor() {
    // In-memory session storage (Node.js compatible)
    this.sessions = new Map()
    this.cleanupInterval = null
    this.startCleanupTimer()
  }

  /**
   * Save execution session to memory
   * @param {string} executionId - Unique execution identifier
   * @param {Object} sessionData - Session data to store
   */
  saveSession(executionId, sessionData) {
    const session = {
      ...sessionData,
      executionId,
      createdAt: new Date().toISOString(),
      lastAccessed: new Date().toISOString()
    }

    this.sessions.set(executionId, session)
    console.log(`💾 Session saved for execution: ${executionId}`)
  }

  /**
   * Load execution session from memory
   * @param {string} executionId - Unique execution identifier
   * @returns {Object|null} - Session data or null if not found
   */
  loadSession(executionId) {
    const session = this.sessions.get(executionId)
    
    if (session) {
      // Update last accessed time
      session.lastAccessed = new Date().toISOString()
      this.sessions.set(executionId, session)
      console.log(`📂 Session loaded for execution: ${executionId}`)
      return session
    }

    console.log(`⚠️ Session not found for execution: ${executionId}`)
    return null
  }

  /**
   * Clear execution session from memory
   * @param {string} executionId - Unique execution identifier
   */
  clearSession(executionId) {
    if (this.sessions.has(executionId)) {
      this.sessions.delete(executionId)
      console.log(`🗑️ Session cleared for execution: ${executionId}`)
    }
  }

  /**
   * Get all active sessions
   * @returns {Array} - Array of session objects
   */
  getAllSessions() {
    return Array.from(this.sessions.values())
  }

  /**
   * Get session count
   * @returns {number} - Number of active sessions
   */
  getSessionCount() {
    return this.sessions.size
  }

  /**
   * Check if session exists
   * @param {string} executionId - Unique execution identifier
   * @returns {boolean} - True if session exists
   */
  hasSession(executionId) {
    return this.sessions.has(executionId)
  }

  /**
   * Update session data
   * @param {string} executionId - Unique execution identifier
   * @param {Object} updates - Partial session data to update
   */
  updateSession(executionId, updates) {
    const session = this.sessions.get(executionId)
    if (session) {
      const updatedSession = {
        ...session,
        ...updates,
        lastAccessed: new Date().toISOString()
      }
      this.sessions.set(executionId, updatedSession)
      console.log(`🔄 Session updated for execution: ${executionId}`)
    }
  }

  /**
   * Clean up expired sessions (older than 24 hours)
   */
  cleanupExpiredSessions() {
    const now = new Date()
    const expiredSessions = []

    for (const [executionId, session] of this.sessions) {
      const lastAccessed = new Date(session.lastAccessed)
      const hoursSinceAccess = (now - lastAccessed) / (1000 * 60 * 60)
      
      if (hoursSinceAccess > 24) {
        expiredSessions.push(executionId)
      }
    }

    if (expiredSessions.length > 0) {
      console.log(`🧹 Cleaning up ${expiredSessions.length} expired sessions`)
      expiredSessions.forEach(executionId => {
        this.sessions.delete(executionId)
      })
    }
  }

  /**
   * Start cleanup timer (runs every hour)
   */
  startCleanupTimer() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
    }

    // Run cleanup every hour
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredSessions()
    }, 60 * 60 * 1000) // 1 hour

    console.log('⏰ Session cleanup timer started')
  }

  /**
   * Stop cleanup timer
   */
  stopCleanupTimer() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
      console.log('⏹️ Session cleanup timer stopped')
    }
  }

  /**
   * Clear all sessions
   */
  clearAllSessions() {
    const count = this.sessions.size
    this.sessions.clear()
    console.log(`🗑️ Cleared all ${count} sessions`)
  }

  /**
   * Get session statistics
   * @returns {Object} - Session statistics
   */
  getStats() {
    const sessions = Array.from(this.sessions.values())
    const now = new Date()
    
    const stats = {
      total: sessions.length,
      active: sessions.filter(s => {
        const lastAccessed = new Date(s.lastAccessed)
        const hoursSinceAccess = (now - lastAccessed) / (1000 * 60 * 60)
        return hoursSinceAccess < 1
      }).length,
      expired: sessions.filter(s => {
        const lastAccessed = new Date(s.lastAccessed)
        const hoursSinceAccess = (now - lastAccessed) / (1000 * 60 * 60)
        return hoursSinceAccess > 24
      }).length
    }

    return stats
  }
}

// Export singleton instance
const sessionManager = new SessionManager()
module.exports = sessionManager