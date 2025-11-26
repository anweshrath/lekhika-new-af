-- Add missing columns to ai_flows table
ALTER TABLE ai_flows 
ADD COLUMN IF NOT EXISTS nodes jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS edges jsonb DEFAULT '[]',
ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}';

-- Update the type constraint to include 'book_generation'
ALTER TABLE ai_flows 
DROP CONSTRAINT IF EXISTS ai_flows_type_check;

ALTER TABLE ai_flows 
ADD CONSTRAINT ai_flows_type_check 
CHECK (type IN ('simplified', 'expert', 'full', 'book_generation'));

-- Add unique constraint for name and created_by (for upsert to work)
ALTER TABLE ai_flows
ADD CONSTRAINT ai_flows_name_created_by_unique 
UNIQUE (name, created_by);

-- Fix the created_by foreign key to allow superadmin users
-- First drop the existing foreign key constraint
ALTER TABLE ai_flows 
DROP CONSTRAINT IF EXISTS ai_flows_created_by_fkey;

-- Note: We're keeping created_by as UUID but not enforcing foreign key
-- This allows both auth.users and superadmin_users IDs to be used
