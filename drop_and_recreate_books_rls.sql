-- Drop ALL existing policies first, then recreate with correct auth system
-- This fixes the "policy already exists" error

-- Drop ALL existing policies on books table
DROP POLICY IF EXISTS "Users can create own books" ON "public"."books";
DROP POLICY IF EXISTS "Users can update own books" ON "public"."books";
DROP POLICY IF EXISTS "Users can delete own books" ON "public"."books";
DROP POLICY IF EXISTS "Users can view own books" ON "public"."books";
DROP POLICY IF EXISTS "Users and SuperAdmins can create books" ON "public"."books";
DROP POLICY IF EXISTS "Users and SuperAdmins can update books" ON "public"."books";
DROP POLICY IF EXISTS "Users and SuperAdmins can delete books" ON "public"."books";

-- Create NEW policies that work with your custom auth system (public.users and public.superadmin_users)
CREATE POLICY "Custom auth users can create books" ON "public"."books" 
FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM "public"."users" WHERE "id" = "user_id") OR 
    EXISTS (SELECT 1 FROM "public"."superadmin_users" WHERE "id" = "user_id")
);

CREATE POLICY "Custom auth users can update books" ON "public"."books" 
FOR UPDATE USING (
    EXISTS (SELECT 1 FROM "public"."users" WHERE "id" = "user_id") OR 
    EXISTS (SELECT 1 FROM "public"."superadmin_users" WHERE "id" = "user_id")
);

CREATE POLICY "Custom auth users can delete books" ON "public"."books" 
FOR DELETE USING (
    EXISTS (SELECT 1 FROM "public"."users" WHERE "id" = "user_id") OR 
    EXISTS (SELECT 1 FROM "public"."superadmin_users" WHERE "id" = "user_id")
);

CREATE POLICY "Custom auth users can view books" ON "public"."books" 
FOR SELECT USING (
    EXISTS (SELECT 1 FROM "public"."users" WHERE "id" = "user_id") OR 
    EXISTS (SELECT 1 FROM "public"."superadmin_users" WHERE "id" = "user_id") OR
    "is_public" = true
);
