-- Debug SuperAdmin RLS policy issue
-- Check if SuperAdmin UUID exists in superadmin_users table

-- 1. Check what SuperAdmin users exist
SELECT id, username, email, created_at 
FROM public.superadmin_users 
ORDER BY created_at DESC;

-- 2. Check the specific UUID being used (5950cad6-810b-4c5b-9d40-4485ea249770)
SELECT * FROM public.superadmin_users 
WHERE id = '5950cad6-810b-4c5b-9d40-4485ea249770';

-- 3. Test the RLS policy logic manually
SELECT 
    '5950cad6-810b-4c5b-9d40-4485ea249770'::uuid as test_uuid,
    EXISTS (
        SELECT 1 FROM public.superadmin_users 
        WHERE id = '5950cad6-810b-4c5b-9d40-4485ea249770'::uuid
    ) as uuid_exists_in_superadmin_table;

-- 4. Check current RLS policies on books table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'books';
