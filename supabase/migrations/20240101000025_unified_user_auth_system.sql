-- =====================================================
-- UNIFIED USER AUTH SYSTEM MIGRATION
-- Creates independent user authentication system
-- Makes auth.users completely redundant
-- Zero dependencies on superadmin_users
-- =====================================================

-- =====================================================
-- 1. ADD MISSING AUTH COLUMNS TO USERS TABLE
-- =====================================================

-- Add password_hash column for authentication
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS password_hash text;

-- Add last_login for tracking
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS last_login timestamptz;

-- Add password_updated_at for security
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS password_updated_at timestamptz DEFAULT now();

-- =====================================================
-- 2. CREATE USER SESSIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_sessions (
  id text PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  session_data jsonb NOT NULL,
  is_active boolean DEFAULT true,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_tier ON public.users(tier);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON public.users(last_login);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON public.user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON public.user_sessions(expires_at);

-- =====================================================
-- 4. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 5. CREATE RLS POLICIES
-- =====================================================

-- Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Users can update their own profile (limited fields)
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Allow user registration (insert)
DROP POLICY IF EXISTS "Allow user registration" ON public.users;
CREATE POLICY "Allow user registration"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- User sessions policies
DROP POLICY IF EXISTS "Users can manage own sessions" ON public.user_sessions;
CREATE POLICY "Users can manage own sessions"
  ON public.user_sessions
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- =====================================================
-- 6. CREATE AUTH FUNCTIONS
-- =====================================================

-- Function to create user session
CREATE OR REPLACE FUNCTION public.create_user_session(
  p_user_id uuid,
  p_session_data jsonb,
  p_expires_at timestamptz DEFAULT (now() + interval '7 days')
)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  session_id text;
BEGIN
  -- Generate session ID
  session_id := encode(gen_random_bytes(32), 'hex');
  
  -- Insert session
  INSERT INTO public.user_sessions (id, user_id, session_data, expires_at)
  VALUES (session_id, p_user_id, p_session_data, p_expires_at);
  
  -- Update last login
  UPDATE public.users 
  SET last_login = now()
  WHERE id = p_user_id;
  
  RETURN session_id;
END;
$$;

-- Function to validate user session
CREATE OR REPLACE FUNCTION public.validate_user_session(p_session_id text)
RETURNS TABLE(
  user_id uuid,
  session_data jsonb,
  is_valid boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    us.user_id,
    us.session_data,
    (us.is_active AND us.expires_at > now()) as is_valid
  FROM public.user_sessions us
  WHERE us.id = p_session_id;
END;
$$;

-- Function to logout user (invalidate session)
CREATE OR REPLACE FUNCTION public.logout_user_session(p_session_id text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.user_sessions 
  SET is_active = false
  WHERE id = p_session_id;
  
  RETURN FOUND;
END;
$$;

-- =====================================================
-- 7. CREATE TRIGGERS
-- =====================================================

-- Trigger to update password_updated_at when password changes
CREATE OR REPLACE FUNCTION public.update_password_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.password_hash IS DISTINCT FROM OLD.password_hash THEN
    NEW.password_updated_at = now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_password_timestamp ON public.users;
CREATE TRIGGER trigger_update_password_timestamp
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.update_password_timestamp();

-- =====================================================
-- 8. CLEANUP REDUNDANT TABLES
-- =====================================================

-- Drop profiles table (redundant with users table)
DROP TABLE IF EXISTS public.profiles CASCADE;

-- =====================================================
-- 9. COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE public.users IS 'Independent user authentication and profile system';
COMMENT ON TABLE public.user_sessions IS 'User session management for authentication';
COMMENT ON COLUMN public.users.password_hash IS 'Encrypted password hash for authentication';
COMMENT ON COLUMN public.users.last_login IS 'Timestamp of last successful login';
COMMENT ON COLUMN public.users.password_updated_at IS 'Timestamp when password was last changed';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
