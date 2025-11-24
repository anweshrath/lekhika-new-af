# 🗄️ Database Schema Implementation Plan

## Required Supabase Tables

### 1. User Profiles Extension
```sql
CREATE TABLE profiles (
  id uuid REFERENCES auth.users(id) PRIMARY KEY,
  full_name text,
  email text,
  avatar_url text,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  onboarding_completed boolean DEFAULT false,
  preferences jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### 2. Credits and Billing System
```sql
CREATE TABLE user_credits (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  credits integer DEFAULT 1000 CHECK (credits >= 0),
  tier text DEFAULT 'free' CHECK (tier IN ('free', 'standard', 'expert', 'byok')),
  monthly_limit integer DEFAULT 1000,
  reset_date timestamptz DEFAULT (date_trunc('month', now()) + interval '1 month'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);
```

### 3. Subscription Management
```sql
CREATE TABLE subscriptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  tier text NOT NULL CHECK (tier IN ('standard', 'expert', 'byok')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'paused')),
  paypal_subscription_id text UNIQUE,
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  cancel_at_period_end boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### 4. Books/Projects Management
```sql
CREATE TABLE books (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
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
```

### 5. Book Sections/Chapters
```sql
CREATE TABLE book_sections (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  book_id uuid REFERENCES books(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text,
  section_type text DEFAULT 'chapter' CHECK (section_type IN ('introduction', 'chapter', 'conclusion', 'appendix')),
  section_order integer NOT NULL,
  word_count integer DEFAULT 0,
  ai_generated boolean DEFAULT true,
  ai_service text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(book_id, section_order)
);
```

### 6. Usage Tracking and Analytics
```sql
CREATE TABLE usage_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  action text NOT NULL,
  resource_type text,
  resource_id uuid,
  metadata jsonb DEFAULT '{}',
  credits_used integer DEFAULT 0,
  ai_service text,
  success boolean DEFAULT true,
  error_message text,
  created_at timestamptz DEFAULT now()
);
```

### 7. Templates and Presets
```sql
CREATE TABLE book_templates (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  type text NOT NULL,
  niche text,
  structure jsonb NOT NULL,
  is_premium boolean DEFAULT false,
  created_by uuid REFERENCES auth.users(id),
  is_public boolean DEFAULT true,
  usage_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

### 8. User API Keys (for BYOK tier)
```sql
CREATE TABLE user_api_keys (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  service text NOT NULL CHECK (service IN ('openai', 'claude', 'gemini')),
  encrypted_key text NOT NULL,
  is_active boolean DEFAULT true,
  last_used timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, service)
);
```

## Row Level Security Policies

### Enable RLS on all tables
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_api_keys ENABLE ROW LEVEL SECURITY;
```

### Sample RLS Policies
```sql
-- Profiles: Users can only access their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Books: Users can only access their own books
CREATE POLICY "Users can view own books" ON books
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create own books" ON books
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own books" ON books
  FOR UPDATE USING (auth.uid() = user_id);

-- Credits: Users can only view their own credits
CREATE POLICY "Users can view own credits" ON user_credits
  FOR SELECT USING (auth.uid() = user_id);
```

## Indexes for Performance
```sql
-- Performance indexes
CREATE INDEX idx_books_user_id ON books(user_id);
CREATE INDEX idx_books_status ON books(status);
CREATE INDEX idx_books_created_at ON books(created_at DESC);
CREATE INDEX idx_book_sections_book_id ON book_sections(book_id);
CREATE INDEX idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX idx_usage_logs_created_at ON usage_logs(created_at DESC);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
```

## Database Functions
```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_books_updated_at BEFORE UPDATE ON books
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_book_sections_updated_at BEFORE UPDATE ON book_sections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## Implementation Priority
1. **Phase 1**: profiles, user_credits, books, book_sections
2. **Phase 2**: subscriptions, usage_logs
3. **Phase 3**: book_templates, user_api_keys
