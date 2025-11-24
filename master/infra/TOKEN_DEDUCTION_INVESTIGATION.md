# TOKEN DEDUCTION INVESTIGATION REPORT
**Date:** 2025-11-20  
**Issue:** Tokens are not being deducted from wallet

## ROOT CAUSE IDENTIFIED

### ❌ CRITICAL BUG: Missing Methods (Accidentally Removed During Refactoring)
**File:** `vps-worker/services/workflowExecutionService.js`  
**Lines:** 392, 393, 691, 692  
**Problem:** Methods `getTokenUsageSummary()` and `getTokenLedger()` are **CALLED but NOT DEFINED**

### What Changed (48 Hours Ago):
- ✅ **BEFORE REFACTORING:** `getTokenUsageSummary()` and `getTokenLedger()` existed in the God file
- ✅ **DURING REFACTORING (Phase 3):** Token calculation helpers (`deriveNodeTokenMetrics`, `calculateTokenUsageFromOutputs`, `buildTokenLedgerFromOutputs`) were extracted to `tokenHelpers.js`
- ❌ **MISTAKE:** `getTokenUsageSummary()` and `getTokenLedger()` were **ACCIDENTALLY REMOVED** even though comments say "KEPT" (lines 1538-1539)
- ❌ **RESULT:** Methods marked as "KEPT" but actually missing from the class

### Evidence:
1. **Line 392:** `const tokenUsage = this.getTokenUsageSummary(workflowId, pipelineData.nodeOutputs)` → **undefined**
2. **Line 393:** `const tokenLedger = this.getTokenLedger(workflowId, pipelineData.nodeOutputs)` → **undefined**
3. **Line 691:** `const finalTokenUsage = this.getTokenUsageSummary(workflowId, pipelineData.nodeOutputs)` → **undefined**
4. **Line 692:** `const finalTokenLedger = this.getTokenLedger(workflowId, pipelineData.nodeOutputs)` → **undefined**
5. **Line 1538-1539:** Comments say "KEPT: getTokenUsageSummary() - checks state, stays in class" but **methods don't exist**

## TOKEN FLOW ANALYSIS

### Expected Flow (48 Hours Ago):
1. ✅ **Node Execution** (line 477): `recordNodeTokenUsage()` called → updates stateManager
2. ✅ **State Tracking** (lines 1492-1528): `recordNodeTokenUsage()` saves to `stateManager.tokenUsage` and `tokenLedger`
3. ✅ **Token Aggregation** (lines 691-692): `getTokenUsageSummary()` and `getTokenLedger()` **read from stateManager** → **MISSING NOW**
4. ✅ **Result Attachment** (lines 696-698): `totalTokensUsed = finalTokenUsage.totalTokens` → **broken (undefined)**
5. ✅ **Debit Calculation** (executionService.js line 725): `result?.totalTokensUsed` → **undefined/0**
6. ❌ **Wallet Debit** (executionService.js line 788): Never reached because `totalTokensUsed === 0`

### What's Happening Now:
- ✅ `recordNodeTokenUsage()` **WORKS** - tokens are tracked in stateManager (line 1502-1527)
- ❌ `getTokenUsageSummary()` **MISSING** - returns `undefined` (TypeError when accessing `.totalTokens`)
- ❌ `finalTokenUsage.totalTokens` → **TypeError: Cannot read property 'totalTokens' of undefined**
- ❌ `pipelineData.totalTokensUsed` → **undefined/NaN**
- ❌ `executionService` sees `result.totalTokensUsed === undefined` → **defaults to 0**
- ❌ **Wallet debit SKIPPED** (line 777 checks `if (totalTokensUsed > 0)`)

## HOW IT WORKED BEFORE

**48 Hours Ago (Before Refactoring):**
1. ✅ `recordNodeTokenUsage()` stored tokens in `this.executionState[workflowId].tokenUsage`
2. ✅ `getTokenUsageSummary(workflowId)` read from `this.executionState[workflowId].tokenUsage`
3. ✅ `getTokenLedger(workflowId)` read from `this.executionState[workflowId].tokenLedger`
4. ✅ Methods returned `{ totalTokens, totalCost, totalWords }` and `[ledgerEntries]`
5. ✅ `totalTokensUsed` was correctly set and passed to `executionService`
6. ✅ Wallet debit happened successfully

