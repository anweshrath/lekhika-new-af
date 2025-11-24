-- Simple RLS fix - allow all authenticated users to insert/update
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON ai_model_metadata;
DROP POLICY IF EXISTS "Allow anon users to view active models" ON ai_model_metadata;
DROP POLICY IF EXISTS "Admins can manage model metadata" ON ai_model_metadata;
DROP POLICY IF EXISTS "Users can view active models" ON ai_model_metadata;

-- Create simple policy that allows all authenticated users
CREATE POLICY "Allow authenticated users all operations" 
ON ai_model_metadata 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);

-- Allow anonymous users to view active models
CREATE POLICY "Allow anon users to view active models" 
ON ai_model_metadata 
FOR SELECT 
TO anon
USING (is_active = true);
