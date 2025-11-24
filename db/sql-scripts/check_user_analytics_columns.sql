-- Check all columns in user_analytics table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'user_analytics'
ORDER BY ordinal_position;

