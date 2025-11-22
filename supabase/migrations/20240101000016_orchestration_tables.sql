/*
  # Multi-Agent Orchestration System Tables

  1. New Tables
    - `workflow_executions` - Track parallel workflow executions
    - `communication_channels` - Agent communication channels
    - `protocol_agreements` - Communication protocol agreements
    - `resource_allocations` - Dynamic resource allocation tracking
    - `resource_performance_metrics` - Resource pool performance data
    - `system_metrics` - Overall system performance metrics

  2. Security
    - Enable RLS on all new tables
    - Add policies for authenticated users and super admins
    - Ensure proper access control for orchestration data

  3. Features
    - Complete workflow execution tracking
    - Real-time agent communication logging
    - Resource allocation and performance monitoring
    - System health and metrics collection
*/

-- Workflow Executions Table
CREATE TABLE IF NOT EXISTS workflow_executions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  book_id uuid,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled', 'paused')),
  progress integer DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  current_step text,
  steps jsonb DEFAULT '[]'::jsonb,
  results jsonb DEFAULT '{}'::jsonb,
  metrics jsonb DEFAULT '{}'::jsonb,
  context jsonb DEFAULT '{}'::jsonb,
  error_message text,
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Communication Channels Table
CREATE TABLE IF NOT EXISTS communication_channels (
  id text PRIMARY KEY,
  participants text[] NOT NULL DEFAULT '{}',
  config jsonb DEFAULT '{}'::jsonb,
  message_count integer DEFAULT 0,
  last_activity timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Protocol Agreements Table
CREATE TABLE IF NOT EXISTS protocol_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participants text[] NOT NULL DEFAULT '{}',
  protocol jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
  established_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Resource Allocations Table
CREATE TABLE IF NOT EXISTS resource_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id text NOT NULL,
  requirements jsonb NOT NULL DEFAULT '{}'::jsonb,
  strategy text NOT NULL DEFAULT 'adaptive',
  allocated_resources jsonb DEFAULT '{}'::jsonb,
  estimated_cost numeric(10,6) DEFAULT 0,
  actual_cost numeric(10,6),
  estimated_duration integer DEFAULT 0,
  actual_duration integer,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'allocated', 'released', 'failed')),
  created_at timestamptz DEFAULT now(),
  released_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- Resource Performance Metrics Table
CREATE TABLE IF NOT EXISTS resource_performance_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id text NOT NULL,
  metrics jsonb NOT NULL DEFAULT '{}'::jsonb,
  recorded_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- System Metrics Table
CREATE TABLE IF NOT EXISTS system_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_type text NOT NULL,
  metric_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocol_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;

-- Workflow Executions Policies
CREATE POLICY "Users can view their own workflow executions"
  ON workflow_executions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workflow executions"
  ON workflow_executions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workflow executions"
  ON workflow_executions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all workflow executions"
  ON workflow_executions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'super_admin'
    )
  );

-- Communication Channels Policies
CREATE POLICY "Authenticated users can view communication channels"
  ON communication_channels
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Super admins can manage communication channels"
  ON communication_channels
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'super_admin'
    )
  );

-- Protocol Agreements Policies
CREATE POLICY "Authenticated users can view protocol agreements"
  ON protocol_agreements
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Super admins can manage protocol agreements"
  ON protocol_agreements
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'super_admin'
    )
  );

-- Resource Allocations Policies
CREATE POLICY "Authenticated users can view resource allocations"
  ON resource_allocations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Super admins can manage resource allocations"
  ON resource_allocations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'super_admin'
    )
  );

-- Resource Performance Metrics Policies
CREATE POLICY "Authenticated users can view resource performance metrics"
  ON resource_performance_metrics
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Super admins can manage resource performance metrics"
  ON resource_performance_metrics
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'super_admin'
    )
  );

-- System Metrics Policies
CREATE POLICY "Authenticated users can view system metrics"
  ON system_metrics
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Super admins can manage system metrics"
  ON system_metrics
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'super_admin'
    )
  );

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_workflow_executions_user_id ON workflow_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_workflow_executions_started_at ON workflow_executions(started_at);
CREATE INDEX IF NOT EXISTS idx_communication_channels_last_activity ON communication_channels(last_activity);
CREATE INDEX IF NOT EXISTS idx_resource_allocations_task_id ON resource_allocations(task_id);
CREATE INDEX IF NOT EXISTS idx_resource_allocations_status ON resource_allocations(status);
CREATE INDEX IF NOT EXISTS idx_resource_performance_metrics_pool_id ON resource_performance_metrics(pool_id);
CREATE INDEX IF NOT EXISTS idx_resource_performance_metrics_recorded_at ON resource_performance_metrics(recorded_at);
CREATE INDEX IF NOT EXISTS idx_system_metrics_type ON system_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_system_metrics_created_at ON system_metrics(created_at);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_workflow_executions_updated_at
  BEFORE UPDATE ON workflow_executions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_communication_channels_updated_at
  BEFORE UPDATE ON communication_channels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_protocol_agreements_updated_at
  BEFORE UPDATE ON protocol_agreements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resource_allocations_updated_at
  BEFORE UPDATE ON resource_allocations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
