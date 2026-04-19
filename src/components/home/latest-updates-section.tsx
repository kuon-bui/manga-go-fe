'use client'

import Link from 'next/link'
import { Zap, ChevronRight } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useLatestUpdates } from '@/hooks/use-manga'
import { MangaCard } from '@/components/manga/manga-card'

export function LatestUpdatesSection() {
  const { data, isLoading, isError } = useLatestUpdates()
  const mangas = data?.data ?? []

  return (
    <section className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <Zap className="h-5 w-5 text-primary" />
          Chương Mới Nhất
        </h2>
        <Link
          href="/browse?sort=latest"
          className="flex items-center gap-0.5 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          Xem thêm <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 18 }).map((_, i) => (
            <div key={i} className="flex gap-3 rounded-lg border border-border p-3">
              <Skeleton className="h-20 w-14 shrink-0 rounded-md" />
              <div className="flex flex-1 flex-col py-0.5">
                <Skeleton className="h-4 w-3/4 mb-1.5" />
                <Skeleton className="h-3 w-1/2 mb-auto" />
                <div className="flex gap-1.5 mt-2">
                  <Skeleton className="h-4 w-10" />
                  <Skeleton className="h-4 w-12" />
                </div>
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {mangas.map((manga, i) => (
            <div key={manga.id} className="animate-in fade-in duration-300" style={{ animationDelay: `${i * 30}ms` }}>
              <MangaCard manga={manga} variant="list" />
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
