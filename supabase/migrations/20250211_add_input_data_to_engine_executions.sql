-- Add the missing input_data column required by the worker resume flow
ALTER TABLE public.engine_executions
  ADD COLUMN IF NOT EXISTS input_data JSONB DEFAULT '{}'::jsonb NOT NULL;

-- Ensure existing rows have a JSON object (in case the column already existed without default)
UPDATE public.engine_executions
SET input_data = '{}'::jsonb
WHERE input_data IS NULL;

