-- DELETE ALL OLD NON-FUNCTIONAL NODES
-- Clear the entire alchemist_node_palette table completely

-- Clear existing data first
DELETE FROM alchemist_node_palette;

-- INSERT ONLY 5 MASTER NODES
INSERT INTO alchemist_node_palette (node_id, name, description, type, category, sub_category, role, icon, gradient, is_ai_enabled, configuration, is_active, created_by, created_at, updated_at) VALUES

-- 1. INPUT MASTER NODE
(
  'input',
  'Input Master',
  'Dynamic input collection with AI validation',
  'master',
  'master',
  'data',
  'input',
  '📝',
  'from-blue-500 to-blue-700',
  true,
  '{"inputFields": [{"name": "topic", "type": "text", "required": true}, {"name": "target_audience", "type": "select", "required": true}, {"name": "tone", "type": "select", "required": true}, {"name": "word_count", "type": "number", "required": false}], "aiIntegration": {"enabled": true, "validation": true, "suggestions": true}, "features": ["Dynamic Fields", "AI Validation", "Auto Suggestions"]}'::jsonb,
  true,
  'system',
  NOW(),
  NOW()
),

-- 2. PROCESS MASTER NODE
(
  'process',
  'Process Master',
  'AI-powered content processing',
  'master',
  'master',
  'processing',
  'process',
  '⚙️',
  'from-purple-500 to-purple-700',
  true,
  '{"processingModes": ["writing", "research", "editing", "optimization"], "aiIntegration": {"enabled": true, "models": ["gpt-4o", "claude-3"], "qualityLevel": "high"}, "features": ["Multi-Mode Processing", "AI Integration", "Quality Control"]}'::jsonb,
  true,
  'system',
  NOW(),
  NOW()
),

-- 3. CONDITION MASTER NODE
(
  'condition',
  'Condition Master',
  'Logical gates and conditional processing',
  'master',
  'master',
  'logic',
  'condition',
  '🔀',
  'from-green-500 to-green-700',
  true,
  '{"logicalGates": ["if_else", "and", "or", "not"], "aiIntegration": {"enabled": true, "logicMode": "advanced", "fallbackAction": "skip"}, "features": ["Logical Gates", "AI Logic", "Fallback Actions"]}'::jsonb,
  true,
  'system',
  NOW(),
  NOW()
),

-- 4. STRUCTURAL MASTER NODE
(
  'structural',
  'Structural Master',
  'Blueprint and content organization',
  'master',
  'master',
  'structure',
  'structural',
  '🏗️',
  'from-orange-500 to-orange-700',
  true,
  '{"blueprints": ["blog_series", "sales_funnel", "email_sequence"], "aiIntegration": {"enabled": true, "structureMode": "dynamic", "autoArrange": true}, "features": ["Blueprint Management", "Dynamic Structure", "Auto Arrange"]}'::jsonb,
  true,
  'system',
  NOW(),
  NOW()
),

-- 5. OUTPUT MASTER NODE
(
  'output',
  'Output Master',
  'Multi-format output delivery',
  'master',
  'master',
  'delivery',
  'output',
  '📤',
  'from-gray-500 to-gray-700',
  true,
  '{"outputTypes": [{"name": "Preview", "icon": "👁️"}, {"name": "Publish", "icon": "🚀"}, {"name": "Download", "icon": "💾"}], "aiIntegration": {"enabled": true, "optimization": true, "formatting": true}, "features": ["Multi-Format", "AI Optimization", "Platform Integration"]}'::jsonb,
  true,
  'system',
  NOW(),
  NOW()
);

-- Verify the data was inserted
SELECT node_id, name, type, category, role FROM alchemist_node_palette ORDER BY category, name;