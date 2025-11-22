-- Add unique constraint on key_model column in ai_model_metadata table
-- This ensures that each key_model combination is unique and prevents duplicates

-- First, remove any existing duplicates (if any)
DELETE FROM ai_model_metadata 
WHERE id NOT IN (
    SELECT MIN(id) 
    FROM ai_model_metadata 
    GROUP BY key_model
);

-- Add unique constraint on key_model
ALTER TABLE ai_model_metadata 
ADD CONSTRAINT unique_key_model UNIQUE (key_model);

-- Add comment for clarity
COMMENT ON CONSTRAINT unique_key_model ON ai_model_metadata IS 'Ensures each key_model combination is unique to prevent duplicate entries';
