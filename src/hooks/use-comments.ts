'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiClient } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import type { Comment, PaginatedResponse } from '@/types'

// ─── Fetch ────────────────────────────────────────────────────────────────────

export function useComments(chapterId: string) {
  return useQuery<PaginatedResponse<Comment>>({
    queryKey: queryKeys.comments.list(chapterId),
    queryFn: () => apiClient.getComments(chapterId),
    enabled: Boolean(chapterId),
  })
}

// ─── Add comment (optimistic) ─────────────────────────────────────────────────

interface AddCommentPayload {
  content: string
  parentId: string | null
}

export function useAddComment(chapterId: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload: AddCommentPayload) =>
      apiClient.createComment({
        chapterId,
        content: payload.content,
        pageIndex: null,
      }),

    onMutate: async (payload) => {
      const key = queryKeys.comments.list(chapterId)
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<PaginatedResponse<Comment>>(key)

      const optimistic: Comment = {
        id: `optimistic-${Date.now()}`,
        content: payload.content,
        chapterId,
        pageIndex: null,
        parentId: payload.parentId,
        replies: [],
        reactions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: {
          id: 'me',
          name: 'You',
          avatarUrl: null,
        },
      }

      qc.setQueryData<PaginatedResponse<Comment>>(key, (old) => {
        if (!old) return old
        if (payload.parentId) {
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
        qc.setQueryData(queryKeys.comments.list(chapterId), ctx.prev)
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.comments.list(chapterId) })
    },
  })
}

// ─── Delete comment (optimistic) ──────────────────────────────────────────────

export function useDeleteComment(chapterId: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (commentId: string) => apiClient.deleteComment(commentId),

    onMutate: async (commentId) => {
      const key = queryKeys.comments.list(chapterId)
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
        qc.setQueryData(queryKeys.comments.list(chapterId), ctx.prev)
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.comments.list(chapterId) })
    },
  })
}

// ─── Reactions ────────────────────────────────────────────────────────────────

export function useToggleReaction(chapterId: string) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ commentId, type, isLiked }: { commentId: string; type: string; isLiked: boolean }) => {
      if (isLiked) {
        return apiClient.removeCommentReaction(commentId, type)
      } else {
        return apiClient.addCommentReaction(commentId, type)
      }
    },
    onMutate: async ({ commentId, type, isLiked }) => {
      const key = queryKeys.comments.list(chapterId)
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<PaginatedResponse<Comment>>(key)

      qc.setQueryData<PaginatedResponse<Comment>>(key, (old) => {
        if (!old) return old

        const toggleReaction = (c: Comment): Comment => {
          if (c.id === commentId) {
            const tempReactions = [...c.reactions]
            const rIdx = tempReactions.findIndex((r) => r.type === type)
            if (rIdx >= 0) {
              const r = tempReactions[rIdx]
              tempReactions[rIdx] = { ...r, userReacted: !isLiked, count: Math.max(0, r.count + (isLiked ? -1 : 1)) }
            } else if (!isLiked) {
              tempReactions.push({ type, count: 1, userReacted: true })
            }
            return { ...c, reactions: tempReactions }
          }
          if (c.replies.length > 0) {
            return { ...c, replies: c.replies.map(toggleReaction) }
          }
          return c
        }

        return { ...old, data: old.data.map(toggleReaction) }
      })

      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) {
        qc.setQueryData(queryKeys.comments.list(chapterId), ctx.prev)
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.comments.list(chapterId) })
    },
  })
}
