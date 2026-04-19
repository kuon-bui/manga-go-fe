'use client'

import NextImage, { type ImageProps } from 'next/image'

function isLocalOrBlobSource(src: ImageProps['src']): boolean {
  if (typeof src !== 'string') return false
  if (!src.trim()) return false

  if (src.startsWith('blob:') || src.startsWith('data:')) return true

  // Proxy paths must be unoptimized — the image optimizer makes cookie-less requests
  if (src.startsWith('/api/proxy/')) return true

  // Other relative paths use normal optimization flow
  if (src.startsWith('/')) return false

  try {
    const url = new URL(src)
    const host = url.hostname

    if (host === 'localhost' || host === '127.0.0.1' || host === '0.0.0.0') {
      return true
    }

    // Common private network ranges used by local backends
    if (
      host.startsWith('192.168.') ||
      host.startsWith('10.') ||
      host.startsWith('172.16.') ||
      host.startsWith('172.17.') ||
      host.startsWith('172.18.') ||
      host.startsWith('172.19.') ||
      host.startsWith('172.20.') ||
      host.startsWith('172.21.') ||
      host.startsWith('172.22.') ||
      host.startsWith('172.23.') ||
      host.startsWith('172.24.') ||
      host.startsWith('172.25.') ||
      host.startsWith('172.26.') ||
      host.startsWith('172.27.') ||
      host.startsWith('172.28.') ||
      host.startsWith('172.29.') ||
      host.startsWith('172.30.') ||
      host.startsWith('172.31.')
    ) {
      return true
    }
  } catch {
    // Non-URL values (relative paths) should use normal optimization flow.
  }

  return false
}

function resolveBackendUrl(src: ImageProps['src']): ImageProps['src'] {
  if (typeof src !== 'string') return src
  if (src.startsWith('blob:') || src.startsWith('data:')) return src
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:8080'
  if (src.startsWith(backendUrl)) return src.replace(backendUrl, '/api/proxy')
  // Backend content paths (e.g. /files/content/...) must be proxied
  if (src.startsWith('/files/')) return `/api/proxy${src}`
  // Bare relative paths without leading slash (e.g. "comics/slug/cover/...")
  if (!src.startsWith('/') && !src.startsWith('http')) return `/api/proxy/${src}`
  return src
}

export function SafeImage(props: ImageProps) {
  const { src, unoptimized, ...rest } = props

  if (!src || (typeof src === 'string' && !src.trim())) {
    return null
  }

  const resolvedSrc = resolveBackendUrl(src)

  return (
    <NextImage
      src={resolvedSrc}
      unoptimized={unoptimized ?? isLocalOrBlobSource(resolvedSrc)}
      {...rest}
    />
  )
}
