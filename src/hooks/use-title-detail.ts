'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { Manga, ChapterSummary, FollowStatusResponse, FollowStatus, PaginatedResponse } from '@/types';

interface RawComicRating {
  id: string;
  score: number;
  createdAt: string;
  updatedAt: string;
}

interface CompactComicRating {
  rating: number;
}

interface AverageComicRating {
  average: number;
  count: number;
}

interface UserComicRating {
  score: number;
}

function isRawComicRating(value: unknown): value is RawComicRating {
  if (typeof value !== 'object' || value === null) return false;

  const candidate = value as Partial<RawComicRating>;
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.score === 'number' &&
    Number.isFinite(candidate.score) &&
    typeof candidate.createdAt === 'string' &&
    typeof candidate.updatedAt === 'string'
  );
}

function isPaginatedRatingResponse(
  value: unknown
): value is PaginatedResponse<RawComicRating> {
  if (typeof value !== 'object' || value === null) return false;

  const candidate = value as Partial<PaginatedResponse<RawComicRating>>;
  return Array.isArray(candidate.data);
}

function isCompactComicRating(value: unknown): value is CompactComicRating {
  if (typeof value !== 'object' || value === null) return false;

  const candidate = value as Partial<CompactComicRating>;
  return typeof candidate.rating === 'number' && Number.isFinite(candidate.rating);
}

function isAverageComicRating(value: unknown): value is AverageComicRating {
  if (typeof value !== 'object' || value === null) return false;

  const candidate = value as Partial<AverageComicRating>;
  return (
    typeof candidate.average === 'number' &&
    Number.isFinite(candidate.average) &&
    typeof candidate.count === 'number' &&
    Number.isFinite(candidate.count)
  );
}

function normalizeRatingScore(score: number): number {
  return Math.max(1, Math.min(5, Math.round(score)));
}

function normalizeAverageRatingSummary(value: AverageComicRating): AverageComicRating {
  return {
    average: Math.max(0, Math.min(5, value.average)),
    count: Math.max(0, Math.round(value.count)),
  };
}

function extractUserRatingScore(value: unknown): number | null {
  if (isRawComicRating(value)) return normalizeRatingScore(value.score);
  if (isCompactComicRating(value)) return normalizeRatingScore(value.rating);
  if (Array.isArray(value)) {
    const rating = value.find(isRawComicRating);
    return rating ? normalizeRatingScore(rating.score) : null;
  }
  if (isPaginatedRatingResponse(value)) {
    const rating = value.data.find(isRawComicRating);
    return rating ? normalizeRatingScore(rating.score) : null;
  }
  return null;
}

// ─── Detail ───────────────────────────────────────────────────────────────────

export function useMangaDetail(slug: string) {
  return useQuery<Manga>({
    queryKey: queryKeys.manga.detail(slug),
    queryFn: () => apiClient.get<Manga>(`/comics/${slug}`),
    enabled: Boolean(slug),
  });
}

export function useChapterList(comicSlug: string) {
  return useQuery<PaginatedResponse<ChapterSummary>>({
    queryKey: queryKeys.manga.chapters(comicSlug),
    queryFn: () =>
      apiClient.get<PaginatedResponse<ChapterSummary>>(`/comics/${comicSlug}/chapters`, {
        params: { limit: '500' },
      }),
    enabled: Boolean(comicSlug),
  });
}

// ─── Follow ───────────────────────────────────────────────────────────────────

export function useFollowStatus(comicSlug: string) {
  return useQuery<FollowStatusResponse>({
    queryKey: queryKeys.follow.status(comicSlug),
    queryFn: async () => {
      const data = await apiClient.getComicFollowStatus(comicSlug);
      return {
        mangaId: comicSlug,
        isFollowed: data.isFollowed,
        followStatus: data.followStatus,
      };
    },
    enabled: Boolean(comicSlug),
  });
}

export function useFollow(comicSlug: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (isFollowed: boolean) =>
      isFollowed
        ? apiClient.unfollowComic(comicSlug)
        : apiClient.followComic(comicSlug, 'reading'),

    onMutate: async (isFollowed) => {
      await qc.cancelQueries({ queryKey: queryKeys.follow.status(comicSlug) });
      const prev = qc.getQueryData<FollowStatusResponse>(queryKeys.follow.status(comicSlug));
      qc.setQueryData<FollowStatusResponse>(queryKeys.follow.status(comicSlug), {
        mangaId: comicSlug,
        isFollowed: !isFollowed,
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKeys.follow.status(comicSlug), ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.follow.status(comicSlug) });
      qc.invalidateQueries({ queryKey: queryKeys.library.all() });
    },
  });
}

export function useChangeFollowStatus(comicSlug: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (status: FollowStatus) => apiClient.updateFollowStatus(comicSlug, status),
    onMutate: async (status) => {
      await qc.cancelQueries({ queryKey: queryKeys.follow.status(comicSlug) });
      const prev = qc.getQueryData<FollowStatusResponse>(queryKeys.follow.status(comicSlug));
      qc.setQueryData<FollowStatusResponse>(queryKeys.follow.status(comicSlug), {
        mangaId: comicSlug,
        isFollowed: true,
        followStatus: status,
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKeys.follow.status(comicSlug), ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.follow.status(comicSlug) });
    },
  });
}

// ─── Rating ───────────────────────────────────────────────────────────────────

export function useUserRating(mangaId: string) {
  return useQuery<UserComicRating | null>({
    queryKey: queryKeys.rating.user(mangaId),
    queryFn: async () => {
      try {
        const response = await apiClient.get<
          RawComicRating | RawComicRating[] | PaginatedResponse<RawComicRating> | CompactComicRating | null
        >(`/ratings/comics/${mangaId}`);
        const score = extractUserRatingScore(response);

        if (score === null) return null;
        return {
          score,
        };
      } catch {
        return null;
      }
    },
    enabled: Boolean(mangaId),
    retry: false,
  });
}

export function useAverageRating(mangaId: string) {
  return useQuery<AverageComicRating | null>({
    queryKey: queryKeys.rating.average(mangaId),
    queryFn: async () => {
      try {
        const response = await apiClient.get<AverageComicRating | null>(
          `/ratings/comics/${mangaId}/average`
        );

        if (!isAverageComicRating(response)) return null;
        return normalizeAverageRatingSummary(response);
      } catch {
        return null;
      }
    },
    enabled: Boolean(mangaId),
    retry: false,
  });
}

export function useSubmitRating(mangaId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (score: number) =>
      apiClient.post<RawComicRating | CompactComicRating>(
        `/ratings/comics/${mangaId}`,
        { score }
      ),

    onSuccess: (rating) => {
      const score = extractUserRatingScore(rating);
      if (score === null) return;

      qc.setQueryData<UserComicRating>(queryKeys.rating.user(mangaId), { score });
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.rating.user(mangaId) });
      qc.invalidateQueries({ queryKey: queryKeys.rating.average(mangaId) });
      qc.invalidateQueries({ queryKey: queryKeys.manga.detail(mangaId) });
    },
  });
}
