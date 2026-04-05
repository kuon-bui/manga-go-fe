'use client'

import { MangaGrid, MangaGridSkeleton } from '@/components/manga/manga-grid'
import { useRecentlyUpdated } from '@/hooks/use-manga'

export function RecentlyUpdatedSection() {
  const { data, isLoading } = useRecentlyUpdated()

  if (isLoading) {
    return (
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">Recently Updated</h2>
        <MangaGridSkeleton count={10} />
      </section>
    )
  }

  if (!data || data.data.length === 0) return null

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold text-foreground">Recently Updated</h2>
      <MangaGrid items={data.data} />
    </section>
  )
}
