-- SECURE SuperAdmin RLS Policies for AI Engines
-- This migration creates proper RLS policies for SuperAdmin access while maintaining security

-- 1. DROP EXISTING POLICIES (if any)
DROP POLICY IF EXISTS "Admins can manage all engines" ON public.ai_engines;
DROP POLICY IF EXISTS "Users can view engines assigned to them" ON public.ai_engines;
DROP POLICY IF EXISTS "SuperAdmin can update ai_engines" ON public.ai_engines;

-- 2. CREATE SECURE SUPERADMIN POLICIES
-- SuperAdmin can do everything (CRUD operations)
CREATE POLICY "SuperAdmin can manage all engines" ON public.ai_engines
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- 3. CREATE USER POLICIES (for regular users)
-- Users can only view engines assigned to them
CREATE POLICY "Users can view assigned engines" ON public.ai_engines
  FOR SELECT USING (
    id IN (
      SELECT engine_id 
      FROM public.user_engines 
      WHERE user_id = auth.uid()
    )
  );

-- 4. GRANT NECESSARY PERMISSIONS
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_engines TO authenticated;

-- 5. ADD SECURITY COMMENT
COMMENT ON TABLE public.ai_engines IS 'AI Engines table - Secure RLS policies for SuperAdmin and user access';
