import { http, HttpResponse, delay } from 'msw'

import type { LibraryEntry, FollowStatus, UserRating } from '@/types'
import { MOCK_LIBRARY, MOCK_MANGA_LIST } from '@/mocks/data'

const BASE = 'http://localhost:8080/api/v1'

// Mutable in-memory state (resets on page refresh — fine for dev)
const library = new Map<string, LibraryEntry>(
  MOCK_LIBRARY.map((e) => [e.mangaId, e])
)
const follows = new Map<string, boolean>(MOCK_LIBRARY.map((e) => [e.mangaId, true]))
const ratings = new Map<string, number>([['manga-1', 9], ['manga-3', 10]])

export const libraryHandlers = [
  // GET /library
  http.get(`${BASE}/library`, async () => {
    await delay(200)
    return HttpResponse.json(Array.from(library.values()))
  }),

  // GET /library/:mangaId
  http.get(`${BASE}/library/:mangaId`, async ({ params }) => {
    await delay(100)
    const entry = library.get(params.mangaId as string)
    if (!entry) return HttpResponse.json({ message: 'Not in library' }, { status: 404 })
    return HttpResponse.json<LibraryEntry>(entry)
  }),

  // POST /library/:mangaId  — add to library
  http.post(`${BASE}/library/:mangaId`, async ({ params }) => {
    await delay(200)
    const mangaId = params.mangaId as string
    const manga = MOCK_MANGA_LIST.find((m) => m.id === mangaId)
    if (!manga) return HttpResponse.json({ message: 'Title not found' }, { status: 404 })

    const entry: LibraryEntry = {
      mangaId,
      manga,
      lastReadChapterId: null,
      lastReadAt: null,
      addedAt: new Date().toISOString(),
    }
    library.set(mangaId, entry)
    return HttpResponse.json<LibraryEntry>(entry, { status: 201 })
  }),

  // DELETE /library/:mangaId
  http.delete(`${BASE}/library/:mangaId`, async ({ params }) => {
    await delay(150)
    library.delete(params.mangaId as string)
    return new HttpResponse(null, { status: 204 })
  }),

  // GET /follow/:mangaId
  http.get(`${BASE}/follow/:mangaId`, async ({ params }) => {
    await delay(100)
    return HttpResponse.json<FollowStatus>({
      mangaId: params.mangaId as string,
      isFollowing: follows.get(params.mangaId as string) ?? false,
    })
  }),

  // POST /follow/:mangaId
  http.post(`${BASE}/follow/:mangaId`, async ({ params }) => {
    await delay(150)
    follows.set(params.mangaId as string, true)
    return HttpResponse.json<FollowStatus>({
      mangaId: params.mangaId as string,
      isFollowing: true,
    })
  }),

  // DELETE /follow/:mangaId
  http.delete(`${BASE}/follow/:mangaId`, async ({ params }) => {
    await delay(150)
    follows.set(params.mangaId as string, false)
    return HttpResponse.json<FollowStatus>({
      mangaId: params.mangaId as string,
      isFollowing: false,
    })
  }),

  // GET /rating/:mangaId
  http.get(`${BASE}/rating/:mangaId`, async ({ params }) => {
    await delay(100)
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
    await delay(200)
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
