'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import type { UpdateGroupPayload } from '@/lib/api-client'

export function useGroup(slug: string) {
  return useQuery({
    queryKey: ['groups', slug],
    queryFn: () => apiClient.getTranslationGroup(slug),
  })
}

export function useUpdateGroup(groupSlug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateGroupPayload) =>
      apiClient.updateTranslationGroup(groupSlug, payload),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.dashboard.group(groupSlug) })
      qc.invalidateQueries({ queryKey: queryKeys.dashboard.groups() })
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
