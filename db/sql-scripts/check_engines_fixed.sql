-- Check what engines exist in the database (Fixed)
-- Run this on Supabase Dashboard SQL Editor

-- 1. Check ai_engines table
SELECT id, name, active, created_at FROM ai_engines ORDER BY created_at DESC LIMIT 10;

-- 2. Check ai_flows table (where engines come from)
SELECT id, name, created_at FROM ai_flows ORDER BY created_at DESC LIMIT 10;

-- 3. Check if there are any engines at all
SELECT COUNT(*) as ai_engines_count FROM ai_engines;
SELECT COUNT(*) as ai_flows_count FROM ai_flows;

-- 4. Check the structure of ai_flows table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ai_flows' 
ORDER BY ordinal_position;
