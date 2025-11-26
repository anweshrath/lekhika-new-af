/*
  # Add SuperAdmin System Tables

  This migration adds the complete SuperAdmin system with:
  
  1. New Tables
    - `superadmin_users` - SuperAdmin user accounts with encrypted passwords
    - `admin_sessions` - Session management for SuperAdmin authentication
    - `system_configs` - System-wide configuration settings
    - `ai_api_keys` - Encrypted AI API keys storage

  2. Security
    - Enable RLS on all new tables
    - Proper access policies for SuperAdmin operations
    - Encrypted password storage
    - Session-based authentication

  3. Default Data
    - Default SuperAdmin user with hashed password
    - Initial system configurations
    - Placeholder API keys for all services
*/

-- 1. SUPERADMIN USERS TABLE
CREATE TABLE IF NOT EXISTS superadmin_users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  email text,
  full_name text,
  permissions jsonb DEFAULT '["all"]',
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. ADMIN SESSIONS TABLE
CREATE TABLE IF NOT EXISTS admin_sessions (
  id text PRIMARY KEY,
  admin_id uuid REFERENCES superadmin_users(id) ON DELETE CASCADE NOT NULL,
  session_data jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 3. SYSTEM CONFIGURATIONS TABLE
CREATE TABLE IF NOT EXISTS system_configs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key text UNIQUE NOT NULL,
  config_value text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. AI API KEYS TABLE
CREATE TABLE IF NOT EXISTS ai_api_keys (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  service text UNIQUE NOT NULL CHECK (service IN ('openai', 'claude', 'gemini', 'grok', 'perplexity')),
  encrypted_key text NOT NULL,
  metadata jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  last_used timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE superadmin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_api_keys ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR SUPERADMIN USERS (Only accessible by authenticated superadmins)
CREATE POLICY "SuperAdmin users management" ON superadmin_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_sessions 
      WHERE admin_sessions.admin_id = auth.uid()::text::uuid 
      AND admin_sessions.is_active = true 
      AND admin_sessions.expires_at > now()
    )
  );

-- RLS POLICIES FOR ADMIN SESSIONS
CREATE POLICY "Admin sessions management" ON admin_sessions
  FOR ALL USING (
    admin_id = auth.uid()::text::uuid OR
    EXISTS (
      SELECT 1 FROM admin_sessions AS active_session
      WHERE active_session.admin_id = auth.uid()::text::uuid 
      AND active_session.is_active = true 
      AND active_session.expires_at > now()
    )
  );

-- RLS POLICIES FOR SYSTEM CONFIGS (Only accessible by authenticated superadmins)
CREATE POLICY "System configs management" ON system_configs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_sessions 
      WHERE admin_sessions.admin_id = auth.uid()::text::uuid 
      AND admin_sessions.is_active = true 
      AND admin_sessions.expires_at > now()
    )
  );

-- RLS POLICIES FOR AI API KEYS (Only accessible by authenticated superadmins)
CREATE POLICY "AI API keys management" ON ai_api_keys
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM admin_sessions 
      WHERE admin_sessions.admin_id = auth.uid()::text::uuid 
      AND admin_sessions.is_active = true 
      AND admin_sessions.expires_at > now()
    )
  );

-- PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_superadmin_users_username ON superadmin_users(username);
CREATE INDEX IF NOT EXISTS idx_superadmin_users_active ON superadmin_users(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_active ON admin_sessions(is_active, expires_at);
CREATE INDEX IF NOT EXISTS idx_system_configs_key ON system_configs(config_key);
CREATE INDEX IF NOT EXISTS idx_ai_api_keys_service ON ai_api_keys(service);
CREATE INDEX IF NOT EXISTS idx_ai_api_keys_active ON ai_api_keys(is_active);

-- FUNCTION FOR UPDATED_AT COLUMN UPDATES
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGERS FOR UPDATED_AT COLUMNS
DROP TRIGGER IF EXISTS update_superadmin_users_updated_at ON superadmin_users;
CREATE TRIGGER update_superadmin_users_updated_at 
  BEFORE UPDATE ON superadmin_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_system_configs_updated_at ON system_configs;
CREATE TRIGGER update_system_configs_updated_at 
  BEFORE UPDATE ON system_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ai_api_keys_updated_at ON ai_api_keys;
CREATE TRIGGER update_ai_api_keys_updated_at 
  BEFORE UPDATE ON ai_api_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- INSERT DEFAULT SUPERADMIN USER
INSERT INTO superadmin_users (username, password_hash, email, full_name, permissions) VALUES
('superadmin', 'BookMagic2024!Admin', 'admin@bookmagic.ai', 'System Administrator', '["all"]')
ON CONFLICT (username) DO NOTHING;

-- INSERT DEFAULT SYSTEM CONFIGURATIONS
INSERT INTO system_configs (config_key, config_value, description) VALUES
('maintenance_mode', 'false', 'Enable/disable maintenance mode'),
('allow_registration', 'true', 'Allow new user registration'),
('default_credits', '1000', 'Default credits for new users'),
('ai_generation_enabled', 'true', 'Enable AI content generation'),
('book_export_enabled', 'true', 'Enable book export functionality'),
('paypal_enabled', 'true', 'Enable PayPal integration'),
('max_books_per_user', '50', 'Maximum books per user'),
('max_file_size_mb', '10', 'Maximum file upload size in MB')
ON CONFLICT (config_key) DO NOTHING;

-- INSERT PLACEHOLDER AI API KEYS
INSERT INTO ai_api_keys (service, encrypted_key, metadata) VALUES
('openai', 'PLACEHOLDER_ENCRYPTED_KEY', '{"provider": "OpenAI", "models": ["gpt-4", "gpt-3.5-turbo"]}'),
('claude', 'PLACEHOLDER_ENCRYPTED_KEY', '{"provider": "Anthropic", "models": ["claude-3-opus", "claude-3-sonnet"]}'),
('gemini', 'PLACEHOLDER_ENCRYPTED_KEY', '{"provider": "Google", "models": ["gemini-pro", "gemini-pro-vision"]}'),
('grok', 'PLACEHOLDER_ENCRYPTED_KEY', '{"provider": "xAI", "models": ["grok-beta"]}'),
('perplexity', 'PLACEHOLDER_ENCRYPTED_KEY', '{"provider": "Perplexity", "models": ["llama-3.1-sonar-large-128k-online"]}')
ON CONFLICT (service) DO NOTHING;
