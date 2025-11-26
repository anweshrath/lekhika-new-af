-- =====================================================
-- FIX ENFORCEMENT SYSTEM FOR NEW LEVEL_ACCESS STRUCTURE
-- Professional, comprehensive enforcement system
-- =====================================================

-- STEP 1: Drop old enforcement functions
DROP FUNCTION IF EXISTS public.check_feature_access(uuid, text);
DROP FUNCTION IF EXISTS public.get_user_accessible_features(uuid);
DROP FUNCTION IF EXISTS public.validate_tier_upgrade(uuid, text);

-- STEP 2: Create new enforcement function for the new structure
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
  
  -- Check feature access based on tier using the new structure
  -- The feature_name is now a column name, so we need to use dynamic SQL
  EXECUTE format('
    SELECT %I INTO has_access
    FROM public.level_access
    WHERE level_name = %L AND is_active = true',
    p_feature_name, user_tier
  );
  
  -- Return access result
  RETURN COALESCE(has_access, false);
END;
$$;

-- STEP 3: Create function to get user's accessible features
CREATE OR REPLACE FUNCTION public.get_user_accessible_features(
  p_user_id uuid
)
RETURNS TABLE(
  feature_name text,
  has_access boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_tier text;
  feature_col text;
  feature_value boolean;
BEGIN
  -- Get user's tier
  SELECT tier INTO user_tier
  FROM public.users
  WHERE id = p_user_id AND is_active = true;
  
  -- If user not found or inactive
  IF user_tier IS NULL THEN
    RETURN;
  END IF;
  
  -- Get all feature columns dynamically
  FOR feature_col IN 
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'level_access' 
      AND table_schema = 'public'
      AND column_name NOT IN ('id', 'level_id', 'level_name', 'is_active', 'created_at', 'updated_at')
  LOOP
    -- Check if user has access to this feature
    EXECUTE format('
      SELECT %I INTO feature_value
      FROM public.level_access
      WHERE level_name = %L AND is_active = true',
      feature_col, user_tier
    );
    
    -- Return the feature and access status
    feature_name := feature_col;
    has_access := COALESCE(feature_value, false);
    RETURN NEXT;
  END LOOP;
END;
$$;

-- STEP 4: Create function to validate tier upgrade
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
  -- Get current user tier
  SELECT tier INTO current_tier
  FROM public.users
  WHERE id = p_user_id AND is_active = true;
  
  -- If user not found
  IF current_tier IS NULL THEN
    RETURN false;
  END IF;
  
  -- Get current tier level
  SELECT tier_level INTO current_level
  FROM public.levels
  WHERE name = current_tier AND is_active = true;
  
  -- Get new tier level
  SELECT tier_level INTO new_level
  FROM public.levels
  WHERE name = p_new_tier AND is_active = true;
  
  -- If either tier not found
  IF current_level IS NULL OR new_level IS NULL THEN
    RETURN false;
  END IF;
  
  -- Validate upgrade (can only upgrade, not downgrade)
  RETURN new_level > current_level;
END;
$$;

-- STEP 5: Create RLS policies for level_access
ALTER TABLE public.level_access ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "SuperAdmin can do everything on level_access" ON public.level_access;
DROP POLICY IF EXISTS "Public can read level_access" ON public.level_access;

-- Create new policies
CREATE POLICY "SuperAdmins can manage level access" ON public.level_access
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.superadmin_users 
            WHERE id = auth.uid() AND is_active = true
        )
    );

CREATE POLICY "Authenticated users can read level access" ON public.level_access
    FOR SELECT USING (auth.role() = 'authenticated');

-- STEP 6: Create enforcement trigger for user_engines
CREATE OR REPLACE FUNCTION public.enforce_engine_feature_access()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  user_tier text;
  engine_features text[];
  feature text;
  has_access boolean;
BEGIN
  -- Get user's tier
  SELECT tier INTO user_tier
  FROM public.users
  WHERE id = NEW.user_id AND is_active = true;
  
  -- If user not found
  IF user_tier IS NULL THEN
    RAISE EXCEPTION 'User not found or inactive';
  END IF;
  
  -- Get engine features from ai_engines metadata
  SELECT metadata->'features' INTO engine_features
  FROM public.ai_engines
  WHERE id = NEW.engine_id;
  
  -- Check each required feature
  IF engine_features IS NOT NULL THEN
    FOREACH feature IN ARRAY engine_features
    LOOP
      -- Check if user has access to this feature
      EXECUTE format('
        SELECT %I INTO has_access
        FROM public.level_access
        WHERE level_name = %L AND is_active = true',
        feature, user_tier
      );
      
      -- If user doesn't have access, deny
      IF NOT COALESCE(has_access, false) THEN
        RAISE EXCEPTION 'User does not have access to feature: %', feature;
      END IF;
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_enforce_engine_access ON public.user_engines;
CREATE TRIGGER trigger_enforce_engine_access
    BEFORE INSERT OR UPDATE ON public.user_engines
    FOR EACH ROW
    EXECUTE FUNCTION public.enforce_engine_feature_access();

-- STEP 7: Test the enforcement system
-- Test function to verify enforcement is working
CREATE OR REPLACE FUNCTION public.test_feature_enforcement(
  p_user_id uuid,
  p_feature_name text
)
RETURNS TABLE(
  user_tier text,
  feature_name text,
  has_access boolean,
  test_result text
)
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
  
  -- Check feature access
  SELECT public.check_feature_access(p_user_id, p_feature_name) INTO has_access;
  
  -- Return test results
  RETURN QUERY SELECT 
    user_tier,
    p_feature_name,
    has_access,
    CASE 
      WHEN has_access THEN '✅ Access granted'
      ELSE '❌ Access denied'
    END;
END;
$$;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Test enforcement for different users and features
-- SELECT * FROM public.test_feature_enforcement('USER_ID_HERE', 'gpt4_access');
-- SELECT * FROM public.test_feature_enforcement('USER_ID_HERE', 'pdf_export');
-- SELECT * FROM public.test_feature_enforcement('USER_ID_HERE', 'api_access');

-- Get all accessible features for a user
-- SELECT * FROM public.get_user_accessible_features('USER_ID_HERE');

-- =====================================================
-- ENFORCEMENT SYSTEM STATUS: ✅ ACTIVE
-- =====================================================
