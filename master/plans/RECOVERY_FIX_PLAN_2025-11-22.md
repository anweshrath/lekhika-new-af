# 🔥 RECOVERY FIX PLAN - November 22, 2025
## Restore All Fixes from Before Git Fuckup

**Status:** READY TO EXECUTE  
**Priority:** CRITICAL  
**Estimated Time:** 2-3 hours

---

## 📊 **CURRENT STATE ANALYSIS**

### **What We Found:**

1. **BACKUP FOLDER HAS ALL FIXES** ✅
   - Location: `vps-worker.backup_20251122_061610/`
   - Has refactored version (1238 lines)
   - Has ALL fixes from before git fuckup

2. **CURRENT vps-worker MISSING FIXES** ❌
   - Location: `vps-worker/` (production version - 1578 lines)
   - **MISSING:** `structuralNodeOutputs` preservation logic
   - **MISSING:** `structuralNodePreserver.js` utility file
   - **MISSING:** Story Architect data extraction in `contentGenerationHandler.js`
   - **HAS:** Placeholder fixes in `professionalBookFormatter.js` (same as backup)

### **Issues to Fix:**

1. **Story Architect data NOT reaching Content Writer** ❌
   - Production version doesn't preserve structural node outputs
   - Content Writer doesn't get chapter titles from Story Architect
   - Caused by missing `structuralNodeOutputs` preservation

2. **Placeholders in formats** ❌
   - TOC shows placeholders instead of real chapter titles
   - Content shows placeholders
   - Need to verify and fix across all formats

---

## 🎯 **FIX PRIORITY LIST**

### **Priority 1: Structural Node Data Passing (CRITICAL)**
**Problem:** ANY structural node output doesn't reach Content Writer despite intermediate nodes

**Root Cause:** Missing `structuralNodeOutputs` preservation mechanism

**Note:** Must work with ANY structural node (detected via `canEditStructure` permission or structural node type), NOT hardcoded to "Story Architect"

**Files to Fix:**
1. `vps-worker/services/workflowExecutionService.js`
   - Add `structuralNodeOutputs: {}` initialization in `pipelineData`
   - Add `preserveStructuralNodeOutputHelper()` call after node execution
   - Update checkpoint to include `structuralNodeOutputs`
   - Update resume to rebuild `structuralNodeOutputs` from `nodeOutputs`

2. `vps-worker/services/workflow/utils/structuralNodePreserver.js` (CREATE THIS FILE)
   - Copy from backup: `vps-worker.backup_20251122_061610/services/workflow/utils/structuralNodePreserver.js`

3. `vps-worker/services/workflow/utils/nodeClassifier.js` (VERIFY EXISTS)
   - Ensure `isStructuralNode()` function exists
   - Needed by `structuralNodePreserver.js`

4. `vps-worker/services/workflow/handlers/contentGenerationHandler.js`
   - Add structural node data extraction (lines 54-86 from backup)
   - Extract chapter titles from ANY structural node in `pipelineData.structuralNodeOutputs`
   - Iterate through ALL structural nodes (not hardcoded to one)
   - Extract chapter breakdown from any structural node that has it
   - Inject chapter titles into Content Writer prompt

5. `vps-worker/services/workflow/state/executionStateManager.js`
   - Update `createCheckpoint()` to include `structuralNodeOutputs`
   - Update checkpoint loading to restore `structuralNodeOutputs`

### **Priority 2: Placeholder Fixes (HIGH)**
**Problem:** Placeholders appear in TOC and content across all formats

**Files to Fix:**
1. `vps-worker/services/professionalBookFormatter.js`
   - ✅ Already has placeholder fix (lines 923-944)
   - Verify it's working correctly

2. `vps-worker/services/exportService.js`
   - Check PDF/DOCX generation uses actual titles (not placeholders)
   - Verify TOC uses `structural.tableOfContentsList` if available (from ANY structural node, not hardcoded)

3. `vps-worker/services/workflow/contentCompiler.js`
   - Ensure chapter titles are extracted from content
   - Strip book metadata from chapter content
   - Remove markdown separators (`---`, `##`, links)

4. `vps-worker/services/workflow/handlers/contentGenerationHandler.js`
   - Ensure chapter titles are extracted and set in output structure
   - Use structural node chapter titles if available (from ANY structural node)

---

## 📋 **DETAILED FIX PLAN**

### **Phase 1: Restore Structural Node Preservation (45 min)**

#### Step 1.1: Create structuralNodePreserver.js
```bash
# Copy from backup
cp vps-worker.backup_20251122_061610/services/workflow/utils/structuralNodePreserver.js \
   vps-worker/services/workflow/utils/structuralNodePreserver.js
```

**Verify:** File exists and exports `preserveStructuralNodeOutput` and `rebuildStructuralNodeOutputs`

