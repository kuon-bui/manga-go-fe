// Centralized TanStack Query key factory.
// All keys are tuples so they can be partially invalidated.

export const queryKeys = {
  auth: {
    me: () => ['auth', 'me'] as const,
  },
  manga: {
    all: () => ['manga'] as const,
    list: (filters: Record<string, unknown>) => ['manga', 'list', filters] as const,
    detail: (slug: string) => ['manga', 'detail', slug] as const,
    chapters: (comicSlug: string) => ['manga', comicSlug, 'chapters'] as const,
  },
  chapter: {
    detail: (comicSlug: string, chapterSlug: string) =>
      ['chapter', 'detail', comicSlug, chapterSlug] as const,
  },
  library: {
    all: () => ['library'] as const,
    entry: (mangaId: string) => ['library', mangaId] as const,
  },
  readingHistory: {
    all: () => ['reading-history'] as const,
    list: (params?: Record<string, string>) => ['reading-history', 'list', params] as const,
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
    average: (mangaId: string) => ['rating', 'average', mangaId] as const,
  },
  comments: {
    list: (chapterId: string) => ['comments', chapterId] as const,
  },
  home: {
    trending: () => ['home', 'trending'] as const,
    recentlyUpdated: () => ['home', 'recently-updated'] as const,
    latestUpdates: () => ['home', 'latest-updates'] as const,
    recentlyAdded: () => ['home', 'recently-added'] as const,
    completed: () => ['home', 'completed'] as const,
    genres: () => ['home', 'genres'] as const,
  },
  genres: {
    all: () => ['genres'] as const,
  },
  authors: {
    all: () => ['authors', 'all'] as const,
  },
  tags: {
    all: () => ['tags', 'all'] as const,
  },
  dashboard: {
    titles: () => ['dashboard', 'titles'] as const,
    groups: () => ['dashboard', 'groups'] as const,
    group: (slug: string) => ['dashboard', 'group', slug] as const,
    groupMembers: (slug: string) => ['dashboard', 'group', slug, 'members'] as const,
  },
  browse: {
    results: (filters: Record<string, unknown>) => ['browse', filters] as const,
  },
  authorization: {
    all: () => ['authorization'] as const,
    me: () => ['authorization', 'me'] as const,
    users: (filters: Record<string, unknown>) => ['authorization', 'users', filters] as const,
    user: (userId: string) => ['authorization', 'users', userId] as const,
    roles: () => ['authorization', 'roles'] as const,
    role: (roleId: string) => ['authorization', 'roles', roleId] as const,
    catalog: () => ['authorization', 'catalog'] as const,
    audit: (filters: Record<string, unknown>) => ['authorization', 'audit', filters] as const,
  },
} as const;
