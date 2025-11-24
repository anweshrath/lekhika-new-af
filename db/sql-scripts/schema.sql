

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."assign_engine_to_level"("p_level_id" "uuid", "p_engine_id" "uuid", "p_access_type" "text" DEFAULT 'execute'::"text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    -- Create level engine assignment
    INSERT INTO level_engines (level_id, engine_id, access_type)
    VALUES (p_level_id, p_engine_id, p_access_type)
    ON CONFLICT (level_id, engine_id) DO UPDATE SET
        access_type = p_access_type;
END;
$$;


ALTER FUNCTION "public"."assign_engine_to_level"("p_level_id" "uuid", "p_engine_id" "uuid", "p_access_type" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."assign_engine_to_level"("p_level_id" "uuid", "p_engine_id" "uuid", "p_access_type" "text") IS 'Assigns an engine to a level for all users in that level';



CREATE OR REPLACE FUNCTION "public"."assign_engine_to_user"("p_user_id" "uuid", "p_engine_id" "uuid", "p_assigned_by" "uuid" DEFAULT NULL::"uuid") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_api_key text;
    v_engine_data record;
BEGIN
    -- Get engine data
    SELECT * INTO v_engine_data FROM ai_engines WHERE id = p_engine_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Engine not found: %', p_engine_id;
    END IF;
    
    -- Generate API key
    v_api_key := generate_user_engine_api_key(p_user_id, p_engine_id);
    
    -- Create user engine copy
    INSERT INTO user_engines (
        user_id, engine_id, name, description, config, 
        nodes, edges, models, api_key, api_key_created_at
    ) VALUES (
        p_user_id, p_engine_id, v_engine_data.name, v_engine_data.description,
        v_engine_data.config, v_engine_data.nodes, v_engine_data.edges,
        v_engine_data.models, v_api_key, now()
    ) ON CONFLICT (user_id, engine_id) DO UPDATE SET
        api_key = v_api_key,
        api_key_created_at = now(),
        updated_at = now();
    
    RETURN v_api_key;
END;
$$;


ALTER FUNCTION "public"."assign_engine_to_user"("p_user_id" "uuid", "p_engine_id" "uuid", "p_assigned_by" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."assign_engine_to_user"("p_user_id" "uuid", "p_engine_id" "uuid", "p_assigned_by" "uuid") IS 'Assigns an engine to a user and creates their copy';



CREATE OR REPLACE FUNCTION "public"."assign_preference_to_all_engines"("p_user_id" "uuid", "p_preference_id" "uuid", "p_reference_id" "uuid" DEFAULT NULL::"uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
    -- Assign preference to all user's active engines
    INSERT INTO user_engine_preferences (user_id, user_engine_id, preference_id, reference_id)
    SELECT 
        p_user_id,
        ue.id,
        p_preference_id,
        p_reference_id
    FROM user_engines ue
    WHERE ue.user_id = p_user_id 
    AND ue.status = 'active'
    ON CONFLICT (user_id, user_engine_id, preference_id) DO NOTHING;
END;
$$;


ALTER FUNCTION "public"."assign_preference_to_all_engines"("p_user_id" "uuid", "p_preference_id" "uuid", "p_reference_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."assign_preference_to_all_engines"("p_user_id" "uuid", "p_preference_id" "uuid", "p_reference_id" "uuid") IS 'Assigns preference to all user engines';



CREATE OR REPLACE FUNCTION "public"."assign_user_to_level"("p_user_id" "uuid", "p_level_name" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."assign_user_to_level"("p_user_id" "uuid", "p_level_name" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."assign_user_to_level"("p_user_id" "uuid", "p_level_name" "text") IS 'Assigns user to level with validation and auto-engine assignment';



CREATE OR REPLACE FUNCTION "public"."audit_user_access"("p_user_id" "uuid") RETURNS TABLE("user_email" "text", "current_tier" "text", "access_level" integer, "accessible_features_count" bigint, "assigned_engines_count" bigint, "credits_balance" integer, "monthly_limit" integer)
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."audit_user_access"("p_user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."audit_user_access"("p_user_id" "uuid") IS 'Provides comprehensive audit of user access and permissions';



CREATE OR REPLACE FUNCTION "public"."auto_assign_engines_for_level"("p_user_id" "uuid", "p_level_name" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."auto_assign_engines_for_level"("p_user_id" "uuid", "p_level_name" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."check_feature_access"("p_user_id" "uuid", "p_feature_name" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."check_feature_access"("p_user_id" "uuid", "p_feature_name" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."check_feature_access"("p_user_id" "uuid", "p_feature_name" "text") IS 'Enforces feature access based on user tier and level_access table';



CREATE OR REPLACE FUNCTION "public"."check_user_feature_access"("p_user_id" "uuid", "p_feature_name" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."check_user_feature_access"("p_user_id" "uuid", "p_feature_name" "text") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."check_user_feature_access"("p_user_id" "uuid", "p_feature_name" "text") IS 'Checks if a user has access to a specific feature based on their tier';



CREATE OR REPLACE FUNCTION "public"."cleanup_old_usage_logs"() RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  deleted_count integer;
BEGIN
  DELETE FROM usage_logs 
  WHERE created_at < (now() - interval '90 days');
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$;


ALTER FUNCTION "public"."cleanup_old_usage_logs"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_user_engines_for_new_user"("p_user_id" "uuid", "p_tier" "text") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    engine_record record;
BEGIN
    -- Create user engine copies for all engines assigned to their tier
    FOR engine_record IN 
        SELECT e.* FROM ai_engines e
        INNER JOIN level_engines le ON e.id = le.engine_id
        INNER JOIN level_access la ON le.level_name = la.feature_name
        WHERE CASE 
            WHEN p_tier = 'hobby' THEN la.hobby_access = true
            WHEN p_tier = 'pro' THEN la.pro_access = true
            WHEN p_tier = 'macdaddy' THEN la.macdaddy_access = true
            WHEN p_tier = 'byok' THEN la.byok_access = true
            ELSE false
        END
    LOOP
        -- Create user engine copy
        INSERT INTO user_engines (
            user_id,
            engine_id,
            engine_name,
            engine_description,
            engine_config,
            nodes,
            edges,
            models,
            api_key,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            p_user_id,
            engine_record.id,
            engine_record.name,
            engine_record.description,
            engine_record.config,
            engine_record.nodes,
            engine_record.edges,
            engine_record.models,
            'LEKH-2-' || encode(gen_random_bytes(16), 'hex'),
            true,
            now(),
            now()
        );
    END LOOP;
END;
$$;


ALTER FUNCTION "public"."create_user_engines_for_new_user"("p_user_id" "uuid", "p_tier" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_user_session"("p_user_id" "uuid", "p_session_data" "jsonb", "p_expires_at" timestamp with time zone DEFAULT ("now"() + '7 days'::interval)) RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."create_user_session"("p_user_id" "uuid", "p_session_data" "jsonb", "p_expires_at" timestamp with time zone) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."debug_auth_context"() RETURNS TABLE("current_user_id" "uuid", "current_user_email" "text", "superadmin_profile_exists" boolean, "auth_user_exists" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    auth.uid() as current_user_id,
    auth.email() as current_user_email,
    EXISTS(SELECT 1 FROM profiles WHERE email = 'admin@pitcherperfect.com' AND role = 'superadmin') as superadmin_profile_exists,
    EXISTS(SELECT 1 FROM auth.users WHERE email = 'admin@pitcherperfect.com') as auth_user_exists;
END;
$$;


ALTER FUNCTION "public"."debug_auth_context"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."enforce_engine_access"() RETURNS "trigger"
    LANGUAGE "plpgsql"
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


ALTER FUNCTION "public"."enforce_engine_access"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_engine_api_key"("p_user_id" "uuid", "p_engine_id" "uuid") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  v_api_key text;
BEGIN
  -- Generate API key with format: LEKH-2-{user_id_slice}-{engine_id_slice}-{timestamp}-{random}
  v_api_key := 'LEKH-2-' ||
    substr(p_user_id::text, 1, 8) || '-' ||
    substr(p_engine_id::text, 1, 8) || '-' ||
    extract(epoch from now())::text || '-' ||
    substr(md5(random()::text), 1, 16);
  
  RETURN v_api_key;
END;
$$;


ALTER FUNCTION "public"."generate_engine_api_key"("p_user_id" "uuid", "p_engine_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_user_engine_api_key"("p_user_id" "uuid", "p_engine_id" "uuid") RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    v_api_key text;
BEGIN
    -- Generate LEKH-2- prefixed API key
    v_api_key := 'LEKH-2-' || 
                 substr(p_user_id::text, 1, 8) || '-' ||
                 substr(p_engine_id::text, 1, 8) || '-' ||
                 to_char(now(), 'YYYYMMDDHH24MISS') || '-' ||
                 substr(md5(random()::text), 1, 8);
    
    RETURN v_api_key;
END;
$$;


ALTER FUNCTION "public"."generate_user_engine_api_key"("p_user_id" "uuid", "p_engine_id" "uuid") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."admin_config" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "config_type" "text" NOT NULL,
    "config_data" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."admin_config" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_admin_config_direct"("p_config_type" "text") RETURNS "public"."admin_config"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  result admin_config;
BEGIN
  SELECT * INTO result
  FROM admin_config
  WHERE config_type = p_config_type;
  
  RETURN result;
END;
$$;


ALTER FUNCTION "public"."get_admin_config_direct"("p_config_type" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_access_level"("user_id" "uuid") RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN (
    SELECT access_level 
    FROM public.users 
    WHERE id = user_id
  );
END;
$$;


ALTER FUNCTION "public"."get_user_access_level"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_accessible_features"("p_user_id" "uuid") RETURNS TABLE("feature_name" "text", "feature_category" "text", "feature_description" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."get_user_accessible_features"("p_user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_user_accessible_features"("p_user_id" "uuid") IS 'Returns all features accessible to a user based on their tier';



CREATE OR REPLACE FUNCTION "public"."get_user_analytics"("user_id" "uuid") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."get_user_analytics"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_global_preferences"("p_user_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_preferences jsonb := '{}';
    v_references jsonb := '[]';
BEGIN
    -- Get user preferences
    SELECT jsonb_object_agg(preference_name, preference_value) INTO v_preferences
    FROM user_preferences 
    WHERE user_id = p_user_id AND is_active = true;
    
    -- Get user references
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', id,
            'name', name,
            'description', description,
            'file_type', file_type,
            'content_summary', content_summary
        )
    ) INTO v_references
    FROM user_references 
    WHERE user_id = p_user_id AND is_active = true;
    
    RETURN jsonb_build_object(
        'preferences', COALESCE(v_preferences, '{}'),
        'references', COALESCE(v_references, '[]')
    );
END;
$$;


ALTER FUNCTION "public"."get_user_global_preferences"("p_user_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_user_global_preferences"("p_user_id" "uuid") IS 'Gets user global preferences and references';



CREATE OR REPLACE FUNCTION "public"."get_user_tier_info"("user_id" "uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."get_user_tier_info"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_user_delete"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  DELETE FROM public.users WHERE id = OLD.id;
  RETURN OLD;
END;
$$;


ALTER FUNCTION "public"."handle_user_delete"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_user_update"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."handle_user_update"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."hash_password"("p_password" "text") RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN crypt(p_password, gen_salt('bf'));
END;
$$;


ALTER FUNCTION "public"."hash_password"("p_password" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_template_usage"("template_id" "uuid") RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE book_templates 
  SET usage_count = usage_count + 1,
      updated_at = now()
  WHERE id = template_id;
END;
$$;


ALTER FUNCTION "public"."increment_template_usage"("template_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."increment_usage_count"() RETURNS integer
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN COALESCE(NEW.usage_count, 0) + 1;
END;
$$;


ALTER FUNCTION "public"."increment_usage_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_admin_action"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.role != NEW.role THEN
    INSERT INTO admin_actions (admin_id, action_type, target_type, target_id, details)
    VALUES (
      auth.uid(),
      'role_change',
      'user',
      NEW.id,
      jsonb_build_object('old_role', OLD.role, 'new_role', NEW.role)
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;


ALTER FUNCTION "public"."log_admin_action"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."logout_user_session"("p_session_id" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE public.user_sessions 
  SET is_active = false
  WHERE id = p_session_id;
  
  RETURN FOUND;
END;
$$;


ALTER FUNCTION "public"."logout_user_session"("p_session_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."reset_monthly_credits"() RETURNS integer
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."reset_monthly_credits"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_master_engine_to_users"("p_master_engine_id" "uuid", "p_sync_type" "text", "p_sync_details" "jsonb" DEFAULT '{}'::"jsonb", "p_synced_by" "uuid" DEFAULT NULL::"uuid") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
    v_sync_log_id uuid;
    v_affected_count integer := 0;
    v_master_engine record;
    v_user_engine record;
BEGIN
    -- Get master engine data
    SELECT * INTO v_master_engine FROM ai_engines WHERE id = p_master_engine_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Master engine not found: %', p_master_engine_id;
    END IF;
    
    -- Create sync log entry
    INSERT INTO master_sync_log (
        master_engine_id, synced_by, sync_type, sync_details, sync_status
    ) VALUES (
        p_master_engine_id, p_synced_by, p_sync_type, p_sync_details, 'in_progress'
    ) RETURNING id INTO v_sync_log_id;
    
    -- Update user engine copies based on sync type
    FOR v_user_engine IN 
        SELECT * FROM user_engines WHERE engine_id = p_master_engine_id AND status = 'active'
    LOOP
        CASE p_sync_type
            WHEN 'description' THEN
                UPDATE user_engines SET 
                    description = v_master_engine.description,
                    updated_at = now()
                WHERE id = v_user_engine.id;
                
            WHEN 'models' THEN
                UPDATE user_engines SET 
                    models = v_master_engine.models,
                    updated_at = now()
                WHERE id = v_user_engine.id;
                
            WHEN 'config' THEN
                UPDATE user_engines SET 
                    config = v_master_engine.config,
                    updated_at = now()
                WHERE id = v_user_engine.id;
                
            WHEN 'nodes' THEN
                UPDATE user_engines SET 
                    nodes = v_master_engine.nodes,
                    updated_at = now()
                WHERE id = v_user_engine.id;
                
            WHEN 'full' THEN
                UPDATE user_engines SET 
                    name = v_master_engine.name,
                    description = v_master_engine.description,
                    config = v_master_engine.config,
                    nodes = v_master_engine.nodes,
                    edges = v_master_engine.edges,
                    models = v_master_engine.models,
                    updated_at = now()
                WHERE id = v_user_engine.id;
                
            ELSE
                RAISE EXCEPTION 'Invalid sync type: %', p_sync_type;
        END CASE;
        
        v_affected_count := v_affected_count + 1;
    END LOOP;
    
    -- Update sync log with results
    UPDATE master_sync_log SET 
        sync_status = 'completed',
        affected_user_engines = v_affected_count,
        completed_at = now()
    WHERE id = v_sync_log_id;
    
    RETURN jsonb_build_object(
        'sync_log_id', v_sync_log_id,
        'affected_count', v_affected_count,
        'status', 'completed'
    );
END;
$$;


ALTER FUNCTION "public"."sync_master_engine_to_users"("p_master_engine_id" "uuid", "p_sync_type" "text", "p_sync_details" "jsonb", "p_synced_by" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."sync_master_engine_to_users"("p_master_engine_id" "uuid", "p_sync_type" "text", "p_sync_details" "jsonb", "p_synced_by" "uuid") IS 'Syncs master engine changes to all user copies';



CREATE OR REPLACE FUNCTION "public"."trigger_create_user_engines"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    -- Only create engines if user has a tier assigned
    IF NEW.tier IS NOT NULL THEN
        PERFORM create_user_engines_for_new_user(NEW.id, NEW.tier);
    END IF;
    
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."trigger_create_user_engines"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_admin_config_direct"("p_config_type" "text", "p_config_data" "jsonb", "p_created_by" "uuid" DEFAULT '11111111-1111-1111-1111-111111111111'::"uuid") RETURNS "public"."admin_config"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  result admin_config;
BEGIN
  INSERT INTO admin_config (
    config_type,
    config_data,
    created_by,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    p_config_type,
    p_config_data,
    p_created_by,
    true,
    now(),
    now()
  ) ON CONFLICT (config_type) DO UPDATE SET
    config_data = p_config_data,
    updated_at = now(),
    is_active = true,
    created_by = p_created_by
  RETURNING * INTO result;
  
  RETURN result;
END;
$$;


ALTER FUNCTION "public"."update_admin_config_direct"("p_config_type" "text", "p_config_data" "jsonb", "p_created_by" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_advanced_workflows_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_advanced_workflows_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_ai_providers_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_ai_providers_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_level_access_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_level_access_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_prompt_templates_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_prompt_templates_updated_at"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_system_stats"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  UPDATE system_stats SET
    total_users = (SELECT COUNT(*) FROM profiles),
    active_users = (SELECT COUNT(*) FROM profiles WHERE last_sign_in_at > now() - interval '30 days'),
    total_projects = (SELECT COUNT(*) FROM projects),
    last_updated = now()
  WHERE id = (SELECT id FROM system_stats LIMIT 1);
END;
$$;


ALTER FUNCTION "public"."update_system_stats"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."user_has_feature"("user_id" "uuid", "feature" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN (
    SELECT features_enabled ? feature
    FROM public.users 
    WHERE id = user_id
  );
END;
$$;


ALTER FUNCTION "public"."user_has_feature"("user_id" "uuid", "feature" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_tier_upgrade"("p_user_id" "uuid", "p_new_tier" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."validate_tier_upgrade"("p_user_id" "uuid", "p_new_tier" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."validate_user_session"("p_session_id" "text") RETURNS TABLE("user_id" "uuid", "session_data" "jsonb", "is_valid" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
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


ALTER FUNCTION "public"."validate_user_session"("p_session_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."verify_password"("p_password" "text", "p_hash" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN crypt(p_password, p_hash) = p_hash;
END;
$$;


ALTER FUNCTION "public"."verify_password"("p_password" "text", "p_hash" "text") OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."OLD_level_access" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "feature_name" character varying(100) NOT NULL,
    "feature_category" character varying(50) NOT NULL,
    "feature_description" "text",
    "hobby_access" boolean DEFAULT false,
    "pro_access" boolean DEFAULT false,
    "macdaddy_access" boolean DEFAULT true,
    "byok_access" boolean DEFAULT true,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."OLD_level_access" OWNER TO "postgres";


COMMENT ON TABLE "public"."OLD_level_access" IS 'to be deleted post production';



CREATE TABLE IF NOT EXISTS "public"."admin_actions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "admin_id" "uuid",
    "action_type" "text" NOT NULL,
    "target_type" "text",
    "target_id" "uuid",
    "details" "jsonb",
    "ip_address" "inet",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."admin_actions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."admin_audit_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "admin_user_id" "uuid",
    "action" "text" NOT NULL,
    "resource_type" "text",
    "resource_id" "uuid",
    "old_values" "jsonb",
    "new_values" "jsonb",
    "ip_address" "inet",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."admin_audit_log" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."admin_sessions" (
    "id" "text" NOT NULL,
    "admin_id" "uuid" NOT NULL,
    "session_data" "jsonb" NOT NULL,
    "is_active" boolean DEFAULT true,
    "expires_at" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."admin_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."advanced_workflow_executions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workflow_id" "uuid",
    "user_id" "uuid",
    "status" "text" DEFAULT 'pending'::"text",
    "progress" integer DEFAULT 0,
    "current_step" integer DEFAULT 0,
    "input_data" "jsonb" DEFAULT '{}'::"jsonb",
    "output_data" "jsonb" DEFAULT '{}'::"jsonb",
    "step_results" "jsonb" DEFAULT '[]'::"jsonb",
    "error_message" "text",
    "started_at" timestamp with time zone DEFAULT "now"(),
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "advanced_workflow_executions_progress_check" CHECK ((("progress" >= 0) AND ("progress" <= 100))),
    CONSTRAINT "advanced_workflow_executions_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'running'::"text", 'completed'::"text", 'failed'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."advanced_workflow_executions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."advanced_workflows" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "category" "text" DEFAULT 'custom'::"text",
    "steps" "jsonb" DEFAULT '[]'::"jsonb",
    "nodes" "jsonb" DEFAULT '[]'::"jsonb",
    "connections" "jsonb" DEFAULT '[]'::"jsonb",
    "settings" "jsonb" DEFAULT '{}'::"jsonb",
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "metadata" "jsonb" DEFAULT '{}'::"jsonb"
);


ALTER TABLE "public"."advanced_workflows" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_api_keys" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "service" "text" NOT NULL,
    "encrypted_key" "text" NOT NULL,
    "is_active" boolean DEFAULT true,
    "last_used" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "ai_api_keys_service_check" CHECK (("service" = ANY (ARRAY['openai'::"text", 'claude'::"text", 'gemini'::"text", 'mistral'::"text", 'grok'::"text", 'perplexity'::"text"])))
);


ALTER TABLE "public"."ai_api_keys" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_engine_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "engine_name" "text" NOT NULL,
    "request_count" integer DEFAULT 0,
    "total_cost" numeric DEFAULT 0,
    "avg_response_time" numeric DEFAULT 0,
    "success_rate" numeric DEFAULT 0,
    "status" "text" DEFAULT 'active'::"text",
    "uptime_percentage" numeric DEFAULT 0,
    "last_request" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."ai_engine_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_engine_stats" (
    "id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "status" "text" DEFAULT 'active'::"text",
    "requests_today" integer DEFAULT 0,
    "total_requests" integer DEFAULT 0,
    "cost_today" numeric(10,6) DEFAULT 0,
    "total_cost" numeric(10,6) DEFAULT 0,
    "uptime" numeric(5,2) DEFAULT 99.0,
    "avg_response_time" integer DEFAULT 0,
    "last_updated" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "ai_engine_stats_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'inactive'::"text", 'maintenance'::"text", 'error'::"text"])))
);


ALTER TABLE "public"."ai_engine_stats" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_engines" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "flow_config" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "models" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "execution_mode" "text" DEFAULT 'sequential'::"text",
    "tier" "text",
    "active" boolean DEFAULT true,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "api_key" "text",
    "api_key_created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "ai_engines_execution_mode_check" CHECK (("execution_mode" = ANY (ARRAY['sequential'::"text", 'parallel'::"text"]))),
    CONSTRAINT "ai_engines_tier_check" CHECK (("tier" = ANY (ARRAY['hobby'::"text", 'pro'::"text", 'enterprise'::"text"])))
);


ALTER TABLE "public"."ai_engines" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_flows" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "type" "text" NOT NULL,
    "steps" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "configurations" "jsonb" DEFAULT '{}'::"jsonb",
    "parameters" "jsonb" DEFAULT '{}'::"jsonb",
    "models" "jsonb" DEFAULT '{}'::"jsonb",
    "is_default" boolean DEFAULT false,
    "usage_count" integer DEFAULT 0,
    "last_used" timestamp with time zone,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "nodes" "jsonb" DEFAULT '[]'::"jsonb",
    "edges" "jsonb" DEFAULT '[]'::"jsonb",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    CONSTRAINT "ai_flows_type_check" CHECK (("type" = ANY (ARRAY['simplified'::"text", 'expert'::"text", 'full'::"text", 'book_generation'::"text"])))
);


ALTER TABLE "public"."ai_flows" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_model_metadata" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "provider" "text" NOT NULL,
    "model_name" "text" NOT NULL,
    "model_id" "text" NOT NULL,
    "input_cost_per_million" numeric(10,4) DEFAULT 0,
    "output_cost_per_million" numeric(10,4) DEFAULT 0,
    "context_window_tokens" integer,
    "specialties" "text"[],
    "tokens_per_page" integer DEFAULT 500,
    "pages_per_million_tokens" numeric(10,2) GENERATED ALWAYS AS (
CASE
    WHEN ("tokens_per_page" > 0) THEN (1000000.0 / ("tokens_per_page")::numeric)
    ELSE NULL::numeric
END) STORED,
    "description" "text",
    "is_active" boolean DEFAULT true,
    "last_updated" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    "metadata" "jsonb",
    "user_id" "uuid",
    "key_name" "text",
    "key_model" "text"
);


ALTER TABLE "public"."ai_model_metadata" OWNER TO "postgres";


COMMENT ON COLUMN "public"."ai_model_metadata"."key_name" IS 'The unique key identifier from ai_providers.name (e.g., OPENA-02-2222, MISTR-01-1)';



COMMENT ON COLUMN "public"."ai_model_metadata"."key_model" IS 'Combined key_name + model_name for unique model identification (e.g., OPENA-02-2222_gpt-4o)';



CREATE TABLE IF NOT EXISTS "public"."ai_providers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "provider" "text" NOT NULL,
    "api_key" "text" NOT NULL,
    "model" "text" NOT NULL,
    "is_active" boolean DEFAULT true,
    "failures" integer DEFAULT 0 NOT NULL,
    "last_used" timestamp with time zone,
    "usage_count" integer DEFAULT 0 NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "name" character varying(255) NOT NULL,
    "description" "text"
);


ALTER TABLE "public"."ai_providers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_request_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "engine_id" "text" NOT NULL,
    "user_id" "uuid",
    "tokens_used" integer DEFAULT 0,
    "cost" numeric(10,6) DEFAULT 0,
    "response_time_ms" integer DEFAULT 0,
    "success" boolean DEFAULT true,
    "error_message" "text",
    "timestamp" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."ai_request_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_service_configs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "service_id" "uuid" NOT NULL,
    "config_key" "text" NOT NULL,
    "config_value" "jsonb" NOT NULL,
    "description" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."ai_service_configs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_services" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "provider" "text" NOT NULL,
    "is_active" boolean DEFAULT true,
    "api_endpoint" "text",
    "model_name" "text" NOT NULL,
    "max_tokens" integer DEFAULT 4000,
    "temperature" numeric(3,2) DEFAULT 0.7,
    "pricing_per_1k_tokens" numeric(10,4) DEFAULT 0.002,
    "rate_limit_per_minute" integer DEFAULT 60,
    "capabilities" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "ai_services_provider_check" CHECK (("provider" = ANY (ARRAY['openai'::"text", 'claude'::"text", 'gemini'::"text"])))
);


ALTER TABLE "public"."ai_services" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."book_sections" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "book_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "content" "text",
    "section_type" "text" DEFAULT 'chapter'::"text",
    "section_order" integer NOT NULL,
    "word_count" integer DEFAULT 0,
    "ai_generated" boolean DEFAULT true,
    "ai_service" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "book_sections_ai_service_check" CHECK (("ai_service" = ANY (ARRAY['openai'::"text", 'claude'::"text", 'gemini'::"text"]))),
    CONSTRAINT "book_sections_section_type_check" CHECK (("section_type" = ANY (ARRAY['introduction'::"text", 'chapter'::"text", 'conclusion'::"text", 'appendix'::"text"])))
);


ALTER TABLE "public"."book_sections" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."book_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "type" "text" NOT NULL,
    "niche" "text",
    "structure" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "is_premium" boolean DEFAULT false,
    "created_by" "uuid",
    "is_public" boolean DEFAULT true,
    "usage_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "book_templates_type_check" CHECK (("type" = ANY (ARRAY['ebook'::"text", 'guide'::"text", 'manual'::"text", 'course'::"text", 'report'::"text"])))
);


ALTER TABLE "public"."book_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."books" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "type" "text" NOT NULL,
    "niche" "text",
    "target_audience" "text",
    "tone" "text" DEFAULT 'professional'::"text",
    "status" "text" DEFAULT 'draft'::"text",
    "content" "jsonb" DEFAULT '{}'::"jsonb",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "ai_service" "text",
    "quality_score" integer,
    "ai_detection_score" integer,
    "word_count" integer DEFAULT 0,
    "downloads" integer DEFAULT 0,
    "is_public" boolean DEFAULT false,
    "cover_image_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "books_ai_detection_score_check" CHECK ((("ai_detection_score" >= 0) AND ("ai_detection_score" <= 100))),
    CONSTRAINT "books_ai_service_check" CHECK (("ai_service" = ANY (ARRAY['openai'::"text", 'claude'::"text", 'gemini'::"text"]))),
    CONSTRAINT "books_quality_score_check" CHECK ((("quality_score" >= 0) AND ("quality_score" <= 100))),
    CONSTRAINT "books_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'generating'::"text", 'completed'::"text", 'published'::"text", 'archived'::"text"]))),
    CONSTRAINT "books_type_check" CHECK (("type" = ANY (ARRAY['ebook'::"text", 'guide'::"text", 'manual'::"text", 'course'::"text", 'report'::"text"])))
);


ALTER TABLE "public"."books" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."engine_executions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "engine_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "book_id" "uuid",
    "execution_data" "jsonb" DEFAULT '{}'::"jsonb",
    "status" "text" DEFAULT 'running'::"text",
    "error_message" "text",
    "execution_time_ms" integer,
    "tokens_used" integer DEFAULT 0,
    "cost_estimate" numeric(10,4) DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "completed_at" timestamp with time zone,
    CONSTRAINT "engine_executions_status_check" CHECK (("status" = ANY (ARRAY['running'::"text", 'completed'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."engine_executions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."feature_flags" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "flag_name" "text" NOT NULL,
    "is_enabled" boolean DEFAULT false,
    "user_tiers" "text"[] DEFAULT ARRAY['free'::"text", 'standard'::"text", 'expert'::"text", 'byok'::"text"],
    "rollout_percentage" integer DEFAULT 100,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "feature_flags_rollout_percentage_check" CHECK ((("rollout_percentage" >= 0) AND ("rollout_percentage" <= 100)))
);


ALTER TABLE "public"."feature_flags" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."level_access" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "level_id" "uuid",
    "level_name" "text" NOT NULL,
    "ebook_creation" boolean DEFAULT false,
    "report_creation" boolean DEFAULT false,
    "guide_creation" boolean DEFAULT false,
    "manual_creation" boolean DEFAULT false,
    "fiction_creation" boolean DEFAULT false,
    "autobiography_creation" boolean DEFAULT false,
    "whitepaper_creation" boolean DEFAULT false,
    "blog_post_creation" boolean DEFAULT false,
    "email_sequence_creation" boolean DEFAULT false,
    "social_media_creation" boolean DEFAULT false,
    "gpt4_access" boolean DEFAULT false,
    "claude_access" boolean DEFAULT false,
    "gemini_access" boolean DEFAULT false,
    "custom_model_access" boolean DEFAULT false,
    "pdf_export" boolean DEFAULT false,
    "epub_export" boolean DEFAULT false,
    "docx_export" boolean DEFAULT false,
    "html_export" boolean DEFAULT false,
    "markdown_export" boolean DEFAULT false,
    "txt_export" boolean DEFAULT false,
    "custom_workflow_creation" boolean DEFAULT false,
    "workflow_sharing" boolean DEFAULT false,
    "workflow_templates" boolean DEFAULT false,
    "multi_chapter_books" boolean DEFAULT false,
    "single_chapter_books" boolean DEFAULT false,
    "image_generation" boolean DEFAULT false,
    "cover_design" boolean DEFAULT false,
    "table_of_contents" boolean DEFAULT false,
    "chapter_outlines" boolean DEFAULT false,
    "bibliography_generation" boolean DEFAULT false,
    "index_generation" boolean DEFAULT false,
    "company_watermark" boolean DEFAULT false,
    "custom_branding" boolean DEFAULT false,
    "white_label" boolean DEFAULT false,
    "custom_domain" boolean DEFAULT false,
    "usage_analytics" boolean DEFAULT false,
    "token_tracking" boolean DEFAULT false,
    "cost_tracking" boolean DEFAULT false,
    "performance_metrics" boolean DEFAULT false,
    "user_behavior_analytics" boolean DEFAULT false,
    "team_collaboration" boolean DEFAULT false,
    "user_management" boolean DEFAULT false,
    "role_based_access" boolean DEFAULT false,
    "comment_system" boolean DEFAULT false,
    "api_access" boolean DEFAULT false,
    "webhook_support" boolean DEFAULT false,
    "third_party_integration" boolean DEFAULT false,
    "custom_integrations" boolean DEFAULT false,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."level_access" OWNER TO "postgres";


COMMENT ON TABLE "public"."level_access" IS 'Level access permissions with features as columns - 4 levels: hobby, pro, macdaddy, byok';



COMMENT ON COLUMN "public"."level_access"."level_id" IS 'Foreign key to levels table';



COMMENT ON COLUMN "public"."level_access"."level_name" IS 'Level name for reference';



COMMENT ON COLUMN "public"."level_access"."ebook_creation" IS 'Access to eBook creation feature';



COMMENT ON COLUMN "public"."level_access"."report_creation" IS 'Access to report creation feature';



COMMENT ON COLUMN "public"."level_access"."guide_creation" IS 'Access to guide creation feature';



COMMENT ON COLUMN "public"."level_access"."manual_creation" IS 'Access to manual creation feature';



COMMENT ON COLUMN "public"."level_access"."fiction_creation" IS 'Access to fiction creation feature';



COMMENT ON COLUMN "public"."level_access"."autobiography_creation" IS 'Access to autobiography creation feature';



COMMENT ON COLUMN "public"."level_access"."whitepaper_creation" IS 'Access to whitepaper creation feature';



COMMENT ON COLUMN "public"."level_access"."blog_post_creation" IS 'Access to blog post creation feature';



COMMENT ON COLUMN "public"."level_access"."email_sequence_creation" IS 'Access to email sequence creation feature';



COMMENT ON COLUMN "public"."level_access"."social_media_creation" IS 'Access to social media creation feature';



COMMENT ON COLUMN "public"."level_access"."gpt4_access" IS 'Access to GPT-4 models';



COMMENT ON COLUMN "public"."level_access"."claude_access" IS 'Access to Claude models';



COMMENT ON COLUMN "public"."level_access"."gemini_access" IS 'Access to Gemini models';



COMMENT ON COLUMN "public"."level_access"."custom_model_access" IS 'Access to custom models';



COMMENT ON COLUMN "public"."level_access"."pdf_export" IS 'Access to PDF export';



COMMENT ON COLUMN "public"."level_access"."epub_export" IS 'Access to EPUB export';



COMMENT ON COLUMN "public"."level_access"."docx_export" IS 'Access to DOCX export';



COMMENT ON COLUMN "public"."level_access"."html_export" IS 'Access to HTML export';



COMMENT ON COLUMN "public"."level_access"."markdown_export" IS 'Access to Markdown export';



COMMENT ON COLUMN "public"."level_access"."txt_export" IS 'Access to TXT export';



COMMENT ON COLUMN "public"."level_access"."custom_workflow_creation" IS 'Access to custom workflow creation';



COMMENT ON COLUMN "public"."level_access"."workflow_sharing" IS 'Access to workflow sharing';



COMMENT ON COLUMN "public"."level_access"."workflow_templates" IS 'Access to workflow templates';



COMMENT ON COLUMN "public"."level_access"."multi_chapter_books" IS 'Access to multi-chapter books';



COMMENT ON COLUMN "public"."level_access"."single_chapter_books" IS 'Access to single chapter books';



COMMENT ON COLUMN "public"."level_access"."image_generation" IS 'Access to image generation';



COMMENT ON COLUMN "public"."level_access"."cover_design" IS 'Access to cover design';



COMMENT ON COLUMN "public"."level_access"."table_of_contents" IS 'Access to table of contents generation';



COMMENT ON COLUMN "public"."level_access"."chapter_outlines" IS 'Access to chapter outlines generation';



COMMENT ON COLUMN "public"."level_access"."bibliography_generation" IS 'Access to bibliography generation';



COMMENT ON COLUMN "public"."level_access"."index_generation" IS 'Access to index generation';



COMMENT ON COLUMN "public"."level_access"."company_watermark" IS 'Access to company watermark';



COMMENT ON COLUMN "public"."level_access"."custom_branding" IS 'Access to custom branding';



COMMENT ON COLUMN "public"."level_access"."white_label" IS 'Access to white label solution';



COMMENT ON COLUMN "public"."level_access"."custom_domain" IS 'Access to custom domain';



COMMENT ON COLUMN "public"."level_access"."usage_analytics" IS 'Access to usage analytics';



COMMENT ON COLUMN "public"."level_access"."token_tracking" IS 'Access to token tracking';



COMMENT ON COLUMN "public"."level_access"."cost_tracking" IS 'Access to cost tracking';



COMMENT ON COLUMN "public"."level_access"."performance_metrics" IS 'Access to performance metrics';



COMMENT ON COLUMN "public"."level_access"."user_behavior_analytics" IS 'Access to user behavior analytics';



COMMENT ON COLUMN "public"."level_access"."team_collaboration" IS 'Access to team collaboration';



COMMENT ON COLUMN "public"."level_access"."user_management" IS 'Access to user management';



COMMENT ON COLUMN "public"."level_access"."role_based_access" IS 'Access to role-based access control';



COMMENT ON COLUMN "public"."level_access"."comment_system" IS 'Access to comment system';



COMMENT ON COLUMN "public"."level_access"."api_access" IS 'Access to API';



COMMENT ON COLUMN "public"."level_access"."webhook_support" IS 'Access to webhook support';



COMMENT ON COLUMN "public"."level_access"."third_party_integration" IS 'Access to third-party integrations';



COMMENT ON COLUMN "public"."level_access"."custom_integrations" IS 'Access to custom integrations';



CREATE TABLE IF NOT EXISTS "public"."level_access_backup" (
    "id" "uuid",
    "feature_name" character varying(100),
    "feature_category" character varying(50),
    "feature_description" "text",
    "hobby_access" boolean,
    "pro_access" boolean,
    "macdaddy_access" boolean,
    "byok_access" boolean,
    "is_active" boolean,
    "created_at" timestamp with time zone,
    "updated_at" timestamp with time zone
);


ALTER TABLE "public"."level_access_backup" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."level_analytics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "level_id" "uuid" NOT NULL,
    "metric_name" character varying(255) NOT NULL,
    "metric_value" numeric(15,4) NOT NULL,
    "metric_unit" character varying(50),
    "period_start" timestamp with time zone NOT NULL,
    "period_end" timestamp with time zone NOT NULL,
    "user_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."level_analytics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."level_benefits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "level_id" "uuid" NOT NULL,
    "benefit_title" character varying(255) NOT NULL,
    "benefit_description" "text",
    "benefit_icon" character varying(100),
    "benefit_order" integer DEFAULT 0,
    "is_highlighted" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."level_benefits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."level_comparison" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "level_id" "uuid" NOT NULL,
    "comparison_feature" character varying(255) NOT NULL,
    "feature_value" "text" NOT NULL,
    "feature_type" character varying(50) DEFAULT 'text'::character varying,
    "is_highlighted" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."level_comparison" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."level_engines" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "level_id" "uuid" NOT NULL,
    "engine_id" "uuid" NOT NULL,
    "access_type" "text" DEFAULT 'execute'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "level_name" "text",
    CONSTRAINT "level_engines_access_type_check" CHECK (("access_type" = ANY (ARRAY['read'::"text", 'execute'::"text"])))
);


ALTER TABLE "public"."level_engines" OWNER TO "postgres";


COMMENT ON TABLE "public"."level_engines" IS 'Level-based engine access permissions';



CREATE TABLE IF NOT EXISTS "public"."level_feature_usage" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "level_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "feature_name" character varying(255) NOT NULL,
    "usage_count" integer DEFAULT 1,
    "usage_date" "date" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."level_feature_usage" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."level_features" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "level_id" "uuid" NOT NULL,
    "feature_name" character varying(255) NOT NULL,
    "feature_category" character varying(255) NOT NULL,
    "is_enabled" boolean DEFAULT true,
    "usage_limit" integer,
    "usage_period" character varying(50),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."level_features" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."level_pricing" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "level_id" "uuid" NOT NULL,
    "pricing_type" character varying(50) NOT NULL,
    "price" numeric(10,2) NOT NULL,
    "currency" character varying(3) DEFAULT 'USD'::character varying,
    "billing_cycle" character varying(50),
    "is_recurring" boolean DEFAULT false,
    "trial_days" integer DEFAULT 0,
    "trial_credits" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."level_pricing" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."level_restrictions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "level_id" "uuid" NOT NULL,
    "restriction_type" character varying(100) NOT NULL,
    "restriction_value" "text" NOT NULL,
    "restriction_description" "text",
    "is_enforced" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."level_restrictions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."level_upgrade_paths" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "from_level_id" "uuid" NOT NULL,
    "to_level_id" "uuid" NOT NULL,
    "upgrade_type" character varying(50) DEFAULT 'standard'::character varying,
    "discount_percentage" numeric(5,2) DEFAULT 0,
    "upgrade_message" "text",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."level_upgrade_paths" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."levels" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "display_name" character varying(255) NOT NULL,
    "description" "text",
    "tier_level" integer NOT NULL,
    "credits_monthly" integer DEFAULT 0 NOT NULL,
    "credits_total" integer DEFAULT 0 NOT NULL,
    "monthly_limit" integer DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true,
    "is_featured" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "level_id" "uuid" DEFAULT "gen_random_uuid"()
);


ALTER TABLE "public"."levels" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."master_sync_log" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "master_engine_id" "uuid" NOT NULL,
    "synced_by" "uuid" NOT NULL,
    "sync_type" "text" NOT NULL,
    "sync_details" "jsonb" DEFAULT '{}'::"jsonb",
    "affected_user_engines" integer DEFAULT 0,
    "sync_status" "text" DEFAULT 'pending'::"text",
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "completed_at" timestamp with time zone,
    CONSTRAINT "master_sync_log_sync_status_check" CHECK (("sync_status" = ANY (ARRAY['pending'::"text", 'in_progress'::"text", 'completed'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."master_sync_log" OWNER TO "postgres";


COMMENT ON TABLE "public"."master_sync_log" IS 'Tracks master engine sync operations';



CREATE TABLE IF NOT EXISTS "public"."old_ai_workflows" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "nodes" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "connections" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_by" "uuid",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "usage_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."old_ai_workflows" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."old_engine_api_keys" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "engine_id" "uuid" NOT NULL,
    "api_key" "text" NOT NULL,
    "key_type" "text" DEFAULT 'engine_access'::"text",
    "permissions" "text"[] DEFAULT ARRAY['execute'::"text", 'read'::"text"],
    "is_active" boolean DEFAULT true,
    "usage_count" integer DEFAULT 0,
    "last_used" timestamp with time zone,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "engine_api_keys_key_type_check" CHECK (("key_type" = ANY (ARRAY['engine_access'::"text", 'admin'::"text", 'system'::"text"])))
);


ALTER TABLE "public"."old_engine_api_keys" OWNER TO "postgres";


COMMENT ON TABLE "public"."old_engine_api_keys" IS 'API keys for engine access with LEKH-2- prefix';



CREATE TABLE IF NOT EXISTS "public"."old_engine_assignments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "engine_id" "uuid" NOT NULL,
    "assignment_type" "text" NOT NULL,
    "tier" "text",
    "user_id" "uuid",
    "priority" integer DEFAULT 0,
    "active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "engine_assignments_assignment_type_check" CHECK (("assignment_type" = ANY (ARRAY['tier'::"text", 'user'::"text"]))),
    CONSTRAINT "engine_assignments_tier_check" CHECK (("tier" = ANY (ARRAY['hobby'::"text", 'pro'::"text", 'enterprise'::"text"]))),
    CONSTRAINT "valid_assignment" CHECK (((("assignment_type" = 'tier'::"text") AND ("tier" IS NOT NULL) AND ("user_id" IS NULL)) OR (("assignment_type" = 'user'::"text") AND ("user_id" IS NOT NULL) AND ("tier" IS NULL))))
);


ALTER TABLE "public"."old_engine_assignments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."old_level_workflow_assignments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "level_id" "uuid" NOT NULL,
    "workflow_id" "uuid" NOT NULL,
    "assignment_type" character varying(50) DEFAULT 'included'::character varying,
    "usage_limit" integer,
    "priority" integer DEFAULT 1,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."old_level_workflow_assignments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."old_user_ai_models" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "service" "text" NOT NULL,
    "model_id" "text" NOT NULL,
    "model_name" "text" NOT NULL,
    "max_tokens" integer DEFAULT 2000,
    "is_default" boolean DEFAULT false,
    "is_active" boolean DEFAULT true,
    "last_used" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "user_ai_models_service_check" CHECK (("service" = ANY (ARRAY['openai'::"text", 'claude'::"text", 'gemini'::"text", 'mistral'::"text", 'grok'::"text", 'perplexity'::"text"])))
);


ALTER TABLE "public"."old_user_ai_models" OWNER TO "postgres";


COMMENT ON TABLE "public"."old_user_ai_models" IS 'User-specific AI model selections and preferences';



COMMENT ON COLUMN "public"."old_user_ai_models"."is_default" IS 'Whether this model is the default for the service';



CREATE TABLE IF NOT EXISTS "public"."old_user_api_keys" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "service" "text" NOT NULL,
    "encrypted_key" "text" NOT NULL,
    "is_active" boolean DEFAULT true,
    "last_used" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "user_api_keys_service_check" CHECK (("service" = ANY (ARRAY['openai'::"text", 'claude'::"text", 'gemini'::"text"])))
);


ALTER TABLE "public"."old_user_api_keys" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."old_user_credits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "credits" integer DEFAULT 1000,
    "tier" "text" DEFAULT 'free'::"text",
    "monthly_limit" integer DEFAULT 1000,
    "reset_date" timestamp with time zone DEFAULT ("date_trunc"('month'::"text", "now"()) + '1 mon'::interval),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "user_credits_credits_check" CHECK (("credits" >= 0)),
    CONSTRAINT "user_credits_tier_check" CHECK (("tier" = ANY (ARRAY['free'::"text", 'standard'::"text", 'expert'::"text", 'byok'::"text"])))
);


ALTER TABLE "public"."old_user_credits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."old_user_flows" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "type" "text" NOT NULL,
    "flow_config" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "models" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "parameters" "jsonb" DEFAULT '{}'::"jsonb",
    "is_default" boolean DEFAULT false,
    "usage_count" integer DEFAULT 0,
    "last_used" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "user_flows_type_check" CHECK (("type" = ANY (ARRAY['simplified'::"text", 'expert'::"text", 'full'::"text"])))
);


ALTER TABLE "public"."old_user_flows" OWNER TO "postgres";


COMMENT ON TABLE "public"."old_user_flows" IS 'DEPRECATED: Use ai_flows instead';



COMMENT ON COLUMN "public"."old_user_flows"."flow_config" IS 'JSON configuration for the AI flow steps and parameters';



COMMENT ON COLUMN "public"."old_user_flows"."models" IS 'Array of AI models and services for this flow';



CREATE TABLE IF NOT EXISTS "public"."old_user_workflows" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "workflow_config" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "ai_models" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "parameters" "jsonb" DEFAULT '{}'::"jsonb",
    "is_active" boolean DEFAULT true,
    "usage_count" integer DEFAULT 0,
    "last_used" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."old_user_workflows" OWNER TO "postgres";


COMMENT ON TABLE "public"."old_user_workflows" IS 'DEPRECATED: Use ai_flows instead';



COMMENT ON COLUMN "public"."old_user_workflows"."workflow_config" IS 'JSON configuration for the workflow orchestration';



CREATE TABLE IF NOT EXISTS "public"."old_workflow_assignments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workflow_id" "uuid" NOT NULL,
    "user_level" "text" NOT NULL,
    "assigned_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "workflow_assignments_user_level_check" CHECK (("user_level" = ANY (ARRAY['free'::"text", 'basic'::"text", 'pro'::"text", 'premium'::"text"])))
);


ALTER TABLE "public"."old_workflow_assignments" OWNER TO "postgres";


COMMENT ON TABLE "public"."old_workflow_assignments" IS 'DEPRECATED: Use engine_assignments instead';



CREATE TABLE IF NOT EXISTS "public"."old_workflow_executions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "workflow_id" "uuid",
    "user_id" "uuid" NOT NULL,
    "book_id" "uuid",
    "status" "text" DEFAULT 'running'::"text",
    "progress" integer DEFAULT 0,
    "current_step" "text",
    "steps" "jsonb" DEFAULT '[]'::"jsonb",
    "metrics" "jsonb" DEFAULT '{}'::"jsonb",
    "error_message" "text",
    "started_at" timestamp with time zone DEFAULT "now"(),
    "completed_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "workflow_executions_progress_check" CHECK ((("progress" >= 0) AND ("progress" <= 100))),
    CONSTRAINT "workflow_executions_status_check" CHECK (("status" = ANY (ARRAY['running'::"text", 'paused'::"text", 'completed'::"text", 'failed'::"text", 'cancelled'::"text"])))
);


ALTER TABLE "public"."old_workflow_executions" OWNER TO "postgres";


COMMENT ON TABLE "public"."old_workflow_executions" IS 'DEPRECATED: Use engine_executions instead';



CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "email" "text" NOT NULL,
    "full_name" "text" DEFAULT ''::"text",
    "avatar_url" "text" DEFAULT ''::"text",
    "role" "text" DEFAULT 'user'::"text",
    "onboarding_completed" boolean DEFAULT false,
    "preferences" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "profiles_role_check" CHECK (("role" = ANY (ARRAY['user'::"text", 'admin'::"text"])))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."prompt_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text",
    "category" character varying(100) NOT NULL,
    "node_type" character varying(50) NOT NULL,
    "system_prompt" "text" NOT NULL,
    "user_prompt" "text" NOT NULL,
    "variables" "jsonb" DEFAULT '[]'::"jsonb",
    "tags" "text"[] DEFAULT '{}'::"text"[],
    "is_active" boolean DEFAULT true,
    "is_public" boolean DEFAULT false,
    "created_by" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "version" integer DEFAULT 1,
    "usage_count" integer DEFAULT 0
);


ALTER TABLE "public"."prompt_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."quality_gate_results" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "gate_name" "text" NOT NULL,
    "content_id" "text",
    "execution_id" "uuid",
    "passed" boolean NOT NULL,
    "score" numeric(5,2) DEFAULT 0,
    "feedback" "text",
    "suggestions" "jsonb" DEFAULT '[]'::"jsonb",
    "metrics" "jsonb" DEFAULT '{}'::"jsonb",
    "context" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."quality_gate_results" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."rate_limits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_tier" "text" NOT NULL,
    "resource_type" "text" NOT NULL,
    "limit_value" integer NOT NULL,
    "time_window_minutes" integer DEFAULT 60,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "rate_limits_resource_type_check" CHECK (("resource_type" = ANY (ARRAY['api_calls'::"text", 'book_generation'::"text", 'ai_requests'::"text", 'downloads'::"text"]))),
    CONSTRAINT "rate_limits_user_tier_check" CHECK (("user_tier" = ANY (ARRAY['free'::"text", 'standard'::"text", 'expert'::"text", 'byok'::"text"])))
);


ALTER TABLE "public"."rate_limits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "tier" "text" NOT NULL,
    "status" "text" DEFAULT 'active'::"text",
    "paypal_subscription_id" "text",
    "current_period_start" timestamp with time zone NOT NULL,
    "current_period_end" timestamp with time zone NOT NULL,
    "cancel_at_period_end" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "subscriptions_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'cancelled'::"text", 'past_due'::"text", 'paused'::"text"]))),
    CONSTRAINT "subscriptions_tier_check" CHECK (("tier" = ANY (ARRAY['standard'::"text", 'expert'::"text", 'byok'::"text"])))
);


ALTER TABLE "public"."subscriptions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."superadmin_users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "username" "text" NOT NULL,
    "password_hash" "text" NOT NULL,
    "email" "text",
    "is_active" boolean DEFAULT true,
    "last_login" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "permissions" "jsonb" DEFAULT '["all"]'::"jsonb",
    "full_name" "text" DEFAULT 'Super Administrator'::"text"
);


ALTER TABLE "public"."superadmin_users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."system_configs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "config_key" "text" NOT NULL,
    "config_value" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."system_configs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."system_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "event_type" "text" NOT NULL,
    "details" "jsonb" DEFAULT '{}'::"jsonb",
    "severity" "text" DEFAULT 'info'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "system_events_severity_check" CHECK (("severity" = ANY (ARRAY['info'::"text", 'warning'::"text", 'error'::"text", 'critical'::"text"])))
);


ALTER TABLE "public"."system_events" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."system_health_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "timestamp" timestamp with time zone DEFAULT "now"(),
    "database_status" "text" DEFAULT 'healthy'::"text",
    "database_response_time" integer DEFAULT 0,
    "api_status" "text" DEFAULT 'healthy'::"text",
    "api_response_time" integer DEFAULT 0,
    "ai_status" "text" DEFAULT 'healthy'::"text",
    "cdn_status" "text" DEFAULT 'healthy'::"text",
    "maintenance_mode" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."system_health_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."system_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "setting_key" "text" NOT NULL,
    "setting_value" "jsonb" NOT NULL,
    "setting_type" "text" DEFAULT 'string'::"text",
    "description" "text",
    "is_public" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "system_settings_setting_type_check" CHECK (("setting_type" = ANY (ARRAY['string'::"text", 'number'::"text", 'boolean'::"text", 'json'::"text", 'array'::"text"])))
);


ALTER TABLE "public"."system_settings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."system_stats" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "total_users" integer DEFAULT 0,
    "active_users" integer DEFAULT 0,
    "total_projects" integer DEFAULT 0,
    "total_ai_requests" integer DEFAULT 0,
    "total_revenue" numeric DEFAULT 0,
    "avg_response_time" numeric DEFAULT 0,
    "system_uptime" numeric DEFAULT 0,
    "last_updated" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."system_stats" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."task_ai_mappings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "task_type" "text" NOT NULL,
    "user_tier" "text" NOT NULL,
    "primary_service_id" "uuid" NOT NULL,
    "fallback_service_id" "uuid",
    "priority" integer DEFAULT 1,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "task_ai_mappings_task_type_check" CHECK (("task_type" = ANY (ARRAY['book_generation'::"text", 'chapter_writing'::"text", 'content_enhancement'::"text", 'copywriting'::"text", 'editing'::"text", 'summarization'::"text"]))),
    CONSTRAINT "task_ai_mappings_user_tier_check" CHECK (("user_tier" = ANY (ARRAY['free'::"text", 'standard'::"text", 'expert'::"text", 'byok'::"text"])))
);


ALTER TABLE "public"."task_ai_mappings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."usage_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "action" "text" NOT NULL,
    "resource_type" "text",
    "resource_id" "uuid",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "credits_used" integer DEFAULT 0,
    "ai_service" "text",
    "success" boolean DEFAULT true,
    "error_message" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "usage_logs_ai_service_check" CHECK (("ai_service" = ANY (ARRAY['openai'::"text", 'claude'::"text", 'gemini'::"text"])))
);


ALTER TABLE "public"."usage_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_analytics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "analytics_type" "text" NOT NULL,
    "analytics_data" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "recorded_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_analytics" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_analytics" IS 'User-specific analytics and usage tracking data';



COMMENT ON COLUMN "public"."user_analytics"."analytics_data" IS 'JSON analytics data for the user';



CREATE TABLE IF NOT EXISTS "public"."user_engine_preferences" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "user_engine_id" "uuid" NOT NULL,
    "reference_id" "uuid",
    "preference_id" "uuid",
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_engine_preferences" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_engine_preferences" IS 'Links user preferences to specific engines';



CREATE TABLE IF NOT EXISTS "public"."user_engines" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "engine_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "config" "jsonb" DEFAULT '{}'::"jsonb",
    "nodes" "jsonb" DEFAULT '[]'::"jsonb",
    "edges" "jsonb" DEFAULT '[]'::"jsonb",
    "models" "jsonb" DEFAULT '[]'::"jsonb",
    "api_key" "text",
    "api_key_created_at" timestamp with time zone,
    "status" "text" DEFAULT 'active'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "user_engines_status_check" CHECK (("status" = ANY (ARRAY['active'::"text", 'inactive'::"text"])))
);


ALTER TABLE "public"."user_engines" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_engines" IS 'User-specific copies of engines with unique API keys';



CREATE TABLE IF NOT EXISTS "public"."user_preferences" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "preference_type" "text" NOT NULL,
    "preference_name" "text" NOT NULL,
    "preference_value" "text" NOT NULL,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_preferences" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_preferences" IS 'User global preferences and instructions';



CREATE TABLE IF NOT EXISTS "public"."user_references" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "file_type" "text" NOT NULL,
    "file_size" bigint NOT NULL,
    "file_path" "text" NOT NULL,
    "content_summary" "text",
    "upload_date" timestamp with time zone DEFAULT "now"(),
    "last_accessed" timestamp with time zone DEFAULT "now"(),
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_references" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_references" IS 'User uploaded documents and references';



CREATE TABLE IF NOT EXISTS "public"."user_sessions" (
    "id" "text" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "session_data" "jsonb" NOT NULL,
    "is_active" boolean DEFAULT true,
    "expires_at" timestamp with time zone NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_settings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "settings_key" "text" NOT NULL,
    "settings_value" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_settings" OWNER TO "postgres";


COMMENT ON TABLE "public"."user_settings" IS 'User-specific application settings and preferences';



COMMENT ON COLUMN "public"."user_settings"."settings_value" IS 'JSON value for the user setting';



CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text" NOT NULL,
    "full_name" "text",
    "username" "text",
    "role" "text" DEFAULT 'user'::"text",
    "tier" "text" DEFAULT 'free'::"text",
    "access_level" integer DEFAULT 1,
    "credits_balance" integer DEFAULT 1000,
    "monthly_limit" integer DEFAULT 1000,
    "features_enabled" "jsonb" DEFAULT '[]'::"jsonb",
    "is_active" boolean DEFAULT true,
    "onboarding_completed" boolean DEFAULT false,
    "last_activity" timestamp with time zone,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "password_hash" "text",
    "last_login" timestamp with time zone,
    "password_updated_at" timestamp with time zone DEFAULT "now"(),
    "level_id" "uuid",
    CONSTRAINT "check_access_level_tier" CHECK (((("tier" = 'hobby'::"text") AND ("access_level" = 1)) OR (("tier" = 'pro'::"text") AND ("access_level" = 2)) OR (("tier" = 'macdaddy'::"text") AND ("access_level" = 3)) OR (("tier" = 'byok'::"text") AND ("access_level" = 4)))),
    CONSTRAINT "check_valid_tier" CHECK (("tier" = ANY (ARRAY['hobby'::"text", 'pro'::"text", 'macdaddy'::"text", 'byok'::"text"]))),
    CONSTRAINT "users_access_level_check" CHECK ((("access_level" >= 1) AND ("access_level" <= 10))),
    CONSTRAINT "users_credits_balance_check" CHECK (("credits_balance" >= 0)),
    CONSTRAINT "users_monthly_limit_check" CHECK (("monthly_limit" >= 0)),
    CONSTRAINT "users_role_check" CHECK (("role" = ANY (ARRAY['user'::"text", 'admin'::"text", 'superadmin'::"text"])))
);


ALTER TABLE "public"."users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."workflow_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "category" "text" DEFAULT 'general'::"text",
    "nodes" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "connections" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "is_public" boolean DEFAULT true,
    "created_by" "uuid",
    "usage_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."workflow_templates" OWNER TO "postgres";


ALTER TABLE ONLY "public"."admin_actions"
    ADD CONSTRAINT "admin_actions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admin_audit_log"
    ADD CONSTRAINT "admin_audit_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admin_config"
    ADD CONSTRAINT "admin_config_config_type_key" UNIQUE ("config_type");



ALTER TABLE ONLY "public"."admin_config"
    ADD CONSTRAINT "admin_config_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."admin_sessions"
    ADD CONSTRAINT "admin_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."advanced_workflow_executions"
    ADD CONSTRAINT "advanced_workflow_executions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."advanced_workflows"
    ADD CONSTRAINT "advanced_workflows_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_api_keys"
    ADD CONSTRAINT "ai_api_keys_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_api_keys"
    ADD CONSTRAINT "ai_api_keys_service_key" UNIQUE ("service");



ALTER TABLE ONLY "public"."ai_engine_logs"
    ADD CONSTRAINT "ai_engine_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_engine_stats"
    ADD CONSTRAINT "ai_engine_stats_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_engines"
    ADD CONSTRAINT "ai_engines_api_key_key" UNIQUE ("api_key");



ALTER TABLE ONLY "public"."ai_engines"
    ADD CONSTRAINT "ai_engines_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_flows"
    ADD CONSTRAINT "ai_flows_name_created_by_unique" UNIQUE ("name", "created_by");



ALTER TABLE ONLY "public"."ai_flows"
    ADD CONSTRAINT "ai_flows_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_model_metadata"
    ADD CONSTRAINT "ai_model_metadata_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_providers"
    ADD CONSTRAINT "ai_providers_name_unique" UNIQUE ("name");



ALTER TABLE ONLY "public"."ai_providers"
    ADD CONSTRAINT "ai_providers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_providers"
    ADD CONSTRAINT "ai_providers_provider_name_unique" UNIQUE ("provider", "name");



ALTER TABLE ONLY "public"."ai_request_logs"
    ADD CONSTRAINT "ai_request_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_service_configs"
    ADD CONSTRAINT "ai_service_configs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_service_configs"
    ADD CONSTRAINT "ai_service_configs_service_id_config_key_key" UNIQUE ("service_id", "config_key");



ALTER TABLE ONLY "public"."ai_services"
    ADD CONSTRAINT "ai_services_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."ai_services"
    ADD CONSTRAINT "ai_services_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."old_ai_workflows"
    ADD CONSTRAINT "ai_workflows_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."book_sections"
    ADD CONSTRAINT "book_sections_book_id_section_order_key" UNIQUE ("book_id", "section_order");



ALTER TABLE ONLY "public"."book_sections"
    ADD CONSTRAINT "book_sections_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."book_templates"
    ADD CONSTRAINT "book_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."books"
    ADD CONSTRAINT "books_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."old_engine_api_keys"
    ADD CONSTRAINT "engine_api_keys_api_key_key" UNIQUE ("api_key");



ALTER TABLE ONLY "public"."old_engine_api_keys"
    ADD CONSTRAINT "engine_api_keys_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."old_engine_assignments"
    ADD CONSTRAINT "engine_assignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."engine_executions"
    ADD CONSTRAINT "engine_executions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."feature_flags"
    ADD CONSTRAINT "feature_flags_flag_name_key" UNIQUE ("flag_name");



ALTER TABLE ONLY "public"."feature_flags"
    ADD CONSTRAINT "feature_flags_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."OLD_level_access"
    ADD CONSTRAINT "level_access_feature_name_key" UNIQUE ("feature_name");



ALTER TABLE ONLY "public"."level_access"
    ADD CONSTRAINT "level_access_level_id_key" UNIQUE ("level_id");



ALTER TABLE ONLY "public"."level_access"
    ADD CONSTRAINT "level_access_level_name_key" UNIQUE ("level_name");



ALTER TABLE ONLY "public"."OLD_level_access"
    ADD CONSTRAINT "level_access_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."level_access"
    ADD CONSTRAINT "level_access_pkey1" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."level_analytics"
    ADD CONSTRAINT "level_analytics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."level_benefits"
    ADD CONSTRAINT "level_benefits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."level_comparison"
    ADD CONSTRAINT "level_comparison_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."level_engines"
    ADD CONSTRAINT "level_engines_level_id_engine_id_key" UNIQUE ("level_id", "engine_id");



ALTER TABLE ONLY "public"."level_engines"
    ADD CONSTRAINT "level_engines_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."level_feature_usage"
    ADD CONSTRAINT "level_feature_usage_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."level_features"
    ADD CONSTRAINT "level_features_level_id_feature_name_key" UNIQUE ("level_id", "feature_name");



ALTER TABLE ONLY "public"."level_features"
    ADD CONSTRAINT "level_features_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."level_pricing"
    ADD CONSTRAINT "level_pricing_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."level_restrictions"
    ADD CONSTRAINT "level_restrictions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."level_upgrade_paths"
    ADD CONSTRAINT "level_upgrade_paths_from_level_id_to_level_id_key" UNIQUE ("from_level_id", "to_level_id");



ALTER TABLE ONLY "public"."level_upgrade_paths"
    ADD CONSTRAINT "level_upgrade_paths_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."old_level_workflow_assignments"
    ADD CONSTRAINT "level_workflow_assignments_level_id_workflow_id_key" UNIQUE ("level_id", "workflow_id");



ALTER TABLE ONLY "public"."old_level_workflow_assignments"
    ADD CONSTRAINT "level_workflow_assignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."levels"
    ADD CONSTRAINT "levels_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."levels"
    ADD CONSTRAINT "levels_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."levels"
    ADD CONSTRAINT "levels_tier_level_key" UNIQUE ("tier_level");



ALTER TABLE ONLY "public"."master_sync_log"
    ADD CONSTRAINT "master_sync_log_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."prompt_templates"
    ADD CONSTRAINT "prompt_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."quality_gate_results"
    ADD CONSTRAINT "quality_gate_results_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."rate_limits"
    ADD CONSTRAINT "rate_limits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."rate_limits"
    ADD CONSTRAINT "rate_limits_user_tier_resource_type_key" UNIQUE ("user_tier", "resource_type");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_paypal_subscription_id_key" UNIQUE ("paypal_subscription_id");



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."superadmin_users"
    ADD CONSTRAINT "superadmin_users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."superadmin_users"
    ADD CONSTRAINT "superadmin_users_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."system_configs"
    ADD CONSTRAINT "system_configs_config_key_key" UNIQUE ("config_key");



ALTER TABLE ONLY "public"."system_configs"
    ADD CONSTRAINT "system_configs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."system_events"
    ADD CONSTRAINT "system_events_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."system_health_logs"
    ADD CONSTRAINT "system_health_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."system_settings"
    ADD CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."system_settings"
    ADD CONSTRAINT "system_settings_setting_key_key" UNIQUE ("setting_key");



ALTER TABLE ONLY "public"."system_stats"
    ADD CONSTRAINT "system_stats_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."task_ai_mappings"
    ADD CONSTRAINT "task_ai_mappings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."task_ai_mappings"
    ADD CONSTRAINT "task_ai_mappings_task_type_user_tier_priority_key" UNIQUE ("task_type", "user_tier", "priority");



ALTER TABLE ONLY "public"."ai_model_metadata"
    ADD CONSTRAINT "unique_key_model" UNIQUE ("key_model");



COMMENT ON CONSTRAINT "unique_key_model" ON "public"."ai_model_metadata" IS 'Ensures each key_model combination is unique to prevent duplicate entries';



ALTER TABLE ONLY "public"."usage_logs"
    ADD CONSTRAINT "usage_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."old_user_ai_models"
    ADD CONSTRAINT "user_ai_models_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."old_user_ai_models"
    ADD CONSTRAINT "user_ai_models_user_id_service_model_id_key" UNIQUE ("user_id", "service", "model_id");



ALTER TABLE ONLY "public"."user_analytics"
    ADD CONSTRAINT "user_analytics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."old_user_api_keys"
    ADD CONSTRAINT "user_api_keys_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."old_user_api_keys"
    ADD CONSTRAINT "user_api_keys_user_id_service_key" UNIQUE ("user_id", "service");



ALTER TABLE ONLY "public"."old_user_credits"
    ADD CONSTRAINT "user_credits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."old_user_credits"
    ADD CONSTRAINT "user_credits_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."user_engine_preferences"
    ADD CONSTRAINT "user_engine_preferences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_engine_preferences"
    ADD CONSTRAINT "user_engine_preferences_user_id_user_engine_id_preference_i_key" UNIQUE ("user_id", "user_engine_id", "preference_id");



ALTER TABLE ONLY "public"."user_engine_preferences"
    ADD CONSTRAINT "user_engine_preferences_user_id_user_engine_id_reference_id_key" UNIQUE ("user_id", "user_engine_id", "reference_id");



ALTER TABLE ONLY "public"."user_engines"
    ADD CONSTRAINT "user_engines_api_key_key" UNIQUE ("api_key");



ALTER TABLE ONLY "public"."user_engines"
    ADD CONSTRAINT "user_engines_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_engines"
    ADD CONSTRAINT "user_engines_user_id_engine_id_key" UNIQUE ("user_id", "engine_id");



ALTER TABLE ONLY "public"."old_user_flows"
    ADD CONSTRAINT "user_flows_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_preferences"
    ADD CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_preferences"
    ADD CONSTRAINT "user_preferences_user_id_preference_type_preference_name_key" UNIQUE ("user_id", "preference_type", "preference_name");



ALTER TABLE ONLY "public"."user_references"
    ADD CONSTRAINT "user_references_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_sessions"
    ADD CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_settings"
    ADD CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_settings"
    ADD CONSTRAINT "user_settings_user_id_settings_key_key" UNIQUE ("user_id", "settings_key");



ALTER TABLE ONLY "public"."old_user_workflows"
    ADD CONSTRAINT "user_workflows_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."old_workflow_assignments"
    ADD CONSTRAINT "workflow_assignments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."old_workflow_assignments"
    ADD CONSTRAINT "workflow_assignments_workflow_id_user_level_key" UNIQUE ("workflow_id", "user_level");



ALTER TABLE ONLY "public"."old_workflow_executions"
    ADD CONSTRAINT "workflow_executions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."workflow_templates"
    ADD CONSTRAINT "workflow_templates_pkey" PRIMARY KEY ("id");



CREATE INDEX "ai_providers_user_provider_idx" ON "public"."ai_providers" USING "btree" ("user_id", "provider");



CREATE INDEX "idx_admin_actions_action_type" ON "public"."admin_actions" USING "btree" ("action_type");



CREATE INDEX "idx_admin_actions_admin_id" ON "public"."admin_actions" USING "btree" ("admin_id");



CREATE INDEX "idx_admin_actions_created_at" ON "public"."admin_actions" USING "btree" ("created_at");



CREATE INDEX "idx_admin_audit_log_admin" ON "public"."admin_audit_log" USING "btree" ("admin_user_id");



CREATE INDEX "idx_admin_audit_log_created" ON "public"."admin_audit_log" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_admin_config_active" ON "public"."admin_config" USING "btree" ("is_active");



CREATE INDEX "idx_admin_config_type" ON "public"."admin_config" USING "btree" ("config_type");



CREATE INDEX "idx_admin_sessions_active" ON "public"."admin_sessions" USING "btree" ("is_active", "expires_at");



CREATE INDEX "idx_admin_sessions_admin_id" ON "public"."admin_sessions" USING "btree" ("admin_id");



CREATE INDEX "idx_admin_sessions_expires" ON "public"."admin_sessions" USING "btree" ("expires_at");



CREATE INDEX "idx_admin_sessions_session_id" ON "public"."admin_sessions" USING "btree" ("id");



CREATE INDEX "idx_advanced_workflow_executions_created_at" ON "public"."advanced_workflow_executions" USING "btree" ("created_at");



CREATE INDEX "idx_advanced_workflow_executions_status" ON "public"."advanced_workflow_executions" USING "btree" ("status");



CREATE INDEX "idx_advanced_workflow_executions_user_id" ON "public"."advanced_workflow_executions" USING "btree" ("user_id");



CREATE INDEX "idx_advanced_workflow_executions_workflow_id" ON "public"."advanced_workflow_executions" USING "btree" ("workflow_id");



CREATE INDEX "idx_advanced_workflows_category" ON "public"."advanced_workflows" USING "btree" ("category");



CREATE INDEX "idx_advanced_workflows_connections" ON "public"."advanced_workflows" USING "gin" ("connections");



CREATE INDEX "idx_advanced_workflows_created_at" ON "public"."advanced_workflows" USING "btree" ("created_at");



CREATE INDEX "idx_advanced_workflows_created_by" ON "public"."advanced_workflows" USING "btree" ("created_by");



CREATE INDEX "idx_advanced_workflows_nodes" ON "public"."advanced_workflows" USING "gin" ("nodes");



CREATE INDEX "idx_ai_api_keys_active" ON "public"."ai_api_keys" USING "btree" ("is_active");



CREATE INDEX "idx_ai_api_keys_service" ON "public"."ai_api_keys" USING "btree" ("service");



CREATE INDEX "idx_ai_engines_active" ON "public"."ai_engines" USING "btree" ("active");



CREATE INDEX "idx_ai_engines_api_key" ON "public"."ai_engines" USING "btree" ("api_key");



CREATE INDEX "idx_ai_engines_created_by" ON "public"."ai_engines" USING "btree" ("created_by");



CREATE INDEX "idx_ai_engines_tier" ON "public"."ai_engines" USING "btree" ("tier");



CREATE INDEX "idx_ai_flows_created_at" ON "public"."ai_flows" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_ai_flows_created_by" ON "public"."ai_flows" USING "btree" ("created_by");



CREATE INDEX "idx_ai_flows_is_default" ON "public"."ai_flows" USING "btree" ("is_default");



CREATE INDEX "idx_ai_flows_type" ON "public"."ai_flows" USING "btree" ("type");



CREATE INDEX "idx_ai_flows_usage_count" ON "public"."ai_flows" USING "btree" ("usage_count" DESC);



CREATE INDEX "idx_ai_model_metadata_active" ON "public"."ai_model_metadata" USING "btree" ("is_active");



CREATE INDEX "idx_ai_model_metadata_key_model" ON "public"."ai_model_metadata" USING "btree" ("key_model");



CREATE INDEX "idx_ai_model_metadata_key_name" ON "public"."ai_model_metadata" USING "btree" ("key_name");



CREATE INDEX "idx_ai_model_metadata_provider" ON "public"."ai_model_metadata" USING "btree" ("provider");



CREATE INDEX "idx_ai_providers_active" ON "public"."ai_providers" USING "btree" ("is_active");



CREATE INDEX "idx_ai_providers_failures" ON "public"."ai_providers" USING "btree" ("failures");



CREATE INDEX "idx_ai_providers_last_used" ON "public"."ai_providers" USING "btree" ("last_used" DESC);



CREATE INDEX "idx_ai_providers_name" ON "public"."ai_providers" USING "btree" ("name");



CREATE INDEX "idx_ai_providers_provider" ON "public"."ai_providers" USING "btree" ("provider");



CREATE INDEX "idx_ai_providers_usage_count" ON "public"."ai_providers" USING "btree" ("usage_count" DESC);



CREATE INDEX "idx_ai_providers_user_id" ON "public"."ai_providers" USING "btree" ("user_id");



CREATE INDEX "idx_ai_request_logs_engine_id" ON "public"."ai_request_logs" USING "btree" ("engine_id");



CREATE INDEX "idx_ai_request_logs_timestamp" ON "public"."ai_request_logs" USING "btree" ("timestamp");



CREATE INDEX "idx_ai_services_active" ON "public"."ai_services" USING "btree" ("is_active");



CREATE INDEX "idx_ai_services_provider" ON "public"."ai_services" USING "btree" ("provider");



CREATE INDEX "idx_ai_workflows_active" ON "public"."old_ai_workflows" USING "btree" ("is_active");



CREATE INDEX "idx_ai_workflows_created_at" ON "public"."old_ai_workflows" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_ai_workflows_created_by" ON "public"."old_ai_workflows" USING "btree" ("created_by");



CREATE INDEX "idx_book_sections_book_id" ON "public"."book_sections" USING "btree" ("book_id");



CREATE INDEX "idx_book_sections_order" ON "public"."book_sections" USING "btree" ("book_id", "section_order");



CREATE INDEX "idx_book_templates_public" ON "public"."book_templates" USING "btree" ("is_public");



CREATE INDEX "idx_books_created_at" ON "public"."books" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_books_is_public" ON "public"."books" USING "btree" ("is_public");



CREATE INDEX "idx_books_status" ON "public"."books" USING "btree" ("status");



CREATE INDEX "idx_books_user_id" ON "public"."books" USING "btree" ("user_id");



CREATE INDEX "idx_engine_api_keys_api_key" ON "public"."old_engine_api_keys" USING "btree" ("api_key");



CREATE INDEX "idx_engine_api_keys_engine_id" ON "public"."old_engine_api_keys" USING "btree" ("engine_id");



CREATE INDEX "idx_engine_api_keys_is_active" ON "public"."old_engine_api_keys" USING "btree" ("is_active");



CREATE INDEX "idx_engine_api_keys_user_id" ON "public"."old_engine_api_keys" USING "btree" ("user_id");



CREATE INDEX "idx_engine_assignments_active" ON "public"."old_engine_assignments" USING "btree" ("active");



CREATE INDEX "idx_engine_assignments_engine_id" ON "public"."old_engine_assignments" USING "btree" ("engine_id");



CREATE INDEX "idx_engine_assignments_tier" ON "public"."old_engine_assignments" USING "btree" ("tier");



CREATE INDEX "idx_engine_assignments_user_id" ON "public"."old_engine_assignments" USING "btree" ("user_id");



CREATE INDEX "idx_engine_executions_created_at" ON "public"."engine_executions" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_engine_executions_engine_id" ON "public"."engine_executions" USING "btree" ("engine_id");



CREATE INDEX "idx_engine_executions_status" ON "public"."engine_executions" USING "btree" ("status");



CREATE INDEX "idx_engine_executions_user_id" ON "public"."engine_executions" USING "btree" ("user_id");



CREATE INDEX "idx_feature_flags_enabled" ON "public"."feature_flags" USING "btree" ("is_enabled");



CREATE INDEX "idx_level_access_is_active" ON "public"."level_access" USING "btree" ("is_active");



CREATE INDEX "idx_level_access_level_id" ON "public"."level_access" USING "btree" ("level_id");



CREATE INDEX "idx_level_access_level_name" ON "public"."level_access" USING "btree" ("level_name");



CREATE INDEX "idx_level_analytics_level_id" ON "public"."level_analytics" USING "btree" ("level_id");



CREATE INDEX "idx_level_engines_access_type" ON "public"."level_engines" USING "btree" ("access_type");



CREATE INDEX "idx_level_engines_engine_id" ON "public"."level_engines" USING "btree" ("engine_id");



CREATE INDEX "idx_level_engines_level_id" ON "public"."level_engines" USING "btree" ("level_id");



CREATE INDEX "idx_level_feature_usage_level_user" ON "public"."level_feature_usage" USING "btree" ("level_id", "user_id");



CREATE INDEX "idx_level_features_level_id" ON "public"."level_features" USING "btree" ("level_id");



CREATE INDEX "idx_level_pricing_level_id" ON "public"."level_pricing" USING "btree" ("level_id");



CREATE INDEX "idx_level_workflow_assignments_level_id" ON "public"."old_level_workflow_assignments" USING "btree" ("level_id");



CREATE INDEX "idx_levels_is_active" ON "public"."levels" USING "btree" ("is_active");



CREATE INDEX "idx_levels_tier_level" ON "public"."levels" USING "btree" ("tier_level");



CREATE INDEX "idx_master_sync_log_created_at" ON "public"."master_sync_log" USING "btree" ("created_at");



CREATE INDEX "idx_master_sync_log_engine_id" ON "public"."master_sync_log" USING "btree" ("master_engine_id");



CREATE INDEX "idx_master_sync_log_status" ON "public"."master_sync_log" USING "btree" ("sync_status");



CREATE INDEX "idx_profiles_email" ON "public"."profiles" USING "btree" ("email");



CREATE INDEX "idx_prompt_templates_category" ON "public"."prompt_templates" USING "btree" ("category");



CREATE INDEX "idx_prompt_templates_created_by" ON "public"."prompt_templates" USING "btree" ("created_by");



CREATE INDEX "idx_prompt_templates_is_active" ON "public"."prompt_templates" USING "btree" ("is_active");



CREATE INDEX "idx_prompt_templates_is_public" ON "public"."prompt_templates" USING "btree" ("is_public");



CREATE INDEX "idx_prompt_templates_node_type" ON "public"."prompt_templates" USING "btree" ("node_type");



CREATE INDEX "idx_prompt_templates_tags" ON "public"."prompt_templates" USING "gin" ("tags");



CREATE INDEX "idx_quality_gate_results_created_at" ON "public"."quality_gate_results" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_quality_gate_results_execution_id" ON "public"."quality_gate_results" USING "btree" ("execution_id");



CREATE INDEX "idx_quality_gate_results_gate_name" ON "public"."quality_gate_results" USING "btree" ("gate_name");



CREATE INDEX "idx_rate_limits_tier_resource" ON "public"."rate_limits" USING "btree" ("user_tier", "resource_type");



CREATE INDEX "idx_subscriptions_status" ON "public"."subscriptions" USING "btree" ("status");



CREATE INDEX "idx_subscriptions_user_id" ON "public"."subscriptions" USING "btree" ("user_id");



CREATE INDEX "idx_superadmin_users_active" ON "public"."superadmin_users" USING "btree" ("is_active");



CREATE INDEX "idx_superadmin_users_email" ON "public"."superadmin_users" USING "btree" ("email");



CREATE INDEX "idx_superadmin_users_username" ON "public"."superadmin_users" USING "btree" ("username");



CREATE INDEX "idx_system_configs_key" ON "public"."system_configs" USING "btree" ("config_key");



CREATE INDEX "idx_system_events_created_at" ON "public"."system_events" USING "btree" ("created_at");



CREATE INDEX "idx_system_events_event_type" ON "public"."system_events" USING "btree" ("event_type");



CREATE INDEX "idx_system_health_logs_timestamp" ON "public"."system_health_logs" USING "btree" ("timestamp");



CREATE INDEX "idx_system_settings_key" ON "public"."system_settings" USING "btree" ("setting_key");



CREATE INDEX "idx_task_ai_mappings_task_tier" ON "public"."task_ai_mappings" USING "btree" ("task_type", "user_tier");



CREATE INDEX "idx_usage_logs_created_at" ON "public"."usage_logs" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_usage_logs_user_id" ON "public"."usage_logs" USING "btree" ("user_id");



CREATE INDEX "idx_user_ai_models_is_default" ON "public"."old_user_ai_models" USING "btree" ("is_default");



CREATE INDEX "idx_user_ai_models_service" ON "public"."old_user_ai_models" USING "btree" ("service");



CREATE INDEX "idx_user_ai_models_user_id" ON "public"."old_user_ai_models" USING "btree" ("user_id");



CREATE INDEX "idx_user_analytics_recorded_at" ON "public"."user_analytics" USING "btree" ("recorded_at" DESC);



CREATE INDEX "idx_user_analytics_type" ON "public"."user_analytics" USING "btree" ("analytics_type");



CREATE INDEX "idx_user_analytics_user_id" ON "public"."user_analytics" USING "btree" ("user_id");



CREATE INDEX "idx_user_api_keys_user_service" ON "public"."old_user_api_keys" USING "btree" ("user_id", "service");



CREATE INDEX "idx_user_credits_user_id" ON "public"."old_user_credits" USING "btree" ("user_id");



CREATE INDEX "idx_user_engine_preferences_engine_id" ON "public"."user_engine_preferences" USING "btree" ("user_engine_id");



CREATE INDEX "idx_user_engine_preferences_reference_id" ON "public"."user_engine_preferences" USING "btree" ("reference_id");



CREATE INDEX "idx_user_engine_preferences_user_id" ON "public"."user_engine_preferences" USING "btree" ("user_id");



CREATE INDEX "idx_user_engines_api_key" ON "public"."user_engines" USING "btree" ("api_key");



CREATE INDEX "idx_user_engines_engine_id" ON "public"."user_engines" USING "btree" ("engine_id");



CREATE INDEX "idx_user_engines_status" ON "public"."user_engines" USING "btree" ("status");



CREATE INDEX "idx_user_engines_user_id" ON "public"."user_engines" USING "btree" ("user_id");



CREATE INDEX "idx_user_flows_created_at" ON "public"."old_user_flows" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_user_flows_is_default" ON "public"."old_user_flows" USING "btree" ("is_default");



CREATE INDEX "idx_user_flows_type" ON "public"."old_user_flows" USING "btree" ("type");



CREATE INDEX "idx_user_flows_user_id" ON "public"."old_user_flows" USING "btree" ("user_id");



CREATE INDEX "idx_user_preferences_is_active" ON "public"."user_preferences" USING "btree" ("is_active");



CREATE INDEX "idx_user_preferences_type" ON "public"."user_preferences" USING "btree" ("preference_type");



CREATE INDEX "idx_user_preferences_user_id" ON "public"."user_preferences" USING "btree" ("user_id");



CREATE INDEX "idx_user_references_file_type" ON "public"."user_references" USING "btree" ("file_type");



CREATE INDEX "idx_user_references_is_active" ON "public"."user_references" USING "btree" ("is_active");



CREATE INDEX "idx_user_references_user_id" ON "public"."user_references" USING "btree" ("user_id");



CREATE INDEX "idx_user_sessions_expires_at" ON "public"."user_sessions" USING "btree" ("expires_at");



CREATE INDEX "idx_user_sessions_is_active" ON "public"."user_sessions" USING "btree" ("is_active");



CREATE INDEX "idx_user_sessions_user_id" ON "public"."user_sessions" USING "btree" ("user_id");



CREATE INDEX "idx_user_settings_key" ON "public"."user_settings" USING "btree" ("settings_key");



CREATE INDEX "idx_user_settings_user_id" ON "public"."user_settings" USING "btree" ("user_id");



CREATE INDEX "idx_user_workflows_created_at" ON "public"."old_user_workflows" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_user_workflows_is_active" ON "public"."old_user_workflows" USING "btree" ("is_active");



CREATE INDEX "idx_user_workflows_user_id" ON "public"."old_user_workflows" USING "btree" ("user_id");



CREATE INDEX "idx_users_access_level" ON "public"."users" USING "btree" ("access_level");



CREATE INDEX "idx_users_email" ON "public"."users" USING "btree" ("email");



CREATE INDEX "idx_users_is_active" ON "public"."users" USING "btree" ("is_active");



CREATE INDEX "idx_users_last_activity" ON "public"."users" USING "btree" ("last_activity");



CREATE INDEX "idx_users_last_login" ON "public"."users" USING "btree" ("last_login");



CREATE INDEX "idx_users_password_hash" ON "public"."users" USING "btree" ("password_hash");



CREATE INDEX "idx_users_role" ON "public"."users" USING "btree" ("role");



CREATE INDEX "idx_users_tier" ON "public"."users" USING "btree" ("tier");



CREATE INDEX "idx_workflow_assignments_assigned_at" ON "public"."old_workflow_assignments" USING "btree" ("assigned_at" DESC);



CREATE INDEX "idx_workflow_assignments_user_level" ON "public"."old_workflow_assignments" USING "btree" ("user_level");



CREATE INDEX "idx_workflow_assignments_workflow_id" ON "public"."old_workflow_assignments" USING "btree" ("workflow_id");



CREATE INDEX "idx_workflow_executions_started_at" ON "public"."old_workflow_executions" USING "btree" ("started_at" DESC);



CREATE INDEX "idx_workflow_executions_status" ON "public"."old_workflow_executions" USING "btree" ("status");



CREATE INDEX "idx_workflow_executions_user_id" ON "public"."old_workflow_executions" USING "btree" ("user_id");



CREATE INDEX "idx_workflow_executions_workflow_id" ON "public"."old_workflow_executions" USING "btree" ("workflow_id");



CREATE INDEX "idx_workflow_templates_category" ON "public"."workflow_templates" USING "btree" ("category");



CREATE INDEX "idx_workflow_templates_created_by" ON "public"."workflow_templates" USING "btree" ("created_by");



CREATE INDEX "idx_workflow_templates_public" ON "public"."workflow_templates" USING "btree" ("is_public");



CREATE OR REPLACE TRIGGER "ai_providers_updated_at" BEFORE UPDATE ON "public"."ai_providers" FOR EACH ROW EXECUTE FUNCTION "public"."update_ai_providers_updated_at"();



CREATE OR REPLACE TRIGGER "handle_users_updated_at" BEFORE UPDATE ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."handle_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_enforce_engine_access" BEFORE INSERT OR UPDATE ON "public"."user_engines" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_engine_access"();



CREATE OR REPLACE TRIGGER "trigger_level_access_updated_at" BEFORE UPDATE ON "public"."level_access" FOR EACH ROW EXECUTE FUNCTION "public"."update_level_access_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_update_prompt_templates_updated_at" BEFORE UPDATE ON "public"."prompt_templates" FOR EACH ROW EXECUTE FUNCTION "public"."update_prompt_templates_updated_at"();



CREATE OR REPLACE TRIGGER "trigger_user_created" AFTER INSERT ON "public"."users" FOR EACH ROW EXECUTE FUNCTION "public"."trigger_create_user_engines"();



CREATE OR REPLACE TRIGGER "trigger_user_engines_updated_at" BEFORE UPDATE ON "public"."user_engines" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_user_preferences_updated_at" BEFORE UPDATE ON "public"."user_preferences" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "trigger_user_references_updated_at" BEFORE UPDATE ON "public"."user_references" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_advanced_workflows_updated_at" BEFORE UPDATE ON "public"."advanced_workflows" FOR EACH ROW EXECUTE FUNCTION "public"."update_advanced_workflows_updated_at"();



CREATE OR REPLACE TRIGGER "update_ai_engines_updated_at" BEFORE UPDATE ON "public"."ai_engines" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_ai_flows_updated_at" BEFORE UPDATE ON "public"."ai_flows" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_ai_service_configs_updated_at" BEFORE UPDATE ON "public"."ai_service_configs" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_ai_services_updated_at" BEFORE UPDATE ON "public"."ai_services" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_ai_workflows_updated_at" BEFORE UPDATE ON "public"."old_ai_workflows" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_book_sections_updated_at" BEFORE UPDATE ON "public"."book_sections" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_book_templates_updated_at" BEFORE UPDATE ON "public"."book_templates" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_books_updated_at" BEFORE UPDATE ON "public"."books" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_engine_api_keys_updated_at" BEFORE UPDATE ON "public"."old_engine_api_keys" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_feature_flags_updated_at" BEFORE UPDATE ON "public"."feature_flags" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_level_benefits_updated_at" BEFORE UPDATE ON "public"."level_benefits" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_level_comparison_updated_at" BEFORE UPDATE ON "public"."level_comparison" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_level_features_updated_at" BEFORE UPDATE ON "public"."level_features" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_level_pricing_updated_at" BEFORE UPDATE ON "public"."level_pricing" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_level_restrictions_updated_at" BEFORE UPDATE ON "public"."level_restrictions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_level_upgrade_paths_updated_at" BEFORE UPDATE ON "public"."level_upgrade_paths" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_level_workflow_assignments_updated_at" BEFORE UPDATE ON "public"."old_level_workflow_assignments" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_levels_updated_at" BEFORE UPDATE ON "public"."levels" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_rate_limits_updated_at" BEFORE UPDATE ON "public"."rate_limits" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_subscriptions_updated_at" BEFORE UPDATE ON "public"."subscriptions" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_system_settings_updated_at" BEFORE UPDATE ON "public"."system_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_task_ai_mappings_updated_at" BEFORE UPDATE ON "public"."task_ai_mappings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_user_ai_models_updated_at" BEFORE UPDATE ON "public"."old_user_ai_models" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_user_api_keys_updated_at" BEFORE UPDATE ON "public"."old_user_api_keys" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_user_credits_updated_at" BEFORE UPDATE ON "public"."old_user_credits" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_user_flows_updated_at" BEFORE UPDATE ON "public"."old_user_flows" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_user_settings_updated_at" BEFORE UPDATE ON "public"."user_settings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_user_workflows_updated_at" BEFORE UPDATE ON "public"."old_user_workflows" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_workflow_templates_updated_at" BEFORE UPDATE ON "public"."workflow_templates" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."admin_audit_log"
    ADD CONSTRAINT "admin_audit_log_admin_user_id_fkey" FOREIGN KEY ("admin_user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."admin_sessions"
    ADD CONSTRAINT "admin_sessions_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "public"."superadmin_users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."advanced_workflow_executions"
    ADD CONSTRAINT "advanced_workflow_executions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."advanced_workflow_executions"
    ADD CONSTRAINT "advanced_workflow_executions_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "public"."advanced_workflows"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."advanced_workflows"
    ADD CONSTRAINT "advanced_workflows_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ai_model_metadata"
    ADD CONSTRAINT "ai_model_metadata_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."ai_service_configs"
    ADD CONSTRAINT "ai_service_configs_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "public"."ai_services"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."book_sections"
    ADD CONSTRAINT "book_sections_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."book_templates"
    ADD CONSTRAINT "book_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."old_engine_api_keys"
    ADD CONSTRAINT "engine_api_keys_engine_id_fkey" FOREIGN KEY ("engine_id") REFERENCES "public"."ai_engines"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."old_engine_api_keys"
    ADD CONSTRAINT "engine_api_keys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."old_engine_assignments"
    ADD CONSTRAINT "engine_assignments_engine_id_fkey" FOREIGN KEY ("engine_id") REFERENCES "public"."ai_engines"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."engine_executions"
    ADD CONSTRAINT "engine_executions_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."engine_executions"
    ADD CONSTRAINT "engine_executions_engine_id_fkey" FOREIGN KEY ("engine_id") REFERENCES "public"."ai_engines"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."engine_executions"
    ADD CONSTRAINT "engine_executions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ai_model_metadata"
    ADD CONSTRAINT "fk_key_name_cascade" FOREIGN KEY ("key_name") REFERENCES "public"."ai_providers"("name") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."level_access"
    ADD CONSTRAINT "level_access_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."level_analytics"
    ADD CONSTRAINT "level_analytics_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."level_benefits"
    ADD CONSTRAINT "level_benefits_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."level_comparison"
    ADD CONSTRAINT "level_comparison_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."level_engines"
    ADD CONSTRAINT "level_engines_engine_id_fkey" FOREIGN KEY ("engine_id") REFERENCES "public"."ai_engines"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."level_engines"
    ADD CONSTRAINT "level_engines_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."level_feature_usage"
    ADD CONSTRAINT "level_feature_usage_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."level_feature_usage"
    ADD CONSTRAINT "level_feature_usage_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."level_features"
    ADD CONSTRAINT "level_features_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."level_pricing"
    ADD CONSTRAINT "level_pricing_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."level_restrictions"
    ADD CONSTRAINT "level_restrictions_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."level_upgrade_paths"
    ADD CONSTRAINT "level_upgrade_paths_from_level_id_fkey" FOREIGN KEY ("from_level_id") REFERENCES "public"."levels"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."level_upgrade_paths"
    ADD CONSTRAINT "level_upgrade_paths_to_level_id_fkey" FOREIGN KEY ("to_level_id") REFERENCES "public"."levels"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."old_level_workflow_assignments"
    ADD CONSTRAINT "level_workflow_assignments_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."old_level_workflow_assignments"
    ADD CONSTRAINT "level_workflow_assignments_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "public"."old_ai_workflows"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."master_sync_log"
    ADD CONSTRAINT "master_sync_log_master_engine_id_fkey" FOREIGN KEY ("master_engine_id") REFERENCES "public"."ai_engines"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."master_sync_log"
    ADD CONSTRAINT "master_sync_log_synced_by_fkey" FOREIGN KEY ("synced_by") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."prompt_templates"
    ADD CONSTRAINT "prompt_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "public"."superadmin_users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."quality_gate_results"
    ADD CONSTRAINT "quality_gate_results_execution_id_fkey" FOREIGN KEY ("execution_id") REFERENCES "public"."old_workflow_executions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."subscriptions"
    ADD CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."task_ai_mappings"
    ADD CONSTRAINT "task_ai_mappings_fallback_service_id_fkey" FOREIGN KEY ("fallback_service_id") REFERENCES "public"."ai_services"("id");



ALTER TABLE ONLY "public"."task_ai_mappings"
    ADD CONSTRAINT "task_ai_mappings_primary_service_id_fkey" FOREIGN KEY ("primary_service_id") REFERENCES "public"."ai_services"("id");



ALTER TABLE ONLY "public"."usage_logs"
    ADD CONSTRAINT "usage_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."old_user_ai_models"
    ADD CONSTRAINT "user_ai_models_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_analytics"
    ADD CONSTRAINT "user_analytics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."old_user_api_keys"
    ADD CONSTRAINT "user_api_keys_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."old_user_credits"
    ADD CONSTRAINT "user_credits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_engine_preferences"
    ADD CONSTRAINT "user_engine_preferences_preference_id_fkey" FOREIGN KEY ("preference_id") REFERENCES "public"."user_preferences"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_engine_preferences"
    ADD CONSTRAINT "user_engine_preferences_reference_id_fkey" FOREIGN KEY ("reference_id") REFERENCES "public"."user_references"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."user_engine_preferences"
    ADD CONSTRAINT "user_engine_preferences_user_engine_id_fkey" FOREIGN KEY ("user_engine_id") REFERENCES "public"."user_engines"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_engine_preferences"
    ADD CONSTRAINT "user_engine_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_engines"
    ADD CONSTRAINT "user_engines_engine_id_fkey" FOREIGN KEY ("engine_id") REFERENCES "public"."ai_engines"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_engines"
    ADD CONSTRAINT "user_engines_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."old_user_flows"
    ADD CONSTRAINT "user_flows_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_preferences"
    ADD CONSTRAINT "user_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_references"
    ADD CONSTRAINT "user_references_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_sessions"
    ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_settings"
    ADD CONSTRAINT "user_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."old_user_workflows"
    ADD CONSTRAINT "user_workflows_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "public"."levels"("id");



ALTER TABLE ONLY "public"."old_workflow_assignments"
    ADD CONSTRAINT "workflow_assignments_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "public"."old_ai_workflows"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."old_workflow_executions"
    ADD CONSTRAINT "workflow_executions_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."old_workflow_executions"
    ADD CONSTRAINT "workflow_executions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."old_workflow_executions"
    ADD CONSTRAINT "workflow_executions_workflow_id_fkey" FOREIGN KEY ("workflow_id") REFERENCES "public"."old_ai_workflows"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."workflow_templates"
    ADD CONSTRAINT "workflow_templates_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



CREATE POLICY "Admins can manage all engine API keys" ON "public"."old_engine_api_keys" USING (("auth"."uid"() IN ( SELECT "old_engine_api_keys"."user_id"
   FROM "auth"."users"
  WHERE (("users"."role")::"text" = 'superadmin'::"text"))));



CREATE POLICY "Admins can manage all model metadata" ON "public"."ai_model_metadata" USING ((EXISTS ( SELECT 1
   FROM "public"."superadmin_users"
  WHERE ("superadmin_users"."id" = "auth"."uid"()))));



CREATE POLICY "Allow all operations on ai_api_keys" ON "public"."ai_api_keys" USING (true) WITH CHECK (true);



CREATE POLICY "Allow all operations on ai_model_metadata" ON "public"."ai_model_metadata" USING (true) WITH CHECK (true);



CREATE POLICY "Allow all operations on system_configs" ON "public"."system_configs" USING (true);



CREATE POLICY "Allow authenticated users to create engine API keys" ON "public"."old_engine_api_keys" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Allow authenticated users to create engine assignments" ON "public"."old_engine_assignments" FOR INSERT WITH CHECK (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Allow authenticated users to update ai_engines" ON "public"."ai_engines" FOR UPDATE USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Allow authenticated users to view active models" ON "public"."ai_model_metadata" FOR SELECT TO "authenticated" USING (("is_active" = true));



CREATE POLICY "Allow session management" ON "public"."user_sessions" USING (true) WITH CHECK (true);



CREATE POLICY "Allow specific superadmin user" ON "public"."ai_model_metadata" USING (("auth"."uid"() = '5950cad6-810b-4c5b-9d40-4485ea249770'::"uuid")) WITH CHECK (("auth"."uid"() = '5950cad6-810b-4c5b-9d40-4485ea249770'::"uuid"));



CREATE POLICY "Allow user registration" ON "public"."users" FOR INSERT WITH CHECK (true);



CREATE POLICY "Anon SuperAdmin AI flows access" ON "public"."ai_flows" TO "anon" USING (true) WITH CHECK (true);



CREATE POLICY "Anon SuperAdmin AI providers access" ON "public"."ai_providers" TO "anon" USING (true) WITH CHECK (true);



CREATE POLICY "Authenticated users can view level engines" ON "public"."level_engines" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Comprehensive AI flows access" ON "public"."ai_flows" TO "authenticated" USING ((("created_by" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."superadmin_users"
  WHERE ("superadmin_users"."id" = "auth"."uid"()))) OR ("auth"."uid"() IS NULL))) WITH CHECK ((("created_by" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."superadmin_users"
  WHERE ("superadmin_users"."id" = "auth"."uid"()))) OR ("auth"."uid"() IS NULL)));



