/*
  # Create AI Flows Table

  This migration creates the ai_flows table for storing content creation flow configurations:
  
  1. New Table
    - `ai_flows` - Store content creation flow configurations and settings
  
  2. Security
    - Enable RLS on the new table
    - User-specific access patterns
    - Admin access for all flows
  
  3. Performance
    - Strategic indexes for flow queries
    - Optimized flow type filtering
*/

-- 1. AI FLOWS TABLE - Store content creation flow configurations
CREATE TABLE IF NOT EXISTS ai_flows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('simplified', 'expert', 'full')),
  steps text[] NOT NULL DEFAULT '{}',
  configurations jsonb DEFAULT '{}',
  parameters jsonb DEFAULT '{}',
  models jsonb DEFAULT '{}',
  is_default boolean DEFAULT false,
  usage_count integer DEFAULT 0,
  last_used timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE ai_flows ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR AI_FLOWS
CREATE POLICY "Users can view own flows" ON ai_flows
  FOR SELECT USING (created_by = auth.uid());

CREATE POLICY "Users can create flows" ON ai_flows
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own flows" ON ai_flows
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Users can delete own flows" ON ai_flows
  FOR DELETE USING (created_by = auth.uid());

CREATE POLICY "Admins can manage all flows" ON ai_flows
  FOR ALL USING (
    auth.uid() IN (
      SELECT user_id 
      FROM auth.users 
      WHERE role = 'superadmin'
    )
  );

-- PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_ai_flows_created_by ON ai_flows(created_by);
CREATE INDEX IF NOT EXISTS idx_ai_flows_type ON ai_flows(type);
CREATE INDEX IF NOT EXISTS idx_ai_flows_is_default ON ai_flows(is_default);
CREATE INDEX IF NOT EXISTS idx_ai_flows_created_at ON ai_flows(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_flows_usage_count ON ai_flows(usage_count DESC);

-- TRIGGER FOR UPDATED_AT COLUMN
CREATE TRIGGER update_ai_flows_updated_at 
  BEFORE UPDATE ON ai_flows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- FUNCTION TO INCREMENT USAGE COUNT
CREATE OR REPLACE FUNCTION increment_usage_count()
RETURNS integer AS $$
BEGIN
  RETURN COALESCE(NEW.usage_count, 0) + 1;
END;
$$ LANGUAGE plpgsql;
