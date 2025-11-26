const { getSupabase } = require('./supabase');
const logger = require('../utils/logger');

/**
 * Fetch AI provider configuration on-demand
 * This service fetches provider API keys from ai_providers table when needed
 * NO pre-loading, NO user context - just fetch what the engine needs
 */

async function getProviderConfig(providerKey) {
  try {
    logger.info(`🔍 Fetching provider config for: ${providerKey}`);
    
    const supabase = getSupabase();
    
    // ONLY fetch API key and provider type from ai_providers
    // The model ID is already in the workflow data (providerKey:modelId format)
    const { data: providerData, error: providerError } = await supabase
      .from('ai_providers')
      .select('name, provider, api_key, is_active')
      .eq('name', providerKey)
      .eq('is_active', true)
      .single();

    if (providerError || !providerData) {
      logger.error(`❌ Provider ${providerKey} not found in ai_providers:`, providerError);
      throw new Error(`Provider ${providerKey} not found: ${providerError?.message || 'Not found'}`);
    }

    logger.info(`✅ Provider ${providerKey} loaded (type: ${providerData.provider})`);
    
    return {
      name: providerData.name,
      providerType: providerData.provider,
      apiKey: providerData.api_key
    };
    
  } catch (error) {
    logger.error(`💥 Failed to get provider config for ${providerKey}:`, error);
    throw error;
  }
}

/**
 * Get model info for a specific provider
 */
async function getModelInfo(providerName, modelName) {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('ai_model_metadata')
      .select('*')
      .eq('key_name', providerName)
      .eq('model_name', modelName)
      .eq('is_active', true)
      .single();

    if (error) {
      logger.warn(`⚠️ Model metadata not found for ${modelName}, using defaults`);
      return null;
    }

    return data;
    
  } catch (error) {
    logger.warn(`⚠️ Error fetching model metadata:`, error);
    return null;
  }
}

module.exports = {
  getProviderConfig,
  getModelInfo
};

