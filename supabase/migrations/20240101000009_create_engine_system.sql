/*
  # Engine System Implementation

  This migration creates the engine deployment and assignment system for BookMagic AI:
  
  1. New Tables
    - `ai_engines` - Store deployed engines created from flows
    - `engine_assignments` - Assign engines to users or tiers
    - `engine_executions` - Track engine usage and performance

  2. Security
    - Enable RLS on all new tables
    - Comprehensive policies for engine access control
    - Admin management capabilities

  3. Performance
    - Strategic indexes for engine queries
    - Optimized assignment lookups
*/

-- 1. AI ENGINES TABLE - Store deployed engines
CREATE TABLE IF NOT EXISTS ai_engines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  flow_config jsonb NOT NULL DEFAULT '{}',
  models jsonb NOT NULL DEFAULT '[]',
  execution_mode text DEFAULT 'sequential' CHECK (execution_mode IN ('sequential', 'parallel')),
  tier text CHECK (tier IN ('hobby', 'pro', 'enterprise')),
  active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. ENGINE ASSIGNMENTS TABLE - Assign engines to users/tiers
CREATE TABLE IF NOT EXISTS engine_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engine_id uuid REFERENCES ai_engines(id) ON DELETE CASCADE NOT NULL,
  assignment_type text CHECK (assignment_type IN ('tier', 'user')) NOT NULL,
  tier text CHECK (tier IN ('hobby', 'pro', 'enterprise')),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  priority integer DEFAULT 0,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_assignment CHECK (
    (assignment_type = 'tier' AND tier IS NOT NULL AND user_id IS NULL) OR
    (assignment_type = 'user' AND user_id IS NOT NULL AND tier IS NULL)
  )
);

-- 3. ENGINE EXECUTIONS TABLE - Track engine usage
CREATE TABLE IF NOT EXISTS engine_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  engine_id uuid REFERENCES ai_engines(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_id uuid REFERENCES books(id) ON DELETE CASCADE,
  execution_data jsonb DEFAULT '{}',
  status text DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed')),
  error_message text,
  execution_time_ms integer,
  tokens_used integer DEFAULT 0,
  cost_estimate decimal(10,4) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE ai_engines ENABLE ROW LEVEL SECURITY;
ALTER TABLE engine_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE engine_executions ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR AI_ENGINES
CREATE POLICY "Admins can manage all engines" ON ai_engines
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view engines assigned to them" ON ai_engines
  FOR SELECT USING (
    id IN (
      SELECT engine_id FROM engine_assignments 
      WHERE (assignment_type = 'user' AND user_id = auth.uid()) 
         OR (assignment_type = 'tier' AND tier = (
           SELECT tier FROM user_credits WHERE user_id = auth.uid()
         ))
    )
  );

-- RLS POLICIES FOR ENGINE_ASSIGNMENTS
CREATE POLICY "Admins can manage all assignments" ON engine_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Users can view their assignments" ON engine_assignments
  FOR SELECT USING (
    (assignment_type = 'user' AND user_id = auth.uid()) OR
    (assignment_type = 'tier' AND tier = (
      SELECT tier FROM user_credits WHERE user_id = auth.uid()
    ))
  );

-- RLS POLICIES FOR ENGINE_EXECUTIONS
CREATE POLICY "Users can view own executions" ON engine_executions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own executions" ON engine_executions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own executions" ON engine_executions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all executions" ON engine_executions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_ai_engines_active ON ai_engines(active);
CREATE INDEX IF NOT EXISTS idx_ai_engines_tier ON ai_engines(tier);
CREATE INDEX IF NOT EXISTS idx_ai_engines_created_by ON ai_engines(created_by);
CREATE INDEX IF NOT EXISTS idx_engine_assignments_engine_id ON engine_assignments(engine_id);
CREATE INDEX IF NOT EXISTS idx_engine_assignments_user_id ON engine_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_engine_assignments_tier ON engine_assignments(tier);
CREATE INDEX IF NOT EXISTS idx_engine_assignments_active ON engine_assignments(active);
CREATE INDEX IF NOT EXISTS idx_engine_executions_engine_id ON engine_executions(engine_id);
CREATE INDEX IF NOT EXISTS idx_engine_executions_user_id ON engine_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_engine_executions_status ON engine_executions(status);
CREATE INDEX IF NOT EXISTS idx_engine_executions_created_at ON engine_executions(created_at DESC);

-- TRIGGERS FOR UPDATED_AT
CREATE TRIGGER update_ai_engines_updated_at 
  BEFORE UPDATE ON ai_engines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- SAMPLE ENGINE DATA
INSERT INTO ai_engines (name, description, flow_config, models, tier, active) VALUES
(
  'Comprehensive Book Engine',
  'Full 7-step book generation process with research, analysis, writing, and formatting',
  '{
    "type": "full",
    "steps": [
      {"id": "research", "name": "Research", "order": 1},
      {"id": "analysis", "name": "Analysis", "order": 2},
      {"id": "parsing", "name": "Parsing", "order": 3},
      {"id": "writing", "name": "Writing", "order": 4},
      {"id": "rewriting", "name": "Rewriting", "order": 5},
      {"id": "image_generation", "name": "Image Generation", "order": 6},
      {"id": "formatting", "name": "Formatting", "order": 7}
    ]
  }',
  '[
    {"service": "openai", "model": "gpt-4", "maxTokens": 4000},
    {"service": "claude", "model": "claude-3-sonnet", "maxTokens": 3000},
    {"service": "perplexity", "model": "llama-3-sonar-large", "maxTokens": 2000}
  ]',
  'pro',
  true
),
(
  'Streamlined Book Engine',
  'Efficient 2-step book generation for quick content creation',
  '{
    "type": "simplified",
    "steps": [
      {"id": "research_simple", "name": "Research & Analysis", "order": 1},
      {"id": "writing_simple", "name": "Complete Writing", "order": 2}
    ]
  }',
  '[
    {"service": "openai", "model": "gpt-4", "maxTokens": 6000},
    {"service": "claude", "model": "claude-3-haiku", "maxTokens": 4000}
  ]',
  'hobby',
  true
),
(
  'Enterprise Multi-AI Engine',
  'Advanced multi-model orchestration for enterprise-grade content',
  '{
    "type": "enterprise",
    "steps": [
      {"id": "research", "name": "Deep Research", "order": 1},
      {"id": "analysis", "name": "Advanced Analysis", "order": 2},
      {"id": "writing", "name": "Multi-Model Writing", "order": 3},
      {"id": "quality_check", "name": "Quality Assurance", "order": 4}
    ]
  }',
  '[
    {"service": "openai", "model": "gpt-4", "maxTokens": 8000},
    {"service": "claude", "model": "claude-3-opus", "maxTokens": 6000},
    {"service": "gemini", "model": "gemini-pro", "maxTokens": 4000},
    {"service": "perplexity", "model": "llama-3-sonar-large", "maxTokens": 3000}
  ]',
  'enterprise',
  true
);

-- SAMPLE ENGINE ASSIGNMENTS
INSERT INTO engine_assignments (engine_id, assignment_type, tier, priority) VALUES
(
  (SELECT id FROM ai_engines WHERE name = 'Streamlined Book Engine'),
  'tier',
  'hobby',
  1
),
(
  (SELECT id FROM ai_engines WHERE name = 'Comprehensive Book Engine'),
  'tier',
  'pro',
  1
),
(
  (SELECT id FROM ai_engines WHERE name = 'Enterprise Multi-AI Engine'),
  'tier',
  'enterprise',
  1
);
