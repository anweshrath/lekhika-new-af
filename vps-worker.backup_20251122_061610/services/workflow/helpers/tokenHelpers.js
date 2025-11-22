/**
 * TOKEN HELPERS MODULE
 * 
 * Purpose: Centralize all token accounting and metrics calculation logic
 * 
 * Location: workflow/helpers/tokenHelpers.js
 * 
 * Responsibilities:
 * - Calculate token/cost/word metrics from node outputs
 * - Build token ledgers from outputs
 * - Extract numeric values from various formats
 * - Handle multi-chapter token aggregation
 * 
 * Dependencies: None (pure functions)
 * 
 * Extracted from: workflowExecutionService.js (Phase 3)
 * Extraction date: 2025-11-20
 * 
 * Methods extracted:
 * - deriveNodeTokenMetrics(nodeOutput) - Calculate metrics from single node output
 * - calculateTokenUsageFromOutputs(nodeOutputs) - Sum totals from all outputs
 * - buildTokenLedgerFromOutputs(nodeOutputs) - Build ledger array
 * - extractNumericValue(value) - Parse numeric values from strings/numbers
 * 
 * Usage:
 *   const { deriveNodeTokenMetrics, calculateTokenUsageFromOutputs, buildTokenLedgerFromOutputs, extractNumericValue } = require('./workflow/helpers/tokenHelpers')
 */

/**
 * Extract numeric value from string or number
 * Handles various formats and edge cases
 * Extracted from: workflowExecutionService.js - extractNumericValue()
 */
function extractNumericValue(value) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }
  return 0
}

/**
 * Derive token metrics from a single node output
 * Extracted from: workflowExecutionService.js - deriveNodeTokenMetrics()
 * 
 * Handles:
 * - Single outputs with metadata
 * - Multi-chapter outputs
 * - Various metadata locations (aiMetadata, metadata, outputMetadata, etc.)
 * 
 * @param {Object} nodeOutput - Node output with potential token metadata
 * @returns {Object} Metrics object with tokens, cost, words, provider, model, hasData
 */
function deriveNodeTokenMetrics(nodeOutput = {}) {
  const metrics = {
    tokens: 0,
    cost: 0,
    words: 0,
    provider: nodeOutput.aiMetadata?.provider || nodeOutput.aiMetadata?.providerName || null,
    model: nodeOutput.aiMetadata?.model || null
  }

  const candidateMetas = [
    nodeOutput.aiMetadata,
    nodeOutput.metadata,
    nodeOutput.metadata?.metadata,
    nodeOutput.outputMetadata,
    nodeOutput.compiledData
  ].filter(Boolean)

  candidateMetas.forEach(meta => {
    if (!meta || typeof meta !== 'object') return
    metrics.tokens = Math.max(
      metrics.tokens,
      extractNumericValue(meta.totalTokens) ||
      extractNumericValue(meta.tokens) ||
      extractNumericValue(meta.tokenCount)
    )
    metrics.cost = Math.max(
      metrics.cost,
      extractNumericValue(meta.totalCost) ||
      extractNumericValue(meta.cost) ||
      extractNumericValue(meta.costEstimate)
    )
    metrics.words = Math.max(
      metrics.words,
      extractNumericValue(meta.totalWords) ||
      extractNumericValue(meta.words) ||
      extractNumericValue(meta.wordCount)
    )
    metrics.provider = metrics.provider || meta.provider || meta.providerName || null
    metrics.model = metrics.model || meta.model || null
  })

  // Handle multi-chapter outputs
  if (Array.isArray(nodeOutput.chapters)) {
    let chapterTokens = 0
    let chapterCost = 0
    let chapterWords = 0

    nodeOutput.chapters.forEach(chapter => {
      const chapterMeta = chapter?.metadata || chapter?.aiMetadata || {}
      chapterTokens += extractNumericValue(chapterMeta.totalTokens) ||
        extractNumericValue(chapterMeta.tokens) ||
        extractNumericValue(chapterMeta.tokenCount)
      chapterCost += extractNumericValue(chapterMeta.totalCost) ||
        extractNumericValue(chapterMeta.cost) ||
        extractNumericValue(chapterMeta.costEstimate)
      chapterWords += extractNumericValue(chapterMeta.totalWords) ||
        extractNumericValue(chapterMeta.words) ||
        extractNumericValue(chapterMeta.wordCount)
      metrics.provider = metrics.provider || chapterMeta.provider || chapterMeta.providerName || null
      metrics.model = metrics.model || chapterMeta.model || null
    })

    if (chapterTokens > 0) {
      metrics.tokens = metrics.tokens === 0 ? chapterTokens : Math.max(metrics.tokens, chapterTokens)
    }
    if (chapterCost > 0) {
      metrics.cost = metrics.cost === 0 ? chapterCost : Math.max(metrics.cost, chapterCost)
    }
    if (chapterWords > 0) {
      metrics.words = metrics.words === 0 ? chapterWords : Math.max(metrics.words, chapterWords)
    }
  }

  // Handle metadata.chapters array
  if (Array.isArray(nodeOutput.metadata?.chapters)) {
    let metaChapterTokens = 0
    let metaChapterCost = 0
    let metaChapterWords = 0
    nodeOutput.metadata.chapters.forEach(chapter => {
      const chapterMeta = chapter || {}
      metaChapterTokens += extractNumericValue(chapterMeta.totalTokens) ||
        extractNumericValue(chapterMeta.tokens) ||
        extractNumericValue(chapterMeta.tokenCount)
      metaChapterCost += extractNumericValue(chapterMeta.totalCost) ||
        extractNumericValue(chapterMeta.cost) ||
        extractNumericValue(chapterMeta.costEstimate)
      metaChapterWords += extractNumericValue(chapterMeta.totalWords) ||
        extractNumericValue(chapterMeta.words) ||
        extractNumericValue(chapterMeta.wordCount)
    })

    if (metaChapterTokens > 0) {
      metrics.tokens = metrics.tokens === 0 ? metaChapterTokens : Math.max(metrics.tokens, metaChapterTokens)
    }
    if (metaChapterCost > 0) {
      metrics.cost = metrics.cost === 0 ? metaChapterCost : Math.max(metrics.cost, metaChapterCost)
    }
    if (metaChapterWords > 0) {
      metrics.words = metrics.words === 0 ? metaChapterWords : Math.max(metrics.words, metaChapterWords)
    }
  }

  // Final fallback checks
  if (!metrics.tokens) {
    metrics.tokens = extractNumericValue(nodeOutput.tokens)
  }
  if (!metrics.cost) {
    metrics.cost = extractNumericValue(nodeOutput.cost)
  }
  if (!metrics.words) {
    metrics.words = extractNumericValue(nodeOutput.words)
  }

  return {
    ...metrics,
    hasData: (metrics.tokens || metrics.cost || metrics.words) > 0
  }
}

