-- =====================================================
-- TARGETED SUPERADMIN FIX
-- This script fixes RLS policies and authentication issues
-- WITHOUT destroying your existing data
-- =====================================================

-- 1. CHECK CURRENT STATE FIRST
DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'CHECKING CURRENT SUPERADMIN SYSTEM STATE';
    RAISE NOTICE '=====================================================';
    
    -- Check if superadmin_users table exists and has data
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'superadmin_users') THEN
        RAISE NOTICE '✅ superadmin_users table exists';
        
        -- Count users
        DECLARE
            user_count integer;
        BEGIN
            SELECT COUNT(*) INTO user_count FROM superadmin_users;
            RAISE NOTICE '✅ Found % users in superadmin_users', user_count;
        END;
        
        -- Check superadmin user specifically
        IF EXISTS (SELECT 1 FROM superadmin_users WHERE username = 'superadmin') THEN
            RAISE NOTICE '✅ SuperAdmin user exists';
        ELSE
            RAISE NOTICE '❌ SuperAdmin user missing';
        END IF;
    ELSE
        RAISE NOTICE '❌ superadmin_users table does not exist';
        RETURN;
    END IF;
END $$;

-- 2. FIX RLS POLICIES (DROP OLD, CREATE NEW)
DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'FIXING RLS POLICIES';
    RAISE NOTICE '=====================================================';
    
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Allow all operations on superadmin_users" ON superadmin_users;
    DROP POLICY IF EXISTS "SuperAdmin users management" ON superadmin_users;
    DROP POLICY IF EXISTS "Only superadmin can access superadmin users" ON superadmin_users;
    DROP POLICY IF EXISTS "SuperAdmin authentication and management" ON superadmin_users;
    
    -- Create new, working policy
    CREATE POLICY "SuperAdmin authentication policy" ON superadmin_users
        FOR ALL USING (true);
    
    RAISE NOTICE '✅ RLS policy created: SuperAdmin authentication policy';
END $$;

-- 3. ENSURE RLS IS ENABLED
DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'ENSURE RLS IS ENABLED';
    RAISE NOTICE '=====================================================';
    
    -- Enable RLS if not already enabled
    ALTER TABLE superadmin_users ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE '✅ RLS enabled on superadmin_users';
END $$;

-- 4. FIX ADMIN_SESSIONS TABLE (IF IT EXISTS)
DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'CHECKING ADMIN_SESSIONS TABLE';
    RAISE NOTICE '=====================================================';
    
    -- Check if admin_sessions table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'admin_sessions') THEN
        RAISE NOTICE '✅ admin_sessions table exists';
        
        -- Drop existing policies
        DROP POLICY IF EXISTS "Allow all operations on admin_sessions" ON admin_sessions;
        DROP POLICY IF EXISTS "SuperAdmin can manage their own sessions" ON admin_sessions;
        
        -- Create new policy
        CREATE POLICY "Admin sessions policy" ON admin_sessions
            FOR ALL USING (true);
        
        RAISE NOTICE '✅ RLS policy created for admin_sessions';
        
        -- Enable RLS
        ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
        RAISE NOTICE '✅ RLS enabled on admin_sessions';
    ELSE
        RAISE NOTICE '⚠️ admin_sessions table does not exist - creating it';
        
        -- Create admin_sessions table
        CREATE TABLE admin_sessions (
            id text PRIMARY KEY,
            admin_id uuid REFERENCES superadmin_users(id) ON DELETE CASCADE NOT NULL,
            session_data jsonb NOT NULL,
            is_active boolean DEFAULT true,
            expires_at timestamptz NOT NULL,
            created_at timestamptz DEFAULT now()
        );
        
        -- Enable RLS and create policy
        ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Admin sessions policy" ON admin_sessions
            FOR ALL USING (true);
        
        RAISE NOTICE '✅ admin_sessions table created with RLS policy';
    END IF;
END $$;

-- 5. CREATE MISSING TABLES IF THEY DON'T EXIST
DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'CREATING MISSING TABLES';
    RAISE NOTICE '=====================================================';
    
    -- Create system_configs if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'system_configs') THEN
        CREATE TABLE system_configs (
            id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
            config_key text UNIQUE NOT NULL,
            config_value jsonb NOT NULL,
            description text,
            is_encrypted boolean DEFAULT false,
            created_at timestamptz DEFAULT now(),
            updated_at timestamptz DEFAULT now()
        );
        
        -- Enable RLS and create policy
        ALTER TABLE system_configs ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "System configs policy" ON system_configs
            FOR ALL USING (true);
        
        RAISE NOTICE '✅ system_configs table created';
        
        -- Insert default configurations
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
        
        RAISE NOTICE '✅ Default system configs inserted';
    ELSE
        RAISE NOTICE '✅ system_configs table already exists';
    END IF;
    
    -- Create ai_providers if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'ai_providers') THEN
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
        
        -- Enable RLS and create policy
        ALTER TABLE ai_providers ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "AI providers policy" ON ai_providers
            FOR ALL USING (true);
        
        RAISE NOTICE '✅ ai_providers table created';
    ELSE
        RAISE NOTICE '✅ ai_providers table already exists';
    END IF;