ALTER TABLE "public"."OLD_level_access" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Public access to public templates" ON "public"."prompt_templates" FOR SELECT USING (("is_public" = true));



CREATE POLICY "Public can read level_access" ON "public"."level_access" FOR SELECT USING (true);



CREATE POLICY "Secure AI flows access" ON "public"."ai_flows" TO "authenticated" USING ((("created_by" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."superadmin_users"
  WHERE ("superadmin_users"."id" = "auth"."uid"()))))) WITH CHECK ((("created_by" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."superadmin_users"
  WHERE ("superadmin_users"."id" = "auth"."uid"())))));



CREATE POLICY "Secure AI providers access" ON "public"."ai_providers" TO "authenticated" USING ((("auth"."uid"() = "user_id") OR (EXISTS ( SELECT 1
   FROM "public"."superadmin_users"
  WHERE ("superadmin_users"."id" = "auth"."uid"()))))) WITH CHECK ((("auth"."uid"() = "user_id") OR (EXISTS ( SELECT 1
   FROM "public"."superadmin_users"
  WHERE ("superadmin_users"."id" = "auth"."uid"())))));



CREATE POLICY "SuperAdmin can create sync logs" ON "public"."master_sync_log" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'superadmin'::"text")))));



CREATE POLICY "SuperAdmin can delete engine API keys" ON "public"."old_engine_api_keys" FOR DELETE USING (true);



