-- Add foreign key constraint for cascade delete when provider is deleted
-- This ensures that when a provider is deleted from ai_providers, 
-- all related models in ai_model_metadata are automatically deleted

-- First, ensure all key_name values in ai_model_metadata match name values in ai_providers
-- Delete any orphaned records
DELETE FROM ai_model_metadata 
WHERE key_name NOT IN (
    SELECT name FROM ai_providers
);

-- Add foreign key constraint with cascade delete
ALTER TABLE ai_model_metadata 
ADD CONSTRAINT fk_key_name_cascade 
FOREIGN KEY (key_name) 
REFERENCES ai_providers(name) 
ON DELETE CASCADE;

-- Add comment for clarity
COMMENT ON CONSTRAINT fk_key_name_cascade ON ai_model_metadata IS 'Ensures that when a provider is deleted, all its models are automatically deleted';
