-- Migration: Fix Node Roles in ai_flows table
-- Purpose: Update generic node roles (process-1, process-2) to proper roles (world_builder, content_writer, etc.)
-- Date: 2025-01-22
-- Reversible: Yes (can be rolled back by restoring original config)

BEGIN;

-- Create backup table for rollback safety
CREATE TABLE IF NOT EXISTS ai_flows_backup_before_role_fix AS 
SELECT * FROM ai_flows;

-- Update ai_flows to fix node roles
UPDATE ai_flows 
SET configurations = jsonb_set(
  configurations, 
  '{nodes}', 
  to_jsonb(
    (
      SELECT jsonb_agg(
        CASE 
          -- Input nodes
          WHEN node->>'type' = 'input' THEN 
            jsonb_set(node, '{data,role}', '"universal_input"')
          
          -- Output nodes  
          WHEN node->>'type' = 'output' THEN 
            jsonb_set(node, '{data,role}', '"universal_output"')
          
          -- Process nodes - map based on label
          WHEN node->>'type' = 'process' THEN
            CASE 
              -- World building nodes
              WHEN node->'data'->>'label' ILIKE '%world%' 
                OR node->'data'->>'label' ILIKE '%character%'
                OR node->'data'->>'label' ILIKE '%setting%'
                OR node->'data'->>'label' ILIKE '%environment%'
                THEN jsonb_set(node, '{data,role}', '"world_builder"')
              
              -- Plot architecture nodes
              WHEN node->'data'->>'label' ILIKE '%plot%' 
                OR node->'data'->>'label' ILIKE '%story%'
                OR node->'data'->>'label' ILIKE '%structure%'
                OR node->'data'->>'label' ILIKE '%outline%'
                THEN jsonb_set(node, '{data,role}', '"plot_architect"')
              
              -- Literary writing nodes
              WHEN node->'data'->>'label' ILIKE '%literary%' 
                OR node->'data'->>'label' ILIKE '%narrative%'
                OR node->'data'->>'label' ILIKE '%writing%'
                OR node->'data'->>'label' ILIKE '%chapter%'
                OR node->'data'->>'label' ILIKE '%content%'
                THEN jsonb_set(node, '{data,role}', '"content_writer"')
              
              -- Proofreading nodes
              WHEN node->'data'->>'label' ILIKE '%proofread%' 
                OR node->'data'->>'label' ILIKE '%edit%'
                OR node->'data'->>'label' ILIKE '%review%'
                OR node->'data'->>'label' ILIKE '%polish%'
                THEN jsonb_set(node, '{data,role}', '"proofreader"')
              
              -- Default to content_writer for unknown process nodes
              ELSE jsonb_set(node, '{data,role}', '"content_writer"')
            END
          
          -- Keep other node types unchanged
          ELSE node
        END
      )
      FROM jsonb_array_elements((configurations->>'nodes')::jsonb) AS node
    )::text
  )
)
WHERE configurations->>'nodes' IS NOT NULL
  AND EXISTS (
    SELECT 1 
    FROM jsonb_array_elements((configurations->>'nodes')::jsonb) AS node 
    WHERE node->>'type' = 'process' 
      AND (
        node->'data'->>'role' IS NULL 
        OR node->'data'->>'role' ~ '^process-\d+$'
        OR node->'data'->>'role' = ''
      )
  );

-- Log the changes
DO $$
DECLARE
    updated_count INTEGER;
BEGIN
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RAISE NOTICE 'Updated % flows with fixed node roles', updated_count;
END $$;

COMMIT;

-- Verification query (run this after migration to check results)
-- SELECT 
--   id,
--   name,
--   jsonb_pretty(
--     jsonb_agg(
--       jsonb_build_object(
--         'id', node->>'id',
--         'type', node->>'type', 
--         'label', node->'data'->>'label',
--         'role', node->'data'->>'role'
--       )
--     )
--   ) as nodes_with_roles
-- FROM ai_flows, jsonb_array_elements((configurations->>'nodes')::jsonb) AS node
-- GROUP BY id, name
-- ORDER BY id;
