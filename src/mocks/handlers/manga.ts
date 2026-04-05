import { http, HttpResponse, delay } from 'msw'

import type { Manga, PaginatedResponse } from '@/types'
import {
  MOCK_MANGA_LIST,
  MOCK_GENRES,
  MOCK_CHAPTER_SUMMARIES,
  MOCK_CHAPTERS,
} from '@/mocks/data'

const BASE = 'http://localhost:8080/api/v1'

export const mangaHandlers = [
  // GET /manga/trending
  http.get(`${BASE}/manga/trending`, async () => {
    await delay(200)
    const trending = [...MOCK_MANGA_LIST].sort((a, b) => b.followCount - a.followCount).slice(0, 5)
    return HttpResponse.json<Manga[]>(trending)
  }),

  // GET /manga/recently-updated
  http.get(`${BASE}/manga/recently-updated`, async ({ request }) => {
    await delay(200)
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') ?? '1', 10)
    const pageSize = parseInt(url.searchParams.get('pageSize') ?? '10', 10)
    const sorted = [...MOCK_MANGA_LIST].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
    const start = (page - 1) * pageSize
    const slice = sorted.slice(start, start + pageSize)

    return HttpResponse.json<PaginatedResponse<Manga>>({
      data: slice,
      total: MOCK_MANGA_LIST.length,
      page,
      pageSize,
      hasMore: start + pageSize < MOCK_MANGA_LIST.length,
    })
  }),

  // GET /manga/search
  http.get(`${BASE}/manga/search`, async ({ request }) => {
    await delay(300)
    const url = new URL(request.url)
    const q = (url.searchParams.get('query') ?? '').toLowerCase()
    const type = url.searchParams.get('type')
    const status = url.searchParams.get('status')
    const page = parseInt(url.searchParams.get('page') ?? '1', 10)
    const pageSize = parseInt(url.searchParams.get('pageSize') ?? '10', 10)

    let results = [...MOCK_MANGA_LIST]
    if (q) results = results.filter((m) => m.title.toLowerCase().includes(q))
    if (type) results = results.filter((m) => m.type === type)
    if (status) results = results.filter((m) => m.status === status)

    const start = (page - 1) * pageSize
    const slice = results.slice(start, start + pageSize)

    return HttpResponse.json<PaginatedResponse<Manga>>({
      data: slice,
      total: results.length,
      page,
      pageSize,
      hasMore: start + pageSize < results.length,
    })
  }),

  // GET /manga/browse
  http.get(`${BASE}/manga/browse`, async ({ request }) => {
    await delay(300)
    const url = new URL(request.url)
    const genre = url.searchParams.get('genre')
    const status = url.searchParams.get('status')
    const sort = url.searchParams.get('sort') ?? 'latest'
    const page = parseInt(url.searchParams.get('page') ?? '1', 10)
    const pageSize = parseInt(url.searchParams.get('pageSize') ?? '10', 10)

    let results = [...MOCK_MANGA_LIST]
    if (genre) results = results.filter((m) => m.genres.some((g) => g.slug === genre))
    if (status) results = results.filter((m) => m.status === status)
    if (sort === 'rating') results.sort((a, b) => b.rating - a.rating)
    else results.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    const start = (page - 1) * pageSize
    const slice = results.slice(start, start + pageSize)

    return HttpResponse.json<PaginatedResponse<Manga>>({
      data: slice,
      total: results.length,
      page,
      pageSize,
      hasMore: start + pageSize < results.length,
    })
  }),

  // GET /manga/:id
  http.get(`${BASE}/manga/:id`, async ({ params }) => {
    await delay(200)
    const manga = MOCK_MANGA_LIST.find((m) => m.id === params.id)
    if (!manga) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    return HttpResponse.json<Manga>(manga)
  }),

  // GET /manga/:id/chapters
  http.get(`${BASE}/manga/:mangaId/chapters`, async ({ params }) => {
    await delay(200)
    const chapters = MOCK_CHAPTER_SUMMARIES[params.mangaId as string]
    if (!chapters) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    return HttpResponse.json(chapters)
  }),

  // GET /chapters/:id
  http.get(`${BASE}/chapters/:id`, async ({ params }) => {
    await delay(300)
    const chapter = MOCK_CHAPTERS[params.id as string]
    if (!chapter) {
      // Generate a generic manga chapter for any unknown ID
      return HttpResponse.json({ message: 'Chapter not found' }, { status: 404 })
    }
    return HttpResponse.json(chapter)
  }),

  // GET /genres
  http.get(`${BASE}/genres`, async () => {
    await delay(100)
    return HttpResponse.json(MOCK_GENRES)
  }),
]
