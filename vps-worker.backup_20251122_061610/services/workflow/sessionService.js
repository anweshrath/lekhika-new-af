const sessionManager = require('../sessionManager')

function checkForExistingSession(flowId, userId) {
  return sessionManager.checkSessionStatus(flowId, userId)
}

function startNewSession({ flowId, userId, nodes, edges, initialInput }) {
  const sessionData = sessionManager.createSessionData({
    flowId,
    userId,
    nodes,
    edges,
    initialInput,
    currentPhase: 'initialization',
    completedNodes: [],
    currentNode: null,
    executionData: {},
    errors: [],
    warnings: []
  })

  sessionManager.saveSession(flowId, userId, sessionData)
  return sessionData
}

function resumeSession(flowId, userId) {
  const session = sessionManager.loadSession(flowId, userId)
  if (!session) {
    throw new Error('No session found to resume')
  }
  return session
}

function updateSession(currentSession, updates) {
  if (!currentSession) {
    console.warn('⚠️ No active session to update')
    return null
  }
  const updatedSession = {
    ...currentSession,
    ...updates,
    metadata: {
      ...(currentSession.metadata || {}),
      lastUpdated: new Date().toISOString()
    }
  }
  if (updates.flowId && updates.userId) {
    sessionManager.saveSession(updates.flowId, updates.userId, updatedSession)
  }
  return updatedSession
}

function stopSession(flowId, userId) {
  sessionManager.clearSession(flowId, userId)
}

function saveSession(flowId, userId, session) {
  sessionManager.saveSession(flowId, userId, session)
}

module.exports = {
  checkForExistingSession,
  startNewSession,
  resumeSession,
  updateSession,
  stopSession,
  saveSession
}