/**
 * Calculate total token usage from all node outputs
 * Extracted from: workflowExecutionService.js - calculateTokenUsageFromOutputs()
 * 
 * @param {Object} nodeOutputs - Map of node outputs
 * @returns {Object} Totals with totalTokens, totalCost, totalWords
 */
function calculateTokenUsageFromOutputs(nodeOutputs = {}) {
  const totals = {
    totalTokens: 0,
    totalCost: 0,
    totalWords: 0
  }

  Object.values(nodeOutputs || {}).forEach(output => {
    const metrics = deriveNodeTokenMetrics(output)
    if (!metrics.hasData) return
    totals.totalTokens += metrics.tokens
    totals.totalCost += metrics.cost
    totals.totalWords += metrics.words
  })

  return totals
}

/**
 * Build token ledger array from node outputs
 * Extracted from: workflowExecutionService.js - buildTokenLedgerFromOutputs()
 * 
 * @param {Object} nodeOutputs - Map of node outputs
 * @returns {Array} Ledger entries with nodeId, nodeName, nodeType, tokens, cost, words, provider, model, timestamp
 */
function buildTokenLedgerFromOutputs(nodeOutputs = {}) {
  const ledger = []
  Object.entries(nodeOutputs || {}).forEach(([nodeId, output]) => {
    const metrics = deriveNodeTokenMetrics(output)
    if (!metrics.hasData) return
    ledger.push({
      nodeId,
      nodeName: output.nodeName || output.metadata?.nodeName || nodeId,
      nodeType: output.nodeType || output.metadata?.nodeType || 'unknown',
      tokens: metrics.tokens,
      cost: metrics.cost,
      words: metrics.words,
      provider: metrics.provider || null,
      model: metrics.model || null,
      timestamp: output.executedAt || output.metadata?.timestamp || new Date().toISOString()
    })
  })
  return ledger
}

/**
 * Get token usage summary from stateManager or calculate from nodeOutputs
 * Extracted from: workflowExecutionService.js - getTokenUsageSummary()
 * 
 * @param {Object} stateManager - Execution state manager instance
 * @param {string} workflowId - Workflow ID
 * @param {Object} nodeOutputs - Map of node outputs (fallback)
 * @returns {Object} Usage summary with totalTokens, totalCost, totalWords
 */
function getTokenUsageSummary(stateManager, workflowId, nodeOutputs) {
  // PRIMARY: Check stateManager (where recordNodeTokenUsage stores data)
  const state = stateManager.getExecutionState(workflowId)
  if (state?.tokenUsage && (state.tokenUsage.totalTokens > 0 || state.tokenUsage.totalCost > 0 || state.tokenUsage.totalWords > 0)) {
    return state.tokenUsage // { totalTokens, totalCost, totalWords }
  }
  
  // FALLBACK: Calculate from nodeOutputs using helpers
  if (nodeOutputs && Object.keys(nodeOutputs).length > 0) {
    return calculateTokenUsageFromOutputs(nodeOutputs)
  }
  
  // DEFAULT: Return zero totals
  return { totalTokens: 0, totalCost: 0, totalWords: 0 }
}

