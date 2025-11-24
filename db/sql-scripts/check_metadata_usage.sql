-- Check what's actually in metadata column across ALL flows
SELECT 
  name,
  metadata,
  CASE 
    WHEN metadata IS NULL THEN 'NULL'
    WHEN metadata = '{}'::jsonb THEN 'Empty {}'
    ELSE 'Has data'
  END as metadata_status
FROM ai_flows 
WHERE created_by = '5950cad6-810b-4c5b-9d40-4485ea249770'
ORDER BY created_at DESC;

-- Also check other columns for actual usage
SELECT 
  'parameters' as column_name,
  COUNT(*) as total_rows,
  COUNT(CASE WHEN parameters IS NULL OR parameters = '{}'::jsonb THEN 1 END) as empty_rows,
  COUNT(CASE WHEN parameters IS NOT NULL AND parameters != '{}'::jsonb THEN 1 END) as has_data
FROM ai_flows WHERE created_by = '5950cad6-810b-4c5b-9d40-4485ea249770'

UNION ALL

SELECT 
  'models' as column_name,
  COUNT(*) as total_rows,
  COUNT(CASE WHEN models IS NULL OR models = '{}'::jsonb THEN 1 END) as empty_rows,
  COUNT(CASE WHEN models IS NOT NULL AND models != '{}'::jsonb THEN 1 END) as has_data
FROM ai_flows WHERE created_by = '5950cad6-810b-4c5b-9d40-4485ea249770'

UNION ALL

SELECT 
  'usage_count' as column_name,
  COUNT(*) as total_rows,
  COUNT(CASE WHEN usage_count = 0 THEN 1 END) as empty_rows,
  COUNT(CASE WHEN usage_count > 0 THEN 1 END) as has_data
FROM ai_flows WHERE created_by = '5950cad6-810b-4c5b-9d40-4485ea249770';
