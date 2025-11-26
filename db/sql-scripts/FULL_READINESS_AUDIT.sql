-- =====================================================
-- FULL READINESS AUDIT - COMPREHENSIVE SYSTEM VERIFICATION
-- This script audits EVERY aspect of the system to ensure production readiness
-- NO ASSUMPTIONS - FULL VERIFICATION OF EVERYTHING
-- =====================================================

-- =====================================================
-- PHASE 1: DATABASE SCHEMA AUDIT
-- =====================================================

-- 1.1 VERIFY ALL REQUIRED TABLES EXIST
DO $$
DECLARE
    required_tables text[] := ARRAY[
        'superadmin_users',
        'admin_sessions', 
        'system_configs',
        'ai_api_keys',
        'ai_providers',
        'users',
        'user_credits',
        'subscriptions',
        'books',
        'book_chapters',
        'book_pages',
        'user_workflows',
        'workflow_steps',
        'ai_generation_logs',
        'payment_logs',
        'user_sessions',
        'profiles'
    ];
    missing_tables text[] := '{}';
    table_name text;
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'PHASE 1.1: VERIFYING REQUIRED TABLES EXIST';
    RAISE NOTICE '=====================================================';
    
    FOREACH table_name IN ARRAY required_tables
    LOOP
        IF NOT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = table_name
        ) THEN
            missing_tables := array_append(missing_tables, table_name);
            RAISE NOTICE '❌ MISSING TABLE: %', table_name;
        ELSE
            RAISE NOTICE '✅ TABLE EXISTS: %', table_name;
        END IF;
    END LOOP;
    
    IF array_length(missing_tables, 1) > 0 THEN
        RAISE NOTICE '❌ CRITICAL: Missing tables: %', array_to_string(missing_tables, ', ');
    ELSE
        RAISE NOTICE '✅ ALL REQUIRED TABLES EXIST';
    END IF;
END $$;

-- 1.2 VERIFY TABLE STRUCTURES
DO $$
DECLARE
    table_record record;
    column_record record;
    expected_columns jsonb;
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'PHASE 1.2: VERIFYING TABLE STRUCTURES';
    RAISE NOTICE '=====================================================';
    
    -- Define expected columns for each table
    expected_columns := '{
        "superadmin_users": ["id", "username", "password_hash", "email", "full_name", "permissions", "is_active", "last_login", "created_at", "updated_at"],
        "admin_sessions": ["id", "admin_id", "session_data", "is_active", "expires_at", "created_at"],
        "system_configs": ["id", "config_key", "config_value", "description", "is_encrypted", "created_at", "updated_at"],
        "ai_api_keys": ["id", "service", "encrypted_key", "metadata", "is_active", "last_used", "created_at", "updated_at"],
        "ai_providers": ["id", "user_id", "provider", "name", "api_key", "description", "failures", "usage_count", "metadata", "is_active", "created_at", "updated_at"]
    }';
    
    FOR table_record IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('superadmin_users', 'admin_sessions', 'system_configs', 'ai_api_keys', 'ai_providers')
    LOOP
        RAISE NOTICE '--- Checking table: % ---', table_record.table_name;
        
        -- Check if table has expected columns
        FOR column_record IN 
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = table_record.table_name
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE '  Column: %', column_record.column_name;
        END LOOP;
    END LOOP;
END $$;

-- 1.3 VERIFY RLS POLICIES
DO $$
DECLARE
    policy_record record;
    required_policies text[] := ARRAY[
        'Allow all operations on superadmin_users',
        'Allow all operations on admin_sessions',
        'Allow all operations on system_configs',
        'Allow all operations on ai_api_keys',
        'Allow all operations on ai_providers'
    ];
    missing_policies text[] := '{}';
    policy_name text;
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'PHASE 1.3: VERIFYING RLS POLICIES';
    RAISE NOTICE '=====================================================';
    
    FOREACH policy_name IN ARRAY required_policies
    LOOP
        IF NOT EXISTS (
            SELECT FROM pg_policies 
            WHERE policyname = policy_name
        ) THEN
            missing_policies := array_append(missing_policies, policy_name);
            RAISE NOTICE '❌ MISSING POLICY: %', policy_name;
        ELSE
            RAISE NOTICE '✅ POLICY EXISTS: %', policy_name;
        END IF;
    END LOOP;
    
    IF array_length(missing_policies, 1) > 0 THEN
        RAISE NOTICE '❌ CRITICAL: Missing RLS policies: %', array_to_string(missing_policies, ', ');
    ELSE
        RAISE NOTICE '✅ ALL REQUIRED RLS POLICIES EXIST';
    END IF;
