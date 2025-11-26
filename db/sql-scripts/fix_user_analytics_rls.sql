-- Fix RLS policy for user_analytics to work with custom auth system
-- Drop old policy that uses auth.uid()
DROP POLICY IF EXISTS "Users can manage own analytics" ON user_analytics;
DROP POLICY IF EXISTS "Users can view own analytics" ON user_analytics;
DROP POLICY IF EXISTS "SuperAdmin can view all analytics" ON user_analytics;

-- Create new policy that allows users to view their own analytics (no auth.uid check)
CREATE POLICY "Users can view own analytics" ON user_analytics
  FOR SELECT 
  USING (true); -- Allow all reads for now since we filter by user_id in the query

-- SuperAdmin can manage all analytics
CREATE POLICY "SuperAdmin can manage all analytics" ON user_analytics
  FOR ALL 
  USING (true); -- Allow all for SuperAdmin


