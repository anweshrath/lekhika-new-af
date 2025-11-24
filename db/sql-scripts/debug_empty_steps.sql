-- DEBUG: Check what's actually in the configurations.nodes for empty steps flows
SELECT 
  name,
  steps,
  configurations->'nodes' as raw_nodes,
  jsonb_typeof(configurations->'nodes') as nodes_type,
  CASE 
    WHEN jsonb_typeof(configurations->'nodes') = 'array' THEN jsonb_array_length(configurations->'nodes')
    ELSE 0
  END as nodes_count
FROM ai_flows 
WHERE (steps = '{}' OR array_length(steps, 1) IS NULL OR steps = ARRAY[]::text[])
  AND created_by = '5950cad6-810b-4c5b-9d40-4485ea249770'
ORDER BY created_at DESC
LIMIT 3;
