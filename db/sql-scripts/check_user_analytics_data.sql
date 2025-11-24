-- Check if user_analytics has data
SELECT 
  user_id,
  analytics_type,
  date_hour,
  engine_name,
  total_tokens,
  total_cost,
  execution_count
FROM user_analytics
WHERE analytics_type = 'token_usage'
ORDER BY date_hour DESC
LIMIT 10;

