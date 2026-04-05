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
    queryFn: () => apiClient.get<Group[]>('/dashboard/groups'),
  })
}

export function useGroupMembers(groupId: string) {
  return useQuery<GroupMember[]>({
    queryKey: queryKeys.dashboard.groupMembers(groupId),
    queryFn: () => apiClient.get<GroupMember[]>(`/groups/${groupId}/members`),
    enabled: Boolean(groupId),
  })
}

export function useInviteMember(groupId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (email: string) =>
      apiClient.post(`/groups/${groupId}/invite`, { email }),
    onSettled: () =>
      qc.invalidateQueries({ queryKey: queryKeys.dashboard.groupMembers(groupId) }),
  })
}

export function useRemoveMember(groupId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) =>
      apiClient.delete(`/groups/${groupId}/members/${userId}`),
    onSettled: () =>
      qc.invalidateQueries({ queryKey: queryKeys.dashboard.groupMembers(groupId) }),
  })
}

// ─── Titles ───────────────────────────────────────────────────────────────────

export function useMyTitles() {
  return useQuery<PaginatedResponse<DashboardTitle>>({
    queryKey: queryKeys.dashboard.titles(),
    queryFn: () => apiClient.get<PaginatedResponse<DashboardTitle>>('/dashboard/titles'),
  })
}

export function useCreateTitle() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateTitlePayload) => {
      const form = new FormData()
      Object.entries(payload).forEach(([k, v]) => {
        if (v === undefined || v === null) return
        if (k === 'coverFile' && v instanceof File) {
          form.append('cover', v)
        } else if (Array.isArray(v)) {
          form.append(k, v.join(','))
        } else {
          form.append(k, String(v))
        }
      })
      return apiClient.post<{ id: string }>('/dashboard/titles', form)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.dashboard.titles() }),
  })
}

// ─── Chapters ─────────────────────────────────────────────────────────────────

export function useUploadChapter() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UploadChapterPayload) =>
      apiClient.post(`/dashboard/titles/${payload.mangaId}/chapters`, payload),
    onSettled: (_data, _err, vars) =>
      qc.invalidateQueries({ queryKey: queryKeys.manga.chapters(vars.mangaId) }),
  })
}

export function useDeleteChapter(mangaId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (chapterId: string) =>
      apiClient.delete(`/dashboard/chapters/${chapterId}`),
    onSettled: () =>
      qc.invalidateQueries({ queryKey: queryKeys.manga.chapters(mangaId) }),
  })
}
