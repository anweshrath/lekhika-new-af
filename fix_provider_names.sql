-- Fix provider names in ai_model_metadata to use provider NAME instead of TYPE
-- Update existing records to use the correct provider names from ai_providers table

-- First, let's see what we have
SELECT DISTINCT provider FROM ai_model_metadata;

-- Update provider field to use provider names from ai_providers table
UPDATE ai_model_metadata 
SET provider = ap.name
FROM ai_providers ap
WHERE ai_model_metadata.provider = ap.provider;

-- Also update model_id to use the new provider name format
UPDATE ai_model_metadata 
SET model_id = provider || '_' || REPLACE(model_id, provider || '_', '')
WHERE model_id NOT LIKE provider || '_%';

-- Verify the updates
SELECT provider, model_id, model_name, is_active 
FROM ai_model_metadata 
ORDER BY provider, model_id;
