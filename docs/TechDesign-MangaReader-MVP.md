# Frontend Technical Design — Manga Go

**Version:** 1.0  
**Last Updated:** 2026-04-05  
**Status:** Draft

---

## Table of Contents

1. [Component Architecture](#1-component-architecture)
2. [Theme System](#2-theme-system)
3. [Reading Mode Architecture](#3-reading-mode-architecture)
4. [UI-level RBAC Implementation](#4-ui-level-rbac-implementation)
5. [State Management Architecture](#5-state-management-architecture)
6. [Comment System Architecture](#6-comment-system-architecture)
7. [Performance Patterns](#7-performance-patterns)
8. [Backend API Integration Plan](#8-backend-api-integration-plan)
9. [New File Map](#9-new-file-map)

---

## 1. Component Architecture

### 1.1 Directory Structure

```
src/
├── app/                            # Next.js App Router pages
│   ├── (auth)/                     # Route group: Login, Register, Forgot, Reset
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── forgot-password/page.tsx
│   │   └── reset-password/page.tsx
│   ├── (main)/                     # Route group: authenticated + public main pages
│   │   ├── layout.tsx              # Main layout with Header + Footer + BottomNav
│   │   ├── page.tsx                # Home page (Server Component)
│   │   ├── search/page.tsx         # Search + filter page
│   │   ├── browse/page.tsx         # Category browse page
│   │   ├── library/page.tsx        # User library (requires auth)
│   │   ├── manga/[slug]/page.tsx   # Manga detail page
│   │   ├── novel/[slug]/page.tsx   # Novel detail page
│   │   ├── profile/[username]/page.tsx
│   │   ├── settings/page.tsx
│   │   ├── notifications/page.tsx
│   │   └── dashboard/             # Translator dashboard
│   │       ├── page.tsx
│   │       ├── groups/[groupId]/page.tsx
│   │       └── upload/
│   │           ├── title/page.tsx
│   │           └── chapter/[titleId]/page.tsx
│   ├── manga/[slug]/chapter/[chapterId]/
│   │   └── page.tsx                # Manga viewer (Client-heavy)
│   └── novel/[slug]/chapter/[chapterId]/
│       └── page.tsx                # Novel reader (Client-heavy)
│
├── components/
│   ├── ui/                         # Primitive, reusable, zero business logic
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── badge.tsx               # Status / type badges
│   │   ├── avatar.tsx              # Avatar with fallback initials
│   │   ├── modal.tsx               # Generic dialog/modal wrapper
│   │   ├── bottom-sheet.tsx        # Mobile bottom drawer
│   │   ├── tabs.tsx                # Tab navigation component
│   │   ├── skeleton.tsx            # Loading skeleton
│   │   ├── toast.tsx               # Toast notification
│   │   ├── star-rating.tsx         # Star rating display + interactive
│   │   ├── progress-bar.tsx        # Thin reading progress bar
│   │   ├── slider.tsx              # Range slider for settings
│   │   └── dropdown.tsx            # Select / dropdown menu
│   │
│   ├── layout/                     # Structural layout components
│   │   ├── header.tsx              # Site header (Client — auth state + notifications)
│   │   ├── footer.tsx              # Site footer
│   │   ├── bottom-nav.tsx          # Mobile bottom tab bar (Client)
│   │   └── sidebar.tsx             # Desktop filter sidebar wrapper
│   │
│   ├── auth/                       # Auth-specific components
│   │   ├── login-form.tsx          # (Client)
│   │   ├── register-form.tsx       # (Client)
│   │   ├── oauth-buttons.tsx       # Google/Facebook OAuth buttons
│   │   └── login-prompt-modal.tsx  # Shown to guests on auth-required actions
│   │
│   ├── content/                    # Content browsing components
│   │   ├── manga-card.tsx          # Title card (cover, title, badges)
│   │   ├── manga-grid.tsx          # Grid of MangaCards
│   │   ├── chapter-list.tsx        # (Client — virtualized)
│   │   ├── chapter-row.tsx         # Single chapter list row
│   │   ├── filter-panel.tsx        # (Client — search/browse filters)
│   │   ├── search-bar.tsx          # (Client — debounced search input)
│   │   ├── genre-chips.tsx         # Clickable genre chip list
│   │   └── library-controls.tsx    # (Client — view toggle, sort, filter)
│   │
│   ├── detail/                     # Detail page components
│   │   ├── title-header.tsx        # Cover + metadata section
│   │   ├── synopsis.tsx            # Expandable synopsis
│   │   ├── action-buttons.tsx      # (Client — Follow, Rate, etc.)
│   │   ├── rating-modal.tsx        # (Client — star rating modal)
│   │   └── content-tabs.tsx        # (Client — Chapters / Comments / Info tabs)
│   │
│   ├── comments/                   # Comment system
│   │   ├── comment-thread.tsx      # (Client — recursive comment tree)
│   │   ├── comment-card.tsx        # Individual comment display
│   │   ├── comment-form.tsx        # (Client — submit form)
│   │   └── spoiler-tag.tsx         # Click-to-reveal spoiler wrapper
│   │
│   ├── readers/                    # Reader-specific components
│   │   ├── novel/
│   │   │   ├── novel-reader.tsx        # (Client — main reader container)
│   │   │   ├── novel-toolbar.tsx       # (Client — floating controls)
│   │   │   ├── novel-settings-panel.tsx # (Client — typography/theme panel)
│   │   │   └── chapter-content.tsx     # Text content renderer
│   │   └── manga/
│   │       ├── manga-viewer.tsx        # (Client — main viewer container)
│   │       ├── manga-toolbar.tsx       # (Client — mode switcher, settings)
│   │       ├── manga-settings-panel.tsx # (Client — mode, quality settings)
│   │       ├── vertical-scroll-mode.tsx # Vertical scroll layout
│   │       ├── single-page-mode.tsx    # Single page layout
│   │       ├── double-page-mode.tsx    # Double page (spread) layout
│   │       └── manga-page-image.tsx    # Single page image with lazy load
│   │
│   ├── notifications/
│   │   ├── notification-bell.tsx   # (Client — bell + unread badge)
│   │   └── notification-panel.tsx  # (Client — dropdown panel)
│   │
│   ├── profile/
│   │   ├── avatar-crop-modal.tsx   # (Client — upload + crop UI)
│   │   └── user-stats.tsx
│   │
│   ├── dashboard/
│   │   ├── group-card.tsx
│   │   ├── member-table.tsx        # (Client)
│   │   ├── upload-title-form.tsx   # (Client — stepped form)
│   │   └── upload-chapter-form.tsx # (Client — file upload + reorder)
│   │
│   └── shared/
│       ├── permission-gate.tsx     # RBAC wrapper (Client)
│       └── reading-progress-bar.tsx # Top-of-page thin progress bar
│
├── hooks/                          # Custom React hooks
│   ├── use-theme.ts                # (existing — extended)
│   ├── use-permission.ts           # RBAC permission check
│   ├── use-keyboard-shortcuts.ts   # Key event listener management
│   ├── use-scroll-progress.ts      # Scroll position tracking + debounced save
│   ├── use-intersection-observer.ts # Reusable IntersectionObserver hook
│   ├── use-image-preloader.ts      # Manga page prefetch logic
│   ├── use-notification-poller.ts  # Polling hook for notifications
│   └── use-debounce.ts             # Generic debounce hook
│
├── stores/                         # Zustand stores
│   ├── use-example-store.ts        # (existing)
│   ├── use-auth-store.ts           # Auth state + user profile
│   ├── use-theme-store.ts          # App theme + reader themes
│   ├── use-reading-progress-store.ts # Per-chapter scroll/page progress
│   ├── use-novel-reader-store.ts   # Novel reader settings (typography, theme)
│   ├── use-manga-viewer-store.ts   # Manga viewer settings (mode, zoom)
│   ├── use-library-store.ts        # Followed titles (optimistic updates)
│   └── use-notification-store.ts   # Notification list + unread count
│
├── lib/
│   ├── utils.ts                    # (existing — cn utility)
│   ├── constants.ts                # (existing — extended)
│   ├── api-client.ts               # Fetch wrapper with auth interceptor
│   └── permissions.ts              # RBAC permission constants + map
│
└── types/
    └── index.ts                    # (existing — extended with new types)
```

### 1.2 Server vs. Client Component Boundaries

**Server Components (default — no `'use client'`):**
- All page files (`page.tsx`) that fetch initial data
- `title-header.tsx` — static metadata display
- `synopsis.tsx` — static text (only JavaScript for expand toggle)
- `manga-card.tsx` — pure display, no interaction
- `manga-grid.tsx` — layout wrapper
- `chapter-content.tsx` — renders text content
- `footer.tsx`

**Client Components (require `'use client'`):**
- All form components (login-form, register-form, filter-panel, upload forms)
- All interactive readers (novel-reader, manga-viewer and their sub-components)
- All store-connected components (action-buttons, notification-bell, library-controls)
- All state-dependent components (header, bottom-nav, permission-gate)
- Hooks-using leaf components (comment-form, rating-modal, avatar-crop-modal)

**Pattern: Server Shell + Client Island**
```typescript
// app/(main)/manga/[slug]/page.tsx  — Server Component
export default async function MangaDetailPage({ params }: { params: { slug: string } }) {
  const manga = await fetchManga(params.slug);  // fetch at server level

  return (
    <main>
      <TitleHeader manga={manga} />          {/* Server: static display */}
      <Synopsis text={manga.synopsis} />     {/* Server: static text */}
      <ActionButtons mangaId={manga.id} />   {/* Client: auth-dependent */}
      <ContentTabs mangaId={manga.id} />     {/* Client: tabs + chapter list */}
    </main>
  );
}
```

### 1.3 Key Compound Component Patterns

**Reader Toolbar (Compound):**
```typescript
// Usage in novel-reader.tsx
<NovelToolbar>
  <NovelToolbar.ChapterNav />
  <NovelToolbar.ThemeToggle />
  <NovelToolbar.SettingsButton onOpen={() => setSettingsOpen(true)} />
  <NovelToolbar.ProgressIndicator progress={scrollProgress} />
</NovelToolbar>
```

**Comment Thread (Recursive):**
```typescript
// comment-thread.tsx
function CommentThread({ comment, depth = 0 }: CommentThreadProps) {
  return (
    <div className={cn('comment-thread', depth > 0 && 'ml-8 border-l pl-4')}>
      <CommentCard comment={comment} />
      {depth < 2 && comment.replies?.map((reply) => (
        <CommentThread key={reply.id} comment={reply} depth={depth + 1} />
      ))}
      {comment.replyCount > (comment.replies?.length ?? 0) && (
        <LoadMoreRepliesButton commentId={comment.id} />
      )}
    </div>
  );
}
```

---

## 2. Theme System

### 2.1 App-level Theme (Light / Dark / System)

The project already uses Tailwind's `class` dark mode strategy. The `useThemeStore` will manage the `dark` class on the `<html>` element.

**Store: `src/stores/use-theme-store.ts`**
```typescript
'use client';

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

type AppTheme = 'light' | 'dark' | 'system';
type ReaderTheme = 'day' | 'night' | 'sepia';

interface ThemeState {
  appTheme: AppTheme;
  readerTheme: ReaderTheme;
  setAppTheme: (_theme: AppTheme) => void;
  setReaderTheme: (_theme: ReaderTheme) => void;
  resolvedAppTheme: () => 'light' | 'dark';
}

export const useThemeStore = create<ThemeState>()(
  devtools(
    persist(
      (set, get) => ({
        appTheme: 'system',
        readerTheme: 'day',
        setAppTheme: (theme: AppTheme) => set({ appTheme: theme }, false, 'setAppTheme'),
        setReaderTheme: (theme: ReaderTheme) => set({ readerTheme: theme }, false, 'setReaderTheme'),
        resolvedAppTheme: () => {
          const { appTheme } = get();
          if (appTheme === 'system') {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          }
          return appTheme;
        },
      }),
      {
        name: 'theme-store',
        partialize: (state) => ({ appTheme: state.appTheme, readerTheme: state.readerTheme }),
      }
    ),
    { name: 'ThemeStore', enabled: process.env.NODE_ENV === 'development' }
  )
);
```

**Provider: `src/providers/theme-provider.tsx`**
```typescript
'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/stores/use-theme-store';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const appTheme = useThemeStore((state) => state.appTheme);
  const resolvedAppTheme = useThemeStore((state) => state.resolvedAppTheme);

  useEffect(() => {
    const root = document.documentElement;
    const resolved = resolvedAppTheme();
    root.classList.toggle('dark', resolved === 'dark');
  }, [appTheme, resolvedAppTheme]);

  // Listen for system theme changes
  useEffect(() => {
    if (appTheme !== 'system') return;
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      document.documentElement.classList.toggle('dark', mql.matches);
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [appTheme]);

  return <>{children}</>;
}
```

### 2.2 Reader Theme (Novel-specific)

Reader themes apply CSS custom properties to the `.reader-root` element. This isolates reader theming from the app-level dark mode.

**`src/app/globals.css` additions:**
```css
.reader-root[data-theme='day'] {
  --reader-bg: #ffffff;
  --reader-text: #1a1a1a;
  --reader-link: #0ea5e9;
  --reader-surface: #f8fafc;
}

.reader-root[data-theme='night'] {
  --reader-bg: #1a1a2e;
  --reader-text: #e2e8f0;
  --reader-link: #38bdf8;
  --reader-surface: #16213e;
}

.reader-root[data-theme='sepia'] {
  --reader-bg: #f4ecd8;
  --reader-text: #3d2b1f;
  --reader-link: #92400e;
  --reader-surface: #ede0c4;
}
```

**Usage in `novel-reader.tsx`:**
```typescript
const readerTheme = useThemeStore((state) => state.readerTheme);

return (
  <div
    className="reader-root min-h-screen"
    data-theme={readerTheme}
    style={{
      backgroundColor: 'var(--reader-bg)',
      color: 'var(--reader-text)',
    }}
  >
    {children}
  </div>
);
```

---

## 3. Reading Mode Architecture

### 3.1 Novel Reader Store

**`src/stores/use-novel-reader-store.ts`**
```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

type FontFamily = 'sans-serif' | 'serif' | 'monospace' | 'opendyslexic';
type TextWidth = 'narrow' | 'medium' | 'wide';

interface NovelReaderState {
  fontFamily: FontFamily;
  fontSize: number;          // px: 14–24
  lineHeight: number;        // 1.4–2.2
  paragraphSpacing: number;  // px: 0–32
  textWidth: TextWidth;
  setFontFamily: (_v: FontFamily) => void;
  setFontSize: (_v: number) => void;
  setLineHeight: (_v: number) => void;
  setParagraphSpacing: (_v: number) => void;
  setTextWidth: (_v: TextWidth) => void;
}

export const useNovelReaderStore = create<NovelReaderState>()(
  devtools(
    persist(
      (set) => ({
        fontFamily: 'sans-serif',
        fontSize: 18,
        lineHeight: 1.7,
        paragraphSpacing: 16,
        textWidth: 'medium',
        setFontFamily: (v) => set({ fontFamily: v }, false, 'setFontFamily'),
        setFontSize: (v) => set({ fontSize: v }, false, 'setFontSize'),
        setLineHeight: (v) => set({ lineHeight: v }, false, 'setLineHeight'),
        setParagraphSpacing: (v) => set({ paragraphSpacing: v }, false, 'setParagraphSpacing'),
        setTextWidth: (v) => set({ textWidth: v }, false, 'setTextWidth'),
      }),
      {
        name: 'novel-reader-store',
        partialize: (state) => ({
          fontFamily: state.fontFamily,
          fontSize: state.fontSize,
          lineHeight: state.lineHeight,
          paragraphSpacing: state.paragraphSpacing,
          textWidth: state.textWidth,
        }),
      }
    ),
    { name: 'NovelReaderStore', enabled: process.env.NODE_ENV === 'development' }
  )
);
```

### 3.2 Manga Viewer Store

**`src/stores/use-manga-viewer-store.ts`**
```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

type ReadingMode = 'vertical' | 'single' | 'double';
type ImageQuality = 'auto' | 'high' | 'low';

interface MangaViewerState {
  readingMode: ReadingMode;
  currentPage: number;
  totalPages: number;
  zoom: number;             // 1.0 = 100%
  imageQuality: ImageQuality;
  preloadQueue: string[];   // URLs pre-fetched
  setReadingMode: (_mode: ReadingMode) => void;
  setCurrentPage: (_page: number) => void;
  setTotalPages: (_total: number) => void;
  setZoom: (_zoom: number) => void;
  resetZoom: () => void;
  setPreloadQueue: (_urls: string[]) => void;
}

export const useMangaViewerStore = create<MangaViewerState>()(
  devtools(
    persist(
      (set) => ({
        readingMode: 'vertical',
        currentPage: 1,
        totalPages: 0,
        zoom: 1.0,
        imageQuality: 'auto',
        preloadQueue: [],
        setReadingMode: (mode) => set({ readingMode: mode }, false, 'setReadingMode'),
        setCurrentPage: (page) => set({ currentPage: page }, false, 'setCurrentPage'),
        setTotalPages: (total) => set({ totalPages: total }, false, 'setTotalPages'),
        setZoom: (zoom) => set({ zoom }, false, 'setZoom'),
        resetZoom: () => set({ zoom: 1.0 }, false, 'resetZoom'),
        setPreloadQueue: (urls) => set({ preloadQueue: urls }, false, 'setPreloadQueue'),
      }),
      {
        name: 'manga-viewer-store',
        // Persist only user preferences, not session state
        partialize: (state) => ({
          readingMode: state.readingMode,
          imageQuality: state.imageQuality,
        }),
      }
    ),
    { name: 'MangaViewerStore', enabled: process.env.NODE_ENV === 'development' }
  )
);
```

### 3.3 Scroll-to-Progress Tracking (Novel Reader)

**`src/hooks/use-scroll-progress.ts`**
```typescript
'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useReadingProgressStore } from '@/stores/use-reading-progress-store';
import { useDebounce } from '@/hooks/use-debounce';

export function useScrollProgress(chapterId: string) {
  const saveProgress = useReadingProgressStore((state) => state.saveProgress);
  const getProgress = useReadingProgressStore((state) => state.getProgress);
  const scrollRestoredRef = useRef(false);

  // Restore scroll position on mount
  useEffect(() => {
    if (scrollRestoredRef.current) return;
    const saved = getProgress(chapterId);
    if (saved > 0) {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      window.scrollTo({ top: totalHeight * saved, behavior: 'instant' });
    }
    scrollRestoredRef.current = true;
  }, [chapterId, getProgress]);

  // Track scroll and save (debounced)
  const handleScroll = useCallback(() => {
    const scrollTop = window.scrollY;
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = totalHeight > 0 ? scrollTop / totalHeight : 0;
    saveProgress(chapterId, Math.min(progress, 1));
  }, [chapterId, saveProgress]);

  const debouncedSave = useDebounce(handleScroll, 1000);

  useEffect(() => {
    window.addEventListener('scroll', debouncedSave, { passive: true });
    return () => window.removeEventListener('scroll', debouncedSave);
  }, [debouncedSave]);
}
```

**`src/stores/use-reading-progress-store.ts`**
```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface ReadingProgressState {
  progress: Record<string, number>;  // chapterId → scroll %
  saveProgress: (_chapterId: string, _progress: number) => void;
  getProgress: (_chapterId: string) => number;
}

export const useReadingProgressStore = create<ReadingProgressState>()(
  devtools(
    persist(
      (set, get) => ({
        progress: {},
        saveProgress: (chapterId, p) =>
          set((state) => ({ progress: { ...state.progress, [chapterId]: p } }), false, 'saveProgress'),
        getProgress: (chapterId) => get().progress[chapterId] ?? 0,
      }),
      { name: 'reading-progress', partialize: (state) => ({ progress: state.progress }) }
    ),
    { name: 'ReadingProgressStore', enabled: process.env.NODE_ENV === 'development' }
  )
);
```

### 3.4 Image Pre-Fetching Logic (Manga Viewer)

**`src/hooks/use-image-preloader.ts`**
```typescript
'use client';

import { useEffect } from 'react';

const PRELOAD_AHEAD = 2;
const PRELOAD_BEHIND = 1;

export function useImagePreloader(pageUrls: string[], currentPage: number) {
  useEffect(() => {
    const start = Math.max(0, currentPage - 1 - PRELOAD_BEHIND);
    const end = Math.min(pageUrls.length - 1, currentPage - 1 + PRELOAD_AHEAD);

    const links: HTMLLinkElement[] = [];
    for (let i = start; i <= end; i++) {
      if (!pageUrls[i]) continue;
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = pageUrls[i];
      document.head.appendChild(link);
      links.push(link);
    }

    return () => {
      links.forEach((l) => l.remove());
    };
  }, [pageUrls, currentPage]);
}
```

### 3.5 Keyboard Shortcuts Hook

**`src/hooks/use-keyboard-shortcuts.ts`**
```typescript
'use client';

import { useEffect } from 'react';

type ShortcutMap = Record<string, () => void>;

export function useKeyboardShortcuts(shortcuts: ShortcutMap, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    const handler = (e: KeyboardEvent) => {
      // Skip if focus is in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      const fn = shortcuts[e.key];
      if (fn) {
        e.preventDefault();
        fn();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [shortcuts, enabled]);
}

// Usage in manga-viewer.tsx:
// useKeyboardShortcuts({
//   ArrowRight: goNext,
//   ArrowLeft: goPrev,
//   ' ': goNext,
//   f: toggleFullscreen,
// });
```

---

## 4. UI-level RBAC Implementation

### 4.1 Permission Constants

**`src/lib/permissions.ts`**
```typescript
import type { UserRole } from '@/types';

export type Permission =
  | 'follow'
  | 'rate'
  | 'comment'
  | 'report'
  | 'upload_chapter'
  | 'manage_group'
  | 'create_title'
  | 'admin_panel';

// Extended UserRole for internal use
export type AppRole = 'guest' | UserRole | 'group_member' | 'group_admin';

const ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
  guest: [],
  user: ['follow', 'rate', 'comment', 'report'],
  group_member: ['follow', 'rate', 'comment', 'report', 'upload_chapter'],
  group_admin: ['follow', 'rate', 'comment', 'report', 'upload_chapter', 'manage_group', 'create_title'],
  admin: ['follow', 'rate', 'comment', 'report', 'upload_chapter', 'manage_group', 'create_title', 'admin_panel'],
};

export function hasPermission(role: AppRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}
```

### 4.2 Permission Hook

**`src/hooks/use-permission.ts`**
```typescript
'use client';

import { useAuthStore } from '@/stores/use-auth-store';
import { hasPermission } from '@/lib/permissions';
import type { Permission } from '@/lib/permissions';

export function usePermission(permission: Permission): boolean {
  const role = useAuthStore((state) => state.user?.role ?? 'guest');
  return hasPermission(role, permission);
}
```

### 4.3 PermissionGate Component

**`src/components/shared/permission-gate.tsx`**
```typescript
'use client';

import { usePermission } from '@/hooks/use-permission';
import type { Permission } from '@/lib/permissions';

interface PermissionGateProps {
  permission: Permission;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function PermissionGate({ permission, fallback = null, children }: PermissionGateProps) {
  const allowed = usePermission(permission);
  return <>{allowed ? children : fallback}</>;
}

// Usage:
// <PermissionGate permission="upload_chapter">
//   <UploadChapterButton />
// </PermissionGate>
//
// <PermissionGate permission="comment" fallback={<LoginPromptModal />}>
//   <CommentForm />
// </PermissionGate>
```

### 4.4 Route-level Protection (Next.js Middleware)

**`src/middleware.ts`**
```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED_ROUTES = ['/library', '/settings', '/notifications', '/dashboard'];
const GUEST_ONLY_ROUTES = ['/login', '/register', '/forgot-password'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));
  const isGuestOnly = GUEST_ONLY_ROUTES.some((r) => pathname.startsWith(r));

  if (isProtected && !token) {
    return NextResponse.redirect(new URL(`/login?redirect=${encodeURIComponent(pathname)}`, request.url));
  }

  if (isGuestOnly && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
```

---

## 5. State Management Architecture

### 5.1 Store Split Strategy

| Store | Purpose | Persist |
|---|---|---|
| `useAuthStore` | User session, profile, token | Token only |
| `useThemeStore` | App theme + reader theme | Yes |
| `useReadingProgressStore` | Chapter scroll/page progress (all chapters) | Yes |
| `useNovelReaderStore` | Novel typography + theme preferences | Yes |
| `useMangaViewerStore` | Manga reading mode + quality preferences | Mode + quality only |
| `useLibraryStore` | Optimistic follow/unfollow state | No (server is source of truth) |
| `useNotificationStore` | Notification list + unread count | No |

### 5.2 TanStack Query for Server Data

Install: `@tanstack/react-query`

**Query Key Conventions:**
```typescript
// src/lib/query-keys.ts
export const queryKeys = {
  manga: {
    list: (filters: MangaFilters) => ['manga', 'list', filters] as const,
    detail: (slug: string) => ['manga', 'detail', slug] as const,
    chapters: (mangaId: string) => ['manga', 'chapters', mangaId] as const,
  },
  novel: {
    detail: (slug: string) => ['novel', 'detail', slug] as const,
    chapter: (chapterId: string) => ['novel', 'chapter', chapterId] as const,
  },
  comments: {
    list: (contentId: string, page: number) => ['comments', contentId, page] as const,
    replies: (commentId: string) => ['comments', 'replies', commentId] as const,
  },
  library: () => ['library'] as const,
  notifications: () => ['notifications'] as const,
  user: (username: string) => ['user', username] as const,
};
```

**Provider setup in `src/providers/app-providers.tsx`:**
```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,  // 5 minutes
      retry: 2,
    },
  },
});
```

### 5.3 Optimistic Updates Pattern

**Library follow/unfollow (optimistic):**
```typescript
// In action-buttons.tsx
const queryClient = useQueryClient();

const followMutation = useMutation({
  mutationFn: (mangaId: string) => apiClient.post(`/library/${mangaId}`),
  onMutate: async (mangaId) => {
    await queryClient.cancelQueries({ queryKey: queryKeys.library() });
    const prev = queryClient.getQueryData(queryKeys.library());
    queryClient.setQueryData(queryKeys.library(), (old: LibraryItem[]) => [
      ...old,
      { mangaId, addedAt: new Date().toISOString() },
    ]);
    return { prev };
  },
  onError: (_err, _vars, context) => {
    queryClient.setQueryData(queryKeys.library(), context?.prev);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.library() });
  },
});
```

### 5.4 Auth Store

**`src/stores/use-auth-store.ts`**
```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setUser: (_user: User | null) => void;
  setToken: (_token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        token: null,
        isLoading: false,
        setUser: (user) => set({ user }, false, 'setUser'),
        setToken: (token) => set({ token }, false, 'setToken'),
        logout: () => set({ user: null, token: null }, false, 'logout'),
      }),
      {
        name: 'auth-store',
        partialize: (state) => ({ token: state.token }),
      }
    ),
    { name: 'AuthStore', enabled: process.env.NODE_ENV === 'development' }
  )
);
```

---

## 6. Comment System Architecture

### 6.1 Extended Type Definitions

Add to `src/types/index.ts`:

```typescript
export interface Comment {
  id: string;
  contentId: string;        // mangaId or novelId
  contentType: 'manga' | 'novel';
  parentId: string | null;  // null = top-level
  author: Pick<User, 'id' | 'name' | 'avatar'>;
  body: string;             // raw text with [spoiler] tags
  likeCount: number;
  isLikedByMe: boolean;
  replyCount: number;
  replies?: Comment[];      // populated on expand
  isDeleted: boolean;
  createdAt: string;
  editedAt: string | null;
}

export interface CommentPage {
  comments: Comment[];
  nextCursor: string | null;
  total: number;
}
```

### 6.2 Recursive Comment Tree Component

```typescript
// src/components/comments/comment-thread.tsx
'use client';

import { useState } from 'react';
import { CommentCard } from '@/components/comments/comment-card';
import { cn } from '@/lib/utils';
import type { Comment } from '@/types';

interface CommentThreadProps {
  comment: Comment;
  depth?: number;
}

const MAX_DEPTH = 2;

export function CommentThread({ comment, depth = 0 }: CommentThreadProps) {
  const [repliesExpanded, setRepliesExpanded] = useState(false);

  return (
    <div className={cn('w-full', depth > 0 && 'ml-6 border-l border-gray-200 pl-4 dark:border-gray-700')}>
      <CommentCard comment={comment} depth={depth} />

      {comment.replyCount > 0 && !repliesExpanded && (
        <button
          className="mt-1 text-sm text-primary-600 hover:underline dark:text-primary-400"
          onClick={() => setRepliesExpanded(true)}
        >
          Show {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
        </button>
      )}

      {repliesExpanded && depth < MAX_DEPTH && comment.replies?.map((reply) => (
        <CommentThread key={reply.id} comment={reply} depth={depth + 1} />
      ))}
    </div>
  );
}
```

### 6.3 Optimistic Comment Addition

```typescript
// In comment-form.tsx
const addCommentMutation = useMutation({
  mutationFn: (body: string) =>
    apiClient.post<Comment>(`/comments`, { contentId, contentType, parentId, body }),
  onMutate: async (body) => {
    await queryClient.cancelQueries({ queryKey: queryKeys.comments(contentId, 1) });
    const optimisticComment: Comment = {
      id: `optimistic-${Date.now()}`,
      contentId,
      contentType,
      parentId: parentId ?? null,
      author: { id: user!.id, name: user!.name, avatar: user!.avatar },
      body,
      likeCount: 0,
      isLikedByMe: false,
      replyCount: 0,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      editedAt: null,
    };
    // Prepend to first page
    queryClient.setQueryData(queryKeys.comments(contentId, 1), (old: CommentPage) => ({
      ...old,
      comments: [optimisticComment, ...old.comments],
      total: old.total + 1,
    }));
    return { optimisticComment };
  },
  onError: (_err, _vars, context) => {
    // Remove optimistic entry
    queryClient.setQueryData(queryKeys.comments(contentId, 1), (old: CommentPage) => ({
      ...old,
      comments: old.comments.filter((c) => c.id !== context?.optimisticComment.id),
      total: old.total - 1,
    }));
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.comments(contentId, 1) });
  },
});
```

---

## 7. Performance Patterns

### 7.1 Dynamic Imports for Readers

The novel reader and manga viewer are heavy client bundles. Use dynamic imports to prevent them loading on non-reader pages.

```typescript
// app/manga/[slug]/chapter/[chapterId]/page.tsx
import dynamic from 'next/dynamic';

const MangaViewer = dynamic(
  () => import('@/components/readers/manga/manga-viewer'),
  { loading: () => <ViewerLoadingSkeleton /> }
);
```

### 7.2 Manga Page Images

```typescript
// src/components/readers/manga/manga-page-image.tsx
import Image from 'next/image';

interface MangaPageImageProps {
  src: string;
  pageNumber: number;
  priority?: boolean;
}

export function MangaPageImage({ src, pageNumber, priority = false }: MangaPageImageProps) {
  return (
    <div className="relative w-full" style={{ aspectRatio: '2 / 3' }}>
      <Image
        src={src}
        alt={`Page ${pageNumber}`}
        fill
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 75vw, 60vw"
        className="object-contain"
        placeholder="blur"
        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/+F9HQAI8wNPvd7POQAAAABJRU5ErkJggg=="
      />
    </div>
  );
}
```

### 7.3 Virtualized Chapter List

For manga/novels with 100+ chapters, the chapter list is virtualized.

```typescript
// src/components/content/chapter-list.tsx
// Uses @tanstack/react-virtual for row virtualization
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

export function ChapterList({ chapters }: { chapters: Chapter[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: chapters.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,   // 56px per row
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="h-[480px] overflow-auto">
      <div style={{ height: rowVirtualizer.getTotalSize() }} className="relative w-full">
        {rowVirtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{ position: 'absolute', top: virtualItem.start, width: '100%', height: virtualItem.size }}
          >
            <ChapterRow chapter={chapters[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 7.4 Notification Polling

**`src/hooks/use-notification-poller.ts`**
```typescript
'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/use-auth-store';
import { queryKeys } from '@/lib/query-keys';

const POLL_INTERVAL_MS = 60_000;

export function useNotificationPoller() {
  const isAuthenticated = useAuthStore((state) => !!state.token);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated) return;

    const poll = () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications() });
    };

    const intervalId = setInterval(poll, POLL_INTERVAL_MS);

    // Pause polling when tab is hidden
    const handleVisibilityChange = () => {
      if (document.hidden) {
        clearInterval(intervalId);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, queryClient]);
}
```

---

## 8. Backend API Integration Plan

### 8.1 API Client

**`src/lib/api-client.ts`**
```typescript
import { useAuthStore } from '@/stores/use-auth-store';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api/v1';

class ApiClient {
  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = useAuthStore.getState().token;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${path}`, { ...options, headers });

    if (response.status === 401) {
      useAuthStore.getState().logout();
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message ?? `HTTP ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  get<T>(path: string) { return this.request<T>(path); }
  post<T>(path: string, body?: unknown) {
    return this.request<T>(path, { method: 'POST', body: JSON.stringify(body) });
  }
  put<T>(path: string, body?: unknown) {
    return this.request<T>(path, { method: 'PUT', body: JSON.stringify(body) });
  }
  delete<T>(path: string) { return this.request<T>(path, { method: 'DELETE' }); }
}

export const apiClient = new ApiClient();
```

### 8.2 Environment Variables

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=...
NEXT_PUBLIC_FACEBOOK_APP_ID=...
```

### 8.3 API Endpoints Reference

| Domain | Method | Path | Description |
|---|---|---|---|
| **Auth** | POST | `/auth/login` | Email/password login |
| | POST | `/auth/register` | Register new account |
| | POST | `/auth/logout` | Invalidate token |
| | POST | `/auth/refresh` | Refresh access token |
| | POST | `/auth/forgot-password` | Request reset email |
| | POST | `/auth/reset-password` | Submit new password |
| | GET | `/auth/oauth/:provider` | OAuth redirect |
| **Users** | GET | `/users/:username` | User profile |
| | PUT | `/users/me` | Update profile |
| | POST | `/users/me/avatar` | Upload avatar |
| **Manga** | GET | `/manga` | List with filters |
| | GET | `/manga/:slug` | Detail |
| | POST | `/manga` | Create (group admin+) |
| | PUT | `/manga/:id` | Update |
| **Novel** | GET | `/novels` | List with filters |
| | GET | `/novels/:slug` | Detail |
| **Chapters** | GET | `/manga/:id/chapters` | List chapters |
| | GET | `/chapters/:id` | Chapter content (pages) |
| | POST | `/manga/:id/chapters` | Upload chapter |
| | PUT | `/chapters/:id` | Edit chapter |
| | DELETE | `/chapters/:id` | Delete chapter |
| **Library** | GET | `/library` | User's followed titles |
| | POST | `/library/:mangaId` | Follow |
| | DELETE | `/library/:mangaId` | Unfollow |
| **Comments** | GET | `/comments?contentId=&page=` | List comments |
| | POST | `/comments` | Post comment |
| | PUT | `/comments/:id` | Edit comment |
| | DELETE | `/comments/:id` | Delete comment |
| | POST | `/comments/:id/like` | Toggle like |
| | GET | `/comments/:id/replies` | Load replies |
| **Ratings** | POST | `/ratings` | Submit rating |
| | DELETE | `/ratings/:contentId` | Remove rating |
| **Groups** | GET | `/groups` | User's groups |
| | POST | `/groups` | Create group |
| | GET | `/groups/:id` | Group detail |
| | PUT | `/groups/:id` | Update group |
| | DELETE | `/groups/:id` | Delete group |
| | POST | `/groups/:id/members` | Invite member |
| | DELETE | `/groups/:id/members/:userId` | Remove member |
| **Notifications** | GET | `/notifications` | List |
| | POST | `/notifications/read-all` | Mark all read |
| | POST | `/notifications/:id/read` | Mark one read |

### 8.4 Error Handling Strategy

```typescript
// Global error handler using TanStack Query
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Something went wrong');
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Action failed');
    },
  }),
});
```

- **Network errors:** Toast notification + retry button on relevant components
- **401 Unauthorized:** Auto-logout + redirect to `/login?redirect=current_path`
- **403 Forbidden:** Toast "You don't have permission to do this"
- **404 Not Found:** Next.js `notFound()` for page-level, inline empty state for lists
- **500 Server Error:** Error boundary page with "Try again" button

---

## 9. New File Map

Complete list of files to create (all follow kebab-case naming convention):

```
src/
├── app/
│   ├── (auth)/login/page.tsx
│   ├── (auth)/register/page.tsx
│   ├── (auth)/forgot-password/page.tsx
│   ├── (auth)/reset-password/page.tsx
│   ├── (main)/layout.tsx
│   ├── (main)/search/page.tsx
│   ├── (main)/browse/page.tsx
│   ├── (main)/library/page.tsx
│   ├── (main)/manga/[slug]/page.tsx
│   ├── (main)/novel/[slug]/page.tsx
│   ├── (main)/profile/[username]/page.tsx
│   ├── (main)/settings/page.tsx
│   ├── (main)/notifications/page.tsx
│   ├── (main)/dashboard/page.tsx
│   ├── (main)/dashboard/groups/[groupId]/page.tsx
│   ├── (main)/dashboard/upload/title/page.tsx
│   ├── (main)/dashboard/upload/chapter/[titleId]/page.tsx
│   ├── manga/[slug]/chapter/[chapterId]/page.tsx
│   └── novel/[slug]/chapter/[chapterId]/page.tsx
│
├── components/
│   ├── ui/badge.tsx
│   ├── ui/avatar.tsx
│   ├── ui/modal.tsx
│   ├── ui/bottom-sheet.tsx
│   ├── ui/tabs.tsx
│   ├── ui/skeleton.tsx
│   ├── ui/toast.tsx
│   ├── ui/star-rating.tsx
│   ├── ui/progress-bar.tsx
│   ├── ui/slider.tsx
│   ├── ui/dropdown.tsx
│   ├── layout/bottom-nav.tsx
│   ├── layout/sidebar.tsx
│   ├── auth/login-form.tsx
│   ├── auth/register-form.tsx
│   ├── auth/oauth-buttons.tsx
│   ├── auth/login-prompt-modal.tsx
│   ├── content/manga-card.tsx
│   ├── content/manga-grid.tsx
│   ├── content/chapter-list.tsx
│   ├── content/chapter-row.tsx
│   ├── content/filter-panel.tsx
│   ├── content/search-bar.tsx
│   ├── content/genre-chips.tsx
│   ├── content/library-controls.tsx
│   ├── detail/title-header.tsx
│   ├── detail/synopsis.tsx
│   ├── detail/action-buttons.tsx
│   ├── detail/rating-modal.tsx
│   ├── detail/content-tabs.tsx
│   ├── comments/comment-thread.tsx
│   ├── comments/comment-card.tsx
│   ├── comments/comment-form.tsx
│   ├── comments/spoiler-tag.tsx
│   ├── readers/novel/novel-reader.tsx
│   ├── readers/novel/novel-toolbar.tsx
│   ├── readers/novel/novel-settings-panel.tsx
│   ├── readers/novel/chapter-content.tsx
│   ├── readers/manga/manga-viewer.tsx
│   ├── readers/manga/manga-toolbar.tsx
│   ├── readers/manga/manga-settings-panel.tsx
│   ├── readers/manga/vertical-scroll-mode.tsx
│   ├── readers/manga/single-page-mode.tsx
│   ├── readers/manga/double-page-mode.tsx
│   ├── readers/manga/manga-page-image.tsx
│   ├── notifications/notification-bell.tsx
│   ├── notifications/notification-panel.tsx
│   ├── profile/avatar-crop-modal.tsx
│   ├── profile/user-stats.tsx
│   ├── dashboard/group-card.tsx
│   ├── dashboard/member-table.tsx
│   ├── dashboard/upload-title-form.tsx
│   ├── dashboard/upload-chapter-form.tsx
│   └── shared/permission-gate.tsx
│
├── hooks/
│   ├── use-permission.ts
│   ├── use-keyboard-shortcuts.ts
│   ├── use-scroll-progress.ts
│   ├── use-intersection-observer.ts
│   ├── use-image-preloader.ts
│   ├── use-notification-poller.ts
│   └── use-debounce.ts
│
├── stores/
│   ├── use-auth-store.ts
│   ├── use-theme-store.ts
│   ├── use-reading-progress-store.ts
│   ├── use-novel-reader-store.ts
│   ├── use-manga-viewer-store.ts
│   ├── use-library-store.ts
│   └── use-notification-store.ts
│
├── lib/
│   ├── api-client.ts
│   ├── permissions.ts
│   └── query-keys.ts
│
├── providers/
│   └── theme-provider.tsx  (update app-providers.tsx to include it)
│
├── middleware.ts
└── types/index.ts           (extend existing with Comment, CommentPage, etc.)
```

---

*For product requirements, user flows, and UX specifications, see [docs/PRD-MangaReader-MVP](./PRD-MangaReader-MVP.md).*
