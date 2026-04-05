'use client'

import { Skeleton } from '@/components/ui/skeleton'
import { GenreChip } from '@/components/ui/genre-chip'
import { useGenres } from '@/hooks/use-manga'

export function GenreSection() {
  const { data, isLoading } = useGenres()

  if (isLoading) {
    return (
      <section className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">Browse by Genre</h2>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
      </section>
    )
  }

  if (!data || data.length === 0) return null

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-bold text-foreground">Browse by Genre</h2>
      <div className="flex flex-wrap gap-2">
        {data.map((genre) => (
          <GenreChip key={genre.id} label={genre.name} slug={genre.slug} />
        ))}
      </div>
    </section>
  )
}
