'use client'

import NextImage, { type ImageProps } from 'next/image'

function isLocalOrBlobSource(src: ImageProps['src']): boolean {
  if (typeof src !== 'string') return false

  if (src.startsWith('blob:') || src.startsWith('data:')) return true

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

export function SafeImage(props: ImageProps) {
  const { src, unoptimized, ...rest } = props

  return (
    <NextImage
      src={src}
      unoptimized={unoptimized ?? isLocalOrBlobSource(src)}
      {...rest}
    />
  )
}
