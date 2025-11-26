-- Fix unique constraint on model_id that prevents different providers from having same model_id
-- Drop the problematic unique constraint on model_id only
ALTER TABLE ai_model_metadata DROP CONSTRAINT IF EXISTS ai_model_metadata_model_id_key;

-- Keep the composite unique constraint (provider, model_id) which makes sense
-- This allows different providers to have models with the same model_id