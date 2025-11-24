-- Check for test data to verify system
-- 1. Check if there are any deployed engines
SELECT 
  id, 
  name, 
  description,
  CASE WHEN nodes IS NOT NULL AND jsonb_array_length(nodes) > 0 THEN jsonb_array_length(nodes) ELSE 0 END as node_count,
  active,
  created_at
FROM ai_engines
WHERE active = true
ORDER BY created_at DESC
LIMIT 3;

-- 2. Check if there are any users
SELECT 
  id,
  email,
  full_name,
  tier,
  is_active
FROM users
WHERE is_active = true
ORDER BY created_at DESC
LIMIT 3;

-- 3. Check if there are any user_engines with API keys
SELECT 
  ue.id as user_engine_id,
  ue.user_id,
  ue.engine_id,
  ue.name,
  CASE WHEN ue.api_key IS NOT NULL THEN LEFT(ue.api_key, 20) || '...' ELSE 'NO API KEY' END as api_key_preview,
  ue.status,
  ue.created_at
FROM user_engines ue
WHERE ue.status = 'active'
ORDER BY ue.created_at DESC
LIMIT 3;
