-- NODE PALETTES TABLE MIGRATION
-- Master node templates for superadmin use only
-- Run this migration to create the node_palettes table

-- Drop table if exists (for clean migration)
DROP TABLE IF EXISTS node_palettes CASCADE;

-- Create the node_palettes table
CREATE TABLE node_palettes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Node Identity
  node_id VARCHAR(100) NOT NULL UNIQUE, -- e.g., 'node-input-universal'
  name VARCHAR(255) NOT NULL, -- e.g., 'Universal Input'
  description TEXT,
  
  -- Node Classification
  type VARCHAR(50) NOT NULL CHECK (type IN ('input', 'process', 'condition', 'preview', 'output')),
  category VARCHAR(100) NOT NULL, -- e.g., 'input', 'process', 'condition'
  sub_category VARCHAR(100), -- e.g., 'research', 'creative', 'content', 'quality' (for process nodes)
  role VARCHAR(100) NOT NULL, -- e.g., 'universal_input', 'researcher', 'content_writer'
  
  -- Visual Properties
  icon VARCHAR(10), -- emoji icon
  gradient VARCHAR(100), -- CSS gradient classes
  
  -- Functionality
  is_ai_enabled BOOLEAN DEFAULT false,
  
  -- Configuration (all node data as JSONB)
  configuration JSONB NOT NULL DEFAULT '{}',
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES superadmin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_node_palettes_type ON node_palettes(type);
CREATE INDEX idx_node_palettes_category ON node_palettes(category);
CREATE INDEX idx_node_palettes_role ON node_palettes(role);
CREATE INDEX idx_node_palettes_sub_category ON node_palettes(sub_category);
CREATE INDEX idx_node_palettes_active ON node_palettes(is_active);

-- RLS Policies (superadmin only)
ALTER TABLE node_palettes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmin full access to node_palettes" ON node_palettes
  FOR ALL 
  TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM superadmin_users 
      WHERE superadmin_users.id = auth.uid()
    )
  );

-- Function to duplicate a node
CREATE OR REPLACE FUNCTION duplicate_node_palette(
  source_node_id UUID,
  new_name VARCHAR(255) DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_node_id UUID;
  source_node RECORD;
  duplicate_name VARCHAR(255);
BEGIN
  -- Check if user is superadmin
  IF NOT EXISTS (
    SELECT 1 FROM superadmin_users 
    WHERE superadmin_users.id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Access denied: Only superadmin can duplicate nodes';
  END IF;

  -- Get source node
  SELECT * INTO source_node 
  FROM node_palettes 
  WHERE id = source_node_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Source node not found';
  END IF;
  
  -- Generate new name if not provided
  duplicate_name := COALESCE(new_name, source_node.name || ' (Copy)');
  
  -- Create duplicate
  INSERT INTO node_palettes (
    node_id,
    name,
    description,
    type,
    category,
    sub_category,
    role,
    icon,
    gradient,
    is_ai_enabled,
    configuration,
    created_by
  ) VALUES (
    source_node.node_id || '_copy_' || EXTRACT(EPOCH FROM NOW())::text,
    duplicate_name,
    source_node.description,
    source_node.type,
    source_node.category,
    source_node.sub_category,
    source_node.role || '_copy_' || EXTRACT(EPOCH FROM NOW())::text,
    source_node.icon,
    source_node.gradient,
    source_node.is_ai_enabled,
    source_node.configuration,
    auth.uid()
  ) RETURNING id INTO new_node_id;
  
  RETURN new_node_id;
END;
$$;

-- Migration complete
SELECT 'Node palettes table created successfully' as status;
