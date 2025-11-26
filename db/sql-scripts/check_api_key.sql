-- Check if API key exists and how many rows match
SELECT 
  ue.id,
  ue.user_id,
  ue.engine_id,
  ue.api_key,
  ue.status,
  u.email,
  u.tier
FROM user_engines ue
LEFT JOIN users u ON ue.user_id = u.id
WHERE ue.api_key = 'LEKH-2-d846ac3fdfa44700ba02ef1436e1b224'
AND ue.status = 'active';
