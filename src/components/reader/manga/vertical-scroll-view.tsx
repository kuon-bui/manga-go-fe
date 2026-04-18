'use client'

import { useRef, useCallback } from 'react'
import { SafeImage as Image } from '@/components/ui/safe-image'

import { useScrollProgress } from '@/hooks/use-scroll-progress'
import { useImagePreloader } from '@/hooks/use-image-preloader'
import { useAuthStore } from '@/stores/auth-store'
import { useMangaViewerStore } from '@/stores/manga-viewer-store'
import { apiClient } from '@/lib/api-client'

interface VerticalScrollViewProps {
  pages: string[]
  comicSlug: string
  chapterSlug: string
}

export function VerticalScrollView({ pages, comicSlug, chapterSlug }: VerticalScrollViewProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const currentPage = useMangaViewerStore((s) => s.currentPage)
  const markedReadRef = useRef(false)

  const { observeElement } = useScrollProgress({
    comicSlug,
    chapterSlug,
    enabled: isAuthenticated,
  })

  // Preload ±2 pages around current
  useImagePreloader(pages, currentPage)

  // Called by PageImage when the last page enters the viewport
  const handleLastPageVisible = useCallback(() => {
    if (!isAuthenticated || markedReadRef.current) return
    markedReadRef.current = true
    apiClient.markChapterRead(comicSlug, chapterSlug).catch(() => undefined)
  }, [isAuthenticated, comicSlug, chapterSlug])

  return (
    <div className="flex flex-col items-center">
      {pages.map((src, i) => (
        <PageImage
          key={i}
          src={src}
          index={i}
          total={pages.length}
          observeElement={observeElement}
          onLastVisible={i === pages.length - 1 ? handleLastPageVisible : undefined}
        />
      ))}
    </div>
  )
}

// ─── Single page image ────────────────────────────────────────────────────────

interface PageImageProps {
  src: string
  index: number
  total: number
  observeElement: (_el: HTMLElement | null, _index: number, _total: number) => void
  onLastVisible?: () => void
}

function PageImage({ src, index, total, observeElement, onLastVisible }: PageImageProps) {
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={(el) => {
        // Assign both local ref and observer
        ;(ref as React.MutableRefObject<HTMLDivElement | null>).current = el
        observeElement(el, index, total)
        // For the last page: attach a one-shot IntersectionObserver that calls onLastVisible
        if (el && onLastVisible) {
          const obs = new IntersectionObserver(
            ([entry]) => {
              if (entry.isIntersecting) {
                onLastVisible()
                obs.disconnect()
              }
            },
            { threshold: 0.5 }
          )
          obs.observe(el)
        }
      }}
      className="relative w-full max-w-3xl"
    >
      <Image
        src={src}
        alt={`Page ${index + 1}`}
        width={800}
        height={1200}
        className="h-auto w-full select-none"
        unoptimized
        loading={index < 3 ? 'eager' : 'lazy'}
        priority={index < 2}
      />
    </div>
  )
}

