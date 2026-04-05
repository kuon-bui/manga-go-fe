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
  follow: {
    status: (mangaId: string) => ['follow', mangaId] as const,
  },
  rating: {
    user: (mangaId: string) => ['rating', 'user', mangaId] as const,
  },
  comments: {
    list: (mangaId: string) => ['comments', mangaId] as const,
  },
  home: {
    trending: () => ['home', 'trending'] as const,
    recentlyUpdated: () => ['home', 'recently-updated'] as const,
    genres: () => ['home', 'genres'] as const,
  },
  genres: {
    all: () => ['genres'] as const,
  },
  dashboard: {
    titles: () => ['dashboard', 'titles'] as const,
    groups: () => ['dashboard', 'groups'] as const,
    group: (groupId: string) => ['dashboard', 'group', groupId] as const,
    groupMembers: (groupId: string) => ['dashboard', 'group', groupId, 'members'] as const,
  },
  browse: {
    results: (filters: Record<string, unknown>) =>
      ['browse', filters] as const,
  },
} as const;
