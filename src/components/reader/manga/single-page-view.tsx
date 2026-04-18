'use client'

import { useEffect, useRef } from 'react'
import { SafeImage as Image } from '@/components/ui/safe-image'

import { useImagePreloader } from '@/hooks/use-image-preloader'
import { useAuthStore } from '@/stores/auth-store'
import { apiClient } from '@/lib/api-client'

interface SinglePageViewProps {
  pages: string[]
  currentPage: number
  comicSlug: string
  chapterSlug: string
}

export function SinglePageView({
  pages,
  currentPage,
  comicSlug,
  chapterSlug,
}: SinglePageViewProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const markedReadRef = useRef(false)

  useImagePreloader(pages, currentPage)

  // Mark chapter as read when user reaches the last page
  useEffect(() => {
    if (!isAuthenticated || markedReadRef.current) return
    if (currentPage === pages.length - 1 && pages.length > 0) {
      markedReadRef.current = true
      apiClient.markChapterRead(comicSlug, chapterSlug).catch(() => undefined)
    }
  }, [currentPage, pages.length, isAuthenticated, comicSlug, chapterSlug])

  const src = pages[currentPage]
  if (!src) return null

  return (
    <div className="relative flex min-h-screen items-center justify-center">
      {/* Page image */}
      <div className="relative max-h-screen max-w-3xl">
        <Image
          src={src}
          alt={`Page ${currentPage + 1}`}
          width={800}
          height={1200}
          className="max-h-screen w-auto select-none object-contain"
          unoptimized
          priority
        />
      </div>

    </div>
  )
}
