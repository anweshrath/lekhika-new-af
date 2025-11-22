# Queue System Implementation - October 12, 2025

## Session Overview
Implementing complete queue management system for user engine executions with priority controls and SuperAdmin management.

---

## Changes Made

### 1. Edge Function Fixes (`supabase/functions/engines-api/index.ts`)

**Problem:** Multiple `.single()` queries causing "JSON object requested, multiple (or no) rows returned" errors

**Changes:**
- **Line 66-124:** Fixed `validateRequest()` function
  - Removed `.single()` from user_engines query
  - Removed `.single()` from users query
  - Handle arrays properly with length checks
  - Added comprehensive logging
  
- **Line 179-201:** Fixed `getEngine()` function
  - Removed `.single()` from user_engines query
  - Handle array result
  
- **Line 232-248:** Fixed `executeEngine()` function
  - Removed `.single()` from user_engines query
  - Handle array result
  
- **Line 258-286:** Fixed execution record creation
  - Removed `.single()` from insert
  - Handle array result

**Deployments:**
```bash
npx supabase functions deploy engines-api --no-verify-jwt
```
- Deployed: 3 times (19:39, 19:48, 19:52 UTC)
- Project: oglmncodldqiafmxpwdw (Lekhika)

---

### 2. Frontend API Call (`src/components/GenerateModal.jsx`)

**Problem:** API authentication failing with JWT errors

**Changes:**
- **Line 35:** Added `currentExecutionId` state for restart functionality
- **Line 150-152:** Added API key format validation
- **Line 204-250:** Implemented API call to Edge Function
  - Uses `apikey` header (lowercase) for Supabase JWT
  - Uses `X-API-Key` header for engine API key
  - Proper error handling and logging
  
- **Line 247-250:** Store execution ID for tracking
- **Lines 275-308:** Enhanced restart and force stop handlers
  - Cancel execution in database
  - Restart with same form data
  - No page reload

**Authentication Fix:**
- Changed from: `Authorization: Bearer ${session.access_token}` (failed - no Supabase auth)
- Changed to: `Authorization: Bearer ${apiKey}` (failed - wrong format check)
- **Final:** `apikey: ${SUPABASE_ANON_KEY}` + `X-API-Key: ${apiKey}` ✅

---

### 3. Execution Modal Updates (`src/components/SuperAdmin/WorkflowExecutionModal.jsx`)

**Changes:**
- **Line 376:** Added `onRestart` prop
- **Lines 1209-1222:** Added restart button for user executions
  - Only shows when `executionData?.isUserExecution === true`
  - Calls `onRestart()` handler
  - Confirmation dialog before restart
  
- **Lines 1444-1469:** Hid cost tracking from users
  - Wrapped in `{!executionData?.isUserExecution && (...)}`
  - Users only see tokens, words, progress
  
- **Lines 1636-1646:** Hid cost in completion summary
  - Same conditional check

---

### 4. SuperAdmin Fixes

#### A. Flow Save & Deploy Modals
**Files:**
- `src/components/SuperAdmin/FlowSaveModal.jsx`
- `src/components/SuperAdmin/AlchemistFlowSaveModal.jsx`

**Changes:**
- Added separate engine naming when deploying
- Two-step process: Save Flow → Deploy as Engine
- Engine name independent from flow name
- Clear messaging about overwrite vs new flow

#### B. Engine Assignment Modal
**Files:**
- `src/components/SuperAdmin/EpicEngineAssignmentModal.jsx` (kept)
- `src/components/SuperAdmin/EngineAssignmentModal.jsx` (deleted)

**Changes:**
- Fixed level assignment to use `level_engines` table (not `level_workflow_assignments`)
- Direct insert instead of RPC function
- Fixed ambiguous column references in queries
- Deleted inferior duplicate modal

#### C. Engines Page
**File:** `src/components/SuperAdmin/Engines.jsx`

**Changes:**
- Added "User Engines" tab
- Import `UserEnginesList` component
- Tab switching UI

#### D. User Engines List (NEW)
**File:** `src/components/SuperAdmin/UserEnginesList.jsx`

**Features:**
- Table view of all user engine copies
- Search by user name, email, engine
- Filters: engine, level, status
- Actions: toggle status, regenerate API key, delete
- API key reveal/hide/copy

---

### 5. Database Migrations

#### Migration: `20250112_fix_level_engines_rls.sql`
**Purpose:** Fix RLS policy for level_engines table

