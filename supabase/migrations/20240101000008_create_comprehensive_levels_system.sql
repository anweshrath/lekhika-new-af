-- Create comprehensive levels system
-- This migration creates a powerful, enterprise-grade user level management system

-- 1. Create the main levels table
CREATE TABLE IF NOT EXISTS levels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(255) NOT NULL,
    description TEXT,
    tier_level INTEGER NOT NULL UNIQUE, -- 1, 2, 3, 4 for ordering
    credits_monthly INTEGER NOT NULL DEFAULT 0,
    credits_total INTEGER NOT NULL DEFAULT 0,
    monthly_limit INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create level features table for granular feature control
CREATE TABLE IF NOT EXISTS level_features (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    level_id UUID NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
    feature_name VARCHAR(255) NOT NULL,
    feature_category VARCHAR(255) NOT NULL, -- 'copyai', 'workflow', 'analytics', 'export', etc.
    is_enabled BOOLEAN DEFAULT true,
    usage_limit INTEGER, -- NULL means unlimited
    usage_period VARCHAR(50), -- 'daily', 'weekly', 'monthly', 'yearly'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(level_id, feature_name)
);

-- 3. Create level pricing table
CREATE TABLE IF NOT EXISTS level_pricing (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    level_id UUID NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
    pricing_type VARCHAR(50) NOT NULL, -- 'one_time', 'monthly', 'yearly', 'lifetime'
    price DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    billing_cycle VARCHAR(50), -- 'monthly', 'quarterly', 'yearly', 'lifetime'
    is_recurring BOOLEAN DEFAULT false,
    trial_days INTEGER DEFAULT 0,
    trial_credits INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create level workflow assignments table
CREATE TABLE IF NOT EXISTS level_workflow_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    level_id UUID NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
    workflow_id UUID NOT NULL REFERENCES ai_workflows(id) ON DELETE CASCADE,
    assignment_type VARCHAR(50) DEFAULT 'included', -- 'included', 'premium', 'addon'
    usage_limit INTEGER, -- NULL means unlimited
    priority INTEGER DEFAULT 1, -- For workflow execution order
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(level_id, workflow_id)
);

-- 5. Create level analytics table for tracking usage and performance
CREATE TABLE IF NOT EXISTS level_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    level_id UUID NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
    metric_name VARCHAR(255) NOT NULL,
    metric_value DECIMAL(15,4) NOT NULL,
    metric_unit VARCHAR(50), -- 'credits', 'requests', 'percentage', 'currency'
    period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    user_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create level restrictions table for advanced control
CREATE TABLE IF NOT EXISTS level_restrictions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    level_id UUID NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
    restriction_type VARCHAR(100) NOT NULL, -- 'max_book_length', 'export_formats', 'ai_models', etc.
    restriction_value TEXT NOT NULL, -- JSON or text value
    restriction_description TEXT,
    is_enforced BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create level benefits table for marketing features
CREATE TABLE IF NOT EXISTS level_benefits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    level_id UUID NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
    benefit_title VARCHAR(255) NOT NULL,
    benefit_description TEXT,
    benefit_icon VARCHAR(100), -- Icon name or class
    benefit_order INTEGER DEFAULT 0,
    is_highlighted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Create level upgrade paths table
CREATE TABLE IF NOT EXISTS level_upgrade_paths (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    from_level_id UUID NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
    to_level_id UUID NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
    upgrade_type VARCHAR(50) DEFAULT 'standard', -- 'standard', 'promotional', 'enterprise'
    discount_percentage DECIMAL(5,2) DEFAULT 0,
    upgrade_message TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(from_level_id, to_level_id)
);

-- 9. Create level feature usage tracking table
CREATE TABLE IF NOT EXISTS level_feature_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    level_id UUID NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    feature_name VARCHAR(255) NOT NULL,
    usage_count INTEGER DEFAULT 1,
    usage_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Create level comparison table for marketing
