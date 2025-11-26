# VPS Worker Complete Rewrite Plan

## Dependencies Found in workflowExecutionService.js:
1. supabase (from '../lib/supabase')
2. aiService
3. narrativeStructureService
4. professionalBookFormatter
5. exportService
6. accentInstructionService
7. sampleAnalysisService
8. typographyService
9. sessionManager
10. bookCompilationService
11. NODE_ROLE_CONFIG (from nodePalettes)
12. aiResponseValidator

## Action Plan:

### Step 1: Create new services directory structure
```
vps-worker/
├── services/
│   ├── workflowExecutionService.js (COPY & CONVERT)
│   ├── aiService.js (COPY & CONVERT)
│   ├── narrativeStructureService.js (COPY & CONVERT)
│   ├── professionalBookFormatter.js (COPY & CONVERT)
│   ├── exportService.js (COPY & CONVERT)
│   ├── accentInstructionService.js (COPY & CONVERT)
│   ├── sampleAnalysisService.js (COPY & CONVERT)
│   ├── typographyService.js (COPY & CONVERT)
│   ├── sessionManager.js (COPY & CONVERT)
│   ├── bookCompilationService.js (COPY & CONVERT)
│   ├── aiResponseValidator.js (COPY & CONVERT)
│   └── supabase.js (ALREADY EXISTS - keep)
├── data/
│   └── nodePalettes.js (COPY & CONVERT)
└── server.js (REWRITE)
```

### Step 2: Convert ES6 imports to CommonJS
- Change: `import X from 'Y'` → `const X = require('Y')`
- Change: `export default X` → `module.exports = X`

### Step 3: Remove browser-specific code
- Remove localStorage references
- Remove sessionStorage references
- Keep only Node.js compatible code

### Step 4: Adapt for multi-tenant
- Replace superadmin user with dynamic userId from API
- Ensure book saves to correct user

### Step 5: Integrate with existing worker
- Keep API key validation
- Keep engine_executions queue
- Replace executionService with workflowExecutionService

## Estimated Files to Copy: 12 files
## Estimated LOC: ~8,000 lines total
## Time: 1-2 hours
