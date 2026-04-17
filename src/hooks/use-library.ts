'use client'

import { useQuery } from '@tanstack/react-query'

import { apiClient } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import type { LibraryEntry, PaginatedResponse } from '@/types'

export function useLibrary() {
  return useQuery<PaginatedResponse<LibraryEntry>>({
    queryKey: queryKeys.library.all(),
    queryFn: async () => {
      const followed = await apiClient.getFollowedComics({ page: '1', limit: '100' })
      return {
        ...followed,
        data: followed.data
          .filter((item) => Boolean(item.comic))
          .map((item) => ({
            mangaId: item.comic.id,
            manga: item.comic,
            lastReadChapterId: null,
            lastReadAt: null,
            addedAt: item.createdAt ?? new Date().toISOString(),
          })),
      }
    },
  })
}