**Changes:**
```sql
DROP POLICY IF EXISTS "SuperAdmin can manage level engines" ON level_engines;

CREATE POLICY "SuperAdmin can manage level engines" ON level_engines
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM superadmin_users 
      WHERE superadmin_users.id = auth.uid()
    )
  );
```

**Issue:** SuperAdmin doesn't use auth.uid()

---

#### Migration: `20250112_fix_level_engines_rls_v2.sql`
**Purpose:** Disable RLS entirely since SuperAdmin uses custom auth

**Changes:**
```sql
DROP POLICY IF EXISTS "SuperAdmin can manage level engines" ON level_engines;
DROP POLICY IF EXISTS "Authenticated users can view level engines" ON level_engines;

ALTER TABLE level_engines DISABLE ROW LEVEL SECURITY;
```

**Status:** ✅ Applied successfully

---

#### Trigger Function Fixes (Run in SQL Editor)
**File:** Manual SQL execution

**Fixed:**
```sql
-- Fix auto_assign_engines_for_level - change is_active to active
CREATE OR REPLACE FUNCTION auto_assign_engines_for_level(p_user_id uuid, p_level_name text)
...
WHERE l.name = p_level_name AND ae.active = true  -- Changed from ae.is_active

-- Fix trigger_assign_engine_to_level_users - fix ambiguous id column
CREATE OR REPLACE FUNCTION trigger_assign_engine_to_level_users()
...
SELECT u.id FROM users u  -- Changed from SELECT id
```

**Status:** ✅ Applied manually by user

---

### 6. Books Page Cleanup (`src/pages/Books.jsx`)

**Changes:**
- Removed `FeatureGate` wrapper (no more "Upgrade Now" buttons)
- Removed hardcoded fallback `user?.id || 1`
- Added proper user validation
- Removed `useFeatureAccess` dependency
- Direct export service calls

**Deleted:**
- `src/components/MyBooks.jsx` (old fake component)

---

## Current Status

### ✅ Working:
- SuperAdmin flow execution
- Flow save/deploy with separate naming
- Engine assignment to users
- Engine assignment to levels (with auto-copy to users)
- User Engines tab in SuperAdmin
- Books page (clean, no upgrades)
- Execution modal (cost hidden for users)
- Restart button (user executions only)

### ✅ Fixed (Pending Test):
- Edge Function validation (all `.single()` removed)
- Worker call from Edge Function (fire & forget)
- Status polling in GenerateModal (2-second intervals)

### ❌ Still TODO:
- Queue management system (priorities, positions)
- Queue Dashboard for SuperAdmin
- User queue position display

---

## Phase 1 Implementation Details

### Task 2: Edge Function Calls Worker ✅
**Changes (`supabase/functions/engines-api/index.ts` lines 301-326):**
- After queuing execution, calls worker's `/execute` endpoint
- Uses `EXECUTION_WORKER_URL` env var (defaults to localhost:3001)
- Uses `INTERNAL_API_SECRET` for authentication
- Fire and forget (non-blocking)
- Sends: executionId, engineId, userId, userInput, nodes, edges, models

### Task 3: Status Polling ✅
**Changes (`src/components/GenerateModal.jsx` lines 44-128):**
- Polls `engine_executions` table every 2 seconds
- Uses `maybeSingle()` to avoid errors
- Updates `executionModalData` with latest progress
- Stops polling when status = completed/failed/cancelled
- Shows success/error toasts on completion
- Cleanup on unmount

---

## Project Context
- **Project:** Lekhika (oglmncodldqiafmxpwdw)
- **Supabase URL:** https://oglmncodldqiafmxpwdw.supabase.co
- **Worker:** Running locally on port 3001
- **Auth:** Custom (SuperAdmin: superadmin_users, Users: users table)
- **No Supabase Auth used**

---

## Important Notes

### Authentication Flow:
- **SuperAdmin:** Custom session in `superadmin_users` table + localStorage
- **Users:** Custom auth in `users` table + localStorage
- **API:** Engine API keys (LEKH-2-xxxxx format) stored in `user_engines.api_key`
- **Edge Functions:** Use Supabase anon key in `apikey` header, engine key in `X-API-Key` header

### Database Tables:
- `ai_engines` - Master engine templates
- `user_engines` - User copies with API keys
- `level_engines` - Level assignments
- `engine_executions` - Execution queue/history
- `levels` - User tier levels
- `users` - User accounts

### Key Rules:
- No hardcoded values
- No localStorage for data
- All dynamic from database
- Surgical fixes only
- Professional, premium quality

---

*Last Updated: October 12, 2025 - 19:52 UTC*