/**
 * Get token ledger from stateManager or build from nodeOutputs
 * Extracted from: workflowExecutionService.js - getTokenLedger()
 * 
 * @param {Object} stateManager - Execution state manager instance
 * @param {string} workflowId - Workflow ID
 * @param {Object} nodeOutputs - Map of node outputs (fallback)
 * @returns {Array} Ledger entries with nodeId, tokens, cost, words, etc.
 */
function getTokenLedger(stateManager, workflowId, nodeOutputs) {
  // PRIMARY: Check stateManager (where recordNodeTokenUsage stores data)
  const state = stateManager.getExecutionState(workflowId)
  if (state?.tokenLedger && Array.isArray(state.tokenLedger) && state.tokenLedger.length > 0) {
    return state.tokenLedger // [ledgerEntry, ...]
  }
  
  // FALLBACK: Build from nodeOutputs using helpers
  if (nodeOutputs && Object.keys(nodeOutputs).length > 0) {
    return buildTokenLedgerFromOutputs(nodeOutputs)
  }
  
  // DEFAULT: Return empty ledger
  return []
}

/**
 * Record token usage for a node and update execution state
 * Extracted from: workflowExecutionService.js - recordNodeTokenUsage()
 * 
 * @param {Object} stateManager - State manager instance
 * @param {string} workflowId - Workflow execution ID
 * @param {Object} nodeMeta - Node metadata { nodeId, nodeName, nodeType }
 * @param {Object} nodeOutput - Node output object (mutated in place)
 */
function recordNodeTokenUsage(stateManager, workflowId, nodeMeta, nodeOutput) {
  if (!workflowId || !nodeOutput) {
    return
  }

  const metrics = deriveNodeTokenMetrics(nodeOutput)
  if (!metrics.hasData) {
    return
  }

  // SURGICAL FIX: Ensure nodeOutput has token data directly for executionService.js to read
  // This ensures nodeOutputs[nodeId].aiMetadata.tokens exists when executionService calculates totals
  if (!nodeOutput.aiMetadata) {
    nodeOutput.aiMetadata = {}
  }
  if (metrics.tokens > 0 && (!nodeOutput.aiMetadata.tokens || nodeOutput.aiMetadata.tokens === 0)) {
    nodeOutput.aiMetadata.tokens = metrics.tokens
  }
  if (metrics.cost > 0 && (!nodeOutput.aiMetadata.cost || nodeOutput.aiMetadata.cost === 0)) {
    nodeOutput.aiMetadata.cost = metrics.cost
  }
  if (metrics.words > 0 && (!nodeOutput.aiMetadata.words || nodeOutput.aiMetadata.words === 0)) {
    nodeOutput.aiMetadata.words = metrics.words
  }
  // Also set at root level for compatibility
  if (metrics.tokens > 0 && (!nodeOutput.tokens || nodeOutput.tokens === 0)) {
    nodeOutput.tokens = metrics.tokens
  }
  if (!nodeOutput.aiMetadata.provider && metrics.provider) {
    nodeOutput.aiMetadata.provider = metrics.provider
  }
  if (!nodeOutput.aiMetadata.model && metrics.model) {
    nodeOutput.aiMetadata.model = metrics.model
  }

  const state = stateManager.getExecutionState(workflowId) || {}
  const currentUsage = state.tokenUsage || { totalTokens: 0, totalCost: 0, totalWords: 0 }
  const updatedUsage = {
    totalTokens: currentUsage.totalTokens + metrics.tokens,
    totalCost: currentUsage.totalCost + metrics.cost,
    totalWords: currentUsage.totalWords + metrics.words
  }

  const ledgerEntry = {
    nodeId: nodeMeta.nodeId,
    nodeName: nodeMeta.nodeName,
    nodeType: nodeMeta.nodeType,
    tokens: metrics.tokens,
    cost: metrics.cost,
    words: metrics.words,
    provider: metrics.provider || null,
    model: metrics.model || null,
    timestamp: new Date().toISOString()
  }

  const currentLedger = state.tokenLedger || []
  const updatedLedger = [...currentLedger, ledgerEntry]

  stateManager.updateExecutionState(workflowId, {
    tokenUsage: updatedUsage,
    tokenLedger: updatedLedger
  })

  console.log(`💰 Token usage recorded for ${nodeMeta.nodeName || nodeMeta.nodeId}:`, {
    tokens: metrics.tokens,
    cost: metrics.cost,
    words: metrics.words,
    totalTokens: updatedUsage.totalTokens,
    totalCost: updatedUsage.totalCost
  })
}

module.exports = {
  deriveNodeTokenMetrics,
  calculateTokenUsageFromOutputs,
  buildTokenLedgerFromOutputs,
  extractNumericValue,
  getTokenUsageSummary,
  getTokenLedger,
  recordNodeTokenUsage
}


