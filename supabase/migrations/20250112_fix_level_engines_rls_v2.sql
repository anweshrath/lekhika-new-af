-- Fix level_engines RLS - SuperAdmin doesn't use auth.uid(), they use custom session
-- Solution: Disable RLS for operations from superadmin_users

-- Drop existing policies
DROP POLICY IF EXISTS "SuperAdmin can manage level engines" ON level_engines;
DROP POLICY IF EXISTS "Authenticated users can view level engines" ON level_engines;

-- Disable RLS entirely since we'll control access at application level
-- SuperAdmin uses custom session system, not Supabase Auth
ALTER TABLE level_engines DISABLE ROW LEVEL SECURITY;

COMMENT ON TABLE level_engines IS 'Level engine assignments - RLS disabled because SuperAdmin uses custom auth system. Access control handled at application level.';

