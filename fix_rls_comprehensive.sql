-- Comprehensive RLS Fix for API Key Generation
-- Run this on Supabase Dashboard SQL Editor

-- 1. TEMPORARILY DISABLE RLS ON PROBLEMATIC TABLES
ALTER TABLE engine_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE engine_api_keys DISABLE ROW LEVEL SECURITY;

-- 2. GRANT FULL PERMISSIONS TO AUTHENTICATED USERS
GRANT ALL ON engine_assignments TO authenticated;
GRANT ALL ON engine_api_keys TO authenticated;
GRANT ALL ON ai_engines TO authenticated;

-- 3. RE-ENABLE RLS WITH PERMISSIVE POLICIES
ALTER TABLE engine_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE engine_api_keys ENABLE ROW LEVEL SECURITY;

-- 4. CREATE PERMISSIVE POLICIES
CREATE POLICY "Allow all operations on engine_assignments" ON engine_assignments
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on engine_api_keys" ON engine_api_keys
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on ai_engines" ON ai_engines
  FOR ALL USING (true) WITH CHECK (true);

-- 5. VERIFY POLICIES ARE CREATED
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('engine_assignments', 'engine_api_keys', 'ai_engines');
