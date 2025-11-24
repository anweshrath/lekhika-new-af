# Resume & Polling Overhaul Plan - 2025-11-24

## Problem Statement

### Current Issues:
1. **Resume fails with "Execution user not provided"** - `executionUser` is lost in `continueExecutionFromNodeHelper`
2. **Resume fails with "No content available for refinement"** - `lastNodeOutput` is set to `null` instead of using existing outputs
3. **AI Thinking Modal doesn't show processes during execution** - Only shows after completion
4. **Checkpoints are in-memory only** - Lost if worker restarts, not saved to DB
5. **Frontend polls Supabase DB** - Causes 100-200 DB writes + 30 DB reads per execution (inefficient)
6. **DB bloat** - `execution_data` grows with every update, can reach MBs

### Root Causes:
- `continueExecutionFromNodeHelper` creates fresh `pipelineData` with `lastNodeOutput: null` and doesn't validate `executionUser`
- Checkpoints created in memory (`stateManager.createCheckpoint`) but never saved to DB
- Frontend polls DB instead of worker API
- Worker writes to DB on every `progressCallback` update

---

## Solution (Approved by User)

### Architecture Change:
1. **Frontend polls worker API** (`/status/:executionId`) instead of Supabase DB
   - Worker reads from memory (`activeExecutions` Map) - fast, no DB cost
   - ~98% reduction in DB operations (1-2 vs 130-230 per execution)
   - Real-time updates from worker memory