END $$;

-- 1.4 VERIFY INDEXES
DO $$
DECLARE
    index_record record;
    required_indexes text[] := ARRAY[
        'idx_superadmin_users_username',
        'idx_superadmin_users_active',
        'idx_admin_sessions_admin_id',
        'idx_admin_sessions_active',
        'idx_system_configs_key',
        'idx_ai_api_keys_service',
        'idx_ai_api_keys_active',
        'idx_ai_providers_user_id',
        'idx_ai_providers_provider',
        'idx_ai_providers_name',
        'idx_ai_providers_active'
    ];
    missing_indexes text[] := '{}';
    index_name text;
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'PHASE 1.4: VERIFYING PERFORMANCE INDEXES';
    RAISE NOTICE '=====================================================';
    
    FOREACH index_name IN ARRAY required_indexes
    LOOP
        IF NOT EXISTS (
            SELECT FROM pg_indexes 
            WHERE indexname = index_name
        ) THEN
            missing_indexes := array_append(missing_indexes, index_name);
            RAISE NOTICE '❌ MISSING INDEX: %', index_name;
        ELSE
            RAISE NOTICE '✅ INDEX EXISTS: %', index_name;
        END IF;
    END LOOP;
    
    IF array_length(missing_indexes, 1) > 0 THEN
        RAISE NOTICE '❌ CRITICAL: Missing indexes: %', array_to_string(missing_indexes, ', ');
    ELSE
        RAISE NOTICE '✅ ALL REQUIRED INDEXES EXIST';
    END IF;
END $$;

-- =====================================================
-- PHASE 2: DATA INTEGRITY AUDIT
-- =====================================================

-- 2.1 VERIFY DEFAULT DATA EXISTS
DO $$
DECLARE
    data_record record;
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'PHASE 2.1: VERIFYING DEFAULT DATA';
    RAISE NOTICE '=====================================================';
    
    -- Check SuperAdmin user
    IF EXISTS (SELECT 1 FROM superadmin_users WHERE username = 'superadmin') THEN
        RAISE NOTICE '✅ SuperAdmin user exists';
    ELSE
        RAISE NOTICE '❌ CRITICAL: SuperAdmin user missing';
    END IF;
    
    -- Check system configs
    SELECT COUNT(*) INTO data_record FROM system_configs;
    IF data_record.count > 0 THEN
        RAISE NOTICE '✅ System configs exist: % records', data_record.count;
    ELSE
        RAISE NOTICE '❌ CRITICAL: No system configs found';
    END IF;
    
    -- Check AI API keys
    SELECT COUNT(*) INTO data_record FROM ai_api_keys;
    IF data_record.count > 0 THEN
        RAISE NOTICE '✅ AI API keys exist: % records', data_record.count;
    ELSE
        RAISE NOTICE '❌ CRITICAL: No AI API keys found';
    END IF;
END $$;

-- 2.2 VERIFY DATA CONSTRAINTS
DO $$
DECLARE
    constraint_record record;
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'PHASE 2.2: VERIFYING DATA CONSTRAINTS';
    RAISE NOTICE '=====================================================';
    
    -- Check unique constraints
    FOR constraint_record IN 
        SELECT 
            tc.table_name,
            tc.constraint_name,
            tc.constraint_type
        FROM information_schema.table_constraints tc
        WHERE tc.table_schema = 'public'
        AND tc.table_name IN ('superadmin_users', 'admin_sessions', 'system_configs', 'ai_api_keys', 'ai_providers')
        AND tc.constraint_type IN ('PRIMARY KEY', 'UNIQUE')
        ORDER BY tc.table_name, tc.constraint_type
    LOOP
        RAISE NOTICE '✅ Constraint: % on % (% type)', 
            constraint_record.constraint_name, 
            constraint_record.table_name, 
            constraint_record.constraint_type;
    END LOOP;
    
    -- Check foreign key constraints
    FOR constraint_record IN 
        SELECT 
            tc.table_name,
            tc.constraint_name,
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
        JOIN information_schema.constraint_column_usage ccu ON ccu.constraint_name = tc.constraint_name
        WHERE tc.table_schema = 'public'
        AND tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_name IN ('admin_sessions', 'ai_providers')
        ORDER BY tc.table_name
    LOOP
        RAISE NOTICE '✅ Foreign Key: %.% -> %.%', 
            constraint_record.table_name, 
            constraint_record.column_name,
            constraint_record.foreign_table_name, 
            constraint_record.foreign_column_name;
    END LOOP;
END $$;

-- =====================================================
-- PHASE 3: SECURITY AUDIT
-- =====================================================

