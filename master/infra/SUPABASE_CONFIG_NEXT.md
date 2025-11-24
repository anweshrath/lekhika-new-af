# NEXT STEP: Configure Supabase Edge Function

## Worker Status: ✅ RUNNING
- URL: http://157.254.24.49:3001
- Health: CONFIRMED HEALTHY
- Status: ONLINE, NO CRASHES

## Required: Set Environment Variables in Supabase

Go to: https://supabase.com/dashboard/project/oglmncodldqiafmxpwdw/settings/functions

Add these secrets:

```
EXECUTION_WORKER_URL=http://157.254.24.49:3001
INTERNAL_API_SECRET=lekhika-worker-secret-2025
```

## After Setting Variables:

The engines-api Edge Function will use:
- Line 290: `Deno.env.get('EXECUTION_WORKER_URL')` → http://157.254.24.49:3001
- Line 291: `Deno.env.get('INTERNAL_API_SECRET')` → lekhika-worker-secret-2025

Then user workflow will work:
1. User fills form
2. GenerateModal calls Edge Function
3. Edge Function calls worker at 157.254.24.49:3001
4. Worker executes workflow
5. Book gets generated

Boss, do you want me to guide you through setting Supabase secrets, or can you do it?
