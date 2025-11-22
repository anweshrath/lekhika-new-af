-- Add missing columns to user_analytics table for Token Analytics display
-- Adds: engine_id, engine_name, model_type (Included/PAYG)

ALTER TABLE user_analytics 
ADD COLUMN IF NOT EXISTS engine_id UUID REFERENCES ai_engines(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS engine_name TEXT,
ADD COLUMN IF NOT EXISTS model_type TEXT CHECK (model_type IN ('Included', 'PAYG', 'Unknown'));

-- Create index for engine filtering
CREATE INDEX IF NOT EXISTS idx_user_analytics_engine_id ON user_analytics(engine_id);

-- Update existing rows to set default model_type
UPDATE user_analytics SET model_type = 'Unknown' WHERE model_type IS NULL;

