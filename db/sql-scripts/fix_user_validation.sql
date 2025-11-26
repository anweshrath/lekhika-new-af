-- Fix user validation in assign_engine_to_user function
-- The function needs to check both users and superadmin_users tables

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
    v_user_data record;
BEGIN
    -- Validate user exists and is active (check both users and superadmin_users tables)
    SELECT * INTO v_user_data FROM users WHERE id = p_user_id AND is_active = true;
    IF NOT FOUND THEN
        -- Check if it's a SuperAdmin user
        SELECT * INTO v_user_data FROM superadmin_users WHERE id = p_user_id AND is_active = true;
        IF NOT FOUND THEN
            RAISE EXCEPTION 'User not found or inactive: %', p_user_id;
        END IF;
    END IF;
    
    -- Validate engine exists and is active
    SELECT * INTO v_engine_data FROM ai_engines WHERE id = p_engine_id AND active = true;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Engine not found or inactive: %', p_engine_id;
    END IF;
    
    -- Generate API key
    v_api_key := generate_user_engine_api_key(p_user_id, p_engine_id);
    
    -- Create user engine copy with ALL required fields
    INSERT INTO user_engines (
        user_id, 
        engine_id, 
        name, 
        description, 
        config, 
        nodes, 
        edges, 
        models, 
        api_key, 
        api_key_created_at, 
        status,
        created_at,
        updated_at
    ) VALUES (
        p_user_id, 
        p_engine_id, 
        v_engine_data.name, 
        v_engine_data.description,
        COALESCE(v_engine_data.flow_config, '{}'::jsonb), 
        COALESCE(v_engine_data.nodes, '[]'::jsonb), 
        COALESCE(v_engine_data.edges, '[]'::jsonb),
        COALESCE(v_engine_data.models, '[]'::jsonb), 
        v_api_key, 
        now(), 
        'active',
        now(),
        now()
    ) ON CONFLICT (user_id, engine_id) DO UPDATE SET
        api_key = v_api_key,
        api_key_created_at = now(),
        updated_at = now(),
        status = 'active';
    
    RETURN v_api_key;
END;
$$;