CREATE POLICY "SuperAdmin can delete engine assignments" ON "public"."old_engine_assignments" FOR DELETE USING (true);



CREATE POLICY "SuperAdmin can do everything on level_access" ON "public"."level_access" USING ((EXISTS ( SELECT 1
   FROM "public"."superadmin_users"
  WHERE (("superadmin_users"."id" = "auth"."uid"()) AND ("superadmin_users"."is_active" = true)))));



CREATE POLICY "SuperAdmin can insert templates" ON "public"."prompt_templates" FOR INSERT WITH CHECK (true);



CREATE POLICY "SuperAdmin can manage all engine preferences" ON "public"."user_engine_preferences" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'superadmin'::"text")))));



CREATE POLICY "SuperAdmin can manage all level access" ON "public"."OLD_level_access" USING ((EXISTS ( SELECT 1
   FROM "public"."superadmin_users"
  WHERE (("superadmin_users"."id" = "auth"."uid"()) AND ("superadmin_users"."is_active" = true)))));



CREATE POLICY "SuperAdmin can manage all prompt templates" ON "public"."prompt_templates" USING (true);



CREATE POLICY "SuperAdmin can manage all users" ON "public"."users" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."superadmin_users"
  WHERE ("superadmin_users"."id" = "auth"."uid"()))));



