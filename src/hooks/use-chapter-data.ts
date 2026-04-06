'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiClient } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import type { Chapter } from '@/types'

export function useChapter(comicSlug: string, chapterSlug: string) {
  return useQuery<Chapter>({
    queryKey: queryKeys.chapter.detail(comicSlug, chapterSlug),
    queryFn: () =>
      apiClient.get<Chapter>(`/comics/${comicSlug}/chapters/${chapterSlug}`),
    enabled: Boolean(comicSlug) && Boolean(chapterSlug),
  })
}

export function useMarkChapterRead(comicSlug: string, chapterSlug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      apiClient.patch(`/comics/${comicSlug}/chapters/${chapterSlug}/mark-as-read`),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.chapter.detail(comicSlug, chapterSlug) })
    },
  })
}
