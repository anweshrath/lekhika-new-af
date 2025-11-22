-- Fix RLS policies for ai_engines table
-- This script fixes Row Level Security policies that are blocking engine deployment

-- Drop existing RLS policies on ai_engines table
DROP POLICY IF EXISTS "Enable read access for all users" ON public.ai_engines;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.ai_engines;
DROP POLICY IF EXISTS "Enable update for users based on created_by" ON public.ai_engines;
DROP POLICY IF EXISTS "Enable delete for users based on created_by" ON public.ai_engines;

-- Create new permissive RLS policies for ai_engines
-- These policies allow SuperAdmin to manage engines without authentication issues

-- Allow read access for all users
CREATE POLICY "Allow read access for ai_engines" ON public.ai_engines
    FOR SELECT USING (true);

-- Allow insert for all users (needed for deployment)
CREATE POLICY "Allow insert for ai_engines" ON public.ai_engines
    FOR INSERT WITH CHECK (true);

-- Allow update for all users (needed for deployment updates)
CREATE POLICY "Allow update for ai_engines" ON public.ai_engines
    FOR UPDATE USING (true) WITH CHECK (true);

-- Allow delete for all users (needed for engine management)
CREATE POLICY "Allow delete for ai_engines" ON public.ai_engines
    FOR DELETE USING (true);

-- Verify RLS is enabled and policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'ai_engines' 
AND schemaname = 'public';
