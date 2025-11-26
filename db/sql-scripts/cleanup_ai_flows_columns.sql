-- CLEAN UP AI_FLOWS TABLE - DROP USELESS COLUMNS, KEEP TRACKING COLUMNS
-- Keep: last_used, usage_count, is_default (for tracking)
-- Drop: parameters, models, nodes, edges (useless/migrated)

-- Drop the useless columns
ALTER TABLE ai_flows 
DROP COLUMN IF EXISTS parameters,
DROP COLUMN IF EXISTS models,
DROP COLUMN IF EXISTS nodes,
DROP COLUMN IF EXISTS edges;

-- Verify the cleanup
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ai_flows' 
ORDER BY ordinal_position;

SELECT 'Useless columns dropped - kept tracking columns (last_used, usage_count, is_default)' as status;
