-- Remove provider constraint completely for flexibility
-- Run this in Supabase Dashboard > SQL Editor

-- 1. Drop the existing constraint completely
ALTER TABLE ai_providers DROP CONSTRAINT IF EXISTS ai_providers_provider_check;

-- 2. Verify the constraint is removed
SELECT 
  constraint_name, 
  check_clause
FROM information_schema.check_constraints 
WHERE constraint_name = 'ai_providers_provider_check';

-- 3. Test insert with any provider name (should work now)
-- INSERT INTO ai_providers (user_id, provider, name, api_key, description, model, is_active) 
-- VALUES (gen_random_uuid(), 'any_new_provider', 'Test Key', 'test_key', 'Test provider', 'test_model', true);
