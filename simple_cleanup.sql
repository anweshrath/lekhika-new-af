-- =====================================================
-- SIMPLE SUPERADMIN SYSTEM CLEANUP
-- This script safely cleans up and recreates the SuperAdmin system
-- Handles cases where tables might not exist yet
-- =====================================================

-- 1. SAFELY DROP EXISTING TABLES (IF THEY EXIST)
DROP TABLE IF EXISTS admin_sessions CASCADE;
DROP TABLE IF EXISTS superadmin_users CASCADE;
DROP TABLE IF EXISTS system_configs CASCADE;
DROP TABLE IF EXISTS ai_api_keys CASCADE;
DROP TABLE IF EXISTS ai_providers CASCADE;

-- 2. CREATE SUPERADMIN USERS TABLE
CREATE TABLE superadmin_users (
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

-- 3. CREATE ADMIN SESSIONS TABLE
CREATE TABLE admin_sessions (
  id text PRIMARY KEY,
  admin_id uuid REFERENCES superadmin_users(id) ON DELETE CASCADE NOT NULL,
  session_data jsonb NOT NULL,
  is_active boolean DEFAULT true,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 4. CREATE SYSTEM CONFIGS TABLE
CREATE TABLE system_configs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key text UNIQUE NOT NULL,
  config_value jsonb NOT NULL,
  description text,
  is_encrypted boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. CREATE AI API KEYS TABLE
CREATE TABLE ai_api_keys (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  service text UNIQUE NOT NULL CHECK (service IN ('openai', 'claude', 'gemini', 'perplexity', 'grok', 'mistral', 'cohere', 'stable_diffusion', 'elevenlabs')),
  encrypted_key text NOT NULL,
  metadata jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  last_used timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 6. CREATE AI PROVIDERS TABLE
CREATE TABLE ai_providers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL CHECK (provider IN ('openai', 'claude', 'gemini', 'perplexity', 'grok', 'mistral', 'cohere', 'stable_diffusion', 'elevenlabs')),
  name text NOT NULL,
  api_key text NOT NULL,
  description text,
  failures integer DEFAULT 0,
  usage_count integer DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(name)
);

-- 7. ENABLE RLS ON ALL TABLES
ALTER TABLE superadmin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_providers ENABLE ROW LEVEL SECURITY;

-- 8. CREATE PERMISSIVE RLS POLICIES
CREATE POLICY "Allow all operations on superadmin_users" ON superadmin_users FOR ALL USING (true);
CREATE POLICY "Allow all operations on admin_sessions" ON admin_sessions FOR ALL USING (true);
CREATE POLICY "Allow all operations on system_configs" ON system_configs FOR ALL USING (true);
CREATE POLICY "Allow all operations on ai_api_keys" ON ai_api_keys FOR ALL USING (true);
CREATE POLICY "Allow all operations on ai_providers" ON ai_providers FOR ALL USING (true);

-- 9. CREATE PERFORMANCE INDEXES
CREATE INDEX idx_superadmin_users_username ON superadmin_users(username);
CREATE INDEX idx_superadmin_users_active ON superadmin_users(is_active);
CREATE INDEX idx_admin_sessions_admin_id ON admin_sessions(admin_id);
CREATE INDEX idx_admin_sessions_active ON admin_sessions(is_active, expires_at);
CREATE INDEX idx_system_configs_key ON system_configs(config_key);
CREATE INDEX idx_ai_api_keys_service ON ai_api_keys(service);
CREATE INDEX idx_ai_api_keys_active ON ai_api_keys(is_active);
CREATE INDEX idx_ai_providers_user_id ON ai_providers(user_id);
CREATE INDEX idx_ai_providers_provider ON ai_providers(provider);
CREATE INDEX idx_ai_providers_name ON ai_providers(name);
CREATE INDEX idx_ai_providers_active ON ai_providers(is_active);

-- 10. INSERT DEFAULT SUPERADMIN USER
INSERT INTO superadmin_users (username, password_hash, email, full_name, permissions, is_active) 
VALUES (
  'superadmin',
  'BookMagic2024!Admin',
  'admin@bookmagic.ai',
  'Super Administrator',
  '["all"]',
  true
);

-- 11. INSERT DEFAULT SYSTEM CONFIGURATIONS
INSERT INTO system_configs (config_key, config_value, description) VALUES
('maintenance_mode', 'false', 'Enable/disable maintenance mode'),
('user_registration_enabled', 'true', 'Allow new user registrations'),
('default_user_credits', '1000', 'Default credits for new users'),
('ai_generation_enabled', 'true', 'Enable AI book generation'),
('book_export_enabled', 'true', 'Enable book export functionality'),
('paypal_integration_enabled', 'true', 'Enable PayPal subscription integration'),
('max_books_per_user', '50', 'Maximum books per user account'),
('ai_rate_limit_per_minute', '60', 'AI API rate limit per minute'),
('ai_rate_limit_per_day', '1000', 'AI API rate limit per day'),
('session_timeout_hours', '24', 'SuperAdmin session timeout in hours');

-- 12. INSERT PLACEHOLDER AI API KEYS
INSERT INTO ai_api_keys (service, encrypted_key, metadata) VALUES
('openai', 'PLACEHOLDER_ENCRYPTED_KEY', '{"model": "gpt-4", "max_tokens": 4000}'),
('claude', 'PLACEHOLDER_ENCRYPTED_KEY', '{"model": "claude-3-sonnet", "max_tokens": 4000}'),
('gemini', 'PLACEHOLDER_ENCRYPTED_KEY', '{"model": "gemini-pro", "max_tokens": 4000}'),
('perplexity', 'PLACEHOLDER_ENCRYPTED_KEY', '{"model": "llama-3.1-8b-instruct", "max_tokens": 4000}'),
('grok', 'PLACEHOLDER_ENCRYPTED_KEY', '{"model": "grok-beta", "max_tokens": 4000}'),
('mistral', 'PLACEHOLDER_ENCRYPTED_KEY', '{"model": "mistral-large-latest", "max_tokens": 4000}'),
('cohere', 'PLACEHOLDER_ENCRYPTED_KEY', '{"model": "command-r-plus", "max_tokens": 4000}'),
('stable_diffusion', 'PLACEHOLDER_ENCRYPTED_KEY', '{"model": "sd-xl-1.0", "max_tokens": 1000}'),
('elevenlabs', 'PLACEHOLDER_ENCRYPTED_KEY', '{"model": "eleven_multilingual_v2", "max_tokens": 1000}');

-- 13. VERIFICATION QUERIES
SELECT 'Tables created successfully!' as status;

-- Check table structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('superadmin_users', 'admin_sessions', 'system_configs', 'ai_api_keys', 'ai_providers')
ORDER BY table_name, ordinal_position;

-- Check RLS policies
SELECT 
  schemaname,
  tablename,
  policyname
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('superadmin_users', 'admin_sessions', 'system_configs', 'ai_api_keys', 'ai_providers');

-- Check data insertion
SELECT 'superadmin_users' as table_name, COUNT(*) as record_count FROM superadmin_users
UNION ALL
SELECT 'system_configs', COUNT(*) FROM system_configs
UNION ALL
SELECT 'ai_api_keys', COUNT(*) FROM ai_api_keys;

-- Final success message
DO $$
BEGIN
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'SUPERADMIN SYSTEM CLEANUP COMPLETED SUCCESSFULLY!';
  RAISE NOTICE '=====================================================';
  RAISE NOTICE '✅ All tables created with proper structure';
  RAISE NOTICE '✅ RLS policies configured';
  RAISE NOTICE '✅ Default data inserted';
  RAISE NOTICE '✅ Performance indexes created';
  RAISE NOTICE '=====================================================';
  RAISE NOTICE 'NEXT STEPS:';
  RAISE NOTICE '1. Test SuperAdmin login with:';
  RAISE NOTICE '   Username: superadmin';
  RAISE NOTICE '   Password: BookMagic2024!Admin';
  RAISE NOTICE '2. Run the FULL_READINESS_AUDIT.sql to verify everything';
  RAISE NOTICE '=====================================================';
END $$;
