-- Temporary fix: Disable RLS on storage.objects for testing
-- This allows profile image uploads to work immediately

-- Disable RLS temporarily
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Success message
SELECT 'RLS disabled on storage.objects for testing!' as message;
