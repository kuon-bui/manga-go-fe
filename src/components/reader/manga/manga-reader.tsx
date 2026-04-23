'use client'

import { useEffect } from 'react'

import dynamic from 'next/dynamic'

const VerticalScrollView = dynamic(
  () => import('@/components/reader/manga/vertical-scroll-view').then((mod) => mod.VerticalScrollView),
  { loading: () => <div className="h-screen w-full flex items-center justify-center animate-pulse bg-background" /> }
)
const SinglePageView = dynamic(
  () => import('@/components/reader/manga/single-page-view').then((mod) => mod.SinglePageView),
  { loading: () => <div className="h-screen w-full flex items-center justify-center animate-pulse bg-background" /> }
)
const DoublePageView = dynamic(
  () => import('@/components/reader/manga/double-page-view').then((mod) => mod.DoublePageView),
  { loading: () => <div className="h-screen w-full flex items-center justify-center animate-pulse bg-background" /> }
)
import { MangaControls } from '@/components/reader/manga/manga-controls'
import { useChapter } from '@/hooks/use-chapter-data'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { useCreateReadingHistory } from '@/hooks/use-reading-history'
import { useMangaViewerStore } from '@/stores/manga-viewer-store'
import { useAuthStore } from '@/stores/auth-store'

interface MangaReaderProps {
  comicSlug: string
  chapterSlug: string
}

export function MangaReader({ comicSlug, chapterSlug }: MangaReaderProps) {
  const { data: chapter, isLoading } = useChapter(comicSlug, chapterSlug)
  const { mode, currentPage, nextPage, prevPage, toggleSettings, toggleControls, reset } =
    useMangaViewerStore()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const createHistoryMutation = useCreateReadingHistory()

  useEffect(() => {
    reset()
  }, [comicSlug, chapterSlug, reset])

  useEffect(() => {
    if (!isAuthenticated || !chapter?.mangaId || !chapter?.id) return
    createHistoryMutation.mutate({ comicId: chapter.mangaId, chapterId: chapter.id })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapter?.id, isAuthenticated])

  useKeyboardShortcuts({
    onNext: () => chapter && nextPage(chapter.pages.length),
    onPrev: prevPage,
    onToggleSettings: toggleSettings,
  })

  if (isLoading || !chapter) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const handleContainerClick = (e: React.MouseEvent) => {
    if (
      (e.target as HTMLElement).closest(
        'button, a, input, textarea, [role="button"], svg, path, .stop-propagation'
      )
    ) {
      return
    }

    if (mode === 'vertical') {
      toggleControls()
      return
    }

    const x = e.clientX
    const width = window.innerWidth
    if (x < width * 0.25) {
      prevPage()
    } else if (x > width * 0.75) {
      if (chapter) nextPage(chapter.pages.length)
    } else {
      toggleControls()
    }
  }

  const pages = chapter.pages

  return (
    <div className="relative min-h-screen bg-background" onClick={handleContainerClick}>
      <MangaControls chapter={chapter} />

      {mode === 'vertical' && (
        <VerticalScrollView
          pages={pages}
          comicSlug={comicSlug}
          chapterSlug={chapterSlug}
          chapterId={chapter.id}
          mangaId={chapter.mangaId}
        />
      )}
      {mode === 'single' && (
        <SinglePageView
          pages={pages}
          currentPage={currentPage}
          comicSlug={comicSlug}
          chapterSlug={chapterSlug}
          chapterId={chapter.id}
          mangaId={chapter.mangaId}
        />
      )}
      {mode === 'double' && (
        <DoublePageView
          pages={pages}
          currentPage={currentPage}
          comicSlug={comicSlug}
          chapterSlug={chapterSlug}
          chapterId={chapter.id}
          mangaId={chapter.mangaId}
        />
      )}
    </div>
  )
}
