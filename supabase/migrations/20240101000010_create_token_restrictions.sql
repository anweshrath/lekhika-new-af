-- Token Restriction System Migration
-- This creates the tables needed for enforcing token limits

-- User Token Usage Tracking
CREATE TABLE IF NOT EXISTS user_token_usage (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    tokens_used INTEGER NOT NULL DEFAULT 0,
    operation_type VARCHAR(50) NOT NULL DEFAULT 'book_generation',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Custom Token Limits (for admin overrides)
CREATE TABLE IF NOT EXISTS user_custom_limits (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    custom_limits JSONB NOT NULL DEFAULT '{}',
    updated_by INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Admin Actions Log
CREATE TABLE IF NOT EXISTS admin_actions (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_type VARCHAR(100) NOT NULL,
    target_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Token Usage Analytics (for reporting)
CREATE TABLE IF NOT EXISTS token_usage_analytics (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    hourly_usage INTEGER DEFAULT 0,
    daily_usage INTEGER DEFAULT 0,
    monthly_usage INTEGER DEFAULT 0,
    plan_type VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_token_usage_user_id ON user_token_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_user_token_usage_created_at ON user_token_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_user_token_usage_operation ON user_token_usage(operation_type);

CREATE INDEX IF NOT EXISTS idx_user_custom_limits_user_id ON user_custom_limits(user_id);

CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_target_user ON admin_actions(target_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON admin_actions(created_at);

CREATE INDEX IF NOT EXISTS idx_token_analytics_user_date ON token_usage_analytics(user_id, date);
CREATE INDEX IF NOT EXISTS idx_token_analytics_date ON token_usage_analytics(date);

-- Function to automatically update analytics
CREATE OR REPLACE FUNCTION update_token_analytics()
RETURNS TRIGGER AS $$
BEGIN
    -- Insert or update daily analytics
    INSERT INTO token_usage_analytics (user_id, date, hourly_usage, daily_usage, monthly_usage, plan_type)
    SELECT 
        NEW.user_id,
        CURRENT_DATE,
        COALESCE(SUM(CASE WHEN created_at >= DATE_TRUNC('hour', NOW()) THEN tokens_used ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN created_at >= DATE_TRUNC('day', NOW()) THEN tokens_used ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN created_at >= DATE_TRUNC('month', NOW()) THEN tokens_used ELSE 0 END), 0),
        COALESCE((SELECT plan FROM users WHERE id = NEW.user_id), 'starter')
    FROM user_token_usage 
    WHERE user_id = NEW.user_id
    ON CONFLICT (user_id, date) 
    DO UPDATE SET 
        hourly_usage = EXCLUDED.hourly_usage,
        daily_usage = EXCLUDED.daily_usage,
        monthly_usage = EXCLUDED.monthly_usage,
        plan_type = EXCLUDED.plan_type;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update analytics when token usage is recorded
CREATE TRIGGER trigger_update_token_analytics
    AFTER INSERT ON user_token_usage
    FOR EACH ROW
    EXECUTE FUNCTION update_token_analytics();

-- Function to check token limits (can be called from application)
CREATE OR REPLACE FUNCTION check_token_limits(
    p_user_id INTEGER,
    p_requested_tokens INTEGER
)
RETURNS JSON AS $$
DECLARE
    user_plan VARCHAR(20);
    current_usage JSON;
    limits JSON;
    result JSON;
BEGIN
    -- Get user plan
    SELECT COALESCE(plan, 'starter') INTO user_plan
    FROM users 
    WHERE id = p_user_id;
    
    -- Get current usage
    SELECT json_build_object(
        'hourly', COALESCE(SUM(CASE WHEN created_at >= DATE_TRUNC('hour', NOW()) THEN tokens_used ELSE 0 END), 0),
        'daily', COALESCE(SUM(CASE WHEN created_at >= DATE_TRUNC('day', NOW()) THEN tokens_used ELSE 0 END), 0),
        'monthly', COALESCE(SUM(CASE WHEN created_at >= DATE_TRUNC('month', NOW()) THEN tokens_used ELSE 0 END), 0)
    ) INTO current_usage
    FROM user_token_usage 
    WHERE user_id = p_user_id;
    
    -- Get limits based on plan
    SELECT json_build_object(
        'hourly', CASE 
            WHEN user_plan = 'starter' THEN 2000
            WHEN user_plan = 'pro' THEN 5000
            WHEN user_plan = 'enterprise' THEN 20000
            ELSE 2000
        END,
        'daily', CASE 
            WHEN user_plan = 'starter' THEN 5000
            WHEN user_plan = 'pro' THEN 25000
            WHEN user_plan = 'enterprise' THEN 100000
            ELSE 5000
        END,
        'monthly', CASE 
            WHEN user_plan = 'starter' THEN 100000
            WHEN user_plan = 'pro' THEN 500000
            WHEN user_plan = 'enterprise' THEN 2000000
            ELSE 100000
        END
    ) INTO limits;
    
    -- Check if request is allowed
    IF (current_usage->>'hourly')::INTEGER + p_requested_tokens > (limits->>'hourly')::INTEGER THEN
        result := json_build_object(
            'allowed', false,
            'reason', 'Hourly limit exceeded',
            'limit_type', 'hourly',
            'current_usage', (current_usage->>'hourly')::INTEGER,
            'limit', (limits->>'hourly')::INTEGER
        );
    ELSIF (current_usage->>'daily')::INTEGER + p_requested_tokens > (limits->>'daily')::INTEGER THEN
        result := json_build_object(
            'allowed', false,
            'reason', 'Daily limit exceeded',
            'limit_type', 'daily',
            'current_usage', (current_usage->>'daily')::INTEGER,
            'limit', (limits->>'daily')::INTEGER
        );
    ELSIF (current_usage->>'monthly')::INTEGER + p_requested_tokens > (limits->>'monthly')::INTEGER THEN
        result := json_build_object(
            'allowed', false,
            'reason', 'Monthly limit exceeded',
            'limit_type', 'monthly',
            'current_usage', (current_usage->>'monthly')::INTEGER,
            'limit', (limits->>'monthly')::INTEGER
        );
    ELSE
        result := json_build_object(
            'allowed', true,
            'reason', 'All limits OK',
            'current_usage', current_usage,
            'limits', limits,
            'remaining', json_build_object(
                'hourly', (limits->>'hourly')::INTEGER - (current_usage->>'hourly')::INTEGER - p_requested_tokens,
                'daily', (limits->>'daily')::INTEGER - (current_usage->>'daily')::INTEGER - p_requested_tokens,
                'monthly', (limits->>'monthly')::INTEGER - (current_usage->>'monthly')::INTEGER - p_requested_tokens
            )
        );
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON user_token_usage TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON user_custom_limits TO authenticated;
GRANT SELECT, INSERT ON admin_actions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON token_usage_analytics TO authenticated;

-- Grant execute permission on functions
GRANT EXECUTE ON FUNCTION check_token_limits(INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION update_token_analytics() TO authenticated;
