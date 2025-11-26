-- Clean Multitenant Structure Migration
-- This migration creates the clean structure for flows -> engines -> user copies

-- 1. Create user_engines table (user-specific engine copies)
CREATE TABLE IF NOT EXISTS user_engines (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    engine_id uuid NOT NULL REFERENCES ai_engines(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    config jsonb DEFAULT '{}',
    nodes jsonb DEFAULT '[]',
    edges jsonb DEFAULT '[]',
    models jsonb DEFAULT '[]',
    api_key text UNIQUE,
    api_key_created_at timestamptz,
    status text DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    -- Ensure one copy per user per engine
    UNIQUE(user_id, engine_id)
);

-- 2. Create level_engines table (level permissions)
CREATE TABLE IF NOT EXISTS level_engines (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    level_id uuid NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
    engine_id uuid NOT NULL REFERENCES ai_engines(id) ON DELETE CASCADE,
    access_type text DEFAULT 'execute' CHECK (access_type IN ('read', 'execute')),
    created_at timestamptz DEFAULT now(),
    
    -- Ensure one entry per level per engine
    UNIQUE(level_id, engine_id)
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_engines_user_id ON user_engines(user_id);
CREATE INDEX IF NOT EXISTS idx_user_engines_engine_id ON user_engines(engine_id);
CREATE INDEX IF NOT EXISTS idx_user_engines_api_key ON user_engines(api_key);
CREATE INDEX IF NOT EXISTS idx_user_engines_status ON user_engines(status);

CREATE INDEX IF NOT EXISTS idx_level_engines_level_id ON level_engines(level_id);
CREATE INDEX IF NOT EXISTS idx_level_engines_engine_id ON level_engines(engine_id);
CREATE INDEX IF NOT EXISTS idx_level_engines_access_type ON level_engines(access_type);

-- 4. Enable RLS
ALTER TABLE user_engines ENABLE ROW LEVEL SECURITY;
ALTER TABLE level_engines ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for user_engines
CREATE POLICY "Users can view own engines" ON user_engines
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own engines" ON user_engines
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "SuperAdmin can view all user engines" ON user_engines
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'superadmin'
        )
    );

CREATE POLICY "SuperAdmin can manage user engines" ON user_engines
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'superadmin'
        )
    );

-- 6. Create RLS policies for level_engines
CREATE POLICY "Authenticated users can view level engines" ON level_engines
    FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "SuperAdmin can manage level engines" ON level_engines
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'superadmin'
        )
    );

-- 7. Create function to generate user engine API key
CREATE OR REPLACE FUNCTION generate_user_engine_api_key(
    p_user_id uuid,
    p_engine_id uuid
)
RETURNS text AS $$
DECLARE
    v_api_key text;
BEGIN
    -- Generate LEKH-2- prefixed API key
    v_api_key := 'LEKH-2-' || 
                 substr(p_user_id::text, 1, 8) || '-' ||
                 substr(p_engine_id::text, 1, 8) || '-' ||
                 to_char(now(), 'YYYYMMDDHH24MISS') || '-' ||
                 substr(md5(random()::text), 1, 8);
    
    RETURN v_api_key;
END;
$$ LANGUAGE plpgsql;

-- 8. Create function to assign engine to user
CREATE OR REPLACE FUNCTION assign_engine_to_user(
    p_user_id uuid,
    p_engine_id uuid,
    p_assigned_by uuid DEFAULT NULL
)
RETURNS text AS $$
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
    
    -- Create user engine copy
    INSERT INTO user_engines (
        user_id, engine_id, name, description, config, 
        nodes, edges, models, api_key, api_key_created_at
    ) VALUES (
        p_user_id, p_engine_id, v_engine_data.name, v_engine_data.description,
        v_engine_data.config, v_engine_data.nodes, v_engine_data.edges,
        v_engine_data.models, v_api_key, now()
    ) ON CONFLICT (user_id, engine_id) DO UPDATE SET
        api_key = v_api_key,
        api_key_created_at = now(),
        updated_at = now();
    
    RETURN v_api_key;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 9. Create function to assign engine to level
CREATE OR REPLACE FUNCTION assign_engine_to_level(
    p_level_id uuid,
    p_engine_id uuid,
    p_access_type text DEFAULT 'execute'
)
RETURNS void AS $$
BEGIN
    -- Create level engine assignment
    INSERT INTO level_engines (level_id, engine_id, access_type)
    VALUES (p_level_id, p_engine_id, p_access_type)
    ON CONFLICT (level_id, engine_id) DO UPDATE SET
        access_type = p_access_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 10. Create function to create user engines for new user
CREATE OR REPLACE FUNCTION create_user_engines_for_new_user(
    p_user_id uuid,
    p_level_id uuid
)
RETURNS void AS $$
DECLARE
    engine_record record;
BEGIN
    -- Create user engine copies for all engines assigned to their level
    FOR engine_record IN 
        SELECT e.* FROM ai_engines e
        JOIN level_engines le ON e.id = le.engine_id
        WHERE le.level_id = p_level_id
        AND e.status = 'active'
    LOOP
        PERFORM assign_engine_to_user(p_user_id, engine_record.id);
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 11. Create trigger to auto-create user engines on user creation
CREATE OR REPLACE FUNCTION trigger_create_user_engines()
RETURNS trigger AS $$
BEGIN
    -- Only create engines if user has a level assigned
    IF NEW.level_id IS NOT NULL THEN
        PERFORM create_user_engines_for_new_user(NEW.id, NEW.level_id);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 12. Create trigger for user creation
CREATE TRIGGER trigger_user_created
    AFTER INSERT ON users
    FOR EACH ROW
    EXECUTE FUNCTION trigger_create_user_engines();

-- 13. Add updated_at trigger for user_engines
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_engines_updated_at
    BEFORE UPDATE ON user_engines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 14. Clean up old redundant tables (rename to OLD_ prefix)
ALTER TABLE IF EXISTS engine_assignments RENAME TO OLD_engine_assignments;
ALTER TABLE IF EXISTS engine_api_keys RENAME TO OLD_engine_api_keys;
ALTER TABLE IF EXISTS user_api_keys RENAME TO OLD_user_api_keys;
ALTER TABLE IF EXISTS user_engine_assignments RENAME TO OLD_user_engine_assignments;

-- 15. Add comments for documentation
COMMENT ON TABLE user_engines IS 'User-specific copies of engines with unique API keys';
COMMENT ON TABLE level_engines IS 'Level-based engine access permissions';
COMMENT ON FUNCTION assign_engine_to_user IS 'Assigns an engine to a user and creates their copy';
COMMENT ON FUNCTION assign_engine_to_level IS 'Assigns an engine to a level for all users in that level';
COMMENT ON FUNCTION create_user_engines_for_new_user IS 'Creates engine copies for new users based on their level';
