-- =====================================================
-- LEVEL ACCESS ENFORCEMENT SYSTEM
-- Professional, comprehensive level-based access control
-- No patch jobs, no lazy bullshit
-- =====================================================

-- =====================================================
-- 1. CREATE LEVEL ENFORCEMENT FUNCTIONS
-- =====================================================

-- Function to check if user has access to a feature
CREATE OR REPLACE FUNCTION public.check_feature_access(
  p_user_id uuid,
  p_feature_name text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_tier text;
  has_access boolean;
BEGIN
  -- Get user's tier
  SELECT tier INTO user_tier
  FROM public.users
  WHERE id = p_user_id AND is_active = true;
  
  -- If user not found or inactive
  IF user_tier IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check feature access based on tier
  SELECT CASE user_tier
    WHEN 'hobby' THEN hobby_access
    WHEN 'pro' THEN pro_access
    WHEN 'macdaddy' THEN macdaddy_access
    WHEN 'byok' THEN byok_access
    ELSE false
  END INTO has_access
  FROM public.level_access
  WHERE feature_name = p_feature_name 
    AND is_active = true;
  
  -- Return access result
  RETURN COALESCE(has_access, false);
END;
$$;

-- Function to get user's accessible features
CREATE OR REPLACE FUNCTION public.get_user_accessible_features(
  p_user_id uuid
)
RETURNS TABLE(
  feature_name text,
  feature_category text,
  feature_description text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_tier text;
BEGIN
  -- Get user's tier
  SELECT tier INTO user_tier
  FROM public.users
  WHERE id = p_user_id AND is_active = true;
  
  -- If user not found or inactive
  IF user_tier IS NULL THEN
    RETURN;
  END IF;
  
  -- Return accessible features based on tier
  RETURN QUERY
  SELECT la.feature_name, la.feature_category, la.feature_description
  FROM public.level_access la
  WHERE la.is_active = true
    AND CASE user_tier
      WHEN 'hobby' THEN la.hobby_access
      WHEN 'pro' THEN la.pro_access
      WHEN 'macdaddy' THEN la.macdaddy_access
      WHEN 'byok' THEN la.byok_access
      ELSE false
    END = true
  ORDER BY la.feature_category, la.feature_name;
END;
$$;

-- Function to validate user tier upgrade
CREATE OR REPLACE FUNCTION public.validate_tier_upgrade(
  p_user_id uuid,
  p_new_tier text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_tier text;
  current_level integer;
  new_level integer;
BEGIN
  -- Get current user tier and level
  SELECT tier, access_level INTO current_tier, current_level
  FROM public.users
  WHERE id = p_user_id AND is_active = true;
  
  -- If user not found
  IF current_tier IS NULL THEN
    RETURN false;
  END IF;
  
  -- Get new tier level
  SELECT tier_level INTO new_level
  FROM public.levels
  WHERE name = p_new_tier AND is_active = true;
  
  -- If new tier not found
  IF new_level IS NULL THEN
    RETURN false;
  END IF;
  
  -- Validate upgrade (can only upgrade, not downgrade)
  RETURN new_level > current_level;
END;
$$;

-- =====================================================
-- 2. CREATE ACCESS CONTROL TRIGGERS
-- =====================================================

-- Function to enforce feature access on user_engines
CREATE OR REPLACE FUNCTION public.enforce_engine_access()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  engine_feature text;
  has_access boolean;
BEGIN
  -- Get engine feature from ai_engines metadata
  SELECT metadata->>'feature_category' INTO engine_feature
  FROM ai_engines
  WHERE id = NEW.engine_id;
  
  -- Check if user has access to this feature
  SELECT public.check_feature_access(NEW.user_id, engine_feature) INTO has_access;
  
  -- If no access, prevent assignment
  IF NOT has_access THEN
    RAISE EXCEPTION 'User does not have access to feature: %', engine_feature;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for user_engines
DROP TRIGGER IF EXISTS trigger_enforce_engine_access ON public.user_engines;
CREATE TRIGGER trigger_enforce_engine_access
  BEFORE INSERT OR UPDATE ON public.user_engines
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_engine_access();

-- =====================================================
-- 3. CREATE LEVEL MANAGEMENT FUNCTIONS
-- =====================================================

-- Function to assign user to level
CREATE OR REPLACE FUNCTION public.assign_user_to_level(
  p_user_id uuid,
  p_level_name text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  level_data record;
BEGIN
  -- Get level data
  SELECT * INTO level_data
  FROM public.levels
  WHERE name = p_level_name AND is_active = true;
  
  -- If level not found
  IF level_data IS NULL THEN
    RAISE EXCEPTION 'Level not found: %', p_level_name;
  END IF;
  
  -- Validate upgrade
  IF NOT public.validate_tier_upgrade(p_user_id, p_level_name) THEN
    RAISE EXCEPTION 'Invalid tier upgrade for user';
  END IF;
  
  -- Update user with new level
  UPDATE public.users
  SET 
    tier = level_data.name,
    access_level = level_data.tier_level,
    credits_balance = level_data.credits_total,
    monthly_limit = level_data.monthly_limit,
    updated_at = now()
  WHERE id = p_user_id;
  
  -- Auto-assign engines based on new level
  PERFORM public.auto_assign_engines_for_level(p_user_id, p_level_name);
  
  RETURN true;
END;
$$;

-- Function to auto-assign engines for level
CREATE OR REPLACE FUNCTION public.auto_assign_engines_for_level(
  p_user_id uuid,
  p_level_name text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  engine_record record;
BEGIN
  -- Get all engines assigned to this level
  FOR engine_record IN
    SELECT DISTINCT ae.id, ae.name, ae.description, ae.metadata
    FROM public.ai_engines ae
    JOIN public.level_engines le ON ae.id = le.engine_id
    JOIN public.levels l ON le.level_id = l.id
    WHERE l.name = p_level_name
      AND ae.is_active = true
      AND le.is_active = true
  LOOP
    -- Check if user already has this engine
    IF NOT EXISTS (
      SELECT 1 FROM public.user_engines 
      WHERE user_id = p_user_id AND engine_id = engine_record.id
    ) THEN
      -- Create user engine copy
      INSERT INTO public.user_engines (
        user_id,
        engine_id,
        engine_name,
        engine_description,
        engine_config,
        is_active,
        created_at
      ) VALUES (
        p_user_id,
        engine_record.id,
        engine_record.name,
        engine_record.description,
        engine_record.metadata,
        true,
        now()
      );
    END IF;
  END LOOP;
END;
$$;

-- =====================================================
-- 4. CREATE LEVEL ACCESS POLICIES
-- =====================================================

-- Enable RLS on level_access
ALTER TABLE public.level_access ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view level access (for checking their permissions)
DROP POLICY IF EXISTS "Users can view level access" ON public.level_access;
CREATE POLICY "Users can view level access"
  ON public.level_access
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Only superadmin can modify level access
DROP POLICY IF EXISTS "SuperAdmin can modify level access" ON public.level_access;
CREATE POLICY "SuperAdmin can modify level access"
  ON public.level_access
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM superadmin_users
      WHERE id = auth.uid()
    )
  );

-- =====================================================
-- 5. CREATE LEVEL VALIDATION CONSTRAINTS
-- =====================================================

-- First, drop existing tier constraint if it exists
ALTER TABLE public.users 
DROP CONSTRAINT IF EXISTS users_tier_check;

-- Update existing users with invalid tier values
UPDATE public.users 
SET tier = 'hobby' 
WHERE tier = 'free';

-- Add constraint to ensure valid tier values
ALTER TABLE public.users 
ADD CONSTRAINT check_valid_tier 
CHECK (tier IN ('hobby', 'pro', 'macdaddy', 'byok'));

-- Add constraint to ensure access_level matches tier
ALTER TABLE public.users 
ADD CONSTRAINT check_access_level_tier 
CHECK (
  (tier = 'hobby' AND access_level = 1) OR
  (tier = 'pro' AND access_level = 2) OR
  (tier = 'macdaddy' AND access_level = 3) OR
  (tier = 'byok' AND access_level = 4)
);

-- =====================================================
-- 6. CREATE LEVEL AUDIT FUNCTIONS
-- =====================================================

-- Function to audit user access
CREATE OR REPLACE FUNCTION public.audit_user_access(
  p_user_id uuid
)
RETURNS TABLE(
  user_email text,
  current_tier text,
  access_level integer,
  accessible_features_count bigint,
  assigned_engines_count bigint,
  credits_balance integer,
  monthly_limit integer
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.email,
    u.tier,
    u.access_level,
    (SELECT COUNT(*) FROM public.get_user_accessible_features(p_user_id)),
    (SELECT COUNT(*) FROM public.user_engines WHERE user_id = p_user_id AND is_active = true),
    u.credits_balance,
    u.monthly_limit
  FROM public.users u
  WHERE u.id = p_user_id;
END;
$$;

-- =====================================================
-- 7. CLEANUP REDUNDANT TABLES
-- =====================================================

-- Drop OLD_level_access table (redundant)
DROP TABLE IF EXISTS public.OLD_level_access CASCADE;

-- =====================================================
-- 8. COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON FUNCTION public.check_feature_access IS 'Enforces feature access based on user tier and level_access table';
COMMENT ON FUNCTION public.get_user_accessible_features IS 'Returns all features accessible to a user based on their tier';
COMMENT ON FUNCTION public.assign_user_to_level IS 'Assigns user to level with validation and auto-engine assignment';
COMMENT ON FUNCTION public.audit_user_access IS 'Provides comprehensive audit of user access and permissions';

-- =====================================================
-- ENFORCEMENT SYSTEM COMPLETE
-- =====================================================
