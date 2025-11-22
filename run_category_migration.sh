#!/bin/bash
# SURGICAL MIGRATION: Add ai_category system to ai_model_metadata
# Boss: Run this to add model categorization for audio/image/video support

echo "🔧 Running ai_category migration..."

# Read Supabase credentials from environment or prompt
if [ -z "$SUPABASE_URL" ]; then
    read -p "Enter Supabase URL: " SUPABASE_URL
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    read -p "Enter Supabase Service Role Key: " SUPABASE_SERVICE_ROLE_KEY
fi

# Run SQL via psql or curl to Supabase API
if command -v psql &> /dev/null; then
    echo "✅ Using psql"
    PGPASSWORD="$SUPABASE_SERVICE_ROLE_KEY" psql "$SUPABASE_URL" -f add_model_category_system.sql
else
    echo "⚠️ psql not found, use Supabase SQL Editor"
    echo "📋 Copy contents of add_model_category_system.sql to Supabase Dashboard > SQL Editor"
    cat add_model_category_system.sql
fi

echo "✅ Migration complete!"

