-- Fix Only INSERT Policies for API Key Generation
-- Run this on Supabase Dashboard SQL Editor

-- 1. DROP ONLY INSERT POLICIES
DROP POLICY IF EXISTS "Authenticated users can create engine assignments" ON engine_assignments;
DROP POLICY IF EXISTS "Authenticated users can create engine API keys" ON engine_api_keys;
DROP POLICY IF EXISTS "SuperAdmin can create engine assignments" ON engine_assignments;
DROP POLICY IF EXISTS "SuperAdmin can create engine API keys" ON engine_api_keys;

-- 2. CREATE NEW INSERT POLICIES
CREATE POLICY "Allow authenticated users to create engine assignments" ON engine_assignments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to create engine API keys" ON engine_api_keys
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 3. ALSO FIX AI_ENGINES UPDATE POLICY
DROP POLICY IF EXISTS "Authenticated users can update ai_engines" ON ai_engines;
DROP POLICY IF EXISTS "SuperAdmin can update ai_engines" ON ai_engines;

CREATE POLICY "Allow authenticated users to update ai_engines" ON ai_engines
  FOR UPDATE USING (auth.uid() IS NOT NULL);
