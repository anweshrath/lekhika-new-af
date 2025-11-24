-- SIMPLE FIX for AI Providers Table - No Syntax Errors
-- Run this in your Supabase Dashboard > SQL Editor

-- 1. Add missing columns
ALTER TABLE ai_providers ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE ai_providers ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE ai_providers ADD COLUMN IF NOT EXISTS failures INTEGER DEFAULT 0;
ALTER TABLE ai_providers ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0;
ALTER TABLE ai_providers ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- 2. Update existing records with default values
UPDATE ai_providers SET description = 'API key for ' || provider WHERE description IS NULL;
UPDATE ai_providers SET name = provider || ' Key 1' WHERE name IS NULL;
UPDATE ai_providers SET failures = 0 WHERE failures IS NULL;
UPDATE ai_providers SET usage_count = 0 WHERE usage_count IS NULL;
UPDATE ai_providers SET metadata = '{}' WHERE metadata IS NULL;

-- 3. Make columns NOT NULL (after setting defaults)
ALTER TABLE ai_providers ALTER COLUMN name SET NOT NULL;
ALTER TABLE ai_providers ALTER COLUMN failures SET NOT NULL;
ALTER TABLE ai_providers ALTER COLUMN usage_count SET NOT NULL;
ALTER TABLE ai_providers ALTER COLUMN metadata SET NOT NULL;

-- 4. Drop the old constraint that blocks multiple keys per provider
ALTER TABLE ai_providers DROP CONSTRAINT IF EXISTS ai_providers_user_id_provider_key;

-- 5. Add new constraint for globally unique names (allows multiple keys per provider)
ALTER TABLE ai_providers ADD CONSTRAINT ai_providers_name_unique UNIQUE (name);

-- 6. Verify the table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'ai_providers' 
ORDER BY ordinal_position;

-- 7. Verify constraints
SELECT 
  constraint_name, 
  constraint_type, 
  table_name
FROM information_schema.table_constraints 
WHERE table_name = 'ai_providers';

-- 8. Test insert (this should work now)
-- INSERT INTO ai_providers (user_id, provider, name, api_key, description, model, is_active, failures, usage_count, metadata) 
-- VALUES (gen_random_uuid(), 'test_provider', 'Test Key', 'test_key_123', 'Test description', 'test_model', true, 0, 0, '{"source": "test"}');
