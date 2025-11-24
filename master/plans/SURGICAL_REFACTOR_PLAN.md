# SURGICAL REFACTOR PLAN - workflowExecutionService.js
## Target: Reduce from 3,455 lines to ~700 lines
## STATUS: ✅ IMPLEMENTATION COMPLETE (2025-01-27)

### CURRENT STATUS:
- **Current Size:** 1237 lines (down from 1447)
- **All Extraction Phases:** COMPLETE ✅
- **See:** `EXTRACTION_IMPLEMENTATION_LOG.md` for details

## IMMEDIATE FIX REQUIRED (BEFORE REFACTORING)
**ERROR**: `this.__sanitizePermissions is not a function`
- **Location**: Lines 1795, 1812, 1818, 1832, 1904 in `formatFinalOutput`
- **Fix**: Import `sanitizePermissions` from `./sanitizeUtils.js` and replace all `this.__sanitizePermissions()` calls with `sanitizePermissions()`
- **Files affected**: `vps-worker/services/workflowExecutionService.js`

---

## DEPENDENCY MAP

### Files that REQUIRE workflowExecutionService:
1. **vps-worker/server.js** (line 203)
   - Uses: `workflowExecutionService.resumeExecution()`
   
2. **vps-worker/services/executionService.js** (line 2)
   - Uses: `workflowExecutionService.executeWorkflow()`
   
3. **vps-worker/services/workflow/index.js** (line 6)
   - Extends: `WorkflowExecutionService` class

### Frontend files (separate implementation):
- `src/services/workflowExecutionService.js` (frontend version - separate)
- `src/components/SuperAdmin/WorkflowExecutionModal.jsx`
- `src/components/SuperAdmin/Flow.jsx`
- `src/api/engines.js`
- `src/components/SuperAdmin/AlchemistFlow.jsx`

### PUBLIC API METHODS (must remain in class):
These methods are called by external files and MUST stay in the class:
- `executeWorkflow(nodes, edges, initialInput, workflowId, progressCallback, superAdminUser)`
- `resumeExecution(executionId, nodes, edges, progressCallback)`
- `buildExecutionOrder(nodes, edges)` - Used internally by executeWorkflow
- `executeNode(node, pipelineData, workflowId, progressCallback)` - Used internally
- `canSkipNode(node, pipelineData, workflowId)` - Used internally

---

## EXTRACTION PLAN

### PHASE 1: Helper Methods → `workflow/helpers/`

#### 1.1 Create `workflow/helpers/outputHelpers.js`
**Extract**:
- `formatFinalOutput()` → export as `formatFinalOutput`
- `generateDeliverables()` → export as `generateDeliverables`
- `getMimeType()` → export as `getMimeType`
- `generateMarkdownOutput()` → export as `generateMarkdownOutput`
- `generateHTMLOutput()` → export as `generateHTMLOutput`
- `generatePlainTextOutput()` → export as `generatePlainTextOutput`
- `generatePDFOutput()` → export as `generatePDFOutput`
- `generateEPUBOutput()` → export as `generateEPUBOutput`
- `generateDOCXOutput()` → export as `generateDOCXOutput`
- `generateXMLOutput()` → export as `generateXMLOutput`
- `generateCSVOutput()` → export as `generateCSVOutput`
- `generateYAMLOutput()` → export as `generateYAMLOutput`
- `generateRTFOutput()` → export as `generateRTFOutput`
- `generateODTOutput()` → export as `generateODTOutput`
- `generateGenericOutput()` → export as `generateGenericOutput`
- `generateFormatOutput()` → export as `generateFormatOutput`

**Dependencies**:
- `professionalBookFormatter` (already imported)
- `sanitizePermissions` from `../../sanitizeUtils.js`

**Wire back**: In `executeOutputNode()`, pass these helpers to `outputHandler.js`

#### 1.2 Create `workflow/helpers/tokenHelpers.js`
**Extract**:
- `deriveNodeTokenMetrics()` → export as `deriveNodeTokenMetrics`
- `calculateTokenUsageFromOutputs()` → export as `calculateTokenUsageFromOutputs`
- `buildTokenLedgerFromOutputs()` → export as `buildTokenLedgerFromOutputs`
- `extractNumericValue()` → export as `extractNumericValue`
- `getTokenUsageSummary()` → keep in class, use helpers internally
- `getTokenLedger()` → keep in class, use helpers internally
- `recordNodeTokenUsage()` → keep in class, use helpers internally

**Dependencies**: None (pure functions)

**Wire back**: Import in class, use in token tracking methods

