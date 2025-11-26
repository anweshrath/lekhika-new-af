-- Fix dynamic configuration columns with ACTUAL provider names from database
-- This uses the real provider names like GEMIN-03-test, OPENA-01-first, etc.

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

-- Update existing records with default values based on ACTUAL provider names
UPDATE ai_model_metadata 
SET 
  api_endpoint = CASE 
    WHEN provider LIKE 'OPENA%' THEN '/api/openai/chat/completions'
    WHEN provider LIKE 'MISTR%' THEN '/api/mistral/chat/completions'
    WHEN provider LIKE 'GEMIN%' THEN '/api/gemini/models/gemini-1.5-pro:generateContent'
    WHEN provider LIKE 'CLAUD%' THEN '/api/claude/messages'
    WHEN provider LIKE 'PERPL%' THEN '/api/perplexity/chat/completions'
    WHEN provider LIKE 'GROK%' THEN '/api/grok/chat/completions'
    WHEN provider LIKE 'COHER%' THEN '/api/cohere/chat/completions'
    WHEN provider LIKE 'STABL%' THEN '/api/stability/generation/stable-diffusion-xl-1024-v1-0/text-to-image'
    WHEN provider LIKE 'ELEVE%' THEN '/api/elevenlabs/v1/text-to-speech'
    ELSE '/api/' || LOWER(provider) || '/chat/completions'
  END,
  auth_header = CASE 
    WHEN provider LIKE 'CLAUD%' THEN 'x-api-key'
    WHEN provider LIKE 'GEMIN%' THEN NULL
    WHEN provider LIKE 'STABL%' THEN 'Authorization'
    WHEN provider LIKE 'ELEVE%' THEN 'xi-api-key'
    ELSE 'Authorization'
  END,
  auth_prefix = CASE 
    WHEN provider LIKE 'CLAUD%' THEN NULL
    WHEN provider LIKE 'GEMIN%' THEN NULL
    WHEN provider LIKE 'STABL%' THEN 'Bearer'
    WHEN provider LIKE 'ELEVE%' THEN NULL
    ELSE 'Bearer'
  END,
  response_path = CASE 
    WHEN provider LIKE 'OPENA%' THEN 'choices.0.message.content'
    WHEN provider LIKE 'MISTR%' THEN 'choices.0.message.content'
    WHEN provider LIKE 'GEMIN%' THEN 'candidates.0.content.parts.0.text'
    WHEN provider LIKE 'CLAUD%' THEN 'content.0.text'
    WHEN provider LIKE 'PERPL%' THEN 'choices.0.message.content'
    WHEN provider LIKE 'GROK%' THEN 'choices.0.message.content'
    WHEN provider LIKE 'COHER%' THEN 'generations.0.text'
    WHEN provider LIKE 'STABL%' THEN 'artifacts.0.base64'
    WHEN provider LIKE 'ELEVE%' THEN 'audio_url'
    ELSE 'choices.0.message.content'
  END
WHERE api_endpoint IS NULL;

-- Add custom headers for specific providers
UPDATE ai_model_metadata 
SET custom_headers = '{"anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true"}'::jsonb
WHERE provider LIKE 'CLAUD%';

-- Add request body template for Gemini
UPDATE ai_model_metadata 
SET request_body_template = '{"contents": [{"parts": [{"text": ""}]}], "generationConfig": {"maxOutputTokens": 4000, "temperature": 0.7}}'::jsonb
WHERE provider LIKE 'GEMIN%';

-- Add request body template for Stability AI
UPDATE ai_model_metadata 
SET request_body_template = '{"text_prompts": [{"text": ""}], "cfg_scale": 7, "height": 1024, "width": 1024, "samples": 1, "steps": 20}'::jsonb
WHERE provider LIKE 'STABL%';

-- Add request body template for ElevenLabs
UPDATE ai_model_metadata 
SET request_body_template = '{"text": "", "model_id": "eleven_monolingual_v1", "voice_settings": {"stability": 0.5, "similarity_boost": 0.5}}'::jsonb
WHERE provider LIKE 'ELEVE%';
