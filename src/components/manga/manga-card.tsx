import { SafeImage as Image } from '@/components/ui/safe-image'
import Link from 'next/link'
import { Star, BookOpen } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { Manga, ContentStatus, ContentType } from '@/types'

// ─── Badge helpers ────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<ContentStatus, string> = {
  ongoing:   'Ongoing',
  completed: 'Completed',
  hiatus:    'Hiatus',
  cancelled: 'Cancelled',
}

const TYPE_LABEL: Record<ContentType, string> = {
  manga: 'Manga',
  novel: 'Novel',
}

const STATUS_DOT: Record<ContentStatus, string> = {
  ongoing:   'bg-green-500',
  completed: 'bg-blue-500',
  hiatus:    'bg-yellow-500',
  cancelled: 'bg-red-500',
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins  < 60)  return `${mins}m ago`
  if (hours < 24)  return `${hours}h ago`
  if (days  < 30)  return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface MangaCardProps {
  manga: Manga
  variant?: 'card' | 'list'
  className?: string
}

// ─── Card variant ─────────────────────────────────────────────────────────────

export function MangaCard({ manga, variant = 'card', className }: MangaCardProps) {
  if (variant === 'list') return <MangaListItem manga={manga} className={className} />

  return (
    <Link
      href={`/titles/${manga.slug}`}
      className={cn('group relative flex flex-col', className)}
    >
      {/* Cover */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md bg-muted shadow-sm">
        {manga.thumbnail ? (
          <Image
            src={manga.thumbnail}
            alt={`Cover of ${manga.title}`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted">
            <BookOpen className="h-8 w-8 text-muted-foreground/40" />
          </div>
        )}

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

        {/* Type badge */}
        <div className="absolute left-1 top-1">
          <span
            className={cn(
              'inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white shadow-sm',
              manga.type === 'manga'
                ? 'bg-blue-600/90'
                : 'bg-purple-600/90'
            )}
          >
            {TYPE_LABEL[manga.type]}
          </span>
        </div>

        {/* Rating badge */}
        {manga.rating !== undefined && (
          <div className="absolute right-1 top-1 flex items-center gap-0.5 rounded bg-black/60 px-1 py-0.5 backdrop-blur-sm">
            <Star className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
            <span className="text-[10px] font-semibold text-white">{manga.rating.toFixed(1)}</span>
          </div>
        )}

        {/* Latest chapter — shows on hover */}
        {manga.chapters && manga.chapters.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 translate-y-2 px-1.5 pb-1.5 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
            <span className="inline-flex items-center gap-1 rounded bg-primary/90 px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground backdrop-blur-md">
              Ch.{manga.chapters[manga.chapters.length - 1].number}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-1.5 flex flex-col gap-0.5">
        <h3
          className="line-clamp-2 text-xs font-semibold leading-tight text-foreground transition-colors group-hover:text-primary"
          title={manga.title}
        >
          {manga.title}
        </h3>

        <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
          <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', STATUS_DOT[manga.status])} />
          <span className="text-[10px] text-muted-foreground">{STATUS_LABEL[manga.status]}</span>
          {manga.lastChapterAt && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground/30">·</span>
              <span className="text-[10px] text-muted-foreground/60">{timeAgo(manga.lastChapterAt)}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}

// ─── List variant ─────────────────────────────────────────────────────────────

function MangaListItem({ manga, className }: { manga: Manga; className?: string }) {
  const latestChapter = manga.chapters?.[manga.chapters.length - 1]

  return (
    <Link
      href={`/titles/${manga.slug}`}
      className={cn(
        'group flex gap-3 rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/30 hover:bg-accent',
        className
      )}
    >
      {/* Cover */}
      <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-md bg-muted">
        {manga.thumbnail ? (
          <Image
            src={manga.thumbnail}
            alt={`Cover of ${manga.title}`}
            fill
            sizes="56px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen className="h-5 w-5 text-muted-foreground/40" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div>
          <h3 className="line-clamp-1 text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
            {manga.title}
          </h3>
          {manga.authors.length > 0 && (
            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
              {manga.authors.map((a) => a.name).join(', ')}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant={manga.type} className="text-[10px] px-1.5 py-0">
            {TYPE_LABEL[manga.type]}
          </Badge>
          <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', STATUS_DOT[manga.status])} />
          <span className="text-[11px] text-muted-foreground">{STATUS_LABEL[manga.status]}</span>

          {latestChapter && (
            <span className="ml-auto text-[11px] text-muted-foreground">
              Ch.{latestChapter.number}
            </span>
          )}

          {manga.rating !== undefined && (
            <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {manga.rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
