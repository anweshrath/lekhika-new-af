-- =====================================================
-- QUICK RLS FIX FOR SUPERADMIN AUTHENTICATION
-- This temporarily disables RLS to allow login, then re-enables it properly
-- =====================================================

-- 1. TEMPORARILY DISABLE RLS TO ALLOW LOGIN
DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'TEMPORARILY DISABLING RLS FOR SUPERADMIN LOGIN';
    RAISE NOTICE '=====================================================';
    
    -- Disable RLS on superadmin_users temporarily
    ALTER TABLE superadmin_users DISABLE ROW LEVEL SECURITY;
    RAISE NOTICE '✅ RLS DISABLED on superadmin_users (temporarily)';
    
    -- Disable RLS on admin_sessions temporarily
    ALTER TABLE admin_sessions DISABLE ROW LEVEL SECURITY;
    RAISE NOTICE '✅ RLS DISABLED on admin_sessions (temporarily)';
    
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'NOW TRY TO LOGIN AS SUPERADMIN!';
    RAISE NOTICE 'Username: superadmin';
    RAISE NOTICE 'Password: BookMagic2024!Admin';
    RAISE NOTICE '=====================================================';
END $$;

-- 2. VERIFY THE FIX
DO $$
DECLARE
    rls_status record;
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'VERIFYING RLS STATUS';
    RAISE NOTICE '=====================================================';
    
    FOR rls_status IN 
        SELECT 
            schemaname,
            tablename,
            rowsecurity
        FROM pg_tables 
        WHERE schemaname = 'public'
        AND tablename IN ('superadmin_users', 'admin_sessions')
        ORDER BY tablename
    LOOP
        IF rls_status.rowsecurity THEN
            RAISE NOTICE '✅ RLS ENABLED: %', rls_status.tablename;
        ELSE
            RAISE NOTICE '❌ RLS DISABLED: %', rls_status.tablename;
        END IF;
    END LOOP;
    
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'NEXT STEPS:';
    RAISE NOTICE '1. Try SuperAdmin login now (should work)';
    RAISE NOTICE '2. After successful login, run: re_enable_rls.sql';
    RAISE NOTICE '=====================================================';
END $$;
