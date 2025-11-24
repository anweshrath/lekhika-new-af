-- Migration: Restructure level_access table
-- This migration restructures the level_access table to have one row per level
-- with features as columns, and links to the levels table via level_id

-- Step 1: Create backup of existing level_access data
CREATE TABLE IF NOT EXISTS level_access_backup AS 
SELECT * FROM level_access;

-- Step 2: Drop the old level_access table
DROP TABLE IF EXISTS level_access CASCADE;

-- Step 3: Create new level_access table structure with ALL 52+ features
CREATE TABLE level_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level_id UUID REFERENCES levels(id) ON DELETE CASCADE,
    level_name TEXT NOT NULL,
    -- Content Type Features
    ebook_creation BOOLEAN DEFAULT false,
    report_creation BOOLEAN DEFAULT false,
    guide_creation BOOLEAN DEFAULT false,
    manual_creation BOOLEAN DEFAULT false,
    fiction_creation BOOLEAN DEFAULT false,
    autobiography_creation BOOLEAN DEFAULT false,
    whitepaper_creation BOOLEAN DEFAULT false,
    blog_post_creation BOOLEAN DEFAULT false,
    email_sequence_creation BOOLEAN DEFAULT false,
    social_media_creation BOOLEAN DEFAULT false,
    -- AI Model Features
    gpt4_access BOOLEAN DEFAULT false,
    claude_access BOOLEAN DEFAULT false,
    gemini_access BOOLEAN DEFAULT false,
    custom_model_access BOOLEAN DEFAULT false,
    -- Export Format Features
    pdf_export BOOLEAN DEFAULT false,
    epub_export BOOLEAN DEFAULT false,
    docx_export BOOLEAN DEFAULT false,
    html_export BOOLEAN DEFAULT false,
    markdown_export BOOLEAN DEFAULT false,
    txt_export BOOLEAN DEFAULT false,
    -- Workflow Features
    custom_workflow_creation BOOLEAN DEFAULT false,
    workflow_sharing BOOLEAN DEFAULT false,
    workflow_templates BOOLEAN DEFAULT false,
    multi_chapter_books BOOLEAN DEFAULT false,
    single_chapter_books BOOLEAN DEFAULT false,
    -- Content Features
    image_generation BOOLEAN DEFAULT false,
    cover_design BOOLEAN DEFAULT false,
    table_of_contents BOOLEAN DEFAULT false,
    chapter_outlines BOOLEAN DEFAULT false,
    bibliography_generation BOOLEAN DEFAULT false,
    index_generation BOOLEAN DEFAULT false,
    -- Branding Features
    company_watermark BOOLEAN DEFAULT false,
    custom_branding BOOLEAN DEFAULT false,
    white_label BOOLEAN DEFAULT false,
    custom_domain BOOLEAN DEFAULT false,
    -- Analytics Features
    usage_analytics BOOLEAN DEFAULT false,
    token_tracking BOOLEAN DEFAULT false,
    cost_tracking BOOLEAN DEFAULT false,
    performance_metrics BOOLEAN DEFAULT false,
    user_behavior_analytics BOOLEAN DEFAULT false,
    -- Collaboration Features
    team_collaboration BOOLEAN DEFAULT false,
    user_management BOOLEAN DEFAULT false,
    role_based_access BOOLEAN DEFAULT false,
    comment_system BOOLEAN DEFAULT false,
    -- Integration Features
    api_access BOOLEAN DEFAULT false,
    webhook_support BOOLEAN DEFAULT false,
    third_party_integration BOOLEAN DEFAULT false,
    custom_integrations BOOLEAN DEFAULT false,
    -- System Fields
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- Constraints
    UNIQUE(level_id),
    UNIQUE(level_name)
);

-- Step 4: Insert missing levels into levels table first
INSERT INTO levels (name, display_name, description, tier_level, credits_monthly, credits_total, monthly_limit, is_active, is_featured)
VALUES 
    ('freemium', 'Freemium', 'Free tier with basic features to get started', 0, 50, 500, 50, true, false),
    ('macdaddy', 'MacDaddy', 'The Ultimate Membership to Access All That Lekhika Has To Offer', 4, 5000, 50000, 5000, true, true),
    ('byok', 'BYOK', 'Bring Your Own Key - Enterprise Level', 5, 10000, 100000, 10000, true, true)
ON CONFLICT (name) DO NOTHING;

-- Step 5: Insert data for 5 levels (freemium, hobby, pro, macdaddy, byok) with proper level_id references
-- Freemium level (tier 0) - Minimal features
INSERT INTO level_access (
    level_id, level_name, 
    -- Content Type Features - Only basic content
    blog_post_creation, social_media_creation,
    -- AI Model Features - Only free models
    gemini_access,
    -- Export Format Features - Only basic formats
    html_export, txt_export,
    -- Workflow Features - Only templates
    workflow_templates, single_chapter_books,
    -- Content Features - Only basic content
    table_of_contents, chapter_outlines,
    -- Analytics Features - Only basic tracking
    token_tracking
) 
SELECT l.id, 'freemium', 
    true, true,
    true,
    true, true,
    true, true,
    true, true,
    true
