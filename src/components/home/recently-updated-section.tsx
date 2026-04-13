'use client'

import Link from 'next/link'
import { Clock, ChevronRight } from 'lucide-react'
import { MangaGrid, MangaGridSkeleton } from '@/components/manga/manga-grid'
import { useRecentlyUpdated } from '@/hooks/use-manga'

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

      {isLoading && <MangaGridSkeleton count={10} />}

      {isError && (
        <p className="rounded-lg border border-dashed border-border py-6 text-center text-sm text-muted-foreground">
          Không thể tải nội dung.{' '}
          <Link href="/login" className="text-primary hover:underline">Đăng nhập</Link> để xem.
        </p>
      )}

      {!isLoading && !isError && data && data.data.length > 0 && (
        <MangaGrid items={data.data} />
      )}
    </section>
  )
}
