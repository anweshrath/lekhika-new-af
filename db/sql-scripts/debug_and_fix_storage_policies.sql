-- Debug and Fix Profile Images Storage Policies
-- Let's use a simpler, more reliable approach

-- First, let's see what's in the storage.objects table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'storage' AND table_name = 'objects';

-- Let's also check if the bucket exists and its configuration
SELECT * FROM storage.buckets WHERE id = 'profile-images';

-- Drop all existing policies for profile-images
DROP POLICY IF EXISTS "Users can upload own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Profile images are publicly readable" ON storage.objects;

-- Create a simpler, more reliable policy using string functions
-- Policy 1: Users can upload their own profile images
CREATE POLICY "Users can upload own profile images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-images' AND 
    auth.uid()::text = split_part(name, '/', 1)
  );

-- Policy 2: Users can view their own profile images  
CREATE POLICY "Users can view own profile images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'profile-images' AND 
    auth.uid()::text = split_part(name, '/', 1)
  );

-- Policy 3: Users can update their own profile images
CREATE POLICY "Users can update own profile images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-images' AND 
    auth.uid()::text = split_part(name, '/', 1)
  );

-- Policy 4: Users can delete their own profile images
CREATE POLICY "Users can delete own profile images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-images' AND 
    auth.uid()::text = split_part(name, '/', 1)
  );

-- Policy 5: All profile images are publicly readable (for UI display)
CREATE POLICY "Profile images are publicly readable" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-images');

-- Success message
SELECT 'Profile images RLS policies updated with simpler approach!' as message;
