-- Migration: Add key identification columns to ai_model_metadata table
-- Date: 2024-01-01
-- Purpose: Add key_name and key_model columns for better key identification
-- without breaking existing functionality

-- Add key identification columns to ai_model_metadata table
ALTER TABLE ai_model_metadata 
ADD COLUMN key_name TEXT,
ADD COLUMN key_model TEXT;

-- Add comments to explain the new columns
COMMENT ON COLUMN ai_model_metadata.key_name IS 'The unique key identifier from ai_providers.name (e.g., OPENA-02-2222, MISTR-01-1)';
COMMENT ON COLUMN ai_model_metadata.key_model IS 'Combined key_name + model_name for unique model identification (e.g., OPENA-02-2222_gpt-4o)';

-- Create index on key_name for faster lookups
CREATE INDEX idx_ai_model_metadata_key_name ON ai_model_metadata(key_name);

-- Create index on key_model for faster lookups
CREATE INDEX idx_ai_model_metadata_key_model ON ai_model_metadata(key_model);

-- Update RLS policies if needed (keeping existing policies intact)
-- The new columns will inherit the same RLS policies as the table
