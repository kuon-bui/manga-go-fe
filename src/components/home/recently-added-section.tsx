'use client'

import Link from 'next/link'
import { Sparkles, ChevronRight } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useRecentlyAdded } from '@/hooks/use-manga'
import { MangaCard } from '@/components/manga/manga-card'

export function RecentlyAddedSection() {
  const { data, isLoading, isError } = useRecentlyAdded()
  const mangas = data?.data ?? []

  return (
    <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2.5 text-lg font-bold text-foreground">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Sparkles className="h-4 w-4" />
          </span>
          Truyện Mới Thêm
        </h2>
        <Link
          href="/browse?sort=newest"
          className="flex items-center gap-1 rounded-full border border-border/60 bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
        >
          Xem thêm <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {isLoading && (
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="relative shrink-0 w-36 sm:w-40">
              <div className="flex flex-col gap-1.5">
                <Skeleton className="aspect-[3/4] w-full rounded-lg" />
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && (
        <p className="rounded-lg border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
          Không thể tải nội dung.{' '}
          <Link href="/login" className="text-primary hover:underline">
            Đăng nhập
          </Link>{' '}
          để xem.
        </p>
      )}

      {!isLoading && !isError && mangas.length > 0 && (
        <div className="flex gap-4 overflow-x-auto pb-4 pt-1 scrollbar-none snap-x snap-mandatory">
          {mangas.map((manga, i) => (
            <div key={manga.id} className="relative shrink-0 w-36 sm:w-40 snap-start animate-in fade-in duration-300" style={{ animationDelay: `${i * 30}ms` }}>
              <MangaCard manga={manga} />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
