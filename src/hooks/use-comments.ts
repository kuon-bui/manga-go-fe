'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiClient } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import type { Comment, PaginatedResponse } from '@/types'

// ─── Fetch ────────────────────────────────────────────────────────────────────

export function useComments(mangaId: string) {
  return useQuery<PaginatedResponse<Comment>>({
    queryKey: queryKeys.comments.list(mangaId),
    queryFn: () => apiClient.get<PaginatedResponse<Comment>>(`/manga/${mangaId}/comments`),
    enabled: Boolean(mangaId),
  })
}

// ─── Add comment (optimistic) ─────────────────────────────────────────────────

interface AddCommentPayload {
  body: string
  parentId: string | null
}

export function useAddComment(mangaId: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload: AddCommentPayload) =>
      apiClient.post<Comment>(`/manga/${mangaId}/comments`, payload),

    onMutate: async (payload) => {
      const key = queryKeys.comments.list(mangaId)
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<PaginatedResponse<Comment>>(key)

      // Build optimistic comment
      const optimistic: Comment = {
        id: `optimistic-${Date.now()}`,
        body: payload.body,
        parentId: payload.parentId,
        replies: [],
        likeCount: 0,
        isLiked: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: {
          id: 'me',
          username: '',
          displayName: 'You',
          avatarUrl: null,
        },
      }

      qc.setQueryData<PaginatedResponse<Comment>>(key, (old) => {
        if (!old) return old
        if (payload.parentId) {
          // Inject as reply into parent
          const updated = old.data.map((c) => {
            if (c.id === payload.parentId) {
              return { ...c, replies: [...c.replies, optimistic] }
            }
            return c
          })
          return { ...old, data: updated }
        }
        return { ...old, data: [optimistic, ...old.data], total: old.total + 1 }
      })

      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(queryKeys.comments.list(mangaId), ctx.prev)
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.comments.list(mangaId) })
    },
  })
}

// ─── Delete comment (optimistic) ──────────────────────────────────────────────

export function useDeleteComment(mangaId: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (commentId: string) =>
      apiClient.delete(`/manga/${mangaId}/comments/${commentId}`),

    onMutate: async (commentId) => {
      const key = queryKeys.comments.list(mangaId)
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<PaginatedResponse<Comment>>(key)

      qc.setQueryData<PaginatedResponse<Comment>>(key, (old) => {
        if (!old) return old
        const filtered = old.data
          .filter((c) => c.id !== commentId)
          .map((c) => ({
            ...c,
            replies: c.replies.filter((r) => r.id !== commentId),
          }))
        return { ...old, data: filtered, total: Math.max(0, old.total - 1) }
      })

      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(queryKeys.comments.list(mangaId), ctx.prev)
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.comments.list(mangaId) })
    },
  })
}
