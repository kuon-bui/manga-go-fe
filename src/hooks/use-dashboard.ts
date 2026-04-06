'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import type {
  Group,
  GroupMember,
  DashboardTitle,
  PaginatedResponse,
  CreateTitlePayload,
  UploadChapterPayload,
} from '@/types'

// ─── Groups ───────────────────────────────────────────────────────────────────

export function useMyGroups() {
  return useQuery<Group[]>({
    queryKey: queryKeys.dashboard.groups(),
    queryFn: () => apiClient.get<Group[]>('/translation-groups'),
  })
}

export function useGroupMembers(groupSlug: string) {
  return useQuery<GroupMember[]>({
    queryKey: queryKeys.dashboard.groupMembers(groupSlug),
    queryFn: () =>
      apiClient.get<GroupMember[]>(`/translation-groups/${groupSlug}`),
    enabled: Boolean(groupSlug),
  })
}

export function useInviteMember(groupSlug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (email: string) =>
      apiClient.post(`/translation-groups/${groupSlug}/invite`, { email }),
    onSettled: () =>
      qc.invalidateQueries({ queryKey: queryKeys.dashboard.groupMembers(groupSlug) }),
  })
}

export function useRemoveMember(groupSlug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) =>
      apiClient.delete(`/translation-groups/${groupSlug}/members/${userId}`),
    onSettled: () =>
      qc.invalidateQueries({ queryKey: queryKeys.dashboard.groupMembers(groupSlug) }),
  })
}

// ─── Titles ───────────────────────────────────────────────────────────────────

export function useMyTitles() {
  return useQuery<PaginatedResponse<DashboardTitle>>({
    queryKey: queryKeys.dashboard.titles(),
    queryFn: () => apiClient.get<PaginatedResponse<DashboardTitle>>('/comics'),
  })
}

export function useCreateTitle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateTitlePayload) => {
      const body = {
        title: payload.title,
        alternativeTitles: payload.alternativeTitles,
        type: payload.type,
        status: payload.status,
        description: payload.description,
        authorIds: [payload.author],
        genreSlugs: payload.genres,
        tagSlugs: payload.tags,
        publishedYear: payload.year,
        // slug derived from title on backend
      }
      return apiClient.post<{ id: string; slug: string }>('/comics', body)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.dashboard.titles() }),
  })
}

// ─── Chapters ─────────────────────────────────────────────────────────────────

export function useUploadChapter() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UploadChapterPayload) =>
      apiClient.post(`/comics/${payload.comicSlug}/chapters`, {
        slug: payload.slug,
        number: String(payload.number),
        title: payload.title ?? '',
        pages: payload.pages,
      }),
    onSettled: (_data, _err, vars) =>
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
