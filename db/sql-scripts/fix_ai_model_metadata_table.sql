-- Fix ai_model_metadata table structure
-- This script ensures the table has the correct unique constraint

-- First, let's check if the table exists and what constraints it has
DO $$ 
BEGIN
    -- Check if table exists
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ai_model_metadata') THEN
        RAISE NOTICE 'Table ai_model_metadata exists';
        
        -- Check if unique constraint exists
        IF EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE table_name = 'ai_model_metadata' 
            AND constraint_type = 'UNIQUE' 
            AND constraint_name LIKE '%provider%model_id%'
        ) THEN
            RAISE NOTICE 'Unique constraint already exists';
        ELSE
            -- Add the unique constraint
            ALTER TABLE ai_model_metadata ADD CONSTRAINT ai_model_metadata_provider_model_id_unique UNIQUE (provider, model_id);
            RAISE NOTICE 'Added unique constraint on (provider, model_id)';
        END IF;
        
        -- Check if specialties column is array type
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'ai_model_metadata' 
            AND column_name = 'specialties' 
            AND data_type = 'ARRAY'
        ) THEN
            RAISE NOTICE 'Specialties column is already array type';
        ELSE
            -- Convert specialties to array type
            ALTER TABLE ai_model_metadata ALTER COLUMN specialties TYPE TEXT[] USING CASE 
                WHEN specialties IS NULL OR specialties = '' THEN '{}'::TEXT[]
                ELSE ARRAY[specialties]::TEXT[]
            END;
            RAISE NOTICE 'Converted specialties column to array type';
        END IF;
        
    ELSE
        RAISE NOTICE 'Table ai_model_metadata does not exist - creating it';
        
        -- Create the table with proper structure
        CREATE TABLE ai_model_metadata (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            provider TEXT NOT NULL,
            model_name TEXT NOT NULL,
            model_id TEXT NOT NULL,
            
            -- Cost Metrics
            input_cost_per_million NUMERIC(10, 6) DEFAULT 0,
            output_cost_per_million NUMERIC(10, 6) DEFAULT 0,
            
            -- Model Capabilities
            context_window_tokens INTEGER,
            specialties TEXT[] DEFAULT '{}',
            tokens_per_page INTEGER DEFAULT 500,
            pages_per_million_tokens NUMERIC(10, 2) GENERATED ALWAYS AS (1000000.0 / tokens_per_page) STORED,
            
            -- Metadata and Status
            description TEXT,
            is_active BOOLEAN DEFAULT true,
            last_updated TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
            metadata JSONB,
            
            -- User Association (optional)
            user_id UUID REFERENCES auth.users(id),
            
            -- Unique Constraint
            UNIQUE(provider, model_id)
        );
        
        -- Enable Row Level Security
        ALTER TABLE ai_model_metadata ENABLE ROW LEVEL SECURITY;
        
        -- Create policies
        CREATE POLICY "Admins can manage model metadata" 
        ON ai_model_metadata 
        FOR ALL 
        USING (
            auth.uid() IN (
                SELECT user_id 
                FROM auth.users 
                WHERE role = 'superadmin'
            )
        );
        
        CREATE POLICY "Users can view active models" 
        ON ai_model_metadata 
        FOR SELECT 
        USING (is_active = true);
        
        -- Create indexes
        CREATE INDEX idx_ai_model_metadata_provider ON ai_model_metadata(provider);
        CREATE INDEX idx_ai_model_metadata_is_active ON ai_model_metadata(is_active);
        CREATE INDEX idx_ai_model_metadata_user_id ON ai_model_metadata(user_id);
        
        RAISE NOTICE 'Created ai_model_metadata table with proper structure';
    END IF;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error: %', SQLERRM;
END $$;
