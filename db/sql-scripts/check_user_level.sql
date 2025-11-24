-- Check user's actual level assignment
SELECT 
  u.id,
  u.email,
  u.tier,
  u.level_id,
  l.name as level_name,
  l.display_name,
  l.tier_level
FROM users u
LEFT JOIN levels l ON u.level_id = l.id
WHERE u.id = 'd8d605f6-c525-48c1-80d0-25fb463c7102';
