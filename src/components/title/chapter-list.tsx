'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Clock } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { ChapterSummary, ContentType } from '@/types'

const ROW_HEIGHT = 56 // px — each chapter row

interface ChapterListProps {
  chapters: ChapterSummary[]
  isLoading: boolean
  comicSlug: string
  contentType: ContentType
}

export function ChapterList({ chapters, isLoading, comicSlug, contentType }: ChapterListProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: chapters.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 5,
  })

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (chapters.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        No chapters available yet.
      </p>
    )
  }

  const items = virtualizer.getVirtualItems()
  const totalHeight = virtualizer.getTotalSize()

  return (
    <div
      ref={parentRef}
      className="overflow-auto rounded-lg border dark:border-border"
      style={{ maxHeight: '600px' }}
    >
      {/* Virtual scroll container */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {items.map((virtualRow) => {
          const chapter = chapters[virtualRow.index]
          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <ChapterRow chapter={chapter} isLast={virtualRow.index === chapters.length - 1} contentType={contentType} comicSlug={comicSlug} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Chapter row ──────────────────────────────────────────────────────────────

function ChapterRow({
  chapter,
  isLast,
  contentType,
  comicSlug,
}: {
  chapter: ChapterSummary
  isLast: boolean
  contentType: ContentType
  comicSlug: string
}) {
  const uploadDate = new Date(chapter.uploadedAt)
  const isRecent = Date.now() - uploadDate.getTime() < 1000 * 60 * 60 * 24 * 3 // 3 days
  const readerPath = contentType === 'novel' ? 'novel' : 'manga'

  return (
    <Link
      href={`/read/${readerPath}/${comicSlug}/${chapter.slug}`}
      className={cn(
        'flex items-center justify-between px-4 py-3 transition-colors hover:bg-accent dark:hover:bg-accent',
        !isLast && 'border-b dark:border-border'
      )}
      style={{ height: ROW_HEIGHT }}
    >
      {/* Left: chapter number + title */}
      <div className="flex min-w-0 flex-col">
        <span className="flex items-center gap-2 text-sm font-medium text-foreground">
          Chapter {chapter.number}
          {isRecent && (
            <span className="rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
              NEW
            </span>
          )}
        </span>
        {chapter.title && (
          <span className="truncate text-xs text-muted-foreground">{chapter.title}</span>
        )}
      </div>

      {/* Right: group + date */}
      <div className="flex shrink-0 flex-col items-end gap-0.5 pl-2">
        {chapter.group && (
          <span className="text-xs font-medium text-primary">{chapter.group.name}</span>
        )}
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Clock className="h-3 w-3" />
          {formatRelativeDate(uploadDate)}
        </span>
      </div>
    </Link>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeDate(date: Date): string {
  const diff = Date.now() - date.getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 30) return `${days}d ago`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}
