-- Check flows with empty steps but have edges/configurations
SELECT 
  name,
  type,
  steps,
  CASE 
    WHEN configurations IS NOT NULL AND configurations != '{}'::jsonb THEN 'Has configurations'
    ELSE 'No configurations'
  END as config_status,
  CASE 
    WHEN edges IS NOT NULL AND edges != '[]'::jsonb THEN 'Has edges column'
    ELSE 'No edges column'  
  END as edges_status,
  CASE 
    WHEN configurations->'edges' IS NOT NULL THEN 'Has config edges'
    ELSE 'No config edges'
  END as config_edges_status,
  created_at
FROM ai_flows 
WHERE created_by = '5950cad6-810b-4c5b-9d40-4485ea249770'
ORDER BY created_at DESC;
