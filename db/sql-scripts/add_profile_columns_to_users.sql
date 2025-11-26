-- Add Profile Columns to Existing Users Table
-- This is the best practice - extend existing table rather than create new ones

-- Add profile-related columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS avatar_url TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en' CHECK (language IN ('en', 'es', 'fr', 'de', 'hi')),
ADD COLUMN IF NOT EXISTS theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'auto')),
ADD COLUMN IF NOT EXISTS notifications JSONB DEFAULT '{
  "email": true,
  "push": true, 
  "marketing": false,
  "updates": true,
  "security": true
}'::jsonb,
ADD COLUMN IF NOT EXISTS privacy JSONB DEFAULT '{
  "profile_public": false,
  "show_email": false,
  "show_location": false,
  "show_phone": false
}'::jsonb;

-- Create Storage Bucket for Profile Images (if not exists)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'profile-images',
  'profile-images', 
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for Profile Images
DO $$ 
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can upload own profile images" ON storage.objects;
  DROP POLICY IF EXISTS "Users can view own profile images" ON storage.objects;
  DROP POLICY IF EXISTS "Users can update own profile images" ON storage.objects;
  DROP POLICY IF EXISTS "Users can delete own profile images" ON storage.objects;
  DROP POLICY IF EXISTS "Profile images are publicly readable" ON storage.objects;
  
  -- Create new policies
  CREATE POLICY "Users can upload own profile images" ON storage.objects
    FOR INSERT WITH CHECK (
      bucket_id = 'profile-images' AND 
      auth.uid()::text = (storage.foldername(name))[1]
    );

  CREATE POLICY "Users can view own profile images" ON storage.objects
    FOR SELECT USING (
      bucket_id = 'profile-images' AND 
      auth.uid()::text = (storage.foldername(name))[1]
    );

  CREATE POLICY "Users can update own profile images" ON storage.objects
    FOR UPDATE USING (
      bucket_id = 'profile-images' AND 
      auth.uid()::text = (storage.foldername(name))[1]
    );

  CREATE POLICY "Users can delete own profile images" ON storage.objects
    FOR DELETE USING (
      bucket_id = 'profile-images' AND 
      auth.uid()::text = (storage.foldername(name))[1]
    );

  CREATE POLICY "Profile images are publicly readable" ON storage.objects
    FOR SELECT USING (bucket_id = 'profile-images');
END $$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_avatar_url ON users(avatar_url);
CREATE INDEX IF NOT EXISTS idx_users_theme ON users(theme);
CREATE INDEX IF NOT EXISTS idx_users_language ON users(language);

-- Success message
SELECT 'Profile columns added to users table successfully!' as message;
