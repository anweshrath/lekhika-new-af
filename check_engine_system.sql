-- Check if master engines exist in ai_engines
SELECT 
  id, 
  name, 
  description,
  CASE WHEN nodes IS NOT NULL AND jsonb_array_length(nodes) > 0 THEN jsonb_array_length(nodes) ELSE 0 END as node_count,
  CASE WHEN edges IS NOT NULL AND jsonb_array_length(edges) > 0 THEN jsonb_array_length(edges) ELSE 0 END as edge_count,
  CASE WHEN models IS NOT NULL AND jsonb_array_length(models) > 0 THEN jsonb_array_length(models) ELSE 0 END as model_count,
  active,
  created_at
FROM ai_engines
ORDER BY created_at DESC
LIMIT 5;

-- Check if user engines exist and have API keys
SELECT 
  ue.id,
  ue.user_id,
  ue.engine_id,
  ue.name,
  CASE WHEN ue.api_key IS NOT NULL THEN 'HAS_API_KEY' ELSE 'NO_API_KEY' END as api_key_status,
  CASE WHEN ue.nodes IS NOT NULL AND jsonb_array_length(ue.nodes) > 0 THEN jsonb_array_length(ue.nodes) ELSE 0 END as node_count,
  CASE WHEN ue.edges IS NOT NULL AND jsonb_array_length(ue.edges) > 0 THEN jsonb_array_length(ue.edges) ELSE 0 END as edge_count,
  ue.status,
  ue.created_at
FROM user_engines ue
ORDER BY created_at DESC
LIMIT 5;

-- Check if there are any execution records
SELECT 
  id,
  engine_id,
  user_id,
  status,
  error_message,
  created_at
FROM engine_executions
ORDER BY created_at DESC
LIMIT 5;
