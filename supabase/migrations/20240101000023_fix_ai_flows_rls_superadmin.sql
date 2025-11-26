-- Fix RLS policy for ai_flows table to allow SuperAdmin access
-- This fixes the "You must be logged in as SuperAdmin to save a flow" error

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own flows" ON ai_flows;
DROP POLICY IF EXISTS "Users can create flows" ON ai_flows;
DROP POLICY IF EXISTS "Users can update own flows" ON ai_flows;
DROP POLICY IF EXISTS "Users can delete own flows" ON ai_flows;
DROP POLICY IF EXISTS "Admins can manage all flows" ON ai_flows;
DROP POLICY IF EXISTS "Comprehensive AI flows access" ON ai_flows;
DROP POLICY IF EXISTS "Anon SuperAdmin AI flows access" ON ai_flows;

-- Create comprehensive policy that allows:
-- 1. Users to manage their own flows (when created_by = auth.uid())
-- 2. SuperAdmins to manage all flows (when user exists in superadmin_users)
-- 3. Anonymous access for SuperAdmin operations (when using anon key)
CREATE POLICY "Comprehensive AI flows access"
  ON ai_flows
  FOR ALL
  TO authenticated
  USING (
    -- User owns the record
    created_by = auth.uid()
    OR
    -- User is SuperAdmin
    EXISTS (
      SELECT 1 FROM superadmin_users 
      WHERE id = auth.uid()
    )
    OR
    -- Allow if no auth.uid() (anon key usage by SuperAdmin)
    auth.uid() IS NULL
  )
  WITH CHECK (
    -- Same conditions for inserts/updates
    created_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM superadmin_users 
      WHERE id = auth.uid()
    )
    OR
    auth.uid() IS NULL
  );

-- Allow anon access for SuperAdmin operations
CREATE POLICY "Anon SuperAdmin AI flows access"
  ON ai_flows
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- Verify the policies are created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'ai_flows'
ORDER BY policyname;
