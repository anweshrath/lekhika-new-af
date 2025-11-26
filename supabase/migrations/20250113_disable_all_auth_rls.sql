-- FIX: Disable RLS on all tables that use custom auth instead of Supabase auth.users
-- The schema was incorrectly created with auth.uid() policies when the app uses custom users table

-- Disable RLS on books table
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'books') THEN
        ALTER TABLE books DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS disabled on books';
    END IF;
END $$;

-- Disable RLS on book_sections table  
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'book_sections') THEN
        ALTER TABLE book_sections DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS disabled on book_sections';
    END IF;
END $$;

-- Disable RLS on usage_logs table
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'usage_logs') THEN
        ALTER TABLE usage_logs DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS disabled on usage_logs';
    END IF;
END $$;

-- Disable RLS on user_api_keys table (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_api_keys') THEN
        ALTER TABLE user_api_keys DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS disabled on user_api_keys';
    END IF;
END $$;

-- Disable RLS on profiles table (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS disabled on profiles';
    END IF;
END $$;

-- Disable RLS on user_credits table (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_credits') THEN
        ALTER TABLE user_credits DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS disabled on user_credits';
    END IF;
END $$;

-- Disable RLS on subscriptions table (if exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'subscriptions') THEN
        ALTER TABLE subscriptions DISABLE ROW LEVEL SECURITY;
        RAISE NOTICE 'RLS disabled on subscriptions';
    END IF;
END $$;

-- Add comments explaining why (only if tables exist)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'books') THEN
        COMMENT ON TABLE books IS 'RLS disabled - app uses custom users table with application-level access control, not auth.users';
    END IF;
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'book_sections') THEN
        COMMENT ON TABLE book_sections IS 'RLS disabled - app uses custom users table with application-level access control, not auth.users';
    END IF;
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'usage_logs') THEN
        COMMENT ON TABLE usage_logs IS 'RLS disabled - app uses custom users table with application-level access control, not auth.users';
    END IF;
END $$;