**Now (After Refactoring):**
1. ✅ `recordNodeTokenUsage()` stores in `stateManager.executionState.get(workflowId).tokenUsage` (line 1502-1527)
2. ❌ `getTokenUsageSummary()` **MISSING** - should read from `stateManager.getExecutionState(workflowId).tokenUsage`
3. ❌ `getTokenLedger()` **MISSING** - should read from `stateManager.getExecutionState(workflowId).tokenLedger`
4. ❌ Methods don't exist → **undefined** → **TypeError**
5. ❌ `totalTokensUsed` is **undefined/0**
6. ❌ Wallet debit **SKIPPED**

## AVAILABLE HELPERS

### ✅ tokenHelpers.js has:
- `calculateTokenUsageFromOutputs(nodeOutputs)` - calculates from outputs (fallback)
- `buildTokenLedgerFromOutputs(nodeOutputs)` - builds ledger from outputs (fallback)
- `deriveNodeTokenMetrics(nodeOutput)` - gets metrics from single node

### ✅ stateManager has:
- `getExecutionState(workflowId)` - returns state with `tokenUsage` and `tokenLedger`
- `updateExecutionState(workflowId, updates)` - stores tokenUsage updates

### Current State:
- ✅ `recordNodeTokenUsage()` uses `deriveNodeTokenMetricsHelper()` and stores in stateManager
- ❌ `getTokenUsageSummary()` **MISSING** - should read stateManager OR calculate from nodeOutputs
- ❌ `getTokenLedger()` **MISSING** - should read stateManager OR build from nodeOutputs

## FIX REQUIRED

**Missing Methods to Add:**
```javascript
getTokenUsageSummary(workflowId, nodeOutputs) {
  // PRIMARY: Check stateManager (where recordNodeTokenUsage stores data)
  const state = stateManager.getExecutionState(workflowId)
  if (state?.tokenUsage) {
    return state.tokenUsage // { totalTokens, totalCost, totalWords }
  }
  
  // FALLBACK: Calculate from nodeOutputs using helpers
  if (nodeOutputs && Object.keys(nodeOutputs).length > 0) {
    return calculateTokenUsageFromOutputsHelper(nodeOutputs)
  }
  
  // DEFAULT: Return zero totals
  return { totalTokens: 0, totalCost: 0, totalWords: 0 }
}

getTokenLedger(workflowId, nodeOutputs) {
  // PRIMARY: Check stateManager (where recordNodeTokenUsage stores data)
  const state = stateManager.getExecutionState(workflowId)
  if (state?.tokenLedger && Array.isArray(state.tokenLedger)) {
    return state.tokenLedger // [ledgerEntry, ...]
  }
  
  // FALLBACK: Build from nodeOutputs using helpers
  if (nodeOutputs && Object.keys(nodeOutputs).length > 0) {
    return buildTokenLedgerFromOutputsHelper(nodeOutputs)
  }
  
  // DEFAULT: Return empty ledger
  return []
}
```

## IMPACT

**Current Behavior:**
- ✅ Tokens are **tracked** in stateManager during execution (recordNodeTokenUsage works)
- ❌ Tokens are **NOT aggregated** at end of workflow (getTokenUsageSummary missing)
- ❌ `totalTokensUsed` is **undefined/0** in result
- ❌ Wallet debit is **SKIPPED** (line 777 in executionService.js checks `if (totalTokensUsed > 0)`)
- ❌ **No tokens deducted from user account**

**Why It Worked 48 Hours Ago:**
- Methods existed in the God file
- They read from `this.executionState[workflowId].tokenUsage`
- They returned proper structure: `{ totalTokens, totalCost, totalWords }`
- `totalTokensUsed` was correctly set
- Wallet debit happened successfully

**What Changed:**
- Methods were accidentally removed during Phase 3 token helpers extraction
- Comments said "KEPT" but actual methods were deleted
- State storage changed from `this.executionState` to `stateManager.executionState`
- Methods need to read from `stateManager` instead of `this`

**Status:** 🔴 **CRITICAL - TOKENS NOT BEING DEDUCTED SINCE REFACTORING**