-- Truly dynamic configuration that reads from ai_providers table
-- No hardcoded patterns - works with ANY naming convention

-- Add columns for dynamic API configuration
ALTER TABLE ai_model_metadata 
ADD COLUMN IF NOT EXISTS api_endpoint TEXT,
ADD COLUMN IF NOT EXISTS request_method TEXT DEFAULT 'POST',
ADD COLUMN IF NOT EXISTS auth_header TEXT,
ADD COLUMN IF NOT EXISTS auth_prefix TEXT DEFAULT 'Bearer',
ADD COLUMN IF NOT EXISTS custom_headers JSONB,
ADD COLUMN IF NOT EXISTS request_body_template JSONB,
ADD COLUMN IF NOT EXISTS response_path TEXT,
ADD COLUMN IF NOT EXISTS max_tokens INTEGER DEFAULT 4000,
ADD COLUMN IF NOT EXISTS temperature DECIMAL(3,2) DEFAULT 0.7;

-- Update using JOIN with ai_providers table to get actual provider types
UPDATE ai_model_metadata 
SET 
  api_endpoint = CASE 
    WHEN ap.provider = 'openai' THEN '/api/openai/chat/completions'
    WHEN ap.provider = 'mistral' THEN '/api/mistral/chat/completions'
    WHEN ap.provider = 'gemini' THEN '/api/gemini/models/gemini-1.5-pro:generateContent'
    WHEN ap.provider = 'anthropic' THEN '/api/claude/messages'
    WHEN ap.provider = 'perplexity' THEN '/api/perplexity/chat/completions'
    WHEN ap.provider = 'grok' THEN '/api/grok/chat/completions'
    WHEN ap.provider = 'cohere' THEN '/api/cohere/chat/completions'
    WHEN ap.provider = 'stability' THEN '/api/stability/generation/stable-diffusion-xl-1024-v1-0/text-to-image'
    WHEN ap.provider = 'elevenlabs' THEN '/api/elevenlabs/v1/text-to-speech'
    WHEN ap.provider = 'huggingface' THEN '/api/huggingface/models/runwayml/stable-diffusion-v1-5'
    WHEN ap.provider = 'craiyon' THEN '/api/craiyon/v1/generate'
    WHEN ap.provider = 'modelslab' THEN '/api/modelslab/v1/generate'
    ELSE '/api/' || ap.provider || '/chat/completions'
  END,
  auth_header = CASE 
    WHEN ap.provider = 'anthropic' THEN 'x-api-key'
    WHEN ap.provider = 'gemini' THEN NULL
    WHEN ap.provider = 'stability' THEN 'Authorization'
    WHEN ap.provider = 'elevenlabs' THEN 'xi-api-key'
    WHEN ap.provider = 'huggingface' THEN 'Authorization'
    WHEN ap.provider = 'craiyon' THEN NULL
    WHEN ap.provider = 'modelslab' THEN 'Authorization'
    ELSE 'Authorization'
  END,
  auth_prefix = CASE 
    WHEN ap.provider = 'anthropic' THEN NULL
    WHEN ap.provider = 'gemini' THEN NULL
    WHEN ap.provider = 'stability' THEN 'Bearer'
    WHEN ap.provider = 'elevenlabs' THEN NULL
    WHEN ap.provider = 'huggingface' THEN 'Bearer'
    WHEN ap.provider = 'craiyon' THEN NULL
    WHEN ap.provider = 'modelslab' THEN 'Bearer'
    ELSE 'Bearer'
  END,
  response_path = CASE 
    WHEN ap.provider = 'openai' THEN 'choices.0.message.content'
    WHEN ap.provider = 'mistral' THEN 'choices.0.message.content'
    WHEN ap.provider = 'gemini' THEN 'candidates.0.content.parts.0.text'
    WHEN ap.provider = 'anthropic' THEN 'content.0.text'
    WHEN ap.provider = 'perplexity' THEN 'choices.0.message.content'
    WHEN ap.provider = 'grok' THEN 'choices.0.message.content'
    WHEN ap.provider = 'cohere' THEN 'generations.0.text'
    WHEN ap.provider = 'stability' THEN 'artifacts.0.base64'
    WHEN ap.provider = 'elevenlabs' THEN 'audio_url'
    WHEN ap.provider = 'huggingface' THEN '0.generated_image'
    WHEN ap.provider = 'craiyon' THEN 'images.0'
    WHEN ap.provider = 'modelslab' THEN 'images.0'
    ELSE 'choices.0.message.content'
  END
FROM ai_providers ap
WHERE ai_model_metadata.provider = ap.name
AND ai_model_metadata.api_endpoint IS NULL;

-- Add custom headers for specific providers
UPDATE ai_model_metadata 
SET custom_headers = '{"anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true"}'::jsonb
FROM ai_providers ap
WHERE ai_model_metadata.provider = ap.name 
AND ap.provider = 'anthropic';

-- Add request body templates for specific providers
UPDATE ai_model_metadata 
SET request_body_template = '{"contents": [{"parts": [{"text": ""}]}], "generationConfig": {"maxOutputTokens": 4000, "temperature": 0.7}}'::jsonb
FROM ai_providers ap
WHERE ai_model_metadata.provider = ap.name 
AND ap.provider = 'gemini';

UPDATE ai_model_metadata 
SET request_body_template = '{"text_prompts": [{"text": ""}], "cfg_scale": 7, "height": 1024, "width": 1024, "samples": 1, "steps": 20}'::jsonb
FROM ai_providers ap
WHERE ai_model_metadata.provider = ap.name 
AND ap.provider = 'stability';

UPDATE ai_model_metadata 
SET request_body_template = '{"text": "", "model_id": "eleven_monolingual_v1", "voice_settings": {"stability": 0.5, "similarity_boost": 0.5}}'::jsonb
FROM ai_providers ap
WHERE ai_model_metadata.provider = ap.name 
AND ap.provider = 'elevenlabs';
