-- Create prompt_templates table for The Alchemist's Stash
CREATE TABLE IF NOT EXISTS prompt_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL, -- 'outline', 'manuscript', 'visual', 'editing', 'research', etc.
  node_type VARCHAR(50) NOT NULL, -- 'input', 'process', 'output', 'condition'
  system_prompt TEXT NOT NULL,
  user_prompt TEXT NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb, -- Array of variable names used in prompts
  tags TEXT[] DEFAULT '{}', -- Searchable tags
  is_active BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT false, -- Public templates vs private ones
  created_by UUID REFERENCES superadmin_users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  version INTEGER DEFAULT 1,
  usage_count INTEGER DEFAULT 0 -- Track how often template is used
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_prompt_templates_category ON prompt_templates(category);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_node_type ON prompt_templates(node_type);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_created_by ON prompt_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_is_active ON prompt_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_is_public ON prompt_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_prompt_templates_tags ON prompt_templates USING GIN(tags);

-- Enable RLS
ALTER TABLE prompt_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "SuperAdmin can manage all prompt templates" ON prompt_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM superadmin_users 
      WHERE superadmin_users.id = auth.uid() 
      AND superadmin_users.is_active = true
    )
  );

CREATE POLICY "Users can view public prompt templates" ON prompt_templates
  FOR SELECT USING (is_public = true AND is_active = true);

CREATE POLICY "Users can view their own prompt templates" ON prompt_templates
  FOR SELECT USING (created_by = auth.uid());

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_prompt_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_prompt_templates_updated_at
  BEFORE UPDATE ON prompt_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_prompt_templates_updated_at();

-- Insert some default prompt templates
INSERT INTO prompt_templates (name, description, category, node_type, system_prompt, user_prompt, variables, tags, is_public) VALUES
(
  'Professional Outline Generator',
  'Generates comprehensive chapter outlines for professional books',
  'outline',
  'process',
  'You are an expert outline generation specialist for {topic} content targeting {target_audience}. Create logical, reader-friendly chapter outlines that follow proven genre-specific structures. Focus on maximum reader engagement and practical value delivery.',
  'Generate a logical, reader-friendly chapter outline for a {word_count}-word eBook on ''{book_title}'' in {tone} tone, for {target_audience}, with {chapter_count} chapters.

OUTLINE SPECIFICATIONS:
- Topic Focus: {topic}
- Target Audience: {target_audience} level
- Writing Style: {tone} tone with {accent} accent
- Word Distribution: {word_count} total words across {chapter_count} chapters
- Image Integration: {include_images ? ''Include strategic image placement suggestions'' : ''Text-only content''}

STRUCTURAL REQUIREMENTS:
- Apply genre-specific framework for {topic}
- Create logical flow from introduction to conclusion
- Ensure each chapter builds on previous content
- Include practical examples and case studies
- Optimize for reader engagement and retention',
  '["topic", "target_audience", "word_count", "book_title", "tone", "accent", "chapter_count", "include_images"]'::jsonb,
  ARRAY['outline', 'professional', 'book', 'structure'],
  true
),
(
  'Manuscript Writer',
  'Creates complete, publication-ready manuscripts',
  'manuscript',
  'process',
  'You are an expert manuscript writer specializing in {topic} for {target_audience}. Generate complete, publication-ready chapters with perfect coherence and professional quality. Maintain consistent {tone} tone with {accent} accent throughout. Focus on practical value and reader engagement.',
  'Create a complete manuscript for "{book_title}" using the generated outline.

MANUSCRIPT SPECIFICATIONS:
- Content Focus: {topic} with practical application
- Target Audience: {target_audience} requiring actionable insights
- Writing Style: {tone} tone with {accent} accent
- Word Count: {word_count} total words across {chapter_count} chapters
- Brand Guidelines: {branding_style} approach

CONTENT REQUIREMENTS:
- Create engaging, well-structured chapters
- Include real-world examples and case studies
- Ensure professional publishing standards
- Optimize for reader value and retention
- Maintain consistent voice and style throughout',
  '["topic", "target_audience", "book_title", "tone", "accent", "word_count", "chapter_count", "branding_style"]'::jsonb,
  ARRAY['manuscript', 'writing', 'book', 'content'],
  true
),
(
  'Visual Content Creator',
  'Generates professional visual content and cover designs',
  'visual',
  'process',
  'You are a professional visual content specialist for {topic} publications targeting {industry_focus} professionals. Create sophisticated visual content that enhances authority and comprehension. Maintain {branding_style} visual standards throughout.',
  'Generate professional visual content for "{book_title}" targeting {target_audience} in {industry_focus}.

COVER IMAGE HANDLING STRATEGY:
- Cover Option: {cover_image_option}
- Cover Style: {cover_image_style || ''Professional''}
- Uploaded Cover: {cover_image_upload ? ''Process uploaded cover image'' : ''No uploaded cover''}

VISUAL CONTENT SPECIFICATIONS:
- Industry Context: {industry_focus} professional standards
- Brand Guidelines: {branding_style} visual approach
- Professional Audience: {target_audience} requiring authoritative content
- Visual Strategy: {include_images ? ''Include strategic visual content plan'' : ''Text-focused approach''}',
  '["topic", "industry_focus", "book_title", "target_audience", "branding_style", "cover_image_option", "cover_image_style", "cover_image_upload", "include_images"]'::jsonb,
  ARRAY['visual', 'design', 'cover', 'images'],
  true
);
