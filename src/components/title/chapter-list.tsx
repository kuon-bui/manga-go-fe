'use client'

import { useRef, useMemo } from 'react'
import Link from 'next/link'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Clock, BookOpen } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { ChapterSummary, ContentType } from '@/types'

/* ── flat virtual items ────────────────────────────────────────────────────── */

type VirtualItem =
  | { kind: 'header'; volume: string; count: number }
  | { kind: 'chapter'; chapter: ChapterSummary; isLast: boolean }

const CHAPTER_H = 56
const HEADER_H  = 40

function buildItems(chapters: ChapterSummary[]): VirtualItem[] {
  // Group by volume — null / undefined → 'Toàn tập'
  const groups = new Map<string, ChapterSummary[]>()

  for (const ch of chapters) {
    const vol = ch.volume ?? 'Toàn tập'
    if (!groups.has(vol)) groups.set(vol, [])
    groups.get(vol)!.push(ch)
  }

  const items: VirtualItem[] = []

  for (const [volume, chs] of groups) {
    items.push({ kind: 'header', volume, count: chs.length })
    chs.forEach((ch, i) => {
      items.push({ kind: 'chapter', chapter: ch, isLast: i === chs.length - 1 })
    })
  }

  return items
}

/* ── Props ─────────────────────────────────────────────────────────────────── */

interface ChapterListProps {
  chapters: ChapterSummary[]
  isLoading: boolean
  comicSlug: string
  contentType: ContentType
  lastReadChapterId?: string | null
}

/* ── Main component ─────────────────────────────────────────────────────────── */

export function ChapterList({
  chapters,
  isLoading,
  comicSlug,
  contentType,
  lastReadChapterId,
}: ChapterListProps) {
  const parentRef = useRef<HTMLDivElement>(null)

  const items = useMemo(() => buildItems(chapters), [chapters])

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (i) => (items[i]?.kind === 'header' ? HEADER_H : CHAPTER_H),
    overscan: 5,
  })

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (chapters.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
        <BookOpen className="h-8 w-8 opacity-30" />
        <p className="text-sm">Chưa có chương nào.</p>
      </div>
    )
  }

  const virtualItems = virtualizer.getVirtualItems()
  const totalHeight  = virtualizer.getTotalSize()

  return (
    <div
      ref={parentRef}
      className="overflow-auto rounded-xl border border-border/60"
      style={{ maxHeight: '520px' }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {virtualItems.map((vRow) => {
          const item = items[vRow.index]
          if (!item) return null

          return (
            <div
              key={vRow.key}
              data-index={vRow.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${vRow.start}px)`,
              }}
            >
              {item.kind === 'header' ? (
                <VolumeHeader volume={item.volume} count={item.count} />
              ) : (
                <ChapterRow
                  chapter={item.chapter}
                  isLast={item.isLast}
                  contentType={contentType}
                  comicSlug={comicSlug}
                  isRead={item.chapter.id === lastReadChapterId}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── Volume header row ──────────────────────────────────────────────────────── */

function VolumeHeader({ volume, count }: { volume: string; count: number }) {
  return (
    <div
      className="flex items-center gap-2 sticky top-0 z-10 bg-muted/80 backdrop-blur-sm px-4 border-b border-border/60"
      style={{ height: HEADER_H }}
    >
      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
        {volume}
      </span>
      <span className="rounded-full bg-border px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
        {count}
      </span>
    </div>
  )
}

/* ── Chapter row ────────────────────────────────────────────────────────────── */

function ChapterRow({
  chapter,
  isLast,
  contentType,
  comicSlug,
  isRead,
}: {
  chapter: ChapterSummary
  isLast: boolean
  contentType: ContentType
  comicSlug: string
  isRead?: boolean
}) {
  const uploadDate = new Date(chapter.uploadedAt)
  const isRecent   = Date.now() - uploadDate.getTime() < 1000 * 60 * 60 * 24 * 3
  const readerPath = contentType === 'novel' ? 'novel' : 'manga'

  return (
    <Link
      href={`/read/${readerPath}/${comicSlug}/${chapter.slug}`}
      className={cn(
        'flex items-center justify-between px-4 transition-colors hover:bg-secondary/60',
        !isLast && 'border-b border-border/60',
        isRead && 'opacity-55',
      )}
      style={{ height: CHAPTER_H }}
    >
      <div className="flex min-w-0 flex-col">
        <span className="flex items-center gap-2 text-sm font-semibold">
          Ch.{chapter.number}
          {isRead && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
              Đã đọc
            </span>
          )}
          {!isRead && isRecent && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
              MỚI
            </span>
          )}
        </span>
        {chapter.title && (
          <span className="truncate text-xs text-muted-foreground mt-0.5">{chapter.title}</span>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-0.5 pl-2">
        {chapter.group && (
          <span className="text-xs font-medium text-primary truncate max-w-[100px]">
            {chapter.group.name}
          </span>
        )}
        <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Clock className="h-3 w-3" />
          {formatDate(uploadDate)}
        </span>
      </div>
    </Link>
  )
}

/* ── Helpers ────────────────────────────────────────────────────────────────── */

function formatDate(date: Date): string {
  const diff  = Date.now() - date.getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 60) return `${mins}m`
  if (hours < 24) return `${hours}h`
  if (days  < 30) return `${days}d`
  return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'short', year: 'numeric' })
}
