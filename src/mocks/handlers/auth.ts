import { http, HttpResponse, delay } from 'msw'

import type { AuthResponse } from '@/types'
import { MOCK_AUTH_RESPONSE, MOCK_USER } from '@/mocks/data'

const BASE = 'http://localhost:8080/api/v1'

// Simulate a simple in-memory user store for register
const registeredEmails = new Set<string>([MOCK_USER.email])

export const authHandlers = [
  // POST /auth/login
  http.post(`${BASE}/auth/login`, async ({ request }) => {
    await delay(300)
    const body = await request.json() as { email?: string; password?: string }

    if (!body.email || !body.password) {
      return HttpResponse.json({ message: 'Email and password are required.' }, { status: 400 })
    }
    if (body.password.length < 6) {
      return HttpResponse.json({ message: 'Invalid email or password.' }, { status: 401 })
    }

    return HttpResponse.json<AuthResponse>({
      ...MOCK_AUTH_RESPONSE,
      user: { ...MOCK_USER, email: body.email },
    })
  }),

  // POST /auth/register
  http.post(`${BASE}/auth/register`, async ({ request }) => {
    await delay(400)
    const body = await request.json() as {
      username?: string
      email?: string
      password?: string
    }

    if (!body.email || !body.username || !body.password) {
      return HttpResponse.json({ message: 'All fields are required.' }, { status: 400 })
    }
    if (registeredEmails.has(body.email)) {
      return HttpResponse.json({ message: 'Email is already in use.' }, { status: 409 })
    }

    registeredEmails.add(body.email)
    return HttpResponse.json<AuthResponse>({
      ...MOCK_AUTH_RESPONSE,
      user: {
        ...MOCK_USER,
        username: body.username,
        email: body.email,
        displayName: body.username,
      },
    })
  }),

  // POST /auth/forgot-password
  http.post(`${BASE}/auth/forgot-password`, async () => {
    await delay(500)
    return HttpResponse.json({ message: 'If that email exists, a reset link has been sent.' })
  }),

  // POST /auth/reset-password
  http.post(`${BASE}/auth/reset-password`, async ({ request }) => {
    await delay(500)
    const body = await request.json() as { token?: string; password?: string }
    if (!body.token || body.token === 'invalid') {
      return HttpResponse.json({ message: 'Invalid or expired reset token.' }, { status: 400 })
    }
    return HttpResponse.json({ message: 'Password reset successfully.' })
  }),

  // GET /auth/me
  http.get(`${BASE}/auth/me`, async ({ request }) => {
    await delay(100)
    const auth = request.headers.get('Authorization')
    if (!auth?.startsWith('Bearer ')) {
      return HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    return HttpResponse.json(MOCK_USER)
  }),
]
