'use client'

import { useQuery } from '@tanstack/react-query'

import { apiClient } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import type { LibraryEntry, PaginatedResponse } from '@/types'

export function useLibrary() {
  return useQuery<PaginatedResponse<LibraryEntry>>({
    queryKey: queryKeys.library.all(),
    queryFn: () => apiClient.get<PaginatedResponse<LibraryEntry>>('/library'),
  })
}
