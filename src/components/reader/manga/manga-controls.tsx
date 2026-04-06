'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Columns2, BookOpen, AlignJustify, Settings } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useMangaViewerStore, type ViewerMode } from '@/stores/manga-viewer-store'
import type { Chapter } from '@/types'

const MODE_OPTIONS: { value: ViewerMode; label: string; icon: React.ReactNode }[] = [
  { value: 'vertical', label: 'Scroll',  icon: <AlignJustify className="h-4 w-4" /> },
  { value: 'single',   label: 'Single',  icon: <BookOpen className="h-4 w-4" /> },
  { value: 'double',   label: 'Double',  icon: <Columns2 className="h-4 w-4" /> },
]

interface MangaControlsProps {
  chapter: Chapter
}

export function MangaControls({ chapter }: MangaControlsProps) {
  const [visible, setVisible] = useState(true)
  const { mode, currentPage, setMode } = useMangaViewerStore()

  const totalPages = chapter.pages.length

  return (
    <>
      {/* Tap-to-toggle overlay (centre tap) */}
      <div
        className="absolute inset-0 z-10"
        onClick={() => setVisible((v) => !v)}
        aria-hidden
      />

      {/* Top bar */}
      <header
        className={cn(
          'absolute left-0 right-0 top-0 z-20 flex h-12 items-center justify-between bg-black/70 px-4 backdrop-blur-sm transition-opacity duration-200',
          visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" asChild>
          <Link href={`/titles/${chapter.mangaId}`} aria-label="Back to title">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>

        <span className="text-sm font-medium text-white">
          {chapter.title ?? `Chapter ${chapter.number}`}
        </span>

        <Button
          variant="ghost"
          size="icon"
          className="text-white hover:bg-white/10"
          aria-label="Reader settings"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </header>

      {/* Bottom bar */}
      <footer
        className={cn(
          'absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between gap-4 bg-black/70 px-4 py-3 backdrop-blur-sm transition-opacity duration-200',
          visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Page indicator */}
        <span className="text-sm text-white/80">
          {currentPage + 1} / {totalPages}
        </span>

        {/* Mode switcher */}
        <div className="flex rounded-lg border border-white/20 overflow-hidden">
          {MODE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setMode(opt.value)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors',
                mode === opt.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              )}
              aria-pressed={mode === opt.value}
              aria-label={`${opt.label} view`}
            >
              {opt.icon}
              <span className="hidden sm:inline">{opt.label}</span>
            </button>
          ))}
        </div>

        {/* Chapter nav */}
        <div className="flex items-center gap-2">
          {chapter.prevChapter && (
            <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10" asChild>
              <Link href={`/read/manga/${chapter.comicSlug}/${chapter.prevChapter.slug}`}>Prev</Link>
            </Button>
          )}
          {chapter.nextChapter && (
            <Button size="sm" asChild>
              <Link href={`/read/manga/${chapter.comicSlug}/${chapter.nextChapter.slug}`}>Next</Link>
            </Button>
          )}
        </div>
      </footer>
    </>
  )
}
