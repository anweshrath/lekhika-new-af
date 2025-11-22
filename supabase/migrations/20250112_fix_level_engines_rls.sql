-- Fix level_engines RLS policy to work with superadmin_users table
-- The current policy checks users.role = 'superadmin' but SuperAdmin logs in via superadmin_users

-- Drop existing policy
DROP POLICY IF EXISTS "SuperAdmin can manage level engines" ON level_engines;

-- Create new policy that checks superadmin_users table
CREATE POLICY "SuperAdmin can manage level engines" ON level_engines
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM superadmin_users 
            WHERE superadmin_users.id = auth.uid()
        )
    );

COMMENT ON POLICY "SuperAdmin can manage level engines" ON level_engines IS 'SuperAdmin users (from superadmin_users table) can manage all level engine assignments';

