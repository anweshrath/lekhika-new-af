-- Fix RLS policies for alchemist_flows table
-- Run this in Supabase SQL Editor

-- First, check if the policy already exists and drop it if it does
DROP POLICY IF EXISTS "SuperAdmin can manage alchemist flows" ON alchemist_flows;

-- Create the SuperAdmin RLS policy for alchemist_flows
CREATE POLICY "SuperAdmin can manage alchemist flows"
  ON alchemist_flows
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM superadmin_users 
      WHERE id = auth.uid()
    )
  );

-- Also add a policy for users to manage their own flows (if needed)
CREATE POLICY "Users can manage their own alchemist flows" 
  ON alchemist_flows
  FOR ALL
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Verify RLS is enabled (should already be enabled)
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'alchemist_flows';
