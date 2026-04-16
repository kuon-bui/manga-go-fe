# AGENTS.md — Master Plan for Manga Go Frontend

## Project Overview & Stack

**App:** Manga Go  
**Overview:** A modern, responsive web platform for reading manga and light novels. Core value: a seamless multi-mode reading experience (vertical scroll, single page, double page for manga; customizable typography + Day/Night/Sepia themes for novels), combined with self-service translation publishing for groups and community features (star ratings, nested comments, library/follow). Primary users are casual readers, power readers, translators, and group admins.  
**Stack:** Next.js 15 App Router · React 19 · TypeScript 5.8 (strict) · Tailwind CSS 3.4 · shadcn/ui · Zustand 5 · TanStack Query · Yarn  
**Critical Constraints:**
- Mobile-first design — start every component with mobile styles, add breakpoints up
- Strict TypeScript — `any` is FORBIDDEN; use `unknown` + type guards if necessary
- Kebab-case for all file names (e.g., `manga-card.tsx`), PascalCase for component names
- Server Components by default; only add `'use client'` when justified (interaction, stores, hooks)
- Zustand for UI/persistent client state; TanStack Query for ALL server data
- No calling Zustand stores from Server Components

## Setup & Commands

Execute these commands for standard development workflows. Do not invent new package manager commands.

- **Setup:** `yarn install`
- **Development:** `yarn dev`
- **Linting:** `yarn lint`
- **Formatting:** `yarn format`
- **Build:** `yarn build`
- **Type Check:** `yarn build` (includes `tsc --noEmit`)

## Protected Areas

Do NOT modify these areas without explicit human approval:

- **GitHub Workflows:** `.github/workflows/`
- **Base Config Files:** `tailwind.config.ts`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `.prettierrc`

## Agent Behaviors

These rules apply to ALL sessions with this codebase:

1. **Plan Before Execution:** ALWAYS read `AGENTS.md` and the relevant `agent_docs/` file first. Propose a brief step-by-step plan and wait for approval before changing more than one file.
2. **One Feature at a Time:** Build one small, testable feature at a time. Do not build multiple features in one sweep.
3. **Verify After Each Change:** Run `yarn lint` after each feature. Fix all errors and warnings before proceeding.
4. **Refactor Over Rewrite:** Prefer incremental refactoring over rewriting entire files.
5. **Context Compaction:** Write milestone state and key decisions to `MEMORY.md` rather than restating history in chat.
6. **Do NOT add features** not in the current phase — scope creep wastes sessions.
7. **No apologies** — if something breaks, diagnose and fix it immediately without commentary.

## How I Should Think

1. **Understand Intent First:** Before answering, identify what the user actually needs — not just what they literally said.
2. **Ask If Unsure:** If critical information is missing, ask ONE specific clarifying question before proceeding.
3. **Plan Before Coding:** Use Plan Mode (if available) or state the plan in text and wait for approval.
4. **Verify After Changes:** Run linter/type check after each change; fix failures before moving on.
5. **Explain Trade-offs:** When recommending a pattern, mention the alternative and why this is preferred.

## What NOT To Do

- Do NOT delete files without explicit confirmation
- Do NOT modify base config files without asking
- Do NOT add features not in the current phase
- Do NOT skip linting for "simple" changes
- Do NOT bypass failing lint or type checks
- Do NOT use deprecated patterns (`useEffect` for data fetching → use TanStack Query)
- Do NOT use relative imports from inside `src/`
- Do NOT use PascalCase for file names
- Do NOT write `any` types — ever

## Engineering Constraints

### Type Safety
- `any` is FORBIDDEN — use `unknown` with type guards or precise interfaces
- All function parameters and return types must be explicitly typed
- Export types alongside components: `export type { ButtonProps }` in the same file

### Architecture Boundaries
- Page files (`app/**/page.tsx`) handle routing and data fetching only
- Feature components in `src/components/` handle domain rendering
- Stores in `src/stores/` handle client-side state
- Hooks in `src/hooks/` handle reusable imperative logic
- `src/lib/` contains pure utilities and the API client — no React code here

### Library Governance
- Check `package.json` before suggesting new dependencies
- Prefer native browser APIs (e.g., `IntersectionObserver`, `fetch`) over additional libraries
- Any new dependency must be justified and approved

## UI/UX Standards (from Komikku analysis — apply to ALL phases)

> Reference: `docs/COMPONENT_GUIDELINES.md` for full details.

