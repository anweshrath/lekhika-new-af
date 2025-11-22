-- Fix RLS policy for books table to allow ANY SuperAdmin user dynamically
-- This allows any user in the superadmin_users table to insert test runs into the books table

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can create own books" ON "public"."books";
DROP POLICY IF EXISTS "Users can update own books" ON "public"."books";
DROP POLICY IF EXISTS "Users can delete own books" ON "public"."books";

-- Create new policies that check your custom auth system (public.users and public.superadmin_users)
CREATE POLICY "Users and SuperAdmins can create books" ON "public"."books" 
FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM "public"."users" WHERE "id" = "user_id") OR 
    EXISTS (SELECT 1 FROM "public"."superadmin_users" WHERE "id" = "user_id")
);

CREATE POLICY "Users and SuperAdmins can update books" ON "public"."books" 
FOR UPDATE USING (
    EXISTS (SELECT 1 FROM "public"."users" WHERE "id" = "user_id") OR 
    EXISTS (SELECT 1 FROM "public"."superadmin_users" WHERE "id" = "user_id")
);

CREATE POLICY "Users and SuperAdmins can delete books" ON "public"."books" 
FOR DELETE USING (
    EXISTS (SELECT 1 FROM "public"."users" WHERE "id" = "user_id") OR 
    EXISTS (SELECT 1 FROM "public"."superadmin_users" WHERE "id" = "user_id")
);

-- Keep the existing SELECT policy unchanged (it already allows public books)
-- CREATE POLICY "Users can view own books" ON "public"."books" FOR SELECT USING ((("auth"."uid"() = "user_id") OR ("is_public" = true)));
