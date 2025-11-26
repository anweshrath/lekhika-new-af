#!/bin/bash
# Test if Edge Function can now reach the worker

echo "Testing Edge Function → Worker connection..."
echo ""
echo "This will test the full chain:"
echo "1. Your machine → Supabase Edge Function"
echo "2. Edge Function → VPS Worker (using new env vars)"
echo ""

# We need to test with an actual API call
# First, let's check if we have any user engines with API keys

echo "Boss, to test this properly, we need:"
echo "1. A user ID"
echo "2. A user engine ID (from user_engines table)"
echo "3. The engine's API key"
echo ""
echo "Can you provide these, or should I query the database to find them?"
