-- Fix the duplicate key constraint issue
-- The problem is the UNIQUE (model_id) constraint conflicts with different providers having same model_id

-- First, let's see what constraints exist
SELECT conname, contype, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'ai_model_metadata'::regclass;

-- Drop the problematic unique constraint on model_id only
ALTER TABLE ai_model_metadata DROP CONSTRAINT IF EXISTS ai_model_metadata_model_id_key;

-- The composite unique constraint (provider, model_id) should remain
-- This allows different providers to have models with same model_id
