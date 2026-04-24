'use client'

import Link from 'next/link'
import { ChevronRight, BookOpen, Sparkles } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { MangaCarousel } from '@/components/ui/manga-carousel'
import { SafeImage as Image } from '@/components/ui/safe-image'
import { useRecentlyAdded } from '@/hooks/use-manga'
import type { Manga } from '@/types'

function NewCard({ manga }: { manga: Manga }) {
  return (
    <Link href={`/titles/${manga.slug}`} className="group shrink-0 w-[120px] sm:w-[132px] flex flex-col gap-2">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-muted cute-card group-hover:-translate-y-1 group-hover:shadow-glow transition-all duration-300">
        {manga.thumbnail ? (
          <Image
            src={manga.thumbnail}
            alt={manga.title}
            fill
            sizes="132px"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen className="h-7 w-7 text-muted-foreground/40" />
          </div>
        )}
        <span className="cute-pill absolute top-1.5 left-1.5 bg-primary text-primary-foreground text-[9px] px-1.5 py-0 shadow-sm">
          MỚI
        </span>
      </div>

      <h3 className="text-[12px] font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
        {manga.title}
      </h3>
      {manga.genres?.[0] && (
        <p className="text-[10px] text-muted-foreground line-clamp-1">{manga.genres[0].name}</p>
      )}
    </Link>
  )
}

export function RecentlyAddedSection() {
  const { data, isLoading, isError } = useRecentlyAdded()
  const mangas = data?.data ?? []

  return (
    <section className="cute-card p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Truyện Mới
        </h2>
        <Link
          href="/browse?sort=newest"
          className="text-sm font-semibold text-primary hover:underline flex items-center gap-0.5"
        >
          Xem thêm <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {isLoading && (
        <div className="flex gap-3 pb-1">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="shrink-0 w-[120px] sm:w-[132px] flex flex-col gap-2">
              <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3 w-2/3" />
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
        <MangaCarousel>
          {mangas.map((manga, i) => (
            <div
              key={manga.id}
              className="animate-in fade-in duration-300"
              style={{ animationDelay: `${i * 35}ms` }}
            >
              <NewCard manga={manga} />
            </div>
          ))}
        </MangaCarousel>
      )}
    </section>
  )
}