#### 1.3 Create `workflow/helpers/conditionHelpers.js`
**Extract**:
- `evaluateCondition()` → export as `evaluateCondition`
- `executeConditionAction()` → export as `executeConditionAction`

**Dependencies**: None (pure functions that use pipelineData)

**Wire back**: Already wired via `conditionHandler.js` helpers bundle

#### 1.4 Create `workflow/helpers/executionHelpers.js`
**Extract**:
- `updateExecutionState()` → export as `updateExecutionState` (needs access to `executionState` Map - see note)
- `getExecutionState()` → export as `getExecutionState`
- `clearExecutionState()` → export as `clearExecutionState`
- `stopWorkflow()` → export as `stopWorkflow`
- `isWorkflowStopped()` → export as `isWorkflowStopped`
- `isWorkflowPaused()` → export as `isWorkflowPaused`
- `pauseWorkflow()` → export as `pauseWorkflow`
- `resumeWorkflow()` → export as `resumeWorkflow`
- `checkDatabaseStopSignal()` → export as `checkDatabaseStopSignal`
- `createCheckpoint()` → export as `createCheckpoint`
- `waitForResume()` → export as `waitForResume`
- `retryNode()` → export as `retryNode`
- `getCurrentPausedWorkflow()` → export as `getCurrentPausedWorkflow`
- `hasPausedWorkflow()` → export as `hasPausedWorkflow`
- `getAllExecutionStates()` → export as `getAllExecutionStates`
- `clearAllExecutions()` → export as `clearAllExecutions`
- `killStuckExecutions()` → export as `killStuckExecutions`

**Dependencies**:
- `executionState` Map (class instance) - **SOLUTION**: Pass `executionState` as parameter or create a state manager service
- `checkpointStates` Map (class instance) - **SOLUTION**: Same as above
- `getSupabase()` for `checkDatabaseStopSignal`

**NOTE**: These need access to class instance state. **SOLUTION**: Create `workflow/state/executionStateManager.js` that holds the Maps and exports all state management functions.

#### 1.5 Create `workflow/helpers/inputHelpers.js`
**Extract**:
- `validateInputFields()` → export as `validateInputFields`
- `structureInputData()` → export as `structureInputData`
- `uploadFileToSupabase()` → export as `uploadFileToSupabase`
- `identifyMissingOptionals()` → export as `identifyMissingOptionals`
- `createNextNodeInstructions()` → export as `createNextNodeInstructions`

**Dependencies**:
- `getSupabase()` for `uploadFileToSupabase`

**Wire back**: Import in class, use in `executeInputNode()`

#### 1.6 Create `workflow/helpers/resumeHelpers.js`
**Extract**:
- `resumeFromNode()` → export as `resumeFromNode`
- `restartFromCheckpoint()` → export as `restartFromCheckpoint`
- `restartFailedNode()` → export as `restartFailedNode`
- `continueWorkflowFromNode()` → export as `continueWorkflowFromNode`
- `continueExecutionFromNode()` → export as `continueExecutionFromNode`

**Dependencies**:
- State management functions (from executionStateManager)
- `executeNode()` (must stay in class)
- `buildExecutionOrder()` (must stay in class)

**Wire back**: Import helpers, pass class instance methods as parameters where needed

#### 1.7 Create `workflow/helpers/contentHelpers.js`
**Extract**:
- `assessContentQuality()` → export as `assessContentQuality`
- `compileWorkflowContent()` → Already extracted to `contentCompiler.js` ✅
- `__extractChapterStructure()` → Already extracted to `contentCompiler.js` ✅
- `extractChapterTitle()` → export as `extractChapterTitle`
- `convertResultsToNodeOutputs()` → export as `convertResultsToNodeOutputs`

**Dependencies**: None (pure functions)

**Wire back**: Import in class, use where needed

---

### PHASE 2: State Management → `workflow/state/executionStateManager.js`

**Create new file**: `vps-worker/services/workflow/state/executionStateManager.js`

**Purpose**: Hold `executionState` and `checkpointStates` Maps, export all state management functions.

**Structure**:
```javascript
class ExecutionStateManager {
  constructor() {
    this.executionState = new Map()
    this.checkpointStates = new Map()
  }
  
  // All state management methods here
  updateExecutionState(workflowId, updates) { ... }
  getExecutionState(workflowId) { ... }
  // ... etc
}

module.exports = new ExecutionStateManager()
```

**Wire back**: Import in `workflowExecutionService.js`, replace `this.executionState` with `stateManager.executionState`, etc.

---

### PHASE 3: Node Execution → Already Extracted ✅

