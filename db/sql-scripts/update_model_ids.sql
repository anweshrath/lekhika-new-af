-- Update existing model_id values to use providername_modelid format
-- This prevents duplicates when new models are inserted

-- Update model_id to include provider name prefix
UPDATE ai_model_metadata 
SET model_id = provider || '_' || model_id
WHERE model_id NOT LIKE provider || '_%';

-- Verify the update
SELECT provider, model_id, model_name, is_active 
FROM ai_model_metadata 
ORDER BY provider, model_id;
