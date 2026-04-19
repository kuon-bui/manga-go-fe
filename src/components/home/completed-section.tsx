'use client'

import Link from 'next/link'
import { CheckCircle2, ChevronRight } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useCompleted } from '@/hooks/use-manga'
import { MangaCard } from '@/components/manga/manga-card'

export function CompletedSection() {
  const { data, isLoading, isError } = useCompleted()
  const mangas = data?.data ?? []

  return (
    <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <CheckCircle2 className="h-5 w-5 text-primary" />
          Truyện Hoàn Thành
        </h2>
        <Link
          href="/browse?status=completed"
          className="flex items-center gap-0.5 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          Xem thêm <ChevronRight className="h-4 w-4" />
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
