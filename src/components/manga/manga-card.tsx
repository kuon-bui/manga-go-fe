import Image from 'next/image'
import Link from 'next/link'
import { Star } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { Manga, ContentStatus, ContentType } from '@/types'

// ─── Badge helpers ────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<ContentStatus, string> = {
  ongoing: 'Ongoing',
  completed: 'Completed',
  hiatus: 'Hiatus',
  cancelled: 'Cancelled',
}

const TYPE_LABEL: Record<ContentType, string> = {
  manga: 'Manga',
  novel: 'Novel',
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface MangaCardProps {
  manga: Manga
  /** Show as compact list item instead of vertical card */
  variant?: 'card' | 'list'
  className?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MangaCard({ manga, variant = 'card', className }: MangaCardProps) {
  if (variant === 'list') {
    return <MangaListItem manga={manga} className={className} />
  }

  return (
    <Link
      href={`/titles/${manga.id}`}
      className={cn(
        'group flex flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-shadow hover:shadow-md dark:border-border',
        className
      )}
    >
      {/* Cover */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-muted">
        <Image
          src={manga.coverUrl}
          alt={`Cover of ${manga.title}`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Type badge overlay */}
        <div className="absolute left-1.5 top-1.5">
          <Badge variant={manga.type}>{TYPE_LABEL[manga.type]}</Badge>
        </div>
        {/* Unread chapter count (future: passed as prop) */}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1 p-2">
        <h3
          className="line-clamp-2 text-sm font-semibold leading-tight text-foreground"
          title={manga.title}
        >
          {manga.title}
        </h3>

        <div className="flex items-center gap-1.5">
          <Badge variant={manga.status} className="text-[10px] px-1.5 py-0">
            {STATUS_LABEL[manga.status]}
          </Badge>
        </div>

        <div className="mt-auto flex items-center justify-between pt-1">
          {/* Rating */}
          <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {manga.rating.toFixed(1)}
          </span>

          {/* Latest chapter */}
          {manga.latestChapter && (
            <span className="truncate text-[10px] text-muted-foreground">
              Ch.{manga.latestChapter.number}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

// ─── List variant ─────────────────────────────────────────────────────────────

function MangaListItem({
  manga,
  className,
}: {
  manga: Manga
  className?: string
}) {
  return (
    <Link
      href={`/titles/${manga.id}`}
      className={cn(
        'group flex gap-3 rounded-lg border bg-card p-2 shadow-sm transition-shadow hover:shadow-md dark:border-border',
        className
      )}
    >
      {/* Cover thumbnail */}
      <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
        <Image
          src={manga.coverUrl}
          alt={`Cover of ${manga.title}`}
          fill
          sizes="56px"
          className="object-cover"
        />
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div>
          <h3 className="line-clamp-1 text-sm font-semibold text-foreground">
            {manga.title}
          </h3>
          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
            {manga.author}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={manga.type} className="text-[10px] px-1.5 py-0">
            {TYPE_LABEL[manga.type]}
          </Badge>
          <Badge variant={manga.status} className="text-[10px] px-1.5 py-0">
            {STATUS_LABEL[manga.status]}
          </Badge>
          <span className="ml-auto flex items-center gap-0.5 text-xs text-muted-foreground">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {manga.rating.toFixed(1)}
          </span>
        </div>
      </div>
    </Link>
  )
}
