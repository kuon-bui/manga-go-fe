# System Memory & Context 🧠
<!--
AGENTS: Update this file after every major milestone, structural change, or resolved bug.
DO NOT delete historical context if it is still relevant. Compress older completed items.
-->

## 🏗️ Active Phase & Goal

**Current Phase:** Phase 2 — Content Discovery (home page sections complete, remaining: Search/Browse/Library polish)  
**Goal:** Build the Home page, MangaCard, Search, Browse, Library — with premium animations inspired by Komikku analysis.

**Next Steps:**
1. Continue Phase 2: Advanced Search, Browse, Library pages need audit/polish
2. Phase 3: Title detail page, StarRating, chapter list, comments
3. Phase 4: Novel reader, manga reader full audit
4. Phases 5–6: Dashboard, notifications, settings

## 📂 Architectural Decisions

- **2026-04-16** — Komikku (Android manga reader) analyzed for UI/UX standards. Key patterns adopted:
  - Trending section = horizontal scroll row with rank number watermarks (#1–#10), not a grid
  - HeroSection: gradient text, entrance animations via `animate-in` / `fade-in`, animated bg blobs
  - RecentlyUpdated: compact list cards (thumbnail + title + chapter + time), "MỚI" badge < 24h
  - GenreSection: color-per-genre chips (red=action, pink=romance, purple=fantasy, etc.)
  - Reader controls: slide translateY in/out (not opacity), full-width `<input type="range">` progress bar
  - Reader tap zones: 25% PREV / 50% TOGGLE / 25% NEXT (not full-screen toggle)
  - Docs created: `docs/COMPONENT_GUIDELINES.md`, `docs/STATE_MANAGEMENT.md`

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
- [x] **Phase 2** — Content Discovery (partial: Home, Browse, Search done)
- [x] **Phase 3** — Detail Pages & Comments
- [x] **Phase 4** — Readers (Novel + Manga × 3 modes)
- [x] **Phase 5** — Translator Dashboard & Upload Flows
- [x] **Phase 6** — Notifications, RBAC Polish, Performance Audit

### Phase 3 work done (Detail Pages & Comments):
- `TitleDetailView` with separated views.
- `TitleHero` for cover, nested `useFollow` interaction.
- `ChapterList` with virtual scrolling (`@tanstack/react-virtual`), indicates "Cur" for current read chapter based on `useReadingHistories`.
- Comment Section: Optimistic Add/Delete. Real-time nested UI max-depth 2.
- Comment Reactions: Hooks `useToggleReaction` integrating with `useComments` optimistic updater. Like button fully wired to API.
### Notification work done (Phase 6 partial):
- Fixed `useNotifications`/`useUnreadCount` — `enabled` tied to `isAuthenticated`
- `NotificationProvider` (SSE + polling) mounted in `(main)/layout.tsx`
- `useNotificationStream` — SSE EventSource, auto-reconnects
- `useMarkAllRead` — optimistic badge update
- `notification-panel.tsx` — real API, error states, Vietnamese UI, typed icons
- `notification-bell.tsx` — animated badge (zoom-in), type-safe

### Reading Experience work done:
- `createReadingHistory()` called on chapter open (MangaReader)
- `markChapterRead()` wired into VerticalScrollView (last page visible) + SinglePageView (last page nav)
- Library page: tabs "Đang theo dõi" + "Lịch sử đọc" with delete
- `ReadingHistoryEntry` type + `deleteReadingHistory`, `updateReadingHistory` in apiClient

### UI Overhaul & UX Polish (April 2026 Phase 7 Initiative):
- Fixed `reading-histories` UUID length error in `useChapter`.
- Polished guest UX by adding auth paths gracefully to `BottomNav` and integrating a back button in `/login`.
- Transformed `UploadTitleForm` to use generic Combobox for Genres & Select for Translation Group to eliminate massive nested lists.
- Overhauled Reader positioning: migrated out of `(main)` layout and shifted layout logic to `fixed` overlays to completely eliminate double scrollbars.
- Redesigned `MangaCard` sizing into strict `3:4` aspect with refined fonts and hover overlays.
- Reconstructed the frontend `Home` component `TrendingSection` into a rich full-width custom Carousel replacing static Hero blocks.
- Injected `manga.translationGroup` display metadata directly into `TitleHero`.
- Developed `/groups/[slug]/page.tsx` for tracking translation group metrics + library integrations via `useBrowse`.
- Resolved `/profile/page.tsx` structural placeholder, mapping it correctly to `SettingsView`.
