-- Comprehensive Execution Logging System for Lekhika
-- This schema captures every aspect of workflow execution for advanced analytics and debugging

-- Main execution logs table
CREATE TABLE execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_id VARCHAR(255) NOT NULL UNIQUE, -- Unique execution identifier
  workflow_id UUID REFERENCES workflows(id) ON DELETE SET NULL,
  engine_id UUID REFERENCES ai_engines(id) ON DELETE SET NULL,
  
  -- User and Session Information
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  superadmin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id VARCHAR(255),
  api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
  
  -- Execution Metadata
  execution_type VARCHAR(50) NOT NULL DEFAULT 'workflow', -- 'workflow', 'test', 'preview'
  status VARCHAR(50) NOT NULL DEFAULT 'running', -- 'running', 'completed', 'failed', 'cancelled'
  priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  
  -- Timing Information
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  queue_wait_ms INTEGER DEFAULT 0,
  
  -- Input Data
  input_data JSONB NOT NULL DEFAULT '{}',
  input_size_bytes INTEGER DEFAULT 0,
  input_field_count INTEGER DEFAULT 0,
  
  -- Output Data
  output_data JSONB DEFAULT NULL,
  output_size_bytes INTEGER DEFAULT 0,
  output_formats TEXT[] DEFAULT '{}',
  
  -- AI Metrics
  total_tokens INTEGER DEFAULT 0,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  total_cost DECIMAL(10,6) DEFAULT 0.000000,
  cost_breakdown JSONB DEFAULT '{}',
  
  -- Performance Metrics
  total_nodes INTEGER DEFAULT 0,
  successful_nodes INTEGER DEFAULT 0,
  failed_nodes INTEGER DEFAULT 0,
  skipped_nodes INTEGER DEFAULT 0,
  average_node_duration_ms INTEGER DEFAULT 0,
  
  -- Resource Usage
  memory_usage_mb INTEGER DEFAULT 0,
  cpu_usage_percent DECIMAL(5,2) DEFAULT 0.00,
  network_requests INTEGER DEFAULT 0,
  cache_hits INTEGER DEFAULT 0,
  cache_misses INTEGER DEFAULT 0,
  
  -- Error Information
  error_message TEXT,
  error_code VARCHAR(100),
  error_stack_trace TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  
  -- Environment Information
  environment VARCHAR(50) DEFAULT 'production', -- 'development', 'staging', 'production'
  version VARCHAR(50),
  build_number VARCHAR(50),
  server_instance VARCHAR(100),
  
  -- Quality Metrics
  quality_score DECIMAL(3,2) DEFAULT 0.00, -- 0.00 to 1.00
  user_satisfaction_score INTEGER DEFAULT 0, -- 1-5 rating
  content_quality_flags TEXT[] DEFAULT '{}',
  
  -- Compliance and Security
  data_classification VARCHAR(50) DEFAULT 'internal', -- 'public', 'internal', 'confidential', 'restricted'
  gdpr_compliant BOOLEAN DEFAULT true,
  data_retention_days INTEGER DEFAULT 2555, -- 7 years default
  
  -- Audit Trail
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Indexes for performance
  CONSTRAINT valid_status CHECK (status IN ('running', 'completed', 'failed', 'cancelled', 'timeout')),
  CONSTRAINT valid_execution_type CHECK (execution_type IN ('workflow', 'test', 'preview', 'batch')),
  CONSTRAINT valid_priority CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  CONSTRAINT valid_environment CHECK (environment IN ('development', 'staging', 'production', 'testing')),
  CONSTRAINT positive_tokens CHECK (total_tokens >= 0),
  CONSTRAINT positive_cost CHECK (total_cost >= 0),
  CONSTRAINT valid_quality_score CHECK (quality_score >= 0.00 AND quality_score <= 1.00),
  CONSTRAINT valid_satisfaction_score CHECK (user_satisfaction_score >= 0 AND user_satisfaction_score <= 5)
);

