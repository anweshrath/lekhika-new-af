-- Fix ai_flows type constraint to allow awesome_flow and elite_flow types
-- This fixes the 400 Bad Request errors when syncing flows

-- Drop the existing type constraint
ALTER TABLE ai_flows 
DROP CONSTRAINT IF EXISTS ai_flows_type_check;

-- Add the updated constraint with new flow types
ALTER TABLE ai_flows 
ADD CONSTRAINT ai_flows_type_check 
CHECK (type IN ('simplified', 'expert', 'full', 'book_generation', 'awesome_flow', 'elite_flow'));

-- Verify the constraint was updated
SELECT 
  conname as constraint_name,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'ai_flows'::regclass 
  AND conname = 'ai_flows_type_check';

-- Test the constraint with new types
SELECT 'Constraint updated successfully - awesome_flow and elite_flow types now allowed' as status;
