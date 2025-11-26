-- Fix AI Engines RLS for SuperAdmin updates
-- This migration ensures SuperAdmin can update ai_engines without RLS blocking

-- Disable RLS on ai_engines table temporarily to allow SuperAdmin updates
ALTER TABLE public.ai_engines DISABLE ROW LEVEL SECURITY;

-- Grant all permissions to authenticated users for ai_engines
GRANT ALL ON public.ai_engines TO authenticated;

-- Add comment explaining the change
COMMENT ON TABLE public.ai_engines IS 'AI Engines table - RLS disabled for SuperAdmin management';
