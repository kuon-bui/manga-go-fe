'use client'

import Link from 'next/link'
import { SafeImage as Image } from '@/components/ui/safe-image'
import { TrendingUp, ChevronRight, BookOpen, Star } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useTrending } from '@/hooks/use-manga'
import { cn } from '@/lib/utils'
import type { Manga } from '@/types'

export function TrendingSection() {
  const { data, isLoading, isError } = useTrending()

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <TrendingUp className="h-5 w-5 text-primary" />
          Đang Hot
        </h2>
        <Link
          href="/browse?sort=most_read"
          className="flex items-center gap-0.5 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          Xem thêm <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {isError && (
        <p className="rounded-lg border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
          Không thể tải nội dung.{' '}
          <Link href="/login" className="text-primary hover:underline">
            Đăng nhập
          </Link>{' '}
          để xem.
        </p>
      )}

      {/* Horizontal scroll row — the premium manga site pattern */}
      <div className="-mx-4 px-4 overflow-x-auto scrollbar-none sm:mx-0 sm:px-0">
        <div className="flex gap-3 pb-2 snap-x snap-mandatory w-max sm:w-auto">
          {isLoading
            ? Array.from({ length: 7 }).map((_, i) => <TrendingCardSkeleton key={i} />)
            : data?.data.slice(0, 10).map((manga, i) => (
                <TrendingCard key={manga.id} manga={manga} rank={i + 1} />
              ))}
        </div>
      </div>
    </section>
  )
}

// ─── Trending Card ─────────────────────────────────────────────────────────────

function TrendingCard({ manga, rank }: { manga: Manga; rank: number }) {
  const isTop3 = rank <= 3

  return (
    <Link
      href={`/titles/${manga.slug}`}
      className="group relative shrink-0 w-32 sm:w-36 snap-start"
    >
      {/* Cover */}
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-muted">
        {manga.thumbnail ? (
          <Image
            src={manga.thumbnail}
            alt={`Cover of ${manga.title}`}
            fill
            sizes="(max-width: 640px) 128px, 144px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted">
            <BookOpen className="h-7 w-7 text-muted-foreground/40" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-80" />

        {/* Rank number — large watermark style */}
        <span
          className={cn(
            'absolute bottom-6 left-0.5 select-none font-black leading-none text-white/25',
            isTop3 ? 'text-6xl' : 'text-5xl'
          )}
          aria-label={`Rank ${rank}`}
        >
          {rank}
        </span>

        {/* Rating badge */}
        {manga.rating !== undefined && (
          <div className="absolute right-1.5 top-1.5 flex items-center gap-0.5 rounded bg-black/60 px-1.5 py-0.5 backdrop-blur-sm">
            <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
            <span className="text-[10px] font-bold text-white">{manga.rating.toFixed(1)}</span>
          </div>
        )}

        {/* Top 3 crown indicator */}
        {isTop3 && (
          <div
            className={cn(
              'absolute left-1.5 top-1.5 h-1.5 w-1.5 rounded-full',
              rank === 1 ? 'bg-yellow-400' : rank === 2 ? 'bg-slate-300' : 'bg-orange-400'
            )}
            title={rank === 1 ? 'Gold' : rank === 2 ? 'Silver' : 'Bronze'}
          />
        )}
      </div>

      {/* Title */}
      <div className="mt-1.5">
        <h3
          className="line-clamp-2 text-[12px] font-semibold leading-snug text-foreground transition-colors group-hover:text-primary"
          title={manga.title}
        >
          {manga.title}
        </h3>
        {manga.lastChapterAt && (
          <p className="mt-0.5 text-[10px] text-muted-foreground/70">
            {manga.chapterCount != null ? `${manga.chapterCount} chương` : ''}
          </p>
        )}
      </div>
    </Link>
  )
}

function TrendingCardSkeleton() {
  return (
    <div className="shrink-0 w-32 sm:w-36 flex flex-col gap-1.5">
      <Skeleton className="aspect-[2/3] w-full rounded-lg" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  )
}
