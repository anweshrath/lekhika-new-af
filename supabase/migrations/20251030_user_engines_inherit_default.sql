-- Ensure future sub-engines inherit default flags from their master engine

-- Function: before insert on user_engines, set is_default/default_order from ai_engines if master is default
CREATE OR REPLACE FUNCTION public.set_user_engine_default_from_master()
RETURNS TRIGGER AS $$
DECLARE
  master_is_default BOOLEAN;
  master_default_order INTEGER;
BEGIN
  IF NEW.engine_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT is_default, default_order INTO master_is_default, master_default_order
  FROM public.ai_engines
  WHERE id = NEW.engine_id;

  IF master_is_default IS TRUE THEN
    NEW.is_default := TRUE;
    IF NEW.default_order IS NULL THEN
      NEW.default_order := master_default_order;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_user_engines_inherit_default ON public.user_engines;
CREATE TRIGGER trigger_user_engines_inherit_default
  BEFORE INSERT ON public.user_engines
  FOR EACH ROW
  EXECUTE FUNCTION public.set_user_engine_default_from_master();

-- Function: after update on ai_engines, cascade is_default/default_order to all sub-engines (safety net)
CREATE OR REPLACE FUNCTION public.cascade_master_default_to_user_engines()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE') AND (OLD.is_default IS DISTINCT FROM NEW.is_default OR OLD.default_order IS DISTINCT FROM NEW.default_order) THEN
    UPDATE public.user_engines
    SET is_default = NEW.is_default,
        default_order = NEW.default_order
    WHERE engine_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_cascade_master_default ON public.ai_engines;
CREATE TRIGGER trigger_cascade_master_default
  AFTER UPDATE ON public.ai_engines
  FOR EACH ROW
  EXECUTE FUNCTION public.cascade_master_default_to_user_engines();


