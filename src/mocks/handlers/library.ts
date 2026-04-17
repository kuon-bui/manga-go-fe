import { http, HttpResponse } from 'msw'

const BASE = 'http://localhost:8080'

const ratings = new Map<string, { id: string; score: number; createdAt: string; updatedAt: string }>([
  ['manga-1', { id: 'rating-1', score: 5, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' }],
  ['manga-3', { id: 'rating-2', score: 4, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' }],
])

export const libraryHandlers = [
  // GET /ratings/comics/:comicSlug
  http.get(`${BASE}/ratings/comics/:comicSlug`, async ({ params }) => {
    const rating = ratings.get(params.comicSlug as string)
    return HttpResponse.json({
      data: rating ? [{ id: rating.id, score: rating.score, createdAt: rating.createdAt, updatedAt: rating.updatedAt }] : [],
      total: rating ? 1 : 0,
      page: 1,
      pageSize: 10,
      hasMore: false,
    })
  }),

  // POST /ratings/comics/:comicSlug
  http.post(`${BASE}/ratings/comics/:comicSlug`, async ({ request, params }) => {
    const body = await request.json() as { score?: number }
    if (!body.score || body.score < 1 || body.score > 5) {
      return HttpResponse.json({ message: 'Score must be between 1 and 5.' }, { status: 400 })
    }
    const saved = {
      id: `rating-${Date.now()}`,
      score: body.score,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    ratings.set(params.comicSlug as string, saved)
    return HttpResponse.json(saved)
  }),
]
