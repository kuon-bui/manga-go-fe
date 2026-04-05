import { http, HttpResponse, delay } from 'msw'

import type { Comment, PaginatedResponse } from '@/types'
import { MOCK_COMMENTS } from '@/mocks/data'

const BASE = 'http://localhost:8080/api/v1'

// Mutable in-memory state
const comments: Record<string, Comment[]> = { ...MOCK_COMMENTS }
let nextId = 100

export const commentHandlers = [
  // GET /comments/:mangaId
  http.get(`${BASE}/comments/:mangaId`, async ({ params }) => {
    await delay(200)
    const list = comments[params.mangaId as string] ?? []
    return HttpResponse.json<PaginatedResponse<Comment>>({
      data: list,
      total: list.length,
      page: 1,
      pageSize: 20,
      hasMore: false,
    })
  }),

  // POST /comments/:mangaId
  http.post(`${BASE}/comments/:mangaId`, async ({ request, params }) => {
    await delay(250)
    const body = await request.json() as { body?: string; parentId?: string | null }
    if (!body.body?.trim()) {
      return HttpResponse.json({ message: 'Comment body is required.' }, { status: 400 })
    }

    const newComment: Comment = {
      id: `cmt-mock-${++nextId}`,
      body: body.body,
      author: {
        id: 'user-1',
        username: 'reader_one',
        displayName: 'Reader One',
        avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=reader_one',
      },
      parentId: body.parentId ?? null,
      replies: [],
      likeCount: 0,
      isLiked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const mangaId = params.mangaId as string
    if (!comments[mangaId]) comments[mangaId] = []

    if (newComment.parentId) {
      // Append as reply to parent
      const parent = comments[mangaId].find((c) => c.id === newComment.parentId)
      if (parent) parent.replies.push(newComment)
    } else {
      comments[mangaId].unshift(newComment)
    }

    return HttpResponse.json<Comment>(newComment, { status: 201 })
  }),

  // DELETE /comments/:commentId
  http.delete(`${BASE}/comments/:commentId`, async ({ params }) => {
    await delay(150)
    const commentId = params.commentId as string
    for (const mangaId of Object.keys(comments)) {
      comments[mangaId] = comments[mangaId].filter((c) => c.id !== commentId)
    }
    return new HttpResponse(null, { status: 204 })
  }),

  // POST /comments/:commentId/like
  http.post(`${BASE}/comments/:commentId/like`, async ({ params }) => {
    await delay(100)
    const commentId = params.commentId as string
    for (const mangaId of Object.keys(comments)) {
      const comment = comments[mangaId].find((c) => c.id === commentId)
      if (comment) {
        comment.isLiked = !comment.isLiked
        comment.likeCount += comment.isLiked ? 1 : -1
        return HttpResponse.json(comment)
      }
    }
    return HttpResponse.json({ message: 'Comment not found' }, { status: 404 })
  }),
]
