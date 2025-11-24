# Lekhika App – Production Readiness Audit

> Status: **In Progress**  
> Auditor: Ghazal (you)  
> Scope: `/app/**` client experience powered by Supabase + VPS worker

---

## Legend
- ✅ – Verified working as intended
- ⚠️ – Issue found, fix required (solution proposed below)
- 🔍 – Requires follow-up investigation / decision

---

## 1. Entry Point & Routing
- ✅ `src/App.jsx` protects `/app/*` via `ProtectedRoute` (wraps `Layout`)
- ✅ `ProtectedRoute` (`src/components/ProtectedRoute.jsx`) waits for auth loading, then redirects unauthenticated users to `/login`

---

## 2. Layout & Global Providers
- ✅ Layout bootstraps global providers: `ThemeProvider`, `UserPreferencesProvider`, `UserAuthProvider`, `GamificationProvider`, `SuperAdminProvider`
- 🔍 Need to trace whether any provider assumes browser-only APIs (SSR breakage risk) – queued for verification

---

## 3. Route Map (`/app/*`)
```
/app
├─ dashboard → `pages/Dashboard.jsx`
├─ studio → `components/ContentStudio.jsx`
├─ books → `pages/Books.jsx`
│  └─ /books/:id → `components/BookReader.jsx` (fullscreen reader)
├─ copyai → `pages/CopyAITools.jsx`
├─ tokens → `components/TokenUsageDashboard.jsx`
├─ settings → `pages/Settings.jsx`
├─ profile → `pages/Profile.jsx`
├─ analytics → `pages/Analytics.jsx`
├─ billing → `pages/Billing.jsx`
└─ create → `pages/CreateBook.jsx`
```
- ✅ All `/app/*` routes share `Layout` (sidebar + header + outlet)
- ✅ `ProtectedRoute` guard ensures authentication before reaching layout
- 🔍 Need feature-by-feature validation per page (data sources, worker calls, error handling)
---

## Next Actions
1. Continue auditing remaining `/app` pages (Live, Sales, InternalAITest) and shared components (modals, services).
2. Document service-layer dependencies (e.g., `dbService`, `executionService` front→worker data contracts).
3. Validate provider assumptions (UserPreferences, Gamification, SuperAdmin contexts) for browser-only APIs and cleanup logs.

---

## Page-by-Page Findings

### Dashboard (`src/pages/Dashboard.jsx`)
- ✅ Pulls library stats via `dbService.getBooks(user.id)` (Supabase) once auth loaded
- ⚠️ Uses `window.location.href` for internal navigation (`Create Book`, `My Books`, etc.) instead of `navigate()` → direct reload, loses SPA state. **Fix:** swap to `navigate('/app/...')`.
- ⚠️ Debug logging (`console.log` spam) throughout render/effects – remove for production.
- 🔍 `AIThinkingModal` invoked with mock data (simulation only). Confirm whether keeping “AI Analysis” gimmick is intentional or should be wired to real analytics.

### Books (`src/pages/Books.jsx`)
- ✅ Loads user library via `dbService.getBooks(userId)`; maintains `filteredBooks` for search/status/type combos.
- ✅ `openBookReader` fetches latest book detail via `dbService.getBook` before displaying `BookReaderModal`.
- ✅ Download pipeline prioritises pre-signed URLs (`format_urls`) and falls back to generating blobs from stored `content`.
- 🔍 Sequential downloads rely on toast updates; confirm UX is acceptable when many formats exist.
- 🔍 Add `rel="noopener"` if we keep `window.open` for external downloads (security hardening).

### Content Studio (`src/components/ContentStudio.jsx`)
- ✅ Loads user engines from Supabase (`user_engines`, `engine_executions`) and maintains filters/search.
- ✅ Integrates Generate/Settings/SubEngine modals; ties into worker via `GenerateModal`.
- ⚠️ Extensive `console.log` instrumentation left in production code – strip or gate behind debug flag.
- ⚠️ Uses `window.location.href` for login/contact fallbacks; prefer `navigate` to avoid reload and ensure SPA consistency.
- 🔍 `levelAccessService` side-effects set current user; confirm no stale state when switching accounts.

