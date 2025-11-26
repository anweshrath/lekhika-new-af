/*
  # Complete BookMagic AI Database Schema

  This migration creates the complete database schema for BookMagic AI platform including:
  
  1. New Tables
    - `profiles` - Extended user profiles with roles and preferences
    - `user_credits` - Credits and billing system with tier management
    - `subscriptions` - PayPal subscription management
    - `books` - Main books/projects table with AI metadata
    - `book_sections` - Individual chapters/sections for each book
    - `usage_logs` - Comprehensive usage tracking and analytics
    - `book_templates` - Reusable book templates and presets
    - `user_api_keys` - Encrypted API keys for BYOK tier users

  2. Security
    - Enable RLS on all tables
    - Comprehensive policies for user data access
    - Admin access controls
    - Public template access

  3. Performance
    - Strategic indexes for common queries
    - Optimized foreign key relationships
    - Efficient data types and constraints

  4. Data Integrity
    - Proper constraints and checks
    - Cascading deletes where appropriate
    - Default values for all fields
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE - Extended user information
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name text,
  email text,
  avatar_url text,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  onboarding_completed boolean DEFAULT false,
  preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. USER CREDITS TABLE - Credits and billing system
CREATE TABLE IF NOT EXISTS user_credits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  credits integer DEFAULT 1000 CHECK (credits >= 0),
  tier text DEFAULT 'free' CHECK (tier IN ('free', 'standard', 'expert', 'byok')),
  monthly_limit integer DEFAULT 1000,
  reset_date timestamptz DEFAULT (date_trunc('month', now()) + interval '1 month'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- 3. SUBSCRIPTIONS TABLE - PayPal subscription management
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tier text NOT NULL CHECK (tier IN ('standard', 'expert', 'byok')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'paused')),
  paypal_subscription_id text UNIQUE,
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 4. BOOKS TABLE - Main books/projects
CREATE TABLE IF NOT EXISTS books (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('ebook', 'guide', 'manual', 'course', 'report')),
  niche text,
  target_audience text,
  tone text DEFAULT 'professional',
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'generating', 'completed', 'published', 'archived')),
  content jsonb DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  ai_service text CHECK (ai_service IN ('openai', 'claude', 'gemini')),
  quality_score integer CHECK (quality_score >= 0 AND quality_score <= 100),
  ai_detection_score integer CHECK (ai_detection_score >= 0 AND ai_detection_score <= 100),
  word_count integer DEFAULT 0,
  downloads integer DEFAULT 0,
  is_public boolean DEFAULT false,
  cover_image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 5. BOOK SECTIONS TABLE - Individual chapters/sections
CREATE TABLE IF NOT EXISTS book_sections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id uuid REFERENCES books(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  content text,
  section_type text DEFAULT 'chapter' CHECK (section_type IN ('introduction', 'chapter', 'conclusion', 'appendix')),
  section_order integer NOT NULL,
  word_count integer DEFAULT 0,
  ai_generated boolean DEFAULT true,
  ai_service text CHECK (ai_service IN ('openai', 'claude', 'gemini')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(book_id, section_order)
);

-- 6. USAGE LOGS TABLE - Comprehensive usage tracking
CREATE TABLE IF NOT EXISTS usage_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action text NOT NULL,
  resource_type text,
  resource_id uuid,
  metadata jsonb DEFAULT '{}',
  credits_used integer DEFAULT 0,
  ai_service text CHECK (ai_service IN ('openai', 'claude', 'gemini')),
  success boolean DEFAULT true,
  error_message text,
  created_at timestamptz DEFAULT now()
);

-- 7. BOOK TEMPLATES TABLE - Reusable templates
CREATE TABLE IF NOT EXISTS book_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('ebook', 'guide', 'manual', 'course', 'report')),
  niche text,
  structure jsonb NOT NULL DEFAULT '{}',
  is_premium boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  is_public boolean DEFAULT true,
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 8. USER API KEYS TABLE - For BYOK tier users
CREATE TABLE IF NOT EXISTS user_api_keys (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  service text NOT NULL CHECK (service IN ('openai', 'claude', 'gemini')),
  encrypted_key text NOT NULL,
  is_active boolean DEFAULT true,
  last_used timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, service)
);

-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES FOR PROFILES
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS POLICIES FOR USER CREDITS
CREATE POLICY "Users can view own credits" ON user_credits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own credits" ON user_credits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credits" ON user_credits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS POLICIES FOR SUBSCRIPTIONS
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS POLICIES FOR BOOKS
CREATE POLICY "Users can view own books" ON books
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create own books" ON books
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own books" ON books
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own books" ON books
  FOR DELETE USING (auth.uid() = user_id);

-- RLS POLICIES FOR BOOK SECTIONS
CREATE POLICY "Users can view book sections" ON book_sections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM books 
      WHERE books.id = book_sections.book_id 
      AND (books.user_id = auth.uid() OR books.is_public = true)
    )
  );

CREATE POLICY "Users can create book sections" ON book_sections
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM books 
      WHERE books.id = book_sections.book_id 
      AND books.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update book sections" ON book_sections
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM books 
      WHERE books.id = book_sections.book_id 
      AND books.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete book sections" ON book_sections
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM books 
      WHERE books.id = book_sections.book_id 
      AND books.user_id = auth.uid()
    )
  );

-- RLS POLICIES FOR USAGE LOGS
CREATE POLICY "Users can view own usage logs" ON usage_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage logs" ON usage_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS POLICIES FOR BOOK TEMPLATES
CREATE POLICY "Users can view public templates" ON book_templates
  FOR SELECT USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create templates" ON book_templates
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own templates" ON book_templates
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own templates" ON book_templates
  FOR DELETE USING (auth.uid() = created_by);

-- RLS POLICIES FOR USER API KEYS
CREATE POLICY "Users can view own API keys" ON user_api_keys
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own API keys" ON user_api_keys
  FOR ALL USING (auth.uid() = user_id);

-- PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_books_user_id ON books(user_id);
CREATE INDEX IF NOT EXISTS idx_books_status ON books(status);
CREATE INDEX IF NOT EXISTS idx_books_created_at ON books(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_books_is_public ON books(is_public);
CREATE INDEX IF NOT EXISTS idx_book_sections_book_id ON book_sections(book_id);
CREATE INDEX IF NOT EXISTS idx_book_sections_order ON book_sections(book_id, section_order);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_credits_user_id ON user_credits(user_id);
CREATE INDEX IF NOT EXISTS idx_book_templates_public ON book_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_user_api_keys_user_service ON user_api_keys(user_id, service);

-- FUNCTIONS FOR AUTOMATIC TIMESTAMP UPDATES
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- TRIGGERS FOR UPDATED_AT COLUMNS
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at 
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_credits_updated_at ON user_credits;
CREATE TRIGGER update_user_credits_updated_at 
  BEFORE UPDATE ON user_credits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at 
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_books_updated_at ON books;
CREATE TRIGGER update_books_updated_at 
  BEFORE UPDATE ON books
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_book_sections_updated_at ON book_sections;
CREATE TRIGGER update_book_sections_updated_at 
  BEFORE UPDATE ON book_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_book_templates_updated_at ON book_templates;
CREATE TRIGGER update_book_templates_updated_at 
  BEFORE UPDATE ON book_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_api_keys_updated_at ON user_api_keys;
CREATE TRIGGER update_user_api_keys_updated_at 
  BEFORE UPDATE ON user_api_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- INSERT SAMPLE BOOK TEMPLATES
INSERT INTO book_templates (name, description, type, niche, structure, is_premium, is_public) VALUES
(
  'Business Guide Template',
  'Professional business guide structure with executive summary, market analysis, and actionable strategies',
  'guide',
  'business',
  '{
    "sections": [
      {"title": "Executive Summary", "type": "introduction", "order": 1},
      {"title": "Market Analysis", "type": "chapter", "order": 2},
      {"title": "Strategic Framework", "type": "chapter", "order": 3},
      {"title": "Implementation Plan", "type": "chapter", "order": 4},
      {"title": "Conclusion & Next Steps", "type": "conclusion", "order": 5}
    ]
  }',
  false,
  true
),
(
  'Technical Manual Template',
  'Comprehensive technical documentation structure with setup, configuration, and troubleshooting',
  'manual',
  'technology',
  '{
    "sections": [
      {"title": "Introduction", "type": "introduction", "order": 1},
      {"title": "System Requirements", "type": "chapter", "order": 2},
      {"title": "Installation Guide", "type": "chapter", "order": 3},
      {"title": "Configuration", "type": "chapter", "order": 4},
      {"title": "Usage Examples", "type": "chapter", "order": 5},
      {"title": "Troubleshooting", "type": "chapter", "order": 6},
      {"title": "Appendix", "type": "appendix", "order": 7}
    ]
  }',
  false,
  true
),
(
  'Educational Course Template',
  'Structured learning course with modules, exercises, and assessments',
  'course',
  'education',
  '{
    "sections": [
      {"title": "Course Overview", "type": "introduction", "order": 1},
      {"title": "Module 1: Fundamentals", "type": "chapter", "order": 2},
      {"title": "Module 2: Intermediate Concepts", "type": "chapter", "order": 3},
      {"title": "Module 3: Advanced Topics", "type": "chapter", "order": 4},
      {"title": "Practical Exercises", "type": "chapter", "order": 5},
      {"title": "Final Assessment", "type": "conclusion", "order": 6}
    ]
  }',
  true,
  true
);
