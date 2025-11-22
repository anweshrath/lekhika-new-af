-- Backup ai_model_metadata table before making changes
-- This creates a backup table with timestamp

CREATE TABLE IF NOT EXISTS ai_model_metadata_backup_20241220 AS 
SELECT 
    *,
    NOW() as backup_created_at
FROM ai_model_metadata;

-- Add comment to track the backup
COMMENT ON TABLE ai_model_metadata_backup_20241220 IS 'Backup of ai_model_metadata table created on 2024-12-20 before adding conception_date column and fixing field mappings';