FROM levels l WHERE l.name = 'freemium';
-- Hobby level (tier 1)
INSERT INTO level_access (
    level_id, level_name, 
    -- Content Type Features
    ebook_creation, guide_creation, blog_post_creation, social_media_creation,
    -- AI Model Features  
    gemini_access,
    -- Export Format Features
    pdf_export, html_export, markdown_export, txt_export,
    -- Workflow Features
    workflow_templates, single_chapter_books,
    -- Content Features
    table_of_contents, chapter_outlines,
    -- Analytics Features
    token_tracking
) 
SELECT l.id, 'hobby', 
    true, true, true, true,
    true,
    true, true, true, true,
    true, true,
    true, true,
    true
FROM levels l WHERE l.name = 'hobby';

-- Pro level (tier 2)
INSERT INTO level_access (
    level_id, level_name,
    ebook_creation, report_creation, guide_creation, manual_creation,
    fiction_creation, autobiography_creation, blog_post_creation, 
    email_sequence_creation, social_media_creation,
    gpt4_access, claude_access, gemini_access,
    pdf_export, epub_export, docx_export, html_export, markdown_export, txt_export,
    workflow_templates, multi_chapter_books, single_chapter_books,
    image_generation, cover_design, table_of_contents, chapter_outlines, bibliography_generation,
    usage_analytics, token_tracking, cost_tracking,
    team_collaboration, user_management, role_based_access, comment_system,
    api_access, webhook_support
) 
SELECT l.id, 'pro',
    true, true, true, true, true, true, true, true, true,
    true, true, true,
    true, true, true, true, true, true,
    true, true, true,
    true, true, true, true, true,
    true, true, true,
    true, true, true, true,
    true, true
FROM levels l WHERE l.name = 'pro';

-- MacDaddy level (tier 3)
INSERT INTO level_access (
    level_id, level_name,
    ebook_creation, report_creation, guide_creation, manual_creation,
    fiction_creation, autobiography_creation, whitepaper_creation, blog_post_creation,
    email_sequence_creation, social_media_creation,
    gpt4_access, claude_access, gemini_access, custom_model_access,
    pdf_export, epub_export, docx_export, html_export, markdown_export, txt_export,
    custom_workflow_creation, workflow_sharing, workflow_templates, 
    multi_chapter_books, single_chapter_books,
    image_generation, cover_design, table_of_contents, chapter_outlines, 
    bibliography_generation, index_generation,
    company_watermark, custom_branding,
    usage_analytics, token_tracking, cost_tracking, performance_metrics,
    team_collaboration, user_management, role_based_access, comment_system,
    api_access, webhook_support
) 
SELECT l.id, 'macdaddy',
    true, true, true, true, true, true, true, true, true,
    true, true, true, true,
    true, true, true, true, true, true,
    true, true, true, true, true,
    true, true, true, true, true, true,
    true, true,
    true, true, true, true,
    true, true, true, true,
    true, true, true
FROM levels l WHERE l.name = 'macdaddy';

-- BYOK level (tier 4) - Bring Your Own Key
INSERT INTO level_access (
    level_id, level_name,
    -- Content Type Features
    ebook_creation, report_creation, guide_creation, manual_creation,
    fiction_creation, autobiography_creation, whitepaper_creation, blog_post_creation,
    email_sequence_creation, social_media_creation,
    -- AI Model Features
    gpt4_access, claude_access, gemini_access, custom_model_access,
    -- Export Format Features
    pdf_export, epub_export, docx_export, html_export, markdown_export, txt_export,
    -- Workflow Features
    custom_workflow_creation, workflow_sharing, workflow_templates,
    multi_chapter_books, single_chapter_books,
    -- Content Features
    image_generation, cover_design, table_of_contents, chapter_outlines,
    bibliography_generation, index_generation,
    -- Branding Features
    company_watermark, custom_branding, white_label, custom_domain,
    -- Analytics Features
    usage_analytics, token_tracking, cost_tracking, performance_metrics, user_behavior_analytics,
    -- Collaboration Features
    team_collaboration, user_management, role_based_access, comment_system,
    -- Integration Features
    api_access, webhook_support, third_party_integration, custom_integrations
) 
SELECT l.id, 'byok',
    true, true, true, true, true, true, true, true, true,
    true, true, true, true,
    true, true, true, true, true, true,
    true, true, true, true, true,
    true, true, true, true, true, true,
    true, true, true, true,
    true, true, true, true, true,
    true, true, true, true,
    true, true, true, true, true
FROM levels l WHERE l.name = 'byok';

-- Step 5: Create indexes
CREATE INDEX idx_level_access_level_id ON level_access(level_id);
CREATE INDEX idx_level_access_level_name ON level_access(level_name);
CREATE INDEX idx_level_access_is_active ON level_access(is_active);

