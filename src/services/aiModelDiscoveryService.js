import { supabase } from '../lib/supabase';

const PROVIDER_DISCOVERY_METHODS = {
  openai: async (apiKey) => {
    console.log('🔍 OpenAI Model Discovery Started');
    try {
      console.log('🔑 Using API key (first 10 chars):', apiKey.substring(0, 10) + '...');
      console.log('🌐 Making request to /api/openai/models');
      
      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch('/api/openai/models', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);

      console.log('📡 Response status:', response.status, response.statusText);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }
      const data = await response.json();
      console.log('📊 Response data received:', data);
      if (!data.data || !Array.isArray(data.data)) {
        throw new Error('Invalid response format from OpenAI API');
      }
      return data.data.map(model => ({
        provider: 'openai',
        model_name: model.id,
        model_id: model.id,
        input_cost_per_million: 0,
        output_cost_per_million: 0,
        context_window_tokens: 0,
        specialties: [],
        tokens_per_page: 0,
        description: model.id.includes('gpt-4') ? 'Advanced reasoning and understanding' : 'General purpose AI model',
        is_active: false,
        metadata: JSON.stringify(model)
      }));
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('❌ OpenAI Model Discovery Timeout (15s)');
        throw new Error('OpenAI API request timed out after 15 seconds');
      }
      console.error('❌ OpenAI Model Discovery Failed:', error);
      throw error;
    }
  },
  gemini: async (apiKey) => {
    console.log('🔍 Google Gemini Model Discovery Started');
    try {
      console.log('🔑 Using API key (first 10 chars):', apiKey.substring(0, 10) + '...');
      console.log('🌐 Making request to /api/gemini/models');
      // Gemini API requires API key as query parameter, not Authorization header
      const response = await fetch(`/api/gemini/models?key=${apiKey}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 Response status:', response.status, response.statusText);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Gemini API Error Details:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }
      const data = await response.json();
      console.log('📊 Response data received:', data);
      if (!data.models || !Array.isArray(data.models)) {
        console.error('❌ Invalid Gemini response format:', data);
        throw new Error('Invalid response format from Gemini API');
      }
      return data.models.map(model => ({
        provider: 'gemini',
        model_name: model.name,
        model_id: model.name,
        input_cost_per_million: model.inputCostPerMillion || 0,
        output_cost_per_million: model.outputCostPerMillion || 0,
        context_window_tokens: model.contextWindow || 0,
        specialties: [],
        tokens_per_page: model.tokensPerPage || 0,
        description: model.description || 'Google Gemini AI model',
        is_active: false,
        metadata: JSON.stringify(model)
      }));
    } catch (error) {
      console.error('❌ Google Gemini Model Discovery Failed:', error);
      return [];
    }
  },
  mistral: async (apiKey) => {
    console.log('🔍 Mistral Model Discovery Started');
    try {
      console.log('🔑 Using API key (first 10 chars):', apiKey.substring(0, 10) + '...');
      console.log('🌐 Making request to /api/mistral/models');
      const response = await fetch('/api/mistral/models', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      });

      console.log('📡 Response status:', response.status, response.statusText);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Mistral API Error Details:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }
      const data = await response.json();
      console.log('📊 Response data received:', data);
      if (!data.data || !Array.isArray(data.data)) {
        console.error('❌ Invalid Mistral response format:', data);
        throw new Error('Invalid response format from Mistral API');
      }
      return data.data.map(model => ({
        provider: 'mistral',
        model_name: model.id,
        model_id: model.id,
        input_cost_per_million: 0,
        output_cost_per_million: 0,
        context_window_tokens: 0,
        specialties: [],
        tokens_per_page: 0,
        description: 'Mistral AI model',
        is_active: false,
        metadata: JSON.stringify(model)
      }));
    } catch (error) {
      console.error('❌ Mistral Model Discovery Failed:', error);
      return [];
    }
  },
  anthropic: async (apiKey) => {
    console.log('🔍 Anthropic (Claude) Model Discovery Started');
    try {
      console.log('🔑 Using API key (first 10 chars):', apiKey.substring(0, 10) + '...');
      console.log('🌐 Making request to /api/claude/models');
      const response = await fetch('/api/claude/models', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        }
      });

      console.log('📡 Response status:', response.status, response.statusText);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Anthropic API Error Details:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }
      const data = await response.json();
      console.log('📊 Response data received:', data);
      
      // Anthropic returns models in data array
      if (!data || !data.data || !Array.isArray(data.data)) {
        console.error('❌ Invalid Anthropic response format:', data);
        throw new Error('Invalid response format from Anthropic API');
      }
      
      return data.data.map(model => ({
        provider: 'anthropic',
        model_name: model.id || model.name || 'Unknown Claude Model',
        model_id: model.id || model.name || 'unknown-claude-model',
        input_cost_per_million: 0,
        output_cost_per_million: 0,
        context_window_tokens: model.context_window || 200000,
        specialties: [],
        tokens_per_page: 500,
        description: model.description || 'Claude AI model by Anthropic',
        is_active: false,
        metadata: JSON.stringify(model)
      }));
    } catch (error) {
      console.error('❌ Anthropic (Claude) Model Discovery Failed:', error);
      return [];
    }
  },
  perplexity: async (apiKey) => {
    console.log('🔍 Perplexity Model Discovery Started');
    try {
      console.log('🔑 Using API key (first 10 chars):', apiKey.substring(0, 10) + '...');
      console.log('🌐 Making request to /api/perplexity/models');
      const response = await fetch('/api/perplexity/models', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      });

      console.log('📡 Response status:', response.status, response.statusText);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Perplexity API Error Details:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }
      const data = await response.json();
      console.log('📊 Response data received:', data);
      
      // Perplexity uses OpenAI-compatible API structure
      if (!data || !data.data || !Array.isArray(data.data)) {
        console.error('❌ Invalid Perplexity response format:', data);
        throw new Error('Invalid response format from Perplexity API');
      }
      
      return data.data.map(model => ({
        provider: 'perplexity',
        model_name: model.id || model.name || 'Unknown Perplexity Model',
        model_id: model.id || model.name || 'unknown-perplexity-model',
        input_cost_per_million: 0,
        output_cost_per_million: 0,
        context_window_tokens: model.context_window || 128000,
        specialties: [],
        tokens_per_page: 500,
        description: model.description || 'Perplexity AI model',
        is_active: false,
        metadata: JSON.stringify(model)
      }));
    } catch (error) {
      console.error('❌ Perplexity Model Discovery Failed:', error);
      return [];
    }
  },
  grok: async (apiKey) => {
    console.log('🔍 Grok Model Discovery Started');
    try {
      console.log('🔑 Using API key (first 10 chars):', apiKey.substring(0, 10) + '...');
      console.log('🌐 Making request to /api/grok/models');
      const response = await fetch('/api/grok/models', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      });

      console.log('📡 Response status:', response.status, response.statusText);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Grok API Error Details:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText}`);
      }
      const data = await response.json();
      console.log('📊 Response data received:', data);
      if (!data || !data.data || !Array.isArray(data.data)) {
        console.error('❌ Invalid Grok response format:', data);
        throw new Error('Invalid response format from Grok API');
      }
      return data.data.map(model => ({
        provider: 'grok',
        model_name: model.id || model.name || 'Unknown Grok Model',
        model_id: model.id || model.name || 'unknown-grok-model',
        input_cost_per_million: 0,
        output_cost_per_million: 0,
        context_window_tokens: 0,
        specialties: 'Conversational AI',
        tokens_per_page: 0,
        description: 'Grok AI model by xAI',
        is_active: false,
        metadata: JSON.stringify(model)
      }));
    } catch (error) {
      console.error('❌ Grok Model Discovery Failed:', error);
      return [];
    }
  }
};

