-- STANDARDIZE ALL FLOWS TO NEW FORMAT
-- Convert old format flows to use configurations column and standardize type to 'full'

-- Step 1: Update flows that have nodes/edges in separate columns
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
  configurations = '{}'::jsonb 
  OR configurations IS NULL
  OR (configurations->>'nodes' IS NULL AND nodes IS NOT NULL);

-- Step 2: Clear the old nodes/edges columns (now stored in configurations)
UPDATE ai_flows 
SET 
  nodes = NULL,
  edges = NULL
WHERE configurations IS NOT NULL 
  AND configurations != '{}'::jsonb 
  AND configurations->>'nodes' IS NOT NULL;

-- Step 3: Ensure all flows have type = 'full' 
UPDATE ai_flows 
SET type = 'full' 
WHERE type != 'full';

-- Step 4: Verify the migration
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