-- Node execution details table
CREATE TABLE node_execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_log_id UUID NOT NULL REFERENCES execution_logs(id) ON DELETE CASCADE,
  node_id VARCHAR(255) NOT NULL,
  node_type VARCHAR(50) NOT NULL, -- 'input', 'process', 'condition', 'output', 'preview'
  node_name VARCHAR(255) NOT NULL,
  node_order INTEGER NOT NULL,
  
  -- Node Configuration
  node_config JSONB NOT NULL DEFAULT '{}',
  ai_enabled BOOLEAN DEFAULT false,
  selected_models TEXT[] DEFAULT '{}',
  system_prompt TEXT,
  user_prompt TEXT,
  
  -- Execution Details
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed', 'skipped'
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER DEFAULT 0,
  
  -- Input/Output Data
  input_data JSONB DEFAULT '{}',
  output_data JSONB DEFAULT '{}',
  processed_content TEXT,
  
  -- AI Specific Metrics
  ai_provider VARCHAR(100),
  ai_model VARCHAR(100),
  ai_tokens INTEGER DEFAULT 0,
  ai_cost DECIMAL(10,6) DEFAULT 0.000000,
  ai_temperature DECIMAL(3,2) DEFAULT 0.70,
  ai_max_tokens INTEGER DEFAULT 4000,
  
  -- Performance Metrics
  memory_usage_mb INTEGER DEFAULT 0,
  processing_time_ms INTEGER DEFAULT 0,
  queue_wait_ms INTEGER DEFAULT 0,
  
  -- Error Information
  error_message TEXT,
  error_code VARCHAR(100),
  retry_count INTEGER DEFAULT 0,
  
  -- Quality Metrics
  content_quality_score DECIMAL(3,2) DEFAULT 0.00,
  word_count INTEGER DEFAULT 0,
  character_count INTEGER DEFAULT 0,
  
  -- Audit Trail
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_node_status CHECK (status IN ('pending', 'running', 'completed', 'failed', 'skipped')),
  CONSTRAINT valid_node_type CHECK (node_type IN ('input', 'process', 'condition', 'output', 'preview')),
  CONSTRAINT positive_ai_tokens CHECK (ai_tokens >= 0),
  CONSTRAINT positive_ai_cost CHECK (ai_cost >= 0)
);

-- AI Provider usage tracking
CREATE TABLE ai_provider_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_log_id UUID NOT NULL REFERENCES execution_logs(id) ON DELETE CASCADE,
  node_execution_id UUID REFERENCES node_execution_logs(id) ON DELETE CASCADE,
  
  provider_name VARCHAR(100) NOT NULL,
  model_id VARCHAR(100) NOT NULL,
  api_endpoint VARCHAR(500),
  
  -- Request Details
  request_tokens INTEGER DEFAULT 0,
  response_tokens INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  cost_per_1k_tokens DECIMAL(10,6) DEFAULT 0.000000,
  total_cost DECIMAL(10,6) DEFAULT 0.000000,
  
  -- Performance Metrics
  response_time_ms INTEGER DEFAULT 0,
  request_size_bytes INTEGER DEFAULT 0,
  response_size_bytes INTEGER DEFAULT 0,
  
  -- Status Information
  status_code INTEGER DEFAULT 200,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  -- Request/Response Data
  request_payload JSONB DEFAULT '{}',
  response_payload JSONB DEFAULT '{}',
  
  -- Audit Trail
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT positive_request_tokens CHECK (request_tokens >= 0),
  CONSTRAINT positive_response_tokens CHECK (response_tokens >= 0),
  CONSTRAINT positive_total_tokens CHECK (total_tokens >= 0),
  CONSTRAINT positive_cost CHECK (total_cost >= 0)
);

