-- Fix RLS for alchemist_flows table to allow SuperAdmin access
-- This allows the Alchemist Lab to work properly

-- Disable RLS for alchemist_flows table
ALTER TABLE alchemist_flows DISABLE ROW LEVEL SECURITY;

-- Add comment explaining why RLS is disabled
COMMENT ON TABLE alchemist_flows IS 'RLS disabled to allow SuperAdmin access. Access control handled at application level.';
