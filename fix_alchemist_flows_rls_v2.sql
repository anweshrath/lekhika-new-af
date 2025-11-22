-- Fix RLS policies for alchemist_flows table - Version 2
-- This version handles SuperAdmin authentication properly
-- Run this in Supabase SQL Editor

-- Drop existing policies
DROP POLICY IF EXISTS "SuperAdmin can manage alchemist flows" ON alchemist_flows;
DROP POLICY IF EXISTS "Users can manage their own alchemist flows" ON alchemist_flows;

-- Create a more permissive policy for SuperAdmin operations
-- This allows inserts where created_by matches a SuperAdmin user ID
CREATE POLICY "SuperAdmin operations on alchemist flows"
  ON alchemist_flows
  FOR ALL
  TO authenticated, anon
  USING (
    created_by IN (
      SELECT id FROM superadmin_users WHERE is_active = true
    )
  )
  WITH CHECK (
    created_by IN (
      SELECT id FROM superadmin_users WHERE is_active = true
    )
  );

-- Also create a policy for regular authenticated users (if needed later)
CREATE POLICY "Authenticated users can manage their own alchemist flows" 
  ON alchemist_flows
  FOR ALL
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Verify the policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'alchemist_flows';
