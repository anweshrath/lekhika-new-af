-- ALCHEMIST NODE PALETTE TABLE
-- Mirrors the main Flow system's node palette structure
-- Stores available node types for Alchemist flows

CREATE TABLE IF NOT EXISTS alchemist_node_palette (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  node_type VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  icon VARCHAR(100),
  color VARCHAR(50),
  inputs JSONB DEFAULT '[]'::jsonb,
  features JSONB DEFAULT '[]'::jsonb,
  system_prompt TEXT,
  user_prompt TEXT,
  estimated_tokens INTEGER DEFAULT 1000,
  recommended_services JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_alchemist_node_palette_category ON alchemist_node_palette(category);
CREATE INDEX IF NOT EXISTS idx_alchemist_node_palette_active ON alchemist_node_palette(is_active);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_alchemist_node_palette_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_alchemist_node_palette_updated_at
  BEFORE UPDATE ON alchemist_node_palette
  FOR EACH ROW
  EXECUTE FUNCTION update_alchemist_node_palette_updated_at();

-- Add RLS policies
ALTER TABLE alchemist_node_palette ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated users to read alchemist node palette" ON alchemist_node_palette
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert alchemist node palette" ON alchemist_node_palette
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update alchemist node palette" ON alchemist_node_palette
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete alchemist node palette" ON alchemist_node_palette
  FOR DELETE USING (auth.role() = 'authenticated');

-- Insert Alchemist node types
INSERT INTO alchemist_node_palette (node_type, name, description, category, icon, color, inputs, features, system_prompt, user_prompt, estimated_tokens, recommended_services) VALUES
-- MASTER NODES
(
  'input',
  'Input Node',
  'Collect and configure input data for content creation',
  'master',
  'FileText',
  'blue',
  '["topic", "target_audience", "tone", "style", "requirements"]'::jsonb,
  '["Custom Fields", "Validation", "Required/Optional Toggle"]'::jsonb,
  'You are a data collection specialist for content creation workflows.',
  'Collect the following input data: {inputs}',
  500,
  '["openai", "claude"]'::jsonb
),
(
  'output',
  'Output Node',
  'Final delivery and export of generated content',
  'master',
  'Download',
  'gray',
  '["format", "delivery_method", "scheduling"]'::jsonb,
  '["Multiple Formats", "Direct Publishing", "Download Options"]'::jsonb,
  'You are a content delivery specialist.',
  'Prepare content for delivery in format: {format}',
  300,
  '["openai"]'::jsonb
),

-- PROCESSING NODES
(
  'factCheck',
  'Fact Check Node',
  'Research and verify information before content creation',
  'processing',
  'CheckCircle',
  'green',
  '["sources", "verification_level", "fact_checking_tools"]'::jsonb,
  '["Source Verification", "Fact Validation", "Research Integration"]'::jsonb,
  'You are a fact-checking specialist. Verify all information for accuracy and credibility.',
  'Fact-check the following information: {content}. Use sources: {sources}',
  2000,
  '["openai", "claude", "gemini"]'::jsonb
),
(
  'contentWriter',
  'Content Writer Node',
  'AI-powered content generation with customizable styles',
  'processing',
  'PenTool',
  'purple',
  '["content_type", "style", "accent", "series_info", "post_count"]'::jsonb,
  '["Multiple Styles", "Accent Support", "Series Management", "Bulk Generation"]'::jsonb,
  'You are a professional content writer specializing in {style} writing with {accent} accent. Create engaging, valuable content that resonates with your target audience.',
  'Create {content_type} content about {topic} targeting {target_audience}. Style: {style}, Accent: {accent}, Post Count: {post_count}, Series: {series_info}',
  3000,
  '["openai", "claude", "gemini"]'::jsonb
),
(
  'seoOptimizer',
  'SEO Optimizer Node',
  'Optimize content for search engines and discoverability',
  'processing',
  'Search',
  'cyan',
  '["keywords", "meta_description", "tags", "optimization_level"]'::jsonb,
  '["Keyword Integration", "Meta Optimization", "SEO Scoring"]'::jsonb,
  'You are an SEO specialist. Optimize content for search engines while maintaining readability and value.',
  'Optimize the following content for SEO: {content}. Keywords: {keywords}, Optimization Level: {optimization_level}',
  1500,
  '["openai", "claude"]'::jsonb
),

-- ENHANCEMENT NODES
(
  'imageGenerator',
  'Image Generator Node',
  'Create and optimize visual content for posts',
  'enhancement',
  'Image',
  'pink',
  '["image_style", "dimensions", "brand_colors", "image_count"]'::jsonb,
  '["AI Image Generation", "Brand Consistency", "Multiple Formats"]'::jsonb,
  'You are a visual content specialist. Create compelling images that enhance the content.',
  'Generate {image_count} images for the content. Style: {image_style}, Dimensions: {dimensions}, Brand Colors: {brand_colors}',
  1000,
  '["dalle", "midjourney", "stable_diffusion"]'::jsonb
),
(
  'scheduler',
  'Scheduler Node',
  'Schedule and publish content to WordPress, Joomla, and other platforms',
  'enhancement',
  'Calendar',
  'orange',
  '["platform", "publishing_schedule", "auto_publish", "platform_credentials"]'::jsonb,
  '["WordPress Integration", "Joomla Support", "Auto Publishing", "Scheduling"]'::jsonb,
  'You are a content publishing specialist. Handle scheduling and publishing to various platforms.',
  'Schedule content for publishing on {platform}. Schedule: {publishing_schedule}, Auto Publish: {auto_publish}',
  800,
  '["openai"]'::jsonb
);

-- Add comments
COMMENT ON TABLE alchemist_node_palette IS 'Available node types for Alchemist content creation workflows';
COMMENT ON COLUMN alchemist_node_palette.inputs IS 'JSON array of input field names';
COMMENT ON COLUMN alchemist_node_palette.features IS 'JSON array of node features';
COMMENT ON COLUMN alchemist_node_palette.recommended_services IS 'JSON array of recommended AI services';
