/*
  # System Configurations Migration

  This migration adds complete database-driven configuration system including:
  
  1. New Tables
    - `system_configs` - All system-wide configurations
    - `ai_api_keys` - Encrypted AI service API keys
    - `superadmin_users` - SuperAdmin authentication
    - `admin_sessions` - SuperAdmin session management

  2. Security
    - Encrypted storage for sensitive data
    - Proper RLS policies
    - Session management

  3. Configuration Management
    - AI service configurations
    - System settings
    - Feature flags
    - SuperAdmin credentials
*/

-- 1. SYSTEM CONFIGURATIONS TABLE
CREATE TABLE IF NOT EXISTS system_configs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key text UNIQUE NOT NULL,
  config_value jsonb NOT NULL,
  config_type text DEFAULT 'general' CHECK (config_type IN ('general', 'ai_service', 'feature_flag', 'security')),
  is_encrypted boolean DEFAULT false,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. AI API KEYS TABLE
CREATE TABLE IF NOT EXISTS ai_api_keys (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name text UNIQUE NOT NULL CHECK (service_name IN ('openai', 'claude', 'gemini', 'grok', 'perplexity')),
  encrypted_api_key text NOT NULL,
  is_active boolean DEFAULT true,
  rate_limit_per_minute integer DEFAULT 60,
  rate_limit_per_day integer DEFAULT 1000,
  last_used timestamptz,
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. SUPERADMIN USERS TABLE
CREATE TABLE IF NOT EXISTS superadmin_users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  email text,
  is_active boolean DEFAULT true,
  last_login timestamptz,
  login_attempts integer DEFAULT 0,
  locked_until timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. ADMIN SESSIONS TABLE
CREATE TABLE IF NOT EXISTS admin_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  superadmin_id uuid REFERENCES superadmin_users(id) ON DELETE CASCADE NOT NULL,
  session_token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  ip_address text,
  user_agent text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE system_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE superadmin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES - Only SuperAdmin can access these tables
CREATE POLICY "Only superadmin can access system configs" ON system_configs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_sessions 
      WHERE session_token = current_setting('request.jwt.claims', true)::json->>'session_token'
      AND expires_at > now()
      AND is_active = true
    )
  );

CREATE POLICY "Only superadmin can access AI keys" ON ai_api_keys
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_sessions 
      WHERE session_token = current_setting('request.jwt.claims', true)::json->>'session_token'
      AND expires_at > now()
      AND is_active = true
    )
  );

CREATE POLICY "Only superadmin can access superadmin users" ON superadmin_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_sessions 
      WHERE session_token = current_setting('request.jwt.claims', true)::json->>'session_token'
      AND expires_at > now()
      AND is_active = true
    )
  );

CREATE POLICY "Only superadmin can access admin sessions" ON admin_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_sessions active_session
      WHERE active_session.session_token = current_setting('request.jwt.claims', true)::json->>'session_token'
      AND active_session.expires_at > now()
      AND active_session.is_active = true
    )
  );

-- INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_system_configs_key ON system_configs(config_key);
CREATE INDEX IF NOT EXISTS idx_system_configs_type ON system_configs(config_type);
CREATE INDEX IF NOT EXISTS idx_ai_api_keys_service ON ai_api_keys(service_name);
CREATE INDEX IF NOT EXISTS idx_ai_api_keys_active ON ai_api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_superadmin_username ON superadmin_users(username);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);

-- TRIGGERS FOR UPDATED_AT
CREATE TRIGGER update_system_configs_updated_at 
  BEFORE UPDATE ON system_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_api_keys_updated_at 
  BEFORE UPDATE ON ai_api_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_superadmin_users_updated_at 
  BEFORE UPDATE ON superadmin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- INSERT DEFAULT SUPERADMIN USER (password: BookMagic2024!Admin)
INSERT INTO superadmin_users (username, password_hash, email, is_active) VALUES
('superadmin', '$2b$12$LQv3c1yqBWVHxkd0LQ4lqemeH.GQCqrjxbvygy/GYb9FdzaHpjdWi', 'admin@bookmagic.ai', true);

-- INSERT DEFAULT AI API KEYS (encrypted placeholders - will be updated via admin panel)
INSERT INTO ai_api_keys (service_name, encrypted_api_key, is_active) VALUES
('openai', 'encrypted_placeholder_openai', true),
('claude', 'encrypted_placeholder_claude', true),
('gemini', 'encrypted_placeholder_gemini', true),
('grok', 'encrypted_placeholder_grok', false),
('perplexity', 'encrypted_placeholder_perplexity', false);

-- INSERT DEFAULT SYSTEM CONFIGURATIONS
INSERT INTO system_configs (config_key, config_value, config_type, description) VALUES
('app_name', '"BookMagic AI"', 'general', 'Application name'),
('app_version', '"1.0.0"', 'general', 'Current application version'),
('maintenance_mode', 'false', 'general', 'Enable/disable maintenance mode'),
('max_books_per_user', '50', 'general', 'Maximum books per user'),
('default_user_credits', '1000', 'general', 'Default credits for new users'),
('ai_generation_enabled', 'true', 'feature_flag', 'Enable AI content generation'),
('multi_llm_enabled', 'true', 'feature_flag', 'Enable multi-LLM generation'),
('user_registration_enabled', 'true', 'feature_flag', 'Allow new user registrations'),
('paypal_sandbox_mode', 'true', 'general', 'PayPal sandbox mode'),
('session_timeout_hours', '24', 'security', 'Admin session timeout in hours'),
('max_login_attempts', '5', 'security', 'Maximum login attempts before lockout'),
('lockout_duration_minutes', '30', 'security', 'Account lockout duration');
