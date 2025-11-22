-- =====================================================
-- TEST SUPABASE ACCESS - IDENTIFY 401 ERROR SOURCE
-- This script tests different access methods to find the issue
-- =====================================================

-- 1. TEST BASIC DATABASE ACCESS
DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'TESTING BASIC DATABASE ACCESS';
    RAISE NOTICE '=====================================================';
    
    -- Test if we can access basic system tables
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public') THEN
        RAISE NOTICE '✅ Can access information_schema';
    ELSE
        RAISE NOTICE '❌ Cannot access information_schema';
    END IF;
    
    -- Test if we can access our custom tables
    IF EXISTS (SELECT 1 FROM superadmin_users LIMIT 1) THEN
        RAISE NOTICE '✅ Can access superadmin_users table';
    ELSE
        RAISE NOTICE '❌ Cannot access superadmin_users table';
    END IF;
    
    IF EXISTS (SELECT 1 FROM admin_sessions LIMIT 1) THEN
        RAISE NOTICE '✅ Can access admin_sessions table';
    ELSE
        RAISE NOTICE '❌ Cannot access admin_sessions table';
    END IF;
    
    RAISE NOTICE '=====================================================';
END $$;

-- 2. TEST ROLE SWITCHING
DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'TESTING ROLE SWITCHING';
    RAISE NOTICE '=====================================================';
    
    RAISE NOTICE 'Current role: %', current_user;
    RAISE NOTICE 'Current database: %', current_database();
    RAISE NOTICE 'Current schema: %', current_schema;
    
    RAISE NOTICE '=====================================================';
END $$;

-- 3. TEST TABLE PERMISSIONS IN DETAIL
DO $$
DECLARE
    table_record record;
    can_select boolean;
    can_insert boolean;
    can_update boolean;
    can_delete boolean;
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'TESTING DETAILED TABLE PERMISSIONS';
    RAISE NOTICE '=====================================================';
    
    FOR table_record IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('superadmin_users', 'admin_sessions', 'system_configs')
        ORDER BY table_name
    LOOP
        RAISE NOTICE '--- Testing table: % ---', table_record.table_name;
        
        -- Check permissions for current role
        SELECT has_table_privilege(current_user, table_record.table_name, 'SELECT') INTO can_select;
        SELECT has_table_privilege(current_user, table_record.table_name, 'INSERT') INTO can_insert;
        SELECT has_table_privilege(current_user, table_record.table_name, 'UPDATE') INTO can_update;
        SELECT has_table_privilege(current_user, table_record.table_name, 'DELETE') INTO can_delete;
        
        RAISE NOTICE '  SELECT: %', can_select;
        RAISE NOTICE '  INSERT: %', can_insert;
        RAISE NOTICE '  UPDATE: %', can_update;
        RAISE NOTICE '  DELETE: %', can_delete;
        
        -- Check permissions for anon role
        SELECT has_table_privilege('anon', table_record.table_name, 'SELECT') INTO can_select;
        SELECT has_table_privilege('anon', table_record.table_name, 'INSERT') INTO can_insert;
        SELECT has_table_privilege('anon', table_record.table_name, 'UPDATE') INTO can_update;
        SELECT has_table_privilege('anon', table_record.table_name, 'DELETE') INTO can_delete;
        
        RAISE NOTICE '  anon role SELECT: %', can_select;
        RAISE NOTICE '  anon role INSERT: %', can_insert;
        RAISE NOTICE '  anon role UPDATE: %', can_update;
        RAISE NOTICE '  anon role DELETE: %', can_delete;
    END LOOP;
    
    RAISE NOTICE '=====================================================';
END $$;

-- 4. TEST RLS POLICY EFFECTIVENESS
DO $$
DECLARE
    policy_record record;
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'TESTING RLS POLICY EFFECTIVENESS';
    RAISE NOTICE '=====================================================';
    
    FOR policy_record IN 
        SELECT 
            tablename,
            policyname,
            permissive,
            cmd,
            roles,
            qual
        FROM pg_policies 
        WHERE schemaname = 'public'
        AND tablename IN ('superadmin_users', 'admin_sessions')
        ORDER BY tablename, policyname
    LOOP
        RAISE NOTICE 'Policy: % on %', policy_record.policyname, policy_record.tablename;
        RAISE NOTICE '  Permissive: %', policy_record.permissive;
        RAISE NOTICE '  Command: %', policy_record.cmd;
        RAISE NOTICE '  Roles: %', policy_record.roles;
        RAISE NOTICE '  Condition: %', policy_record.qual;
        RAISE NOTICE '  ---';
    END LOOP;
    
    RAISE NOTICE '=====================================================';
END $$;

-- 5. TEST DIRECT QUERY WITH ERROR HANDLING
DO $$
DECLARE
    user_count integer;
    test_user record;
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'TESTING DIRECT QUERY WITH ERROR HANDLING';
    RAISE NOTICE '=====================================================';
    
    BEGIN
        -- Try to count users
        SELECT COUNT(*) INTO user_count FROM superadmin_users;
        RAISE NOTICE '✅ Direct query SUCCESS: Found % users', user_count;
        
        -- Try to get superadmin user
        SELECT * INTO test_user FROM superadmin_users WHERE username = 'superadmin' LIMIT 1;
        IF test_user.id IS NOT NULL THEN
            RAISE NOTICE '✅ SuperAdmin user found: ID=%, Username=%, Active=%', 
                test_user.id, test_user.username, test_user.is_active;
        ELSE
            RAISE NOTICE '❌ SuperAdmin user NOT found';
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Direct query FAILED: %', SQLERRM;
        RAISE NOTICE '❌ Error code: %', SQLSTATE;
        RAISE NOTICE '❌ Error detail: %', SQLERRM_DETAIL;
    END;
    
    RAISE NOTICE '=====================================================';
END $$;

-- 6. FINAL DIAGNOSIS
DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'FINAL DIAGNOSIS';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'If you see "Direct query SUCCESS" above, the database is fine';
    RAISE NOTICE 'If you see "Direct query FAILED", there are database issues';
    RAISE NOTICE 'If database is fine but app gets 401, it is a Supabase config issue';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'NEXT STEPS:';
    RAISE NOTICE '1. Look at the results above';
    RAISE NOTICE '2. Tell me what you see';
    RAISE NOTICE '3. I will create the right fix based on the results';
    RAISE NOTICE '=====================================================';
END $$;
