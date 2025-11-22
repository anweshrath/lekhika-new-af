-- =====================================================
-- FIX PROMPT_TEMPLATES RLS POLICIES FOR CUSTOM AUTH
-- =====================================================

-- Drop existing policies
DROP POLICY IF EXISTS "SuperAdmin can manage all prompt templates" ON prompt_templates;
DROP POLICY IF EXISTS "Users can view public prompt templates" ON prompt_templates;
DROP POLICY IF EXISTS "Users can view their own prompt templates" ON prompt_templates;

-- Create new policies for custom authentication
-- Allow SuperAdmin to manage all prompt templates (no auth check for now)
CREATE POLICY "SuperAdmin can manage all prompt templates" ON prompt_templates
  FOR ALL USING (true);

-- Allow public access to public templates
CREATE POLICY "Public access to public templates" ON prompt_templates
  FOR SELECT USING (is_public = true);

-- Allow SuperAdmin to insert templates (no auth check for now)
CREATE POLICY "SuperAdmin can insert templates" ON prompt_templates
  FOR INSERT WITH CHECK (true);

-- =====================================================
-- VERIFY POLICIES
-- =====================================================
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'prompt_templates';