#### Step 1.2: Update workflowExecutionService.js

**Location:** `vps-worker/services/workflowExecutionService.js`

**Changes needed:**

1. **Add import (around line 60-100):**
```javascript
const {
  preserveStructuralNodeOutput: preserveStructuralNodeOutputHelper,
  rebuildStructuralNodeOutputs: rebuildStructuralNodeOutputsHelper
} = require('./workflow/utils/structuralNodePreserver')
```

**Note:** Structural nodes are detected via `canEditStructure` permission or node type classification - NO hardcoding of node names

2. **Initialize pipelineData with structuralNodeOutputs (around line 298):**
```javascript
const pipelineData = {
  // ... existing properties
  structuralNodeOutputs: {}, // SURGICAL FIX: Preserve structural node outputs separately
  // ... rest of properties
}
```

3. **Add preservation call after node execution (around line 398-416):**
```javascript
          // SURGICAL FIX: Preserve structural node outputs separately
          // ANY structural node (detected via canEditStructure permission) must reach Content Writer even if intermediate nodes exist
          preserveStructuralNodeOutputHelper(node, nodeOutput, pipelineData)

// SURGICAL FIX: Only update lastNodeOutput if node produced actual content
// Skip gates/routing nodes that don't have content - they shouldn't overwrite Content Writer's output
const hasActualContent = nodeOutput.content && 
                         (typeof nodeOutput.content === 'string' || 
                          nodeOutput.allChapters || 
                          nodeOutput.chapters ||
                          nodeOutput.type === 'ai_generation')
const isGateOrRouting = nodeOutput.type === 'routing' || nodeOutput.type === 'condition_result'

if (hasActualContent && !isGateOrRouting) {
  pipelineData.lastNodeOutput = nodeOutput
  console.log(`✅ UPDATED lastNodeOutput to ${node.id} (has content)`)
} else {
  console.log(`⏭️ SKIPPING lastNodeOutput update for ${node.id} (${nodeOutput.type}) - no content or is routing node`)
}
```

4. **Update checkpoint creation (in `stateManager.createCheckpoint()`):**
   - Ensure `pipelineData.structuralNodeOutputs` is included in checkpoint

5. **Update resume logic (in `resumeExecution()`):**
   - Load `structuralNodeOutputs` from checkpoint
   - If missing, rebuild using `rebuildStructuralNodeOutputsHelper(pipelineData)`

#### Step 1.3: Update contentGenerationHandler.js

**Location:** `vps-worker/services/workflow/handlers/contentGenerationHandler.js`

**Changes needed (at start of `executeSingleAIGeneration`, around line 50-86):**

