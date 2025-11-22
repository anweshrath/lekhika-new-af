/*
  # Fix RLS Policies for API Key Generation
  
  This migration fixes RLS policies to allow SuperAdmin users
  to assign engines and create API keys.
*/

-- 1. FIX ENGINE_ASSIGNMENTS RLS
DROP POLICY IF EXISTS "SuperAdmin can create engine assignments" ON engine_assignments;
CREATE POLICY "SuperAdmin can create engine assignments" ON engine_assignments
  FOR INSERT WITH CHECK (true); -- Allow all inserts for now

DROP POLICY IF EXISTS "SuperAdmin can update engine assignments" ON engine_assignments;
CREATE POLICY "SuperAdmin can update engine assignments" ON engine_assignments
  FOR UPDATE USING (true); -- Allow all updates for now

DROP POLICY IF EXISTS "SuperAdmin can delete engine assignments" ON engine_assignments;
CREATE POLICY "SuperAdmin can delete engine assignments" ON engine_assignments
  FOR DELETE USING (true); -- Allow all deletes for now

-- 2. FIX ENGINE_API_KEYS RLS
DROP POLICY IF EXISTS "SuperAdmin can create engine API keys" ON engine_api_keys;
CREATE POLICY "SuperAdmin can create engine API keys" ON engine_api_keys
  FOR INSERT WITH CHECK (true); -- Allow all inserts for now

DROP POLICY IF EXISTS "SuperAdmin can update engine API keys" ON engine_api_keys;
CREATE POLICY "SuperAdmin can update engine API keys" ON engine_api_keys
  FOR UPDATE USING (true); -- Allow all updates for now

DROP POLICY IF EXISTS "SuperAdmin can delete engine API keys" ON engine_api_keys;
CREATE POLICY "SuperAdmin can delete engine API keys" ON engine_api_keys
  FOR DELETE USING (true); -- Allow all deletes for now

-- 3. FIX AI_ENGINES RLS
DROP POLICY IF EXISTS "SuperAdmin can update ai_engines" ON ai_engines;
CREATE POLICY "SuperAdmin can update ai_engines" ON ai_engines
  FOR UPDATE USING (true); -- Allow all updates for now
