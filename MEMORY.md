# System Memory & Context 🧠
<!--
AGENTS: Update this file after every major milestone, structural change, or resolved bug.
DO NOT delete historical context if it is still relevant. Compress older completed items.
-->

## 🏗️ Active Phase & Goal

**Current Phase:** Phase 2 — Content Discovery  
**Goal:** Build the Home page (hero banner, trending, recently updated, genre chips), MangaCard component, Advanced Search, Browse page, and Library page.

**Next Steps:**
1. Install additional shadcn components: `badge avatar skeleton tabs scroll-area`
2. Create `MangaCard` component (`src/components/features/content/manga-card.tsx`)
3. Build Home page (`src/app/(main)/page.tsx`) with hero + trending + recent sections
4. Build Advanced Search page (`src/app/(main)/search/page.tsx`)
5. Build Browse page (`src/app/(main)/browse/page.tsx`)
6. Build Library page (`src/app/(main)/library/page.tsx`)

## 📂 Architectural Decisions

- **2026-04-05** — Phase 1 complete. Auth pages (login/register/forgot-password/reset-password) were pre-built. `useSearchParams()` wrapped in `<Suspense>` in login and reset-password pages (Next.js 15 requirement). `src/lib/query-keys.ts` added. `src/types/index.ts` re-exports from `src/types/auth.ts` and adds content/comment/notification types. `src/types/auth.ts` extended with `displayName` and `bio` on User. Sonner toast installed; `<Toaster />` in root layout. shadcn Phase 1 components installed (button, input, label, card, separator, sonner).

*(Log specific choices made during the build here so future agents respect them)*

- **2026-04-05** — Using Next.js 15 App Router with route groups: `(auth)` for unauthenticated pages, `(main)` for the main layout with header/nav.
- **2026-04-05** — Zustand 5 for UI/persistent state; TanStack Query for ALL server data fetching. Never use `useEffect` + `fetch` directly for API calls.
- **2026-04-05** — Tailwind dark mode strategy: `class` (set on `<html>` element). Reader themes use CSS custom properties on `.reader-root[data-theme=...]` wrapper.
- **2026-04-05** — All file names: kebab-case. Component names: PascalCase. Path alias `@/` always used for internal imports.
- **2026-04-05** — Readers (Novel Reader, Manga Viewer) will be dynamically imported via `next/dynamic` to keep initial bundle small.
- **2026-04-05** — Chapter list uses `@tanstack/react-virtual` for virtualization when chapter count > ~50.
- **2026-04-05** — `RBAC` implemented UI-side via `usePermission(action)` hook + `<PermissionGate permission="...">` wrapper. Route-level protection via Next.js middleware.

## 🐛 Known Issues & Quirks

*(Log current bugs or weird workarounds here — none yet)*

## 📜 Phase Progress

- [x] **Phase 1** — Foundation & Auth
- [ ] **Phase 2** — Content Discovery
- [ ] **Phase 3** — Detail Pages & Comments
- [ ] **Phase 4** — Readers (Novel + Manga × 3 modes)
- [ ] **Phase 5** — Translator Dashboard & Upload Flows
- [ ] **Phase 6** — Notifications, RBAC Polish, Performance Audit
