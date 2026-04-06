import { http, HttpResponse, delay } from 'msw'

import type { Notification, PaginatedResponse } from '@/types'
import { MOCK_NOTIFICATIONS } from '@/mocks/data'

const BASE = 'http://localhost:8080'

// Mutable in-memory state
const notifications: Notification[] = [...MOCK_NOTIFICATIONS]

export const notificationHandlers = [
  // GET /notifications
  http.get(`${BASE}/notifications`, async () => {
    await delay(200)
    return HttpResponse.json<PaginatedResponse<Notification>>({
      data: notifications,
      total: notifications.length,
      page: 1,
      pageSize: 20,
      hasMore: false,
    })
  }),

  // GET /notifications/unread-count
  http.get(`${BASE}/notifications/unread-count`, async () => {
    await delay(100)
    const count = notifications.filter((n) => !n.isRead).length
    return HttpResponse.json<{ count: number }>({ count })
  }),

  // PATCH /notifications/:id/read
  http.patch(`${BASE}/notifications/:id/read`, async ({ params }) => {
    await delay(100)
    const notif = notifications.find((n) => n.id === params.id)
    if (!notif) return HttpResponse.json({ message: 'Not found' }, { status: 404 })
    notif.isRead = true
    return HttpResponse.json(notif)
  }),

  // POST /notifications/read-all
  http.post(`${BASE}/notifications/read-all`, async () => {
    await delay(150)
    notifications.forEach((n) => { n.isRead = true })
    return new HttpResponse(null, { status: 204 })
  }),
]
