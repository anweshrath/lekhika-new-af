/*
  # Add API Key Support to Existing Engine System
  
  This migration adds API key functionality to the existing engine system:
  
  1. Add API key column to ai_engines table
  2. Create user_api_keys table for API key management
  3. Add RLS policies for API key access
  
  This is the MINIMAL approach - no redundant tables, no patchwork.
*/

-- 1. ADD API KEY COLUMN TO EXISTING AI_ENGINES TABLE
ALTER TABLE ai_engines ADD COLUMN IF NOT EXISTS api_key text UNIQUE;
ALTER TABLE ai_engines ADD COLUMN IF NOT EXISTS api_key_created_at timestamptz DEFAULT now();

-- 2. CREATE USER API KEYS TABLE - Store API keys for engine access
CREATE TABLE IF NOT EXISTS user_api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  engine_id uuid REFERENCES ai_engines(id) ON DELETE CASCADE NOT NULL,
  api_key text UNIQUE NOT NULL,
  key_type text DEFAULT 'engine_access' CHECK (key_type IN ('engine_access', 'admin', 'system')),
  permissions text[] DEFAULT '["execute", "read"]',
  is_active boolean DEFAULT true,
  usage_count integer DEFAULT 0,
  last_used timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR USER_API_KEYS
DROP POLICY IF EXISTS "Users can view own API keys" ON user_api_keys;
CREATE POLICY "Users can view own API keys" ON user_api_keys
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create API keys" ON user_api_keys;
CREATE POLICY "Users can create API keys" ON user_api_keys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own API keys" ON user_api_keys;
CREATE POLICY "Users can update own API keys" ON user_api_keys
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own API keys" ON user_api_keys;
CREATE POLICY "Users can delete own API keys" ON user_api_keys
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all API keys" ON user_api_keys;
CREATE POLICY "Admins can manage all API keys" ON user_api_keys
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id 
      FROM auth.users 
      WHERE role = 'superadmin'
    )
  );

-- PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_user_api_keys_user_id ON user_api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_user_api_keys_engine_id ON user_api_keys(engine_id);
CREATE INDEX IF NOT EXISTS idx_user_api_keys_api_key ON user_api_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_user_api_keys_is_active ON user_api_keys(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_engines_api_key ON ai_engines(api_key);

-- TRIGGERS FOR UPDATED_AT
CREATE TRIGGER update_user_api_keys_updated_at 
  BEFORE UPDATE ON user_api_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- FUNCTION TO GENERATE API KEY
CREATE OR REPLACE FUNCTION generate_api_key(p_user_id uuid, p_engine_id uuid)
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

-- FUNCTION TO ASSIGN ENGINE TO USER WITH API KEY
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
  v_api_key := generate_api_key(p_user_id, p_engine_id);
  
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
  INSERT INTO user_api_keys (
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