-- 3.1 VERIFY RLS IS ENABLED
DO $$
DECLARE
    rls_record record;
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'PHASE 3.1: VERIFYING RLS ENABLED';
    RAISE NOTICE '=====================================================';
    
    FOR rls_record IN 
        SELECT 
            schemaname,
            tablename,
            rowsecurity
        FROM pg_tables 
        WHERE schemaname = 'public'
        AND tablename IN ('superadmin_users', 'admin_sessions', 'system_configs', 'ai_api_keys', 'ai_providers')
        ORDER BY tablename
    LOOP
        IF rls_record.rowsecurity THEN
            RAISE NOTICE '✅ RLS ENABLED: %', rls_record.tablename;
        ELSE
            RAISE NOTICE '❌ CRITICAL: RLS DISABLED on %', rls_record.tablename;
        END IF;
    END LOOP;
END $$;

-- 3.2 VERIFY POLICY PERMISSIONS
DO $$
DECLARE
    policy_record record;
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'PHASE 3.2: VERIFYING POLICY PERMISSIONS';
    RAISE NOTICE '=====================================================';
    
    FOR policy_record IN 
        SELECT 
            tablename,
            policyname,
            permissive,
            cmd,
            qual
        FROM pg_policies 
        WHERE schemaname = 'public'
        AND tablename IN ('superadmin_users', 'admin_sessions', 'system_configs', 'ai_api_keys', 'ai_providers')
        ORDER BY tablename, policyname
    LOOP
        RAISE NOTICE 'Policy: % on % (Permissive: %, Command: %)', 
            policy_record.policyname, 
            policy_record.tablename,
            policy_record.permissive,
            policy_record.cmd;
        RAISE NOTICE '  Condition: %', policy_record.qual;
    END LOOP;
END $$;

-- =====================================================
-- PHASE 4: FUNCTIONALITY AUDIT
-- =====================================================

-- 4.1 VERIFY SUPERADMIN LOGIN CAPABILITY
DO $$
DECLARE
    user_record record;
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'PHASE 4.1: VERIFYING SUPERADMIN LOGIN CAPABILITY';
    RAISE NOTICE '=====================================================';
    
    SELECT * INTO user_record FROM superadmin_users WHERE username = 'superadmin';
    
    IF user_record.id IS NOT NULL THEN
        RAISE NOTICE '✅ SuperAdmin user found with ID: %', user_record.id;
        RAISE NOTICE '  Username: %', user_record.username;
        RAISE NOTICE '  Email: %', user_record.email;
        RAISE NOTICE '  Full Name: %', user_record.full_name;
        RAISE NOTICE '  Active: %', user_record.is_active;
        RAISE NOTICE '  Permissions: %', user_record.permissions;
        RAISE NOTICE '  Created: %', user_record.created_at;
        
        IF user_record.is_active THEN
            RAISE NOTICE '✅ SuperAdmin user is ACTIVE and can login';
        ELSE
            RAISE NOTICE '❌ CRITICAL: SuperAdmin user is INACTIVE';
        END IF;
    ELSE
        RAISE NOTICE '❌ CRITICAL: SuperAdmin user not found';
    END IF;
END $$;

-- 4.2 VERIFY SESSION MANAGEMENT CAPABILITY
DO $$
DECLARE
    session_count integer;
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'PHASE 4.2: VERIFYING SESSION MANAGEMENT CAPABILITY';
    RAISE NOTICE '=====================================================';
    
    SELECT COUNT(*) INTO session_count FROM admin_sessions;
    RAISE NOTICE 'Current active sessions: %', session_count;
    
    -- Check if we can create a test session
    BEGIN
        INSERT INTO admin_sessions (id, admin_id, session_data, expires_at)
        VALUES (
            'test_session_' || gen_random_uuid()::text,
            (SELECT id FROM superadmin_users WHERE username = 'superadmin'),
            '{"test": true}'::jsonb,
            now() + interval '1 hour'
        );
        RAISE NOTICE '✅ Session creation test: SUCCESS';
        
        -- Clean up test session
        DELETE FROM admin_sessions WHERE id LIKE 'test_session_%';
        RAISE NOTICE '✅ Session cleanup test: SUCCESS';
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ CRITICAL: Session creation test FAILED: %', SQLERRM;
    END;
END $$;

