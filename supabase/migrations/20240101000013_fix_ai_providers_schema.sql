/*
  # Fix AI Providers Table Schema

  This migration fixes the missing columns in ai_providers table that are causing
  the "Could not find the 'description' column" error.

  Issues Fixed:
  1. Missing 'description' column
  2. Missing 'name' column  
  3. Missing 'failures' column
  4. Missing 'usage_count' column
  5. Missing 'metadata' column

  This ensures all AI services (OpenAI, Mistral, Gemini, Claude, Perplexity, etc.)
  can save their API keys without database errors.
*/

-- 1. Add missing columns with proper defaults
ALTER TABLE ai_providers 
ADD COLUMN IF NOT EXISTS description TEXT;

ALTER TABLE ai_providers 
ADD COLUMN IF NOT EXISTS name VARCHAR(255);

ALTER TABLE ai_providers 
ADD COLUMN IF NOT EXISTS failures INTEGER DEFAULT 0;

ALTER TABLE ai_providers 
ADD COLUMN IF NOT EXISTS usage_count INTEGER DEFAULT 0;

ALTER TABLE ai_providers 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- 2. Update existing records to populate new columns
UPDATE ai_providers 
SET description = 'API key for ' || provider 
WHERE description IS NULL;

UPDATE ai_providers 
SET name = provider || ' Key 1' 
WHERE name IS NULL;

UPDATE ai_providers 
SET failures = 0 
WHERE failures IS NULL;

UPDATE ai_providers 
SET usage_count = 0 
WHERE usage_count IS NULL;

UPDATE ai_providers 
SET metadata = '{}' 
WHERE metadata IS NULL;

-- 3. Make columns NOT NULL after setting defaults
ALTER TABLE ai_providers 
ALTER COLUMN name SET NOT NULL;

ALTER TABLE ai_providers 
ALTER COLUMN failures SET NOT NULL;

ALTER TABLE ai_providers 
ALTER COLUMN usage_count SET NOT NULL;

ALTER TABLE ai_providers 
ALTER COLUMN metadata SET NOT NULL;

-- 4. Add unique constraint for provider + name combination
-- Drop existing constraint if it exists to avoid conflicts
ALTER TABLE ai_providers 
DROP CONSTRAINT IF EXISTS ai_providers_provider_name_unique;

ALTER TABLE ai_providers 
ADD CONSTRAINT ai_providers_provider_name_unique 
UNIQUE (provider, name);

-- 5. Add indexes for performance
-- Drop existing indexes if they exist to avoid conflicts
DROP INDEX IF EXISTS idx_ai_providers_name;
DROP INDEX IF EXISTS idx_ai_providers_failures;
DROP INDEX IF EXISTS idx_ai_providers_usage_count;

CREATE INDEX idx_ai_providers_name 
  ON ai_providers(name);

CREATE INDEX idx_ai_providers_usage_count 
  ON ai_providers(usage_count);

-- 6. Verify the table structure
DO $$
DECLARE
  expected_columns text[] := ARRAY[
    'id', 'user_id', 'provider', 'api_key', 'model', 'is_active', 
    'last_used', 'created_at', 'updated_at', 'description', 'name', 
    'failures', 'usage_count', 'metadata'
  ];
  actual_columns text[];
  missing_columns text[];
BEGIN
  -- Get actual columns
  SELECT array_agg(column_name ORDER BY ordinal_position) 
  INTO actual_columns
  FROM information_schema.columns 
  WHERE table_name = 'ai_providers';
  
  -- Find missing columns
  SELECT array_agg(col) INTO missing_columns
  FROM unnest(expected_columns) AS col
  WHERE col != ALL(actual_columns);
  
  -- Report any missing columns
  IF array_length(missing_columns, 1) > 0 THEN
    RAISE NOTICE 'Missing columns: %', missing_columns;
  ELSE
    RAISE NOTICE 'All expected columns are present in ai_providers table';
  END IF;
END $$;

-- 7. Test the table structure with a sample insert
-- (This will be rolled back in the transaction)
DO $$
BEGIN
  -- Test insert to verify schema works
  INSERT INTO ai_providers (
    user_id, 
    provider, 
    name, 
    api_key, 
    description, 
    model, 
    is_active,
    failures,
    usage_count,
    metadata
  ) VALUES (
    gen_random_uuid(), 
    'test_provider', 
    'Test Key', 
    'test_key_123', 
    'Test description', 
    'test_model', 
    true,
    0,
    0,
    '{"source": "test", "display_name": "Test Provider"}'
  );
  
  -- Clean up test data
  DELETE FROM ai_providers WHERE provider = 'test_provider';
  
  RAISE NOTICE 'Schema test completed successfully - all columns working';
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Schema test failed: %', SQLERRM;
END $$;
