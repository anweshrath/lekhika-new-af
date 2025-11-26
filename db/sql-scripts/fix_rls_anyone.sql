-- Fix RLS to allow ANYONE to manage ai_model_metadata
-- This will work regardless of authentication status

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON ai_model_metadata;
DROP POLICY IF EXISTS "Allow anonymous to view active models" ON ai_model_metadata;
DROP POLICY IF EXISTS "Authenticated users can manage ai_model_metadata" ON ai_model_metadata;
DROP POLICY IF EXISTS "Anonymous can view active models" ON ai_model_metadata;
DROP POLICY IF EXISTS "All superadmins full access" ON ai_model_metadata;
DROP POLICY IF EXISTS "Users can view active models" ON ai_model_metadata;
DROP POLICY IF EXISTS "SuperAdmin can manage ai_model_metadata" ON ai_model_metadata;
DROP POLICY IF EXISTS "SuperAdmin anweshrath full access" ON ai_model_metadata;

-- Create policy that allows ANYONE to do ANYTHING
CREATE POLICY "Allow anyone to manage ai_model_metadata" ON ai_model_metadata
FOR ALL 
TO public
USING (true)
WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE ai_model_metadata ENABLE ROW LEVEL SECURITY;
