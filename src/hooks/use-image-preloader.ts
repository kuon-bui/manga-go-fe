'use client'

import { useEffect } from 'react'

/**
 * Preloads images at currentPage ± range using <link rel="preload">.
 * Injects link tags into <head> and removes them on cleanup.
 */
export function useImagePreloader(pages: string[], currentPage: number, range = 2) {
  useEffect(() => {
    if (!pages.length) return

    const start = Math.max(0, currentPage - range)
    const end = Math.min(pages.length - 1, currentPage + range)

    const links: HTMLLinkElement[] = []

    for (let i = start; i <= end; i++) {
      const url = pages[i]
      if (!url) continue

      // Skip if already preloaded
      if (document.querySelector(`link[rel="preload"][href="${url}"]`)) continue

      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = url
      document.head.appendChild(link)
      links.push(link)
    }

    return () => {
      links.forEach((link) => {
        if (link.parentNode === document.head) {
          document.head.removeChild(link)
        }
      })
    }
  }, [pages, currentPage, range])
}
