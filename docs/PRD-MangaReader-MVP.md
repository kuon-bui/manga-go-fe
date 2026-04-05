# Frontend PRD — Manga Go

**Version:** 1.0  
**Last Updated:** 2026-04-05  
**Status:** Draft

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [User Roles & Permissions (UI-level RBAC)](#2-user-roles--permissions-ui-level-rbac)
3. [Auth Flows](#3-auth-flows)
4. [Profile & Settings](#4-profile--settings)
5. [Content Discovery](#5-content-discovery)
6. [Manga / Novel Detail Page](#6-manga--novel-detail-page)
7. [Novel Reader](#7-novel-reader)
8. [Manga Viewer](#8-manga-viewer)
9. [Upload & Content Management (Translator)](#9-upload--content-management-translator)
10. [Notifications](#10-notifications)
11. [Responsive UX Requirements](#11-responsive-ux-requirements)

---

## 1. Product Overview

**Manga Go** is a modern web platform for reading manga and light novels, with community features (ratings, comments) and a self-service translation publishing system.

### Target Users

| Segment | Description |
|---|---|
| Casual Readers | Browse, follow, and read manga/novels with minimal friction |
| Power Readers | Track reading progress, manage library, customize reading experience |
| Translators | Upload and manage translated chapters for a manga/novel title |
| Group Admins | Manage translation groups, invite members, oversee group content |
| Site Admins | Moderate content, manage users, oversee platform |

### Platform Scope

- **Primary:** Web (responsive, mobile-first)
- **Breakpoints:** `xs` (≥475px) / `sm` (≥640px) / `md` (≥768px) / `lg` (≥1024px) / `xl` (≥1280px) / `2xl` (≥1536px)
- **Browser Support:** Modern browsers (ES2017+), Chrome/Safari/Firefox/Edge
- **Accessibility:** WCAG 2.1 AA minimum

---

## 2. User Roles & Permissions (UI-level RBAC)

### Role Definitions

| Role | Description |
|---|---|
| **Guest** | Unauthenticated visitor |
| **User** | Authenticated reader |
| **Group Member** | Member of a translator group |
| **Group Admin** | Owner/admin of a translator group |
| **Site Admin** | Platform-level moderator/administrator |

### UI Capability Matrix

| Feature / UI Element | Guest | User | Group Member | Group Admin | Site Admin |
|---|:---:|:---:|:---:|:---:|:---:|
| Browse & read content | ✅ | ✅ | ✅ | ✅ | ✅ |
| Follow / Library | ❌ | ✅ | ✅ | ✅ | ✅ |
| Rate & comment | ❌ | ✅ | ✅ | ✅ | ✅ |
| Reading progress sync | ❌ | ✅ | ✅ | ✅ | ✅ |
| Report content/comments | ❌ | ✅ | ✅ | ✅ | ✅ |
| Upload chapters | ❌ | ❌ | ✅ | ✅ | ✅ |
| Edit/delete own chapters | ❌ | ❌ | ✅ | ✅ | ✅ |
| Manage group members | ❌ | ❌ | ❌ | ✅ | ✅ |
| Create/delete groups | ❌ | ❌ | ❌ | ✅ | ✅ |
| Upload new manga/novel title | ❌ | ❌ | ❌ | ✅ | ✅ |
| Delete any chapter | ❌ | ❌ | ❌ | ❌ | ✅ |
| Manage users (ban/role) | ❌ | ❌ | ❌ | ❌ | ✅ |
| Admin dashboard | ❌ | ❌ | ❌ | ❌ | ✅ |

### UI Visibility Rules

- Upload buttons, "Manage Group" links, and Admin panel links are **hidden** (not just disabled) for roles that lack access.
- Auth-required actions (follow, rate, comment) display a **login prompt modal** when clicked by a Guest instead of the action UI.
- Role checks use the `usePermission(action)` hook — see [tech design](./frontend-tech-design.md#4-ui-level-rbac-implementation) for implementation.

---

## 3. Auth Flows

### 3.1 Login Page

**Route:** `/login`

**UI Components:**
- Email input + Password input with show/hide toggle
- "Remember me" checkbox
- Submit button with loading state
- OAuth section: "Continue with Google" / "Continue with Facebook" buttons (with brand icons)
- Link to Register page
- Link to Forgot Password page

**UX Behavior:**
- Inline field validation on blur (empty check, email format)
- Submit button disabled until both fields have content
- On submit: button shows spinner, inputs disabled
- On error: toast notification + shake animation on form
- On success: redirect to previous page or `/` (home)

**Device Variations:**

| Breakpoint | Layout |
|---|---|
| Mobile (< md) | Full-screen card, centered vertically, 16px padding |
| Desktop (≥ md) | Centered card (max-width 420px) on a subtle patterned background |

---

### 3.2 Register Page

**Route:** `/register`

**UI Components:**
- Display Name input
- Email input
- Password input (with strength indicator bar)
- Confirm Password input
- Terms of Service checkbox (with link)
- Submit button with loading state
- OAuth section (same as login)
- Link back to Login page

**UX Behavior:**
- Password strength indicator: weak (red) / medium (yellow) / strong (green)
- Confirm password validates on blur against password field
- Real-time availability check for email (debounced 600ms, shows spinner then ✅/❌)
- On success: auto-login and redirect to `/` with a welcome toast

---

### 3.3 Forgot Password Flow

**Routes:** `/forgot-password` → `/reset-password?token=...`

**Step 1 — Request Reset (`/forgot-password`):**
- Email input
- Submit button
- On submit: show confirmation message ("Check your email") regardless of whether email exists (security)

**Step 2 — Reset Password (`/reset-password`):**
- New Password + Confirm Password inputs
- Password strength indicator
- On success: redirect to `/login` with success toast
- On invalid/expired token: error state with link back to `/forgot-password`

---

### 3.4 OAuth Flow

- OAuth buttons initiate provider redirect
- On callback: show loading spinner page, then redirect to `/` on success
- On error: redirect to `/login?error=oauth_failed` with error toast

---

## 4. Profile & Settings

### 4.1 User Dashboard

**Route:** `/profile/:username`

**Layout:** Two-column on desktop (sidebar + content), single column on mobile.

**Sidebar:**
- Avatar (large, clickable to open crop modal)
- Display Name + Username
- Join date, reading stats (chapters read, titles followed)
- "Edit Profile" button (own profile only)

**Content Tabs:**
- **Library** — followed titles grid (links to `/library`)
- **Reading History** — recently read chapters list
- **Comments** — paginated list of user's comments

**Avatar Crop Modal:**
- Trigger: clicking avatar (own profile only)
- Upload zone: drag-and-drop or click-to-browse, accepts JPG/PNG/WEBP, max 5MB
- Crop UI: circular crop frame with drag-to-reposition and pinch/scroll-to-zoom
- Actions: "Crop & Save" / "Cancel"
- On save: optimistic avatar update, background upload

---

### 4.2 Translator Dashboard

**Route:** `/dashboard` (requires Group Admin role)

**Sections:**

**My Groups:**
- List of groups the user owns/is admin of
- "Create Group" button (opens modal)
- Each group card: group name, member count, title count, "Manage" button

**Group Management (`/dashboard/groups/:groupId`):**
- Group name, logo (editable)
- Member list table: Avatar, Name, Role (Member/Admin), joined date, "Remove" / "Change Role" actions
- Invite link section: copy-to-clipboard, "Regenerate Link" button
- "Invite by Email" form
- Danger Zone: "Delete Group" button (requires confirmation modal with group name input)

**My Uploads:**
- Table: Title, Type (Manga/Novel), Chapter count, Last Updated, Status, Actions (Edit, Add Chapter)
- "Upload New Title" button

---

### 4.3 Settings Page

**Route:** `/settings`

**Sections (tabs or anchor links):**

**Account:**
- Change email (requires password confirmation)
- Change password (current + new + confirm)
- Delete account (confirmation modal with email input)

**Profile:**
- Display Name input
- Bio textarea (max 500 chars, character counter)
- Social links (Twitter, Website)
- Save button

**Reading Preferences:**
- Default manga reading mode: Vertical / Single Page / Double Page (radio group)
- Default novel theme: Day / Night / Sepia (radio group)
- Auto-advance chapter toggle (on/off)

**Notifications:**
- Email notifications: New chapter from followed titles (toggle)
- Site notifications: New chapter, new comment reply, group invite (individual toggles)

---

## 5. Content Discovery

### 5.1 Home Page

**Route:** `/`

**Sections (vertical stack, mobile-first):**

1. **Hero Banner** — Large featured title or promotional banner. Auto-advances every 5s. Pause on hover. Dots indicator. Full-width on mobile, contained on desktop.

2. **Trending Now** — Horizontally scrollable card row on mobile, 4-column grid on desktop. Each card: cover image, title, type badge, latest chapter.

3. **Recently Updated** — List of recently updated chapters, grouped by title. Shows: cover thumbnail, title, chapter number/name, translator group, relative time ("2 hours ago").

4. **Browse by Genre** — Genre pill/chip grid. Click navigates to `/browse?genre=action`.

5. **New Titles** — Similar to Trending Now row, shows newly added manga/novels.

---

### 5.2 Advanced Search

**Route:** `/search`

**Search Bar:** Prominent, auto-focused on page load. Debounced query (300ms). Shows suggestions dropdown with top 5 matches.

**Filter Panel:**
- On mobile: collapsible drawer (bottom sheet) triggered by "Filters" button
- On desktop: fixed left sidebar (280px wide)

**Filter Options:**

| Filter | Type | Options |
|---|---|---|
| Type | Radio | Manga / Novel / All |
| Status | Checkbox | Ongoing / Completed / Hiatus / Cancelled |
| Genres | Multi-select checkbox | (fetched from API, ~20-30 genres) |
| Tags | Multi-select tag input | (fetched from API) |
| Rating | Slider | 0–10, 0.5 steps |
| Year | Range select | Start year — End year |
| Sort by | Dropdown | Relevance / Latest Update / Most Followed / Highest Rated / A-Z |
| Order | Toggle | Ascending / Descending |

**Results Grid:**
- Mobile: 2-column grid
- Tablet: 3-column grid
- Desktop: 4-5 column grid
- Each card: cover, title, type badge, status badge, rating (star + number), genre chips (max 3)
- Infinite scroll or paginated "Load More" (preference: infinite scroll with intersection observer)

**Empty State:** Illustration + "No titles found. Try adjusting your filters."

---

### 5.3 Browse by Category

**Route:** `/browse` (with query params `?genre=`, `?tag=`, `?status=`)

- Heading shows current category (e.g., "Action Manga")
- Filter sidebar (same as search, minus text query)
- Same results grid as search

---

### 5.4 Library (Followed Titles)

**Route:** `/library` (requires authentication)

**Controls bar:**
- Search within library (text input)
- View toggle: Grid / List
- Sort: Last Updated / Last Added / A-Z
- Filter: Type (All / Manga / Novel), Status, Read Progress

**Grid View:**
- Same card as search results + unread chapter count badge (e.g., "3 new")
- Card has a progress bar showing % chapters read

**List View:**
- Row: Cover thumbnail, Title, Type, Status, Unread count, Last updated, Action ("Continue Reading" button)

**Empty State:** "Your library is empty. Start following titles to track them here."

---

## 6. Manga / Novel Detail Page

**Route:** `/manga/:slug` or `/novel/:slug`

### 6.1 Layout

- **Mobile:** Single column. Cover at top (full-width, aspect 2:3), then metadata, then tabs.
- **Desktop:** Two-column. Cover (fixed-width 250px left), metadata right. Tabs below span full width.

### 6.2 Header Section

- Cover image (Next.js `<Image>`, priority=true)
- Title (h1)
- Alternative titles (collapsed, "Show more" link)
- Author / Artist / Year
- Status badge (color-coded: green=Ongoing, blue=Completed, yellow=Hiatus, red=Cancelled)
- Type badge (Manga / Novel)
- Genre chips (clickable, navigate to browse)
- Tags
- Views count, Follows count
- Action buttons (see below)

### 6.3 Action Buttons

| Action | Guest | User |
|---|---|---|
| Follow / Unfollow | Login prompt | Toggle button with follow count |
| Rate | Login prompt | Opens rating modal |
| Add to List | Login prompt | Opens list selector |
| Read First Chapter | ✅ | ✅ |
| Continue Reading | ❌ | Shows last-read chapter (if any) |

### 6.4 Star Rating Widget

- Display: 5 stars (half-star precision), aggregate average (e.g., "8.4 / 10"), vote count ("1,234 ratings")
- Interaction (authenticated): hover to preview, click to set rating (1–10 mapped to 0.5–5 stars)
- Rating Modal: star picker (full stars 1–5 or 1–10 slider), "Rate" / "Clear" / "Cancel" actions
- Optimistic update on submit

### 6.5 Synopsis

- Truncated to 4 lines with "Read more" toggle
- Full text revealed inline (no separate page)
- Supports basic formatting (bold, italic) from API

### 6.6 Content Tabs

**Tab 1: Chapters**
- Filter: Translator group selector (if multiple groups)
- Sort toggle: Newest / Oldest
- Chapter list rows: Chapter number, Chapter name, Translator group, Upload date, read/unread state (unread = bold row)
- "Mark all read" button (authenticated only)
- Virtualized list for titles with many chapters (100+)

**Tab 2: Comments**
- See [Comment System](#62-comment-system) below

**Tab 3: Info**
- Full metadata: serialization, demographics, format, original language, original publisher

### 6.7 Comment System

**Structure:**
- Top-level comments, each with threaded replies (max 2 levels of nesting displayed; deeper replies collapsed under "View more replies")
- Sort: Top (most liked) / Newest / Oldest

**Comment Card:**
- Avatar, Username, timestamp (relative + absolute on hover)
- Comment text (with spoiler tags support: `[spoiler]text[/spoiler]` → click-to-reveal)
- Like button (count), Reply button, Report button
- Edit/Delete (own comments only, within 15 minutes of posting)

**Comment Form:**
- Textarea with spoiler tag helper button
- Character limit: 2000
- Submit button (requires auth — otherwise shows login prompt)

**Pagination:**
- Top-level: paginated (20 per page) or load-more
- Replies: collapsed by default, "Show N replies" expands inline

---

## 7. Novel Reader

**Route:** `/novel/:slug/chapter/:chapterId`

### 7.1 Layout

- **Reading area:** Max-width container (adjustable via settings), centered
- **Controls:** Floating toolbar (bottom on mobile, top or side panel on desktop)
- **Chapter nav:** "Previous Chapter" / "Next Chapter" fixed at top and bottom of content

### 7.2 Typography Controls

| Control | Options | Default |
|---|---|---|
| Font Family | Serif (Georgia), Sans-serif (Inter), Monospace, OpenDyslexic | Sans-serif |
| Font Size | 14px – 24px (slider, 2px steps) | 18px |
| Line Height | 1.4 – 2.2 (slider, 0.1 steps) | 1.7 |
| Paragraph Spacing | 0 – 32px (slider, 4px steps) | 16px |
| Text Width | Narrow / Medium / Wide | Medium |

Controls are in a settings panel:
- Mobile: bottom sheet modal triggered by gear icon
- Desktop: slide-in right panel

### 7.3 Theme Engine

| Theme | Background | Text | Link |
|---|---|---|---|
| Day | `#FFFFFF` | `#1a1a1a` | `#0ea5e9` (primary) |
| Night | `#1a1a2e` | `#e2e8f0` | `#38bdf8` |
| Sepia | `#f4ecd8` | `#3d2b1f` | `#92400e` |

- Theme applies via CSS custom properties on a `.reader-root` wrapper element
- Switching theme is instant (no flash)
- Theme persists per user across sessions

### 7.4 Scroll-to-Progress Tracking

- Progress = scroll position as % of total content height
- Auto-saved to `useReadingProgressStore` (debounced 1s) and synced to backend (debounced 5s)
- On page load: restore scroll position to saved progress
- Visual indicator: thin progress bar at top of viewport (like GitHub's reading indicator)

### 7.5 Chapter Navigation

- Previous / Next chapter buttons at content top and bottom
- Chapter dropdown selector in toolbar (shows chapter number + name, current highlighted)
- Keyboard shortcuts: `←` / `→` for previous/next chapter, `T` to toggle settings panel

### 7.6 Focus / Fullscreen Mode

- Toggle in toolbar: hides site header/footer, expands reading area
- Keyboard shortcut: `F`
- On mobile: achieved by scrolling (header auto-hides after 200px scroll)

---

## 8. Manga Viewer

**Route:** `/manga/:slug/chapter/:chapterId`

### 8.1 Reading Modes

| Mode | Behavior | Best For |
|---|---|---|
| **Vertical Scroll** | All pages stacked vertically, continuous scroll | Webtoons, long-strip manga |
| **Single Page** | One page at a time, click/swipe to advance | Traditional manga |
| **Double Page** | Two pages side-by-side horizontal, swipe/click | Desktop manga reading |

- Mode selector in toolbar (icons)
- Default mode from user settings (`useSettingsStore`)
- Mode preference persisted per user

### 8.2 Page Navigation

**Vertical Scroll:**
- Natural scroll
- Page indicator overlay (e.g., "Page 5 / 24") appears on scroll, fades after 2s
- Jump-to-page: tap indicator to open input

**Single Page:**
- Click right half / swipe left → next page
- Click left half / swipe right → previous page
- Keyboard: `→` / `Space` = next, `←` = previous
- Progress bar at bottom showing current page / total

**Double Page:**
- Keyboard: `→` / `Space` = next spread, `←` = previous spread
- Swipe gesture on touch devices
- First page shown alone (cover), then pairs

### 8.3 Image Lazy-Loading & Pre-Fetching

- Initial load: first 3 pages loaded eagerly (`priority` on `next/image`)
- Remaining pages: lazy-loaded using `IntersectionObserver` (for vertical mode) or on-demand (for paged modes)
- Pre-fetching: in paged modes, pre-fetch current page ± 2
- Loading state: blurred placeholder (low-res) fades to full image on load
- Error state per page: "Image failed to load" with retry button

### 8.4 Zoom & Pan (Mobile)

- Pinch-to-zoom on touch devices (CSS `touch-action: pan-y pinch-zoom`)
- Double-tap to zoom to 150%, double-tap again to reset
- Panning available when zoomed in
- Reset button in toolbar

### 8.5 Viewer Controls & Settings Panel

**Toolbar (always visible, top of viewport):**
- Back button (to detail page)
- Chapter title + number
- Mode switcher (icon group)
- Settings gear icon
- Fullscreen toggle

**Settings Panel (slide-in):**
- Reading mode selector
- Image quality: Auto / High / Low
- Background: White / Black / Gray
- Zoom level display + reset

---

## 9. Upload & Content Management (Translator)

> Visible only to Group Member, Group Admin, Site Admin roles.

### 9.1 Upload New Title

**Route:** `/dashboard/upload/title`

**Form (stepped):**

**Step 1 — Basic Info:**
- Title (required)
- Alternative titles (multi-input)
- Type: Manga / Novel (radio)
- Status: Ongoing / Completed / Hiatus / Cancelled
- Synopsis (rich textarea)
- Cover Image upload (drag-and-drop, JPG/PNG/WEBP, max 10MB, shows preview)

**Step 2 — Metadata:**
- Author, Artist (tag inputs, supports multiple)
- Year (number input)
- Genres (multi-select checkbox from API list)
- Tags (tag input with autocomplete)
- Demographic: Shonen / Shojo / Seinen / Josei / None
- Original Language
- Original Publisher

**Step 3 — Review & Submit:**
- Preview card of how the title will appear
- "Submit for Review" button (if moderation enabled) or "Publish" directly

### 9.2 Upload Chapter

**Route:** `/dashboard/upload/chapter/:titleId`

**Form:**
- Chapter Number (required, numeric)
- Chapter Name (optional)
- Translator Group (auto-filled from user's group, changeable if in multiple groups)
- Volume Number (optional)
- Language (dropdown, default = site language)

**For Manga — Page Upload:**
- Drag-and-drop zone for image batch upload (JPG/PNG/WEBP, max 50 files)
- Uploaded pages displayed as sortable thumbnail grid (drag-to-reorder)
- Individual page: remove button, drag handle
- Progress bar during upload
- "Upload Pages" + "Publish Chapter" button

**For Novel — Content Editor:**
- Rich text editor (bold, italic, headings, line breaks)
- Or: plain text paste area
- Word count indicator
- "Save Draft" + "Publish Chapter" buttons

### 9.3 Edit / Delete Chapter

- Edit: same form as upload, pre-filled
- Delete: confirmation modal ("Are you sure you want to delete Chapter X? This cannot be undone.")
- Access: from "My Uploads" table in dashboard

---

## 10. Notifications

### 10.1 Notification Bell (Header)

- Bell icon in the site header
- Red badge with unread count (max "99+")
- Click opens Notification Panel

### 10.2 Notification Panel

- Dropdown panel (max-height 480px, scrollable)
- Tabs: All / Unread
- Each notification item:
  - Icon (chapter icon, comment icon, system icon)
  - Text: "New chapter X of [Title] is available"
  - Relative timestamp
  - Unread indicator dot
  - Click: navigate to relevant content + mark as read
- "Mark all as read" button
- "View all notifications" link → `/notifications` full page
- Empty state: "You're all caught up!"

### 10.3 Notification Types

| Type | Trigger | Action Link |
|---|---|---|
| New Chapter | Followed title gets new chapter | Chapter reader |
| Comment Reply | Someone replies to your comment | Comment on detail page |
| Group Invite | Invited to a translator group | Dashboard groups |
| System | Announcements, moderation notices | Relevant page or `/notifications` |

### 10.4 Polling Behavior

- Poll every 60 seconds while tab is active (using `visibilitychange` API to pause when tab is hidden)
- On poll: update unread count and prepend new items to panel
- Skeleton loaders shown on initial load of panel
- No full panel re-render on poll (only new items inserted at top)

---

## 11. Responsive UX Requirements

### 11.1 Navigation Pattern

| Breakpoint | Navigation Style |
|---|---|
| < md (mobile) | Bottom tab bar: Home, Search, Library, Profile |
| ≥ md (desktop) | Top header nav: Logo + links + search bar + notification bell + avatar menu |

### 11.2 Feature Breakpoint Behavior

| Feature | Mobile (< md) | Tablet (md–lg) | Desktop (≥ lg) |
|---|---|---|---|
| Auth forms | Full-screen | Centered card (480px) | Centered card (420px) |
| Home page | Single column, horizontal scroll rows | 2-col trending grid | 4-col grid |
| Search filters | Bottom sheet drawer | Collapsible side panel | Fixed left sidebar |
| Search results | 2-col grid | 3-col grid | 4-col grid |
| Detail page | Single column | Single column | 2-col (cover + info) |
| Chapter list | Full-width rows | Full-width rows | Full-width rows |
| Novel reader controls | Bottom floating bar | Top bar + side panel | Side panel |
| Manga viewer | Full-screen, tap zones | Full-screen | Full-screen with side toolbar |
| Profile | Single column | Two-column | Two-column |
| Dashboard | Single column | Two-column | Three-column |
| Settings | Full-page sections | Full-page sections | Sidebar + content |
| Comment section | Single column | Single column | Max-width 800px centered |

### 11.3 Touch Targets

- All interactive elements (buttons, links, form controls): minimum **44×44px** tap target
- Chapter list rows: minimum 48px height
- Manga viewer tap zones (left/right): 30% of viewport width each

### 11.4 Swipe Gestures

| Context | Gesture | Action |
|---|---|---|
| Manga Viewer (Single/Double) | Swipe left | Next page/spread |
| Manga Viewer (Single/Double) | Swipe right | Previous page/spread |
| Novel Reader | Swipe left | Next chapter |
| Novel Reader | Swipe right | Previous chapter |
| Settings panel | Swipe down | Close panel |
| Notification panel | Swipe up/click outside | Close panel |

### 11.5 Keyboard Navigation (Desktop)

| Context | Key | Action |
|---|---|---|
| Manga Viewer | `→` / `Space` | Next page |
| Manga Viewer | `←` | Previous page |
| Manga Viewer | `F` | Toggle fullscreen |
| Novel Reader | `→` | Next chapter |
| Novel Reader | `←` | Previous chapter |
| Novel Reader | `T` | Toggle settings panel |
| Novel Reader | `F` | Toggle focus mode |
| Global | `Escape` | Close modal / panel |
| Global | `/` | Focus search bar |

---

*This PRD defines the UI requirements. For implementation details, architecture, and technical decisions, see [docs/frontend-tech-design.md](./frontend-tech-design.md).*
