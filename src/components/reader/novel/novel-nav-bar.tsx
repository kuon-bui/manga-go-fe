'use client'

import Link from 'next/link'
import { ArrowLeft, Settings } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { Chapter } from '@/types'

interface NovelNavBarProps {
  chapter: Chapter
  settingsOpen: boolean
  onToggleSettings: () => void
}

export function NovelNavBar({ chapter, settingsOpen, onToggleSettings }: NovelNavBarProps) {
  return (
    <header
      className="sticky top-0 z-40 flex h-12 items-center justify-between px-4 backdrop-blur-sm"
      style={{ background: 'var(--reader-surface)', borderBottom: '1px solid color-mix(in srgb, var(--reader-text) 10%, transparent)' }}
    >
      {/* Back to title */}
      <Button variant="ghost" size="icon" asChild aria-label="Back to title">
        <Link href={`/titles/${chapter.mangaId}`}>
          <ArrowLeft className="h-4 w-4" />
        </Link>
      </Button>

      {/* Chapter label */}
      <span className="text-sm font-medium" style={{ color: 'var(--reader-text)' }}>
        {chapter.title ?? `Chapter ${chapter.number}`}
      </span>

      {/* Settings toggle */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggleSettings}
        aria-label="Toggle reading settings"
        aria-expanded={settingsOpen}
      >
        <Settings className="h-4 w-4" />
      </Button>
    </header>
  )
}
