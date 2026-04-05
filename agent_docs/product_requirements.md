# Product Requirements — Manga Go

> Full detail: `docs/frontend-prd.md`. This file is a compact reference for agents during implementation.

## Core Mission

Build a responsive web platform for reading manga and light novels with community features and translator publishing tools.

## User Roles & Permissions Matrix

| Feature | Guest | User | Group Member | Group Admin | Site Admin |
|---|:---:|:---:|:---:|:---:|:---:|
| Browse & read | ✅ | ✅ | ✅ | ✅ | ✅ |
| Follow / Library | ❌ | ✅ | ✅ | ✅ | ✅ |
| Rate & comment | ❌ | ✅ | ✅ | ✅ | ✅ |
| Upload chapters | ❌ | ❌ | ✅ | ✅ | ✅ |
| Manage group | ❌ | ❌ | ❌ | ✅ | ✅ |
| Create titles | ❌ | ❌ | ❌ | ✅ | ✅ |
| Admin panel | ❌ | ❌ | ❌ | ❌ | ✅ |

UI rule: Hide (not disable) features the current role cannot access. Use `<PermissionGate permission="...">`.

---

## Must-Have Features (MVP)

### Phase 1 — Auth & Shell
- Login (email/password + Google/Facebook OAuth)
- Register (display name, email, password with strength indicator)
- Forgot Password / Reset Password flow
- Site header (desktop) + Bottom tab nav (mobile)
- Light/Dark/System theme switching (persisted)
- Route protection (middleware)

### Phase 2 — Content Discovery
- Home page: hero banner, trending row, recently updated list, genre chips
- Advanced search: text query + multi-filter panel (type, status, genres, tags, rating, year, sort)
- Browse by genre/tag/status
- Library page: followed titles with unread badges, grid/list toggle, sort/filter

### Phase 3 — Detail Pages
- Manga/Novel detail: cover, metadata (author, artist, genres, status, year), synopsis
- Interactive star rating (1–10, displayed as 5-star with half precision) + rating modal
- Chapter list (virtualized 100+, read/unread states, translator group badge)
- Nested comment system (2 levels, like/reply/report, spoiler tags, optimistic updates)

### Phase 4 — Readers
- **Novel Reader:** typography controls (font family, size, line height, paragraph spacing, text width), Day/Night/Sepia themes, scroll-to-progress tracking (save + restore), chapter navigation, fullscreen/focus mode
- **Manga Viewer — Vertical Scroll:** all pages stacked, page indicator, IntersectionObserver-based lazy load
- **Manga Viewer — Single Page:** click/swipe zones, keyboard nav, progress bar
- **Manga Viewer — Double Page:** side-by-side spreads, swipe/keyboard nav
- Image lazy-loading + N±2 pre-fetching
- Keyboard shortcuts (arrows, F for fullscreen, T for settings)

### Phase 5 — Translator Dashboard
- Dashboard: groups list, uploads table
- Group management: member list, invite by link/email, role change, remove member
- Upload Title (stepped form: basic info → metadata → review)
- Upload Chapter: manga (batch image upload, drag-to-reorder), novel (rich text editor)
- Edit/delete chapters

### Phase 6 — Notifications & Polish
- Notification bell with unread badge
- Notification panel (dropdown, all/unread tabs, mark as read)
- Polling every 60s (paused on hidden tab)
- `PermissionGate` + `usePermission` across all relevant components
- Avatar crop modal (circular crop, drag + zoom)
- Full settings page (account, profile, reading preferences, notifications)

---

## Key User Flows

### Reading a Manga (Critical Path)
1. Land on home page → see trending row
2. Click manga card → detail page
3. See cover, metadata, chapter list
4. Click "Read First Chapter" (or "Continue Reading" if authenticated)
5. Manga Viewer opens in default reading mode
6. Navigate pages (swipe/click/keyboard)
7. End of chapter → "Next Chapter" button advances
8. Progress auto-saved

### Uploading a Chapter (Translator Flow)
1. Log in with translator account
2. Navigate to Dashboard (`/dashboard`)
3. Find the title → "Add Chapter"
4. Fill chapter number/name, select group
5. Drag-and-drop image batch → reorder thumbnails
6. Click "Publish Chapter"
7. Chapter appears in title's chapter list immediately

### Following a Title (Auth-Gated)
1. Visit detail page → click "Follow"
2. If Guest: login prompt modal appears
3. If authenticated: optimistic follow state (button changes, count +1)
4. Title appears in `/library`

---

## UX Requirements

### Responsive Behavior
| Feature | Mobile (< 768px) | Desktop (≥ 1024px) |
|---|---|---|
| Navigation | Bottom tab bar | Top header nav |
| Search filters | Bottom sheet drawer | Fixed left sidebar |
| Detail page | Single column | 2-column (cover + info) |
| Reader controls | Floating bottom bar | Side panel |
| Search results | 2-column grid | 4-column grid |

### Performance Targets
- LCP < 2.5s on mobile (3G)
- Chapter list must not freeze at 500+ chapters (virtualization)
- Manga viewer: no visible loading flash between pages (pre-fetching)
- Novel reader: theme switch is instant (no FOUC)

### Accessibility
- All interactive elements keyboard-navigable
- `aria-label` on icon-only buttons
- Focus rings visible in keyboard mode
- `alt` text on all images (meaningful, not "image")
- Color contrast WCAG AA minimum

---

## Not in MVP

- Native mobile app (iOS/Android)
- Real-time chat / group chat
- Offline reading / PWA caching
- AI-powered recommendations engine
- Payment / subscription system
- Admin dashboard (visible only to Site Admin — exists but not a primary MVP build focus)