2. **Checkpoint saved to DB only on failure** (single write)
   - During execution: checkpoint stays in memory
   - On failure: save checkpoint to DB once
   - Resume: load from DB (if worker restarted) or memory (if worker didn't restart)

3. **Fix resume path**:
   - Set `lastNodeOutput` from `existingOutputs` in `continueExecutionFromNodeHelper`
   - Ensure `executionUser` is passed and validated
   - Resume from failed node with proper state

### Benefits:
- **Economical**: 98% fewer DB operations
- **Less clutter**: DB storage stays small (one write vs many)
- **Faster**: Memory reads vs DB queries
- **Real-time**: Frontend sees live updates during execution

---

## Implementation Plan

### Phase 1: Fix Resume Path (Surgical)
- [ ] Fix `continueExecutionFromNodeHelper` to set `lastNodeOutput` from `existingOutputs`
- [ ] Ensure `executionUser` is validated and passed correctly
- [ ] Test resume from failed node

### Phase 2: Save Checkpoint to DB on Failure
- [ ] Modify error handler to save checkpoint to DB when node fails
- [ ] Include `nodeOutputs`, `lastNodeOutput`, `executionUser`, `failedAtNode` in checkpoint
- [ ] Test checkpoint persistence

### Phase 3: Switch Frontend to Poll Worker API
- [ ] Update `GenerateModal.jsx` to poll `/status/:executionId` instead of Supabase
- [ ] Update `getExecutionStatus` to return full execution data (nodeResults, progress, etc.)
- [ ] Remove DB polling during execution
- [ ] Keep DB polling only for completed/failed executions (fallback)

### Phase 4: Cleanup Checkpoint After Resume
- [ ] After successful resume, delete checkpoint from DB (CRUD it out)
- [ ] Keep checkpoint only if resume fails or execution is still in progress

---

## Implementation Log

### 2025-11-24 - Implementation Complete ✅

#### Phase 1: Fix Resume Path ✅
- [x] Fixed `lastNodeOutput` in `continueExecutionFromNodeHelper` - now finds from `existingOutputs`
- [x] Added `executionUser` validation in `continueExecutionFromNodeHelper`
- [x] Enhanced checkpoint to include `lastNodeOutput` and `executionUser`
- **Files Modified:**
  - `vps-worker/services/workflow/helpers/resumeHelpers.js` - Fixed `lastNodeOutput` and `executionUser` handling
  - `vps-worker/services/workflowExecutionService.js` - Enhanced checkpoint to include `lastNodeOutput` and `executionUser`

#### Phase 2: Save Checkpoint on Failure ✅
- [x] Checkpoint already saved in error handler (line 463-476)
- [x] Enhanced checkpoint to include `lastNodeOutput` and `executionUser`
- **Files Modified:**
  - `vps-worker/services/workflowExecutionService.js` - Enhanced checkpoint data structure

#### Phase 3: Switch to Worker API Polling ✅
- [x] Enhanced `getExecutionStatus` to return full execution data (nodeResults, progress, etc.)
- [x] Updated Edge Function `getExecutionStatus` to poll worker API first, fallback to DB
- [x] Added internal auth validation to worker `/status/:executionId` endpoint
- [x] Frontend already uses Edge Function - no changes needed (Edge Function now proxies to worker)
- **Files Modified:**
  - `vps-worker/services/executionService.js` - Enhanced `getExecutionStatus` to return full execution data
  - `vps-worker/server.js` - Added internal auth validation to `/status/:executionId`
  - `supabase/functions/engines-api/index.ts` - Updated `getExecutionStatus` to poll worker first, DB fallback

#### Phase 4: Cleanup After Resume ✅
- [x] Added checkpoint deletion after successful resume (CRUD it out from DB)
- **Files Modified:**
  - `vps-worker/services/workflowExecutionService.js` - Added checkpoint cleanup after successful resume

---

## Summary

### What Changed:
1. **Resume Path Fixed**: `lastNodeOutput` and `executionUser` are now correctly preserved and passed during resume
2. **Checkpoint Enhanced**: Checkpoint now includes `lastNodeOutput` and `executionUser` for proper resume
3. **Polling Optimized**: Frontend polls worker API (via Edge Function) instead of DB during execution
4. **Checkpoint Cleanup**: Checkpoint is deleted from DB after successful resume (CRUD it out)

### Benefits:
- **98% reduction in DB operations** during execution (1-2 writes vs 130-230)
- **Faster polling** (memory reads vs DB queries)
- **Less DB clutter** (checkpoint only saved on failure, deleted after resume)
- **Real-time updates** from worker memory during execution
- **Resume works correctly** with proper state preservation

### Testing Required:
1. Test resume from failed node - should work with proper `lastNodeOutput` and `executionUser`
2. Test polling during execution - should get real-time updates from worker
3. Test checkpoint cleanup - should be deleted after successful resume
4. Test fallback to DB - should work for completed/failed executions not in worker memory

---

## Bug Fixes (2025-11-24 - Post Implementation)

### Issue: "Execution user not provided for AI service" on new execution
**Error:** `AI generation failed: Execution user not provided for AI service - user context is required for API key access and token management`

**Root Cause:** `userId` might be undefined or null when constructing `userObject` in `executionService.js`

**Fix:**
- [x] Added validation in `executionService.js` to check `userId` before constructing `userObject`
- [x] Added logging to track `executionUser` construction and validation
- [x] Enhanced error message in `workflowExecutionService.js` to include more context
- **Files Modified:**
  - `vps-worker/services/executionService.js` - Added `userId` validation before `userObject` construction
  - `vps-worker/services/workflowExecutionService.js` - Enhanced validation error message and added logging
- **Deployed to VPS:** 2025-11-24
  - Files pushed via SCP to `157.254.24.49:~/vps-worker/`
  - PM2 processes restarted: `lekhika-worker`, `lekhika-queue-worker`

---

## Questions Answered

**Q: After resume, do we need that checkpoint entry or should we CRUD it from DB?**
**A: Delete it after successful resume** - Checkpoint is only needed for resume. Once execution continues successfully, we don't need it anymore. Keep it only if:
- Resume fails
- Execution is still in progress (might need to resume again)

---

## Notes

- Worker API endpoint `/status/:executionId` already exists but returns minimal data
- Need to enhance it to return full execution state (nodeResults, progress, etc.)
- Checkpoint should include: `nodeOutputs`, `lastNodeOutput`, `executionUser`, `failedAtNode`, `completedNodes`

