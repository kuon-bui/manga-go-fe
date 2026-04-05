'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiClient } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import type { Manga, ChapterSummary, FollowStatus, UserRating, PaginatedResponse } from '@/types'

// ─── Detail ───────────────────────────────────────────────────────────────────

export function useMangaDetail(id: string) {
  return useQuery<Manga>({
    queryKey: queryKeys.manga.detail(id),
    queryFn: () => apiClient.get<Manga>(`/manga/${id}`),
    enabled: Boolean(id),
  })
}

export function useChapterList(mangaId: string) {
  return useQuery<PaginatedResponse<ChapterSummary>>({
    queryKey: queryKeys.manga.chapters(mangaId),
    queryFn: () =>
      apiClient.get<PaginatedResponse<ChapterSummary>>(`/manga/${mangaId}/chapters`, {
        params: { pageSize: '500' },
      }),
    enabled: Boolean(mangaId),
  })
}

// ─── Follow ───────────────────────────────────────────────────────────────────

export function useFollowStatus(mangaId: string) {
  return useQuery<FollowStatus>({
    queryKey: queryKeys.follow.status(mangaId),
    queryFn: () => apiClient.get<FollowStatus>(`/library/${mangaId}/follow-status`),
    enabled: Boolean(mangaId),
  })
}

export function useFollow(mangaId: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (isFollowing: boolean) =>
      isFollowing
        ? apiClient.delete(`/library/${mangaId}/follow`)
        : apiClient.post(`/library/${mangaId}/follow`),

    onMutate: async (isFollowing) => {
      await qc.cancelQueries({ queryKey: queryKeys.follow.status(mangaId) })
      const prev = qc.getQueryData<FollowStatus>(queryKeys.follow.status(mangaId))
      qc.setQueryData<FollowStatus>(queryKeys.follow.status(mangaId), {
        mangaId,
        isFollowing: !isFollowing,
      })
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(queryKeys.follow.status(mangaId), ctx.prev)
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.follow.status(mangaId) })
      qc.invalidateQueries({ queryKey: queryKeys.library.all() })
    },
  })
}

// ─── Rating ───────────────────────────────────────────────────────────────────

export function useUserRating(mangaId: string) {
  return useQuery<UserRating | null>({
    queryKey: queryKeys.rating.user(mangaId),
    queryFn: () => apiClient.get<UserRating | null>(`/manga/${mangaId}/my-rating`),
    enabled: Boolean(mangaId),
  })
}

export function useSubmitRating(mangaId: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (score: number) =>
      apiClient.post<UserRating>(`/manga/${mangaId}/rate`, { score }),

    onMutate: async (score) => {
      await qc.cancelQueries({ queryKey: queryKeys.rating.user(mangaId) })
      const prev = qc.getQueryData<UserRating | null>(queryKeys.rating.user(mangaId))
      qc.setQueryData<UserRating>(queryKeys.rating.user(mangaId), {
        mangaId,
        score,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      qc.setQueryData(queryKeys.rating.user(mangaId), ctx?.prev ?? null)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.rating.user(mangaId) })
      qc.invalidateQueries({ queryKey: queryKeys.manga.detail(mangaId) })
    },
  })
}
