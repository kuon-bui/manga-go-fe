'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import type { CreateComicPayload, CreateChapterPayload } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import type {
  Group,
  DashboardTitle,
  PaginatedResponse,
  Author,
  Tag,
} from '@/types'

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

export function useMyGroups() {
  return useQuery<PaginatedResponse<Group>>({
    queryKey: queryKeys.dashboard.groups(),
    queryFn: () => apiClient.getTranslationGroups(),
  })
}

export function useCreateGroup() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ name, slug }: { name: string; slug: string }) =>
      apiClient.createTranslationGroup(name, slug),
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.dashboard.groups() }),
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
  return useQuery<PaginatedResponse<DashboardTitle>>({
    queryKey: queryKeys.dashboard.titles(),
    queryFn: () => apiClient.getComics(),
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
    mutationFn: (chapterSlug: string) =>
      apiClient.delete(`/comics/${comicSlug}/chapters/${chapterSlug}`),
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
