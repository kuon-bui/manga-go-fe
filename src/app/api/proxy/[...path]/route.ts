import { type NextRequest, NextResponse } from 'next/server'

const BACKEND = process.env.BACKEND_INTERNAL_URL ?? 'http://localhost:8080'

// Headers that must not be forwarded to the upstream backend
const DROP_REQ = new Set(['host', 'origin', 'connection', 'transfer-encoding'])
// Headers that must not be forwarded back to the browser
const DROP_RES = new Set(['connection', 'keep-alive', 'transfer-encoding', 'content-encoding'])

async function proxy(req: NextRequest, segments: string[]): Promise<NextResponse> {
  const url = new URL(`${BACKEND}/${segments.join('/')}`)
  url.search = req.nextUrl.search

  const reqHeaders = new Headers()
  req.headers.forEach((v, k) => {
    if (!DROP_REQ.has(k.toLowerCase())) reqHeaders.set(k, v)
  })
  // Spoof origin as localhost so the backend treats this as a same-site request:
  //   → SameSite=Lax cookies (no Secure flag required, works over plain HTTP)
  //   → CORS: localhost is always in the backend's allowed-origins list
  reqHeaders.set('origin', 'http://localhost:3000')
  // Tell backend not to compress — proxy streams raw bytes; double-decompression breaks browser
  reqHeaders.set('accept-encoding', 'identity')

  const hasBody = req.method !== 'GET' && req.method !== 'HEAD'

  const upstream = await fetch(url.toString(), {
    method: req.method,
    headers: reqHeaders,
    body: hasBody ? req.body : undefined,
    // @ts-expect-error -- Node.js fetch requires duplex when body is a ReadableStream
    duplex: 'half',
    redirect: 'manual',
  })

  const resHeaders = new Headers()
  upstream.headers.forEach((v, k) => {
    if (!DROP_RES.has(k.toLowerCase()) && k.toLowerCase() !== 'set-cookie') {
      resHeaders.set(k, v)
    }
  })

  // Forward each Set-Cookie separately — Headers.append keeps them distinct
  const raw = upstream.headers as Headers & { getSetCookie?(): string[] }
  for (const cookie of raw.getSetCookie?.() ?? []) {
    resHeaders.append('set-cookie', cookie)
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: resHeaders,
  })
}

type Ctx = { params: Promise<{ path: string[] }> }

const handler = (req: NextRequest, ctx: Ctx) =>
  ctx.params.then(({ path }) => proxy(req, path))

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
export const HEAD = handler
export const OPTIONS = handler
