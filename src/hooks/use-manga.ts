'use client'

import { useQuery } from '@tanstack/react-query'

import { apiClient } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import type { Manga, Genre, PaginatedResponse, SearchFilters, BrowseFilters } from '@/types'

// ─── Home ─────────────────────────────────────────────────────────────────────

export function useTrending() {
  return useQuery<PaginatedResponse<Manga>>({
    queryKey: queryKeys.home.trending(),
    queryFn: () => apiClient.get<PaginatedResponse<Manga>>('/comics', { params: { limit: '10' } }),
    staleTime: 5 * 60 * 1000, // 5 min
  })
}

export function useRecentlyUpdated() {
  return useQuery<PaginatedResponse<Manga>>({
    queryKey: queryKeys.home.recentlyUpdated(),
    queryFn: () =>
      apiClient.get<PaginatedResponse<Manga>>('/comics', {
        params: { page: '1', limit: '20' },
      }),
    staleTime: 2 * 60 * 1000, // 2 min
  })
}

export function useGenres() {
  return useQuery<Genre[]>({
    queryKey: queryKeys.genres.all(),
    queryFn: () => apiClient.get<Genre[]>('/genres/all'),
    staleTime: 60 * 60 * 1000, // 1 hour — genres rarely change
  })
}

// ─── Search ───────────────────────────────────────────────────────────────────

export function useSearch(filters: SearchFilters) {
  const params = buildParams(filters as unknown as Record<string, unknown>)
  return useQuery<PaginatedResponse<Manga>>({
    queryKey: queryKeys.search.results(filters.query ?? '', filters as unknown as Record<string, unknown>),
    queryFn: () => apiClient.get<PaginatedResponse<Manga>>('/comics', { params }),
    enabled: Object.keys(filters).length > 0,
  })
}

// ─── Browse ───────────────────────────────────────────────────────────────────

export function useBrowse(filters: BrowseFilters) {
  const params = buildParams(filters as unknown as Record<string, unknown>)
  return useQuery<PaginatedResponse<Manga>>({
    queryKey: queryKeys.browse.results(filters as unknown as Record<string, unknown>),
    queryFn: () => apiClient.get<PaginatedResponse<Manga>>('/comics', { params }),
  })
}

// ─── Detail ───────────────────────────────────────────────────────────────────

export function useManga(slug: string) {
  return useQuery<Manga>({
    queryKey: queryKeys.manga.detail(slug),
    queryFn: () => apiClient.get<Manga>(`/comics/${slug}`),
    enabled: Boolean(slug),
  })
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildParams(obj: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue
    if (Array.isArray(v)) {
      if (v.length > 0) out[k] = v.join(',')
    } else {
      out[k] = String(v)
    }
  }
  return out
}
