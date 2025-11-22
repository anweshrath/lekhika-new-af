const { adjustUserTokens, logTokenUsage } = require('../supabase')
const aiService = require('../aiService')

async function debitTokens({ userId, executionId, totalTokensUsed, totalCost, engineMetadata }) {
  if (!totalTokensUsed || totalTokensUsed <= 0) return
  await adjustUserTokens({
    userId,
    amount: totalTokensUsed,
    changeType: 'debit',
    reason: 'workflow_execution',
    metadata: engineMetadata,
    levelId: engineMetadata?.levelId || null,
    source: 'worker',
    referenceType: 'engine_execution',
    referenceId: executionId,
    executionId
  })
  await logTokenUsage(
    userId,
    executionId,
    engineMetadata?.tokenUsage?.provider || engineMetadata?.models?.[0]?.provider || 'unknown',
    engineMetadata?.tokenUsage?.model || engineMetadata?.tokenUsage?.modelId || engineMetadata?.models?.[0]?.name || 'unknown',
    totalTokensUsed,
    totalCost
  )
}

function getAIProviderInstance() {
  return aiService
}

module.exports = {
  debitTokens,
  getAIProviderInstance
}

