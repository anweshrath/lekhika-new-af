-- Add conception_date column to ai_model_metadata table
-- This column will store the standardized release/conception date of the model

ALTER TABLE ai_model_metadata 
ADD COLUMN IF NOT EXISTS conception_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS date_source VARCHAR(50) DEFAULT 'manual', -- 'api_field', 'model_id', 'manual', 'estimated'
ADD COLUMN IF NOT EXISTS date_confidence INTEGER DEFAULT 0; -- 0-100 confidence score

-- Add comment for documentation
COMMENT ON COLUMN ai_model_metadata.conception_date IS 'Standardized release/conception date of the AI model from various sources';
COMMENT ON COLUMN ai_model_metadata.date_source IS 'Source of the conception_date: api_field, model_id, manual, estimated';
COMMENT ON COLUMN ai_model_metadata.date_confidence IS 'Confidence score (0-100) for the accuracy of conception_date';
