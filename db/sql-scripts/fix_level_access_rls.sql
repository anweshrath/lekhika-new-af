-- Fix RLS policies for level_access table to allow SuperAdmin access

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to read level access" ON public.level_access;
DROP POLICY IF EXISTS "SuperAdmin full access level access" ON public.level_access;

-- Allow SuperAdmin full access to level_access
CREATE POLICY "SuperAdmin full access level access"
  ON public.level_access
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.superadmin_users 
      WHERE id = auth.uid() AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.superadmin_users 
      WHERE id = auth.uid() AND is_active = true
    )
  );

-- Allow public read access for now (we'll restrict later)
CREATE POLICY "Allow public read access level access"
  ON public.level_access
  FOR SELECT
  TO public
  USING (true);
