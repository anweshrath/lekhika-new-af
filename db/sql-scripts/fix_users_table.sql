-- Fix users table - add missing auth columns
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS password_hash text;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS last_login timestamptz;

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS password_updated_at timestamptz DEFAULT now();

-- Make id column auto-generate UUIDs if it doesn't already
ALTER TABLE public.users ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS public.user_sessions (
  id text PRIMARY KEY,
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  session_data jsonb NOT NULL,
  is_active boolean DEFAULT true,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_password_hash ON public.users(password_hash);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON public.users(last_login);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON public.user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_is_active ON public.user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON public.user_sessions(expires_at);

-- Enable RLS
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- Create password hashing functions using bcrypt
CREATE OR REPLACE FUNCTION public.hash_password(p_password text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN crypt(p_password, gen_salt('bf'));
END;
$$;

CREATE OR REPLACE FUNCTION public.verify_password(p_password text, p_hash text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN crypt(p_password, p_hash) = p_hash;
END;
$$;

-- Create session management functions
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
