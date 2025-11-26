/*
  # Quality Control & Validation System Tables

  1. New Tables
    - `quality_assessments` - Store quality assessment results
    - `validation_rules` - Store validation rule configurations
    - `improvement_suggestions` - Store AI-generated improvement suggestions
    - `quality_reports` - Store periodic quality reports
    - `content_quality_metrics` - Store detailed quality metrics

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users and super admins
    - Ensure proper access control for quality data

  3. Features
    - Complete quality assessment tracking
    - Validation rule management
    - Improvement suggestion storage
    - Quality trend analysis
    - Performance metrics collection
*/

-- Quality Assessments Table
CREATE TABLE IF NOT EXISTS quality_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id text NOT NULL,
  content_type text DEFAULT 'book' CHECK (content_type IN ('book', 'section', 'article', 'general')),
  type text NOT NULL CHECK (type IN ('assessment', 'validation', 'suggestion')),
  results jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb DEFAULT '{}'::jsonb,
  overall_score numeric(3,2) CHECK (overall_score >= 0 AND overall_score <= 1),
  passed boolean,
  issues text[] DEFAULT '{}',
  warnings text[] DEFAULT '{}',
  processing_time integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Validation Rules Table
CREATE TABLE IF NOT EXISTS validation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_type text NOT NULL,
  name text NOT NULL,
  description text,
  parameters jsonb DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  is_critical boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Improvement Suggestions Table
CREATE TABLE IF NOT EXISTS improvement_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id text NOT NULL,
  category text NOT NULL,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  description text NOT NULL,
  suggestion text NOT NULL,
  expected_improvement numeric(3,2) CHECK (expected_improvement >= 0 AND expected_improvement <= 1),
  implementation_difficulty text DEFAULT 'medium' CHECK (implementation_difficulty IN ('easy', 'medium', 'hard')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'applied', 'rejected', 'obsolete')),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Quality Reports Table
CREATE TABLE IF NOT EXISTS quality_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type text DEFAULT 'daily' CHECK (report_type IN ('daily', 'weekly', 'monthly', 'custom')),
  date date NOT NULL,
  metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  trends jsonb DEFAULT '{}'::jsonb,
  recommendations jsonb DEFAULT '{}'::jsonb,
  summary text,
  created_at timestamptz DEFAULT now()
);

-- Content Quality Metrics Table
CREATE TABLE IF NOT EXISTS content_quality_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id text NOT NULL,
  content_type text DEFAULT 'book',
  metric_name text NOT NULL,
  metric_value numeric(10,4) NOT NULL,
  metric_category text DEFAULT 'quality' CHECK (metric_category IN ('quality', 'readability', 'structure', 'originality', 'grammar')),
  benchmark_value numeric(10,4),
  threshold_value numeric(10,4),
  passed boolean,
  recorded_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE quality_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE improvement_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_quality_metrics ENABLE ROW LEVEL SECURITY;

-- Quality Assessments Policies
CREATE POLICY "Users can view quality assessments for their content"
  ON quality_assessments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM books 
      WHERE books.id::text = quality_assessments.content_id 
      AND books.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "System can create quality assessments"
  ON quality_assessments
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Super admins can manage all quality assessments"
  ON quality_assessments
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'super_admin'
    )
  );

-- Validation Rules Policies
CREATE POLICY "Authenticated users can view validation rules"
  ON validation_rules
  FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Super admins can manage validation rules"
  ON validation_rules
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'super_admin'
    )
  );

-- Improvement Suggestions Policies
CREATE POLICY "Users can view suggestions for their content"
  ON improvement_suggestions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM books 
      WHERE books.id::text = improvement_suggestions.content_id 
      AND books.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "System can create improvement suggestions"
  ON improvement_suggestions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update suggestions for their content"
  ON improvement_suggestions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM books 
      WHERE books.id::text = improvement_suggestions.content_id 
      AND books.user_id = auth.uid()
    )
  );

-- Quality Reports Policies
CREATE POLICY "Authenticated users can view quality reports"
  ON quality_reports
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Super admins can manage quality reports"
  ON quality_reports
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'super_admin'
    )
  );

-- Content Quality Metrics Policies
CREATE POLICY "Users can view metrics for their content"
  ON content_quality_metrics
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM books 
      WHERE books.id::text = content_quality_metrics.content_id 
      AND books.user_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role IN ('admin', 'super_admin')
    )
  );

CREATE POLICY "System can create quality metrics"
  ON content_quality_metrics
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_quality_assessments_content_id ON quality_assessments(content_id);
CREATE INDEX IF NOT EXISTS idx_quality_assessments_type ON quality_assessments(type);
CREATE INDEX IF NOT EXISTS idx_quality_assessments_created_at ON quality_assessments(created_at);
CREATE INDEX IF NOT EXISTS idx_quality_assessments_overall_score ON quality_assessments(overall_score);

CREATE INDEX IF NOT EXISTS idx_validation_rules_type ON validation_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_validation_rules_active ON validation_rules(is_active);

CREATE INDEX IF NOT EXISTS idx_improvement_suggestions_content_id ON improvement_suggestions(content_id);
CREATE INDEX IF NOT EXISTS idx_improvement_suggestions_priority ON improvement_suggestions(priority);
CREATE INDEX IF NOT EXISTS idx_improvement_suggestions_status ON improvement_suggestions(status);
CREATE INDEX IF NOT EXISTS idx_improvement_suggestions_created_at ON improvement_suggestions(created_at);

CREATE INDEX IF NOT EXISTS idx_quality_reports_date ON quality_reports(date);
CREATE INDEX IF NOT EXISTS idx_quality_reports_type ON quality_reports(report_type);

CREATE INDEX IF NOT EXISTS idx_content_quality_metrics_content_id ON content_quality_metrics(content_id);
CREATE INDEX IF NOT EXISTS idx_content_quality_metrics_category ON content_quality_metrics(metric_category);
CREATE INDEX IF NOT EXISTS idx_content_quality_metrics_recorded_at ON content_quality_metrics(recorded_at);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_quality_assessments_updated_at
  BEFORE UPDATE ON quality_assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_validation_rules_updated_at
  BEFORE UPDATE ON validation_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_improvement_suggestions_updated_at
  BEFORE UPDATE ON improvement_suggestions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default validation rules
INSERT INTO validation_rules (rule_type, name, description, parameters, is_active, is_critical) VALUES
('length', 'Content Length Validation', 'Validates content length within specified bounds', '{"minWords": 100, "maxWords": 10000}', true, false),
('readability', 'Readability Validation', 'Validates content readability level', '{"maxGradeLevel": 12, "targetAudience": "general"}', true, false),
('coherence', 'Coherence Validation', 'Validates content coherence and flow', '{"minScore": 0.6, "useAI": true}', true, false),
('originality', 'Originality Validation', 'Validates content originality', '{"minScore": 0.8, "checkPlagiarism": false}', true, true),
('grammar', 'Grammar Validation', 'Validates grammar and language quality', '{"maxErrors": 5, "useAI": true}', true, false),
('structure', 'Structure Validation', 'Validates content structure and organization', '{"requireHeadings": true, "minSections": 1, "maxSections": 20}', true, false)
ON CONFLICT DO NOTHING;
