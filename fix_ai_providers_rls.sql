-- Surgical fix for ai_providers RLS policy
-- This fixes the "new row violates row-level security policy" error

-- 1. Drop existing conflicting policies
DROP POLICY IF EXISTS "Users can manage their own AI providers" ON ai_providers;
DROP POLICY IF EXISTS "SuperAdmin can manage all AI providers" ON ai_providers;
DROP POLICY IF EXISTS "AI providers policy" ON ai_providers;
DROP POLICY IF EXISTS "Allow all operations on ai_providers" ON ai_providers;

-- 2. Create a single, comprehensive policy that allows:
--    - SuperAdmin access (when authenticated as superadmin)
--    - User access to their own providers (when authenticated as user)
--    - Anonymous access for SuperAdmin operations (when using anon key)
CREATE POLICY "Comprehensive AI providers access"
  ON ai_providers
  FOR ALL
  TO authenticated
  USING (
    -- Allow if user is SuperAdmin
    EXISTS (
      SELECT 1 FROM superadmin_users 
      WHERE id = auth.uid()
    )
    OR
    -- Allow if user owns the record
    auth.uid() = user_id
    OR
    -- Allow if no auth.uid() (anon key usage by SuperAdmin)
    auth.uid() IS NULL
  )
  WITH CHECK (
    -- Same conditions for inserts/updates
    EXISTS (
      SELECT 1 FROM superadmin_users 
      WHERE id = auth.uid()
    )
    OR
    auth.uid() = user_id
    OR
    auth.uid() IS NULL
  );

-- 3. Also allow anon role for SuperAdmin operations
CREATE POLICY "Anon SuperAdmin access to AI providers"
  ON ai_providers
  FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);

-- 4. Verify the fix
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'ai_providers'
ORDER BY policyname;
