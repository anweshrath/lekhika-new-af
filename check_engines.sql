-- Check what engines exist in the database
-- Run this on Supabase Dashboard SQL Editor

-- 1. Check ai_engines table
SELECT id, name, active, created_at FROM ai_engines ORDER BY created_at DESC LIMIT 10;

-- 2. Check ai_flows table (where engines come from)
SELECT id, name, status, created_at FROM ai_flows ORDER BY created_at DESC LIMIT 10;

-- 3. Check if there are any engines at all
SELECT COUNT(*) as ai_engines_count FROM ai_engines;
SELECT COUNT(*) as ai_flows_count FROM ai_flows;