export async function ensureTableExists() {
  try {
    // Try to query the table to see if it exists
    const { data, error } = await supabase
      .from('ai_model_metadata')
      .select('count')
      .limit(1);
      
    if (error) {
      console.error('❌ ai_model_metadata table does not exist or is not accessible:', error);
      return false;
    }
    
    console.log('✅ ai_model_metadata table exists and is accessible');
    return true;
  } catch (error) {
    console.error('❌ Error checking table existence:', error);
    return false;
  }
}

export async function discoverModelsForProvider(provider, apiKey) {
  console.log(`🚀 Attempting to discover models for provider: ${provider}`);

  // Ensure table exists first
  const tableExists = await ensureTableExists();
  if (!tableExists) {
    console.error('❌ Cannot proceed without ai_model_metadata table');
    return [];
  }

  // Map provider aliases to standard names
  const providerMap = {
    'claude': 'anthropic',
    'google': 'gemini'
  };

  const normalizedProvider = providerMap[provider.toLowerCase()] || provider.toLowerCase();
  const discoveryMethod = PROVIDER_DISCOVERY_METHODS[normalizedProvider];
  
  if (!discoveryMethod) {
    console.warn(`No discovery method for provider: ${provider}`);
    return [];
  }

  try {
    console.log(`🔍 Executing discovery method for ${normalizedProvider}`);
    const models = await discoveryMethod(apiKey);
    
    console.log(`📥 Preparing to upsert ${models.length} models`);
    if (models.length > 0) {
      // Get current user for RLS policy
      const { data: { user } } = await supabase.auth.getUser();
      
      // Add user_id to each model for RLS compliance and map fields properly
      const modelsWithUser = models.map(model => ({
        ...model,
        user_id: user?.id || null,
        // Map context window from contextSize
        context_window_tokens: model.contextSize || null,
        // Map pricing information (convert from costPer1k to cost per million)
        input_cost_per_million: model.costPer1k ? (model.costPer1k * 1000) : null,
        output_cost_per_million: model.costPer1k ? (model.costPer1k * 1000) : null, // Assuming same rate for now
        // Map capabilities to specialties
        specialties: model.capabilities || [],
        // Map conception date
        conception_date: model.conceptionDate || null,
        date_source: model.conceptionDate ? 'api_field' : null,
        date_confidence: model.conceptionDate ? 90 : 0 // High confidence if we got it from API
      }));

      console.log('🔍 Attempting to upsert models to ai_model_metadata table...');
      console.log('📊 Sample model data:', modelsWithUser[0]);
      console.log('🔍 Conception date being upserted:', modelsWithUser[0]?.conception_date);
      console.log('🔍 Date source being upserted:', modelsWithUser[0]?.date_source);
      
      const { data, error } = await supabase
        .from('ai_model_metadata')
        .upsert(modelsWithUser, {
          onConflict: 'id',
          ignoreDuplicates: false
        });

      if (error) {
        console.error('❌ Model sync error:', error);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
        console.error('❌ Models being upserted:', JSON.stringify(modelsWithUser.slice(0, 2), null, 2));
        
        // Try to check if table exists
        const { data: tableCheck, error: tableError } = await supabase
          .from('ai_model_metadata')
          .select('count')
          .limit(1);
          
        if (tableError) {
          console.error('❌ Table check failed:', tableError);
        } else {
          console.log('✅ Table exists, current count:', tableCheck);
        }
        
        // Return fetched models even if database sync fails
        console.log(`⚠️ Returning fetched models despite sync error`);
        return models;
      }

      console.log(`✅ Successfully synced ${models.length} models for ${provider}`);
      console.log('📊 Upserted data:', data);
      return data || models;
    } else {
      console.log(`⚠️ No models fetched for ${provider}`);
      return [];
    }
  } catch (error) {
    console.error(`❌ Failed to sync models for ${provider}:`, error);
    return [];
  }
}

export async function getModelsByProvider(provider) {
  console.log(`🔍 Fetching models for provider: ${provider}`);
  const { data, error } = await supabase
    .from('ai_model_metadata')
    .select('*')
    .eq('provider', provider.toLowerCase())
    .eq('is_active', true);

  if (error) {
    console.error(`❌ Failed to fetch models for ${provider}:`, error);
    return [];
  }

  console.log(`✅ Found ${data.length} active models for ${provider}`);
  return data;
}

const aiModelDiscoveryService = {
  discoverModelsForProvider,
  getModelsByProvider
}

export { aiModelDiscoveryService }
export default aiModelDiscoveryService;