-- Temporarily disable RLS for ai_model_metadata table to allow inserts
-- This is a quick fix for testing

-- Disable RLS temporarily
ALTER TABLE ai_model_metadata DISABLE ROW LEVEL SECURITY;

-- Verify it's disabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'ai_model_metadata';
