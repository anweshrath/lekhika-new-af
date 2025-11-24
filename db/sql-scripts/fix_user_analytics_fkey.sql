-- Drop the broken foreign key constraint
ALTER TABLE user_analytics 
DROP CONSTRAINT IF EXISTS user_analytics_user_id_fkey;

-- Add correct foreign key constraint to users.id
ALTER TABLE user_analytics 
ADD CONSTRAINT user_analytics_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

