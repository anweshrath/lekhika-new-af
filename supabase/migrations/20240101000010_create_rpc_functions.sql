/*
  # Create RPC Functions for BookMagic AI

  This migration creates utility functions for the BookMagic AI platform:
  
  1. increment_template_usage - Safely increment template usage count
  2. get_user_analytics - Get comprehensive user analytics
  3. cleanup_expired_sessions - Clean up old usage logs
*/

-- Function to increment template usage count
CREATE OR REPLACE FUNCTION increment_template_usage(template_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE book_templates 
  SET usage_count = usage_count + 1,
      updated_at = now()
  WHERE id = template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get comprehensive user analytics
CREATE OR REPLACE FUNCTION get_user_analytics(user_id uuid)
RETURNS json AS $$
DECLARE
  result json;
  books_this_month integer;
  total_downloads integer;
  avg_quality_score numeric;
  total_credits_used integer;
BEGIN
  -- Books created this month
  SELECT COUNT(*) INTO books_this_month
  FROM books 
  WHERE books.user_id = get_user_analytics.user_id 
    AND created_at >= date_trunc('month', now());

  -- Total downloads across all books
  SELECT COALESCE(SUM(downloads), 0) INTO total_downloads
  FROM books 
  WHERE books.user_id = get_user_analytics.user_id;

  -- Average quality score
  SELECT COALESCE(AVG(quality_score), 0) INTO avg_quality_score
  FROM books 
  WHERE books.user_id = get_user_analytics.user_id 
    AND quality_score IS NOT NULL;

  -- Total credits used this month
  SELECT COALESCE(SUM(credits_used), 0) INTO total_credits_used
  FROM usage_logs 
  WHERE usage_logs.user_id = get_user_analytics.user_id 
    AND created_at >= date_trunc('month', now());

  -- Build result JSON
  result := json_build_object(
    'booksThisMonth', books_this_month,
    'totalDownloads', total_downloads,
    'avgQualityScore', ROUND(avg_quality_score, 1),
    'creditsUsedThisMonth', total_credits_used
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to cleanup old usage logs (keep last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_usage_logs()
RETURNS integer AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM usage_logs 
  WHERE created_at < (now() - interval '90 days');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reset monthly credits
CREATE OR REPLACE FUNCTION reset_monthly_credits()
RETURNS integer AS $$
DECLARE
  reset_count integer;
BEGIN
  UPDATE user_credits 
  SET credits = monthly_limit,
      reset_date = date_trunc('month', now()) + interval '1 month',
      updated_at = now()
  WHERE reset_date <= now()
    AND tier != 'byok'; -- BYOK users don't have credit limits
  
  GET DIAGNOSTICS reset_count = ROW_COUNT;
  RETURN reset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
