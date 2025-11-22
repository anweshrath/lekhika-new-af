-- Add Go To Engines functionality
-- Admin sets defaults in ai_engines, user_engines automatically inherit the status

-- Add is_default column to ai_engines table (for admin defaults)
ALTER TABLE public.ai_engines 
ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false;

-- Add default_order column to ai_engines table (for admin ordering)
ALTER TABLE public.ai_engines 
ADD COLUMN IF NOT EXISTS default_order INTEGER DEFAULT NULL;

-- Add is_go_to column to user_engines table (for user Go To engines - max 5)
ALTER TABLE public.user_engines 
ADD COLUMN IF NOT EXISTS is_go_to BOOLEAN DEFAULT false;

-- Add go_to_order column to user_engines table (for user ordering 1-5)
ALTER TABLE public.user_engines 
ADD COLUMN IF NOT EXISTS go_to_order INTEGER DEFAULT NULL;

-- Add comments to the columns
COMMENT ON COLUMN public.ai_engines.is_default IS 'Whether this master engine is marked as default by admin - all user copies inherit this';
COMMENT ON COLUMN public.ai_engines.default_order IS 'Order position for admin default engines, NULL for non-default engines';
COMMENT ON COLUMN public.user_engines.is_go_to IS 'Whether this user engine is marked as Go To by user (max 5 per user)';
COMMENT ON COLUMN public.user_engines.go_to_order IS 'Order position for user Go To engines (1-5), NULL for non-Go To engines';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_engines_is_default ON public.ai_engines(is_default);
CREATE INDEX IF NOT EXISTS idx_ai_engines_default_order ON public.ai_engines(default_order);
CREATE INDEX IF NOT EXISTS idx_user_engines_is_go_to ON public.user_engines(is_go_to);
CREATE INDEX IF NOT EXISTS idx_user_engines_go_to_order ON public.user_engines(go_to_order);

-- Create function to ensure max 5 Go To engines per user
CREATE OR REPLACE FUNCTION ensure_max_go_to_engines()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting a user engine to Go To, check if user already has 5 Go To engines
  IF NEW.is_go_to = true THEN
    -- Count current Go To engines for this user
    IF (SELECT COUNT(*) FROM public.user_engines 
        WHERE user_id = NEW.user_id 
        AND is_go_to = true 
        AND id != NEW.id) >= 5 THEN
      RAISE EXCEPTION 'Maximum 5 Go To engines allowed per user';
    END IF;
    
    -- If no order specified, assign next available order
    IF NEW.go_to_order IS NULL THEN
      NEW.go_to_order := COALESCE(
        (SELECT MAX(go_to_order) + 1 FROM public.user_engines 
         WHERE user_id = NEW.user_id AND is_go_to = true), 
        1
      );
    END IF;
  ELSE
    -- If removing from Go To, clear the order
    NEW.go_to_order := NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to ensure max 5 Go To engines
DROP TRIGGER IF EXISTS trigger_ensure_max_go_to ON public.user_engines;
CREATE TRIGGER trigger_ensure_max_go_to
  BEFORE INSERT OR UPDATE ON public.user_engines
  FOR EACH ROW
  EXECUTE FUNCTION ensure_max_go_to_engines();

-- Create function to reorder Go To engines when one is removed
CREATE OR REPLACE FUNCTION reorder_go_to_engines()
RETURNS TRIGGER AS $$
BEGIN
  -- If removing a Go To engine, reorder remaining ones
  IF OLD.is_go_to = true AND NEW.is_go_to = false THEN
    -- Shift down orders of engines with higher order numbers
    UPDATE public.user_engines 
    SET go_to_order = go_to_order - 1 
    WHERE user_id = OLD.user_id 
      AND is_go_to = true 
      AND go_to_order > OLD.go_to_order;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to reorder Go To engines
DROP TRIGGER IF EXISTS trigger_reorder_go_to ON public.user_engines;
CREATE TRIGGER trigger_reorder_go_to
  AFTER UPDATE ON public.user_engines
  FOR EACH ROW
  EXECUTE FUNCTION reorder_go_to_engines();

-- Add constraints for ai_engines table (admin defaults)
ALTER TABLE public.ai_engines 
ADD CONSTRAINT check_ai_engines_default_order_range 
CHECK (default_order IS NULL OR (default_order >= 1 AND default_order <= 10));

ALTER TABLE public.ai_engines 
ADD CONSTRAINT check_ai_engines_default_order_logic 
CHECK ((is_default = true AND default_order IS NOT NULL) OR (is_default = false AND default_order IS NULL));

-- Add constraints for user_engines table (max 5 Go To engines per user)
ALTER TABLE public.user_engines 
ADD CONSTRAINT check_user_engines_go_to_order_range 
CHECK (go_to_order IS NULL OR (go_to_order >= 1 AND go_to_order <= 5));

ALTER TABLE public.user_engines 
ADD CONSTRAINT check_user_engines_go_to_order_logic 
CHECK ((is_go_to = true AND go_to_order IS NOT NULL) OR (is_go_to = false AND go_to_order IS NULL));
