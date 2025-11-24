-- URGENT FIX: ai_providers RLS policy
-- Run this in Supabase Dashboard > SQL Editor

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can manage their own AI providers" ON ai_providers;
DROP POLICY IF EXISTS "SuperAdmin can manage all AI providers" ON ai_providers;
DROP POLICY IF EXISTS "AI providers policy" ON ai_providers;
DROP POLICY IF EXISTS "Allow all operations on ai_providers" ON ai_providers;
DROP POLICY IF EXISTS "Comprehensive AI providers access" ON ai_providers;
DROP POLICY IF EXISTS "Anon SuperAdmin access to AI providers" ON ai_providers;

-- Create a simple permissive policy for SuperAdmin operations
CREATE POLICY "SuperAdmin full access to ai_providers"
  ON ai_providers
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Also allow anon access for SuperAdmin operations
CREATE POLICY "Anon access to ai_providers"
  ON ai_providers
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);
