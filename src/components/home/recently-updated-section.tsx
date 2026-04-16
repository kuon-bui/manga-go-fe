'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Clock, ChevronRight, BookOpen } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useRecentlyUpdated } from '@/hooks/use-manga'
import { cn } from '@/lib/utils'
import type { Manga } from '@/types'

/** Returns true if the date is within the past 24 hours */
function isNew(dateStr: string | null): boolean {
  if (!dateStr) return false
  return Date.now() - new Date(dateStr).getTime() < 86_400_000
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(diff / 86_400_000)
  if (mins < 60) return `${mins}p trước`
  if (hours < 24) return `${hours}h trước`
  if (days < 30) return `${days}d trước`
  return new Date(dateStr).toLocaleDateString('vi-VN')
}

export function RecentlyUpdatedSection() {
  const { data, isLoading, isError } = useRecentlyUpdated()

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <Clock className="h-5 w-5 text-primary" />
          Mới Cập Nhật
        </h2>
        <Link
          href="/browse?sort=latest"
          className="flex items-center gap-0.5 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          Xem thêm <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {isLoading && <RecentlyUpdatedSkeleton />}

      {isError && (
        <p className="rounded-lg border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
          Không thể tải nội dung.{' '}
          <Link href="/login" className="text-primary hover:underline">
            Đăng nhập
          </Link>{' '}
          để xem.
        </p>
      )}

      {!isLoading && !isError && data && data.data.length > 0 && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {data.data.map((manga, i) => (
            <RecentlyUpdatedCard
              key={manga.id}
              manga={manga}
              style={{ animationDelay: `${i * 40}ms` }}
            />
          ))}
        </div>
      )}
    </section>
  )
}

// ─── Card ──────────────────────────────────────────────────────────────────────

function RecentlyUpdatedCard({
  manga,
  style,
}: {
  manga: Manga
  style?: React.CSSProperties
}) {
  const latestChapter = manga.chapters?.[manga.chapters.length - 1]
  const novel = manga.type === 'novel'
  const showNew = isNew(manga.lastChapterAt)

  return (
    <Link
      href={`/titles/${manga.slug}`}
      className="group flex gap-3 rounded-xl border border-border/60 bg-card p-2.5 transition-all duration-200 hover:border-primary/30 hover:bg-accent/50 hover:shadow-sm animate-in fade-in duration-300"
      style={style}
    >
      {/* Thumbnail */}
      <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded-md bg-muted">
        {manga.thumbnail ? (
          <Image
            src={manga.thumbnail}
            alt={`Cover of ${manga.title}`}
            fill
            sizes="44px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen className="h-4 w-4 text-muted-foreground/40" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        {/* Title */}
        <h3 className="line-clamp-1 text-[13px] font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">
          {manga.title}
        </h3>

        {/* Chapter line */}
        <div className="flex items-center gap-1.5">
          {latestChapter ? (
            <>
              <span
                className={cn(
                  'inline-flex shrink-0 items-center rounded px-1.5 py-0.5 text-[10px] font-bold',
                  novel
                    ? 'bg-purple-600/90 text-white'
                    : 'bg-primary/90 text-primary-foreground'
                )}
              >
                {novel ? 'Ch.' : 'Ch.'}{latestChapter.number}
              </span>
              {showNew && (
                <span className="inline-flex shrink-0 items-center rounded bg-red-500 px-1 py-0.5 text-[9px] font-black uppercase tracking-wide text-white">
                  MỚI
                </span>
              )}
              {latestChapter.title && (
                <span className="truncate text-[11px] text-muted-foreground">
                  {latestChapter.title}
                </span>
              )}
            </>
          ) : (
            <span className="text-[11px] text-muted-foreground/60">Chưa có chương</span>
          )}
        </div>

        {/* Time */}
        <p className="text-[10px] text-muted-foreground/50">{timeAgo(manga.lastChapterAt)}</p>
      </div>
    </Link>
  )
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────

function RecentlyUpdatedSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="flex gap-3 rounded-xl border border-border/60 bg-card p-2.5">
          <Skeleton className="h-16 w-11 shrink-0 rounded-md" />
          <div className="flex flex-1 flex-col justify-between py-0.5">
            <Skeleton className="h-3.5 w-4/5" />
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-2.5 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}
