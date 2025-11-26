-- User References and Preferences Migration
-- Adds support for document uploads, global instructions, and master sync system

-- 1. Create user_references table for uploaded documents
CREATE TABLE IF NOT EXISTS user_references (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    file_type text NOT NULL, -- 'pdf', 'docx', 'txt', 'epub', etc.
    file_size bigint NOT NULL, -- in bytes
    file_path text NOT NULL, -- Supabase Storage path
    content_summary text, -- AI-generated summary of the document
    upload_date timestamptz DEFAULT now(),
    last_accessed timestamptz DEFAULT now(),
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 2. Create user_preferences table for global instructions
CREATE TABLE IF NOT EXISTS user_preferences (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    preference_type text NOT NULL, -- 'global_instructions', 'writing_style', 'tone_preference', etc.
    preference_name text NOT NULL,
    preference_value text NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    
    -- Ensure one preference per type per user
    UNIQUE(user_id, preference_type, preference_name)
);

-- 3. Create user_engine_preferences table to link preferences to engines
CREATE TABLE IF NOT EXISTS user_engine_preferences (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_engine_id uuid NOT NULL REFERENCES user_engines(id) ON DELETE CASCADE,
    reference_id uuid REFERENCES user_references(id) ON DELETE SET NULL,
    preference_id uuid REFERENCES user_preferences(id) ON DELETE SET NULL,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    
    -- Ensure one preference per engine per user
    UNIQUE(user_id, user_engine_id, reference_id),
    UNIQUE(user_id, user_engine_id, preference_id)
);

-- 4. Create master_sync_log table to track sync operations
CREATE TABLE IF NOT EXISTS master_sync_log (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    master_engine_id uuid NOT NULL REFERENCES ai_engines(id) ON DELETE CASCADE,
    synced_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sync_type text NOT NULL, -- 'description', 'models', 'nodes', 'config', 'partial'
    sync_details jsonb DEFAULT '{}', -- What was synced
    affected_user_engines integer DEFAULT 0, -- How many copies were updated
    sync_status text DEFAULT 'pending' CHECK (sync_status IN ('pending', 'in_progress', 'completed', 'failed')),
    error_message text,
    created_at timestamptz DEFAULT now(),
    completed_at timestamptz
);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_references_user_id ON user_references(user_id);
CREATE INDEX IF NOT EXISTS idx_user_references_file_type ON user_references(file_type);
CREATE INDEX IF NOT EXISTS idx_user_references_is_active ON user_references(is_active);

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_type ON user_preferences(preference_type);
CREATE INDEX IF NOT EXISTS idx_user_preferences_is_active ON user_preferences(is_active);

CREATE INDEX IF NOT EXISTS idx_user_engine_preferences_user_id ON user_engine_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_engine_preferences_engine_id ON user_engine_preferences(user_engine_id);
CREATE INDEX IF NOT EXISTS idx_user_engine_preferences_reference_id ON user_engine_preferences(reference_id);

CREATE INDEX IF NOT EXISTS idx_master_sync_log_engine_id ON master_sync_log(master_engine_id);
CREATE INDEX IF NOT EXISTS idx_master_sync_log_status ON master_sync_log(sync_status);
CREATE INDEX IF NOT EXISTS idx_master_sync_log_created_at ON master_sync_log(created_at);

-- 6. Enable RLS
ALTER TABLE user_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_engine_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE master_sync_log ENABLE ROW LEVEL SECURITY;

-- 7. Create RLS policies for user_references
CREATE POLICY "Users can view own references" ON user_references
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own references" ON user_references
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own references" ON user_references
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own references" ON user_references
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "SuperAdmin can view all references" ON user_references
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'superadmin'
        )
    );

-- 8. Create RLS policies for user_preferences
CREATE POLICY "Users can view own preferences" ON user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own preferences" ON user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences" ON user_preferences
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "SuperAdmin can view all preferences" ON user_preferences
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'superadmin'
        )
    );

-- 9. Create RLS policies for user_engine_preferences
CREATE POLICY "Users can view own engine preferences" ON user_engine_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own engine preferences" ON user_engine_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own engine preferences" ON user_engine_preferences
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own engine preferences" ON user_engine_preferences
    FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "SuperAdmin can manage all engine preferences" ON user_engine_preferences
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'superadmin'
        )
    );

-- 10. Create RLS policies for master_sync_log
CREATE POLICY "SuperAdmin can view all sync logs" ON master_sync_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'superadmin'
        )
    );

CREATE POLICY "SuperAdmin can create sync logs" ON master_sync_log
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'superadmin'
        )
    );

CREATE POLICY "SuperAdmin can update sync logs" ON master_sync_log
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'superadmin'
        )
    );

