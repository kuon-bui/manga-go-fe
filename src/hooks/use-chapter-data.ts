'use client'

import { useQuery } from '@tanstack/react-query'

import { apiClient } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import type { Chapter } from '@/types'

export function useChapter(chapterId: string) {
  return useQuery<Chapter>({
    queryKey: queryKeys.chapter.detail(chapterId),
    queryFn: () => apiClient.get<Chapter>(`/chapters/${chapterId}`),
    enabled: Boolean(chapterId),
  })
}
