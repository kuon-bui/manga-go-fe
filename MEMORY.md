# System Memory & Context 🧠
<!--
AGENTS: Update this file after every major milestone, structural change, or resolved bug.
DO NOT delete historical context if it is still relevant. Compress older completed items.
-->

## 🏗️ Active Phase & Goal

**Current Phase:** Phase 1 — Foundation & Auth  
**Goal:** Establish the app shell (route groups, layout, navigation) and all authentication flows so every subsequent phase has a working, authenticated context to build on.

**Next Steps:**
1. Create `(auth)` and `(main)` route groups under `src/app/`
2. Build site `Header` (desktop nav) and `BottomNav` (mobile tab bar)
3. Implement `Login`, `Register`, `ForgotPassword`, `ResetPassword` pages
4. Create `useAuthStore` Zustand store (user, token, logout)
5. Create `src/middleware.ts` for route protection
6. Create `ThemeProvider` and `useThemeStore` (light/dark/system)
7. Create `src/lib/api-client.ts` with auth Bearer interceptor

## 📂 Architectural Decisions

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

- [ ] **Phase 1** — Foundation & Auth
- [ ] **Phase 2** — Content Discovery
- [ ] **Phase 3** — Detail Pages & Comments
- [ ] **Phase 4** — Readers (Novel + Manga × 3 modes)
- [ ] **Phase 5** — Translator Dashboard & Upload Flows
- [ ] **Phase 6** — Notifications, RBAC Polish, Performance Audit