-- User interaction logs
CREATE TABLE user_interaction_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  execution_log_id UUID NOT NULL REFERENCES execution_logs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  
  interaction_type VARCHAR(50) NOT NULL, -- 'start_execution', 'cancel_execution', 'download_output', 'rate_output', 'provide_feedback'
  interaction_data JSONB DEFAULT '{}',
  
  -- Feedback and Ratings
  satisfaction_rating INTEGER, -- 1-5 scale
  content_quality_rating INTEGER, -- 1-5 scale
  speed_rating INTEGER, -- 1-5 scale
  feedback_text TEXT,
  
  -- Context
  user_agent TEXT,
  ip_address INET,
  country VARCHAR(100),
  device_type VARCHAR(50),
  
  -- Audit Trail
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT valid_interaction_type CHECK (interaction_type IN ('start_execution', 'cancel_execution', 'download_output', 'rate_output', 'provide_feedback', 'view_results')),
  CONSTRAINT valid_satisfaction_rating CHECK (satisfaction_rating IS NULL OR (satisfaction_rating >= 1 AND satisfaction_rating <= 5)),
  CONSTRAINT valid_quality_rating CHECK (content_quality_rating IS NULL OR (content_quality_rating >= 1 AND content_quality_rating <= 5)),
  CONSTRAINT valid_speed_rating CHECK (speed_rating IS NULL OR (speed_rating >= 1 AND speed_rating <= 5))
);

-- Performance metrics aggregation table
CREATE TABLE execution_performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  hour INTEGER NOT NULL, -- 0-23
  
  -- Aggregated Metrics
  total_executions INTEGER DEFAULT 0,
  successful_executions INTEGER DEFAULT 0,
  failed_executions INTEGER DEFAULT 0,
  cancelled_executions INTEGER DEFAULT 0,
  
  -- Timing Metrics
  avg_duration_ms INTEGER DEFAULT 0,
  min_duration_ms INTEGER DEFAULT 0,
  max_duration_ms INTEGER DEFAULT 0,
  p50_duration_ms INTEGER DEFAULT 0,
  p95_duration_ms INTEGER DEFAULT 0,
  p99_duration_ms INTEGER DEFAULT 0,
  
  -- Token Metrics
  total_tokens INTEGER DEFAULT 0,
  avg_tokens_per_execution INTEGER DEFAULT 0,
  
  -- Cost Metrics
  total_cost DECIMAL(12,6) DEFAULT 0.000000,
  avg_cost_per_execution DECIMAL(10,6) DEFAULT 0.000000,
  
  -- Quality Metrics
  avg_quality_score DECIMAL(3,2) DEFAULT 0.00,
  avg_satisfaction_score DECIMAL(3,2) DEFAULT 0.00,
  
  -- Resource Metrics
  avg_memory_usage_mb INTEGER DEFAULT 0,
  avg_cpu_usage_percent DECIMAL(5,2) DEFAULT 0.00,
  
  -- Audit Trail
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  UNIQUE(date, hour),
  CONSTRAINT valid_hour CHECK (hour >= 0 AND hour <= 23),
  CONSTRAINT positive_executions CHECK (total_executions >= 0),
  CONSTRAINT positive_successful CHECK (successful_executions >= 0),
  CONSTRAINT positive_failed CHECK (failed_executions >= 0),
  CONSTRAINT positive_cancelled CHECK (cancelled_executions >= 0)
);

-- Create indexes for optimal performance
CREATE INDEX idx_execution_logs_user_id ON execution_logs(user_id);
CREATE INDEX idx_execution_logs_workflow_id ON execution_logs(workflow_id);
CREATE INDEX idx_execution_logs_engine_id ON execution_logs(engine_id);
CREATE INDEX idx_execution_logs_status ON execution_logs(status);
CREATE INDEX idx_execution_logs_started_at ON execution_logs(started_at);
CREATE INDEX idx_execution_logs_execution_type ON execution_logs(execution_type);
CREATE INDEX idx_execution_logs_environment ON execution_logs(environment);
CREATE INDEX idx_execution_logs_created_at ON execution_logs(created_at);

