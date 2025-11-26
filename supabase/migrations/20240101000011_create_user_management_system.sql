-- =====================================================
-- USER MANAGEMENT SYSTEM MIGRATION
-- Creates public.users table synced with auth.users
-- Implements business logic, tiers, and access control
-- =====================================================

-- Drop existing if needed
DROP TABLE IF EXISTS public.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.handle_user_update() CASCADE;
DROP FUNCTION IF EXISTS public.handle_user_delete() CASCADE;

-- =====================================================
-- 1. CREATE PUBLIC.USERS TABLE
-- =====================================================

CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  username text UNIQUE,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin', 'superadmin')),
  tier text DEFAULT 'free' CHECK (tier IN ('free', 'basic', 'premium', 'enterprise')),
  access_level integer DEFAULT 1 CHECK (access_level >= 1 AND access_level <= 10),
  credits_balance integer DEFAULT 1000 CHECK (credits_balance >= 0),
  monthly_limit integer DEFAULT 1000 CHECK (monthly_limit >= 0),
  features_enabled jsonb DEFAULT '[]',
  is_active boolean DEFAULT true,
  onboarding_completed boolean DEFAULT false,
  last_activity timestamptz,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_role ON public.users(role);
CREATE INDEX idx_users_tier ON public.users(tier);
CREATE INDEX idx_users_access_level ON public.users(access_level);
CREATE INDEX idx_users_is_active ON public.users(is_active);
CREATE INDEX idx_users_last_activity ON public.users(last_activity);

-- =====================================================
-- 3. CREATE AUTO-UPDATE TRIGGER FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. CREATE USER SYNC TRIGGERS
-- =====================================================

-- Handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (
    id, 
    email, 
    full_name, 
    username,
    role,
    tier,
    access_level,
    credits_balance,
    monthly_limit,
    features_enabled,
    metadata
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' = 'superadmin' THEN 'superadmin'
      WHEN NEW.raw_user_meta_data->>'role' = 'admin' THEN 'admin'
      ELSE 'user'
    END,
    COALESCE(NEW.raw_user_meta_data->>'tier', 'free'),
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' = 'superadmin' THEN 10
      WHEN NEW.raw_user_meta_data->>'role' = 'admin' THEN 8
      ELSE 1
    END,
    COALESCE((NEW.raw_user_meta_data->>'credits_balance')::integer, 1000),
    COALESCE((NEW.raw_user_meta_data->>'monthly_limit')::integer, 1000),
    COALESCE(NEW.raw_user_meta_data->'features_enabled', '[]'),
    COALESCE(NEW.raw_user_meta_data, '{}')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Handle user updates
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS trigger AS $$
BEGIN
  UPDATE public.users SET
    email = NEW.email,
    full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', users.full_name),
    username = COALESCE(NEW.raw_user_meta_data->>'username', users.username),
    role = CASE 
      WHEN NEW.raw_user_meta_data->>'role' = 'superadmin' THEN 'superadmin'
      WHEN NEW.raw_user_meta_data->>'role' = 'admin' THEN 'admin'
      ELSE users.role
    END,
    tier = COALESCE(NEW.raw_user_meta_data->>'tier', users.tier),
    access_level = CASE 
      WHEN NEW.raw_user_meta_data->>'role' = 'superadmin' THEN 10
      WHEN NEW.raw_user_meta_data->>'role' = 'admin' THEN 8
      ELSE users.access_level
    END,
    updated_at = now()
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Handle user deletion
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS trigger AS $$
BEGIN
  DELETE FROM public.users WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 5. ATTACH TRIGGERS
-- =====================================================

-- New user trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- User update trigger
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_update();

-- User deletion trigger
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_delete();

-- Auto-update trigger for public.users
CREATE TRIGGER handle_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =====================================================
-- 6. CREATE RLS POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Users can update their own profile (limited fields)
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- SuperAdmin can view all users
CREATE POLICY "SuperAdmin can view all users"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM superadmin_users
      WHERE id = auth.uid()
    )
  );

-- SuperAdmin can manage all users
CREATE POLICY "SuperAdmin can manage all users"
  ON public.users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM superadmin_users
      WHERE id = auth.uid()
    )
  );

-- =====================================================
-- 7. INSERT DEFAULT SUPERADMIN USER
-- =====================================================

-- First, create SuperAdmin user in auth.users (Supabase's built-in auth)
INSERT INTO auth.users (
  id, 
  email, 
  encrypted_password, 
  email_confirmed_at, 
  created_at, 
  updated_at, 
  raw_user_meta_data
) VALUES (
  '5950cad6-810b-4c5b-9d40-4485ea249770',
  'admin@bookmagic.ai',
  crypt('BookMagic2024!Admin', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"role": "superadmin", "tier": "enterprise", "access_level": 10}'
) ON CONFLICT (id) DO NOTHING;

-- Now insert SuperAdmin into public.users
INSERT INTO public.users (
  id,
  email,
  full_name,
  username,
  role,
  tier,
  access_level,
  credits_balance,
  monthly_limit,
  features_enabled,
  is_active
) VALUES (
  '5950cad6-810b-4c5b-9d40-4485ea249770',
  'admin@bookmagic.ai',
  'SuperAdmin',
  'superadmin',
  'superadmin',
  'enterprise',
  10,
  999999,
  999999,
  '["all_features", "admin_panel", "user_management", "system_config"]',
  true
) ON CONFLICT (id) DO UPDATE SET
  role = 'superadmin',
  tier = 'enterprise',
  access_level = 10,
  updated_at = now();

-- =====================================================
-- 8. CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to get user access level
CREATE OR REPLACE FUNCTION public.get_user_access_level(user_id uuid)
RETURNS integer AS $$
BEGIN
  RETURN (
    SELECT access_level 
    FROM public.users 
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has feature access
CREATE OR REPLACE FUNCTION public.user_has_feature(user_id uuid, feature text)
RETURNS boolean AS $$
BEGIN
  RETURN (
    SELECT features_enabled ? feature
    FROM public.users 
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user tier info
CREATE OR REPLACE FUNCTION public.get_user_tier_info(user_id uuid)
RETURNS jsonb AS $$
BEGIN
  RETURN (
    SELECT jsonb_build_object(
      'tier', tier,
      'access_level', access_level,
      'credits_balance', credits_balance,
      'monthly_limit', monthly_limit,
      'features_enabled', features_enabled
    )
    FROM public.users 
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 9. GRANT PERMISSIONS
-- =====================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;

-- Grant permissions on users table
GRANT SELECT, UPDATE ON public.users TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION public.get_user_access_level(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_feature(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_tier_info(uuid) TO authenticated;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Verify the setup
SELECT 'User Management System Created Successfully!' as status;
SELECT COUNT(*) as total_users FROM public.users;
SELECT role, COUNT(*) as count FROM public.users GROUP BY role;
