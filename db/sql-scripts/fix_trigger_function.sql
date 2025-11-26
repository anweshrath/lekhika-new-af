-- Fix the create_user_engines_for_new_user function
-- The function is trying to use old level_access table structure

CREATE OR REPLACE FUNCTION public.create_user_engines_for_new_user(p_user_id uuid, p_tier text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    engine_record record;
    user_level_name text;
BEGIN
    -- Get the level_name from levels table using the user's level_id
    SELECT l.name INTO user_level_name 
    FROM levels l 
    INNER JOIN users u ON l.id = u.level_id 
    WHERE u.id = p_user_id;
    
    -- Create user engine copies for all engines assigned to their level
    FOR engine_record IN 
        SELECT e.* FROM ai_engines e
        INNER JOIN level_engines le ON e.id = le.engine_id
        WHERE le.level_name = user_level_name
    LOOP
        -- Create user engine copy
        INSERT INTO user_engines (
            user_id,
            engine_id,
            engine_name,
            engine_config,
            nodes,
            edges,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            p_user_id,
            engine_record.id,
            engine_record.name,
            engine_record.config,
            engine_record.nodes,
            engine_record.edges,
            true,
            NOW(),
            NOW()
        );
    END LOOP;
END;
$$;
