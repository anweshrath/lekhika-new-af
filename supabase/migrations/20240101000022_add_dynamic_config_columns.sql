-- Add dynamic configuration columns to ai_model_metadata table
-- This enables fully dynamic API calls without hardcoded provider methods

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

-- Add comments for documentation
COMMENT ON COLUMN ai_model_metadata.api_endpoint IS 'API endpoint for this model (e.g., /api/openai/chat/completions)';
COMMENT ON COLUMN ai_model_metadata.request_method IS 'HTTP method for API calls (GET, POST, etc.)';
COMMENT ON COLUMN ai_model_metadata.auth_header IS 'Header name for authentication (e.g., Authorization, x-api-key)';
COMMENT ON COLUMN ai_model_metadata.auth_prefix IS 'Prefix for auth header value (e.g., Bearer, Basic)';
COMMENT ON COLUMN ai_model_metadata.custom_headers IS 'Additional custom headers as JSON object';
COMMENT ON COLUMN ai_model_metadata.request_body_template IS 'Template for request body structure as JSON object';
COMMENT ON COLUMN ai_model_metadata.response_path IS 'Path to extract content from response (e.g., choices.0.message.content)';
COMMENT ON COLUMN ai_model_metadata.max_tokens IS 'Maximum tokens for this model';
COMMENT ON COLUMN ai_model_metadata.temperature IS 'Temperature setting for this model';

-- Update existing records with default values based on provider type
UPDATE ai_model_metadata 
SET 
  api_endpoint = CASE 
    WHEN provider = 'openai' THEN '/api/openai/chat/completions'
    WHEN provider = 'mistral' THEN '/api/mistral/chat/completions'
    WHEN provider = 'gemini' THEN '/api/gemini/models/gemini-1.5-pro:generateContent'
    WHEN provider = 'anthropic' THEN '/api/claude/messages'
    WHEN provider = 'perplexity' THEN '/api/perplexity/chat/completions'
    ELSE '/api/' || provider || '/chat/completions'
  END,
  auth_header = CASE 
    WHEN provider = 'anthropic' THEN 'x-api-key'
    WHEN provider = 'gemini' THEN NULL
    ELSE 'Authorization'
  END,
  auth_prefix = CASE 
    WHEN provider = 'anthropic' THEN NULL
    WHEN provider = 'gemini' THEN NULL
    ELSE 'Bearer'
  END,
  response_path = CASE 
    WHEN provider = 'openai' THEN 'choices.0.message.content'
    WHEN provider = 'mistral' THEN 'choices.0.message.content'
    WHEN provider = 'gemini' THEN 'candidates.0.content.parts.0.text'
    WHEN provider = 'anthropic' THEN 'content.0.text'
    WHEN provider = 'perplexity' THEN 'choices.0.message.content'
    ELSE 'choices.0.message.content'
  END
WHERE api_endpoint IS NULL;

-- Add custom headers for specific providers
UPDATE ai_model_metadata 
SET custom_headers = '{"anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true"}'::jsonb
WHERE provider = 'anthropic';

-- Add request body template for Gemini
UPDATE ai_model_metadata 
SET request_body_template = '{"contents": [{"parts": [{"text": ""}]}], "generationConfig": {"maxOutputTokens": 4000, "temperature": 0.7}}'::jsonb
WHERE provider = 'gemini';
