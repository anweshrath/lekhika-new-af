-- Fix RLS policy to ONLY allow your specific user ID
-- This will show you the users first, then create policy for YOUR user only

-- Show all users to identify your user ID
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 10;

-- Drop ALL existing policies
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON ai_model_metadata;
DROP POLICY IF EXISTS "Allow anon users to view active models" ON ai_model_metadata;
DROP POLICY IF EXISTS "Admins can manage model metadata" ON ai_model_metadata;
DROP POLICY IF EXISTS "Users can view active models" ON ai_model_metadata;
DROP POLICY IF EXISTS "Allow specific superadmin user" ON ai_model_metadata;
DROP POLICY IF EXISTS "Allow authenticated users to view active models" ON ai_model_metadata;

-- Create policy ONLY for your specific user ID
-- Replace '5950cad6-810b-4c5b-9d40-4485ea249770' with YOUR actual user ID from above
CREATE POLICY "Only your user can manage models" 
ON ai_model_metadata 
FOR ALL 
USING (auth.uid() = '5950cad6-810b-4c5b-9d40-4485ea249770'::uuid)
WITH CHECK (auth.uid() = '5950cad6-810b-4c5b-9d40-4485ea249770'::uuid);

-- Allow anonymous users to view active models (for public access)
CREATE POLICY "Anyone can view active models" 
ON ai_model_metadata 
FOR SELECT 
USING (is_active = true);
