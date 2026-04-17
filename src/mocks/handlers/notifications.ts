import { http, HttpResponse } from 'msw'

import type { Notification, PaginatedResponse } from '@/types'
import { MOCK_NOTIFICATIONS } from '@/mocks/data'

const BASE = 'http://localhost:8080'

// Mutable in-memory state
const notifications: Notification[] = [...MOCK_NOTIFICATIONS]

export const notificationHandlers = [
  // GET /notifications?unreadOnly=true
  http.get(`${BASE}/notifications`, async ({ request }) => {
    const url = new URL(request.url)
    if (url.searchParams.get('unreadOnly') !== 'true') {
      return HttpResponse.json<PaginatedResponse<Notification>>({
        data: notifications,
        total: notifications.length,
        page: 1,
        pageSize: 20,
        hasMore: false,
      })
    }

    const unread = notifications.filter((n) => !n.isRead)
    const limit = Number(url.searchParams.get('limit') ?? '20')
    const count = notifications.filter((n) => !n.isRead).length
    return HttpResponse.json<PaginatedResponse<Notification>>({
      data: unread.slice(0, Number.isNaN(limit) ? 20 : limit),
      total: count,
      page: 1,
      pageSize: Number.isNaN(limit) ? 20 : limit,
      hasMore: false,
    })
  }),

  // PATCH /notifications/:id/read
  http.patch(`${BASE}/notifications/:id/read`, async ({ params }) => {
    const notif = notifications.find((n) => n.id === params.id)
    if (!notif) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    notif.isRead = true
    return HttpResponse.json(notif)
  }),

  // PATCH /notifications/read-all
  http.patch(`${BASE}/notifications/read-all`, async () => {
    notifications.forEach((n) => { n.isRead = true })
    return new HttpResponse(null, { status: 204 })
  }),
]
