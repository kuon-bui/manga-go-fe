'use client'

import { MangaRow, MangaRowSkeleton } from '@/components/manga/manga-row'
import { useTrending } from '@/hooks/use-manga'

export function TrendingSection() {
  const { data, isLoading } = useTrending()

  if (isLoading) return <MangaRowSkeleton title="Trending Now" />

  if (!data || data.length === 0) return null

  return (
    <MangaRow
      title="Trending Now"
      href="/browse?sort=most_read"
      items={data}
    />
  )
}
