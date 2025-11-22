-- =====================================================
-- DEBUG CONNECTION - SEE EXACTLY WHAT'S HAPPENING
-- This script will show us the real state of your database
-- =====================================================

-- 1. CHECK WHAT DATABASE WE'RE CONNECTED TO
SELECT 
    current_database() as current_db,
    current_user as current_user,
    session_user as session_user,
    current_schema as current_schema;

-- 2. CHECK IF TABLES ACTUALLY EXIST
SELECT 
    table_name,
    table_schema,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('superadmin_users', 'admin_sessions', 'system_configs', 'ai_providers')
ORDER BY table_name;

-- 3. CHECK RLS STATUS ON EACH TABLE
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN 'RLS ENABLED'
        ELSE 'RLS DISABLED'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('superadmin_users', 'admin_sessions', 'system_configs', 'ai_providers')
ORDER BY tablename;

-- 4. CHECK RLS POLICIES
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('superadmin_users', 'admin_sessions', 'system_configs', 'ai_providers')
ORDER BY tablename, policyname;

-- 5. TRY TO QUERY THE TABLE DIRECTLY
DO $$
DECLARE
    user_count integer;
    test_result record;
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'TESTING DIRECT TABLE ACCESS';
    RAISE NOTICE '=====================================================';
    
    -- Try to count users
    BEGIN
        SELECT COUNT(*) INTO user_count FROM superadmin_users;
        RAISE NOTICE '✅ Direct query SUCCESS: Found % users', user_count;
        
        -- Try to get a specific user
        SELECT * INTO test_result FROM superadmin_users WHERE username = 'superadmin' LIMIT 1;
        IF test_result.id IS NOT NULL THEN
            RAISE NOTICE '✅ SuperAdmin user found: ID=%, Username=%, Active=%', 
                test_result.id, test_result.username, test_result.is_active;
        ELSE
            RAISE NOTICE '❌ SuperAdmin user NOT found';
        END IF;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Direct query FAILED: %', SQLERRM;
        RAISE NOTICE '❌ Error code: %', SQLSTATE;
    END;
    
    RAISE NOTICE '=====================================================';
END $$;

-- 6. CHECK TABLE PERMISSIONS
SELECT 
    grantee,
    table_name,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
AND table_name IN ('superadmin_users', 'admin_sessions', 'system_configs', 'ai_providers')
ORDER BY table_name, grantee, privilege_type;

-- 7. CHECK ROLE PERMISSIONS
SELECT 
    rolname,
    rolsuper,
    rolinherit,
    rolcreaterole,
    rolcreatedb,
    rolcanlogin
FROM pg_roles 
WHERE rolname IN ('postgres', 'anon', 'authenticated', 'service_role');

-- 8. CHECK CURRENT ROLE PERMISSIONS
DO $$
DECLARE
    role_name text;
    can_select boolean;
    can_insert boolean;
    can_update boolean;
    can_delete boolean;
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'CHECKING CURRENT ROLE PERMISSIONS';
    RAISE NOTICE '=====================================================';
    
    role_name := current_user;
    RAISE NOTICE 'Current role: %', role_name;
    
    -- Check permissions on superadmin_users
    SELECT 
        has_table_privilege(role_name, 'superadmin_users', 'SELECT') INTO can_select;
    SELECT 
        has_table_privilege(role_name, 'superadmin_users', 'INSERT') INTO can_insert;
    SELECT 
        has_table_privilege(role_name, 'superadmin_users', 'UPDATE') INTO can_update;
    SELECT 
        has_table_privilege(role_name, 'superadmin_users', 'DELETE') INTO can_delete;
    
    RAISE NOTICE 'Permissions on superadmin_users:';
    RAISE NOTICE '  SELECT: %', can_select;
    RAISE NOTICE '  INSERT: %', can_insert;
    RAISE NOTICE '  UPDATE: %', can_update;
    RAISE NOTICE '  DELETE: %', can_delete;
    
    RAISE NOTICE '=====================================================';
END $$;

-- 9. FINAL DIAGNOSIS
DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'FINAL DIAGNOSIS';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'If you see "RLS ENABLED" above, that means RLS is still active';
    RAISE NOTICE 'If you see "Direct query FAILED", there are permission issues';
    RAISE NOTICE 'If you see "table does not exist", the table is missing';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'NEXT STEPS:';
    RAISE NOTICE '1. Look at the results above';
    RAISE NOTICE '2. Tell me what you see';
    RAISE NOTICE '3. I will create the right fix based on the results';
    RAISE NOTICE '=====================================================';
END $$;
