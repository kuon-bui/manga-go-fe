// Centralized TanStack Query key factory.
// All keys are tuples so they can be partially invalidated.

export const queryKeys = {
  auth: {
    me: () => ['auth', 'me'] as const,
  },
  manga: {
    all: () => ['manga'] as const,
    list: (filters: Record<string, unknown>) => ['manga', 'list', filters] as const,
    detail: (id: string) => ['manga', 'detail', id] as const,
    chapters: (mangaId: string) => ['manga', mangaId, 'chapters'] as const,
  },
  chapter: {
    detail: (id: string) => ['chapter', 'detail', id] as const,
  },
  comments: {
    list: (mangaId: string) => ['comments', mangaId] as const,
  },
  library: {
    all: () => ['library'] as const,
    entry: (mangaId: string) => ['library', mangaId] as const,
  },
  notifications: {
    all: () => ['notifications'] as const,
    unreadCount: () => ['notifications', 'unreadCount'] as const,
  },
  search: {
    results: (query: string, filters: Record<string, unknown>) =>
      ['search', query, filters] as const,
  },
} as const;
