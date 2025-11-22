/*
  # Create Workflow System Tables

  This migration creates the missing tables for the Priority 1 Enhanced Content Flow Control system:
  
  1. New Tables
    - `ai_workflows` - Store custom workflow definitions
    - `workflow_executions` - Track workflow execution history and status
    - `quality_gate_results` - Store quality gate validation results
    - `workflow_templates` - Store reusable workflow templates

  2. Security
    - Enable RLS on all new tables
    - Comprehensive policies for workflow access control
    - Admin and user-specific access patterns

  3. Performance
    - Strategic indexes for workflow queries
    - Optimized execution tracking
    - Efficient quality gate result storage
*/

-- 1. AI WORKFLOWS TABLE - Store custom workflow definitions
CREATE TABLE IF NOT EXISTS ai_workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  nodes jsonb NOT NULL DEFAULT '[]',
  connections jsonb NOT NULL DEFAULT '[]',
  is_active boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  metadata jsonb DEFAULT '{}',
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. WORKFLOW EXECUTIONS TABLE - Track workflow execution history
CREATE TABLE IF NOT EXISTS workflow_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid REFERENCES ai_workflows(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  book_id uuid REFERENCES books(id) ON DELETE CASCADE,
  status text DEFAULT 'running' CHECK (status IN ('running', 'paused', 'completed', 'failed', 'cancelled')),
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  current_step text,
  steps jsonb DEFAULT '[]',
  metrics jsonb DEFAULT '{}',
  error_message text,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- 3. QUALITY GATE RESULTS TABLE - Store quality gate validation results
CREATE TABLE IF NOT EXISTS quality_gate_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  gate_name text NOT NULL,
  content_id text,
  execution_id uuid REFERENCES workflow_executions(id) ON DELETE CASCADE,
  passed boolean NOT NULL,
  score decimal(5,2) DEFAULT 0,
  feedback text,
  suggestions jsonb DEFAULT '[]',
  metrics jsonb DEFAULT '{}',
  context jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- 4. WORKFLOW TEMPLATES TABLE - Store reusable workflow templates
CREATE TABLE IF NOT EXISTS workflow_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text DEFAULT 'general',
  nodes jsonb NOT NULL DEFAULT '[]',
  connections jsonb NOT NULL DEFAULT '[]',
  is_public boolean DEFAULT true,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE ai_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_gate_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR AI_WORKFLOWS
CREATE POLICY "Users can view own workflows" ON ai_workflows
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can create workflows" ON ai_workflows
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own workflows" ON ai_workflows
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete own workflows" ON ai_workflows
  FOR DELETE USING (created_by = auth.uid());

CREATE POLICY "Admins can manage all workflows" ON ai_workflows
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS POLICIES FOR WORKFLOW_EXECUTIONS
CREATE POLICY "Users can view own executions" ON workflow_executions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create own executions" ON workflow_executions
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own executions" ON workflow_executions
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can view all executions" ON workflow_executions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS POLICIES FOR QUALITY_GATE_RESULTS
CREATE POLICY "Users can view own quality results" ON quality_gate_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workflow_executions 
      WHERE id = quality_gate_results.execution_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert quality results" ON quality_gate_results
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all quality results" ON quality_gate_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- RLS POLICIES FOR WORKFLOW_TEMPLATES
CREATE POLICY "Users can view public templates" ON workflow_templates
  FOR SELECT USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create templates" ON workflow_templates
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own templates" ON workflow_templates
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete own templates" ON workflow_templates
  FOR DELETE USING (created_by = auth.uid());

CREATE POLICY "Admins can manage all templates" ON workflow_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_ai_workflows_created_by ON ai_workflows(created_by);
CREATE INDEX IF NOT EXISTS idx_ai_workflows_active ON ai_workflows(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_workflows_created_at ON ai_workflows(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_workflow_executions_user_id ON workflow_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_started_at ON workflow_executions(started_at DESC);

CREATE INDEX IF NOT EXISTS idx_quality_gate_results_execution_id ON quality_gate_results(execution_id);
CREATE INDEX IF NOT EXISTS idx_quality_gate_results_gate_name ON quality_gate_results(gate_name);
CREATE INDEX IF NOT EXISTS idx_quality_gate_results_created_at ON quality_gate_results(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_workflow_templates_public ON workflow_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_category ON workflow_templates(category);
CREATE INDEX IF NOT EXISTS idx_workflow_templates_created_by ON workflow_templates(created_by);

-- TRIGGERS FOR UPDATED_AT COLUMNS
CREATE TRIGGER update_ai_workflows_updated_at 
  BEFORE UPDATE ON ai_workflows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_templates_updated_at 
  BEFORE UPDATE ON workflow_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- INSERT SAMPLE WORKFLOW TEMPLATES
INSERT INTO workflow_templates (name, description, category, nodes, connections, is_public) VALUES
(
  'Basic Content Generation',
  'Simple workflow for basic content generation with quality checks',
  'basic',
  '[
    {"id": "start", "type": "start", "position": {"x": 100, "y": 100}, "data": {"label": "Start"}},
    {"id": "generate", "type": "process", "position": {"x": 300, "y": 100}, "data": {"label": "Generate Content", "service": "openai"}},
    {"id": "quality", "type": "quality", "position": {"x": 500, "y": 100}, "data": {"label": "Quality Check", "gates": ["basic-quality"]}},
    {"id": "end", "type": "end", "position": {"x": 700, "y": 100}, "data": {"label": "Complete"}}
  ]',
  '[
    {"source": "start", "target": "generate"},
    {"source": "generate", "target": "quality"},
    {"source": "quality", "target": "end"}
  ]',
  true
),
(
  'Multi-Service Generation',
  'Advanced workflow using multiple AI services with fallback',
  'advanced',
  '[
    {"id": "start", "type": "start", "position": {"x": 100, "y": 100}, "data": {"label": "Start"}},
    {"id": "analyze", "type": "analysis", "position": {"x": 300, "y": 100}, "data": {"label": "Content Analysis", "service": "claude"}},
    {"id": "route", "type": "condition", "position": {"x": 500, "y": 100}, "data": {"label": "Route Content"}},
    {"id": "primary", "type": "process", "position": {"x": 400, "y": 250}, "data": {"label": "Primary Generation", "service": "openai"}},
    {"id": "fallback", "type": "process", "position": {"x": 600, "y": 250}, "data": {"label": "Fallback Generation", "service": "claude"}},
    {"id": "quality", "type": "quality", "position": {"x": 500, "y": 400}, "data": {"label": "Quality Gates", "gates": ["pro-quality", "readability"]}},
    {"id": "end", "type": "end", "position": {"x": 500, "y": 550}, "data": {"label": "Complete"}}
  ]',
  '[
    {"source": "start", "target": "analyze"},
    {"source": "analyze", "target": "route"},
    {"source": "route", "target": "primary", "condition": "primary"},
    {"source": "route", "target": "fallback", "condition": "fallback"},
    {"source": "primary", "target": "quality"},
    {"source": "fallback", "target": "quality"},
    {"source": "quality", "target": "end"}
  ]',
  true
),
(
  'Premium Quality Pipeline',
  'High-end workflow with comprehensive quality gates and expert review',
  'premium',
  '[
    {"id": "start", "type": "start", "position": {"x": 100, "y": 100}, "data": {"label": "Start"}},
    {"id": "research", "type": "process", "position": {"x": 300, "y": 100}, "data": {"label": "Research", "service": "perplexity"}},
    {"id": "generate", "type": "process", "position": {"x": 500, "y": 100}, "data": {"label": "Generate", "service": "claude"}},
    {"id": "enhance", "type": "process", "position": {"x": 700, "y": 100}, "data": {"label": "Enhance", "service": "openai"}},
    {"id": "quality", "type": "quality", "position": {"x": 500, "y": 250}, "data": {"label": "Premium Quality", "gates": ["premium-quality", "expert-review", "citation-check"]}},
    {"id": "end", "type": "end", "position": {"x": 500, "y": 400}, "data": {"label": "Complete"}}
  ]',
  '[
    {"source": "start", "target": "research"},
    {"source": "research", "target": "generate"},
    {"source": "generate", "target": "enhance"},
    {"source": "enhance", "target": "quality"},
    {"source": "quality", "target": "end"}
  ]',
  true
);
