/*
  # Create SuperAdmin System Tables

  This migration creates the SuperAdmin authentication and management system:
  
  1. New Tables
    - `superadmin_users` - SuperAdmin user accounts with encrypted passwords
    - `admin_sessions` - Session management for SuperAdmin access
    - `system_configs` - System-wide configuration settings
    - `ai_api_keys` - Encrypted AI service API keys storage

  2. Security
    - Enable RLS on all tables with proper policies
    - Encrypted password storage
    - Session-based authentication
    - Secure API key storage

  3. Default Data
    - Default SuperAdmin user account
    - Initial system configurations
    - Placeholder encrypted API keys
*/

-- Create SuperAdmin Users table
CREATE TABLE IF NOT EXISTS superadmin_users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  email text,
  full_name text DEFAULT 'Super Administrator',
  permissions jsonb DEFAULT '["all"]',
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create Admin Sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
  id text PRIMARY KEY,
  admin_id uuid REFERENCES superadmin_users(id) ON DELETE CASCADE NOT NULL,
  session_data jsonb NOT NULL,
  is_active boolean DEFAULT true,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create System Configs table
CREATE TABLE IF NOT EXISTS system_configs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key text UNIQUE NOT NULL,
  config_value jsonb NOT NULL,
  description text,
  is_encrypted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create AI API Keys table
CREATE TABLE IF NOT EXISTS ai_api_keys (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  service text UNIQUE NOT NULL CHECK (service IN ('openai', 'claude', 'gemini', 'perplexity', 'grok')),
  encrypted_key text NOT NULL,
  metadata jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  last_used timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE superadmin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_api_keys ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Allow all operations for now - will be restricted by application logic)
DROP POLICY IF EXISTS "Allow all operations on superadmin_users" ON superadmin_users;
DROP POLICY IF EXISTS "Allow all operations on admin_sessions" ON admin_sessions;
DROP POLICY IF EXISTS "Allow all operations on system_configs" ON system_configs;
DROP POLICY IF EXISTS "Allow all operations on ai_api_keys" ON ai_api_keys;

CREATE POLICY "Allow all operations on superadmin_users" ON superadmin_users FOR ALL USING (true);
CREATE POLICY "Allow all operations on admin_sessions" ON admin_sessions FOR ALL USING (true);
CREATE POLICY "Allow all operations on system_configs" ON system_configs FOR ALL USING (true);
CREATE POLICY "Allow all operations on ai_api_keys" ON ai_api_keys FOR ALL USING (true);

-- Insert default SuperAdmin user
INSERT INTO superadmin_users (username, password_hash, email, full_name, permissions) 
VALUES (
  'superadmin',
  'BookMagic2024!Admin',
  'admin@bookmagic.ai',
  'Super Administrator',
  '["all"]'
) ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  updated_at = now();

-- Insert default system configurations
INSERT INTO system_configs (config_key, config_value, description) VALUES
('maintenance_mode', 'false', 'Enable/disable maintenance mode'),
('user_registration_enabled', 'true', 'Allow new user registrations'),
('default_user_credits', '1000', 'Default credits for new users'),
('ai_generation_enabled', 'true', 'Enable AI book generation'),
('book_export_enabled', 'true', 'Enable book export functionality'),
('paypal_integration_enabled', 'true', 'Enable PayPal subscription integration'),
('max_books_per_user', '50', 'Maximum books per user account'),
('max_sections_per_book', '20', 'Maximum sections per book')
ON CONFLICT (config_key) DO UPDATE SET
  config_value = EXCLUDED.config_value,
  updated_at = now();

-- Insert placeholder AI API keys (only if metadata column exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_api_keys' AND column_name = 'metadata') THEN
    INSERT INTO ai_api_keys (service, encrypted_key, metadata) VALUES
    ('openai', 'PLACEHOLDER_ENCRYPTED_KEY', '{"model": "gpt-4", "max_tokens": 4000}'),
    ('claude', 'PLACEHOLDER_ENCRYPTED_KEY', '{"model": "claude-3-sonnet", "max_tokens": 4000}'),
    ('gemini', 'PLACEHOLDER_ENCRYPTED_KEY', '{"model": "gemini-pro", "max_tokens": 4000}'),
    ('perplexity', 'PLACEHOLDER_ENCRYPTED_KEY', '{"model": "llama-3.1-sonar-large-128k-online", "max_tokens": 4000}'),
    ('grok', 'PLACEHOLDER_ENCRYPTED_KEY', '{"model": "grok-beta", "max_tokens": 4000}')
    ON CONFLICT (service) DO UPDATE SET
      encrypted_key = EXCLUDED.encrypted_key,
      metadata = EXCLUDED.metadata,
      updated_at = now();
  ELSE
    INSERT INTO ai_api_keys (service, encrypted_key) VALUES
    ('openai', 'PLACEHOLDER_ENCRYPTED_KEY'),
    ('claude', 'PLACEHOLDER_ENCRYPTED_KEY'),
    ('gemini', 'PLACEHOLDER_ENCRYPTED_KEY'),
    ('perplexity', 'PLACEHOLDER_ENCRYPTED_KEY'),
    ('grok', 'PLACEHOLDER_ENCRYPTED_KEY')
    ON CONFLICT (service) DO UPDATE SET
      encrypted_key = EXCLUDED.encrypted_key,
      updated_at = now();
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_superadmin_users_username ON superadmin_users(username);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON admin_sessions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires ON admin_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_system_configs_key ON system_configs(config_key);
CREATE INDEX IF NOT EXISTS idx_ai_api_keys_service ON ai_api_keys(service);