CREATE POLICY "SuperAdmin can manage level engines" ON "public"."level_engines" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'superadmin'::"text")))));



CREATE POLICY "SuperAdmin can manage user engines" ON "public"."user_engines" USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'superadmin'::"text")))));



CREATE POLICY "SuperAdmin can update engine API keys" ON "public"."old_engine_api_keys" FOR UPDATE USING (true);



CREATE POLICY "SuperAdmin can update engine assignments" ON "public"."old_engine_assignments" FOR UPDATE USING (true);



CREATE POLICY "SuperAdmin can update sync logs" ON "public"."master_sync_log" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'superadmin'::"text")))));



CREATE POLICY "SuperAdmin can view all preferences" ON "public"."user_preferences" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'superadmin'::"text")))));



CREATE POLICY "SuperAdmin can view all references" ON "public"."user_references" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'superadmin'::"text")))));



CREATE POLICY "SuperAdmin can view all sync logs" ON "public"."master_sync_log" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'superadmin'::"text")))));



CREATE POLICY "SuperAdmin can view all user engines" ON "public"."user_engines" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."users"
  WHERE (("users"."id" = "auth"."uid"()) AND ("users"."role" = 'superadmin'::"text")))));



CREATE POLICY "SuperAdmin can view all users" ON "public"."users" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."superadmin_users"
  WHERE ("superadmin_users"."id" = "auth"."uid"()))));



