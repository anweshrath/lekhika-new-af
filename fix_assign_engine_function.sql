-- Fix assign_engine_to_user function to use correct column names
-- The function is trying to access v_engine_data.config but ai_engines has flow_config

-- First create the missing generate_user_engine_api_key function
-- Using uuid-ossp extension which should be available
CREATE OR REPLACE FUNCTION generate_user_engine_api_key(
    p_user_id uuid,
    p_engine_id uuid
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Generate unique API key with LEKH-2- prefix using uuid-ossp
    RETURN 'LEKH-2-' || replace(gen_random_uuid()::text, '-', '');
END;
$$;

-- Now fix the assign_engine_to_user function
CREATE OR REPLACE FUNCTION assign_engine_to_user(
    p_user_id uuid,
    p_engine_id uuid,
    p_assigned_by uuid DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_api_key text;
    v_engine_data record;
BEGIN
    -- Get engine data
    SELECT * INTO v_engine_data FROM ai_engines WHERE id = p_engine_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Engine not found: %', p_engine_id;
    END IF;
    
    -- Generate API key
    v_api_key := generate_user_engine_api_key(p_user_id, p_engine_id);
    
    -- Create user engine copy with correct column names
    INSERT INTO user_engines (
        user_id, engine_id, name, description, config, 
        nodes, edges, models, api_key, api_key_created_at, status
    ) VALUES (
        p_user_id, p_engine_id, v_engine_data.name, v_engine_data.description,
        v_engine_data.flow_config, v_engine_data.nodes, v_engine_data.edges,
        v_engine_data.models, v_api_key, now(), 'active'
    ) ON CONFLICT (user_id, engine_id) DO UPDATE SET
        api_key = v_api_key,
        api_key_created_at = now(),
        updated_at = now();
    
    RETURN v_api_key;
END;
$$;
