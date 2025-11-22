-- ALCHEMIST FLOWS TABLE
-- Mirrors the structure of ai_flows but for content creation workflows
-- This table stores Alchemist-specific flows with content creation focus

CREATE TABLE IF NOT EXISTS alchemist_flows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) DEFAULT 'alchemist',
  type VARCHAR(100) DEFAULT 'alchemist',
  suite VARCHAR(100) DEFAULT 'Content Creation',
  priority INTEGER DEFAULT 1,
  nodes JSONB DEFAULT '[]'::jsonb,
  edges JSONB DEFAULT '[]'::jsonb,
  framework VARCHAR(100),
  custom_framework TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_alchemist_flows_category ON alchemist_flows(category);
CREATE INDEX IF NOT EXISTS idx_alchemist_flows_suite ON alchemist_flows(suite);
CREATE INDEX IF NOT EXISTS idx_alchemist_flows_created_at ON alchemist_flows(created_at);
CREATE INDEX IF NOT EXISTS idx_alchemist_flows_name ON alchemist_flows(name);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_alchemist_flows_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_alchemist_flows_updated_at
  BEFORE UPDATE ON alchemist_flows
  FOR EACH ROW
  EXECUTE FUNCTION update_alchemist_flows_updated_at();

-- Add RLS (Row Level Security) policies
ALTER TABLE alchemist_flows ENABLE ROW LEVEL SECURITY;

-- Policy for authenticated users to read all flows
CREATE POLICY "Allow authenticated users to read alchemist flows" ON alchemist_flows
  FOR SELECT USING (auth.role() = 'authenticated');

-- Policy for authenticated users to insert flows
CREATE POLICY "Allow authenticated users to insert alchemist flows" ON alchemist_flows
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy for authenticated users to update flows
CREATE POLICY "Allow authenticated users to update alchemist flows" ON alchemist_flows
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Policy for authenticated users to delete flows
CREATE POLICY "Allow authenticated users to delete alchemist flows" ON alchemist_flows
  FOR DELETE USING (auth.role() = 'authenticated');

-- Insert some sample Alchemist flows
INSERT INTO alchemist_flows (name, description, category, suite, priority, nodes, edges, framework) VALUES
(
  'Blog Post Generator',
  'Create engaging, SEO-optimized blog posts that drive traffic and conversions',
  'content',
  'Content Creation',
  1,
  '[
    {
      "id": "input-node",
      "type": "input",
      "position": {"x": 100, "y": 100},
      "data": {
        "label": "Blog Input Configuration",
        "inputFields": [
          {"name": "topic", "label": "Topic", "type": "text", "required": true},
          {"name": "target_audience", "label": "Target Audience", "type": "select", "required": true},
          {"name": "tone", "label": "Tone", "type": "select", "required": true},
          {"name": "keywords", "label": "Keywords", "type": "text", "required": false},
          {"name": "word_count", "label": "Word Count", "type": "number", "required": true}
        ]
      }
    },
    {
      "id": "blog-post-node",
      "type": "blogPost",
      "position": {"x": 400, "y": 100},
      "data": {
        "label": "Blog Post Generator",
        "framework": "Inverted Pyramid",
        "systemPrompt": "You are a professional content writer specializing in creating engaging, SEO-optimized blog posts.",
        "userPrompt": "Create a comprehensive blog post about {topic} targeting {target_audience} with a {tone} tone."
      }
    },
    {
      "id": "output-node",
      "type": "output",
      "position": {"x": 700, "y": 100},
      "data": {
        "label": "Generated Blog Post",
        "outputFormat": "markdown"
      }
    }
  ]'::jsonb,
  '[
    {"id": "e1-2", "source": "input-node", "target": "blog-post-node"},
    {"id": "e2-3", "source": "blog-post-node", "target": "output-node"}
  ]'::jsonb,
  'Inverted Pyramid'
),
(
  'Sales Page Generator',
  'Write high-converting sales pages that persuade and sell',
  'sales',
  'Sales',
  1,
  '[
    {
      "id": "input-node",
      "type": "input",
      "position": {"x": 100, "y": 100},
      "data": {
        "label": "Sales Input Configuration",
        "inputFields": [
          {"name": "product", "label": "Product/Service", "type": "text", "required": true},
          {"name": "benefits", "label": "Key Benefits", "type": "textarea", "required": true},
          {"name": "target_market", "label": "Target Market", "type": "text", "required": true},
          {"name": "price_point", "label": "Price Point", "type": "text", "required": true},
          {"name": "urgency", "label": "Urgency Element", "type": "select", "required": false}
        ]
      }
    },
    {
      "id": "sales-page-node",
      "type": "salesPage",
      "position": {"x": 400, "y": 100},
      "data": {
        "label": "Sales Page Generator",
        "framework": "AIDA",
        "systemPrompt": "You are a world-class copywriter specializing in high-converting sales pages.",
        "userPrompt": "Create high-converting sales page copy for {product} targeting {target_market}."
      }
    },
    {
      "id": "output-node",
      "type": "output",
      "position": {"x": 700, "y": 100},
      "data": {
        "label": "Generated Sales Page",
        "outputFormat": "html"
      }
    }
  ]'::jsonb,
  '[
    {"id": "e1-2", "source": "input-node", "target": "sales-page-node"},
    {"id": "e2-3", "source": "sales-page-node", "target": "output-node"}
  ]'::jsonb,
  'AIDA'
);

-- Add comments for documentation
COMMENT ON TABLE alchemist_flows IS 'Stores Alchemist-specific content creation workflows';
COMMENT ON COLUMN alchemist_flows.nodes IS 'JSON array of flow nodes with their configurations';
COMMENT ON COLUMN alchemist_flows.edges IS 'JSON array of connections between nodes';
COMMENT ON COLUMN alchemist_flows.framework IS 'Content creation framework used (e.g., AIDA, PASTOR, etc.)';
COMMENT ON COLUMN alchemist_flows.custom_framework IS 'Custom framework description when framework is "other"';
