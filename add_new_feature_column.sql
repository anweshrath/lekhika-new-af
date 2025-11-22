-- =====================================================
-- ADD NEW FEATURE COLUMN TO LEVEL_ACCESS TABLE
-- Professional, triple-checked migration for adding new features
-- =====================================================

-- STEP 1: Add the new feature column to level_access table
-- Replace 'NEW_FEATURE_NAME' with the actual feature name (e.g., 'video_generation')
ALTER TABLE public.level_access 
ADD COLUMN NEW_FEATURE_NAME BOOLEAN DEFAULT false;

-- STEP 2: Add comment for documentation
COMMENT ON COLUMN public.level_access.NEW_FEATURE_NAME IS 'Access to NEW_FEATURE_NAME feature';

-- STEP 3: Create index for performance (optional, only if needed for queries)
-- CREATE INDEX idx_level_access_NEW_FEATURE_NAME ON public.level_access(NEW_FEATURE_NAME);

-- STEP 4: Update existing level_access rows with default values
-- Set access based on level tier (customize as needed)
UPDATE public.level_access 
SET NEW_FEATURE_NAME = CASE 
    WHEN level_name = 'freemium' THEN false  -- Freemium: no access
    WHEN level_name = 'hobby' THEN false     -- Hobby: no access  
    WHEN level_name = 'pro' THEN true        -- Pro: has access
    WHEN level_name = 'macdaddy' THEN true  -- MacDaddy: has access
    WHEN level_name = 'byok' THEN true      -- BYOK: has access
    ELSE false                               -- Default: no access
END;

-- STEP 5: Verify the column was added successfully
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'level_access' 
    AND table_schema = 'public'
    AND column_name = 'NEW_FEATURE_NAME';

-- STEP 6: Show updated level_access data for verification
SELECT 
    level_name,
    NEW_FEATURE_NAME,
    CASE 
        WHEN NEW_FEATURE_NAME THEN '✅ Enabled'
        ELSE '❌ Disabled'
    END as access_status
FROM public.level_access 
ORDER BY 
    CASE level_name
        WHEN 'freemium' THEN 0
        WHEN 'hobby' THEN 1
        WHEN 'pro' THEN 2
        WHEN 'macdaddy' THEN 3
        WHEN 'byok' THEN 4
        ELSE 5
    END;

-- =====================================================
-- USAGE INSTRUCTIONS:
-- =====================================================
-- 1. Replace 'NEW_FEATURE_NAME' with your actual feature name
-- 2. Adjust the default access levels in STEP 4 as needed
-- 3. Run this migration in Supabase SQL Editor
-- 4. Verify the results using the SELECT statements
-- 5. Update your application code to use the new feature column
-- =====================================================
