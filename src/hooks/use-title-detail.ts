'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiClient } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import type { Manga, ChapterSummary, FollowStatusResponse, FollowStatus, UserRating, PaginatedResponse } from '@/types'

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
  return useQuery<FollowStatusResponse>({
    queryKey: queryKeys.follow.status(comicSlug),
    queryFn: async () => {
      const data = await apiClient.getComicFollowStatus(comicSlug)
      return {
        mangaId: comicSlug,
        isFollowed: data.isFollowed,
        followStatus: data.followStatus,
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
        : apiClient.followComic(comicSlug, 'reading'),

    onMutate: async (isFollowed) => {
      await qc.cancelQueries({ queryKey: queryKeys.follow.status(comicSlug) })
      const prev = qc.getQueryData<FollowStatusResponse>(queryKeys.follow.status(comicSlug))
      qc.setQueryData<FollowStatusResponse>(queryKeys.follow.status(comicSlug), {
        mangaId: comicSlug,
        isFollowed: !isFollowed,
      })
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKeys.follow.status(comicSlug), ctx.prev)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.follow.status(comicSlug) })
      qc.invalidateQueries({ queryKey: queryKeys.library.all() })
    },
  })
}

export function useChangeFollowStatus(comicSlug: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (status: FollowStatus) => apiClient.updateFollowStatus(comicSlug, status),
    onMutate: async (status) => {
      await qc.cancelQueries({ queryKey: queryKeys.follow.status(comicSlug) })
      const prev = qc.getQueryData<FollowStatusResponse>(queryKeys.follow.status(comicSlug))
      qc.setQueryData<FollowStatusResponse>(queryKeys.follow.status(comicSlug), {
        mangaId: comicSlug,
        isFollowed: true,
        followStatus: status,
      })
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKeys.follow.status(comicSlug), ctx.prev)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.follow.status(comicSlug) })
    },
  })
}

// ─── Rating ───────────────────────────────────────────────────────────────────

export function useUserRating(mangaId: string) {
  return useQuery<UserRating | null>({
    queryKey: queryKeys.rating.user(mangaId),
    queryFn: async () => {
      try {
        const rating = await apiClient.get<{
          id: string
          score: number
          comicId: string
          createdAt: string
          updatedAt: string
        } | null>(`/ratings/comics/${mangaId}`)

        if (!rating) return null
        return {
          mangaId,
          score: rating.score, // 1–5
          createdAt: rating.createdAt,
          updatedAt: rating.updatedAt,
        }
      } catch {
        return null
      }
    },
    enabled: Boolean(mangaId),
    retry: false,
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
