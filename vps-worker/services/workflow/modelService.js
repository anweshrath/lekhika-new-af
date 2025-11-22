const { getSupabase } = require('../supabase')

async function parseModelConfig(modelString) {
  if (!modelString) {
    throw new Error('No model selected for AI generation')
  }

  let providerName
  let modelId

  if (modelString.includes(':')) {
    ;[providerName, modelId] = modelString.split(':')

    if (modelId && modelId.startsWith('models/')) {
      modelId = modelId.replace('models/', '')
      console.log('🔍 Cleaned model ID:', modelId)
    }

    if (modelId === 'default') {
      console.log('🔍 Fetching default model for provider:', providerName)
      try {
        const supabase = getSupabase()
        const { data: defaultModel, error: modelError } = await supabase
          .from('ai_model_metadata')
          .select('model_id')
          .eq('provider_name', providerName)
          .eq('status', 'active')
          .order('created_at')
          .limit(1)
          .single()

        if (!modelError && defaultModel?.model_id) {
          modelId = defaultModel.model_id
          console.log('🔍 Fetched default model from database:', modelId)
        } else {
          throw new Error(`No active models found for provider ${providerName}`)
        }
      } catch (error) {
        console.error('🔍 Failed to fetch default model from database:', error)
        throw new Error(`Invalid model ID 'default' for provider ${providerName}. Please select a valid model.`)
      }
    }
  } else {
    providerName = modelString
    modelId = 'default'
    console.log('🔍 Using legacy model format:', modelString, '-> provider:', providerName, 'model:', modelId)
  }

  if (!providerName) {
    throw new Error(`Invalid model format: ${modelString}. Expected format: providerName:modelId or legacy format`)
  }

  const supabase = getSupabase()
  const { data: providerData, error } = await supabase
    .from('ai_providers')
    .select('provider')
    .eq('name', providerName)
    .single()

  if (error || !providerData) {
    console.warn(`Provider ${providerName} not found in database, trying legacy mapping...`)
    let legacyProviderType = 'openai'
    if (providerName.startsWith('OPENA')) legacyProviderType = 'openai'
    else if (providerName.startsWith('MISTR')) legacyProviderType = 'mistral'
    else if (providerName.startsWith('GEMIN')) legacyProviderType = 'gemini'
    else if (providerName.startsWith('CLAUD')) legacyProviderType = 'claude'
    else if (providerName.startsWith('PERPL')) legacyProviderType = 'perplexity'
    else if (providerName.startsWith('GROK')) legacyProviderType = 'grok'
    else if (providerName.startsWith('COHER')) legacyProviderType = 'cohere'

    console.log(`🔍 Using legacy provider mapping: ${providerName} -> ${legacyProviderType}`)
    return {
      provider: legacyProviderType,
      model: modelId,
      providerName,
      costPer1k: 0.00003
    }
  }

  const { data: modelData } = await supabase
    .from('ai_model_metadata')
    .select('input_cost_per_million')
    .eq('key_name', providerName)
    .single()

  const costPer1k = modelData?.input_cost_per_million
    ? modelData.input_cost_per_million / 1000
    : 0.00003

  return {
    provider: providerData.provider,
    model: modelId,
    providerName,
    costPer1k
  }
}

module.exports = {
  parseModelConfig
}

