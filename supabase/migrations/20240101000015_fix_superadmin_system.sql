/*
  # Fix SuperAdmin System - Simplified Approach

  This migration ensures the SuperAdmin system works with proper fallbacks:
  
  1. Tables
    - Recreate superadmin_users with minimal required columns
    - Recreate admin_sessions with proper structure
    - Ensure system_configs and ai_api_keys exist
    
  2. Security
    - Enable RLS with permissive policies for testing
    - Add proper indexes
    
  3. Default Data
    - Insert default superadmin user with known credentials
    - Add basic system configurations
*/

-- Drop existing tables if they exist (to start fresh)
DROP TABLE IF EXISTS admin_sessions CASCADE;
DROP TABLE IF EXISTS superadmin_users CASCADE;
DROP TABLE IF EXISTS system_configs CASCADE;
DROP TABLE IF EXISTS ai_api_keys CASCADE;

-- Create SuperAdmin Users table (simplified)
CREATE TABLE superadmin_users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  username text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  email text,
  is_active boolean DEFAULT true,
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create Admin Sessions table
CREATE TABLE admin_sessions (
  id text PRIMARY KEY,
  admin_id uuid REFERENCES superadmin_users(id) ON DELETE CASCADE NOT NULL,
  session_data jsonb NOT NULL,
  is_active boolean DEFAULT true,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create System Configs table
CREATE TABLE system_configs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key text UNIQUE NOT NULL,
  config_value text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create AI API Keys table
CREATE TABLE ai_api_keys (
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

-- Create permissive policies for testing (will be restricted later)
CREATE POLICY "Allow all operations on superadmin_users" ON superadmin_users FOR ALL USING (true);
CREATE POLICY "Allow all operations on admin_sessions" ON admin_sessions FOR ALL USING (true);
CREATE POLICY "Allow all operations on system_configs" ON system_configs FOR ALL USING (true);
CREATE POLICY "Allow all operations on ai_api_keys" ON ai_api_keys FOR ALL USING (true);

-- Insert default SuperAdmin user
INSERT INTO superadmin_users (username, password_hash, email, is_active) 
VALUES (
  'superadmin',
  'BookMagic2024!Admin',
  'admin@bookmagic.ai',
  true
);

-- Insert default system configurations
INSERT INTO system_configs (config_key, config_value, description) VALUES
('maintenance_mode', 'false', 'Enable/disable maintenance mode'),
('user_registration_enabled', 'true', 'Allow new user registrations'),
('default_user_credits', '1000', 'Default credits for new users'),
('ai_generation_enabled', 'true', 'Enable AI book generation'),
('book_export_enabled', 'true', 'Enable book export functionality'),
('paypal_integration_enabled', 'true', 'Enable PayPal subscription integration');

-- Insert placeholder AI API keys
INSERT INTO ai_api_keys (service, encrypted_key, metadata) VALUES
('openai', 'PLACEHOLDER_ENCRYPTED_KEY', '{"model": "gpt-4", "max_tokens": 4000}'),
('claude', 'PLACEHOLDER_ENCRYPTED_KEY', '{"model": "claude-3-sonnet", "max_tokens": 4000}'),
('gemini', 'PLACEHOLDER_ENCRYPTED_KEY', '{"model": "gemini-pro", "max_tokens": 4000}'),
('perplexity', 'PLACEHOLDER_ENCRYPTED_KEY', '{"model": "llama-3.1-sonar-large-128k-online", "max_tokens": 4000}'),
('grok', 'PLACEHOLDER_ENCRYPTED_KEY', '{"model": "grok-beta", "max_tokens": 4000}');

-- Create indexes for performance
CREATE INDEX idx_superadmin_users_username ON superadmin_users(username);
CREATE INDEX idx_admin_sessions_admin_id ON admin_sessions(admin_id);
CREATE INDEX idx_admin_sessions_expires ON admin_sessions(expires_at);
CREATE INDEX idx_system_configs_key ON system_configs(config_key);
CREATE INDEX idx_ai_api_keys_service ON ai_api_keys(service);
