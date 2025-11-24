-- Show ALL column names in ai_flows table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'ai_flows' 
ORDER BY ordinal_position;

-- Show sample data from one flow to see what's actually in each column
SELECT *
FROM ai_flows 
WHERE created_by = '5950cad6-810b-4c5b-9d40-4485ea249770'
LIMIT 1;
