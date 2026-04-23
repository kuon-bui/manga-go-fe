'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { NovelSettingsPanel } from '@/components/reader/novel/novel-settings-panel'
import { NovelNavBar } from '@/components/reader/novel/novel-nav-bar'
import { useChapter } from '@/hooks/use-chapter-data'
import { useScrollProgress } from '@/hooks/use-scroll-progress'
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import { useNovelReaderStore } from '@/stores/novel-reader-store'
import { useAuthStore } from '@/stores/auth-store'

// ─── CSS custom properties map ────────────────────────────────────────────────

const THEME_VARS = {
  day:   { '--reader-bg': '#FFFAFB', '--reader-text': '#4B2A36', '--reader-surface': '#FBECF2' },
  night: { '--reader-bg': '#1F141D', '--reader-text': '#F7E7EE', '--reader-surface': '#2E1E2C' },
  sepia: { '--reader-bg': '#f4ecd8', '--reader-text': '#3b2a1a', '--reader-surface': '#ede0c8' },
} as const

const FONT_FAMILY_MAP = {
  serif: '"Georgia", "Times New Roman", serif',
  sans:  '"Inter", "Helvetica Neue", sans-serif',
  mono:  '"Fira Code", "Courier New", monospace',
}

// ─── Component ────────────────────────────────────────────────────────────────

interface NovelReaderProps {
  comicSlug: string
  chapterSlug: string
}

export function NovelReader({ comicSlug, chapterSlug }: NovelReaderProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const { data: chapter, isLoading } = useChapter(comicSlug, chapterSlug)

  const {
    theme,
    fontFamily,
    fontSize,
    lineHeight,
    textWidth,
    settingsOpen,
    toggleSettings,
  } = useNovelReaderStore()

  const { observeElement } = useScrollProgress({
    comicSlug,
    chapterSlug,
    enabled: isAuthenticated,
  })

  // Keyboard shortcuts
  useKeyboardShortcuts({ onToggleSettings: toggleSettings })

  // Apply theme class to <html> so full viewport is themed
  useEffect(() => {
    document.documentElement.setAttribute('data-novel-theme', theme)
    return () => document.documentElement.removeAttribute('data-novel-theme')
  }, [theme])

  if (isLoading || !chapter) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: 'var(--reader-bg, #fff)' }}>
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const themeVars = THEME_VARS[theme]

  return (
    <div
      className="reader-root min-h-screen transition-colors duration-200"
      data-theme={theme}
      style={{
        ...themeVars,
        background: 'var(--reader-bg)',
        color: 'var(--reader-text)',
      } as React.CSSProperties}
    >
      {/* Top nav bar */}
      <NovelNavBar
        chapter={chapter}
        onToggleSettings={toggleSettings}
        settingsOpen={settingsOpen}
      />

      {/* Settings panel — slides in from right */}
      {settingsOpen && (
        <NovelSettingsPanel onClose={toggleSettings} />
      )}

      {/* Content */}
      <main
        className="mx-auto px-4 py-10"
        style={{
          maxWidth: `${textWidth}ch`,
          fontFamily: FONT_FAMILY_MAP[fontFamily],
          fontSize: `${fontSize}px`,
          lineHeight,
        }}
      >
        {/* Chapter title */}
        <h1 className="mb-8 text-2xl font-bold" style={{ color: 'var(--reader-text)' }}>
          {chapter.title ?? `Chapter ${chapter.number}`}
        </h1>

        {/* Chapter content — rendered HTML from backend */}
        <article
          ref={(el) => observeElement(el, 0, 1)}
          className="prose-novel"
          dangerouslySetInnerHTML={{ __html: chapter.content ?? '' }}
        />

        {/* Chapter navigation */}
        <nav className="mt-12 flex items-center justify-between border-t pt-6" style={{ borderColor: 'var(--reader-text)', opacity: 0.2 }}>
          <div style={{ opacity: 1 }}>
            {chapter.prevChapter ? (
              <Button variant="outline" asChild>
                <Link href={`/read/novel/${chapter.comicSlug}/${chapter.prevChapter.slug}`}>
                  <ChevronLeft className="h-4 w-4" />
                  Previous Chapter
                </Link>
              </Button>
            ) : (
              <span />
            )}
          </div>
          <div>
            {chapter.nextChapter ? (
              <Button asChild>
                <Link href={`/read/novel/${chapter.comicSlug}/${chapter.nextChapter.slug}`}>
                  Next Chapter
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <span className="text-sm" style={{ color: 'var(--reader-text)' }}>End of title</span>
            )}
          </div>
        </nav>
      </main>
    </div>
  )
}
