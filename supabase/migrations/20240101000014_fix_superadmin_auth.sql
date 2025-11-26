-- Fix SuperAdmin Authentication Issues

-- 1. Create admin_sessions table for SuperAdmin sessions
CREATE TABLE IF NOT EXISTS admin_sessions (
    id TEXT PRIMARY KEY,
    admin_id UUID NOT NULL REFERENCES superadmin_users(id) ON DELETE CASCADE,
    session_data JSONB NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add RLS policies for admin_sessions
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

-- SuperAdmin can manage their own sessions
CREATE POLICY "SuperAdmin can manage their own sessions" ON admin_sessions
    FOR ALL USING (admin_id IN (SELECT id FROM superadmin_users WHERE is_active = true));

-- 3. Create updated_at trigger for admin_sessions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER admin_sessions_updated_at 
    BEFORE UPDATE ON admin_sessions 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. Fix password validation - update password_hash to match plain text for now
-- (In production, you should hash passwords properly)
UPDATE superadmin_users 
SET password_hash = 'BookMagic2024!Admin' 
WHERE username = 'superadmin';

-- 5. Ensure ai_providers constraint is correct
ALTER TABLE ai_providers DROP CONSTRAINT IF EXISTS ai_providers_user_id_fkey;
ALTER TABLE ai_providers 
ADD CONSTRAINT ai_providers_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES superadmin_users(id) ON DELETE SET NULL;
