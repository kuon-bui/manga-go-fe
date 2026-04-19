import { type NextRequest, NextResponse } from 'next/server'

const BACKEND = process.env.BACKEND_INTERNAL_URL ?? 'http://localhost:8080'

// Headers that must not be forwarded to the upstream backend
const DROP_REQ = new Set(['host', 'origin', 'connection', 'transfer-encoding'])
// Headers that must not be forwarded back to the browser
const DROP_RES = new Set(['connection', 'keep-alive', 'transfer-encoding', 'content-encoding'])

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  const { path } = await params
  const filePath = path.join('/')

  const url = new URL(`${BACKEND}/files/content/${filePath}`)
  url.search = req.nextUrl.search

  const reqHeaders = new Headers()
  req.headers.forEach((v, k) => {
    if (!DROP_REQ.has(k.toLowerCase())) reqHeaders.set(k, v)
  })
  // Spoof origin as localhost so the backend treats this as a same-site request
  reqHeaders.set('origin', 'http://localhost:3000')
  // Tell backend not to compress — proxy streams raw bytes
  reqHeaders.set('accept-encoding', 'identity')

  try {
    const upstream = await fetch(url.toString(), {
      method: 'GET',
      headers: reqHeaders,
      redirect: 'manual',
    })

    if (!upstream.ok) {
      return new NextResponse('File not found', { status: upstream.status })
    }

    const resHeaders = new Headers()
    upstream.headers.forEach((v, k) => {
      if (!DROP_RES.has(k.toLowerCase()) && k.toLowerCase() !== 'set-cookie') {
        resHeaders.set(k, v)
      }
    })

    // Forward each Set-Cookie separately
    const raw = upstream.headers as Headers & { getSetCookie?(): string[] }
    for (const cookie of raw.getSetCookie?.() ?? []) {
      resHeaders.append('set-cookie', cookie)
    }

    return new NextResponse(upstream.body, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: resHeaders,
    })
  } catch (error) {
    console.error('File proxy error:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}