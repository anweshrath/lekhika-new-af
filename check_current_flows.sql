-- Check what flows actually exist in database
SELECT 
  id,
  name,
  type,
  created_at,
  CASE 
    WHEN configurations IS NOT NULL AND configurations != '{}'::jsonb THEN 'Has configurations'
    ELSE 'No configurations'
  END as config_status,
  CASE 
    WHEN nodes IS NOT NULL THEN 'Has nodes column'
    ELSE 'No nodes column'
  END as nodes_status
FROM ai_flows 
WHERE created_by = '5950cad6-810b-4c5b-9d40-4485ea249770'
ORDER BY created_at DESC;

-- Count total flows
SELECT COUNT(*) as total_flows 
FROM ai_flows 
WHERE created_by = '5950cad6-810b-4c5b-9d40-4485ea249770';
