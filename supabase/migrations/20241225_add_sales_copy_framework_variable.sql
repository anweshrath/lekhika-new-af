-- SALES COPY FRAMEWORK VARIABLE MIGRATION
-- Adds the Sales Copy Framework variable to the alchemist system
-- Created: 2024-12-25

-- Insert the Sales Copy Framework variable into alchemist_node_palette
INSERT INTO alchemist_node_palette (
  node_id,
  name,
  description,
  type,
  category,
  role,
  configuration,
  is_active,
  created_at,
  updated_at
) VALUES (
  'sales_copy_framework_variable',
  'Sales Copy Framework',
  'Choose from the top 10 proven sales copywriting frameworks for maximum conversion: AIDA, PASTOR, PAS, BAB, STAR, QUEST, ACCA, SCRAP, SLAP, FOREST',
  'input',
  'Variables',
  'variable',
  '{
    "variable": "sales_copy_framework",
    "name": "Sales Copy Framework",
    "type": "select",
    "required": true,
    "placeholder": "Choose your copywriting framework",
    "description": "Select from 10 proven sales copywriting frameworks",
    "options": [
      "AIDA (Attention, Interest, Desire, Action)",
      "PASTOR (Problem, Amplify, Story, Transformation, Offer, Response)", 
      "PAS (Problem, Agitate, Solution)",
      "BAB (Before, After, Bridge)",
      "STAR (Story, Transformation, Acceptance, Response)",
      "QUEST (Qualify, Understand, Educate, Stimulate, Transition)",
      "ACCA (Awareness, Comprehension, Conviction, Action)",
      "SCRAP (Situation, Complication, Resolution, Action, Polish)",
      "SLAP (Stop, Look, Act, Purchase)",
      "FOREST (Facts, Objectives, Reasons, Examples, Story, Theme)"
    ],
    "category": "copywriting",
    "usage_context": ["sales_copy", "marketing_content", "email_campaigns", "landing_pages"],
    "effectiveness_rating": "high"
  }'::jsonb,
  true,
  now(),
  now()
) ON CONFLICT (node_id) DO UPDATE SET
  configuration = EXCLUDED.configuration,
  description = EXCLUDED.description,
  updated_at = now();

-- Add comment for documentation
COMMENT ON TABLE alchemist_node_palette IS 'Contains Alchemist Flow nodes and variables including Sales Copy Framework';

-- Verify the insert
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM alchemist_node_palette 
    WHERE node_id = 'sales_copy_framework_variable'
  ) THEN
    RAISE NOTICE '✅ Sales Copy Framework variable successfully added to alchemist_node_palette';
  ELSE
    RAISE NOTICE '❌ Failed to add Sales Copy Framework variable';
  END IF;
END $$;
