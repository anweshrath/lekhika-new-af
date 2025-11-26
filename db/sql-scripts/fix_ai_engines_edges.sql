-- Fix ai_engines table missing columns
-- This script adds ALL missing columns from ai_flows to ai_engines table

-- Add nodes column to ai_engines table
ALTER TABLE public.ai_engines 
ADD COLUMN IF NOT EXISTS nodes JSONB DEFAULT '[]'::jsonb;

-- Add edges column to ai_engines table
ALTER TABLE public.ai_engines 
ADD COLUMN IF NOT EXISTS edges JSONB DEFAULT '[]'::jsonb;

-- Add is_default column to ai_engines table
ALTER TABLE public.ai_engines 
ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false;

-- Add metadata column to ai_engines table
ALTER TABLE public.ai_engines 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Add status column to ai_engines table
ALTER TABLE public.ai_engines 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';

-- Add type column to ai_engines table
ALTER TABLE public.ai_engines 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'book_generation';

-- Add comments to the columns
COMMENT ON COLUMN public.ai_engines.nodes IS 'Workflow nodes stored as JSON array';
COMMENT ON COLUMN public.ai_engines.edges IS 'Workflow edges/connections between nodes stored as JSON array';
COMMENT ON COLUMN public.ai_engines.is_default IS 'Whether this engine is the default engine for its level';
COMMENT ON COLUMN public.ai_engines.metadata IS 'Engine metadata including icons, tags, and configuration';
COMMENT ON COLUMN public.ai_engines.status IS 'Engine deployment status (draft, deployed, active, inactive)';
COMMENT ON COLUMN public.ai_engines.type IS 'Engine type (book_generation, report_generation, etc.)';

-- Update any existing records to have proper defaults
UPDATE public.ai_engines 
SET nodes = '[]'::jsonb,
    edges = '[]'::jsonb, 
    is_default = false,
    metadata = '{}'::jsonb,
    status = 'draft',
    type = 'book_generation'
WHERE nodes IS NULL OR edges IS NULL OR is_default IS NULL OR metadata IS NULL OR status IS NULL OR type IS NULL;

-- Verify the columns were added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'ai_engines' 
AND table_schema = 'public'
AND column_name IN ('nodes', 'edges', 'is_default', 'metadata', 'status', 'type')
ORDER BY column_name;
