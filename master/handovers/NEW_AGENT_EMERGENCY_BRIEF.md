## Emergency Context, Rules, and Non‑Negotiables for Any New Agent

### Who You Serve
The SuperAdmin is the sole decision‑maker. Your job is to execute precisely, surgically, and without cutting corners. Any deviation from the rules below is unacceptable.

### Context And Impact
- There have been repeated regressions, band‑aid fixes, and careless edits that caused crashes, broken flows, and loss of comprehensive options. This wasted time and caused severe distress to the user.
- You must treat this as an emergency recovery context. Stability, correctness, and completeness come first.

## Non‑Negotiable Rules (Follow Exactly)
- **Surgical changes only**: No broad rewrites, no dead code, no speculative edits. Fix only what is required and verify results.
- **Single Source of Truth for variables**: Use `src/data/ULTIMATE_MASTER_VARIABLES.js` exclusively for all field names and options.
- **Proper labels everywhere**: Display fields as Proper Case. No underscores in labels or placeholders.
- **Comprehensive options restored**: Writing styles, tones, accents, target audiences, word counts, chapter counts, output formats must be full and professional (10+ where applicable).
- **Output formats must include**: `txt`, `md`, `docx`, `pdf`, `html` at minimum; keep `epub`, `rtf`, `odt`, and audio formats (`mp3`, `wav`, `m4a`, `audiobook`) available.
- **Minima requirements**:
  - Word count buckets must start at “500‑1500” (no smaller buckets in default UI selections presented to clients).
  - Chapter count must start from `3` (no 1–2 in client‑facing defaults).
- **Role enforcement**: Honor `NODE_ROLE_CONFIG` permissions. Process nodes must not all behave identically; roles must be visible and enforced.
- **Zero band‑aid solutions**: No hardcoded demo data. Everything must be driven by configs and master variable options.
- **Awesome Templates are gone**: Do not re‑introduce any legacy “Awesome Templates” code or node definitions.
- **Client Flows only from node palettes**: All prebuilt workflows must use nodes defined in `src/data/nodePalettes.js`.
- **Magical UI/UX**: Theme‑aware, modern, glassmorphism, polished micro‑interactions, and performance at 60fps.
- **Execution order preservation**: Display order must match execution order; do not reorder results arbitrarily.

## Current Architecture Snapshot (You Must Respect This)
- **Frontend**: React, Tailwind, Framer Motion, Lucide React, ThemeContext with 5 themes, heavy use of CSS variables.
- **Backend/Worker**: `vps-worker/services/*` for AI execution and output handling.
- **Database**: Supabase (auth, tables for models, keys, configs, books, etc.).
- **Node Palette System**: `NODE_PALETTES` and `NODE_ROLE_CONFIG` define reusable node templates and role permissions.
- **Master Variables**: `ULTIMATE_MASTER_VARIABLES.js` consolidates all variable names/options and provides helpers.

## What Went Wrong (And Must Never Recur)
- Input node modal repeatedly crashed due to inconsistent select option rendering and wrong helper imports. Root causes included:
  - Rendering objects as React children instead of mapping `value`/`label`.
  - Reverting imports from `ULTIMATE_MASTER_VARIABLES.js` to old files and calling non‑existent `getFormVariables`.
  - Hardcoded, reduced option lists replacing the original comprehensive sets.
- Client Flows showed underscore labels and weak options because they didn’t source from the master options.
- Genre detection defaulted to Business due to poor heuristics and defaults.
- Audiobook formats weren’t exposed properly in UI options during consolidation.
- “Awesome Templates” legacy code polluted the experience.

## What Is Fixed (Keep It That Way)
- Flow node modal now pulls from `ULTIMATE_MASTER_VARIABLES.js` and uses `getUltimateFormVariables`, `getFieldOptions`, and `getFieldName` to render labels/options correctly.
- Robust select rendering: Handles both string and object options without crashing.
- Gradient role labels for canvas nodes implemented in `FlowNodes.jsx` for clear role distinction.
- Client Flows section exists and loads prebuilt flows; flows are organized and rely on node palettes.
- Worker respects multi‑format output and preserves token usage/analytics in responses.
- AI Thinking and User modals: organization, error handling, and clarity improved.

