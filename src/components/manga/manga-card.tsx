import { SafeImage as Image } from '@/components/ui/safe-image'
import Link from 'next/link'
import { Star, BookOpen } from 'lucide-react'

import { cn } from '@/lib/utils'
import type { Manga, ContentStatus, ContentType } from '@/types'

const STATUS_LABEL: Record<ContentStatus, string> = {
  ongoing:   'Ongoing',
  completed: 'Completed',
  hiatus:    'Hiatus',
  cancelled: 'Cancelled',
}

const TYPE_LABEL: Record<ContentType, string> = {
  manga:  'Manga',
  manhwa: 'Manhwa',
  manhua: 'Manhua',
  comic:  'Comic',
  novel:  'Novel',
}

const STATUS_COLORS: Record<ContentStatus, string> = {
  ongoing:   'bg-success text-success-foreground',
  completed: 'bg-accent text-accent-foreground',
  hiatus:    'bg-warning text-warning-foreground',
  cancelled: 'bg-muted text-muted-foreground',
}

function timeAgo(dateStr: string | null): string {
  if (!dateStr) return ''
  const diff  = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days  < 30) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export interface MangaCardProps {
  manga: Manga
  variant?: 'card' | 'list'
  className?: string
}

export function MangaCard({ manga, variant = 'card', className }: MangaCardProps) {
  if (variant === 'list') return <MangaListItem manga={manga} className={className} />

  return (
    <Link
      href={`/titles/${manga.slug}`}
      className={cn('group block cute-card overflow-hidden hover:-translate-y-1 hover:shadow-[var(--shadow-glow)] transition-all duration-300', className)}
    >
      {/* Cover */}
      <div className="aspect-[3/4] overflow-hidden bg-muted">
        {manga.thumbnail ? (
          <Image
            src={manga.thumbnail}
            alt={`Cover of ${manga.title}`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-muted">
            <BookOpen className="h-8 w-8 text-muted-foreground/40" />
          </div>
        )}

        {/* Type badge */}
        <div className="absolute left-1.5 top-1.5">
          <span className="cute-pill bg-secondary text-secondary-foreground text-[9px] px-1.5 py-0 shadow-sm">
            {TYPE_LABEL[manga.type]}
          </span>
        </div>

        {/* Rating badge */}
        {manga.rating !== undefined && (
          <div className="absolute right-1.5 top-1.5 flex items-center gap-0.5 rounded-full bg-card/80 px-1.5 py-0.5 backdrop-blur-sm shadow-sm">
            <Star className="h-2.5 w-2.5 fill-warning text-warning" />
            <span className="text-[10px] font-semibold">{manga.rating.toFixed(1)}</span>
          </div>
        )}

        {/* Latest chapter on hover */}
        {manga.chapters && manga.chapters.length > 0 && (
          <div className="absolute bottom-0 left-0 right-0 translate-y-2 px-1.5 pb-1.5 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
            <span className="cute-pill bg-primary/90 text-primary-foreground text-[9px] backdrop-blur-md shadow-soft">
              Ch.{manga.chapters[manga.chapters.length - 1].number}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-2.5">
        <h3 className="font-display font-bold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {manga.title}
        </h3>
        <div className="flex items-center gap-1.5 mt-1">
          <span className={cn('cute-pill text-[9px] px-1.5 py-0', STATUS_COLORS[manga.status])}>
            {STATUS_LABEL[manga.status]}
          </span>
          {manga.lastChapterAt && (
            <span className="text-[10px] text-muted-foreground">{timeAgo(manga.lastChapterAt)}</span>
          )}
        </div>
      </div>
    </Link>
  )
}

function MangaListItem({ manga, className }: { manga: Manga; className?: string }) {
  const latestChapter = manga.chapters?.[manga.chapters.length - 1]

  return (
    <Link
      href={`/titles/${manga.slug}`}
      className={cn(
        'group flex gap-3 rounded-2xl border border-border bg-card/60 p-3 hover:bg-secondary/60 hover:border-primary/30 transition-all',
        className
      )}
    >
      <div className="relative h-20 w-14 shrink-0 overflow-hidden rounded-xl bg-muted">
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

      <div className="flex min-w-0 flex-1 flex-col justify-between py-0.5">
        <div>
          <h3 className="font-display font-bold text-sm line-clamp-1 group-hover:text-primary transition-colors">
            {manga.title}
          </h3>
          {manga.authors.length > 0 && (
            <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
              {manga.authors.map((a) => a.name).join(', ')}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="cute-pill bg-secondary text-secondary-foreground text-[10px] px-1.5 py-0">
            {TYPE_LABEL[manga.type]}
          </span>
          <span className={cn('cute-pill text-[10px] px-1.5 py-0', STATUS_COLORS[manga.status])}>
            {STATUS_LABEL[manga.status]}
          </span>
          {latestChapter && (
            <span className="ml-auto text-[11px] text-muted-foreground">
              Ch.{latestChapter.number}
            </span>
          )}
          {manga.rating !== undefined && (
            <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
              <Star className="h-3 w-3 fill-warning text-warning" />
              {manga.rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