CREATE POLICY "SuperAdmin full access sessions" ON "public"."user_sessions" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."superadmin_users"
  WHERE (("superadmin_users"."id" = "auth"."uid"()) AND ("superadmin_users"."is_active" = true))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."superadmin_users"
  WHERE (("superadmin_users"."id" = "auth"."uid"()) AND ("superadmin_users"."is_active" = true)))));



CREATE POLICY "SuperAdmin full access users" ON "public"."users" TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."superadmin_users"
  WHERE (("superadmin_users"."id" = "auth"."uid"()) AND ("superadmin_users"."is_active" = true))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."superadmin_users"
  WHERE (("superadmin_users"."id" = "auth"."uid"()) AND ("superadmin_users"."is_active" = true)))));



CREATE POLICY "System can insert admin actions" ON "public"."admin_actions" FOR INSERT TO "authenticated" WITH CHECK (("admin_id" = "auth"."uid"()));



CREATE POLICY "System can insert audit log" ON "public"."admin_audit_log" FOR INSERT WITH CHECK (true);



CREATE POLICY "System can insert quality results" ON "public"."quality_gate_results" FOR INSERT WITH CHECK (true);



CREATE POLICY "Users can create advanced workflow executions" ON "public"."advanced_workflow_executions" FOR INSERT TO "authenticated" WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can create advanced workflows" ON "public"."advanced_workflows" FOR INSERT TO "authenticated" WITH CHECK (("created_by" = "auth"."uid"()));



