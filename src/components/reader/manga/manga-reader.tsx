'use client'

import { useEffect } from 'react'

import { VerticalScrollView } from '@/components/reader/manga/vertical-scroll-view'
import { SinglePageView } from '@/components/reader/manga/single-page-view'
import { DoublePageView } from '@/components/reader/manga/double-page-view'
import { MangaControls } from '@/components/reader/manga/manga-controls'
import { useChapter } from '@/hooks/use-chapter-data'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { useMangaViewerStore } from '@/stores/manga-viewer-store'

interface MangaReaderProps {
  comicSlug: string
  chapterSlug: string
}

export function MangaReader({ comicSlug, chapterSlug }: MangaReaderProps) {
  const { data: chapter, isLoading } = useChapter(comicSlug, chapterSlug)
  const { mode, currentPage, nextPage, prevPage, toggleSettings, reset } = useMangaViewerStore()

  // Reset page position when chapter changes
  useEffect(() => {
    reset()
  }, [comicSlug, chapterSlug, reset])

  useKeyboardShortcuts({
    onNext: () => chapter && nextPage(chapter.pages.length),
    onPrev: prevPage,
    onToggleSettings: toggleSettings,
  })

  if (isLoading || !chapter) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
      </div>
    )
  }

  const pages = chapter.pages

  return (
    <div className="relative min-h-screen bg-black">
      {/* Controls overlay */}
      <MangaControls chapter={chapter} />

      {/* Viewer */}
      {mode === 'vertical' && (
        <VerticalScrollView pages={pages} comicSlug={comicSlug} chapterSlug={chapterSlug} />
      )}
      {mode === 'single' && (
        <SinglePageView
          pages={pages}
          currentPage={currentPage}
          onNext={() => nextPage(pages.length)}
          onPrev={prevPage}
        />
      )}
      {mode === 'double' && (
        <DoublePageView
          pages={pages}
          currentPage={currentPage}
          onNext={() => nextPage(pages.length)}
          onPrev={prevPage}
        />
      )}
    </div>
  )
}
