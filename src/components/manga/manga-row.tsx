import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import { MangaCard } from '@/components/manga/manga-card'
import { MangaCardSkeleton } from '@/components/manga/manga-card-skeleton'
import type { Manga } from '@/types'

interface MangaRowProps {
  title: string
  href?: string
  items: Manga[]
  className?: string
}

interface MangaRowSkeletonProps {
  title?: string
  count?: number
  className?: string
}

// ─── Row ──────────────────────────────────────────────────────────────────────

export function MangaRow({ title, href, items, className }: MangaRowProps) {
  return (
    <section className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        {href && (
          <Link
            href={href}
            className="flex items-center gap-0.5 text-sm text-primary hover:underline"
          >
            See all <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {/* Horizontal scroll strip */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {items.map((manga) => (
          <MangaCard
            key={manga.id}
            manga={manga}
            variant="card"
            className="w-[140px] shrink-0 sm:w-[160px]"
          />
        ))}
      </div>
    </section>
  )
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function MangaRowSkeleton({ title, count = 6, className }: MangaRowSkeletonProps) {
  return (
    <section className={cn('space-y-3', className)}>
      {title && <h2 className="text-lg font-bold text-foreground">{title}</h2>}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
        {Array.from({ length: count }).map((_, i) => (
          <MangaCardSkeleton key={i} className="w-[140px] shrink-0 sm:w-[160px]" />
        ))}
      </div>
    </section>
  )
}
