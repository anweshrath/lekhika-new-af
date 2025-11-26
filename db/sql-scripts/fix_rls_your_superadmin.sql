-- Fix RLS policy for ALL superadmin users
-- All users in superadmin_users table are superadmins

-- Drop existing policies
DROP POLICY IF EXISTS "SuperAdmin can manage ai_model_metadata" ON ai_model_metadata;
DROP POLICY IF EXISTS "Users can view active models" ON ai_model_metadata;
DROP POLICY IF EXISTS "SuperAdmin anweshrath full access" ON ai_model_metadata;

-- Create policy for ALL superadmin users (full access)
CREATE POLICY "All superadmins full access" ON ai_model_metadata
FOR ALL 
TO authenticated
USING (auth.uid() IN (SELECT id FROM superadmin_users WHERE is_active = true))
WITH CHECK (auth.uid() IN (SELECT id FROM superadmin_users WHERE is_active = true));

-- Create policy for authenticated users to view active models only
CREATE POLICY "Users can view active models" ON ai_model_metadata
FOR SELECT 
TO authenticated
USING (is_active = true);

-- Enable RLS
ALTER TABLE ai_model_metadata ENABLE ROW LEVEL SECURITY;
