import { http, HttpResponse, delay } from 'msw'

import type { Chapter, Manga, PaginatedResponse } from '@/types'
import {
  MOCK_MANGA_LIST,
  MOCK_GENRES,
  MOCK_CHAPTER_SUMMARIES,
  MOCK_CHAPTERS,
} from '@/mocks/data'

// ─── Dynamic chapter generator ────────────────────────────────────────────────
// Parses IDs like "manga-1-ch-5" or "novel-1-ch-100" and builds a full Chapter.

function generateChapter(chapterId: string): Chapter | null {
  // Match pattern: <mangaId>-ch-<number>  e.g. "manga-1-ch-5", "novel-1-ch-42"
  const match = /^(.+)-ch-(\d+)$/.exec(chapterId)
  if (!match) return null

  const mangaId = match[1]
  const num = parseInt(match[2], 10)
  const manga = MOCK_MANGA_LIST.find((m) => m.id === mangaId)
  if (!manga) return null

  const summaries = MOCK_CHAPTER_SUMMARIES[mangaId] ?? []
  // summaries are stored latest-first, so find by number
  const summary = summaries.find((s) => s.number === num)
  if (!summary) return null

  const prevSummary = summaries.find((s) => s.number === num - 1)
  const nextSummary = summaries.find((s) => s.number === num + 1)

  const isNovel = manga.type === 'novel'

  if (isNovel) {
    return {
      ...summary,
      mangaId,
      pages: [],
      content: buildNovelContent(manga.title, num),
      prevChapterId: prevSummary?.id ?? null,
      nextChapterId: nextSummary?.id ?? null,
    }
  }

  // Manga: generate 18–24 placeholder pages, seed changes per chapter for visual variety
  const pageCount = 16 + (num % 9)  // 16–24 pages
  return {
    ...summary,
    mangaId,
    pages: Array.from({ length: pageCount }, (_, i) =>
      `https://picsum.photos/seed/${mangaId}ch${num}p${i + 1}/800/1200`
    ),
    content: null,
    prevChapterId: prevSummary?.id ?? null,
    nextChapterId: nextSummary?.id ?? null,
  }
}

const NOVEL_PARAGRAPHS = [
  'The silence between worlds is never truly silent. It hums with the memory of everything that once was, a low resonance felt only by those who have learned to listen with something other than their ears.',
  'She had crossed seventeen thresholds before she understood that crossing was not a destination. Every door opened onto another corridor, every answer birthed three questions, and the map she carried had long since stopped being useful.',
  'The elder sat at the edge of what might generously be called a town and watched the horizon with eyes that had seen too many horizons. "You will find what you are searching for," he said, without looking up. "Whether that is a blessing depends entirely on what happens next."',
  'Power is not a gift. It is a debt that accumulates interest. The longer you carry it, the heavier it becomes, until one day you realize you are no longer carrying it — it is carrying you.',
  'The sky here was the wrong color. Not wrong in the way a storm sky is wrong, or a smog-thick city sky is wrong. Wrong in a deeper sense, as though the blue had been borrowed from somewhere it had no right to be and had not yet been returned.',
  'Memory and identity are the same river. You cannot step into either one twice, yet you cannot stop stepping. This is not a tragedy. It is, perhaps, the only form of freedom available to a mortal mind.',
  'The explosion of light that followed was not an explosion at all — light does not explode, it arrives. But there is no better word for the way it rewrote every shadow in the room and turned the familiar into something briefly, bewilderingly new.',
  '"There are rules," the guardian said, with the weary tone of someone who had been explaining rules to people who would break them for a very long time.',
  'She read the letter three times. On the first reading she understood the words. On the second she understood the meaning. On the third she understood what she was going to have to do, and she set the letter down on the table and looked at the wall for a while.',
  'The world does not pause for grief. This is both its cruelty and its mercy — the sun rises regardless, the birds make their noise, and eventually hunger proves itself a more immediate concern than sorrow.',
]

function buildNovelContent(title: string, chapterNum: number): string {
  // Use chapterNum to deterministically pick a subset of paragraphs
  const picked = NOVEL_PARAGRAPHS.filter((_, i) => (i + chapterNum) % 3 !== 0)
  const paragraphs = [...picked, ...picked.slice(0, 4)] // enough content to scroll

  return [
    `<h2>Chapter ${chapterNum}</h2>`,
    ...paragraphs.map((p) => `<p>${p}</p>`),
    `<hr/>`,
    `<p><em>— End of Chapter ${chapterNum} of <strong>${title}</strong> —</em></p>`,
  ].join('\n')
}

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
  http.get(`${BASE}/manga/:mangaId/chapters`, async ({ params, request }) => {
    await delay(200)
    const chapters = MOCK_CHAPTER_SUMMARIES[params.mangaId as string]
    if (!chapters) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') ?? '1', 10)
    const pageSize = parseInt(url.searchParams.get('pageSize') ?? '500', 10)
    const start = (page - 1) * pageSize
    const slice = chapters.slice(start, start + pageSize)
    return HttpResponse.json({
      data: slice,
      total: chapters.length,
      page,
      pageSize,
      hasMore: start + pageSize < chapters.length,
    })
  }),

  // GET /chapters/:id  — serves hardcoded chapters first, then generates dynamically
  http.get(`${BASE}/chapters/:id`, async ({ params }) => {
    await delay(300)
    const chapterId = params.id as string

    // 1. Check explicitly defined chapters (richer content)
    const known = MOCK_CHAPTERS[chapterId]
    if (known) return HttpResponse.json<Chapter>(known)

    // 2. Dynamically generate from chapter ID pattern
    const generated = generateChapter(chapterId)
    if (generated) return HttpResponse.json<Chapter>(generated)

    return HttpResponse.json({ message: 'Chapter not found' }, { status: 404 })
  }),

  // GET /genres
  http.get(`${BASE}/genres`, async () => {
    await delay(100)
    return HttpResponse.json(MOCK_GENRES)
  }),
]