- **Animations:** Every state change must have a visual transition. Use `animate-in fade-in slide-in-from-bottom-4` for section entrances.
- **Skeletons:** Match skeleton shape exactly to real content. Never leave blank space while loading.
- **Cards:** Scale + shadow lift on hover. Cover zoom (`group-hover:scale-105`). Gradient overlay on hover.
- **Trending:** MUST be a horizontal scroll row with rank number badges (#1, #2, ...) — not a grid.
- **NEW badge:** Show red "MỚI" badge on cards/chapters updated within 24h.
- **Reader tap zones:** 25% PREV / 50% TOGGLE / 25% NEXT — never a single full-screen toggle.
- **Reader controls:** Slide in/out (translateY) not opacity fade. Progress = full-width `<input type="range">`.
- **Genre chips:** Use color-per-genre system. See `docs/COMPONENT_GUIDELINES.md`.
- **Error states:** Always show icon + message + retry button. Never empty space.

## Phase Roadmap

> Update `MEMORY.md` when moving to a new phase. Never implement a phase without completing the previous one.

### Phase 1 — Foundation & Auth ✅
- [x] App Router layout: `(auth)` and `(main)` route groups
- [x] Site Header (desktop nav) + Bottom Nav (mobile)
- [x] Login page (email/password + OAuth buttons)
- [x] Register page (with password strength)
- [x] Forgot Password + Reset Password pages
- [x] `useAuthStore` Zustand store
- [x] `src/middleware.ts` route protection
- [x] `ThemeProvider` + `useThemeStore` (light/dark/system)
- [x] `api-client.ts` with auth interceptor

### Phase 2 — Content Discovery
- [x] `MangaCard` component (card + list variants, hover effects, badges)
- [ ] **Home page — Hero section** (animated, real cover stack with floating effect)
- [ ] **Home page — Trending row** (horizontal scroll, rank number badges #1–#7)
- [ ] **Home page — Recently Updated** (NEW badge < 24h, chapter number prominent)
- [ ] **Home page — Genre section** (color-coded chips, hover animations)
- [ ] Advanced Search page (text query + multi-filter panel, bottom sheet on mobile)
- [ ] Browse page (by genre/tag/status, filter sidebar)
- [ ] Library page (grid/list toggle, unread badge, sort/filter)

### Phase 3 — Detail Pages
- [ ] Manga/Novel detail page (cover, metadata, action buttons, banner gradient)
- [ ] Follow / unfollow button (optimistic update)
- [ ] `StarRating` widget (interactive + aggregate display)
- [ ] Synopsis expand/collapse (animated)
- [ ] Chapter list (virtualized for 100+ chapters, read/unread state, group badge)
- [ ] Comment system (nested 2-level, optimistic add, like/reply/report)
- [ ] Rating modal

### Phase 4 — Readers
- [ ] **Manga reader tap zones** (25/50/25 split — not full-screen toggle)
- [ ] **Progress bar** (full-width range slider replacing dot indicators)
- [ ] **Controls slide animation** (translateY in/out, not opacity)
- [ ] Novel Reader (typography controls, Day/Night/Sepia theme, scroll-to-progress)
- [ ] Manga Viewer — Vertical Scroll mode (IntersectionObserver lazy load)
- [ ] Manga Viewer — Single Page mode (swipe/click zones, keyboard nav)
- [ ] Manga Viewer — Double Page mode (side-by-side spreads)
- [ ] Image lazy-loading + N±2 pre-fetching hook
- [ ] Keyboard shortcuts (arrows, F fullscreen, T settings, ESC back)

### Phase 5 — Translator Dashboard
- [ ] Dashboard home (groups list, uploads table with status)
- [ ] Group management page (members, invite by link/email, role change)
- [ ] Upload Title form (stepped: basic info → metadata → review)
- [ ] Upload Chapter form (batch image upload, drag-to-reorder; rich text for novel)
- [ ] Edit/delete chapters

### Phase 6 — Notifications & Polish
- [ ] Notification bell + panel + polling hook (60s interval, pause on hidden tab)
- [ ] `PermissionGate` component + `usePermission` hook across all relevant UI
- [ ] Avatar crop modal (circular, drag + zoom)
- [ ] Full settings page (account, profile, reading preferences, notifications)
- [ ] Error boundaries + global error handling (`error.tsx`, `global-error.tsx`)
- [ ] Performance audit (dynamic imports for readers, virtualization checks)

## Key Reference Documents

- **Component & Animation Standards:** `docs/COMPONENT_GUIDELINES.md`
- **State Management Patterns:** `docs/STATE_MANAGEMENT.md`
- **Product Requirements (What to build):** `docs/PRD-MangaReader-MVP.md`
- **Technical Design (How to build):** `docs/TechDesign-MangaReader-MVP.md`
- **Tech Stack Detail:** `agent_docs/tech_stack.md`
- **Full Feature List:** `agent_docs/product_requirements.md`
- **Testing Strategy:** `agent_docs/testing.md`
- **Progress & Decisions:** `MEMORY.md`
- **Review Checklist:** `REVIEW-CHECKLIST.md`