CREATE TABLE IF NOT EXISTS level_comparison (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    level_id UUID NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
    comparison_feature VARCHAR(255) NOT NULL,
    feature_value TEXT NOT NULL,
    feature_type VARCHAR(50) DEFAULT 'text', -- 'text', 'number', 'boolean', 'list'
    is_highlighted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default levels (Hobby and Pro as mentioned)
INSERT INTO levels (name, display_name, description, tier_level, credits_monthly, credits_total, monthly_limit, is_active, is_featured) VALUES
('hobby', 'Hobby', 'Perfect for beginners and casual users', 1, 100, 1000, 100, true, false),
('pro', 'Pro', 'Advanced features for professionals and power users', 2, 1000, 10000, 1000, true, true);

-- Insert default features for Hobby level
INSERT INTO level_features (level_id, feature_name, feature_category, is_enabled, usage_limit, usage_period) 
SELECT id, feature_name, feature_category, is_enabled, usage_limit, usage_period
FROM (VALUES
    ('copyai_basic', 'copyai', true, 50, 'monthly'),
    ('workflow_basic', 'workflow', true, 5, 'monthly'),
    ('export_pdf', 'export', true, 10, 'monthly'),
    ('analytics_basic', 'analytics', true, NULL, 'monthly'),
    ('ai_models_basic', 'ai_models', true, 3, 'monthly')
) AS features(feature_name, feature_category, is_enabled, usage_limit, usage_period)
CROSS JOIN levels WHERE levels.name = 'hobby';

-- Insert default features for Pro level
INSERT INTO level_features (level_id, feature_name, feature_category, is_enabled, usage_limit, usage_period) 
SELECT id, feature_name, feature_category, is_enabled, usage_limit, usage_period
FROM (VALUES
    ('copyai_advanced', 'copyai', true, NULL, 'monthly'),
    ('workflow_advanced', 'workflow', true, NULL, 'monthly'),
    ('export_all_formats', 'export', true, NULL, 'monthly'),
    ('analytics_advanced', 'analytics', true, NULL, 'monthly'),
    ('ai_models_premium', 'ai_models', true, NULL, 'monthly'),
    ('priority_support', 'support', true, NULL, 'monthly'),
    ('custom_branding', 'branding', true, NULL, 'monthly'),
    ('api_access', 'api', true, 1000, 'monthly')
) AS features(feature_name, feature_category, is_enabled, usage_limit, usage_period)
CROSS JOIN levels WHERE levels.name = 'pro';

-- Insert default pricing
INSERT INTO level_pricing (level_id, pricing_type, price, currency, billing_cycle, is_recurring, trial_days, trial_credits) VALUES
((SELECT id FROM levels WHERE name = 'hobby'), 'monthly', 9.99, 'USD', 'monthly', true, 7, 100),
((SELECT id FROM levels WHERE name = 'hobby'), 'yearly', 99.99, 'USD', 'yearly', true, 7, 100),
((SELECT id FROM levels WHERE name = 'pro'), 'monthly', 29.99, 'USD', 'monthly', true, 14, 1000),
((SELECT id FROM levels WHERE name = 'pro'), 'yearly', 299.99, 'USD', 'yearly', true, 14, 1000);

-- Insert default benefits
INSERT INTO level_benefits (level_id, benefit_title, benefit_description, benefit_icon, benefit_order, is_highlighted) VALUES
((SELECT id FROM levels WHERE name = 'hobby'), 'Basic CopyAI Tools', 'Access to essential copywriting tools', 'pen-tool', 1, false),
((SELECT id FROM levels WHERE name = 'hobby'), '5 Workflows Monthly', 'Create and use up to 5 workflows per month', 'workflow', 2, false),
((SELECT id FROM levels WHERE name = 'hobby'), 'PDF Export', 'Export your books in PDF format', 'file-text', 3, false),
((SELECT id FROM levels WHERE name = 'pro'), 'Unlimited CopyAI Tools', 'Access to all advanced copywriting features', 'zap', 1, true),
((SELECT id FROM levels WHERE name = 'pro'), 'Unlimited Workflows', 'Create and use unlimited workflows', 'infinity', 2, true),
((SELECT id FROM levels WHERE name = 'pro'), 'All Export Formats', 'Export in PDF, EPUB, DOCX, and more', 'download', 3, true),
((SELECT id FROM levels WHERE name = 'pro'), 'Priority Support', 'Get help when you need it most', 'headphones', 4, true),
((SELECT id FROM levels WHERE name = 'pro'), 'Custom Branding', 'Add your own logo and branding', 'palette', 5, true);

-- Insert default restrictions
INSERT INTO level_restrictions (level_id, restriction_type, restriction_value, restriction_description, is_enforced) VALUES
((SELECT id FROM levels WHERE name = 'hobby'), 'max_book_length', '50000', 'Maximum 50,000 words per book', true),
((SELECT id FROM levels WHERE name = 'hobby'), 'export_formats', '["pdf"]', 'PDF export only', true),
((SELECT id FROM levels WHERE name = 'hobby'), 'ai_models', '["gpt-3.5", "claude-instant"]', 'Basic AI models only', true),
((SELECT id FROM levels WHERE name = 'pro'), 'max_book_length', '500000', 'Maximum 500,000 words per book', true),
((SELECT id FROM levels WHERE name = 'pro'), 'export_formats', '["pdf", "epub", "docx", "txt"]', 'All export formats available', true),
((SELECT id FROM levels WHERE name = 'pro'), 'ai_models', '["gpt-4", "claude-3", "gemini-pro", "grok"]', 'All premium AI models available', true);

-- Insert upgrade path
INSERT INTO level_upgrade_paths (from_level_id, to_level_id, upgrade_type, discount_percentage, upgrade_message) VALUES
((SELECT id FROM levels WHERE name = 'hobby'), (SELECT id FROM levels WHERE name = 'pro'), 'standard', 20, 'Upgrade to Pro and save 20% on your first year!');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_levels_tier_level ON levels(tier_level);
CREATE INDEX IF NOT EXISTS idx_levels_is_active ON levels(is_active);
CREATE INDEX IF NOT EXISTS idx_level_features_level_id ON level_features(level_id);
CREATE INDEX IF NOT EXISTS idx_level_pricing_level_id ON level_pricing(level_id);
CREATE INDEX IF NOT EXISTS idx_level_workflow_assignments_level_id ON level_workflow_assignments(level_id);
CREATE INDEX IF NOT EXISTS idx_level_analytics_level_id ON level_analytics(level_id);
CREATE INDEX IF NOT EXISTS idx_level_feature_usage_level_user ON level_feature_usage(level_id, user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_levels_updated_at BEFORE UPDATE ON levels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_level_features_updated_at BEFORE UPDATE ON level_features FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_level_pricing_updated_at BEFORE UPDATE ON level_pricing FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_level_workflow_assignments_updated_at BEFORE UPDATE ON level_workflow_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_level_restrictions_updated_at BEFORE UPDATE ON level_restrictions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_level_benefits_updated_at BEFORE UPDATE ON level_benefits FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_level_upgrade_paths_updated_at BEFORE UPDATE ON level_upgrade_paths FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_level_comparison_updated_at BEFORE UPDATE ON level_comparison FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
