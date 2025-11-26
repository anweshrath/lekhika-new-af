-- Fix engine_executions foreign keys to use correct tables
-- The table was referencing auth.users but we use public.users (custom auth)

-- Drop old foreign key constraint pointing to auth.users
ALTER TABLE public.engine_executions 
  DROP CONSTRAINT IF EXISTS engine_executions_user_id_fkey;

-- Add new foreign key constraint pointing to public.users
ALTER TABLE public.engine_executions 
  ADD CONSTRAINT engine_executions_user_id_fkey 
  FOREIGN KEY (user_id) 
  REFERENCES public.users(id) 
  ON DELETE CASCADE;

COMMENT ON CONSTRAINT engine_executions_user_id_fkey ON public.engine_executions 
  IS 'References public.users table (custom auth) instead of auth.users';

