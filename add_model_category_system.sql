-- SURGICAL FIX: Add ai_category system for model filtering
-- Boss: Model-level categorization for proper audio/image/video support

-- Step 1: Add ai_category column to ai_model_metadata
ALTER TABLE ai_model_metadata 
ADD COLUMN IF NOT EXISTS ai_category TEXT DEFAULT 'text' CHECK (ai_category IN ('text', 'image', 'audio', 'video'));

-- Step 2: Auto-classify existing models based on name patterns
UPDATE ai_model_metadata 
SET ai_category = CASE
  -- Image models
  WHEN model_id ILIKE '%dall%' OR model_id ILIKE '%imagen%' OR model_id ILIKE '%midjourney%' OR model_id ILIKE '%stable%' OR model_id ILIKE '%flux%' THEN 'image'
  WHEN model_name ILIKE '%image%' OR model_name ILIKE '%picture%' THEN 'image'
  
  -- Audio models
  WHEN model_id ILIKE '%tts%' OR model_id ILIKE '%speech%' OR model_id ILIKE '%voice%' OR model_id ILIKE '%elevenlabs%' THEN 'audio'
  WHEN model_name ILIKE '%audio%' OR model_name ILIKE '%voice%' THEN 'audio'
  WHEN provider = 'elevenlabs' THEN 'audio'
  
  -- Video models
  WHEN model_id ILIKE '%video%' OR model_id ILIKE '%mov%' OR model_id ILIKE '%animate%' THEN 'video'
  WHEN model_name ILIKE '%video%' THEN 'video'
  
  -- Default to text
  ELSE 'text'
END;

-- Step 3: Add index for fast filtering by category
CREATE INDEX IF NOT EXISTS idx_ai_model_metadata_category 
ON ai_model_metadata(ai_category, provider);

-- Step 4: Verify classification results
SELECT 
  ai_category,
  provider,
  COUNT(*) as model_count,
  array_agg(DISTINCT model_id) as sample_models
FROM ai_model_metadata
GROUP BY ai_category, provider
ORDER BY ai_category, provider;

-- SUCCESS: ai_category system added, existing models auto-classified

