-- Diagnose the failing constraint
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.users'::regclass
    AND conname LIKE '%access_level_tier%';

-- Check users table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check levels table
SELECT id, name, display_name, tier_level FROM levels ORDER BY tier_level;

-- Check what the constraint expects vs what we're trying to insert
SELECT 
    'Expected values for constraint' as info,
    'tier should be one of: free, basic, premium, enterprise' as constraint_rule,
    'access_level should be between 1-10' as access_level_rule;
