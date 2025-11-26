-- Run this SQL in your Supabase Dashboard > SQL Editor to fix the ai_providers table

-- 1. Drop the existing constraint
ALTER TABLE ai_providers DROP CONSTRAINT IF EXISTS ai_providers_provider_check;

-- 2. Drop existing policies
DROP POLICY IF EXISTS "Users can manage their own AI providers" ON ai_providers;
DROP POLICY IF EXISTS "SuperAdmin can manage all AI providers" ON ai_providers;

-- 3. Create new policies
CREATE POLICY "Users can manage their own AI providers"
  ON ai_providers
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow SuperAdmin access to all providers
CREATE POLICY "SuperAdmin can manage all AI providers"
  ON ai_providers
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM superadmin_users 
      WHERE id = auth.uid()
    )
  );

-- 4. Verify the table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'ai_providers' 
ORDER BY ordinal_position;

-- 5. Test inserting a provider
-- INSERT INTO ai_providers (user_id, provider, api_key, model, is_active) 
-- VALUES (gen_random_uuid(), 'test_provider', 'test_key', 'test_model', true);
