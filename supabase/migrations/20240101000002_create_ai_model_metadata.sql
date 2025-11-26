-- Create AI Model Metadata Table
CREATE TABLE ai_model_metadata (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    provider TEXT NOT NULL,
    model_name TEXT NOT NULL,
    model_id TEXT NOT NULL,
    
    -- Cost Metrics
    input_cost_per_million NUMERIC(10, 6) DEFAULT 0,
    output_cost_per_million NUMERIC(10, 6) DEFAULT 0,
    
    -- Model Capabilities
    context_window_tokens INTEGER,
    specialties TEXT[] DEFAULT '{}',
    tokens_per_page INTEGER DEFAULT 500,
    pages_per_million_tokens NUMERIC(10, 2) GENERATED ALWAYS AS (1000000.0 / tokens_per_page) STORED,
    
    -- Metadata and Status
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    last_updated TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB,
    
    -- User Association (optional)
    user_id UUID REFERENCES auth.users(id),
    
    -- Unique Constraint
    UNIQUE(provider, model_id)
);

-- Enable Row Level Security
ALTER TABLE ai_model_metadata ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can manage model metadata
CREATE POLICY "Admins can manage model metadata" 
ON ai_model_metadata 
FOR ALL 
USING (
    auth.uid() IN (
        SELECT user_id 
        FROM auth.users 
        WHERE role = 'superadmin'
    )
);

-- Policy: Users can view active models
CREATE POLICY "Users can view active models" 
ON ai_model_metadata 
FOR SELECT 
USING (is_active = true);

-- Indexes for performance
CREATE INDEX idx_ai_model_metadata_provider ON ai_model_metadata(provider);
CREATE INDEX idx_ai_model_metadata_is_active ON ai_model_metadata(is_active);
CREATE INDEX idx_ai_model_metadata_user_id ON ai_model_metadata(user_id);
