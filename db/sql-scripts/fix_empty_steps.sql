-- FIX EMPTY STEPS ARRAYS
-- Only fix flows that have empty steps but have configurations with nodes

-- First, let's see which flows need fixing
SELECT 
  name,
  steps,
  CASE 
    WHEN configurations->'nodes' IS NOT NULL AND jsonb_typeof(configurations->'nodes') = 'array' THEN 
      jsonb_array_length(configurations->'nodes')
    ELSE 0
  END as nodes_count
FROM ai_flows 
WHERE (steps = '{}' OR array_length(steps, 1) IS NULL)
  AND configurations IS NOT NULL 
  AND configurations->'nodes' IS NOT NULL
ORDER BY created_at DESC;

-- Now fix the empty steps by extracting node types from configurations
UPDATE ai_flows 
SET steps = CASE 
  WHEN configurations->'nodes' IS NOT NULL AND jsonb_typeof(configurations->'nodes') = 'array' AND jsonb_array_length(configurations->'nodes') > 0 THEN
    -- Extract unique node types from configurations.nodes array
    ARRAY(
      SELECT DISTINCT jsonb_extract_path_text(node_element, 'type')
      FROM jsonb_array_elements(configurations->'nodes') AS node_element
      WHERE jsonb_extract_path_text(node_element, 'type') IS NOT NULL
      ORDER BY jsonb_extract_path_text(node_element, 'type')
    )
  ELSE 
    ARRAY[]::text[]
END
WHERE (steps = '{}' OR array_length(steps, 1) IS NULL)
  AND configurations IS NOT NULL 
  AND configurations->'nodes' IS NOT NULL;

-- Verify the fix
SELECT 
  name,
  steps,
  array_length(steps, 1) as steps_count,
  'Fixed from configurations.nodes' as status
FROM ai_flows 
WHERE created_by = '5950cad6-810b-4c5b-9d40-4485ea249770'
  AND array_length(steps, 1) > 0
ORDER BY created_at DESC;

SELECT 'Empty steps arrays fixed using existing configurations.nodes data' as result;
