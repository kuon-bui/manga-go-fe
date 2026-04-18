'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { apiClient } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import type { PaginatedResponse, ReadingHistoryEntry } from '@/types'

// ─── List reading history ─────────────────────────────────────────────────────

export function useReadingHistories(params?: Record<string, string>) {
  return useQuery<PaginatedResponse<ReadingHistoryEntry>>({
    queryKey: queryKeys.readingHistory.list(params),
    queryFn: () => apiClient.getReadingHistories(params),
  })
}

// ─── Create reading history (fire-and-forget on chapter open) ─────────────────

export function useCreateReadingHistory() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, { comicId: string; chapterId: string }>({
    mutationFn: ({ comicId, chapterId }) =>
      apiClient.createReadingHistory(comicId, chapterId),
    onSuccess: () => {
      // Invalidate list so Library > History tab refreshes
      void queryClient.invalidateQueries({ queryKey: queryKeys.readingHistory.all() })
    },
  })
}

// ─── Delete reading history entry ────────────────────────────────────────────

export function useDeleteReadingHistory() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: (id) => apiClient.deleteReadingHistory(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.readingHistory.all() })
    },
  })
}
