-- Backfill user_analytics from existing engine_executions
-- Only copies executions where tokens were actually used (AI was called)

INSERT INTO user_analytics (
  user_id,
  analytics_type,
  date_hour,
  engine_id,
  engine_name,
  model_type,
  total_tokens,
  total_cost,
  execution_count,
  successful_executions,
  failed_executions,
  cancelled_executions,
  avg_tokens_per_execution,
  peak_hourly_usage
)
SELECT 
  ee.user_id, -- Keep user_id from engine_executions as-is
  'token_usage' as analytics_type,
  DATE_TRUNC('hour', ee.created_at) as date_hour,
  ee.engine_id,
  ae.name as engine_name,
  'Unknown' as model_type,
  SUM(ee.tokens_used) as total_tokens,
  SUM(ee.cost_estimate) as total_cost,
  COUNT(*) as execution_count,
  COUNT(*) FILTER (WHERE ee.status = 'completed') as successful_executions,
  COUNT(*) FILTER (WHERE ee.status = 'failed') as failed_executions,
  COUNT(*) FILTER (WHERE ee.status = 'cancelled') as cancelled_executions,
  AVG(ee.tokens_used) as avg_tokens_per_execution,
  MAX(ee.tokens_used) as peak_hourly_usage
FROM engine_executions ee
LEFT JOIN ai_engines ae ON ee.engine_id = ae.id
INNER JOIN users u ON ee.user_id = u.id -- Ensure user exists
WHERE 
  ee.tokens_used > 0
  AND ee.status IN ('completed', 'failed', 'cancelled')
GROUP BY 
  ee.user_id,
  DATE_TRUNC('hour', ee.created_at),
  ee.engine_id,
  ae.name;

