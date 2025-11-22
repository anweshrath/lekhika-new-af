-- Fix RLS policy for ai_model_metadata table
-- Make it more permissive for testing

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can manage model metadata" ON ai_model_metadata;
DROP POLICY IF EXISTS "Users can view active models" ON ai_model_metadata;

-- Create new permissive policies
CREATE POLICY "Allow all operations for authenticated users" 
ON ai_model_metadata 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Also create a policy for anon users to view active models
CREATE POLICY "Allow anon users to view active models" 
ON ai_model_metadata 
FOR SELECT 
TO anon
USING (is_active = true);
