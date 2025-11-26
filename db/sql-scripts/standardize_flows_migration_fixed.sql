-- STANDARDIZE ALL FLOWS TO NEW FORMAT (FIXED VERSION)
-- Convert old format flows to use configurations column and standardize type to 'full'

-- First, let's see what we're working with
SELECT 
  id,
  name,
  type,
  CASE WHEN nodes IS NOT NULL THEN 'Has nodes' ELSE 'No nodes' END as nodes_status,
  CASE WHEN configurations IS NOT NULL AND configurations != '{}'::jsonb THEN 'Has configurations' ELSE 'No configurations' END as config_status
FROM ai_flows 
ORDER BY created_at DESC;

-- Step 1: Update flows that have old format (nodes/edges columns) but missing configurations
UPDATE ai_flows 
SET 
  configurations = jsonb_build_object(
    'nodes', COALESCE(nodes, '[]'::jsonb),
    'edges', COALESCE(edges, '[]'::jsonb)
  ),
  type = 'full',
  steps = CASE 
    WHEN nodes IS NOT NULL AND jsonb_typeof(nodes) = 'array' AND jsonb_array_length(nodes) > 0 THEN
      -- Extract unique node types from nodes array
      ARRAY(
        SELECT DISTINCT jsonb_extract_path_text(node_element, 'type')
        FROM jsonb_array_elements(nodes) AS node_element
        WHERE jsonb_extract_path_text(node_element, 'type') IS NOT NULL
      )
    ELSE 
      ARRAY[]::text[]
  END
WHERE 
  (configurations IS NULL OR configurations = '{}'::jsonb OR configurations->>'nodes' IS NULL)
  AND nodes IS NOT NULL;

-- Step 2: Update flows that already have configurations but wrong type
UPDATE ai_flows 
SET type = 'full' 
WHERE type != 'full';

-- Step 3: Ensure steps array is populated for flows with configurations
UPDATE ai_flows 
SET steps = CASE 
  WHEN configurations->>'nodes' IS NOT NULL AND jsonb_typeof(configurations->'nodes') = 'array' THEN
    ARRAY(
      SELECT DISTINCT jsonb_extract_path_text(node_element, 'type')
      FROM jsonb_array_elements(configurations->'nodes') AS node_element
      WHERE jsonb_extract_path_text(node_element, 'type') IS NOT NULL
    )
  ELSE 
    ARRAY[]::text[]
END
WHERE (steps IS NULL OR array_length(steps, 1) IS NULL)
  AND configurations IS NOT NULL 
  AND configurations != '{}'::jsonb;

-- Step 4: Clear the old nodes/edges columns (now stored in configurations)
UPDATE ai_flows 
SET 
  nodes = NULL,
  edges = NULL
WHERE configurations IS NOT NULL 
  AND configurations != '{}'::jsonb 
  AND configurations->>'nodes' IS NOT NULL;

-- Final verification
SELECT 
  name,
  type,
  array_length(steps, 1) as steps_count,
  CASE 
    WHEN configurations->>'nodes' IS NOT NULL THEN 'Has configurations'
    ELSE 'Missing configurations'
  END as config_status,
  CASE 
    WHEN nodes IS NULL THEN 'Old columns cleared'
    ELSE 'Old columns still present'
  END as cleanup_status
FROM ai_flows 
ORDER BY created_at DESC;

SELECT 'Flow standardization completed - all flows now use NEW format' as status;
