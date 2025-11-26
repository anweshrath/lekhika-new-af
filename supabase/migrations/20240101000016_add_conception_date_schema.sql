-- Add conception_date and tracking columns to ai_model_metadata table
-- This migration adds standardized date tracking for AI models

ALTER TABLE ai_model_metadata 
ADD COLUMN IF NOT EXISTS conception_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS date_source VARCHAR(50) DEFAULT 'manual',
ADD COLUMN IF NOT EXISTS date_confidence INTEGER DEFAULT 0;

-- Add documentation comments
COMMENT ON COLUMN ai_model_metadata.conception_date IS 'Standardized release/conception date of the AI model from various sources';
COMMENT ON COLUMN ai_model_metadata.date_source IS 'Source of the conception_date: api_field, model_id, manual, estimated';
COMMENT ON COLUMN ai_model_metadata.date_confidence IS 'Confidence score (0-100) for the accuracy of conception_date';

-- Add index for performance on date queries
CREATE INDEX IF NOT EXISTS idx_ai_model_metadata_conception_date 
ON ai_model_metadata(conception_date);

-- Add index for filtering by date source
CREATE INDEX IF NOT EXISTS idx_ai_model_metadata_date_source 
ON ai_model_metadata(date_source);