```javascript
let structuralNodeData = null
let chapterTitles = {}

if (pipelineData.structuralNodeOutputs && Object.keys(pipelineData.structuralNodeOutputs).length > 0) {
  console.log(`📐 FOUND ${Object.keys(pipelineData.structuralNodeOutputs).length} structural node outputs`)
  
  // Find ANY structural node with chapter breakdown (not hardcoded to specific node name)
  for (const [nodeId, structuralOutput] of Object.entries(pipelineData.structuralNodeOutputs)) {
    if (structuralOutput.content && typeof structuralOutput.content === 'string') {
      try {
        const unfenced = structuralOutput.content.replace(/^```json\s*/i, '').replace(/```$/i, '').trim()
        const maybeJson = unfenced.startsWith('{') ? unfenced : (structuralOutput.content.trim().startsWith('{') ? structuralOutput.content.trim() : '')
        if (maybeJson) {
          const parsed = JSON.parse(maybeJson)
          const chapterBreakdown = parsed?.story_structure?.chapter_breakdown || parsed?.chapter_breakdown
          
          if (Array.isArray(chapterBreakdown) && chapterBreakdown.length > 0) {
            structuralNodeData = parsed
            chapterBreakdown.forEach(ch => {
              if (ch.chapter && ch.title) {
                chapterTitles[ch.chapter] = ch.title
              }
            })
            console.log(`📐 EXTRACTED chapter titles from structural node ${nodeId}:`, chapterTitles)
            break // Use first structural node that has chapter breakdown
          }
        }
      } catch (e) {
        console.warn(`⚠️ Failed to parse structural node ${nodeId} output:`, e.message)
      }
    }
  }
}
```

**CRITICAL:** 
- Must work with ANY structural node (detected via `canEditStructure` permission)
- NOT hardcoded to "Story Architect" or any specific node name
- Use first structural node that has chapter breakdown data

**Then inject chapter titles into prompt (around line 150-200):**
- Add chapter titles to prompt context
- Use structural node chapter titles if available (from ANY structural node)
- Add directive: "DO NOT generate book metadata or TOC - only chapter content"
- No hardcoding of node names in comments/logs

---

### **Phase 2: Fix Placeholders (30 min)**

#### Step 2.1: Verify professionalBookFormatter.js
**Location:** `vps-worker/services/professionalBookFormatter.js`

**Already has fix (lines 923-944):**
- Filters out chapters without titles
- Doesn't use placeholders
- ✅ Should be working

**Action:** Test to verify it's working correctly

#### Step 2.2: Update exportService.js
**Location:** `vps-worker/services/exportService.js`

**Check:**
- PDF generation uses `compiledContent.sections` directly (not re-extracting from HTML)
- TOC uses `structural.tableOfContentsList` if available (from ANY structural node, not hardcoded)
- No placeholders in TOC generation

**Fix if needed:**
```javascript
// Ensure TOC uses structural.tableOfContentsList from ANY structural node (not hardcoded)
const tableOfContentsList = compiledContent.structural?.tableOfContentsList
if (tableOfContentsList && Array.isArray(tableOfContentsList) && tableOfContentsList.length > 0) {
  // Use structural node's TOC directly (from any structural node)
} else {
  // Build from sections - ensure no placeholders
}
```

#### Step 2.3: Update contentCompiler.js
**Location:** `vps-worker/services/workflow/contentCompiler.js`

**Fix needed:**
1. Strip book metadata from chapter content
   - Remove title, author, TOC, markdown links, separators (`---`)

2. Extract chapter titles properly
   - Use `extractChapterTitle()` helper
   - Don't use node name as fallback

3. Clean markdown
   - Convert markdown to HTML properly
   - Don't nest HTML elements inside `<p>` tags

---

### **Phase 3: Verification (15 min)**

#### Test Checklist:
1. ✅ Run engine with ANY structural node → Intermediate Node → Content Writer
2. ✅ Verify structural node chapter titles appear in Content Writer output (works with ANY structural node)
3. ✅ Check all formats (PDF, HTML, DOCX, MD, TXT) for placeholders
4. ✅ Verify TOC uses real chapter titles (not placeholders)
5. ✅ Check chapter titles are correct (not "Content Writer")
6. ✅ Verify no book metadata in chapter content
7. ✅ Test with different structural node names/types - must work generically

---

## 🚨 **CRITICAL FILES TO MODIFY**

### **Files to Update:**
1. ✅ `vps-worker/services/workflow/utils/structuralNodePreserver.js` - **COPY FROM BACKUP**
2. ✅ `vps-worker/services/workflowExecutionService.js` - **ADD structuralNodeOutputs logic**
3. ✅ `vps-worker/services/workflow/handlers/contentGenerationHandler.js` - **ADD Story Architect extraction**
4. ✅ `vps-worker/services/workflow/state/executionStateManager.js` - **UPDATE checkpoint/resume**
5. ✅ `vps-worker/services/exportService.js` - **VERIFY/FIX placeholders**
6. ✅ `vps-worker/services/workflow/contentCompiler.js` - **VERIFY/FIX content cleaning**

### **Files to Verify:**
1. `vps-worker/services/professionalBookFormatter.js` - Already has placeholder fix
2. `vps-worker/services/workflow/utils/nodeClassifier.js` - Must exist for structural node detection

---

## ⚠️ **IMPORTANT NOTES**

1. **Backup First:** Create backup before making changes
2. **One Fix at a Time:** Apply fixes one by one, test after each
3. **Reference Backup:** Use `vps-worker.backup_20251122_061610/` as reference for correct code
4. **Test Thoroughly:** Test with actual engine run after fixes
5. **No Hardcoding:** All fixes must be dynamic and work for any workflow structure

---

## ✅ **SUCCESS CRITERIA**

- [ ] ANY structural node chapter titles reach Content Writer (not hardcoded to specific node)
- [ ] Works with any structural node (detected via `canEditStructure` permission or node type)
- [ ] No placeholders in TOC across all formats
- [ ] No placeholders in chapter content
- [ ] Chapter titles are real (not "Content Writer" or "Chapter 1")
- [ ] TOC count matches actual chapter count
- [ ] All formats (PDF, HTML, DOCX, MD, TXT) have correct titles
- [ ] No book metadata mixed in chapter content
- [ ] No hardcoded node names in code/comments/logs

---

## 📝 **EXECUTION ORDER**

1. **Copy `structuralNodePreserver.js` from backup** (5 min)
2. **Update `workflowExecutionService.js`** (20 min)
3. **Update `contentGenerationHandler.js`** (15 min)
4. **Update `executionStateManager.js`** (10 min)
5. **Verify/fix `exportService.js`** (15 min)
6. **Verify/fix `contentCompiler.js`** (15 min)
7. **Test with engine run** (30 min)
8. **Fix any remaining issues** (30 min)

**Total Estimated Time:** 2-2.5 hours

---

**Last Updated:** November 22, 2025  
**Status:** Ready for execution

