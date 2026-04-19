'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiClient, normalizeComment } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import type { Comment, PaginatedResponse } from '@/types'

// ─── Comment scope types ──────────────────────────────────────────────────────

type CommentScope =
  | { type: 'comic'; comicId: string }
  | { type: 'chapter'; chapterId: string }
  | { type: 'page'; chapterId: string; pageIndex: number }

function getCommentKey(scope: CommentScope): string {
  switch (scope.type) {
    case 'comic':
      return `comic-${scope.comicId}`
    case 'chapter':
      return `chapter-${scope.chapterId}`
    case 'page':
      return `page-${scope.chapterId}-${scope.pageIndex}`
  }
}

// ─── Fetch ────────────────────────────────────────────────────────────────────

export function useComments(scope: CommentScope) {
  const key = getCommentKey(scope)

  return useQuery<PaginatedResponse<Comment>>({
    queryKey: queryKeys.comments.list(key),
    queryFn: async () => {
      const params = new URLSearchParams()
      if (scope.type === 'comic') {
        params.append('comicId', scope.comicId)
      } else if (scope.type === 'chapter') {
        params.append('chapterId', scope.chapterId)
      } else {
        params.append('chapterId', scope.chapterId)
        params.append('pageIndex', String(scope.pageIndex))
      }
      const res = await apiClient.get<PaginatedResponse<unknown>>('/comments', { params: Object.fromEntries(params) })
      return { ...res, data: (res.data as Array<Record<string, unknown>>).map(normalizeComment) }
    },
    enabled: Boolean(scope),
  })
}

// ─── Add comment (optimistic) ─────────────────────────────────────────────────

interface AddCommentPayload {
  content: string
  parentId?: string | null | undefined
  mentionedAuthor?: {
    id: string
    name: string
    avatarUrl: string | null
  }
}

export function useAddComment(scope: CommentScope) {
  const qc = useQueryClient()
  const key = getCommentKey(scope)

  return useMutation({
    mutationFn: (payload: AddCommentPayload) => {
      if (scope.type === 'comic') {
        return apiClient.createComment({
          comicId: scope.comicId,
          content: payload.content,
          pageIndex: null,
          parentId: payload.parentId,
        })
      } else if (scope.type === 'chapter') {
        return apiClient.createComment({
          chapterId: scope.chapterId,
          content: payload.content,
          pageIndex: null,
          parentId: payload.parentId,
        })
      } else {
        return apiClient.createComment({
          chapterId: scope.chapterId,
          content: payload.content,
          pageIndex: scope.pageIndex,
          parentId: payload.parentId,
        })
      }
    },

    onMutate: async (payload) => {
      const queryKey = queryKeys.comments.list(key)
      await qc.cancelQueries({ queryKey })
      const prev = qc.getQueryData<PaginatedResponse<Comment>>(queryKey)

      const optimistic: Comment = {
        id: `optimistic-${Date.now()}`,
        content: payload.content,
        ...(scope.type === 'comic' && { comicId: scope.comicId }),
        ...(scope.type !== 'comic' && { chapterId: scope.chapterId }),
        pageIndex: scope.type === 'page' ? scope.pageIndex : null,
        parentId: payload.parentId ?? null,
        ...(payload.mentionedAuthor && { mentions: [payload.mentionedAuthor] }),
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

      qc.setQueryData<PaginatedResponse<Comment>>(queryKey, (old) => {
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
        qc.setQueryData(queryKeys.comments.list(key), ctx.prev)
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.comments.list(key) })
    },
  })
}

// ─── Delete comment (optimistic) ──────────────────────────────────────────────

export function useDeleteComment(scope: CommentScope) {
  const qc = useQueryClient()
  const key = getCommentKey(scope)

  return useMutation({
    mutationFn: (commentId: string) => apiClient.deleteComment(commentId),

    onMutate: async (commentId) => {
      const queryKey = queryKeys.comments.list(key)
      await qc.cancelQueries({ queryKey })
      const prev = qc.getQueryData<PaginatedResponse<Comment>>(queryKey)

      qc.setQueryData<PaginatedResponse<Comment>>(queryKey, (old) => {
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
        qc.setQueryData(queryKeys.comments.list(key), ctx.prev)
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.comments.list(key) })
    },
  })
}

// ─── Reactions ────────────────────────────────────────────────────────────

export function useToggleReaction(scope: CommentScope) {
  const qc = useQueryClient()
  const key = getCommentKey(scope)

  return useMutation({
    mutationFn: ({ commentId, type, isLiked }: { commentId: string; type: string; isLiked: boolean }) => {
      if (isLiked) {
        return apiClient.removeCommentReaction(commentId, type)
      } else {
        return apiClient.addCommentReaction(commentId, type)
      }
    },
    onMutate: async ({ commentId, type, isLiked }) => {
      const queryKey = queryKeys.comments.list(key)
      await qc.cancelQueries({ queryKey })
      const prev = qc.getQueryData<PaginatedResponse<Comment>>(queryKey)

      qc.setQueryData<PaginatedResponse<Comment>>(queryKey, (old) => {
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
        qc.setQueryData(queryKeys.comments.list(key), ctx.prev)
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.comments.list(key) })
    },
  })
}

// ─── Backwards compatibility ──────────────────────────────────────────────────

export function useCommentsChapter(chapterId: string) {
  return useComments({ type: 'chapter', chapterId })
}

export function useAddCommentChapter(chapterId: string) {
  return useAddComment({ type: 'chapter', chapterId })
}

export function useDeleteCommentChapter(chapterId: string) {
  return useDeleteComment({ type: 'chapter', chapterId })
}

export function useToggleReactionChapter(chapterId: string) {
  return useToggleReaction({ type: 'chapter', chapterId })
}