**Already done**:
- ✅ `executeImageGeneration` → `handlers/imageGenerationHandler.js`
- ✅ `executeSingleAIGeneration` → `handlers/contentGenerationHandler.js`
- ✅ `generateMultipleChapters` → `handlers/contentGenerationHandler.js`
- ✅ `executeContentRefinement` → `handlers/contentRefinementHandler.js`
- ✅ `executePreviewNode` → `handlers/previewHandler.js`
- ✅ `executeConditionNode` → `handlers/conditionHandler.js`
- ✅ `executeOutputNode` → `handlers/outputHandler.js`

---

### PHASE 4: Service Delegations → Already Extracted ✅

**Already done**:
- ✅ Content compilation → `workflow/contentCompiler.js`
- ✅ Permissions → `workflow/permissionService.js`
- ✅ Prompts → `workflow/promptService.js`
- ✅ Input sanitization → `workflow/inputSanitizer.js`
- ✅ Sessions → `workflow/sessionService.js`
- ✅ Tests → `workflow/testService.js`
- ✅ Models → `workflow/modelService.js`
- ✅ Execution → `workflow/executionService.js`

**NOTE**: Some methods still reference sessionService indirectly. Verify all calls are routed through service.

---

## METHODS TO KEEP IN CLASS (Core Orchestration)

These methods are the core workflow orchestration and must remain:

1. `constructor()` - Initialize state manager
2. `executeWorkflow()` - Main entry point
3. `resumeExecution()` - Resume from checkpoint
4. `buildExecutionOrder()` - Dependency resolution
5. `executeNode()` - Node router/dispatcher
6. `canSkipNode()` - Skip logic
7. `executeInputNode()` - Input processing (uses inputHelpers)
8. `executeProcessNode()` - Process router (delegates to handlers)
9. Wrapper methods that delegate to handlers (already thin)

---

## EXECUTION ORDER

1. **IMMEDIATE FIX**: Fix `__sanitizePermissions` error (5 min)
   - Import `sanitizePermissions` from `sanitizeUtils.js`
   - Replace all 5 occurrences
   - Test output node

2. **PHASE 1**: Extract output helpers (30 min)
   - Create `workflow/helpers/outputHelpers.js`
   - Extract all 15 format methods
   - Wire back to `executeOutputNode` via handler
   - Test all formats

3. **PHASE 2**: Extract state management (45 min)
   - Create `workflow/state/executionStateManager.js`
   - Move Maps and all state methods
   - Update class to use state manager
   - Test state operations

4. **PHASE 3**: Extract remaining helpers (60 min)
   - Extract token helpers
   - Extract input helpers
   - Extract resume helpers
   - Extract content helpers
   - Wire all back

5. **PHASE 4**: Clean up and verify (30 min)
   - Remove unused methods
   - Verify all dependencies
   - Test end-to-end workflow
   - Check line count (target: ~700 lines)

---

## VERIFICATION CHECKLIST

After each phase:
- [ ] All imports resolve correctly
- [ ] No `undefined` method errors
- [ ] Workflow execution completes end-to-end
- [ ] Token accounting works
- [ ] Output formatting works for all formats
- [ ] State management works (pause/resume/stop)
- [ ] No regression in existing functionality

---

## RISK MITIGATION

1. **State Management**: Creating singleton state manager ensures state is shared correctly
2. **Handler Wiring**: All handlers already accept helpers bundle - just update the bundle
3. **Backward Compatibility**: Class still exports same instance, public API unchanged
4. **Testing**: Test after each phase before moving to next

---

## ESTIMATED LINE COUNT REDUCTION

- Current: 3,455 lines
- Phase 1 (output helpers): ~800 lines → 2,655 lines
- Phase 2 (state management): ~400 lines → 2,255 lines
- Phase 3 (remaining helpers): ~1,000 lines → 1,255 lines
- Phase 4 (cleanup): ~500 lines → **~750 lines** ✅

**TARGET ACHIEVED**: ~700-750 lines

---

## FILES TO CREATE

1. `vps-worker/services/workflow/helpers/outputHelpers.js`
2. `vps-worker/services/workflow/helpers/tokenHelpers.js`
3. `vps-worker/services/workflow/helpers/conditionHelpers.js`
4. `vps-worker/services/workflow/helpers/executionHelpers.js`
5. `vps-worker/services/workflow/helpers/inputHelpers.js`
6. `vps-worker/services/workflow/helpers/resumeHelpers.js`
7. `vps-worker/services/workflow/helpers/contentHelpers.js`
8. `vps-worker/services/workflow/state/executionStateManager.js`

---

**READY FOR EXECUTION UPON APPROVAL**

