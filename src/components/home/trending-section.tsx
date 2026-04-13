'use client'

import Link from 'next/link'
import { TrendingUp, ChevronRight } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { MangaCard } from '@/components/manga/manga-card'
import { useTrending } from '@/hooks/use-manga'

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
          <Link href="/login" className="text-primary hover:underline">Đăng nhập</Link> để xem.
        </p>
      )}

      {isLoading && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <Skeleton className="aspect-[2/3] w-full rounded-lg" />
              <Skeleton className="h-3.5 w-full rounded" />
              <Skeleton className="h-3 w-2/3 rounded" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && !isError && data && data.data.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7">
          {data.data.slice(0, 7).map((manga) => (
            <MangaCard key={manga.id} manga={manga} />
          ))}
        </div>
      )}
    </section>
  )
}
