'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, Columns2, BookOpen, AlignJustify,
  ChevronLeft, ChevronRight,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useMangaViewerStore, type ViewerMode } from '@/stores/manga-viewer-store'
import type { Chapter } from '@/types'

const MODE_OPTIONS: { value: ViewerMode; label: string; icon: React.ReactNode }[] = [
  { value: 'vertical', label: 'Scroll',  icon: <AlignJustify className="h-3.5 w-3.5" /> },
  { value: 'single',   label: 'Single',  icon: <BookOpen className="h-3.5 w-3.5" /> },
  { value: 'double',   label: 'Double',  icon: <Columns2 className="h-3.5 w-3.5" /> },
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
      {/* Tap centre to toggle controls */}
      <div
        className="absolute inset-0 z-10"
        onClick={() => setVisible((v) => !v)}
        aria-hidden
      />

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <header
        className={cn(
          'absolute left-0 right-0 top-0 z-20 flex h-12 items-center gap-2 bg-black/75 px-3 backdrop-blur-sm transition-opacity duration-200',
          visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Back */}
        <Button variant="ghost" size="icon" className="shrink-0 text-white hover:bg-white/10" asChild>
          <Link href={`/titles/${chapter.mangaId}`} aria-label="Back to title">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>

        {/* Title */}
        <span className="flex-1 truncate text-sm font-medium text-white">
          {chapter.title ?? `Chapter ${chapter.number}`}
        </span>

        {/* Page counter */}
        <span className="shrink-0 text-xs text-white/60">
          {currentPage + 1} / {totalPages}
        </span>

        {/* ── Mode switcher (no longer buried at the bottom) ── */}
        <div className="flex shrink-0 overflow-hidden rounded-lg border border-white/20">
          {MODE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setMode(opt.value)}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium transition-colors',
                mode === opt.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-white/60 hover:bg-white/10 hover:text-white'
              )}
              aria-pressed={mode === opt.value}
              aria-label={`${opt.label} view`}
            >
              {opt.icon}
              <span className="hidden sm:inline">{opt.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* ── Bottom bar ──────────────────────────────────────────────────────── */}
      <footer
        className={cn(
          'absolute bottom-0 left-0 right-0 z-20 flex items-center justify-between bg-black/75 px-4 py-2.5 backdrop-blur-sm transition-opacity duration-200',
          visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Prev chapter */}
        {chapter.prevChapter ? (
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-white/70 hover:bg-white/10 hover:text-white"
            asChild
          >
            <Link href={`/read/manga/${chapter.comicSlug}/${chapter.prevChapter.slug}`}>
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Chương trước</span>
            </Link>
          </Button>
        ) : (
          <div />
        )}

        {/* Progress dots (up to 15 dots) */}
        {totalPages <= 15 && (
          <div className="flex gap-1">
            {Array.from({ length: totalPages }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  'h-1.5 rounded-full transition-all',
                  i === currentPage ? 'w-3 bg-primary' : 'w-1.5 bg-white/30'
                )}
              />
            ))}
          </div>
        )}

        {/* Next chapter */}
        {chapter.nextChapter ? (
          <Button
            size="sm"
            className="gap-1"
            asChild
          >
            <Link href={`/read/manga/${chapter.comicSlug}/${chapter.nextChapter.slug}`}>
              <span className="hidden sm:inline">Chương sau</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <div />
        )}
      </footer>
    </>
  )
}
