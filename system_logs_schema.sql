-- COMPREHENSIVE SYSTEM LOGS TABLE FOR LEKHIKA PLATFORM
-- Tracks AI usage, costs, performance, and execution details

CREATE TABLE IF NOT EXISTS system_logs (
    -- PRIMARY KEY
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- TIMESTAMP
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- AI MODEL DETAILS (UNREMOVABLE CORE COLUMNS)
    ai_model_id UUID NOT NULL,
    ai_provider_id UUID NOT NULL,
    ai_model_name VARCHAR(255) NOT NULL,
    ai_provider_name VARCHAR(100) NOT NULL,
    
    -- ENGINE & EXECUTION DETAILS
    engine_id VARCHAR(255) NOT NULL,
    flow_id UUID,
    node_id VARCHAR(255),
    execution_id VARCHAR(255) NOT NULL,
    
    -- USER & SESSION TRACKING
    user_id UUID,
    session_id VARCHAR(255),
    user_email VARCHAR(255),
    
    -- COST TRACKING (CRITICAL FOR $18M PLATFORM)
    execution_cost DECIMAL(10,6) NOT NULL DEFAULT 0.00,
    token_usage_input INTEGER NOT NULL DEFAULT 0,
    token_usage_output INTEGER NOT NULL DEFAULT 0,
    total_tokens INTEGER GENERATED ALWAYS AS (token_usage_input + token_usage_output) STORED,
    cost_per_input_token DECIMAL(12,8) DEFAULT 0.00,
    cost_per_output_token DECIMAL(12,8) DEFAULT 0.00,
    
    -- PERFORMANCE METRICS
    execution_time_ms INTEGER NOT NULL DEFAULT 0,
    response_time_ms INTEGER,
    processing_time_ms INTEGER,
    
    -- EXECUTION STATUS & QUALITY
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, success, failed, retry, timeout
    log_level VARCHAR(20) NOT NULL DEFAULT 'INFO', -- DEBUG, INFO, WARN, ERROR, CRITICAL
    category VARCHAR(50) NOT NULL, -- WORKFLOW, AI_API, DATABASE, USER_ACTION, SYSTEM
    
    -- INTERRUPTION & BUG TRACKING
    interruption_count INTEGER NOT NULL DEFAULT 0,
    retry_count INTEGER NOT NULL DEFAULT 0,
    error_code VARCHAR(100),
    error_message TEXT,
    bug_category VARCHAR(100), -- rate_limit, timeout, api_error, validation_error, system_error
    
    -- CONTENT & CONTEXT
    message TEXT NOT NULL,
    details JSONB,
    input_data JSONB,
    output_data JSONB,
    
    -- WORKFLOW CONTEXT
    flow_name VARCHAR(255),
    node_type VARCHAR(100),
    workflow_type VARCHAR(100), -- top_notch_template, dfy_flow, custom_flow
    
    -- SYSTEM CONTEXT
    ip_address INET,
    user_agent TEXT,
    browser_info JSONB,
    
    -- QUALITY METRICS
    content_quality_score INTEGER CHECK (content_quality_score >= 0 AND content_quality_score <= 100),
    user_satisfaction_score INTEGER CHECK (user_satisfaction_score >= 0 AND user_satisfaction_score <= 100),
    
    -- BUSINESS METRICS
    revenue_generated DECIMAL(10,2) DEFAULT 0.00,
    profit_margin DECIMAL(5,2),
    
    -- MAINTENANCE FIELDS
    is_archived BOOLEAN DEFAULT FALSE,
    archive_date TIMESTAMP WITH TIME ZONE,
    
    -- FOREIGN KEY CONSTRAINTS
    CONSTRAINT fk_ai_model FOREIGN KEY (ai_model_id) REFERENCES ai_model_metadata(id),
    CONSTRAINT fk_ai_provider FOREIGN KEY (ai_provider_id) REFERENCES ai_providers(id),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_flow FOREIGN KEY (flow_id) REFERENCES ai_flows(id)
);

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_session_id ON system_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_execution_id ON system_logs(execution_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_engine_id ON system_logs(engine_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_ai_model ON system_logs(ai_model_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_ai_provider ON system_logs(ai_provider_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_status ON system_logs(status);
CREATE INDEX IF NOT EXISTS idx_system_logs_log_level ON system_logs(log_level);
CREATE INDEX IF NOT EXISTS idx_system_logs_category ON system_logs(category);
CREATE INDEX IF NOT EXISTS idx_system_logs_cost ON system_logs(execution_cost DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_performance ON system_logs(execution_time_ms);

-- COMPOSITE INDEXES FOR COMMON QUERIES
CREATE INDEX IF NOT EXISTS idx_system_logs_user_session ON system_logs(user_id, session_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_engine_execution ON system_logs(engine_id, execution_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_ai_model_provider ON system_logs(ai_model_id, ai_provider_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_cost_performance ON system_logs(execution_cost, execution_time_ms);
CREATE INDEX IF NOT EXISTS idx_system_logs_date_status ON system_logs(created_at, status);

-- PARTIAL INDEXES FOR ACTIVE DATA
CREATE INDEX IF NOT EXISTS idx_system_logs_active ON system_logs(created_at DESC) WHERE is_archived = FALSE;
CREATE INDEX IF NOT EXISTS idx_system_logs_errors ON system_logs(created_at DESC) WHERE log_level IN ('ERROR', 'CRITICAL');
CREATE INDEX IF NOT EXISTS idx_system_logs_costly ON system_logs(execution_cost DESC) WHERE execution_cost > 0.01;

-- JSONB INDEXES FOR DETAILED QUERIES
CREATE INDEX IF NOT EXISTS idx_system_logs_details_gin ON system_logs USING GIN(details);
CREATE INDEX IF NOT EXISTS idx_system_logs_input_data_gin ON system_logs USING GIN(input_data);
CREATE INDEX IF NOT EXISTS idx_system_logs_output_data_gin ON system_logs USING GIN(output_data);

-- TRIGGER FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_system_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_system_logs_updated_at
    BEFORE UPDATE ON system_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_system_logs_updated_at();

-- VIEWS FOR COMMON QUERIES

-- COST ANALYSIS VIEW
CREATE OR REPLACE VIEW v_cost_analysis AS
SELECT 
    DATE(created_at) as date,
    ai_provider_name,
    ai_model_name,
    engine_id,
    COUNT(*) as execution_count,
    SUM(execution_cost) as total_cost,
    AVG(execution_cost) as avg_cost_per_execution,
    SUM(token_usage_input) as total_input_tokens,
    SUM(token_usage_output) as total_output_tokens,
    SUM(total_tokens) as total_tokens,
    AVG(execution_time_ms) as avg_execution_time_ms,
    SUM(interruption_count) as total_interruptions
FROM system_logs
WHERE is_archived = FALSE
GROUP BY DATE(created_at), ai_provider_name, ai_model_name, engine_id
ORDER BY date DESC, total_cost DESC;

-- USER USAGE VIEW
CREATE OR REPLACE VIEW v_user_usage AS
SELECT 
    user_id,
    user_email,
    DATE(created_at) as date,
    COUNT(*) as execution_count,
    SUM(execution_cost) as total_cost,
    SUM(total_tokens) as total_tokens,
    AVG(execution_time_ms) as avg_execution_time_ms,
    SUM(interruption_count) as total_interruptions,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_executions
FROM system_logs
WHERE is_archived = FALSE
GROUP BY user_id, user_email, DATE(created_at)
ORDER BY date DESC, total_cost DESC;

-- PERFORMANCE MONITORING VIEW
CREATE OR REPLACE VIEW v_performance_monitoring AS
SELECT 
    DATE(created_at) as date,
    ai_provider_name,
    ai_model_name,
    engine_id,
    COUNT(*) as total_executions,
    COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_executions,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_executions,
    ROUND(
        (COUNT(CASE WHEN status = 'success' THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2
    ) as success_rate_percentage,
    AVG(execution_time_ms) as avg_execution_time_ms,
    MAX(execution_time_ms) as max_execution_time_ms,
    MIN(execution_time_ms) as min_execution_time_ms,
    SUM(interruption_count) as total_interruptions,
    AVG(interruption_count) as avg_interruptions_per_execution
FROM system_logs
WHERE is_archived = FALSE
GROUP BY DATE(created_at), ai_provider_name, ai_model_name, engine_id
ORDER BY date DESC, total_executions DESC;

-- ERROR ANALYSIS VIEW
CREATE OR REPLACE VIEW v_error_analysis AS
SELECT 
    DATE(created_at) as date,
    ai_provider_name,
    ai_model_name,
    error_code,
    bug_category,
    COUNT(*) as error_count,
    COUNT(DISTINCT user_id) as affected_users,
    COUNT(DISTINCT session_id) as affected_sessions,
    SUM(execution_cost) as cost_of_errors,
    AVG(execution_time_ms) as avg_time_before_error
FROM system_logs
WHERE log_level IN ('ERROR', 'CRITICAL') AND is_archived = FALSE
GROUP BY DATE(created_at), ai_provider_name, ai_model_name, error_code, bug_category
ORDER BY date DESC, error_count DESC;

-- RLS POLICIES
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- SuperAdmin can see all logs
CREATE POLICY "SuperAdmin can view all logs" ON system_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'superadmin'
        )
    );

-- Users can only see their own logs
CREATE POLICY "Users can view own logs" ON system_logs
    FOR SELECT USING (user_id = auth.uid());

-- INSERT POLICY - Only authenticated users can insert logs
CREATE POLICY "Authenticated users can insert logs" ON system_logs
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE POLICY - Only SuperAdmin can update logs
CREATE POLICY "SuperAdmin can update logs" ON system_logs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'superadmin'
        )
    );

-- DELETE POLICY - Only SuperAdmin can delete logs
CREATE POLICY "SuperAdmin can delete logs" ON system_logs
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'superadmin'
        )
    );

-- COMMENTS
COMMENT ON TABLE system_logs IS 'Comprehensive logging system for Lekhika platform - tracks AI usage, costs, performance, and execution details';
COMMENT ON COLUMN system_logs.ai_model_id IS 'UNREMOVABLE: References ai_model_metadata.id';
COMMENT ON COLUMN system_logs.ai_provider_id IS 'UNREMOVABLE: References ai_providers.id';
COMMENT ON COLUMN system_logs.ai_model_name IS 'UNREMOVABLE: Exact AI model name (gpt-4, claude-3, etc.)';
COMMENT ON COLUMN system_logs.execution_cost IS 'Actual USD cost for this execution';
COMMENT ON COLUMN system_logs.interruption_count IS 'Number of times execution was interrupted by bugs/errors';
COMMENT ON COLUMN system_logs.execution_id IS 'Unique identifier for each execution session';

-- SAMPLE DATA FOR TESTING (OPTIONAL - REMOVE IN PRODUCTION)
-- INSERT INTO system_logs (
--     ai_model_id, ai_provider_id, ai_model_name, ai_provider_name,
--     engine_id, execution_id, user_id, session_id,
--     execution_cost, token_usage_input, token_usage_output,
--     execution_time_ms, status, log_level, category,
--     message, flow_name, node_type
-- ) VALUES (
--     (SELECT id FROM ai_model_metadata WHERE model_name = 'gpt-4' LIMIT 1),
--     (SELECT id FROM ai_providers WHERE name = 'OpenAI' LIMIT 1),
--     'gpt-4',
--     'OpenAI',
--     'content-writer-business',
--     'exec_12345',
--     (SELECT id FROM users WHERE role = 'superadmin' LIMIT 1),
--     'session_67890',
--     0.045,
--     1500,
--      800,
--     2500,
--     'success',
--     'INFO',
--     'WORKFLOW',
--     'Content generation completed successfully',
--     'Business Mastery Guide',
--     'content_writer'
-- );