-- Step 6: Enable RLS
ALTER TABLE level_access ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS policies
CREATE POLICY "SuperAdmin can do everything on level_access" ON level_access
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM superadmin_users 
            WHERE id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Public can read level_access" ON level_access
    FOR SELECT USING (true);

-- Step 8: Create updated_at trigger
CREATE OR REPLACE FUNCTION update_level_access_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_level_access_updated_at
    BEFORE UPDATE ON level_access
    FOR EACH ROW
    EXECUTE FUNCTION update_level_access_updated_at();

-- Step 9: Add comments
COMMENT ON TABLE level_access IS 'Level access permissions with features as columns - 4 levels: hobby, pro, macdaddy, byok';
COMMENT ON COLUMN level_access.level_id IS 'Foreign key to levels table';
COMMENT ON COLUMN level_access.level_name IS 'Level name for reference';
COMMENT ON COLUMN level_access.ebook_creation IS 'Access to eBook creation feature';
COMMENT ON COLUMN level_access.report_creation IS 'Access to report creation feature';
COMMENT ON COLUMN level_access.guide_creation IS 'Access to guide creation feature';
COMMENT ON COLUMN level_access.manual_creation IS 'Access to manual creation feature';
COMMENT ON COLUMN level_access.fiction_creation IS 'Access to fiction creation feature';
COMMENT ON COLUMN level_access.autobiography_creation IS 'Access to autobiography creation feature';
COMMENT ON COLUMN level_access.whitepaper_creation IS 'Access to whitepaper creation feature';
COMMENT ON COLUMN level_access.blog_post_creation IS 'Access to blog post creation feature';
COMMENT ON COLUMN level_access.email_sequence_creation IS 'Access to email sequence creation feature';
COMMENT ON COLUMN level_access.social_media_creation IS 'Access to social media creation feature';
COMMENT ON COLUMN level_access.gpt4_access IS 'Access to GPT-4 models';
COMMENT ON COLUMN level_access.claude_access IS 'Access to Claude models';
COMMENT ON COLUMN level_access.gemini_access IS 'Access to Gemini models';
COMMENT ON COLUMN level_access.custom_model_access IS 'Access to custom models';
COMMENT ON COLUMN level_access.pdf_export IS 'Access to PDF export';
COMMENT ON COLUMN level_access.epub_export IS 'Access to EPUB export';
COMMENT ON COLUMN level_access.docx_export IS 'Access to DOCX export';
COMMENT ON COLUMN level_access.html_export IS 'Access to HTML export';
COMMENT ON COLUMN level_access.markdown_export IS 'Access to Markdown export';
COMMENT ON COLUMN level_access.txt_export IS 'Access to TXT export';
COMMENT ON COLUMN level_access.custom_workflow_creation IS 'Access to custom workflow creation';
COMMENT ON COLUMN level_access.workflow_sharing IS 'Access to workflow sharing';
COMMENT ON COLUMN level_access.workflow_templates IS 'Access to workflow templates';
COMMENT ON COLUMN level_access.multi_chapter_books IS 'Access to multi-chapter books';
COMMENT ON COLUMN level_access.single_chapter_books IS 'Access to single chapter books';
COMMENT ON COLUMN level_access.image_generation IS 'Access to image generation';
COMMENT ON COLUMN level_access.cover_design IS 'Access to cover design';
COMMENT ON COLUMN level_access.table_of_contents IS 'Access to table of contents generation';
COMMENT ON COLUMN level_access.chapter_outlines IS 'Access to chapter outlines generation';
COMMENT ON COLUMN level_access.bibliography_generation IS 'Access to bibliography generation';
COMMENT ON COLUMN level_access.index_generation IS 'Access to index generation';
COMMENT ON COLUMN level_access.company_watermark IS 'Access to company watermark';
COMMENT ON COLUMN level_access.custom_branding IS 'Access to custom branding';
COMMENT ON COLUMN level_access.white_label IS 'Access to white label solution';
COMMENT ON COLUMN level_access.custom_domain IS 'Access to custom domain';
COMMENT ON COLUMN level_access.usage_analytics IS 'Access to usage analytics';
COMMENT ON COLUMN level_access.token_tracking IS 'Access to token tracking';
COMMENT ON COLUMN level_access.cost_tracking IS 'Access to cost tracking';
COMMENT ON COLUMN level_access.performance_metrics IS 'Access to performance metrics';
COMMENT ON COLUMN level_access.user_behavior_analytics IS 'Access to user behavior analytics';
COMMENT ON COLUMN level_access.team_collaboration IS 'Access to team collaboration';
COMMENT ON COLUMN level_access.user_management IS 'Access to user management';
COMMENT ON COLUMN level_access.role_based_access IS 'Access to role-based access control';
COMMENT ON COLUMN level_access.comment_system IS 'Access to comment system';
COMMENT ON COLUMN level_access.api_access IS 'Access to API';
COMMENT ON COLUMN level_access.webhook_support IS 'Access to webhook support';
COMMENT ON COLUMN level_access.third_party_integration IS 'Access to third-party integrations';
COMMENT ON COLUMN level_access.custom_integrations IS 'Access to custom integrations';