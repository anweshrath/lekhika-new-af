-- Fix RPC Function to Bypass RLS
-- Run this on Supabase Dashboard SQL Editor

-- Drop and recreate the function with SECURITY DEFINER
DROP FUNCTION IF EXISTS assign_engine_to_user(uuid, uuid, uuid);

CREATE OR REPLACE FUNCTION assign_engine_to_user(
  p_user_id uuid,
  p_engine_id uuid,
  p_assigned_by uuid DEFAULT NULL
)
RETURNS text
SECURITY DEFINER
SET search_path = public
AS $$
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
