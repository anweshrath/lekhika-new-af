-- Check existing DFY flows in database
SELECT 
  name, 
  description,
  created_at,
  CASE 
    WHEN configurations IS NOT NULL THEN 'Has configurations'
    ELSE 'No configurations'
  END as config_status
FROM ai_flows 
WHERE created_by = '5950cad6-810b-4c5b-9d40-4485ea249770' 
ORDER BY created_at;

-- Count total flows
SELECT COUNT(*) as total_flows 
FROM ai_flows 
WHERE created_by = '5950cad6-810b-4c5b-9d40-4485ea249770';
