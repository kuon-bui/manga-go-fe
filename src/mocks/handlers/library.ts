import { http, HttpResponse } from 'msw'

import type { FollowStatus, UserRating } from '@/types'
import { MOCK_LIBRARY } from '@/mocks/data'

const BASE = 'http://localhost:8080'

// Follow and rating have no real API equivalent yet — kept as mocks.
const follows = new Map<string, boolean>(MOCK_LIBRARY.map((e) => [e.mangaId, true]))
const ratings = new Map<string, number>([['manga-1', 9], ['manga-3', 10]])

export const libraryHandlers = [
  // GET /follow/:mangaId
  http.get(`${BASE}/follow/:mangaId`, async ({ params }) => {
    return HttpResponse.json<FollowStatus>({
      mangaId: params.mangaId as string,
      isFollowing: follows.get(params.mangaId as string) ?? false,
    })
  }),

  // POST /follow/:mangaId
  http.post(`${BASE}/follow/:mangaId`, async ({ params }) => {
    follows.set(params.mangaId as string, true)
    return HttpResponse.json<FollowStatus>({
      mangaId: params.mangaId as string,
      isFollowing: true,
    })
  }),

  // DELETE /follow/:mangaId
  http.delete(`${BASE}/follow/:mangaId`, async ({ params }) => {
    follows.set(params.mangaId as string, false)
    return HttpResponse.json<FollowStatus>({
      mangaId: params.mangaId as string,
      isFollowing: false,
    })
  }),

  // GET /rating/:mangaId
  http.get(`${BASE}/rating/:mangaId`, async ({ params }) => {
    const score = ratings.get(params.mangaId as string)
    if (!score) return HttpResponse.json({ message: 'No rating found' }, { status: 404 })
    return HttpResponse.json<UserRating>({
      mangaId: params.mangaId as string,
      score,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    })
  }),

  // POST /rating/:mangaId
  http.post(`${BASE}/rating/:mangaId`, async ({ request, params }) => {
    const body = await request.json() as { score?: number }
    if (!body.score || body.score < 1 || body.score > 10) {
      return HttpResponse.json({ message: 'Score must be between 1 and 10.' }, { status: 400 })
    }
    ratings.set(params.mangaId as string, body.score)
    return HttpResponse.json<UserRating>({
      mangaId: params.mangaId as string,
      score: body.score,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
  }),
]
