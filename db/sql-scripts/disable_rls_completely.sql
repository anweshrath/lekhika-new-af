-- Temporarily disable RLS for ai_model_metadata to fix the issue
ALTER TABLE ai_model_metadata DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "All superadmins full access" ON ai_model_metadata;
DROP POLICY IF EXISTS "Users can view active models" ON ai_model_metadata;
DROP POLICY IF EXISTS "SuperAdmin can manage ai_model_metadata" ON ai_model_metadata;
DROP POLICY IF EXISTS "SuperAdmin anweshrath full access" ON ai_model_metadata;
