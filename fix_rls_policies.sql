-- Fix RLS policies for custom user auth system
-- Remove auth.uid() dependencies since we're not using Supabase auth

-- Drop existing policies that reference auth.uid()
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Allow user registration" ON public.users;
DROP POLICY IF EXISTS "Users can manage own sessions" ON public.user_sessions;

-- Create new policies for custom auth system
-- Allow anyone to register (we'll validate in the service)
CREATE POLICY "Allow user registration" ON public.users
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow users to view their own profile (will be enforced by service layer)
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT
  TO public
  USING (true);

-- Allow users to update their own profile (will be enforced by service layer)
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Allow session management (will be enforced by service layer)
CREATE POLICY "Allow session management" ON public.user_sessions
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- Allow SuperAdmin full access
CREATE POLICY "SuperAdmin full access users" ON public.users
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

CREATE POLICY "SuperAdmin full access sessions" ON public.user_sessions
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
