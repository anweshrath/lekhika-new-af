-- Enforce Level Access Policies
-- Create policies that restrict user access based on level_access table

-- Function to check if user has access to a feature
CREATE OR REPLACE FUNCTION check_user_feature_access(
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
  WHERE id = p_user_id;
  
  -- Check if user has access to this feature
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
  
  RETURN COALESCE(has_access, false);
END;
$$;

-- Function to get user's accessible features
CREATE OR REPLACE FUNCTION get_user_accessible_features(p_user_id uuid)
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
  WHERE id = p_user_tier;
  
  -- Return accessible features
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
    END;
END;
$$;

-- Enable RLS on level_access
ALTER TABLE public.level_access ENABLE ROW LEVEL SECURITY;

-- Policy for level_access - allow authenticated users to read
DROP POLICY IF EXISTS "Allow authenticated users to read level access" ON public.level_access;
CREATE POLICY "Allow authenticated users to read level access"
  ON public.level_access
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy for SuperAdmin full access to level_access
DROP POLICY IF EXISTS "SuperAdmin full access level access" ON public.level_access;
CREATE POLICY "SuperAdmin full access level access"
  ON public.level_access
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.superadmin_users 
      WHERE id = auth.uid() AND is_active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.superadmin_users 
      WHERE id = auth.uid() AND is_active = true
    )
  );

-- Add comments for documentation
COMMENT ON FUNCTION check_user_feature_access IS 'Checks if a user has access to a specific feature based on their tier';
COMMENT ON FUNCTION get_user_accessible_features IS 'Returns all features accessible to a user based on their tier';