### Create Book (`src/pages/CreateBook.jsx`)
- ✅ Loads “Go To”, default, and all engines via `dbService` helper methods (Supabase joins); batches via `Promise.all`.
- ✅ Token prediction overlay uses `tokenPredictionService` to enrich engine cards.
- ⚠️ Navigation relies on `window.location.href` (e.g. `/app/studio?engine=...`) – use `navigate` to stay in SPA and preserve state.
- ⚠️ Numerous `console.error/log` statements remain – audit and remove for production.
- 🔍 `startGenerationWithTemplate` currently logs TODO instead of triggering real generation; confirm intended roadmap.

### Token Usage Dashboard (`src/components/TokenUsageDashboard.jsx`)
- ✅ Pulls analytics via `tokenAnalyticsService.getUserTokenAnalytics(userId, period)`; UI supports period/limit filters and manual refresh.
- ⚠️ Debug `console.log` statements left in production path – remove.
- 🔍 Execution limit dropdown only slices client-side; consider pushing limit to service to reduce payload.
- 🔍 Confirm `tokenAnalyticsService` handles errors/timeouts gracefully (UI already toasts failures).

### Settings (`src/pages/Settings.jsx`)
- ✅ Tabs driven by local state; profile updates call `updateUser`, settings stored to `localStorage` fallback.
- ⚠️ `const isByokUser = tier === 'byok'` uses undefined `tier`; should derive from `user.tier` (bug).
- ⚠️ Uses `window.location.reload()` and `window.open` for certain actions; evaluate SPA alternatives / security.
- ⚠️ Extensive console logging throughout (AI status checks). Remove or guard for prod.
- 🔍 `dbService.clearAllData()` invoked from client “Danger Zone”; verify it enforces user scoping and is safe to expose.

### Profile (`src/pages/Profile.jsx`)
- ✅ Loads user profile/metrics via `dbService.getBooks` + Supabase `users` table; supports avatar upload to `profile-images` bucket.
- ✅ Editing workflow gates save behind explicit button; persists to Supabase and context (`updateProfile`).
- ⚠️ Direct Supabase writes to `users` table from client; ensure Row Level Security fully enforced.
- 🔍 Numerous theme/color computations; confirm no inline style regressions when theme list evolves.

### Analytics (`src/pages/Analytics.jsx`)
- ✅ Aggregates per-user stats via `dbService.getBooks` and `getTokenUsageAnalytics`; derives streak/productivity metrics client-side.
- ⚠️ Background particle + confetti generators use `Math.random()` during render (each render re-randomizes DOM) – hurts determinism and performance; cache seed.
- ⚠️ `window.location.href` used for internal navigation (`/app/create`); switch to router `navigate`.
- ⚠️ Extensive `console.error` logging remains; clean up for production polish.
- 🔍 Token usage aggregation sums `tokens_used` as credits – confirm units match billing expectations.

### Copy AI Tools (`src/pages/CopyAITools.jsx`)
- ✅ Integrates `alchemistService` + `AlchemistDataFlow` to execute marketing flows; auto-saves generated content.
- ⚠️ Massive console logging remains (`✅ Loaded flows`, etc.); strip for production.
- ⚠️ Export/download/create flows manipulate DOM (`document.createElement`) – consider shared utility to avoid duplication and ensure revocation.
- 🔍 `saveContent` handler referenced in JSX but actual function is `saveContentManually`; verify name mismatch (button calls `saveContent`).
- 🔍 Ensure `alchemistService.extractInputFields` gracefully handles malformed flows; currently assumes structure.

### Billing (`src/pages/Billing.jsx`)
- ✅ Uses `dbService.getBooks` + `getTokenUsageAnalytics` to compute usage and remaining credits; displays plan cards.
- ⚠️ Credits fallback defaults to 1000 when `user.credits_balance` missing; validate against actual billing rules.
- ⚠️ No payment history implementation (`paymentHistory: [] // TODO`); surface as gap for go-live.
- 🔍 Upgrade buttons currently no-op (no navigation/checkout). Confirm monetization flow.

