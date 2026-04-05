'use client'

import Image from 'next/image'
import Link from 'next/link'
import { BookOpen, Heart, HeartOff, Star } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StarRating } from '@/components/ui/star-rating'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/stores/auth-store'
import { useFollowStatus, useFollow } from '@/hooks/use-title-detail'
import type { Manga, ContentStatus, ContentType } from '@/types'

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

interface TitleHeroProps {
  manga: Manga
  onRateClick: () => void
}

export function TitleHero({ manga, onRateClick }: TitleHeroProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const { data: followStatus } = useFollowStatus(manga.id)
  const followMutation = useFollow(manga.id)

  const isFollowing = followStatus?.isFollowing ?? false

  function handleFollow() {
    if (!isAuthenticated) return
    followMutation.mutate(isFollowing)
  }

  const firstChapterId = null // populated once chapters are loaded — link placeholder

  return (
    <div className="flex flex-col gap-6 md:flex-row">
      {/* Cover */}
      <div className="relative mx-auto h-64 w-44 shrink-0 overflow-hidden rounded-xl shadow-lg md:mx-0 md:h-80 md:w-56">
        <Image
          src={manga.coverUrl}
          alt={`Cover of ${manga.title}`}
          fill
          sizes="(max-width: 768px) 176px, 224px"
          className="object-cover"
          priority
        />
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-3">
        {/* Title + alt titles */}
        <div>
          <h1 className="text-2xl font-bold leading-tight text-foreground md:text-3xl">
            {manga.title}
          </h1>
          {manga.alternativeTitles.length > 0 && (
            <p className="mt-1 text-sm text-muted-foreground">
              {manga.alternativeTitles.slice(0, 2).join(' · ')}
            </p>
          )}
        </div>

        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={manga.type}>{TYPE_LABEL[manga.type]}</Badge>
          <Badge variant={manga.status}>{STATUS_LABEL[manga.status]}</Badge>
          {manga.year && (
            <Badge variant="outline">{manga.year}</Badge>
          )}
        </div>

        {/* Rating */}
        <StarRating
          value={manga.rating}
          readOnly
          showValue
          voteCount={manga.ratingCount}
        />

        <Separator />

        {/* Metadata */}
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm sm:grid-cols-3">
          <MetaRow label="Author" value={manga.author} />
          {manga.artist && manga.artist !== manga.author && (
            <MetaRow label="Artist" value={manga.artist} />
          )}
          <MetaRow label="Chapters" value={String(manga.chapterCount)} />
          <MetaRow label="Follows" value={manga.followCount.toLocaleString()} />
        </dl>

        {/* Genres */}
        {manga.genres.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {manga.genres.map((g) => (
              <Link
                key={g.id}
                href={`/browse?genre=${g.slug}`}
                className="rounded-full border border-border bg-background px-2.5 py-0.5 text-xs text-foreground transition-colors hover:bg-accent dark:bg-card"
              >
                {g.name}
              </Link>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Button asChild>
            <Link href={firstChapterId ? `/read/manga/${firstChapterId}` : '#'}>
              <BookOpen className="h-4 w-4" />
              Read First Chapter
            </Link>
          </Button>

          {isAuthenticated && (
            <>
              <Button
                variant={isFollowing ? 'secondary' : 'outline'}
                onClick={handleFollow}
                disabled={followMutation.isPending}
                aria-label={isFollowing ? 'Unfollow title' : 'Follow title'}
              >
                {isFollowing ? (
                  <HeartOff className="h-4 w-4" />
                ) : (
                  <Heart className="h-4 w-4" />
                )}
                {isFollowing ? 'Following' : 'Follow'}
              </Button>

              <Button variant="outline" onClick={onRateClick} aria-label="Rate this title">
                <Star className="h-4 w-4" />
                Rate
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  )
}
