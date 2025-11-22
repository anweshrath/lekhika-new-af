-- =====================================================
-- FIX ANON ROLE PERMISSIONS FOR SUPERADMIN AUTHENTICATION
-- This grants the anon role access to superadmin_users table
-- =====================================================

-- 1. GRANT PERMISSIONS TO ANON ROLE
DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'GRANTING ANON ROLE PERMISSIONS';
    RAISE NOTICE '=====================================================';
    
    -- Grant SELECT permission on superadmin_users to anon role
    GRANT SELECT ON superadmin_users TO anon;
    RAISE NOTICE '✅ GRANT SELECT ON superadmin_users TO anon';
    
    -- Grant SELECT permission on admin_sessions to anon role
    GRANT SELECT ON admin_sessions TO anon;
    RAISE NOTICE '✅ GRANT SELECT ON admin_sessions TO anon';
    
    -- Grant INSERT permission on admin_sessions to anon role (for creating sessions)
    GRANT INSERT ON admin_sessions TO anon;
    RAISE NOTICE '✅ GRANT INSERT ON admin_sessions TO anon';
    
    -- Grant UPDATE permission on admin_sessions to anon role (for session management)
    GRANT UPDATE ON admin_sessions TO anon;
    RAISE NOTICE '✅ GRANT UPDATE ON admin_sessions TO anon';
    
    -- Grant UPDATE permission on superadmin_users to anon role (for last_login updates)
    GRANT UPDATE ON superadmin_users TO anon;
    RAISE NOTICE '✅ GRANT UPDATE ON superadmin_users TO anon';
    
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'PERMISSIONS GRANTED SUCCESSFULLY!';
    RAISE NOTICE '=====================================================';
END $$;

-- 2. VERIFY PERMISSIONS
SELECT 
    grantee,
    table_name,
    privilege_type,
    is_grantable
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
AND table_name IN ('superadmin_users', 'admin_sessions')
AND grantee = 'anon'
ORDER BY table_name, privilege_type;

-- 3. TEST ANON ROLE ACCESS
DO $$
DECLARE
    user_count integer;
    test_user record;
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'TESTING ANON ROLE ACCESS';
    RAISE NOTICE '=====================================================';
    
    -- Test if anon role can query superadmin_users
    BEGIN
        -- Switch to anon role temporarily
        SET ROLE anon;
        
        -- Try to count users
        SELECT COUNT(*) INTO user_count FROM superadmin_users;
        RAISE NOTICE '✅ Anon role can query superadmin_users: % users found', user_count;
        
        -- Try to get superadmin user
        SELECT * INTO test_user FROM superadmin_users WHERE username = 'superadmin' LIMIT 1;
        IF test_user.id IS NOT NULL THEN
            RAISE NOTICE '✅ Anon role can access superadmin user: %', test_user.username;
        ELSE
            RAISE NOTICE '❌ Anon role cannot access superadmin user';
        END IF;
        
        -- Switch back to original role
        RESET ROLE;
        
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '❌ Anon role access test FAILED: %', SQLERRM;
        RESET ROLE;
    END;
    
    RAISE NOTICE '=====================================================';
END $$;

-- 4. FINAL STATUS
DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'ANON ROLE PERMISSIONS FIXED!';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE '✅ anon role now has SELECT access to superadmin_users';
    RAISE NOTICE '✅ anon role now has SELECT/INSERT/UPDATE access to admin_sessions';
    RAISE NOTICE '✅ anon role now has UPDATE access to superadmin_users (for last_login)';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'NEXT STEPS:';
    RAISE NOTICE '1. Try SuperAdmin login again in your React app';
    RAISE NOTICE '2. Username: superadmin';
    RAISE NOTICE '3. Password: BookMagic2024!Admin';
    RAISE NOTICE '4. This should work now!';
    RAISE NOTICE '=====================================================';
END $$;
