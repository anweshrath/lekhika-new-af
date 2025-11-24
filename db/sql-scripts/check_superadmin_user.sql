-- Check ALL superadmin users
SELECT 
    id,
    username, 
    email,
    full_name,
    is_active,
    created_at
FROM superadmin_users 
ORDER BY created_at DESC;
