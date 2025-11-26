-- Proper RLS Fix - Maintain Security
-- Run this on Supabase Dashboard SQL Editor

-- 1. DROP ALL EXISTING POLICIES ON THESE TABLES
DROP POLICY IF EXISTS "Allow all operations on engine_assignments" ON engine_assignments;
DROP POLICY IF EXISTS "Allow all operations on engine_api_keys" ON engine_api_keys;
DROP POLICY IF EXISTS "Allow all operations on ai_engines" ON ai_engines;
DROP POLICY IF EXISTS "SuperAdmin can create engine assignments" ON engine_assignments;
DROP POLICY IF EXISTS "SuperAdmin can create engine API keys" ON engine_api_keys;
DROP POLICY IF EXISTS "SuperAdmin can update ai_engines" ON ai_engines;

-- 2. CREATE PROPER RLS POLICIES FOR ENGINE_ASSIGNMENTS
CREATE POLICY "Users can view own engine assignments" ON engine_assignments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create engine assignments" ON engine_assignments
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own engine assignments" ON engine_assignments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own engine assignments" ON engine_assignments
  FOR DELETE USING (auth.uid() = user_id);

-- 3. CREATE PROPER RLS POLICIES FOR ENGINE_API_KEYS
CREATE POLICY "Users can view own engine API keys" ON engine_api_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can create engine API keys" ON engine_api_keys
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own engine API keys" ON engine_api_keys
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own engine API keys" ON engine_api_keys
  FOR DELETE USING (auth.uid() = user_id);

-- 4. CREATE PROPER RLS POLICIES FOR AI_ENGINES
CREATE POLICY "Authenticated users can view ai_engines" ON ai_engines
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update ai_engines" ON ai_engines
  FOR UPDATE USING (auth.uid() IS NOT NULL);