/*
  # Fix RLS Policies for Engine Assignments
  
  This migration fixes RLS policies for engine_assignments table
  to allow SuperAdmin users to assign engines to users.
*/

-- 1. DROP EXISTING POLICIES (if any)
DROP POLICY IF EXISTS "Users can view own engine assignments" ON engine_assignments;
DROP POLICY IF EXISTS "Users can create engine assignments" ON engine_assignments;
DROP POLICY IF EXISTS "Users can update own engine assignments" ON engine_assignments;
DROP POLICY IF EXISTS "Users can delete own engine assignments" ON engine_assignments;
DROP POLICY IF EXISTS "Admins can manage all engine assignments" ON engine_assignments;

-- 2. CREATE NEW RLS POLICIES FOR ENGINE_ASSIGNMENTS

-- Allow users to view their own assignments
CREATE POLICY "Users can view own engine assignments" ON engine_assignments
  FOR SELECT USING (auth.uid() = user_id);

-- Allow SuperAdmin users to create assignments
CREATE POLICY "SuperAdmin can create engine assignments" ON engine_assignments
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id 
      FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'superadmin'
    )
  );

-- Allow SuperAdmin users to update assignments
CREATE POLICY "SuperAdmin can update engine assignments" ON engine_assignments
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id 
      FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'superadmin'
    )
  );

-- Allow SuperAdmin users to delete assignments
CREATE POLICY "SuperAdmin can delete engine assignments" ON engine_assignments
  FOR DELETE USING (
    auth.uid() IN (
      SELECT user_id 
      FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'superadmin'
    )
  );

-- 3. ALSO FIX ENGINE_API_KEYS RLS POLICIES

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own engine API keys" ON engine_api_keys;
DROP POLICY IF EXISTS "Users can create engine API keys" ON engine_api_keys;
DROP POLICY IF EXISTS "Users can update own engine API keys" ON engine_api_keys;
DROP POLICY IF EXISTS "Users can delete own engine API keys" ON engine_api_keys;
DROP POLICY IF EXISTS "Admins can manage all engine API keys" ON engine_api_keys;

-- Create new policies
CREATE POLICY "Users can view own engine API keys" ON engine_api_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "SuperAdmin can create engine API keys" ON engine_api_keys
  FOR INSERT WITH CHECK (
    auth.uid() IN (
      SELECT user_id 
      FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'superadmin'
    )
  );

CREATE POLICY "SuperAdmin can update engine API keys" ON engine_api_keys
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id 
      FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'superadmin'
    )
  );

CREATE POLICY "SuperAdmin can delete engine API keys" ON engine_api_keys
  FOR DELETE USING (
    auth.uid() IN (
      SELECT user_id 
      FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'superadmin'
    )
  );

-- 4. UPDATE AI_ENGINES TABLE RLS (if needed)
DROP POLICY IF EXISTS "SuperAdmin can update ai_engines" ON ai_engines;

CREATE POLICY "SuperAdmin can update ai_engines" ON ai_engines
  FOR UPDATE USING (
    auth.uid() IN (
      SELECT user_id 
      FROM auth.users 
      WHERE raw_user_meta_data->>'role' = 'superadmin'
    )
  );

-- 5. GRANT NECESSARY PERMISSIONS
GRANT ALL ON engine_assignments TO authenticated;
GRANT ALL ON engine_api_keys TO authenticated;
GRANT ALL ON ai_engines TO authenticated;
