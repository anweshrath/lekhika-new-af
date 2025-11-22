-- Add is_default field to user_engines table
-- This allows user-specific engine copies to be marked as default

-- Add is_default column to user_engines table
ALTER TABLE public.user_engines 
ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false;

-- Add comment to the column
COMMENT ON COLUMN public.user_engines.is_default IS 'Whether this user engine copy is the default engine for the user';

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_user_engines_is_default ON public.user_engines(is_default);

-- Create function to sync default status from master engine to user copies
CREATE OR REPLACE FUNCTION sync_default_status_to_user_engines()
RETURNS TRIGGER AS $$
BEGIN
  -- When a master engine's is_default status changes, update all user copies
  IF TG_OP = 'UPDATE' AND OLD.is_default IS DISTINCT FROM NEW.is_default THEN
    -- If setting to default, first unset all other defaults for this engine type
    IF NEW.is_default = true THEN
      UPDATE public.user_engines 
      SET is_default = false 
      WHERE engine_id IN (
        SELECT id FROM public.ai_engines 
        WHERE type = NEW.type AND id != NEW.id
      );
    END IF;
    
    -- Update all user copies of this engine
    UPDATE public.user_engines 
    SET is_default = NEW.is_default 
    WHERE engine_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically sync default status
DROP TRIGGER IF EXISTS trigger_sync_default_status ON public.ai_engines;
CREATE TRIGGER trigger_sync_default_status
  AFTER UPDATE ON public.ai_engines
  FOR EACH ROW
  EXECUTE FUNCTION sync_default_status_to_user_engines();

-- Create function to ensure only one default per user per engine type
CREATE OR REPLACE FUNCTION ensure_single_default_per_user_type()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting a user engine to default, unset other defaults for same user and engine type
  IF NEW.is_default = true THEN
    UPDATE public.user_engines 
    SET is_default = false 
    WHERE user_id = NEW.user_id 
      AND id != NEW.id 
      AND engine_id IN (
        SELECT id FROM public.ai_engines 
        WHERE type = (SELECT type FROM public.ai_engines WHERE id = NEW.engine_id)
      );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to ensure single default per user per type
DROP TRIGGER IF EXISTS trigger_ensure_single_default ON public.user_engines;
CREATE TRIGGER trigger_ensure_single_default
  BEFORE INSERT OR UPDATE ON public.user_engines
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_default_per_user_type();

-- Update existing records to have proper defaults (set first engine of each type as default)
WITH first_engines AS (
  SELECT DISTINCT ON (user_id, ae.type) 
    ue.id as user_engine_id,
    ue.user_id,
    ae.type
  FROM public.user_engines ue
  JOIN public.ai_engines ae ON ue.engine_id = ae.id
  ORDER BY user_id, ae.type, ue.created_at ASC
)
UPDATE public.user_engines 
SET is_default = true 
WHERE id IN (SELECT user_engine_id FROM first_engines);
