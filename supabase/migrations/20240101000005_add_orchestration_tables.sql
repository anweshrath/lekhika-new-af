/*
  # Add Multi-Agent Orchestration Tables

  1. New Tables
    - `communication_channels` - Agent communication channels
    - `protocol_agreements` - Communication protocol agreements
    - `resource_allocations` - Dynamic resource allocation tracking
    - `resource_performance_metrics` - Resource pool performance data
    - `orchestration_sessions` - Multi-agent coordination sessions
    - `agent_interactions` - Agent-to-agent interaction logs

  2. Security
    - Enable RLS on all new tables
    - Add policies for admin access and user data isolation
    - Secure sensitive orchestration data

  3. Performance
    - Add indexes for frequently queried columns
    - Optimize for real-time monitoring queries
*/

-- Communication Channels Table
CREATE TABLE IF NOT EXISTS communication_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participants text[] NOT NULL,
  config jsonb DEFAULT '{}',
  message_count integer DEFAULT 0,
  last_activity timestamptz DEFAULT now(),
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Protocol Agreements Table
CREATE TABLE IF NOT EXISTS protocol_agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participants text[] NOT NULL,
  protocol jsonb NOT NULL,
  version text DEFAULT '1.0',
  status text DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
  established_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Resource Allocations Table
CREATE TABLE IF NOT EXISTS resource_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id text NOT NULL,
  user_id uuid REFERENCES auth.users(id),
  requirements jsonb NOT NULL,
  strategy text NOT NULL,
  allocated_resources jsonb DEFAULT '{}',
  estimated_cost decimal(10,6) DEFAULT 0,
  actual_cost decimal(10,6),
  estimated_duration integer, -- milliseconds
  actual_duration integer, -- milliseconds
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'allocated', 'active', 'completed', 'failed', 'cancelled')),
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Resource Performance Metrics Table
CREATE TABLE IF NOT EXISTS resource_performance_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id text NOT NULL,
  metrics jsonb NOT NULL,
  recorded_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Orchestration Sessions Table
CREATE TABLE IF NOT EXISTS orchestration_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coordinator_agent text NOT NULL,
  participants text[] NOT NULL,
  task jsonb NOT NULL,
  strategy text NOT NULL,
  status text DEFAULT 'initializing' CHECK (status IN ('initializing', 'active', 'completed', 'failed', 'cancelled')),
  results jsonb DEFAULT '{}',
  errors jsonb DEFAULT '[]',
  metrics jsonb DEFAULT '{}',
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Agent Interactions Table
CREATE TABLE IF NOT EXISTS agent_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES orchestration_sessions(id) ON DELETE CASCADE,
  from_agent text NOT NULL,
  to_agent text NOT NULL,
  interaction_type text NOT NULL,
  content jsonb NOT NULL,
  response jsonb,
  duration integer, -- milliseconds
  success boolean DEFAULT true,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE communication_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE protocol_agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE resource_performance_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE orchestration_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Communication Channels
CREATE POLICY "Admins can manage all communication channels"
  ON communication_channels
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for Protocol Agreements
CREATE POLICY "Admins can manage all protocol agreements"
  ON protocol_agreements
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for Resource Allocations
CREATE POLICY "Users can view their own resource allocations"
  ON resource_allocations
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all resource allocations"
  ON resource_allocations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE POLICY "System can create resource allocations"
  ON resource_allocations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "System can update resource allocations"
  ON resource_allocations
  FOR UPDATE
  TO authenticated
  USING (true);

-- RLS Policies for Resource Performance Metrics
CREATE POLICY "Admins can manage all resource performance metrics"
  ON resource_performance_metrics
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for Orchestration Sessions
CREATE POLICY "Admins can manage all orchestration sessions"
  ON orchestration_sessions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for Agent Interactions
CREATE POLICY "Admins can manage all agent interactions"
  ON agent_interactions
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_communication_channels_status ON communication_channels(status);
CREATE INDEX IF NOT EXISTS idx_communication_channels_last_activity ON communication_channels(last_activity);

CREATE INDEX IF NOT EXISTS idx_protocol_agreements_status ON protocol_agreements(status);
CREATE INDEX IF NOT EXISTS idx_protocol_agreements_participants ON protocol_agreements USING GIN(participants);

CREATE INDEX IF NOT EXISTS idx_resource_allocations_user_id ON resource_allocations(user_id);
CREATE INDEX IF NOT EXISTS idx_resource_allocations_status ON resource_allocations(status);
CREATE INDEX IF NOT EXISTS idx_resource_allocations_task_id ON resource_allocations(task_id);
CREATE INDEX IF NOT EXISTS idx_resource_allocations_created_at ON resource_allocations(created_at);

CREATE INDEX IF NOT EXISTS idx_resource_performance_metrics_pool_id ON resource_performance_metrics(pool_id);
CREATE INDEX IF NOT EXISTS idx_resource_performance_metrics_recorded_at ON resource_performance_metrics(recorded_at);

CREATE INDEX IF NOT EXISTS idx_orchestration_sessions_status ON orchestration_sessions(status);
CREATE INDEX IF NOT EXISTS idx_orchestration_sessions_coordinator ON orchestration_sessions(coordinator_agent);
CREATE INDEX IF NOT EXISTS idx_orchestration_sessions_participants ON orchestration_sessions USING GIN(participants);

CREATE INDEX IF NOT EXISTS idx_agent_interactions_session_id ON agent_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_agent_interactions_from_agent ON agent_interactions(from_agent);
CREATE INDEX IF NOT EXISTS idx_agent_interactions_to_agent ON agent_interactions(to_agent);
CREATE INDEX IF NOT EXISTS idx_agent_interactions_created_at ON agent_interactions(created_at);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_communication_channels_updated_at
  BEFORE UPDATE ON communication_channels
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_resource_allocations_updated_at
  BEFORE UPDATE ON resource_allocations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
