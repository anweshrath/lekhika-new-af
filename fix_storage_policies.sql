-- Fix Storage Policies for Profile Images
-- This fixes the RLS policy issue

-- Drop existing policies
DROP POLICY IF EXISTS "Users can upload own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Profile images are publicly readable" ON storage.objects;

-- Create simpler, more reliable policies
CREATE POLICY "Users can upload own profile images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'profile-images' AND 
    auth.uid()::text = split_part(name, '/', 1)
  );

CREATE POLICY "Users can view own profile images" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'profile-images' AND 
    auth.uid()::text = split_part(name, '/', 1)
  );

CREATE POLICY "Users can update own profile images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'profile-images' AND 
    auth.uid()::text = split_part(name, '/', 1)
  );

CREATE POLICY "Users can delete own profile images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'profile-images' AND 
    auth.uid()::text = split_part(name, '/', 1)
  );

-- Public read access for profile images
CREATE POLICY "Profile images are publicly readable" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-images');

-- Success message
SELECT 'Storage policies fixed successfully!' as message;
