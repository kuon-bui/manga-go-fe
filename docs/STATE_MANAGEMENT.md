# State Management — Manga Go

## Architecture Overview

| Layer | Tool | Location |
|---|---|---|
| Server/API data | TanStack Query | `src/hooks/` |
| Client UI state | Zustand 5 | `src/stores/` |
| URL/routing state | Next.js `useSearchParams` | Page components |
| Form state | React controlled state | Component-local |

**Rule:** Never use `useEffect` + `fetch` for API calls. Always use TanStack Query hooks.

---

## TanStack Query — Server Data

### Query Key Convention
All query keys live in `src/lib/query-keys.ts`:

```ts
export const queryKeys = {
  manga: {
    trending: () => ['manga', 'trending'] as const,
    recentlyUpdated: (page?: number) => ['manga', 'recently-updated', page] as const,
    detail: (slug: string) => ['manga', 'detail', slug] as const,
    chapters: (slug: string) => ['manga', 'chapters', slug] as const,
  },
  search: {
    results: (filters: SearchFilters) => ['search', filters] as const,
  },
  genres: {
    list: () => ['genres'] as const,
  },
  library: {
    list: (userId: string) => ['library', userId] as const,
  },
  notifications: {
    list: (userId: string) => ['notifications', userId] as const,
  },
}
```

### Hook Pattern
```ts
// src/hooks/use-manga.ts
export function useTrending() {
  return useQuery({
    queryKey: queryKeys.manga.trending(),
    queryFn: () => api.getTrending(),
    staleTime: 5 * 60 * 1000,   // 5 min — trending changes slowly
  })
}

export function useRecentlyUpdated() {
  return useQuery({
    queryKey: queryKeys.manga.recentlyUpdated(),
    queryFn: () => api.getRecentlyUpdated(),
    staleTime: 60 * 1000,        // 1 min — recently updated changes fast
  })
}
```

### Mutation Pattern (Optimistic Updates)
```ts
// Follow/unfollow with optimistic update
export function useFollowManga(mangaId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (follow: boolean) => api.setFollow(mangaId, follow),
    onMutate: async (follow) => {
      await qc.cancelQueries({ queryKey: queryKeys.manga.detail(mangaId) })
      const prev = qc.getQueryData(queryKeys.manga.detail(mangaId))
      qc.setQueryData(queryKeys.manga.detail(mangaId), (old: Manga) => ({
        ...old,
        isFollowing: follow,
      }))
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      qc.setQueryData(queryKeys.manga.detail(mangaId), ctx?.prev)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.manga.detail(mangaId) })
    },
  })
}
```

---

## Zustand — Client UI State

### Store Pattern (Zustand 5)
```ts
// src/stores/example-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ExampleState {
  value: string
  setValue: (v: string) => void
}

export const useExampleStore = create<ExampleState>()(
  persist(
    (set) => ({
      value: 'default',
      setValue: (v) => set({ value: v }),
    }),
    { name: 'example-store' }
  )
)
```

### Existing Stores

| Store | File | Purpose |
|---|---|---|
| `useAuthStore` | `src/stores/auth-store.ts` | Authenticated user, token |
| `useMangaViewerStore` | `src/stores/manga-viewer-store.ts` | Reader mode, current page |
| `useNovelReaderStore` | `src/stores/novel-reader-store.ts` | Novel reader settings |
| `useThemeStore` | (via next-themes) | light/dark/system |

### Rules
- Use `persist` middleware only for settings that should survive page reload
- Reader state (currentPage) should NOT be persisted — reset on mount
- Auth store IS persisted (user stays logged in)
- Never import Zustand stores in Server Components

---

## URL State — Search & Browse

Search filters and browse filters live in URL query params via `useSearchParams()`:

```tsx
// Always wrap useSearchParams in Suspense
<Suspense fallback={<SearchSkeleton />}>
  <SearchView />
</Suspense>

// Inside SearchView:
const searchParams = useSearchParams()
const query = searchParams.get('q') ?? ''
const genre = searchParams.get('genre') ?? ''
```

**Updating URL state:**
```tsx
const router = useRouter()
const pathname = usePathname()

function applyFilter(key: string, value: string) {
  const params = new URLSearchParams(searchParams.toString())
  if (value) params.set(key, value)
  else params.delete(key)
  router.push(`${pathname}?${params.toString()}`)
}
```

---

## What Belongs Where

| Data | Correct tool |
|---|---|
| Manga list from API | TanStack Query |
| Current reading page number | Zustand (viewer store) |
| Reader mode (vertical/single/double) | Zustand (viewer store, persisted) |
| Search text input value | React `useState` |
| Active filters in URL | `useSearchParams` |
| User's library | TanStack Query |
| Notification count | TanStack Query (polled) |
| Dark/light theme | next-themes + Zustand |
| Form field values | React `useState` |
| Auth token | Zustand (persisted) |
