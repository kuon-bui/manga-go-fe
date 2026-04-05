'use client'

import { useRef } from 'react'
import Image from 'next/image'

import { useScrollProgress } from '@/hooks/use-scroll-progress'
import { useImagePreloader } from '@/hooks/use-image-preloader'
import { useAuthStore } from '@/stores/auth-store'
import { useMangaViewerStore } from '@/stores/manga-viewer-store'

interface VerticalScrollViewProps {
  pages: string[]
  chapterId: string
}

export function VerticalScrollView({ pages, chapterId }: VerticalScrollViewProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const currentPage = useMangaViewerStore((s) => s.currentPage)

  const { observeElement } = useScrollProgress({
    chapterId,
    enabled: isAuthenticated,
  })

  // Preload ±2 pages around current
  useImagePreloader(pages, currentPage)

  return (
    <div className="flex flex-col items-center">
      {pages.map((src, i) => (
        <PageImage
          key={i}
          src={src}
          index={i}
          total={pages.length}
          observeElement={observeElement}
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
}

function PageImage({ src, index, total, observeElement }: PageImageProps) {
  const ref = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={(el) => {
        // Assign both local ref and observer
        ;(ref as React.MutableRefObject<HTMLDivElement | null>).current = el
        observeElement(el, index, total)
      }}
      className="relative w-full max-w-3xl"
    >
      <Image
        src={src}
        alt={`Page ${index + 1}`}
        width={800}
        height={1200}
        className="h-auto w-full select-none"
        loading={index < 3 ? 'eager' : 'lazy'}
        priority={index < 2}
      />
    </div>
  )
}
