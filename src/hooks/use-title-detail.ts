'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiClient } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import type { Manga, ChapterSummary, FollowStatus, UserRating, PaginatedResponse } from '@/types'

// ─── Detail ───────────────────────────────────────────────────────────────────

export function useMangaDetail(slug: string) {
  return useQuery<Manga>({
    queryKey: queryKeys.manga.detail(slug),
    queryFn: () => apiClient.get<Manga>(`/comics/${slug}`),
    enabled: Boolean(slug),
  })
}

export function useChapterList(comicSlug: string) {
  return useQuery<PaginatedResponse<ChapterSummary>>({
    queryKey: queryKeys.manga.chapters(comicSlug),
    queryFn: () =>
      apiClient.get<PaginatedResponse<ChapterSummary>>(`/comics/${comicSlug}/chapters`, {
        params: { limit: '500' },
      }),
    enabled: Boolean(comicSlug),
  })
}

// ─── Follow ───────────────────────────────────────────────────────────────────

export function useFollowStatus(comicSlug: string) {
  return useQuery<FollowStatus>({
    queryKey: queryKeys.follow.status(comicSlug),
    queryFn: async () => {
      const data = await apiClient.getComicFollowStatus(comicSlug)
      return {
        mangaId: comicSlug,
        isFollowed: data.isFollowed,
      }
    },
    enabled: Boolean(comicSlug),
  })
}

export function useFollow(comicSlug: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (isFollowed: boolean) =>
      isFollowed
        ? apiClient.unfollowComic(comicSlug)
        : apiClient.followComic(comicSlug),

    onMutate: async (isFollowed) => {
      await qc.cancelQueries({ queryKey: queryKeys.follow.status(comicSlug) })
      const prev = qc.getQueryData<FollowStatus>(queryKeys.follow.status(comicSlug))
      qc.setQueryData<FollowStatus>(queryKeys.follow.status(comicSlug), {
        mangaId: comicSlug,
        isFollowed: !isFollowed,
      })
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(queryKeys.follow.status(comicSlug), ctx.prev)
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.follow.status(comicSlug) })
      qc.invalidateQueries({ queryKey: queryKeys.library.all() })
    },
  })
}

// ─── Rating ───────────────────────────────────────────────────────────────────
// No real API for rating yet — these remain backed by mock handlers.

export function useUserRating(mangaId: string) {
  return useQuery<UserRating | null>({
    queryKey: queryKeys.rating.user(mangaId),
    queryFn: async () => {
      const ratings = await apiClient.get<PaginatedResponse<{
        id: string
        score: number
        comicId: string
        createdAt: string
        updatedAt: string
      }>>(`/ratings/comics/${mangaId}`, {
        params: { page: '1', limit: '10' },
      })

      const first = ratings.data[0]
      if (!first) return null

      return {
        mangaId,
        score: first.score,
        createdAt: first.createdAt,
        updatedAt: first.updatedAt,
      }
    },
    enabled: Boolean(mangaId),
  })
}

export function useSubmitRating(mangaId: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (score: number) =>
      apiClient.post<{ id: string; score: number; createdAt: string; updatedAt: string }>(
        `/ratings/comics/${mangaId}`,
        { score }
      ),

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