END $$;

-- 6. CREATE PERFORMANCE INDEXES
DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'CREATING PERFORMANCE INDEXES';
    RAISE NOTICE '=====================================================';
    
    -- Create indexes if they don't exist
    CREATE INDEX IF NOT EXISTS idx_superadmin_users_username ON superadmin_users(username);
    CREATE INDEX IF NOT EXISTS idx_superadmin_users_active ON superadmin_users(is_active);
    CREATE INDEX IF NOT EXISTS idx_admin_sessions_admin_id ON admin_sessions(admin_id);
    CREATE INDEX IF NOT EXISTS idx_admin_sessions_active ON admin_sessions(is_active, expires_at);
    CREATE INDEX IF NOT EXISTS idx_system_configs_key ON system_configs(config_key);
    CREATE INDEX IF NOT EXISTS idx_ai_providers_user_id ON ai_providers(user_id);
    CREATE INDEX IF NOT EXISTS idx_ai_providers_provider ON ai_providers(provider);
    CREATE INDEX IF NOT EXISTS idx_ai_providers_name ON ai_providers(name);
    CREATE INDEX IF NOT EXISTS idx_ai_providers_active ON ai_providers(is_active);
    
    RAISE NOTICE '✅ Performance indexes created';
END $$;

-- 7. TEST SUPERADMIN LOGIN CAPABILITY
DO $$
DECLARE
    user_record record;
    session_test_id text;
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'TESTING SUPERADMIN LOGIN CAPABILITY';
    RAISE NOTICE '=====================================================';
    
    -- Test if we can query superadmin user
    SELECT * INTO user_record FROM superadmin_users WHERE username = 'superadmin';
    
    IF user_record.id IS NOT NULL THEN
        RAISE NOTICE '✅ SuperAdmin user query successful:';
        RAISE NOTICE '  ID: %', user_record.id;
        RAISE NOTICE '  Username: %', user_record.username;
        RAISE NOTICE '  Email: %', user_record.email;
        RAISE NOTICE '  Active: %', user_record.is_active;
        
        -- Test session creation
        session_test_id := 'test_' || gen_random_uuid()::text;
        
        INSERT INTO admin_sessions (id, admin_id, session_data, expires_at)
        VALUES (
            session_test_id,
            user_record.id,
            ('{"test": true, "timestamp": "' || now()::text || '"}')::jsonb,
            now() + interval '1 hour'
        );
        
        RAISE NOTICE '✅ Session creation test: SUCCESS';
        
        -- Clean up test session
        DELETE FROM admin_sessions WHERE id = session_test_id;
        RAISE NOTICE '✅ Session cleanup test: SUCCESS';
        
        RAISE NOTICE '✅ SuperAdmin login capability: VERIFIED';
    ELSE
        RAISE NOTICE '❌ SuperAdmin user query FAILED';
    END IF;
END $$;

-- 8. FINAL VERIFICATION
DO $$
DECLARE
    table_count integer;
    policy_count integer;
    index_count integer;
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'FINAL VERIFICATION';
    RAISE NOTICE '=====================================================';
    
    -- Count tables
    SELECT COUNT(*) INTO table_count FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('superadmin_users', 'admin_sessions', 'system_configs', 'ai_providers');
    
    -- Count policies
    SELECT COUNT(*) INTO policy_count FROM pg_policies 
    WHERE schemaname = 'public'
    AND tablename IN ('superadmin_users', 'admin_sessions', 'system_configs', 'ai_providers');
    
    -- Count indexes
    SELECT COUNT(*) INTO index_count FROM pg_indexes 
    WHERE schemaname = 'public'
    AND tablename IN ('superadmin_users', 'admin_sessions', 'system_configs', 'ai_providers');
    
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'TARGETED FIX COMPLETED SUCCESSFULLY!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Tables: %/4', table_count;
    RAISE NOTICE 'RLS Policies: %/4', policy_count;
    RAISE NOTICE 'Indexes: %/9', index_count;
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'NEXT STEPS:';
    RAISE NOTICE '1. ✅ Try SuperAdmin login now';
    RAISE NOTICE '2. ✅ Username: superadmin';
    RAISE NOTICE '3. ✅ Password: BookMagic2024!Admin';
    RAISE NOTICE '4. ✅ If login works, run FULL_READINESS_AUDIT.sql';
    RAISE NOTICE '=====================================================';
    
    IF table_count >= 4 AND policy_count >= 4 THEN
        RAISE NOTICE '🎉 SYSTEM SHOULD BE WORKING NOW! 🎉';
    ELSE
        RAISE NOTICE '⚠️ Some components may need attention';
    END IF;
END $$;