## Must‑Do Standards
- **Variables and Options**
  - Always resolve options via `getFieldOptions(field)`.
  - Always resolve field names via `getFieldName(field)`; if missing, convert snake_case to Proper Case.
  - Do not duplicate or diverge from `ULTIMATE_OPTIONS` and `ULTIMATE_VARIABLES`.

- **Client Flows**
  - Use `optionsSource` to pull options from `ULTIMATE_MASTER_VARIABLES.js` (e.g., `word_counts`, `chapter_counts`, `tones`, `writing_styles`, `output_formats`).
  - Each flow: one primary writer; architect where applicable; input nodes must have enough required/optional fields.
  - No underscores in user‑facing labels. Keep names polished.

- **Audiobook Functionality**
  - Ensure audio formats are offered in the input (MP3/WAV/M4A/audiobook package) where relevant.
  - Verify ElevenLabs/voice cloning toggles are surfaced and saved; if backend action is missing, document gaps clearly and do not fake functionality.

- **Genre Detection**
  - Default to “creative” if no clear match, and expand keyword matching for `health`, `technical`, `business`, `marketing`, `finance`, `education`, `creative`.

- **Outputs**
  - When the user selects multiple formats, deliver all of them. Respect user order when sensible; never drop a selected format.

- **Performance & UX**
  - 60fps animations, GPU‑accelerated transitions, no jank. No blocking renders in modals. Keep error states graceful and explicit to the user.

## Files You Must Know (Do Not Break)
- `src/data/ULTIMATE_MASTER_VARIABLES.js` — single source of truth. Use `getUltimateFormVariables`, `getFieldOptions`, `getFieldName`, and `STANDARD_OPTIONS`.
- `src/data/clientFlows.js` — 10 prebuilt flows. Ensure fields use `optionsSource` and polished names.
- `src/data/nodePalettes.js` — node definitions and roles. Only use nodes from here for Client Flows.
- `src/components/SuperAdmin/FlowNodeModal.jsx` — node configuration modal. Must not crash; must render inputs from master variables.
- `src/components/SuperAdmin/FlowNodes.jsx` — gradient role labels on canvas; keep roles visually distinct.
- `vps-worker/services/workflowExecutionService.js` — execution order, multi‑format outputs, token tracking; respect and extend carefully.
- `vps-worker/services/aiService.js` — ensure usage data is preserved.
- `src/components/AIThinkingModal.jsx`, `src/components/GenerateModal.jsx` — thinking UI, errors, and cancellation handling.

## Immediate Expectations For Any New Agent
- **Your posture**: You are here to fix, not to experiment. Treat instructions as strict requirements.
- **First steps (no deviations):**
  1. Confirm all variable resolution in UI uses `ULTIMATE_MASTER_VARIABLES.js` helpers. Remove any strays.
  2. Verify all Client Flows’ `inputFields` have Proper Case names and use `optionsSource` for master options. No hardcoded reduced lists.
  3. Ensure input node modal opens reliably across all flows. No console errors, no React child exceptions.
  4. Validate that selecting multiple output formats produces all deliverables. Confirm worker’s `executeOutputNode` stores/returns them.
  5. Re‑check genre detection default is “creative” with expanded heuristics.
  6. Verify audiobook flows show audio formats and surface voice features in UI (document any missing backend action without faking it).
  7. Confirm role labels and permissions are enforced from `NODE_ROLE_CONFIG`.

- **Do / Don’t**
  - Do: Write surgical, reversible edits. Keep logs clear. Add null checks.
  - Don’t: Re‑introduce legacy variables or duplicated option lists. Don’t ship partial options. Don’t leave placeholders in production paths.

## Escalation And Reporting
- On any ambiguity, document the exact question and proposed resolution; do not guess.
- If a feature toggle exists but backend is missing, surface a clear UI notice and file a follow‑up task. Never fake the action.

## Appendix: Mandatory Lists (Client‑Facing Defaults)
- **Output formats (minimum)**: `txt`, `md`, `docx`, `pdf`, `html` (keep additional formats available).
- **Word count buckets (start at)**: `500‑1500`, then increasing professional ranges.
- **Chapter count (start at)**: `3`, then 4, 5, 6, 7, etc.
- **Comprehensive categories**: writing styles, tones, accents, target audiences must remain 10+ where applicable.

---
This brief is the operating contract. If you cannot meet these standards, escalate immediately. Otherwise, execute with precision and validate every outcome.


