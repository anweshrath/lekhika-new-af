-- Simple Working Storage Policies for Profile Images
-- This approach should definitely work

-- First, create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can upload own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own profile images" ON storage.objects;
DROP POLICY IF EXISTS "Profile images are publicly readable" ON storage.objects;

-- Create simple, working policies
-- Policy 1: Allow authenticated users to upload to profile-images bucket
CREATE POLICY "Allow uploads to profile-images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'profile-images');

-- Policy 2: Allow everyone to view profile-images
CREATE POLICY "Allow public access to profile-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-images');

-- Policy 3: Allow authenticated users to update profile-images
CREATE POLICY "Allow updates to profile-images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'profile-images');

-- Policy 4: Allow authenticated users to delete profile-images
CREATE POLICY "Allow deletes to profile-images" ON storage.objects
  FOR DELETE USING (bucket_id = 'profile-images');

-- Success message
SELECT 'Simple storage policies created successfully!' as message;