CREATE POLICY "Users can create book sections" ON "public"."book_sections" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."books"
  WHERE (("books"."id" = "book_sections"."book_id") AND ("books"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can create engine API keys" ON "public"."old_engine_api_keys" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create own books" ON "public"."books" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create own engine preferences" ON "public"."user_engine_preferences" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create own executions" ON "public"."old_workflow_executions" FOR INSERT WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can create own preferences" ON "public"."user_preferences" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create own references" ON "public"."user_references" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create templates" ON "public"."book_templates" FOR INSERT WITH CHECK (("auth"."uid"() = "created_by"));



CREATE POLICY "Users can create templates" ON "public"."workflow_templates" FOR INSERT WITH CHECK (("created_by" = "auth"."uid"()));



CREATE POLICY "Users can create workflows" ON "public"."old_ai_workflows" FOR INSERT WITH CHECK (("created_by" = "auth"."uid"()));



CREATE POLICY "Users can delete book sections" ON "public"."book_sections" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."books"
  WHERE (("books"."id" = "book_sections"."book_id") AND ("books"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can delete own books" ON "public"."books" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own engine API keys" ON "public"."old_engine_api_keys" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own engine preferences" ON "public"."user_engine_preferences" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own preferences" ON "public"."user_preferences" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own references" ON "public"."user_references" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete own templates" ON "public"."book_templates" FOR DELETE USING (("auth"."uid"() = "created_by"));



CREATE POLICY "Users can delete own templates" ON "public"."workflow_templates" FOR DELETE USING (("created_by" = "auth"."uid"()));



CREATE POLICY "Users can delete own workflows" ON "public"."old_ai_workflows" FOR DELETE USING (("created_by" = "auth"."uid"()));



CREATE POLICY "Users can delete their own advanced workflows" ON "public"."advanced_workflows" FOR DELETE TO "authenticated" USING (("created_by" = "auth"."uid"()));



CREATE POLICY "Users can insert own credits" ON "public"."old_user_credits" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own executions" ON "public"."engine_executions" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own profile" ON "public"."profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can insert own subscriptions" ON "public"."subscriptions" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert own usage logs" ON "public"."usage_logs" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage own AI models" ON "public"."old_user_ai_models" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can manage own API keys" ON "public"."old_user_api_keys" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage own analytics" ON "public"."user_analytics" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can manage own flows" ON "public"."old_user_flows" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can manage own settings" ON "public"."user_settings" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can manage own workflows" ON "public"."old_user_workflows" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can read public settings" ON "public"."system_settings" FOR SELECT USING (("is_public" = true));



CREATE POLICY "Users can update book sections" ON "public"."book_sections" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."books"
  WHERE (("books"."id" = "book_sections"."book_id") AND ("books"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can update own books" ON "public"."books" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own credits" ON "public"."old_user_credits" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own engine API keys" ON "public"."old_engine_api_keys" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own engine preferences" ON "public"."user_engine_preferences" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own engines" ON "public"."user_engines" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own executions" ON "public"."engine_executions" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own executions" ON "public"."old_workflow_executions" FOR UPDATE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update own preferences" ON "public"."user_preferences" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update own profile" ON "public"."users" FOR UPDATE USING (true) WITH CHECK (true);



CREATE POLICY "Users can update own references" ON "public"."user_references" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own subscriptions" ON "public"."subscriptions" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own templates" ON "public"."book_templates" FOR UPDATE USING (("auth"."uid"() = "created_by"));



CREATE POLICY "Users can update own templates" ON "public"."workflow_templates" FOR UPDATE USING (("created_by" = "auth"."uid"()));



CREATE POLICY "Users can update own workflows" ON "public"."old_ai_workflows" FOR UPDATE USING (("created_by" = "auth"."uid"()));



CREATE POLICY "Users can update their own advanced workflow executions" ON "public"."advanced_workflow_executions" FOR UPDATE TO "authenticated" USING (("user_id" = "auth"."uid"())) WITH CHECK (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update their own advanced workflows" ON "public"."advanced_workflows" FOR UPDATE TO "authenticated" USING (("created_by" = "auth"."uid"())) WITH CHECK (("created_by" = "auth"."uid"()));



CREATE POLICY "Users can view assignments for their workflows" ON "public"."old_workflow_assignments" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."old_ai_workflows"
  WHERE (("old_ai_workflows"."id" = "old_workflow_assignments"."workflow_id") AND ("old_ai_workflows"."created_by" = "auth"."uid"())))));



CREATE POLICY "Users can view book sections" ON "public"."book_sections" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."books"
  WHERE (("books"."id" = "book_sections"."book_id") AND (("books"."user_id" = "auth"."uid"()) OR ("books"."is_public" = true))))));



CREATE POLICY "Users can view engines assigned to them" ON "public"."ai_engines" FOR SELECT USING (("id" IN ( SELECT "old_engine_assignments"."engine_id"
   FROM "public"."old_engine_assignments"
  WHERE ((("old_engine_assignments"."assignment_type" = 'user'::"text") AND ("old_engine_assignments"."user_id" = "auth"."uid"())) OR (("old_engine_assignments"."assignment_type" = 'tier'::"text") AND ("old_engine_assignments"."tier" = ( SELECT "old_user_credits"."tier"
           FROM "public"."old_user_credits"
          WHERE ("old_user_credits"."user_id" = "auth"."uid"()))))))));



CREATE POLICY "Users can view level access" ON "public"."OLD_level_access" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Users can view own API keys" ON "public"."old_user_api_keys" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own books" ON "public"."books" FOR SELECT USING ((("auth"."uid"() = "user_id") OR ("is_public" = true)));



CREATE POLICY "Users can view own credits" ON "public"."old_user_credits" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own engine API keys" ON "public"."old_engine_api_keys" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own engine preferences" ON "public"."user_engine_preferences" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own engines" ON "public"."user_engines" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own executions" ON "public"."engine_executions" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own executions" ON "public"."old_workflow_executions" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view own preferences" ON "public"."user_preferences" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own profile" ON "public"."profiles" FOR SELECT USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can view own profile" ON "public"."users" FOR SELECT USING (true);



CREATE POLICY "Users can view own quality results" ON "public"."quality_gate_results" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."old_workflow_executions"
  WHERE (("old_workflow_executions"."id" = "quality_gate_results"."execution_id") AND ("old_workflow_executions"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can view own references" ON "public"."user_references" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own subscriptions" ON "public"."subscriptions" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own usage logs" ON "public"."usage_logs" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view own workflows" ON "public"."old_ai_workflows" FOR SELECT USING (("created_by" = "auth"."uid"()));



CREATE POLICY "Users can view public templates" ON "public"."book_templates" FOR SELECT USING ((("is_public" = true) OR ("created_by" = "auth"."uid"())));



CREATE POLICY "Users can view public templates" ON "public"."workflow_templates" FOR SELECT USING ((("is_public" = true) OR ("created_by" = "auth"."uid"())));



CREATE POLICY "Users can view their assignments" ON "public"."old_engine_assignments" FOR SELECT USING (((("assignment_type" = 'user'::"text") AND ("user_id" = "auth"."uid"())) OR (("assignment_type" = 'tier'::"text") AND ("tier" = ( SELECT "old_user_credits"."tier"
   FROM "public"."old_user_credits"
  WHERE ("old_user_credits"."user_id" = "auth"."uid"()))))));



CREATE POLICY "Users can view their own advanced workflow executions" ON "public"."advanced_workflow_executions" FOR SELECT TO "authenticated" USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can view their own advanced workflows" ON "public"."advanced_workflows" FOR SELECT TO "authenticated" USING (("created_by" = "auth"."uid"()));



ALTER TABLE "public"."admin_actions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."admin_audit_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."advanced_workflow_executions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."advanced_workflows" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_api_keys" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_engine_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_engine_stats" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_engines" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_flows" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_model_metadata" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_providers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_request_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_service_configs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_services" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "anon_access_admin_sessions" ON "public"."admin_sessions" TO "anon" USING (true);



CREATE POLICY "anon_access_superadmin_users" ON "public"."superadmin_users" TO "anon" USING (true);



ALTER TABLE "public"."book_sections" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."book_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."books" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."engine_executions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."feature_flags" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."level_access" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."level_engines" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."master_sync_log" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."old_ai_workflows" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."old_engine_api_keys" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."old_engine_assignments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."old_user_ai_models" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."old_user_api_keys" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."old_user_credits" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."old_user_flows" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."old_user_workflows" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."old_workflow_assignments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."old_workflow_executions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."prompt_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."quality_gate_results" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."rate_limits" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."subscriptions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."system_configs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."system_events" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."system_health_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."system_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."system_stats" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."task_ai_mappings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."usage_logs" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_analytics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_engine_preferences" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_engines" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_preferences" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_references" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_settings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."workflow_templates" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."assign_engine_to_level"("p_level_id" "uuid", "p_engine_id" "uuid", "p_access_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."assign_engine_to_level"("p_level_id" "uuid", "p_engine_id" "uuid", "p_access_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."assign_engine_to_level"("p_level_id" "uuid", "p_engine_id" "uuid", "p_access_type" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."assign_engine_to_user"("p_user_id" "uuid", "p_engine_id" "uuid", "p_assigned_by" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."assign_engine_to_user"("p_user_id" "uuid", "p_engine_id" "uuid", "p_assigned_by" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."assign_engine_to_user"("p_user_id" "uuid", "p_engine_id" "uuid", "p_assigned_by" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."assign_preference_to_all_engines"("p_user_id" "uuid", "p_preference_id" "uuid", "p_reference_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."assign_preference_to_all_engines"("p_user_id" "uuid", "p_preference_id" "uuid", "p_reference_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."assign_preference_to_all_engines"("p_user_id" "uuid", "p_preference_id" "uuid", "p_reference_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."assign_user_to_level"("p_user_id" "uuid", "p_level_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."assign_user_to_level"("p_user_id" "uuid", "p_level_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."assign_user_to_level"("p_user_id" "uuid", "p_level_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."audit_user_access"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."audit_user_access"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."audit_user_access"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."auto_assign_engines_for_level"("p_user_id" "uuid", "p_level_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."auto_assign_engines_for_level"("p_user_id" "uuid", "p_level_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."auto_assign_engines_for_level"("p_user_id" "uuid", "p_level_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_feature_access"("p_user_id" "uuid", "p_feature_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."check_feature_access"("p_user_id" "uuid", "p_feature_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_feature_access"("p_user_id" "uuid", "p_feature_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."check_user_feature_access"("p_user_id" "uuid", "p_feature_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."check_user_feature_access"("p_user_id" "uuid", "p_feature_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."check_user_feature_access"("p_user_id" "uuid", "p_feature_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."cleanup_old_usage_logs"() TO "anon";
GRANT ALL ON FUNCTION "public"."cleanup_old_usage_logs"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cleanup_old_usage_logs"() TO "service_role";



GRANT ALL ON FUNCTION "public"."create_user_engines_for_new_user"("p_user_id" "uuid", "p_tier" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_user_engines_for_new_user"("p_user_id" "uuid", "p_tier" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_user_engines_for_new_user"("p_user_id" "uuid", "p_tier" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_user_session"("p_user_id" "uuid", "p_session_data" "jsonb", "p_expires_at" timestamp with time zone) TO "anon";
GRANT ALL ON FUNCTION "public"."create_user_session"("p_user_id" "uuid", "p_session_data" "jsonb", "p_expires_at" timestamp with time zone) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_user_session"("p_user_id" "uuid", "p_session_data" "jsonb", "p_expires_at" timestamp with time zone) TO "service_role";



GRANT ALL ON FUNCTION "public"."debug_auth_context"() TO "anon";
GRANT ALL ON FUNCTION "public"."debug_auth_context"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."debug_auth_context"() TO "service_role";



GRANT ALL ON FUNCTION "public"."enforce_engine_access"() TO "anon";
GRANT ALL ON FUNCTION "public"."enforce_engine_access"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."enforce_engine_access"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_engine_api_key"("p_user_id" "uuid", "p_engine_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_engine_api_key"("p_user_id" "uuid", "p_engine_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_engine_api_key"("p_user_id" "uuid", "p_engine_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_user_engine_api_key"("p_user_id" "uuid", "p_engine_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."generate_user_engine_api_key"("p_user_id" "uuid", "p_engine_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_user_engine_api_key"("p_user_id" "uuid", "p_engine_id" "uuid") TO "service_role";



GRANT ALL ON TABLE "public"."admin_config" TO "anon";
GRANT ALL ON TABLE "public"."admin_config" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_config" TO "service_role";



GRANT ALL ON FUNCTION "public"."get_admin_config_direct"("p_config_type" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_admin_config_direct"("p_config_type" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_admin_config_direct"("p_config_type" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_access_level"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_access_level"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_access_level"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_accessible_features"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_accessible_features"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_accessible_features"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_analytics"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_analytics"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_analytics"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_global_preferences"("p_user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_global_preferences"("p_user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_global_preferences"("p_user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_tier_info"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_tier_info"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_tier_info"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_user_delete"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_user_delete"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_user_delete"() TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_user_update"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_user_update"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_user_update"() TO "service_role";



GRANT ALL ON FUNCTION "public"."hash_password"("p_password" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."hash_password"("p_password" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."hash_password"("p_password" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_template_usage"("template_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."increment_template_usage"("template_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_template_usage"("template_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."increment_usage_count"() TO "anon";
GRANT ALL ON FUNCTION "public"."increment_usage_count"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."increment_usage_count"() TO "service_role";



GRANT ALL ON FUNCTION "public"."log_admin_action"() TO "anon";
GRANT ALL ON FUNCTION "public"."log_admin_action"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."log_admin_action"() TO "service_role";



GRANT ALL ON FUNCTION "public"."logout_user_session"("p_session_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."logout_user_session"("p_session_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."logout_user_session"("p_session_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."reset_monthly_credits"() TO "anon";
GRANT ALL ON FUNCTION "public"."reset_monthly_credits"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."reset_monthly_credits"() TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_master_engine_to_users"("p_master_engine_id" "uuid", "p_sync_type" "text", "p_sync_details" "jsonb", "p_synced_by" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."sync_master_engine_to_users"("p_master_engine_id" "uuid", "p_sync_type" "text", "p_sync_details" "jsonb", "p_synced_by" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_master_engine_to_users"("p_master_engine_id" "uuid", "p_sync_type" "text", "p_sync_details" "jsonb", "p_synced_by" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."trigger_create_user_engines"() TO "anon";
GRANT ALL ON FUNCTION "public"."trigger_create_user_engines"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."trigger_create_user_engines"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_admin_config_direct"("p_config_type" "text", "p_config_data" "jsonb", "p_created_by" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."update_admin_config_direct"("p_config_type" "text", "p_config_data" "jsonb", "p_created_by" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_admin_config_direct"("p_config_type" "text", "p_config_data" "jsonb", "p_created_by" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_advanced_workflows_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_advanced_workflows_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_advanced_workflows_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_ai_providers_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_ai_providers_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_ai_providers_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_level_access_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_level_access_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_level_access_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_prompt_templates_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_prompt_templates_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_prompt_templates_updated_at"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_system_stats"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_system_stats"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_system_stats"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON FUNCTION "public"."user_has_feature"("user_id" "uuid", "feature" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."user_has_feature"("user_id" "uuid", "feature" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."user_has_feature"("user_id" "uuid", "feature" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_tier_upgrade"("p_user_id" "uuid", "p_new_tier" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."validate_tier_upgrade"("p_user_id" "uuid", "p_new_tier" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_tier_upgrade"("p_user_id" "uuid", "p_new_tier" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."validate_user_session"("p_session_id" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."validate_user_session"("p_session_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."validate_user_session"("p_session_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."verify_password"("p_password" "text", "p_hash" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."verify_password"("p_password" "text", "p_hash" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."verify_password"("p_password" "text", "p_hash" "text") TO "service_role";


















GRANT ALL ON TABLE "public"."OLD_level_access" TO "anon";
GRANT ALL ON TABLE "public"."OLD_level_access" TO "authenticated";
GRANT ALL ON TABLE "public"."OLD_level_access" TO "service_role";



GRANT ALL ON TABLE "public"."admin_actions" TO "anon";
GRANT ALL ON TABLE "public"."admin_actions" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_actions" TO "service_role";



GRANT ALL ON TABLE "public"."admin_audit_log" TO "anon";
GRANT ALL ON TABLE "public"."admin_audit_log" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_audit_log" TO "service_role";



GRANT ALL ON TABLE "public"."admin_sessions" TO "anon";
GRANT ALL ON TABLE "public"."admin_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."advanced_workflow_executions" TO "anon";
GRANT ALL ON TABLE "public"."advanced_workflow_executions" TO "authenticated";
GRANT ALL ON TABLE "public"."advanced_workflow_executions" TO "service_role";



GRANT ALL ON TABLE "public"."advanced_workflows" TO "anon";
GRANT ALL ON TABLE "public"."advanced_workflows" TO "authenticated";
GRANT ALL ON TABLE "public"."advanced_workflows" TO "service_role";



GRANT ALL ON TABLE "public"."ai_api_keys" TO "anon";
GRANT ALL ON TABLE "public"."ai_api_keys" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_api_keys" TO "service_role";



GRANT ALL ON TABLE "public"."ai_engine_logs" TO "anon";
GRANT ALL ON TABLE "public"."ai_engine_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_engine_logs" TO "service_role";



GRANT ALL ON TABLE "public"."ai_engine_stats" TO "anon";
GRANT ALL ON TABLE "public"."ai_engine_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_engine_stats" TO "service_role";



GRANT ALL ON TABLE "public"."ai_engines" TO "anon";
GRANT ALL ON TABLE "public"."ai_engines" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_engines" TO "service_role";



GRANT ALL ON TABLE "public"."ai_flows" TO "anon";
GRANT ALL ON TABLE "public"."ai_flows" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_flows" TO "service_role";



GRANT ALL ON TABLE "public"."ai_model_metadata" TO "anon";
GRANT ALL ON TABLE "public"."ai_model_metadata" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_model_metadata" TO "service_role";



GRANT ALL ON TABLE "public"."ai_providers" TO "anon";
GRANT ALL ON TABLE "public"."ai_providers" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_providers" TO "service_role";



GRANT ALL ON TABLE "public"."ai_request_logs" TO "anon";
GRANT ALL ON TABLE "public"."ai_request_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_request_logs" TO "service_role";



GRANT ALL ON TABLE "public"."ai_service_configs" TO "anon";
GRANT ALL ON TABLE "public"."ai_service_configs" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_service_configs" TO "service_role";



GRANT ALL ON TABLE "public"."ai_services" TO "anon";
GRANT ALL ON TABLE "public"."ai_services" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_services" TO "service_role";



GRANT ALL ON TABLE "public"."book_sections" TO "anon";
GRANT ALL ON TABLE "public"."book_sections" TO "authenticated";
GRANT ALL ON TABLE "public"."book_sections" TO "service_role";



GRANT ALL ON TABLE "public"."book_templates" TO "anon";
GRANT ALL ON TABLE "public"."book_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."book_templates" TO "service_role";



GRANT ALL ON TABLE "public"."books" TO "anon";
GRANT ALL ON TABLE "public"."books" TO "authenticated";
GRANT ALL ON TABLE "public"."books" TO "service_role";



GRANT ALL ON TABLE "public"."engine_executions" TO "anon";
GRANT ALL ON TABLE "public"."engine_executions" TO "authenticated";
GRANT ALL ON TABLE "public"."engine_executions" TO "service_role";



GRANT ALL ON TABLE "public"."feature_flags" TO "anon";
GRANT ALL ON TABLE "public"."feature_flags" TO "authenticated";
GRANT ALL ON TABLE "public"."feature_flags" TO "service_role";



GRANT ALL ON TABLE "public"."level_access" TO "anon";
GRANT ALL ON TABLE "public"."level_access" TO "authenticated";
GRANT ALL ON TABLE "public"."level_access" TO "service_role";



GRANT ALL ON TABLE "public"."level_access_backup" TO "anon";
GRANT ALL ON TABLE "public"."level_access_backup" TO "authenticated";
GRANT ALL ON TABLE "public"."level_access_backup" TO "service_role";



GRANT ALL ON TABLE "public"."level_analytics" TO "anon";
GRANT ALL ON TABLE "public"."level_analytics" TO "authenticated";
GRANT ALL ON TABLE "public"."level_analytics" TO "service_role";



GRANT ALL ON TABLE "public"."level_benefits" TO "anon";
GRANT ALL ON TABLE "public"."level_benefits" TO "authenticated";
GRANT ALL ON TABLE "public"."level_benefits" TO "service_role";



GRANT ALL ON TABLE "public"."level_comparison" TO "anon";
GRANT ALL ON TABLE "public"."level_comparison" TO "authenticated";
GRANT ALL ON TABLE "public"."level_comparison" TO "service_role";



GRANT ALL ON TABLE "public"."level_engines" TO "anon";
GRANT ALL ON TABLE "public"."level_engines" TO "authenticated";
GRANT ALL ON TABLE "public"."level_engines" TO "service_role";



GRANT ALL ON TABLE "public"."level_feature_usage" TO "anon";
GRANT ALL ON TABLE "public"."level_feature_usage" TO "authenticated";
GRANT ALL ON TABLE "public"."level_feature_usage" TO "service_role";



GRANT ALL ON TABLE "public"."level_features" TO "anon";
GRANT ALL ON TABLE "public"."level_features" TO "authenticated";
GRANT ALL ON TABLE "public"."level_features" TO "service_role";



GRANT ALL ON TABLE "public"."level_pricing" TO "anon";
GRANT ALL ON TABLE "public"."level_pricing" TO "authenticated";
GRANT ALL ON TABLE "public"."level_pricing" TO "service_role";



GRANT ALL ON TABLE "public"."level_restrictions" TO "anon";
GRANT ALL ON TABLE "public"."level_restrictions" TO "authenticated";
GRANT ALL ON TABLE "public"."level_restrictions" TO "service_role";



GRANT ALL ON TABLE "public"."level_upgrade_paths" TO "anon";
GRANT ALL ON TABLE "public"."level_upgrade_paths" TO "authenticated";
GRANT ALL ON TABLE "public"."level_upgrade_paths" TO "service_role";



GRANT ALL ON TABLE "public"."levels" TO "anon";
GRANT ALL ON TABLE "public"."levels" TO "authenticated";
GRANT ALL ON TABLE "public"."levels" TO "service_role";



GRANT ALL ON TABLE "public"."master_sync_log" TO "anon";
GRANT ALL ON TABLE "public"."master_sync_log" TO "authenticated";
GRANT ALL ON TABLE "public"."master_sync_log" TO "service_role";



GRANT ALL ON TABLE "public"."old_ai_workflows" TO "anon";
GRANT ALL ON TABLE "public"."old_ai_workflows" TO "authenticated";
GRANT ALL ON TABLE "public"."old_ai_workflows" TO "service_role";



GRANT ALL ON TABLE "public"."old_engine_api_keys" TO "anon";
GRANT ALL ON TABLE "public"."old_engine_api_keys" TO "authenticated";
GRANT ALL ON TABLE "public"."old_engine_api_keys" TO "service_role";



GRANT ALL ON TABLE "public"."old_engine_assignments" TO "anon";
GRANT ALL ON TABLE "public"."old_engine_assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."old_engine_assignments" TO "service_role";



GRANT ALL ON TABLE "public"."old_level_workflow_assignments" TO "anon";
GRANT ALL ON TABLE "public"."old_level_workflow_assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."old_level_workflow_assignments" TO "service_role";



GRANT ALL ON TABLE "public"."old_user_ai_models" TO "anon";
GRANT ALL ON TABLE "public"."old_user_ai_models" TO "authenticated";
GRANT ALL ON TABLE "public"."old_user_ai_models" TO "service_role";



GRANT ALL ON TABLE "public"."old_user_api_keys" TO "anon";
GRANT ALL ON TABLE "public"."old_user_api_keys" TO "authenticated";
GRANT ALL ON TABLE "public"."old_user_api_keys" TO "service_role";



GRANT ALL ON TABLE "public"."old_user_credits" TO "anon";
GRANT ALL ON TABLE "public"."old_user_credits" TO "authenticated";
GRANT ALL ON TABLE "public"."old_user_credits" TO "service_role";



GRANT ALL ON TABLE "public"."old_user_flows" TO "anon";
GRANT ALL ON TABLE "public"."old_user_flows" TO "authenticated";
GRANT ALL ON TABLE "public"."old_user_flows" TO "service_role";



GRANT ALL ON TABLE "public"."old_user_workflows" TO "anon";
GRANT ALL ON TABLE "public"."old_user_workflows" TO "authenticated";
GRANT ALL ON TABLE "public"."old_user_workflows" TO "service_role";



GRANT ALL ON TABLE "public"."old_workflow_assignments" TO "anon";
GRANT ALL ON TABLE "public"."old_workflow_assignments" TO "authenticated";
GRANT ALL ON TABLE "public"."old_workflow_assignments" TO "service_role";



GRANT ALL ON TABLE "public"."old_workflow_executions" TO "anon";
GRANT ALL ON TABLE "public"."old_workflow_executions" TO "authenticated";
GRANT ALL ON TABLE "public"."old_workflow_executions" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT ALL ON TABLE "public"."prompt_templates" TO "anon";
GRANT ALL ON TABLE "public"."prompt_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."prompt_templates" TO "service_role";



GRANT ALL ON TABLE "public"."quality_gate_results" TO "anon";
GRANT ALL ON TABLE "public"."quality_gate_results" TO "authenticated";
GRANT ALL ON TABLE "public"."quality_gate_results" TO "service_role";



GRANT ALL ON TABLE "public"."rate_limits" TO "anon";
GRANT ALL ON TABLE "public"."rate_limits" TO "authenticated";
GRANT ALL ON TABLE "public"."rate_limits" TO "service_role";



GRANT ALL ON TABLE "public"."subscriptions" TO "anon";
GRANT ALL ON TABLE "public"."subscriptions" TO "authenticated";
GRANT ALL ON TABLE "public"."subscriptions" TO "service_role";



GRANT ALL ON TABLE "public"."superadmin_users" TO "anon";
GRANT ALL ON TABLE "public"."superadmin_users" TO "authenticated";
GRANT ALL ON TABLE "public"."superadmin_users" TO "service_role";



GRANT ALL ON TABLE "public"."system_configs" TO "anon";
GRANT ALL ON TABLE "public"."system_configs" TO "authenticated";
GRANT ALL ON TABLE "public"."system_configs" TO "service_role";



GRANT ALL ON TABLE "public"."system_events" TO "anon";
GRANT ALL ON TABLE "public"."system_events" TO "authenticated";
GRANT ALL ON TABLE "public"."system_events" TO "service_role";



GRANT ALL ON TABLE "public"."system_health_logs" TO "anon";
GRANT ALL ON TABLE "public"."system_health_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."system_health_logs" TO "service_role";



GRANT ALL ON TABLE "public"."system_settings" TO "anon";
GRANT ALL ON TABLE "public"."system_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."system_settings" TO "service_role";



GRANT ALL ON TABLE "public"."system_stats" TO "anon";
GRANT ALL ON TABLE "public"."system_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."system_stats" TO "service_role";



GRANT ALL ON TABLE "public"."task_ai_mappings" TO "anon";
GRANT ALL ON TABLE "public"."task_ai_mappings" TO "authenticated";
GRANT ALL ON TABLE "public"."task_ai_mappings" TO "service_role";



GRANT ALL ON TABLE "public"."usage_logs" TO "anon";
GRANT ALL ON TABLE "public"."usage_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."usage_logs" TO "service_role";



GRANT ALL ON TABLE "public"."user_analytics" TO "anon";
GRANT ALL ON TABLE "public"."user_analytics" TO "authenticated";
GRANT ALL ON TABLE "public"."user_analytics" TO "service_role";



GRANT ALL ON TABLE "public"."user_engine_preferences" TO "anon";
GRANT ALL ON TABLE "public"."user_engine_preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."user_engine_preferences" TO "service_role";



GRANT ALL ON TABLE "public"."user_engines" TO "anon";
GRANT ALL ON TABLE "public"."user_engines" TO "authenticated";
GRANT ALL ON TABLE "public"."user_engines" TO "service_role";



GRANT ALL ON TABLE "public"."user_preferences" TO "anon";
GRANT ALL ON TABLE "public"."user_preferences" TO "authenticated";
GRANT ALL ON TABLE "public"."user_preferences" TO "service_role";



GRANT ALL ON TABLE "public"."user_references" TO "anon";
GRANT ALL ON TABLE "public"."user_references" TO "authenticated";
GRANT ALL ON TABLE "public"."user_references" TO "service_role";



GRANT ALL ON TABLE "public"."user_sessions" TO "anon";
GRANT ALL ON TABLE "public"."user_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."user_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."user_settings" TO "anon";
GRANT ALL ON TABLE "public"."user_settings" TO "authenticated";
GRANT ALL ON TABLE "public"."user_settings" TO "service_role";



GRANT ALL ON TABLE "public"."users" TO "anon";
GRANT ALL ON TABLE "public"."users" TO "authenticated";
GRANT ALL ON TABLE "public"."users" TO "service_role";



GRANT ALL ON TABLE "public"."workflow_templates" TO "anon";
GRANT ALL ON TABLE "public"."workflow_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."workflow_templates" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