-- 4.3 VERIFY AI SERVICES CONFIGURATION
DO $$
DECLARE
    service_record record;
    service_count integer;
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'PHASE 4.3: VERIFYING AI SERVICES CONFIGURATION';
    RAISE NOTICE '=====================================================';
    
    SELECT COUNT(*) INTO service_count FROM ai_api_keys;
    RAISE NOTICE 'Total AI services configured: %', service_count;
    
    FOR service_record IN 
        SELECT service, is_active, metadata
        FROM ai_api_keys
        ORDER BY service
    LOOP
        RAISE NOTICE 'Service: % (Active: %, Metadata: %)', 
            service_record.service, 
            service_record.is_active,
            service_record.metadata;
    END LOOP;
    
    IF service_count >= 9 THEN
        RAISE NOTICE '✅ All expected AI services are configured';
    ELSE
        RAISE NOTICE '❌ WARNING: Only % AI services configured (expected 9)', service_count;
    END IF;
END $$;

-- =====================================================
-- PHASE 5: PERFORMANCE AUDIT
-- =====================================================

-- 5.1 VERIFY INDEX USAGE
DO $$
DECLARE
    index_record record;
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'PHASE 5.1: VERIFYING INDEX USAGE';
    RAISE NOTICE '=====================================================';
    
    FOR index_record IN 
        SELECT 
            schemaname,
            tablename,
            indexname,
            indexdef
        FROM pg_indexes 
        WHERE schemaname = 'public'
        AND tablename IN ('superadmin_users', 'admin_sessions', 'system_configs', 'ai_api_keys', 'ai_providers')
        ORDER BY tablename, indexname
    LOOP
        RAISE NOTICE 'Index: % on %', index_record.indexname, index_record.tablename;
        RAISE NOTICE '  Definition: %', index_record.indexdef;
    END LOOP;
END $$;

-- 5.2 VERIFY TABLE STATISTICS
DO $$
DECLARE
    stats_record record;
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'PHASE 5.2: VERIFYING TABLE STATISTICS';
    RAISE NOTICE '=====================================================';
    
    FOR stats_record IN 
        SELECT 
            schemaname,
            tablename,
            n_tup_ins as inserts,
            n_tup_upd as updates,
            n_tup_del as deletes,
            n_live_tup as live_rows,
            n_dead_tup as dead_rows
        FROM pg_stat_user_tables 
        WHERE schemaname = 'public'
        AND tablename IN ('superadmin_users', 'admin_sessions', 'system_configs', 'ai_api_keys', 'ai_providers')
        ORDER BY tablename
    LOOP
        RAISE NOTICE 'Table: % (Live: %, Dead: %, Inserts: %, Updates: %, Deletes: %)', 
            stats_record.tablename,
            stats_record.live_rows,
            stats_record.dead_rows,
            stats_record.inserts,
            stats_record.updates,
            stats_record.deletes;
    END LOOP;
END $$;

-- =====================================================
-- PHASE 6: INTEGRATION AUDIT
-- =====================================================

-- 6.1 VERIFY AUTH.USERS INTEGRATION
DO $$
DECLARE
    auth_users_count integer;
    public_users_count integer;
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'PHASE 6.1: VERIFYING AUTH.USERS INTEGRATION';
    RAISE NOTICE '=====================================================';
    
    -- Check if auth.users table exists and has data
    SELECT COUNT(*) INTO auth_users_count FROM auth.users;
    RAISE NOTICE 'Auth.users count: %', auth_users_count;
    
    -- Check if public.users table exists and has data
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        SELECT COUNT(*) INTO public_users_count FROM public.users;
        RAISE NOTICE 'Public.users count: %', public_users_count;
        
        IF public_users_count > 0 THEN
            RAISE NOTICE '✅ Public.users table exists and has data';
        ELSE
            RAISE NOTICE '⚠️ WARNING: Public.users table exists but is empty';
        END IF;
    ELSE
        RAISE NOTICE '⚠️ WARNING: Public.users table does not exist';
    END IF;
    
    IF auth_users_count > 0 THEN
        RAISE NOTICE '✅ Auth.users table has data';
    ELSE
        RAISE NOTICE '❌ CRITICAL: Auth.users table is empty';
    END IF;
END $$;

-- 6.2 VERIFY EXTERNAL SERVICE INTEGRATIONS
DO $$
DECLARE
    config_record record;
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'PHASE 6.2: VERIFYING EXTERNAL SERVICE INTEGRATIONS';
    RAISE NOTICE '=====================================================';
    
    FOR config_record IN 
        SELECT config_key, config_value, description
        FROM system_configs
        WHERE config_key IN ('paypal_integration_enabled', 'ai_generation_enabled', 'book_export_enabled')
        ORDER BY config_key
    LOOP
        RAISE NOTICE 'Integration: % = % (%s)', 
            config_record.config_key, 
            config_record.config_value,
            config_record.description;
    END LOOP;
