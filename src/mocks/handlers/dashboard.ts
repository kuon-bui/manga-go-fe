import { http, HttpResponse, delay } from 'msw'

import type { Group, GroupMember } from '@/types'
import {
  MOCK_GROUPS,
  MOCK_GROUP_MEMBERS,
  MOCK_DASHBOARD_TITLES,
} from '@/mocks/data'

const BASE = 'http://localhost:8080/api/v1'

const groups: Group[] = [...MOCK_GROUPS]
const groupMembers: Record<string, GroupMember[]> = {
  'group-1': [...MOCK_GROUP_MEMBERS],
}

export const dashboardHandlers = [
  // GET /dashboard/titles
  http.get(`${BASE}/dashboard/titles`, async () => {
    await delay(200)
    return HttpResponse.json(MOCK_DASHBOARD_TITLES)
  }),

  // GET /dashboard/groups
  http.get(`${BASE}/dashboard/groups`, async () => {
    await delay(200)
    return HttpResponse.json(groups)
  }),

  // GET /dashboard/groups/:groupId
  http.get(`${BASE}/dashboard/groups/:groupId`, async ({ params }) => {
    await delay(150)
    const group = groups.find((g) => g.id === params.groupId)
    if (!group) return HttpResponse.json({ message: 'Group not found' }, { status: 404 })
    return HttpResponse.json<Group>(group)
  }),

  // GET /dashboard/groups/:groupId/members
  http.get(`${BASE}/dashboard/groups/:groupId/members`, async ({ params }) => {
    await delay(150)
    const members = groupMembers[params.groupId as string] ?? []
    return HttpResponse.json<GroupMember[]>(members)
  }),

  // POST /dashboard/groups/:groupId/invite
  http.post(`${BASE}/dashboard/groups/:groupId/invite`, async ({ request }) => {
    await delay(300)
    const body = await request.json() as { email?: string }
    if (!body.email) {
      return HttpResponse.json({ message: 'Email is required.' }, { status: 400 })
    }
    return HttpResponse.json({ message: 'Invitation sent.' })
  }),

  // DELETE /dashboard/groups/:groupId/members/:userId
  http.delete(
    `${BASE}/dashboard/groups/:groupId/members/:userId`,
    async ({ params }) => {
      await delay(200)
      const members = groupMembers[params.groupId as string]
      if (members) {
        const idx = members.findIndex((m) => m.userId === params.userId)
        if (idx !== -1) members.splice(idx, 1)
      }
      return new HttpResponse(null, { status: 204 })
    }
  ),

  // POST /dashboard/titles  — upload new title (returns mock)
  http.post(`${BASE}/dashboard/titles`, async ({ request }) => {
    await delay(500)
    // Just reflect back a minimal shape; real BE will define this
    const formData = await request.formData()
    return HttpResponse.json(
      {
        id: `manga-new-${Date.now()}`,
        title: formData.get('title') ?? 'New Title',
        coverUrl: 'https://picsum.photos/seed/new/300/420',
      },
      { status: 201 }
    )
  }),

  // POST /dashboard/titles/:mangaId/chapters  — upload chapter
  http.post(`${BASE}/dashboard/titles/:mangaId/chapters`, async () => {
    await delay(600)
    return HttpResponse.json({ id: `ch-new-${Date.now()}` }, { status: 201 })
  }),
]
