'use client'

import { useEffect, useRef } from 'react'
import { SafeImage as Image } from '@/components/ui/safe-image'

import { useImagePreloader } from '@/hooks/use-image-preloader'
import { useAuthStore } from '@/stores/auth-store'
import { apiClient } from '@/lib/api-client'

interface DoublePageViewProps {
  pages: string[]
  currentPage: number
  comicSlug: string
  chapterSlug: string
}

export function DoublePageView({ pages, currentPage, comicSlug, chapterSlug }: DoublePageViewProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const markedReadRef = useRef(false)

  useImagePreloader(pages, currentPage, 3)

  // Mark chapter as read when user reaches the last page or the second to last page
  useEffect(() => {
    if (!isAuthenticated || markedReadRef.current) return
    if (currentPage >= pages.length - 2 && pages.length > 0) {
      markedReadRef.current = true
      apiClient.markChapterRead(comicSlug, chapterSlug).catch(() => undefined)
    }
  }, [currentPage, pages.length, isAuthenticated, comicSlug, chapterSlug])

  const leftSrc = pages[currentPage]
  const rightSrc = pages[currentPage + 1]

  return (
    <div className="relative flex min-h-screen items-center justify-center gap-0.5">
      {/* Left page */}
      {leftSrc && (
        <div className="relative flex max-h-screen flex-1 justify-end">
          <Image
            src={leftSrc}
            alt={`Page ${currentPage + 1}`}
            width={600}
            height={900}
            className="max-h-screen w-auto select-none object-contain"
            unoptimized
            priority
          />
        </div>
      )}

      {/* Right page */}
      {rightSrc ? (
        <div className="relative flex max-h-screen flex-1">
          <Image
            src={rightSrc}
            alt={`Page ${currentPage + 2}`}
            width={600}
            height={900}
            className="max-h-screen w-auto select-none object-contain"
            unoptimized
            priority
          />
        </div>
      ) : (
        // Blank right side for odd last page
        <div className="flex-1" />
      )}

    </div>
  )
}
