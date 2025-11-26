-- Check the actual prompts and configuration in the deployed engine
SELECT 
  id,
  name,
  flow_config->'nodes' as nodes
FROM ai_engines
WHERE id = 'bcf1e572-3856-4a19-ac54-271cbafb3331';

