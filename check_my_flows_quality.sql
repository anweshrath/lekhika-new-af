-- CHECK WHICH FLOWS ARE PRODUCTION-READY
-- Boss wants to know which flows have what it takes to work like the 3-chapter flow

-- 1. See all your flows with node counts
SELECT 
  name,
  description,
  type,
  jsonb_array_length(configurations->'nodes') as node_count,
  jsonb_array_length(configurations->'edges') as edge_count,
  usage_count,
  is_default,
  created_at
FROM ai_flows
WHERE created_by = '5950cad6-810b-4c5b-9d40-4485ea249770'
ORDER BY created_at DESC;

-- 2. Check which flows have proper INPUT and OUTPUT nodes (CRITICAL)
SELECT 
  name,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM jsonb_array_elements(configurations->'nodes') as node
      WHERE node->>'type' = 'input'
    ) THEN '✅' ELSE '❌'
  END as has_input,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM jsonb_array_elements(configurations->'nodes') as node
      WHERE node->>'type' = 'output'
    ) THEN '✅' ELSE '❌'
  END as has_output,
  CASE 
    WHEN jsonb_array_length(configurations->'nodes') >= 3 THEN '✅' ELSE '❌'
  END as has_enough_nodes
FROM ai_flows
WHERE created_by = '5950cad6-810b-4c5b-9d40-4485ea249770'
ORDER BY created_at DESC;

-- 3. Show detailed node structure of each flow
SELECT 
  name,
  (
    SELECT jsonb_agg(node->'type')
    FROM jsonb_array_elements(configurations->'nodes') as node
  ) as node_types,
  (
    SELECT count(*)
    FROM jsonb_array_elements(configurations->'edges') as edge
  ) as connection_count
FROM ai_flows
WHERE created_by = '5950cad6-810b-4c5b-9d40-4485ea249770'
ORDER BY created_at DESC;

-- 4. Find your working 3-chapter flow (most recent with multi-chapter pattern)
SELECT 
  name,
  description,
  configurations->'nodes' as nodes,
  configurations->'edges' as edges
FROM ai_flows
WHERE created_by = '5950cad6-810b-4c5b-9d40-4485ea249770'
AND name ILIKE '%chapter%'
ORDER BY created_at DESC
LIMIT 1;

