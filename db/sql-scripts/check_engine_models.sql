-- Check what models are configured in your engines
SELECT 
  name,
  (nodes->0->'data'->>'selectedModels') as input_models,
  (nodes->1->'data'->>'selectedModels') as process_models,
  (nodes->2->'data'->>'selectedModels') as writer_models
FROM ai_engines
WHERE user_id IS NULL OR created_by = '5950cad6-810b-4c5b-9d40-4485ea249770'
ORDER BY created_at DESC
LIMIT 10;
