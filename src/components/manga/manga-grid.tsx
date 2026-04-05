import { cn } from '@/lib/utils'
import { MangaCard } from '@/components/manga/manga-card'
import { MangaCardSkeleton, MangaListItemSkeleton } from '@/components/manga/manga-card-skeleton'
import type { Manga } from '@/types'

export type GridVariant = 'card' | 'list'

interface MangaGridProps {
  items: Manga[]
  variant?: GridVariant
  className?: string
}

interface MangaGridSkeletonProps {
  count?: number
  variant?: GridVariant
  className?: string
}

// ─── Grid ─────────────────────────────────────────────────────────────────────

export function MangaGrid({ items, variant = 'card', className }: MangaGridProps) {
  if (variant === 'list') {
    return (
      <div className={cn('flex flex-col gap-2', className)}>
        {items.map((manga) => (
          <MangaCard key={manga.id} manga={manga} variant="list" />
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
        className
      )}
    >
      {items.map((manga) => (
        <MangaCard key={manga.id} manga={manga} variant="card" />
      ))}
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function MangaGridSkeleton({
  count = 10,
  variant = 'card',
  className,
}: MangaGridSkeletonProps) {
  if (variant === 'list') {
    return (
      <div className={cn('flex flex-col gap-2', className)}>
        {Array.from({ length: count }).map((_, i) => (
          <MangaListItemSkeleton key={i} />
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
        className
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <MangaCardSkeleton key={i} />
      ))}
    </div>
  )
}
