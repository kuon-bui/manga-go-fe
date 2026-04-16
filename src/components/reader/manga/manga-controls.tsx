'use client'

import { useState, useCallback } from 'react'
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
  { value: 'vertical', label: 'Cuộn', icon: <AlignJustify className="h-3.5 w-3.5" /> },
  { value: 'single',   label: 'Đơn',  icon: <BookOpen className="h-3.5 w-3.5" /> },
  { value: 'double',   label: 'Đôi',  icon: <Columns2 className="h-3.5 w-3.5" /> },
]

interface MangaControlsProps {
  chapter: Chapter
}

export function MangaControls({ chapter }: MangaControlsProps) {
  const [visible, setVisible] = useState(true)
  const { mode, currentPage, setMode, setCurrentPage, nextPage, prevPage } = useMangaViewerStore()
  const totalPages = chapter.pages.length

  const toggle = useCallback(() => setVisible((v) => !v), [])
  const handleNext = useCallback(() => nextPage(totalPages), [nextPage, totalPages])
  const handlePrev = useCallback(() => prevPage(), [prevPage])

  return (
    <>
      {/* ── Tap zones: 25% PREV / 50% TOGGLE / 25% NEXT ─────────────────────── */}
      {/* Only active in single/double page modes — vertical scroll uses natural scroll */}
      {mode !== 'vertical' && (
        <div className="absolute inset-0 z-10 flex select-none">
          {/* Left 25% → prev page */}
          <div
            className="w-1/4 cursor-pointer"
            onClick={handlePrev}
            aria-label="Trang trước"
          />
          {/* Centre 50% → toggle UI */}
          <div
            className="flex-1 cursor-pointer"
            onClick={toggle}
            aria-label="Bật/tắt giao diện"
          />
          {/* Right 25% → next page */}
          <div
            className="w-1/4 cursor-pointer"
            onClick={handleNext}
            aria-label="Trang sau"
          />
        </div>
      )}

      {/* Vertical mode: tapping anywhere toggles UI */}
      {mode === 'vertical' && (
        <div
          className="absolute inset-0 z-10 cursor-pointer"
          onClick={toggle}
          aria-label="Bật/tắt giao diện"
        />
      )}

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <header
        className={cn(
          'absolute left-0 right-0 top-0 z-20 flex h-14 items-center gap-2 bg-black/80 px-3 backdrop-blur-md transition-transform duration-200',
          visible ? 'translate-y-0' : '-translate-y-full'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Back */}
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 text-white/80 hover:bg-white/10 hover:text-white"
          asChild
        >
          <Link href={`/titles/${chapter.mangaId}`} aria-label="Quay lại">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>

        {/* Title + page counter */}
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-semibold text-white">
            {chapter.title ?? `Chương ${chapter.number}`}
          </span>
          {mode !== 'vertical' && (
            <span className="text-[11px] text-white/50">
              {currentPage + 1} / {totalPages}
            </span>
          )}
        </div>

        {/* Mode switcher */}
        <div className="flex shrink-0 overflow-hidden rounded-lg border border-white/15">
          {MODE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setMode(opt.value)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium transition-colors',
                mode === opt.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-white/50 hover:bg-white/10 hover:text-white'
              )}
              aria-pressed={mode === opt.value}
              aria-label={`Chế độ ${opt.label}`}
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
          'absolute bottom-0 left-0 right-0 z-20 bg-black/80 px-4 pb-4 pt-2 backdrop-blur-md transition-transform duration-200',
          visible ? 'translate-y-0' : 'translate-y-full'
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress slider — replaces dot indicators for all page counts */}
        {mode !== 'vertical' && totalPages > 1 && (
          <div className="mb-3 flex items-center gap-3">
            <span className="shrink-0 text-[11px] text-white/50">1</span>
            <input
              type="range"
              min={0}
              max={totalPages - 1}
              value={currentPage}
              onChange={(e) => setCurrentPage(Number(e.target.value))}
              className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-white/20 accent-primary"
              aria-label="Thanh tiến độ trang"
            />
            <span className="shrink-0 text-[11px] text-white/50">{totalPages}</span>
          </div>
        )}

        {/* Chapter navigation */}
        <div className="flex items-center justify-between">
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

          {/* Current chapter info */}
          <span className="text-xs font-medium text-white/60">
            Chương {chapter.number}
          </span>

          {chapter.nextChapter ? (
            <Button size="sm" className="gap-1" asChild>
              <Link href={`/read/manga/${chapter.comicSlug}/${chapter.nextChapter.slug}`}>
                <span className="hidden sm:inline">Chương sau</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <div />
          )}
        </div>
      </footer>
    </>
  )
}