### Generate Modal (`src/components/GenerateModal.jsx`)
- ✅ Builds dynamic form (via `engineFormService`) and drives execution polling, preset management, minimize/restore UX, and `UserExecutionModal` orchestration.
- ⚠️ Heavy realtime logging during polling (`console.log` per tick, full JSON dumps). Strip or feature-flag.
- ⚠️ Celebration particle generator uses `Math.random()` within render cycle; ensure deterministic seeds to avoid reflow jank.
- 🔍 `startPolling` hits Supabase every 3s; confirm rate limits and consider exponential backoff when `pollingIssue` persists.
- 🔍 `inputSetService.runPresetLint` imported but not guarded; confirm no runtime impact in production.

### User Execution Modal (`src/components/UserExecutionModal.jsx`)
- ✅ Drives resume/minimize/regenerate flows; pulls professional formats from worker output for downloads, save, publish.
- ⚠️ `getAggregatedContent` still assembles chapters locally; ensure it is only used for display (not download) and align with worker schema to prevent drift.
- ⚠️ Numerous console logs (`console.error`, progress dumps). Remove or gate.
- 🔍 Confetti/particle effects again rely on `Math.random()` inside render; consider memoization.
- 🔍 Verify `stopTimeout` cleanup and Supabase resume logic for edge cases (e.g., window close).

### AI Thinking Modal (`src/components/AIThinkingModal.jsx`)
- ✅ Sanitizes displayed text to remove HTML/instruction banners without touching export content.
- ⚠️ `MagicalParticles` recreates random particle positions on every render; cache to prevent layout thrash.
- ⚠️ Still heavy on framer-motion animations; ensure performance acceptable on lower-end devices.
- 🔍 Verify tabbed chapter data lines up with worker output post-formatting (uses sanitized `nodeResults`).

### User Auth Context (`src/contexts/UserAuthContext.jsx`)
- ✅ Centralizes login/register/logout/profile updates via `userAuthService`, exposes loading/error state.
- ⚠️ Verbose logging on every auth event (`console.log` success/error). Consider gating behind debug flag.
- 🔍 `changePassword` uses `user.id` but fallback `user.user_id` not applied—ensure IDs consistent.

### Theme Context (`src/contexts/ThemeContext.jsx`)
- ✅ Applies rich theme variants and persists selection via `localStorage`; updates CSS variables directly.
- ⚠️ Directly replaces `document.body.className`, which can clobber other body classes. Consider additive class management.
- 🔍 Inline creation of `<style>` adjustments happens elsewhere (e.g., GenerateModal); ensure combined effects don’t conflict.

### Live (`src/pages/Live.jsx`)
- ✅ Marketing landing experience with countdown, testimonials, CTA; all data static/in-memory.
- ⚠️ Intensive framer-motion use with `Math.random()` per render (particles, rotating purchases) → layout thrash and non-determinism.
- ⚠️ Mock “recentPurchases” rotates every 8s with hard-coded names; consider backing by real analytics or gating to avoid misleading production data.
- 🔍 CTA buttons navigate to `/login`; confirm intended flow from marketing site.

### Sales (`src/pages/Sales.jsx`)
- ✅ Comprehensive sales funnel page (hero, pricing, FAQ) with interactive CTAs and comparisons.
- ⚠️ Massive component (25k+ lines) with repeated animations, inline `Math.random()` particle systems, and static arrays; needs optimization or SSR/static export.
- ⚠️ Mock revenue/testimonial stats hardcoded; ensure sync with real metrics or flag as marketing copy.
- 🔍 Window scroll listener for floating CTA adds global event; cleanup handled, but consider throttling.

### Internal AI Test (`src/pages/InternalAITest.jsx`)
- ✅ Provides manual diagnostic suite hitting `specializedAiRouter` and `multiLlmService`; surfaces team status.
- ⚠️ Emits numerous console logs; tighten for production.
- 🔍 Uses fallback flags (`fallbackUsed`) though system mandate is “no fallbacks”; verify router honors new policy.

---