-- 11. Create function to sync master engine changes to user copies
CREATE OR REPLACE FUNCTION sync_master_engine_to_users(
    p_master_engine_id uuid,
    p_sync_type text,
    p_sync_details jsonb DEFAULT '{}',
    p_synced_by uuid DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
    v_sync_log_id uuid;
    v_affected_count integer := 0;
    v_master_engine record;
    v_user_engine record;
BEGIN
    -- Get master engine data
    SELECT * INTO v_master_engine FROM ai_engines WHERE id = p_master_engine_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Master engine not found: %', p_master_engine_id;
    END IF;
    
    -- Create sync log entry
    INSERT INTO master_sync_log (
        master_engine_id, synced_by, sync_type, sync_details, sync_status
    ) VALUES (
        p_master_engine_id, p_synced_by, p_sync_type, p_sync_details, 'in_progress'
    ) RETURNING id INTO v_sync_log_id;
    
    -- Update user engine copies based on sync type
    FOR v_user_engine IN 
        SELECT * FROM user_engines WHERE engine_id = p_master_engine_id AND status = 'active'
    LOOP
        CASE p_sync_type
            WHEN 'description' THEN
                UPDATE user_engines SET 
                    description = v_master_engine.description,
                    updated_at = now()
                WHERE id = v_user_engine.id;
                
            WHEN 'models' THEN
                UPDATE user_engines SET 
                    models = v_master_engine.models,
                    updated_at = now()
                WHERE id = v_user_engine.id;
                
            WHEN 'config' THEN
                UPDATE user_engines SET 
                    config = v_master_engine.config,
                    updated_at = now()
                WHERE id = v_user_engine.id;
                
            WHEN 'nodes' THEN
                UPDATE user_engines SET 
                    nodes = v_master_engine.nodes,
                    updated_at = now()
                WHERE id = v_user_engine.id;
                
            WHEN 'full' THEN
                UPDATE user_engines SET 
                    name = v_master_engine.name,
                    description = v_master_engine.description,
                    config = v_master_engine.config,
                    nodes = v_master_engine.nodes,
                    edges = v_master_engine.edges,
                    models = v_master_engine.models,
                    updated_at = now()
                WHERE id = v_user_engine.id;
                
            ELSE
                RAISE EXCEPTION 'Invalid sync type: %', p_sync_type;
        END CASE;
        
        v_affected_count := v_affected_count + 1;
    END LOOP;
    
    -- Update sync log with results
    UPDATE master_sync_log SET 
        sync_status = 'completed',
        affected_user_engines = v_affected_count,
        completed_at = now()
    WHERE id = v_sync_log_id;
    
    RETURN jsonb_build_object(
        'sync_log_id', v_sync_log_id,
        'affected_count', v_affected_count,
        'status', 'completed'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 12. Create function to assign preferences to all user engines
CREATE OR REPLACE FUNCTION assign_preference_to_all_engines(
    p_user_id uuid,
    p_preference_id uuid,
    p_reference_id uuid DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    -- Assign preference to all user's active engines
    INSERT INTO user_engine_preferences (user_id, user_engine_id, preference_id, reference_id)
    SELECT 
        p_user_id,
        ue.id,
        p_preference_id,
        p_reference_id
    FROM user_engines ue
    WHERE ue.user_id = p_user_id 
    AND ue.status = 'active'
    ON CONFLICT (user_id, user_engine_id, preference_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 13. Create function to get user's global preferences
CREATE OR REPLACE FUNCTION get_user_global_preferences(p_user_id uuid)
RETURNS jsonb AS $$
DECLARE
    v_preferences jsonb := '{}';
    v_references jsonb := '[]';
BEGIN
    -- Get user preferences
    SELECT jsonb_object_agg(preference_name, preference_value) INTO v_preferences
    FROM user_preferences 
    WHERE user_id = p_user_id AND is_active = true;
    
    -- Get user references
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', id,
            'name', name,
            'description', description,
            'file_type', file_type,
            'content_summary', content_summary
        )
    ) INTO v_references
    FROM user_references 
    WHERE user_id = p_user_id AND is_active = true;
    
    RETURN jsonb_build_object(
        'preferences', COALESCE(v_preferences, '{}'),
        'references', COALESCE(v_references, '[]')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 14. Add updated_at triggers
CREATE TRIGGER trigger_user_references_updated_at
    BEFORE UPDATE ON user_references
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 15. Add comments for documentation
COMMENT ON TABLE user_references IS 'User uploaded documents and references';
COMMENT ON TABLE user_preferences IS 'User global preferences and instructions';
COMMENT ON TABLE user_engine_preferences IS 'Links user preferences to specific engines';
COMMENT ON TABLE master_sync_log IS 'Tracks master engine sync operations';
COMMENT ON FUNCTION sync_master_engine_to_users IS 'Syncs master engine changes to all user copies';
COMMENT ON FUNCTION assign_preference_to_all_engines IS 'Assigns preference to all user engines';
COMMENT ON FUNCTION get_user_global_preferences IS 'Gets user global preferences and references';
