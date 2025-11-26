-- USER ALCHEMIST CONTENT TABLE
-- Stores user-generated content from Alchemist Lab
-- Multi-tenant isolation via RLS policies

CREATE TABLE IF NOT EXISTS user_alchemist_content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  flow_id UUID REFERENCES alchemist_flows(id) ON DELETE SET NULL,
  flow_name VARCHAR(255) NOT NULL,
  flow_category VARCHAR(100),
  input_data JSONB NOT NULL,
  generated_content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  word_count INTEGER,
  character_count INTEGER,
  tokens_used INTEGER,
  cost_usd DECIMAL(10, 6),
  provider_used VARCHAR(100),
  model_used VARCHAR(255),
  generation_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_alchemist_content_user_id ON user_alchemist_content(user_id);
CREATE INDEX IF NOT EXISTS idx_user_alchemist_content_flow_id ON user_alchemist_content(flow_id);
CREATE INDEX IF NOT EXISTS idx_user_alchemist_content_category ON user_alchemist_content(flow_category);
CREATE INDEX IF NOT EXISTS idx_user_alchemist_content_created_at ON user_alchemist_content(created_at DESC);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_user_alchemist_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_alchemist_content_updated_at
  BEFORE UPDATE ON user_alchemist_content
  FOR EACH ROW
  EXECUTE FUNCTION update_user_alchemist_content_updated_at();

-- Enable RLS (Row Level Security) for multi-tenant isolation
ALTER TABLE user_alchemist_content ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only read their own content
CREATE POLICY "Users can read own alchemist content" ON user_alchemist_content
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can only insert their own content
CREATE POLICY "Users can insert own alchemist content" ON user_alchemist_content
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only update their own content
CREATE POLICY "Users can update own alchemist content" ON user_alchemist_content
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can only delete their own content
CREATE POLICY "Users can delete own alchemist content" ON user_alchemist_content
  FOR DELETE USING (auth.uid() = user_id);

-- Add comments for documentation
COMMENT ON TABLE user_alchemist_content IS 'Stores user-generated content from Alchemist Lab with multi-tenant isolation';
COMMENT ON COLUMN user_alchemist_content.input_data IS 'JSON object containing user input values for the flow';
COMMENT ON COLUMN user_alchemist_content.metadata IS 'Additional metadata like framework used, template info, etc.';

