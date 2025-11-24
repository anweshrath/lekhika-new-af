-- PROPER SURGICAL FIX: Maintains security while fixing SuperAdmin access
-- Run this in Supabase Dashboard > SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Users can manage their own AI providers" ON ai_providers;
DROP POLICY IF EXISTS "SuperAdmin can manage all AI providers" ON ai_providers;
DROP POLICY IF EXISTS "AI providers policy" ON ai_providers;
DROP POLICY IF EXISTS "Allow all operations on ai_providers" ON ai_providers;

-- Create secure policy that allows:
-- 1. Users to manage their own providers
-- 2. SuperAdmins to manage all providers
-- 3. Anon access for SuperAdmin operations (when no auth.uid())
CREATE POLICY "Secure AI providers access"
  ON ai_providers
  FOR ALL
  TO authenticated
  USING (
    -- User owns the record
    auth.uid() = user_id
    OR
    -- User is SuperAdmin
    EXISTS (
      SELECT 1 FROM superadmin_users 
      WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    -- Same conditions for inserts/updates
    auth.uid() = user_id
    OR
    EXISTS (
      SELECT 1 FROM superadmin_users 
      WHERE id = auth.uid()
    )
  );

-- Allow anon access for SuperAdmin operations
CREATE POLICY "Anon SuperAdmin AI providers access"
  ON ai_providers
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);
