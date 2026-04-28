'use client'

import { useCallback } from 'react'
import Link from 'next/link'
import {
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown,
  Settings2, Maximize2, BookOpen, Moon, Sun, Bookmark,
  MessageCircle, Columns2, AlignJustify, Sparkles,
} from 'lucide-react'
import { useTheme } from 'next-themes'

import { SafeImage as Image } from '@/components/ui/safe-image'
import { cn } from '@/lib/utils'
import { useMangaViewerStore, type ViewerMode } from '@/stores/manga-viewer-store'
import { TOCDrawer } from './toc-drawer'
import { CommentsDrawer } from './comments-drawer'
import type { Chapter } from '@/types'

// ─── Mode switcher pills ──────────────────────────────────────────────────────

const PAGE_MODES: { value: ViewerMode; icon: React.ReactNode; label: string }[] = [
  { value: 'single', icon: <BookOpen className="h-3.5 w-3.5" />,    label: 'Đơn' },
  { value: 'double', icon: <Columns2 className="h-3.5 w-3.5" />,    label: 'Đôi' },
  { value: 'vertical', icon: <AlignJustify className="h-3.5 w-3.5" />, label: 'Cuộn' },
]

// ─── Kawaii top bar ───────────────────────────────────────────────────────────

function TopBar({ chapter }: { chapter: Chapter }) {
  const { mode, uiMode, currentPage, setMode, setUiMode } = useMangaViewerStore()
  const totalPages = chapter.pages.length
  const progress = totalPages > 0 ? ((currentPage + 1) / totalPages) * 100 : 0

  return (
    <div className="sticky top-0 z-30 cute-card rounded-none border-x-0 border-t-0">
      <div className="mx-auto max-w-7xl px-3 md:px-6 h-12 flex items-center gap-2 text-sm">

        {/* Back */}
        <Link
          href={`/titles/${chapter.comicSlug}`}
          className="p-1.5 rounded-full hover:bg-secondary/60 transition-colors shrink-0"
          aria-label="Quay lại"
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>

        {/* Title + counter */}
        <div className="min-w-0 flex-1">
          <p className="truncate font-display font-bold text-sm leading-tight">
            {chapter.title ?? `Chương ${chapter.number}`}
          </p>
          {mode !== 'vertical' && (
            <p className="text-[10px] text-muted-foreground">
              {currentPage + 1} / {totalPages}
            </p>
          )}
        </div>

        {/* Progress bar */}
        {mode !== 'vertical' && (
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground">Tiến độ</span>
            <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-mint to-success transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* TOC */}
        <TOCDrawer chapter={chapter} />

        {/* Comments */}
        {mode !== 'vertical' && chapter.mangaId && (
          <CommentsDrawer chapterId={chapter.id} />
        )}

        {/* Mode pills */}
        <div className="flex items-center gap-0.5 bg-muted rounded-full p-0.5">
          {PAGE_MODES.map((m) => (
            <button
              key={m.value}
              onClick={() => setMode(m.value)}
              aria-pressed={mode === m.value}
              aria-label={m.label}
              className={cn(
                'flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold transition-all',
                mode === m.value
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {m.icon}
              <span className="hidden sm:inline">{m.label}</span>
            </button>
          ))}
        </div>

        {/* Maximize */}
        <button
          onClick={() => document.documentElement.requestFullscreen?.()}
          className="p-1.5 rounded-full hover:bg-secondary/60 transition-colors shrink-0"
          title="Toàn màn hình"
        >
          <Maximize2 className="h-4 w-4" />
        </button>

        {/* UI toggle — switch back to Classic */}
        <button
          onClick={() => setUiMode(uiMode === 'kawaii' ? 'classic' : 'kawaii')}
          className="hidden sm:flex items-center gap-1 cute-pill bg-secondary text-secondary-foreground hover:bg-accent transition-colors text-[10px] shrink-0"
          title="Chuyển UI"
        >
          <Settings2 className="h-3.5 w-3.5" />
          Classic
        </button>
      </div>
    </div>
  )
}

// ─── Left page-picker sidebar ─────────────────────────────────────────────────

function PagePickerSidebar({
  pages,
  currentPage,
  onSelect,
}: {
  pages: string[]
  currentPage: number
  onSelect: (_idx: number) => void
}) {
  const VISIBLE = 6

  const visibleStart = Math.max(0, Math.min(currentPage - 2, pages.length - VISIBLE))
  const visiblePages = pages.slice(visibleStart, visibleStart + VISIBLE)

  return (
    <aside className="hidden md:flex flex-col items-center gap-1.5 cute-card p-2 h-fit sticky top-[3.5rem]">
      <button
        onClick={() => onSelect(Math.max(0, currentPage - 1))}
        className="p-1 rounded-full hover:bg-secondary/60 transition-colors"
        aria-label="Trang trước"
      >
        <ChevronUp className="h-4 w-4" />
      </button>

      {visiblePages.map((_, i) => {
        const idx = visibleStart + i
        return (
          <button
            key={idx}
            onClick={() => onSelect(idx)}
            className={cn(
              'w-11 py-1.5 rounded-xl text-xs font-bold transition-all',
              idx === currentPage
                ? 'bg-primary text-primary-foreground shadow-soft'
                : 'bg-secondary/60 text-muted-foreground hover:bg-secondary'
            )}
          >
            {idx + 1}
          </button>
        )
      })}

      <button
        onClick={() => onSelect(Math.min(pages.length - 1, currentPage + 1))}
        className="p-1 rounded-full hover:bg-secondary/60 transition-colors"
        aria-label="Trang sau"
      >
        <ChevronDown className="h-4 w-4" />
      </button>

      <div className="mt-1 text-[9px] text-muted-foreground font-semibold">
        {currentPage + 1}/{pages.length}
      </div>
    </aside>
  )
}

// ─── Right toolbox sidebar ────────────────────────────────────────────────────

function ToolboxSidebar() {
  const { theme, setTheme } = useTheme()

  return (
    <aside className="hidden md:flex flex-col items-center gap-1.5 cute-card p-2 h-fit sticky top-[3.5rem]">
      <button
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        className="p-2 rounded-full hover:bg-secondary/60 transition-colors"
        title={theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}
      >
        {theme === 'dark'
          ? <Sun className="h-4 w-4" />
          : <Moon className="h-4 w-4" />
        }
      </button>

      <div className="w-full h-px bg-border" />

      <button
        className="p-2 rounded-full hover:bg-secondary/60 transition-colors"
        title="Đánh dấu"
      >
        <Bookmark className="h-4 w-4" />
      </button>

      <button
        className="p-2 rounded-full hover:bg-secondary/60 transition-colors"
        title="Bình luận"
      >
        <MessageCircle className="h-4 w-4" />
      </button>

      <div className="flex-1" />

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="p-2 rounded-full bg-primary text-primary-foreground shadow-soft"
        title="Về đầu trang"
      >
        <ChevronUp className="h-4 w-4" />
      </button>
    </aside>
  )
}

// ─── Single-page center ───────────────────────────────────────────────────────

function PageCenter({
  chapter,
  currentPage,
  onPrev,
  onNext,
}: {
  chapter: Chapter
  currentPage: number
  onPrev: () => void
  onNext: () => void
}) {
  const src = chapter.pages[currentPage]
  if (!src) return null

  return (
    <div className="cute-card relative overflow-hidden bg-foreground/5 min-h-[60vh] flex items-center justify-center">
      <Image
        src={src}
        alt={`Trang ${currentPage + 1}`}
        width={800}
        height={1200}
        className="w-full h-auto object-contain max-h-[80vh] mx-auto select-none"
        unoptimized
        priority
      />

      {/* Left arrow */}
      <button
        onClick={onPrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-card/80 backdrop-blur hover:bg-card border border-border/50 transition-colors"
        aria-label="Trang trước"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>

      {/* Right arrow */}
      <button
        onClick={onNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-card/80 backdrop-blur hover:bg-card border border-border/50 transition-colors"
        aria-label="Trang sau"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}

// ─── Double-page center ───────────────────────────────────────────────────────

function DoublPageCenter({
  chapter,
  currentPage,
  onPrev,
  onNext,
}: {
  chapter: Chapter
  currentPage: number
  onPrev: () => void
  onNext: () => void
}) {
  const leftSrc  = chapter.pages[currentPage]
  const rightSrc = chapter.pages[currentPage + 1]

  return (
    <div className="cute-card relative overflow-hidden bg-foreground/5 min-h-[60vh] flex items-center justify-center gap-0.5">
      {leftSrc && (
        <Image
          src={leftSrc}
          alt={`Trang ${currentPage + 1}`}
          width={600}
          height={900}
          className="flex-1 max-h-[80vh] w-auto object-contain select-none"
          unoptimized
          priority
        />
      )}
      {rightSrc && (
        <Image
          src={rightSrc}
          alt={`Trang ${currentPage + 2}`}
          width={600}
          height={900}
          className="flex-1 max-h-[80vh] w-auto object-contain select-none"
          unoptimized
        />
      )}

      <button
        onClick={onPrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-card/80 backdrop-blur hover:bg-card border border-border/50 transition-colors"
        aria-label="Trang trước"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={onNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-card/80 backdrop-blur hover:bg-card border border-border/50 transition-colors"
        aria-label="Trang sau"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}

// ─── Vertical scroll (simplified kawaii wrapper) ──────────────────────────────

function VerticalCenter({ pages }: { pages: string[] }) {
  return (
    <div className="cute-card overflow-hidden">
      {pages.map((src, i) => (
        <div key={i} className="w-full">
          <Image
            src={src}
            alt={`Trang ${i + 1}`}
            width={800}
            height={1200}
            className="w-full h-auto object-contain select-none"
            unoptimized
            loading={i < 3 ? 'eager' : 'lazy'}
            priority={i < 2}
          />
        </div>
      ))}
    </div>
  )
}

// ─── Chapter nav footer ───────────────────────────────────────────────────────

function ChapterNav({ chapter }: { chapter: Chapter }) {
  return (
    <div className="flex items-center justify-between gap-3 pb-10 pt-2">
      {chapter.prevChapter ? (
        <Link
          href={`/read/manga/${chapter.comicSlug}/${chapter.prevChapter.slug}`}
          className="rounded-full bg-secondary px-4 py-2 text-sm font-semibold hover:bg-accent transition-colors"
        >
          ← Ch {chapter.prevChapter.slug}
        </Link>
      ) : <span />}

      <Link
        href={`/titles/${chapter.comicSlug}`}
        className="rounded-full bg-card/70 px-4 py-2 text-sm font-semibold border border-border hover:bg-secondary/60 transition-colors"
      >
        Danh sách chương
      </Link>

      {chapter.nextChapter ? (
        <Link
          href={`/read/manga/${chapter.comicSlug}/${chapter.nextChapter.slug}`}
          className="rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          Ch {chapter.nextChapter.slug} →
        </Link>
      ) : <span />}
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function KawaiiReader({ chapter }: { chapter: Chapter }) {
  const { mode, currentPage, nextPage, prevPage, setCurrentPage } = useMangaViewerStore()

  const handlePrev = useCallback(() => prevPage(), [prevPage])
  const handleNext = useCallback(() => nextPage(chapter.pages.length), [nextPage, chapter.pages.length])

  return (
    <div className="min-h-screen">
      <TopBar chapter={chapter} />

      <div className="mx-auto max-w-7xl px-3 md:px-6 py-4">
        {/* Kawaii banner */}
        <div className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="font-display font-semibold">Kawaii Reader</span>
        </div>

        {mode === 'vertical' ? (
          /* Vertical — no sidebars needed */
          <VerticalCenter pages={chapter.pages} />
        ) : (
          /* Single / Double — 3-col layout */
          <div className="grid grid-cols-[56px_1fr_56px] md:grid-cols-[68px_1fr_68px] gap-3">
            <PagePickerSidebar
              pages={chapter.pages}
              currentPage={currentPage}
              onSelect={setCurrentPage}
            />

            {mode === 'double' ? (
              <DoublPageCenter
                chapter={chapter}
                currentPage={currentPage}
                onPrev={handlePrev}
                onNext={handleNext}
              />
            ) : (
              <PageCenter
                chapter={chapter}
                currentPage={currentPage}
                onPrev={handlePrev}
                onNext={handleNext}
              />
            )}

            <ToolboxSidebar />
          </div>
        )}

        <div className="mt-4">
          <ChapterNav chapter={chapter} />
        </div>
      </div>
    </div>
  )
}