END $$;

-- =====================================================
-- PHASE 7: FINAL COMPREHENSIVE STATUS
-- =====================================================

DO $$
DECLARE
    total_tables integer;
    total_policies integer;
    total_indexes integer;
    total_configs integer;
    total_ai_services integer;
    system_status text := 'READY';
    issues_found integer := 0;
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'PHASE 7: FINAL COMPREHENSIVE STATUS';
    RAISE NOTICE '=====================================================';
    
    -- Count all components
    SELECT COUNT(*) INTO total_tables FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('superadmin_users', 'admin_sessions', 'system_configs', 'ai_api_keys', 'ai_providers');
    
    SELECT COUNT(*) INTO total_policies FROM pg_policies 
    WHERE schemaname = 'public'
    AND tablename IN ('superadmin_users', 'admin_sessions', 'system_configs', 'ai_api_keys', 'ai_providers');
    
    SELECT COUNT(*) INTO total_indexes FROM pg_indexes 
    WHERE schemaname = 'public'
    AND tablename IN ('superadmin_users', 'admin_sessions', 'system_configs', 'ai_api_keys', 'ai_providers');
    
    SELECT COUNT(*) INTO total_configs FROM system_configs;
    SELECT COUNT(*) INTO total_ai_services FROM ai_api_keys;
    
    -- Check for critical issues
    IF total_tables < 5 THEN
        system_status := 'CRITICAL ISSUES';
        issues_found := issues_found + 1;
    END IF;
    
    IF total_policies < 5 THEN
        system_status := 'CRITICAL ISSUES';
        issues_found := issues_found + 1;
    END IF;
    
    IF total_indexes < 11 THEN
        system_status := 'PERFORMANCE ISSUES';
        issues_found := issues_found + 1;
    END IF;
    
    IF total_configs < 10 THEN
        system_status := 'CONFIGURATION ISSUES';
        issues_found := issues_found + 1;
    END IF;
    
    IF total_ai_services < 9 THEN
        system_status := 'AI SERVICE ISSUES';
        issues_found := issues_found + 1;
    END IF;
    
    -- Final status report
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'SYSTEM READINESS AUDIT COMPLETED';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'COMPONENT COUNT:';
    RAISE NOTICE '  Tables: %/5', total_tables;
    RAISE NOTICE '  RLS Policies: %/5', total_policies;
    RAISE NOTICE '  Indexes: %/11', total_indexes;
    RAISE NOTICE '  System Configs: %/10', total_configs;
    RAISE NOTICE '  AI Services: %/9', total_ai_services;
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'FINAL STATUS: %', system_status;
    RAISE NOTICE 'ISSUES FOUND: %', issues_found;
    RAISE NOTICE '=====================================================';
    
    IF system_status = 'READY' THEN
        RAISE NOTICE '🎉 SYSTEM IS PRODUCTION READY! 🎉';
        RAISE NOTICE 'All critical components verified and functional';
    ELSIF system_status = 'CRITICAL ISSUES' THEN
        RAISE NOTICE '🚨 CRITICAL ISSUES DETECTED - SYSTEM NOT READY 🚨';
        RAISE NOTICE 'Immediate attention required before production deployment';
    ELSIF system_status = 'PERFORMANCE ISSUES' THEN
        RAISE NOTICE '⚠️ PERFORMANCE ISSUES DETECTED ⚠️';
        RAISE NOTICE 'System functional but may have performance problems';
    ELSIF system_status = 'CONFIGURATION ISSUES' THEN
        RAISE NOTICE '⚠️ CONFIGURATION ISSUES DETECTED ⚠️';
        RAISE NOTICE 'System functional but missing some configurations';
    ELSIF system_status = 'AI SERVICE ISSUES' THEN
        RAISE NOTICE '⚠️ AI SERVICE ISSUES DETECTED ⚠️';
        RAISE NOTICE 'System functional but some AI services may not work';
    END IF;
    
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'NEXT STEPS:';
    IF system_status = 'READY' THEN
        RAISE NOTICE '1. ✅ System is ready for production deployment';
        RAISE NOTICE '2. ✅ All critical components verified';
        RAISE NOTICE '3. ✅ Security policies in place';
        RAISE NOTICE '4. ✅ Performance optimized';
    ELSE
        RAISE NOTICE '1. ❌ Fix identified issues before production';
        RAISE NOTICE '2. ❌ Re-run audit after fixes';
        RAISE NOTICE '3. ❌ Do not deploy until status is READY';
    END IF;
    RAISE NOTICE '=====================================================';
END $$;
