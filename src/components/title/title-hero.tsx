'use client'

import { SafeImage as Image } from '@/components/ui/safe-image'
import Link from 'next/link'
import { BookOpen, Heart, HeartOff, Star, Pencil } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/auth-store'
import { useFollowStatus, useFollow, useUserRating } from '@/hooks/use-title-detail'
import type { Manga, ContentStatus, ContentType } from '@/types'

const STATUS_LABEL: Record<ContentStatus, string> = {
  ongoing:   'Đang tiến hành',
  completed: 'Hoàn thành',
  hiatus:    'Tạm dừng',
  cancelled: 'Đã hủy',
}

const STATUS_DOT: Record<ContentStatus, string> = {
  ongoing:   'bg-green-400',
  completed: 'bg-blue-400',
  hiatus:    'bg-yellow-400',
  cancelled: 'bg-red-400',
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
  const user            = useAuthStore((s) => s.user)

  const { data: followStatus } = useFollowStatus(manga.slug ?? manga.id)
  const followMutation         = useFollow(manga.slug ?? manga.id)
  const { data: userRating }   = useUserRating(manga.slug ?? manga.id)

  const isFollowing = followStatus?.isFollowed ?? followStatus?.isFollowing ?? false
  const isUploader  = user && (
    user.id === manga.uploaderId ||
    user.role === 'admin' ||
    user.role === 'moderator' ||
    (user.translationGroupId && manga.translationGroup?.id &&
      user.translationGroupId === manga.translationGroup.id)
  )

  const readerPath       = manga.type === 'novel' ? 'novel' : 'manga'
  const firstChapterSlug = manga.chapters?.[0]?.slug ?? null
  const firstChapterUrl  = firstChapterSlug
    ? `/read/${readerPath}/${manga.slug}/${firstChapterSlug}`
    : '#'

  const authorNames = manga.authors.map((a) => a.name).join(', ') || 'Không rõ'

  // Rating: 5 stars (score is 1–10, map to 5 stars)
  const ratingScore = userRating?.score ?? 0
  const globalScore = manga.rating ?? 0
  const filledStars = userRating
    ? Math.round(ratingScore / 2)
    : Math.round(globalScore / 2)

  return (
    <div className="grid sm:grid-cols-[160px_1fr] gap-5">

      {/* ── Cover ─────────────────────────────────────────────── */}
      <div className="mx-auto sm:mx-0 shrink-0 flex flex-col gap-2">
        {/* Manga type badge — above cover, full cover width */}
        <div className={`w-[160px] flex items-center justify-center rounded-xl py-1.5 text-sm font-bold tracking-wide border ${
          manga.type === 'manga'
            ? 'bg-[hsl(340_80%_92%)] text-[hsl(340_60%_38%)] border-[hsl(340_60%_85%)] dark:bg-[hsl(340_50%_22%)] dark:text-[hsl(340_80%_82%)] dark:border-[hsl(340_40%_30%)]'
            : 'bg-[hsl(280_65%_92%)] text-[hsl(280_50%_38%)] border-[hsl(280_50%_85%)] dark:bg-[hsl(280_40%_22%)] dark:text-[hsl(280_60%_80%)] dark:border-[hsl(280_30%_30%)]'
        }`}>
          {TYPE_LABEL[manga.type]}
        </div>

        <div className="relative w-[160px] aspect-[3/4] overflow-hidden rounded-2xl shadow-lg ring-1 ring-border">
          {manga.thumbnail ? (
            <Image
              src={manga.thumbnail}
              alt={`Cover of ${manga.title}`}
              fill
              sizes="160px"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-muted text-muted-foreground text-xs">
              No cover
            </div>
          )}
        </div>
      </div>

      {/* ── Info ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 min-w-0 relative">

        {/* Edit button — top right */}
        {isUploader && (
          <Link
            href={`/dashboard/title/${manga.slug}`}
            className="absolute top-0 right-0 inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <Pencil className="h-3 w-3" />
            Sửa
          </Link>
        )}

        {/* Title */}
        <div className="pr-16">
          <h1 className="font-display text-2xl md:text-3xl font-bold leading-tight">
            {manga.title}
          </h1>
          {(manga.alternativeTitles?.length ?? 0) > 0 && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
              {manga.alternativeTitles!.slice(0, 2).join(' · ')}
            </p>
          )}
        </div>

        {/* Author */}
        <p className="text-sm text-muted-foreground -mt-1">{authorNames}</p>

        {/* Genres — below author */}
        {manga.genres.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {manga.genres.map((g) => (
              <Link
                key={g.id}
                href={`/browse?genre=${g.slug}`}
                className="cute-pill bg-secondary text-secondary-foreground hover:bg-primary/15 hover:text-primary transition-colors border border-transparent hover:border-primary/30"
              >
                {g.name}
              </Link>
            ))}
          </div>
        )}

        {/* Status + extra badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
            <span className={`h-2 w-2 rounded-full ${STATUS_DOT[manga.status]}`} />
            {STATUS_LABEL[manga.status]}
          </span>
          {manga.ageRating && manga.ageRating !== 'ALL' && (
            <Badge variant="outline">{manga.ageRating}</Badge>
          )}
          {manga.publishedYear && (
            <Badge variant="outline">{manga.publishedYear}</Badge>
          )}
        </div>

        {/* Rating stars — click to rate */}
        <button
          onClick={isAuthenticated ? onRateClick : undefined}
          className={`flex items-center gap-1 w-fit ${isAuthenticated ? 'cursor-pointer group' : 'cursor-default'}`}
          aria-label={isAuthenticated ? 'Đánh giá truyện' : undefined}
          title={isAuthenticated ? 'Nhấn để đánh giá' : `Điểm trung bình: ${globalScore.toFixed(1)}/10`}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 transition-colors ${
                i < filledStars
                  ? 'fill-warning text-warning'
                  : 'fill-transparent text-border group-hover:text-warning/60'
              }`}
            />
          ))}
          <span className="ml-1 text-xs font-semibold text-muted-foreground">
            {globalScore > 0 ? globalScore.toFixed(1) : '—'}
            {manga.ratingCount ? ` (${manga.ratingCount.toLocaleString('vi-VN')})` : ''}
          </span>
        </button>

        {/* Meta grid */}
        {(manga.chapterCount !== undefined || manga.followCount !== undefined) && (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            {manga.chapterCount !== undefined && (
              <MetaRow label="Số chương" value={String(manga.chapterCount)} />
            )}
            {manga.followCount !== undefined && (
              <MetaRow label="Theo dõi" value={manga.followCount.toLocaleString('vi-VN')} />
            )}
          </dl>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Link
            href={firstChapterUrl}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity shadow-sm"
          >
            <BookOpen className="h-4 w-4" />
            Đọc ngay
          </Link>

          {isAuthenticated && (
            <button
              onClick={() => followMutation.mutate(isFollowing)}
              disabled={followMutation.isPending}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold border-2 transition-colors ${
                isFollowing
                  ? 'bg-primary/15 border-primary text-primary'
                  : 'border-border text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/10'
              }`}
              aria-label={isFollowing ? 'Bỏ theo dõi' : 'Theo dõi'}
            >
              {isFollowing
                ? <HeartOff className="h-4 w-4" />
                : <Heart className="h-4 w-4" />}
              {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col">
      <dt className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}</dt>
      <dd className="text-sm font-semibold">{value}</dd>
    </div>
  )
}
