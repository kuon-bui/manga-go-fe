'use client'

import Link from 'next/link'
import { BookOpen, Trash2, Clock, AlertCircle } from 'lucide-react'

import { SafeImage as Image } from '@/components/ui/safe-image'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useReadingHistories, useDeleteReadingHistory } from '@/hooks/use-reading-history'
import type { ReadingHistoryEntry } from '@/types'

export function ReadingHistoryTab() {
  const { data, isLoading, isError, refetch } = useReadingHistories({ limit: '50' })
  const deleteMutation = useDeleteReadingHistory()

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <AlertCircle className="h-10 w-10 text-muted-foreground opacity-40" />
        <p className="text-sm font-medium text-muted-foreground">Không thể tải lịch sử đọc.</p>
        <Button variant="outline" size="sm" onClick={() => void refetch()}>
          Thử lại
        </Button>
      </div>
    )
  }

  const entries = data?.data ?? []

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <Clock className="h-10 w-10 text-muted-foreground opacity-30" />
        <p className="text-base font-medium text-foreground">Chưa có lịch sử đọc</p>
        <p className="text-sm text-muted-foreground">
          Mở một chương bất kỳ để bắt đầu theo dõi tiến độ của bạn.
        </p>
        <Button asChild className="mt-2">
          <Link href="/browse">
            <BookOpen className="h-4 w-4" />
            Khám phá ngay
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {entries.map((entry) => (
        <HistoryRow
          key={entry.id}
          entry={entry}
          onDelete={() => deleteMutation.mutate(entry.id)}
          isDeleting={deleteMutation.isPending && deleteMutation.variables === entry.id}
        />
      ))}
    </div>
  )
}

// ─── History Row ──────────────────────────────────────────────────────────────

function HistoryRow({
  entry,
  onDelete,
  isDeleting,
}: {
  entry: ReadingHistoryEntry
  onDelete: () => void
  isDeleting: boolean
}) {
  const manga = entry.comic
  const chapter = entry.chapter
  const readerPath = manga.type === 'novel' ? 'novel' : 'manga'

  const chapterUrl = chapter
    ? `/read/${readerPath}/${manga.slug}/${chapter.slug}`
    : `/titles/${manga.slug}`

  const lastRead = entry.lastReadAt ?? entry.createdAt

  return (
    <div className="group flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3 transition-colors hover:bg-accent/50 dark:border-border">
      {/* Cover */}
      <Link href={`/titles/${manga.slug}`} className="shrink-0">
        <div className="relative h-16 w-11 overflow-hidden rounded-lg bg-muted">
          {manga.thumbnail ? (
            <Image
              src={manga.thumbnail}
              alt={`Bìa ${manga.title}`}
              fill
              sizes="44px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BookOpen className="h-4 w-4 text-muted-foreground/40" />
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <Link
          href={`/titles/${manga.slug}`}
          className="line-clamp-1 text-sm font-semibold text-foreground hover:text-primary"
        >
          {manga.title}
        </Link>
        {chapter ? (
          <Link
            href={chapterUrl}
            className="mt-0.5 flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <BookOpen className="h-3 w-3" />
            Chương {chapter.number}
            {chapter.title ? ` — ${chapter.title}` : ''}
          </Link>
        ) : (
          <p className="mt-0.5 text-xs text-muted-foreground">Chương đã bị xóa</p>
        )}
        <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
          <Clock className="h-3 w-3" />
          {formatRelativeTime(lastRead)}
        </p>
      </div>

      {/* Continue reading button */}
      <div className="flex shrink-0 items-center gap-2">
        {chapter && (
          <Button asChild size="sm" variant="outline" className="hidden sm:flex">
            <Link href={chapterUrl}>Tiếp tục</Link>
          </Button>
        )}

        {/* Delete */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
          onClick={onDelete}
          disabled={isDeleting}
          aria-label="Xóa khỏi lịch sử"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeTime(dateStr: string): string {
  try {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60_000)
    const hours = Math.floor(diff / 3_600_000)
    const days = Math.floor(diff / 86_400_000)
    if (mins < 1) return 'vừa xong'
    if (mins < 60) return `${mins} phút trước`
    if (hours < 24) return `${hours} giờ trước`
    if (days < 30) return `${days} ngày trước`
    return new Date(dateStr).toLocaleDateString('vi-VN', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return dateStr
  }
}