CREATE INDEX idx_node_execution_logs_execution_id ON node_execution_logs(execution_log_id);
CREATE INDEX idx_node_execution_logs_node_id ON node_execution_logs(node_id);
CREATE INDEX idx_node_execution_logs_status ON node_execution_logs(status);
CREATE INDEX idx_node_execution_logs_node_type ON node_execution_logs(node_type);

CREATE INDEX idx_ai_provider_logs_execution_id ON ai_provider_logs(execution_log_id);
CREATE INDEX idx_ai_provider_logs_provider_name ON ai_provider_logs(provider_name);
CREATE INDEX idx_ai_provider_logs_model_id ON ai_provider_logs(model_id);
CREATE INDEX idx_ai_provider_logs_created_at ON ai_provider_logs(created_at);

CREATE INDEX idx_user_interaction_logs_execution_id ON user_interaction_logs(execution_log_id);
CREATE INDEX idx_user_interaction_logs_user_id ON user_interaction_logs(user_id);
CREATE INDEX idx_user_interaction_logs_interaction_type ON user_interaction_logs(interaction_type);

CREATE INDEX idx_performance_metrics_date_hour ON execution_performance_metrics(date, hour);
CREATE INDEX idx_performance_metrics_date ON execution_performance_metrics(date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_execution_logs_updated_at BEFORE UPDATE ON execution_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_node_execution_logs_updated_at BEFORE UPDATE ON node_execution_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_performance_metrics_updated_at BEFORE UPDATE ON execution_performance_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create RLS policies for security
ALTER TABLE execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE node_execution_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_provider_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interaction_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE execution_performance_metrics ENABLE ROW LEVEL SECURITY;

-- SuperAdmin can access all logs
CREATE POLICY "SuperAdmin full access to execution_logs" ON execution_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'superadmin'
    )
  );

CREATE POLICY "SuperAdmin full access to node_execution_logs" ON node_execution_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'superadmin'
    )
  );

CREATE POLICY "SuperAdmin full access to ai_provider_logs" ON ai_provider_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'superadmin'
    )
  );

CREATE POLICY "SuperAdmin full access to user_interaction_logs" ON user_interaction_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'superadmin'
    )
  );

CREATE POLICY "SuperAdmin full access to execution_performance_metrics" ON execution_performance_metrics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'superadmin'
    )
  );

-- Users can only access their own logs
CREATE POLICY "Users can access own execution_logs" ON execution_logs
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can access own node_execution_logs" ON node_execution_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM execution_logs 
      WHERE execution_logs.id = node_execution_logs.execution_log_id 
      AND execution_logs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can access own ai_provider_logs" ON ai_provider_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM execution_logs 
      WHERE execution_logs.id = ai_provider_logs.execution_log_id 
      AND execution_logs.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can access own user_interaction_logs" ON user_interaction_logs
  FOR SELECT USING (user_id = auth.uid());

-- Comments for documentation
COMMENT ON TABLE execution_logs IS 'Main table storing comprehensive execution logs for all workflow runs';
COMMENT ON TABLE node_execution_logs IS 'Detailed logs for each node execution within a workflow';
COMMENT ON TABLE ai_provider_logs IS 'AI provider API call logs with detailed metrics';
COMMENT ON TABLE user_interaction_logs IS 'User interactions and feedback for executions';
COMMENT ON TABLE execution_performance_metrics IS 'Hourly aggregated performance metrics for analytics';

COMMENT ON COLUMN execution_logs.execution_id IS 'Unique identifier for each execution run';
COMMENT ON COLUMN execution_logs.data_classification IS 'Data sensitivity classification for compliance';
COMMENT ON COLUMN execution_logs.gdpr_compliant IS 'Whether this execution complies with GDPR requirements';
COMMENT ON COLUMN execution_logs.data_retention_days IS 'How long to retain this data before auto-deletion';

