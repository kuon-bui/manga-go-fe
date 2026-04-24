'use client'

import Link from 'next/link'
import { ChevronRight, BookOpen, CheckCircle2, Star } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { SafeImage as Image } from '@/components/ui/safe-image'
import { useCompleted } from '@/hooks/use-manga'
import type { Manga } from '@/types'

function CompletedCard({ manga }: { manga: Manga }) {
  return (
    <Link href={`/titles/${manga.slug}`} className="group shrink-0 w-[120px] sm:w-[136px] flex flex-col gap-2">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl cute-card group-hover:-translate-y-1 group-hover:shadow-glow transition-all duration-300">
        {manga.thumbnail ? (
          <Image
            src={manga.thumbnail}
            alt={manga.title}
            fill
            sizes="136px"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted">
            <BookOpen className="h-7 w-7 text-muted-foreground/40" />
          </div>
        )}
        <span className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-card/90 flex items-center justify-center shadow-sm">
          <CheckCircle2 className="h-3.5 w-3.5 text-success-foreground" />
        </span>
      </div>

      <h3 className="text-[12px] font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
        {manga.title}
      </h3>
      {manga.rating !== undefined && (
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Star className="h-3 w-3 fill-warning text-warning" />
          {manga.rating.toFixed(1)}
        </div>
      )}
    </Link>
  )
}

export function CompletedSection() {
  const { data, isLoading, isError } = useCompleted()
  const mangas = data?.data ?? []

  return (
    <section className="cute-card p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-success-foreground" />
          Đã Hoàn Thành
        </h2>
        <Link
          href="/browse?status=completed"
          className="text-sm font-semibold text-primary hover:underline flex items-center gap-0.5"
        >
          Xem thêm <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {isLoading && (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="shrink-0 w-[120px] sm:w-[136px] flex flex-col gap-2">
              <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Không thể tải.{' '}
          <Link href="/login" className="text-primary hover:underline">Đăng nhập</Link>
        </p>
      )}

      {!isLoading && !isError && mangas.length > 0 && (
        <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-none">
          {mangas.map((manga, i) => (
            <div
              key={manga.id}
              className="snap-start animate-in fade-in duration-300"
              style={{ animationDelay: `${i * 35}ms` }}
            >
              <CompletedCard manga={manga} />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
