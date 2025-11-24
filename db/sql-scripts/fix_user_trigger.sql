-- Fix the user trigger issue - just remove the problematic trigger for now
DROP TRIGGER IF EXISTS trigger_user_created ON users;
DROP FUNCTION IF EXISTS trigger_create_user_engines();
DROP FUNCTION IF EXISTS create_user_engines_for_new_user(uuid, uuid);
