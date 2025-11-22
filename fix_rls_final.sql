-- Final RLS fix - completely permissive for ai_model_metadata
-- This will allow ALL operations on the table

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Authenticated users can manage ai_model_metadata" ON ai_model_metadata;
DROP POLICY IF EXISTS "Anonymous can view active models" ON ai_model_metadata;
DROP POLICY IF EXISTS "All superadmins full access" ON ai_model_metadata;
DROP POLICY IF EXISTS "Users can view active models" ON ai_model_metadata;
DROP POLICY IF EXISTS "SuperAdmin can manage ai_model_metadata" ON ai_model_metadata;
DROP POLICY IF EXISTS "SuperAdmin anweshrath full access" ON ai_model_metadata;

-- Create completely permissive policy for authenticated users
CREATE POLICY "Allow all operations for authenticated users" ON ai_model_metadata
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Create policy for anonymous users to view active models
CREATE POLICY "Allow anonymous to view active models" ON ai_model_metadata
FOR SELECT 
TO anon
USING (is_active = true);

-- Ensure RLS is enabled
ALTER TABLE ai_model_metadata ENABLE ROW LEVEL SECURITY;
