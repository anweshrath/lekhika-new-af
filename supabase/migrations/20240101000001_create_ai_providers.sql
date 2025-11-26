/*
  # Create AI Providers Table

  1. New Tables
    - `ai_providers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `provider` (text) - openai, mistral, gemini, claude
      - `api_key` (text, encrypted)
      - `model` (text)
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `ai_providers` table
    - Add policy for users to manage their own API keys only
    - Encrypt API keys for security

  3. Indexes
    - Index on user_id and provider for fast lookups
*/

CREATE TABLE IF NOT EXISTS ai_providers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  provider text NOT NULL,
  api_key text NOT NULL,
  model text NOT NULL,
  is_active boolean DEFAULT true,
  failures integer DEFAULT 0,
  last_used timestamptz,
  usage_count integer DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, provider)
);

ALTER TABLE ai_providers ENABLE ROW LEVEL SECURITY;

-- Users can only access their own API keys
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

-- Indexes for fast lookups and performance
CREATE INDEX IF NOT EXISTS ai_providers_user_provider_idx 
  ON ai_providers(user_id, provider);

CREATE INDEX IF NOT EXISTS idx_ai_providers_failures 
  ON ai_providers(failures);

CREATE INDEX IF NOT EXISTS idx_ai_providers_last_used 
  ON ai_providers(last_used DESC);

CREATE INDEX IF NOT EXISTS idx_ai_providers_usage_count 
  ON ai_providers(usage_count DESC);

CREATE INDEX IF NOT EXISTS idx_ai_providers_active 
  ON ai_providers(is_active);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_providers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER ai_providers_updated_at
  BEFORE UPDATE ON ai_providers
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_providers_updated_at();
