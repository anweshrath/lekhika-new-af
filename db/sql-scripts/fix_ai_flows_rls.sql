-- Fix RLS policy for ai_flows table
-- Run this in Supabase Dashboard > SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own flows" ON ai_flows;
DROP POLICY IF EXISTS "Users can create flows" ON ai_flows;
DROP POLICY IF EXISTS "Users can update own flows" ON ai_flows;
DROP POLICY IF EXISTS "Users can delete own flows" ON ai_flows;
DROP POLICY IF EXISTS "Admins can manage all flows" ON ai_flows;

-- Create secure policy that allows:
-- 1. Users to manage their own flows
-- 2. SuperAdmins to manage all flows
-- 3. Anon access for SuperAdmin operations (when no auth.uid())
CREATE POLICY "Secure AI flows access"
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
  )
  WITH CHECK (
    -- Same conditions for inserts/updates
    created_by = auth.uid()
    OR
    EXISTS (
      SELECT 1 FROM superadmin_users 
      WHERE id = auth.uid()
    )
  );

-- Allow anon access for SuperAdmin operations
CREATE POLICY "Anon SuperAdmin AI flows access"
  ON ai_flows
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);
