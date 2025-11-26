-- Create user_analytics table for preserving token/cost data
-- This table will store hourly aggregated analytics data
-- Execution table can be cleaned up without losing analytics

CREATE TABLE IF NOT EXISTS user_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
  date_hour TIMESTAMPTZ NOT NULL, -- Hourly granularity
  total_tokens INTEGER DEFAULT 0,
  total_cost DECIMAL(10,6) DEFAULT 0.0,
  execution_count INTEGER DEFAULT 0,
  successful_executions INTEGER DEFAULT 0,
  failed_executions INTEGER DEFAULT 0,
  cancelled_executions INTEGER DEFAULT 0,
  avg_tokens_per_execution DECIMAL(10,2) DEFAULT 0.0,
  peak_hourly_usage INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one record per user per hour
  UNIQUE(user_id, date_hour)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON user_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analytics_date_hour ON user_analytics(date_hour);
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_date ON user_analytics(user_id, date_hour);

-- RLS Policies
ALTER TABLE user_analytics ENABLE ROW LEVEL SECURITY;

-- Users can only see their own analytics
CREATE POLICY "Users can view own analytics" ON user_analytics
  FOR SELECT USING (auth.uid() = user_id);

-- SuperAdmin can see all analytics
CREATE POLICY "SuperAdmin can view all analytics" ON user_analytics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_sessions 
      WHERE user_id = auth.uid() 
      AND username = 'superadmin'
    )
  );

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_user_analytics_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_analytics_updated_at_trigger
  BEFORE UPDATE ON user_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_user_analytics_updated_at();
