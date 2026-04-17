'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { CreateComicPayload, CreateChapterPayload } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import type { User } from '@/types/auth'
import type {
  Group,
  DashboardTitle,
  PaginatedResponse,
  Author,
  Tag,
  Manga,
} from '@/types'

type CurrentUserProfile = User

type GroupWithOwner = Group & {
  ownerId?: string
}

function resolveCurrentGroup(groups: GroupWithOwner[], me: CurrentUserProfile | null | undefined): GroupWithOwner | null {
  if (!me) return null

  if (me.translationGroup?.slug) {
    return groups.find((g) => g.slug === me.translationGroup?.slug) ?? null
  }

  if (me.translationGroupId) {
    return groups.find((g) => g.id === me.translationGroupId) ?? null
  }

  return groups.find((g) => g.ownerId === me.id) ?? null
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Convert a title string to a URL-friendly slug */
export function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

// ─── Authors ─────────────────────────────────────────────────────────────────

export function useAllAuthors() {
  return useQuery<Author[]>({
    queryKey: queryKeys.authors.all(),
    queryFn: () => apiClient.getAllAuthors(),
    staleTime: 10 * 60 * 1000,
  })
}

export function useCreateAuthor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (name: string) => apiClient.createAuthor(name),
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.authors.all() }),
  })
}

// ─── Tags ─────────────────────────────────────────────────────────────────────

export function useAllTags() {
  return useQuery<Tag[]>({
    queryKey: queryKeys.tags.all(),
    queryFn: () => apiClient.getAllTags(),
    staleTime: 10 * 60 * 1000,
  })
}

export function useCreateTag() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ name, slug }: { name: string; slug: string }) =>
      apiClient.createTag(name, slug),
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.tags.all() }),
  })
}

// ─── Translation Groups ───────────────────────────────────────────────────────

export function useCurrentUserProfile() {
  return useQuery<CurrentUserProfile | null>({
    queryKey: queryKeys.auth.me(),
    queryFn: async () => {
      const res = await apiClient.getCurrentUserProfile()
      return res.user
    },
    staleTime: 5 * 60 * 1000,
  })
}

export function useMyGroups() {
  const { data: me, isLoading: meLoading } = useCurrentUserProfile()

  return useQuery<PaginatedResponse<Group>>({
    queryKey: [...queryKeys.dashboard.groups(), me?.translationGroupId ?? me?.translationGroup?.slug ?? 'none'],
    queryFn: async () => {
      const groups = await apiClient.getTranslationGroups({ page: '1', limit: '200' })
      const currentGroup = resolveCurrentGroup(groups.data as GroupWithOwner[], me)

      if (!currentGroup) {
        return {
          data: [],
          total: 0,
          page: 1,
          pageSize: 0,
          hasMore: false,
        }
      }

      return {
        data: [currentGroup],
        total: 1,
        page: 1,
        pageSize: 1,
        hasMore: false,
      }
    },
    enabled: !meLoading,
  })
}

export function useCreateGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ name, slug }: { name: string; slug: string }) =>
      apiClient.createTranslationGroup(name, slug),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.auth.me() })
      qc.invalidateQueries({ queryKey: queryKeys.dashboard.groups() })
      qc.invalidateQueries({ queryKey: queryKeys.dashboard.titles() })
    },
  })
}

export function useDeleteGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (slug: string) => apiClient.deleteTranslationGroup(slug),
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.dashboard.groups() }),
  })
}

// ─── Titles ───────────────────────────────────────────────────────────────────

export function useMyTitles() {
  const { data: me, isLoading: meLoading } = useCurrentUserProfile()

  return useQuery<PaginatedResponse<DashboardTitle>>({
    queryKey: [...queryKeys.dashboard.titles(), me?.translationGroupId ?? me?.translationGroup?.slug ?? 'none'],
    queryFn: async () => {
      const groups = await apiClient.getTranslationGroups({ page: '1', limit: '200' })
      const currentGroup = resolveCurrentGroup(groups.data as GroupWithOwner[], me)

      if (!currentGroup?.slug) {
        return {
          data: [],
          total: 0,
          page: 1,
          pageSize: 0,
          hasMore: false,
        }
      }

      const comics = await apiClient.getComics({
        page: '1',
        limit: '100',
        translationGroupSlug: currentGroup.slug,
      })

      return {
        ...comics,
        data: comics.data.map((comic: Manga) => ({
          id: comic.id,
          slug: comic.slug,
          title: comic.title,
          coverUrl: comic.thumbnail ?? '',
          type: comic.type,
          status: comic.status,
          chapterCount: comic.chapters?.length ?? comic.chapterCount ?? 0,
          lastUploadedAt: comic.lastChapterAt,
          groups: comic.translationGroup
            ? [{ id: comic.translationGroup.id, name: comic.translationGroup.name }]
            : [],
        })),
      }
    },
    enabled: !meLoading,
  })
}

export function useCreateTitle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateComicPayload) =>
      apiClient.createComic(payload),
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.dashboard.titles() }),
  })
}

export function usePublishComic() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ slug, isPublished }: { slug: string; isPublished: boolean }) =>
      apiClient.publishComic(slug, isPublished),
    onSettled: (_d, _e, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.manga.detail(vars.slug) })
      qc.invalidateQueries({ queryKey: queryKeys.dashboard.titles() })
    },
  })
}

export function useDeleteComic() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (slug: string) => apiClient.deleteComic(slug),
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.dashboard.titles() }),
  })
}

// ─── Chapters ─────────────────────────────────────────────────────────────────

export function useUploadChapter() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ comicSlug, payload }: { comicSlug: string; payload: CreateChapterPayload }) =>
      apiClient.createChapter(comicSlug, payload),
    onSettled: (_d, _e, vars) =>
      qc.invalidateQueries({ queryKey: queryKeys.manga.chapters(vars.comicSlug) }),
  })
}

export function usePublishChapter() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({
      comicSlug,
      chapterSlug,
      isPublished,
    }: {
      comicSlug: string;
      chapterSlug: string;
      isPublished: boolean;
    }) => apiClient.publishChapter(comicSlug, chapterSlug, isPublished),
    onSettled: (_d, _e, vars) =>
      qc.invalidateQueries({ queryKey: queryKeys.manga.chapters(vars.comicSlug) }),
  })
}

export function useDeleteChapter(comicSlug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (_chapterSlug: string) => {
      throw new Error('API currently does not support deleting chapters')
    },
    onSettled: () =>
      qc.invalidateQueries({ queryKey: queryKeys.manga.chapters(comicSlug) }),
  })
}

// ─── File Upload ─────────────────────────────────────────────────────────────

export function useUploadFile() {
  return useMutation({
    mutationFn: (file: File) => apiClient.uploadFile(file),
  })
}
