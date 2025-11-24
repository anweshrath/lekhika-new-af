-- =====================================================
-- CREATE TEST USERS FOR ALL LEVELS
-- Professional migration for adding test users
-- =====================================================

-- STEP 1: Insert test users for each level
-- Each level gets 2 test users with predictable credentials

-- HOBBY LEVEL USERS (tier=hobby, access_level=1)
INSERT INTO public.users (
    username, 
    email, 
    password_hash, 
    full_name, 
    tier,
    access_level,
    level_id, 
    is_active, 
    created_at, 
    updated_at
) VALUES 
-- Hobby User 1
(
    'hobby_user_1',
    'hobby1@test.com',
    crypt('password123', gen_salt('bf')),
    'Hobby User One',
    'hobby',
    1,
    (SELECT id FROM levels WHERE name = 'hobby'),
    true,
    NOW(),
    NOW()
),
-- Hobby User 2
(
    'hobby_user_2',
    'hobby2@test.com',
    crypt('password123', gen_salt('bf')),
    'Hobby User Two',
    'hobby',
    1,
    (SELECT id FROM levels WHERE name = 'hobby'),
    true,
    NOW(),
    NOW()
),
-- PRO LEVEL USERS
(
    'pro_user_1',
    'pro1@test.com',
    crypt('password123', gen_salt('bf')),
    'Pro User One',
    'pro',
    2,
    (SELECT id FROM levels WHERE name = 'pro'),
    true,
    NOW(),
    NOW()
),
(
    'pro_user_2',
    'pro2@test.com',
    crypt('password123', gen_salt('bf')),
    'Pro User Two',
    'pro',
    2,
    (SELECT id FROM levels WHERE name = 'pro'),
    true,
    NOW(),
    NOW()
),
-- MACDADDY LEVEL USERS
(
    'macdaddy_user_1',
    'macdaddy1@test.com',
    crypt('password123', gen_salt('bf')),
    'MacDaddy User One',
    'macdaddy',
    3,
    (SELECT id FROM levels WHERE name = 'macdaddy'),
    true,
    NOW(),
    NOW()
),
(
    'macdaddy_user_2',
    'macdaddy2@test.com',
    crypt('password123', gen_salt('bf')),
    'MacDaddy User Two',
    'macdaddy',
    3,
    (SELECT id FROM levels WHERE name = 'macdaddy'),
    true,
    NOW(),
    NOW()
);

-- STEP 2: Verify users were created successfully
SELECT 
    u.id,
    u.username,
    u.email,
    u.full_name,
    l.name as level_name,
    u.is_active,
    u.created_at
FROM public.users u
JOIN public.levels l ON u.level_id = l.id
WHERE u.username LIKE '%_user_%'
ORDER BY 
    CASE l.name
        WHEN 'freemium' THEN 0
        WHEN 'hobby' THEN 1
        WHEN 'pro' THEN 2
        WHEN 'macdaddy' THEN 3
        ELSE 4
    END,
    u.username;

-- =====================================================
-- TEST USER CREDENTIALS SUMMARY:
-- =====================================================
-- FREEMIUM LEVEL:
--   Username: freemium_user_1 | Email: freemium1@test.com | Password: password123
--   Username: freemium_user_2 | Email: freemium2@test.com | Password: password123
--
-- HOBBY LEVEL:
--   Username: hobby_user_1 | Email: hobby1@test.com | Password: password123
--   Username: hobby_user_2 | Email: hobby2@test.com | Password: password123
--
-- PRO LEVEL:
--   Username: pro_user_1 | Email: pro1@test.com | Password: password123
--   Username: pro_user_2 | Email: pro2@test.com | Password: password123
--
-- MACDADDY LEVEL:
--   Username: macdaddy_user_1 | Email: macdaddy1@test.com | Password: password123
--   Username: macdaddy_user_2 | Email: macdaddy2@test.com | Password: password123
-- =====================================================
