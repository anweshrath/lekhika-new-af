const { createClient } = require('@supabase/supabase-js');
const logger = require('../utils/logger');

let supabase = null;

const initializeSupabase = async () => {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }
    
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    
    // Test connection
    const { data, error } = await supabase
      .from('ai_engines')
      .select('id')
      .limit(1);
    
    if (error) {
      throw new Error(`Supabase connection failed: ${error.message}`);
    }
    
    logger.info('Supabase connection established');
    return supabase;
    
  } catch (error) {
    logger.error('Failed to initialize Supabase:', error);
    throw error;
  }
};

const getSupabase = () => {
  if (!supabase) {
    throw new Error('Supabase not initialized');
  }
  return supabase;
};

// Database operations
const updateExecutionStatus = async (executionId, status, data = null) => {
  try {
    const db = getSupabase();
    
    const updateData = {
      status
    };
    
    if (data) {
      updateData.execution_data = data;
    }
    
    // Set completed_at when status is completed or failed
    if (status === 'completed' || status === 'failed') {
      updateData.completed_at = new Date().toISOString();
    }
    
    const { error } = await db
      .from('engine_executions')
      .update(updateData)
      .eq('id', executionId);
    
    if (error) {
      throw new Error(`Failed to update execution status: ${error.message}`);
    }
    
    logger.logExecution(executionId, `Status updated to: ${status}`);
    
  } catch (error) {
    logger.logExecutionError(executionId, error);
    throw error;
  }
};

const logTokenUsage = async (userId, executionId, provider, model, tokens, cost) => {
  try {
    const db = getSupabase();
    
    const { error } = await db
      .from('token_usage_analytics')
      .insert({
        user_id: userId,
        execution_id: executionId,
        provider,
        model,
        tokens_used: tokens,
        cost_usd: cost,
        created_at: new Date().toISOString()
      });
    
    if (error) {
      logger.error('Failed to log token usage:', error);
    } else {
      logger.logAIRequest(provider, model, tokens, cost);
    }
    
  } catch (error) {
    logger.error('Token usage logging failed:', error);
  }
};

const adjustUserTokens = async ({
  userId,
  amount,
  changeType,
  reason = null,
  metadata = {},
  levelId = null,
  source = 'worker',
  referenceType = null,
  referenceId = null,
  executionId = null
}) => {
  try {
    const db = getSupabase();

    if (!userId) {
      throw new Error('adjustUserTokens requires userId');
    }
    if (!amount || amount <= 0) {
      throw new Error('adjustUserTokens requires amount > 0');
    }
    if (!changeType) {
      throw new Error('adjustUserTokens requires changeType');
    }

    const { data, error } = await db.rpc('adjust_user_tokens', {
      p_user_id: userId,
      p_amount: Math.ceil(amount),
      p_change_type: changeType,
      p_reason: reason,
      p_metadata: metadata || {},
      p_level_id: levelId,
      p_source: source,
      p_reference_type: referenceType,
      p_reference_id: referenceId,
      p_execution_id: executionId
    });

    if (error) {
      throw new Error(error.message || 'adjust_user_tokens RPC failed');
    }

    return data || null;
  } catch (error) {
    logger.error('adjustUserTokens failed:', error);
    throw error;
  }
};

const getEngineWorkflow = async (engineId) => {
  try {
    const db = getSupabase();
    
    const { data, error } = await db
      .from('ai_engines')
      .select('flow_config, models, execution_mode')
      .eq('id', engineId)
      .single();
    
    if (error) {
      throw new Error(`Failed to get engine workflow: ${error.message}`);
    }
    
    // Extract nodes and edges from flow_config
    const flowConfig = data.flow_config || {};
    const nodes = flowConfig.nodes || [];
    const edges = flowConfig.edges || [];
    
    return {
      ...data,
      nodes,
      edges
    };
    
  } catch (error) {
    logger.error('Failed to get engine workflow:', error);
    throw error;
  }
};

const getUserApiKey = async (userId, provider) => {
  try {
    const db = getSupabase();
    
    const { data, error } = await db
      .from('user_api_keys')
      .select('api_key')
      .eq('user_id', userId)
      .eq('provider', provider)
      .eq('is_active', true)
      .single();
    
    if (error) {
      throw new Error(`Failed to get user API key: ${error.message}`);
    }
    
    return data?.api_key;
    
  } catch (error) {
    logger.error('Failed to get user API key:', error);
    throw error;
  }
};

module.exports = {
  initializeSupabase,
  getSupabase,
  updateExecutionStatus,
  logTokenUsage,
  adjustUserTokens,
  getEngineWorkflow,
  getUserApiKey
};
