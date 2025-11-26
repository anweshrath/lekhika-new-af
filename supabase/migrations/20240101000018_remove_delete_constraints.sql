-- Remove all ON DELETE constraints to allow 30-day cleanup logic
-- This allows the application to handle deletion logic instead of database

-- Drop existing foreign key constraints with ON DELETE
ALTER TABLE ai_providers DROP CONSTRAINT IF EXISTS ai_providers_user_id_fkey;
ALTER TABLE ai_engines DROP CONSTRAINT IF EXISTS ai_engines_created_by_fkey;
ALTER TABLE engine_assignments DROP CONSTRAINT IF EXISTS engine_assignments_user_id_fkey;
ALTER TABLE ai_workflows DROP CONSTRAINT IF EXISTS ai_workflows_created_by_fkey;
ALTER TABLE workflow_assignments DROP CONSTRAINT IF EXISTS workflow_assignments_user_id_fkey;
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;
ALTER TABLE books DROP CONSTRAINT IF EXISTS books_user_id_fkey;
ALTER TABLE ai_engines DROP CONSTRAINT IF EXISTS ai_engines_user_id_fkey;

-- Note: No constraints re-added - your app handles all deletion logic
-- User data stays for 30 days after hard delete, then gets cleaned up by application
-- Multi-tenant isolation maintained - each user's data stays separate
