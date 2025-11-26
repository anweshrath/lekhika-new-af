-- Fix RLS for engine_executions table to allow SuperAdmin access
-- This allows the Token Analytics dashboard to work properly

-- Disable RLS for engine_executions table
ALTER TABLE engine_executions DISABLE ROW LEVEL SECURITY;

-- Add comment explaining why RLS is disabled
COMMENT ON TABLE engine_executions IS 'RLS disabled to allow SuperAdmin analytics access. Access control handled at application level.';
