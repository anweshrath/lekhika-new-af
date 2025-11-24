-- =====================================================
-- CHECK CURRENT DATABASE STATE
-- This script shows us exactly what exists before we make changes
-- =====================================================

-- 1. CHECK WHAT TABLES EXIST
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%superadmin%' OR table_name LIKE '%admin%' OR table_name LIKE '%ai%'
ORDER BY table_name;

-- 2. CHECK SUPERADMIN_USERS TABLE STRUCTURE
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'superadmin_users'
ORDER BY ordinal_position;

-- 3. CHECK SUPERADMIN_USERS DATA
SELECT 
  id,
  username,
  email,
  full_name,
  is_active,
  created_at
FROM superadmin_users
LIMIT 5;

-- 4. CHECK RLS POLICIES
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename LIKE '%superadmin%' OR table_name LIKE '%admin%'
ORDER BY tablename, policyname;

-- 5. CHECK IF RLS IS ENABLED
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename LIKE '%superadmin%' OR table_name LIKE '%admin%'
ORDER BY tablename;

-- 6. CHECK FOR ANY ERRORS IN SUPERADMIN_USERS
SELECT 
  'Current table state' as info,
  COUNT(*) as total_records,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_records,
  COUNT(CASE WHEN username = 'superadmin' THEN 1 END) as superadmin_exists
FROM superadmin_users;

-- 7. TEST BASIC QUERY
DO $$
DECLARE
    user_count integer;
    test_user record;
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'TESTING SUPERADMIN_USERS TABLE ACCESS';
    RAISE NOTICE '=====================================================';
    
    -- Try to count users
    SELECT COUNT(*) INTO user_count FROM superadmin_users;
    RAISE NOTICE 'Total users in table: %', user_count;
    
    -- Try to find superadmin user
    SELECT * INTO test_user FROM superadmin_users WHERE username = 'superadmin';
    
    IF test_user.id IS NOT NULL THEN
        RAISE NOTICE '✅ SuperAdmin user found:';
        RAISE NOTICE '  ID: %', test_user.id;
        RAISE NOTICE '  Username: %', test_user.username;
        RAISE NOTICE '  Email: %', test_user.email;
        RAISE NOTICE '  Active: %', test_user.is_active;
        RAISE NOTICE '  Created: %', test_user.created_at;
    ELSE
        RAISE NOTICE '❌ SuperAdmin user NOT found';
    END IF;
    
    RAISE NOTICE '=====================================================';
END $$;
