-- =====================================================
-- COMPLETE FIX FOR LEVEL-BASED ENGINE ASSIGNMENT
-- =====================================================
-- This migration fixes all schema mismatches and broken functions
-- for automatic engine assignment based on user levels

-- =====================================================
-- STEP 1: BACKUP EXISTING FUNCTIONS
-- =====================================================

-- Create backup functions with _backup suffix
CREATE OR REPLACE FUNCTION create_user_engines_for_new_user_backup(p_user_id uuid, p_tier text)
RETURNS void AS $$
DECLARE
    engine_record record;
BEGIN
    -- Create user engine copies for all engines assigned to their tier
    FOR engine_record IN 
        SELECT e.* FROM ai_engines e
        INNER JOIN level_engines le ON e.id = le.engine_id
        INNER JOIN level_access la ON le.level_name = la.feature_name
        WHERE CASE 
            WHEN p_tier = 'hobby' THEN la.hobby_access = true
            WHEN p_tier = 'pro' THEN la.pro_access = true
            WHEN p_tier = 'macdaddy' THEN la.macdaddy_access = true
            WHEN p_tier = 'byok' THEN la.byok_access = true
            ELSE false
        END
    LOOP
        -- Create user engine copy
        INSERT INTO user_engines (
            user_id,
            engine_id,
            engine_name,
            engine_description,
            engine_config,
            nodes,
            edges,
            models,
            api_key,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            p_user_id,
            engine_record.id,
            engine_record.name,
            engine_record.description,
            engine_record.config,
            engine_record.nodes,
            engine_record.edges,
            engine_record.models,
            'LEKH-2-' || encode(gen_random_bytes(16), 'hex'),
            true,
            now(),
            now()
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 2: FIX create_user_engines_for_new_user() FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION create_user_engines_for_new_user(p_user_id uuid, p_tier text)
RETURNS void AS $$
DECLARE
    engine_record record;
BEGIN
    -- Get engines assigned to user's level via level_engines table
    FOR engine_record IN 
        SELECT e.*, le.access_type 
        FROM ai_engines e
        INNER JOIN level_engines le ON e.id = le.engine_id
        INNER JOIN levels l ON le.level_id = l.id
        INNER JOIN users u ON l.id = u.level_id
        WHERE u.id = p_user_id AND u.tier = p_tier
    LOOP
        -- Create user engine copy with CORRECT column names and API key
        INSERT INTO user_engines (
            user_id, engine_id, name, description, config, 
            nodes, edges, models, api_key, api_key_created_at, status
        ) VALUES (
            p_user_id, engine_record.id, engine_record.name, engine_record.description,
            engine_record.flow_config, engine_record.nodes, engine_record.edges,
            engine_record.models, 
            generate_user_engine_api_key(p_user_id, engine_record.id), -- API KEY!
            now(), 'active'
        ) ON CONFLICT (user_id, engine_id) DO UPDATE SET
            updated_at = now();
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================================
-- STEP 3: FIX auto_assign_engines_for_level() FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION auto_assign_engines_for_level(p_user_id uuid, p_level_name text)
RETURNS void AS $$
DECLARE
    engine_record record;
BEGIN
    -- Get engines assigned to this level
    FOR engine_record IN
        SELECT ae.* FROM ai_engines ae
        JOIN level_engines le ON ae.id = le.engine_id
        JOIN levels l ON le.level_id = l.id
        WHERE l.name = p_level_name AND ae.is_active = true
    LOOP
        -- Check if user already has this engine
        IF NOT EXISTS (
            SELECT 1 FROM user_engines 
            WHERE user_id = p_user_id AND engine_id = engine_record.id
        ) THEN
            -- Create user engine copy with CORRECT columns and API key
            INSERT INTO user_engines (
                user_id, engine_id, name, description, config, 
                nodes, edges, models, api_key, api_key_created_at, status
            ) VALUES (
                p_user_id, engine_record.id, engine_record.name, engine_record.description,
                engine_record.flow_config, engine_record.nodes, engine_record.edges,
                engine_record.models,
                generate_user_engine_api_key(p_user_id, engine_record.id), -- API KEY!
                now(), 'active'
            );
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================================
-- STEP 4: CREATE TRIGGER FOR LEVEL ENGINE ASSIGNMENT
-- =====================================================

-- Function called by trigger when engine is assigned to level
CREATE OR REPLACE FUNCTION trigger_assign_engine_to_level_users()
RETURNS TRIGGER AS $$
DECLARE
    user_record record;
    level_name text;
BEGIN
    -- Get level name
    SELECT name INTO level_name FROM levels WHERE id = NEW.level_id;
    
    -- Get all users in this level
    FOR user_record IN
        SELECT id FROM users u
        JOIN levels l ON u.level_id = l.id
        WHERE l.id = NEW.level_id
    LOOP
        -- Assign engine to this user
        PERFORM auto_assign_engines_for_level(user_record.id, level_name);
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for level_engines table
DROP TRIGGER IF EXISTS trigger_assign_engine_to_level_users ON level_engines;
CREATE TRIGGER trigger_assign_engine_to_level_users
    AFTER INSERT ON level_engines
    FOR EACH ROW
    EXECUTE FUNCTION trigger_assign_engine_to_level_users();

-- =====================================================
-- STEP 5: CREATE TRIGGER FOR USER LEVEL CHANGES
-- =====================================================

-- Function to handle when user's level changes
CREATE OR REPLACE FUNCTION trigger_user_level_changed()
RETURNS TRIGGER AS $$
DECLARE
    old_level_name text;
    new_level_name text;
BEGIN
    -- Get level names
    SELECT name INTO old_level_name FROM levels WHERE id = OLD.level_id;
    SELECT name INTO new_level_name FROM levels WHERE id = NEW.level_id;
    
    -- If level actually changed
    IF OLD.level_id != NEW.level_id THEN
        -- Remove engines from old level (optional - you might want to keep them)
        -- DELETE FROM user_engines WHERE user_id = NEW.id AND engine_id IN (
        --     SELECT engine_id FROM level_engines le 
        --     JOIN levels l ON le.level_id = l.id 
        --     WHERE l.name = old_level_name
        -- );
        
        -- Assign engines from new level
        IF new_level_name IS NOT NULL THEN
            PERFORM auto_assign_engines_for_level(NEW.id, new_level_name);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for users table level changes
DROP TRIGGER IF EXISTS trigger_user_level_changed ON users;
CREATE TRIGGER trigger_user_level_changed
    AFTER UPDATE OF level_id ON users
    FOR EACH ROW
    EXECUTE FUNCTION trigger_user_level_changed();

-- =====================================================
-- STEP 6: ADD COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON FUNCTION create_user_engines_for_new_user IS 'Creates engine copies for new users based on their level - FIXED VERSION';
COMMENT ON FUNCTION auto_assign_engines_for_level IS 'Assigns engines to user based on their level - FIXED VERSION';
COMMENT ON FUNCTION trigger_assign_engine_to_level_users IS 'Trigger function to assign engines to all users when engine is assigned to level';
COMMENT ON FUNCTION trigger_user_level_changed IS 'Trigger function to reassign engines when user level changes';

-- =====================================================
-- STEP 7: VERIFICATION QUERIES (FOR TESTING)
-- =====================================================

-- These queries can be used to test the fixes:
-- 
-- 1. Test user creation trigger:
--    INSERT INTO users (email, tier, level_id) VALUES ('test@example.com', 'pro', (SELECT id FROM levels WHERE name = 'pro'));
--    SELECT * FROM user_engines WHERE user_id = (SELECT id FROM users WHERE email = 'test@example.com');
--
-- 2. Test level engine assignment:
--    INSERT INTO level_engines (level_id, engine_id) VALUES ((SELECT id FROM levels WHERE name = 'pro'), (SELECT id FROM ai_engines LIMIT 1));
--    SELECT * FROM user_engines WHERE user_id IN (SELECT id FROM users WHERE level_id = (SELECT id FROM levels WHERE name = 'pro'));
--
-- 3. Test level change trigger:
--    UPDATE users SET level_id = (SELECT id FROM levels WHERE name = 'enterprise') WHERE email = 'test@example.com';
--    SELECT * FROM user_engines WHERE user_id = (SELECT id FROM users WHERE email = 'test@example.com');

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
