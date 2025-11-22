-- Add name column to ai_providers for unique key identification
-- This allows multiple API keys per provider with unique names

-- Add name column
ALTER TABLE ai_providers ADD COLUMN IF NOT EXISTS name VARCHAR(255);

-- Update existing records to have default names
UPDATE ai_providers SET name = CONCAT(provider, ' Key 1') WHERE name IS NULL;

-- Make name column required
ALTER TABLE ai_providers ALTER COLUMN name SET NOT NULL;

-- Add unique constraint on provider + name combination
ALTER TABLE ai_providers ADD CONSTRAINT ai_providers_provider_name_unique UNIQUE (provider, name);

-- Update the upsert conflict resolution to use provider + name
-- This will be handled in the application code
