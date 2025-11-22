/*
  # Complete Database Cleanup and Engine API Keys Implementation
  
  This migration:
  1. Renames redundant tables to OLD_
  2. Creates engine_api_keys table for LEKH-2-xxxx keys
  3. Fixes level mismatch
  4. Cleans up the schema
*/

-- 1. RENAME REDUNDANT TABLES TO OLD_
ALTER TABLE user_flows RENAME TO OLD_user_flows;
ALTER TABLE user_workflows RENAME TO OLD_user_workflows;
ALTER TABLE user_ai_models RENAME TO OLD_user_ai_models;
ALTER TABLE user_credits RENAME TO OLD_user_credits;
ALTER TABLE workflow_assignments RENAME TO OLD_workflow_assignments;
ALTER TABLE workflow_executions RENAME TO OLD_workflow_executions;
ALTER TABLE ai_workflows RENAME TO OLD_ai_workflows;
ALTER TABLE level_workflow_assignments RENAME TO OLD_level_workflow_assignments;

-- 2. CREATE ENGINE API KEYS TABLE
CREATE TABLE IF NOT EXISTS engine_api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  engine_id uuid REFERENCES ai_engines(id) ON DELETE CASCADE NOT NULL,
  api_key text UNIQUE NOT NULL,
  key_type text DEFAULT 'engine_access' CHECK (key_type IN ('engine_access', 'admin', 'system')),
  permissions text[] DEFAULT ARRAY['execute', 'read'],
  is_active boolean DEFAULT true,
  usage_count integer DEFAULT 0,
  last_used timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. ADD API KEY COLUMN TO AI_ENGINES
ALTER TABLE ai_engines ADD COLUMN IF NOT EXISTS api_key text UNIQUE;
ALTER TABLE ai_engines ADD COLUMN IF NOT EXISTS api_key_created_at timestamptz DEFAULT now();

-- 4. ENABLE RLS ON ENGINE_API_KEYS
ALTER TABLE engine_api_keys ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES FOR ENGINE_API_KEYS
DROP POLICY IF EXISTS "Users can view own engine API keys" ON engine_api_keys;
CREATE POLICY "Users can view own engine API keys" ON engine_api_keys
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create engine API keys" ON engine_api_keys;
CREATE POLICY "Users can create engine API keys" ON engine_api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own engine API keys" ON engine_api_keys;
CREATE POLICY "Users can update own engine API keys" ON engine_api_keys
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own engine API keys" ON engine_api_keys;
CREATE POLICY "Users can delete own engine API keys" ON engine_api_keys
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all engine API keys" ON engine_api_keys;
CREATE POLICY "Admins can manage all engine API keys" ON engine_api_keys
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id 
      FROM auth.users 
      WHERE role = 'superadmin'
    )
  );

-- 6. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_engine_api_keys_user_id ON engine_api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_engine_api_keys_engine_id ON engine_api_keys(engine_id);
CREATE INDEX IF NOT EXISTS idx_engine_api_keys_api_key ON engine_api_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_engine_api_keys_is_active ON engine_api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_engines_api_key ON ai_engines(api_key);

-- 7. TRIGGERS FOR UPDATED_AT
CREATE TRIGGER update_engine_api_keys_updated_at 
  BEFORE UPDATE ON engine_api_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. FUNCTION TO GENERATE API KEY
CREATE OR REPLACE FUNCTION generate_engine_api_key(p_user_id uuid, p_engine_id uuid)
RETURNS text AS $$
DECLARE
  v_api_key text;
BEGIN
  -- Generate API key with format: LEKH-2-{user_id_slice}-{engine_id_slice}-{timestamp}-{random}
  v_api_key := 'LEKH-2-' ||
    substr(p_user_id::text, 1, 8) || '-' ||
    substr(p_engine_id::text, 1, 8) || '-' ||
    extract(epoch from now())::text || '-' ||
    substr(md5(random()::text), 1, 16);
  
  RETURN v_api_key;
END;
$$ LANGUAGE plpgsql;

-- 9. FUNCTION TO ASSIGN ENGINE TO USER WITH API KEY
CREATE OR REPLACE FUNCTION assign_engine_to_user(
  p_user_id uuid,
  p_engine_id uuid,
  p_assigned_by uuid DEFAULT NULL
)
RETURNS text AS $$
DECLARE
  v_api_key text;
  v_assignment_id uuid;
BEGIN
  -- Generate API key
  v_api_key := generate_engine_api_key(p_user_id, p_engine_id);
  
  -- Create assignment
  INSERT INTO engine_assignments (
    engine_id,
    assignment_type,
    user_id,
    active
  ) VALUES (
    p_engine_id,
    'user',
    p_user_id,
    true
  ) RETURNING id INTO v_assignment_id;
  
  -- Create API key record
  INSERT INTO engine_api_keys (
    user_id,
    engine_id,
    api_key,
    key_type,
    permissions
  ) VALUES (
    p_user_id,
    p_engine_id,
    v_api_key,
    'engine_access',
    ARRAY['execute', 'read']
  );
  
  -- Update engine with API key
  UPDATE ai_engines 
  SET api_key = v_api_key,
      api_key_created_at = now()
  WHERE id = p_engine_id;
  
  RETURN v_api_key;
END;
$$ LANGUAGE plpgsql;

-- 10. FIX LEVEL MISMATCH - Update level_access to match levels table
UPDATE level_access 
SET macdaddy_access = false, 
    byok_access = false 
WHERE macdaddy_access IS NULL OR byok_access IS NULL;

-- 11. ADD COMMENTS FOR CLARITY
COMMENT ON TABLE engine_api_keys IS 'API keys for engine access with LEKH-2- prefix';
COMMENT ON TABLE OLD_user_flows IS 'DEPRECATED: Use ai_flows instead';
COMMENT ON TABLE OLD_user_workflows IS 'DEPRECATED: Use ai_flows instead';
COMMENT ON TABLE OLD_workflow_assignments IS 'DEPRECATED: Use engine_assignments instead';
COMMENT ON TABLE OLD_workflow_executions IS 'DEPRECATED: Use engine_executions instead';
