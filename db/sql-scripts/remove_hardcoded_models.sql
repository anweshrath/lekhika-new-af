-- REMOVE HARDCODED selectedModels FROM DATABASE
-- This removes hardcoded AI model names so user's configured models are used instead

-- For user_engines: Remove selectedModels from story_outliner nodes
UPDATE user_engines ue
SET nodes = (
  SELECT jsonb_agg(
    CASE 
      WHEN (node->'data'->>'role') = 'story_outliner' THEN
        node || jsonb_build_object(
          'data',
          (node->'data') - 'selectedModels'  -- Remove selectedModels key
        )
      ELSE
        node
    END
  )
  FROM jsonb_array_elements(ue.nodes) AS node
)
WHERE ue.nodes IS NOT NULL 
  AND EXISTS (
    SELECT 1 
    FROM jsonb_array_elements(ue.nodes) AS node
    WHERE (node->'data'->>'role') = 'story_outliner'
      AND (node->'data'->'selectedModels') IS NOT NULL  -- Only update if selectedModels exists
  );

-- For ai_engines: Remove selectedModels from story_outliner nodes
UPDATE ai_engines ae
SET nodes = (
  SELECT jsonb_agg(
    CASE 
      WHEN (node->'data'->>'role') = 'story_outliner' THEN
        node || jsonb_build_object(
          'data',
          (node->'data') - 'selectedModels'  -- Remove selectedModels key
        )
      ELSE
        node
    END
  )
  FROM jsonb_array_elements(ae.nodes) AS node
)
WHERE ae.nodes IS NOT NULL 
  AND EXISTS (
    SELECT 1 
    FROM jsonb_array_elements(ae.nodes) AS node
    WHERE (node->'data'->>'role') = 'story_outliner'
      AND (node->'data'->'selectedModels') IS NOT NULL  -- Only update if selectedModels exists
  );

-- Also check flow_config.nodes for ai_engines (some engines store nodes in flow_config)
UPDATE ai_engines ae
SET flow_config = jsonb_set(
  flow_config,
  '{nodes}',
  (
    SELECT jsonb_agg(
      CASE 
        WHEN (node->'data'->>'role') = 'story_outliner' THEN
          node || jsonb_build_object(
            'data',
            (node->'data') - 'selectedModels'
          )
        ELSE
          node
      END
    )
    FROM jsonb_array_elements(flow_config->'nodes') AS node
  )
)
WHERE flow_config->'nodes' IS NOT NULL
  AND EXISTS (
    SELECT 1 
    FROM jsonb_array_elements(flow_config->'nodes') AS node
    WHERE (node->'data'->>'role') = 'story_outliner'
      AND (node->'data'->'selectedModels') IS NOT NULL
  );

-- Optional: Remove selectedModels from ALL nodes (not just story_outliner) if you want to be thorough
-- Uncomment these if needed:

-- UPDATE user_engines ue
-- SET nodes = (
--   SELECT jsonb_agg(
--     node || jsonb_build_object(
--       'data',
--       (node->'data') - 'selectedModels'
--     )
--   )
--   FROM jsonb_array_elements(ue.nodes) AS node
-- )
-- WHERE ue.nodes IS NOT NULL;

-- UPDATE ai_engines ae
-- SET nodes = (
--   SELECT jsonb_agg(
--     node || jsonb_build_object(
--       'data',
--       (node->'data') - 'selectedModels'
--     )
--   )
--   FROM jsonb_array_elements(ae.nodes) AS node
-- )
-- WHERE ae.nodes IS NOT NULL;

