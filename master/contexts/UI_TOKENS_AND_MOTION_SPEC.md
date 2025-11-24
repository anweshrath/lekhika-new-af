## UI Tokens and Motion Spec (Phase 0)

Purpose: styling-only foundation that lifts visual quality without touching logic. Safe to implement incrementally. All values are design tokens – no hardcoded colors in components.

### 1) Color System (theme-aware)
- Roles (used for nodes/badges/labels):
  - input: from-sky-400 to-cyan-500
  - process: from-emerald-400 to-teal-500
  - condition: from-amber-400 to-orange-500
  - preview: from-fuchsia-400 to-violet-500
  - output: from-indigo-400 to-blue-500
- Surfaces (glass):
  - surface-default: rgba(255,255,255,0.04) on dark; rgba(0,0,0,0.03) on light
  - surface-hover: +0.02 alpha
  - surface-active: +0.04 alpha
- Borders:
  - border-subtle: rgba(255,255,255,0.08) dark; rgba(0,0,0,0.08) light
  - border-strong: rgba(255,255,255,0.16) dark; rgba(0,0,0,0.16) light
- Text:
  - text-primary: theme foreground
  - text-secondary: 0.7 alpha
  - text-muted: 0.5 alpha

Implementation: map to CSS variables in theme provider, expose utility classes (e.g., bg-surface, border-subtle, text-secondary).

### 2) Shadows & Radii
- Radii: sm=8px, md=12px, lg=16px, xl=24px, 2xl=28px
- Shadows (avoid heavy blur on animated elements):
  - shadow-soft: 0 6px 18px rgba(0,0,0,0.25)
  - shadow-strong: 0 10px 30px rgba(0,0,0,0.35)
  - shadow-glow(role): inner 0 0 60px with role hue at 0.12 alpha

### 3) Motion Tokens (Framer variants)
- Durations: xs=120ms, sm=180ms, md=260ms, lg=380ms
- Easing: [0.4, 0, 0.2, 1] (standard), spring presets: stiff (60/12), soft (30/14)
- Variants:
  - hoverLift: y: [0 → -2px], scale: [1 → 1.01], duration sm
  - press: scale: [1 → 0.98], duration xs
  - appear: opacity 0→1, y 10→0, duration md
  - trail (rail chips): x 0→8px→0, opacity 0.6→1, duration md

### 4) Skeletons (replace spinners)
- Preset card skeleton: 1 title bar (w-40, h-4), 2 body lines (w-full, h-3; w-3/4, h-3)
- Form field skeleton: label (w-24, h-3), input (w-full, h-9)
- Rail chip skeleton: circle (24), bar (w-20, h-3)
- Use `aria-busy="true"` and prefers-reduced-motion safe shimmer.

### 5) Badges & Labels
- Role badge: gradient per role + thin 1px border-strong + text-shadow (for legibility). Font weight 600.
- Status badge: neutral/green/amber/red with 0.12 alpha background, 1px border, 600 text.

### 6) Focus & A11y
- Focus ring: 2px outline using theme primary; offset 2px; always visible for keyboard.
- aria-live: polite on progress sections; assertive only on errors.
- Color contrast: target ≥ 4.5:1 for key text; ≥ 3:1 for secondary text.

### 7) Component Targets (Phase 1 quick wins)
- GenerateModal:
  - Header hierarchy & spacing using tokens
  - Preset cards: badges + hoverLift + press; skeletons on load
  - Clear/Preview buttons share consistent styles
- UserExecutionModal:
  - Progress pill using motion tokens; optional read-only execution rail placeholder
- SuperAdmin/FlowNodes:
  - Role labels updated to token gradients; better legibility
- FlowNodeModal & NodePaletteModal:
  - Consistent header/footer spacing, focus rings, border-subtle

### 8) Implementation Notes (safety)
- Styling-only; no data/props changes
- Keep DOM structure stable to avoid logic regressions
- Feature-flag any animated additions if needed

### 9) Deliverables
- Tailwind/CSS variables for tokens
- Utility classes: bg-surface, border-subtle, text-secondary, role-gradient-*
- Motion variants file (motionTokens.ts/js)
- Skeleton components (PresetSkeleton, FormSkeleton)


