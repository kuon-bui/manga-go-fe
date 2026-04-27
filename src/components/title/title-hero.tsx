'use client'

import { useState } from 'react'
import { SafeImage as Image } from '@/components/ui/safe-image'
import Link from 'next/link'
import { BookOpen, Heart, Star, Pencil, ChevronDown, Check } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/stores/auth-store'
import { useFollowStatus, useFollow, useChangeFollowStatus, useUserRating } from '@/hooks/use-title-detail'
import { cn } from '@/lib/utils'
import type { Manga, ContentStatus, ContentType, FollowStatus } from '@/types'

/* ── Constants ────────────────────────────────────────────────────────────── */

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
  manga:   'Manga',
  manhwa:  'Manhwa',
  manhua:  'Manhua',
  comic:   'Comic',
  novel:   'Novel',
}

// Color for the type badge above cover
const TYPE_COLOR: Record<ContentType, string> = {
  manga:  'bg-[hsl(340_80%_92%)] text-[hsl(340_60%_38%)] border-[hsl(340_60%_85%)] dark:bg-[hsl(340_50%_22%)] dark:text-[hsl(340_80%_82%)] dark:border-[hsl(340_40%_30%)]',
  manhwa: 'bg-[hsl(200_80%_90%)] text-[hsl(200_60%_35%)] border-[hsl(200_60%_82%)] dark:bg-[hsl(200_50%_20%)] dark:text-[hsl(200_80%_78%)] dark:border-[hsl(200_40%_28%)]',
  manhua: 'bg-[hsl(30_90%_90%)]  text-[hsl(30_70%_35%)]  border-[hsl(30_70%_82%)]  dark:bg-[hsl(30_50%_20%)]  dark:text-[hsl(30_80%_78%)]  dark:border-[hsl(30_40%_28%)]',
  comic:  'bg-[hsl(140_60%_90%)] text-[hsl(140_50%_30%)] border-[hsl(140_50%_82%)] dark:bg-[hsl(140_40%_20%)] dark:text-[hsl(140_60%_75%)] dark:border-[hsl(140_30%_28%)]',
  novel:  'bg-[hsl(280_65%_92%)] text-[hsl(280_50%_38%)] border-[hsl(280_50%_85%)] dark:bg-[hsl(280_40%_22%)] dark:text-[hsl(280_60%_80%)] dark:border-[hsl(280_30%_30%)]',
}

const FOLLOW_STATUS_OPTIONS: { value: FollowStatus; label: string; emoji: string }[] = [
  { value: 'reading',   label: 'Đang đọc',    emoji: '📖' },
  { value: 'planned',   label: 'Dự định đọc', emoji: '🔖' },
  { value: 'completed', label: 'Đã đọc xong', emoji: '✅' },
  { value: 'dropped',   label: 'Bỏ dở',       emoji: '🚫' },
  { value: 'favorite',  label: 'Yêu thích',   emoji: '❤️' },
]

/* ── Props ────────────────────────────────────────────────────────────────── */

interface TitleHeroProps {
  manga: Manga
  onRateClick: () => void
}

/* ── Component ────────────────────────────────────────────────────────────── */

export function TitleHero({ manga, onRateClick }: TitleHeroProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user            = useAuthStore((s) => s.user)

  const { data: followStatus } = useFollowStatus(manga.slug ?? manga.id)
  const followMutation         = useFollow(manga.slug ?? manga.id)
  const changeStatusMutation   = useChangeFollowStatus(manga.slug ?? manga.id)
  const { data: userRating }   = useUserRating(manga.slug ?? manga.id)

  const [statusOpen, setStatusOpen] = useState(false)

  const isFollowing   = followStatus?.isFollowed ?? followStatus?.isFollowing ?? false
  const currentStatus = followStatus?.followStatus

  const currentOption = FOLLOW_STATUS_OPTIONS.find((o) => o.value === currentStatus)

  const isUploader = user && (
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

  // Rating: 5 stars (score 1–5 per swagger)
  const ratingScore = userRating?.score ?? 0
  const globalScore = manga.rating ?? 0
  const filledStars = userRating ? Math.round(ratingScore) : Math.round(globalScore)

  return (
    <div className="grid sm:grid-cols-[160px_1fr] gap-5">

      {/* ── Cover column ──────────────────────────────────────── */}
      <div className="mx-auto sm:mx-0 shrink-0 flex flex-col gap-2">
        {/* Type badge — full cover width */}
        <div className={cn('w-[160px] flex items-center justify-center rounded-xl py-1.5 text-sm font-bold tracking-wide border', TYPE_COLOR[manga.type] ?? TYPE_COLOR.manga)}>
          {TYPE_LABEL[manga.type] ?? manga.type}
        </div>

        <div className="relative w-[160px] aspect-[3/4] overflow-hidden rounded-2xl shadow-lg ring-1 ring-border">
          {manga.thumbnail ? (
            <Image src={manga.thumbnail} alt={`Cover of ${manga.title}`} fill sizes="160px" className="object-cover" priority />
          ) : (
            <div className="flex h-full items-center justify-center bg-muted text-muted-foreground text-xs">No cover</div>
          )}
        </div>
      </div>

      {/* ── Info column ───────────────────────────────────────── */}
      <div className="flex flex-col gap-3 min-w-0 relative">

        {/* Edit — top right */}
        {isUploader && (
          <Link
            href={`/dashboard/title/${manga.slug}`}
            className="absolute top-0 right-0 inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-primary hover:text-primary transition-colors"
          >
            <Pencil className="h-3 w-3" /> Sửa
          </Link>
        )}

        {/* Title */}
        <div className="pr-16">
          <h1 className="font-display text-2xl md:text-3xl font-bold leading-tight">{manga.title}</h1>
          {(manga.alternativeTitles?.length ?? 0) > 0 && (
            <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
              {manga.alternativeTitles!.slice(0, 2).join(' · ')}
            </p>
          )}
        </div>

        {/* Author */}
        <p className="text-sm text-muted-foreground -mt-1">{authorNames}</p>

        {/* Genres */}
        {manga.genres.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {manga.genres.map((g) => (
              <Link key={g.id} href={`/browse?genre=${g.slug}`}
                className="cute-pill bg-secondary text-secondary-foreground hover:bg-primary/15 hover:text-primary transition-colors border border-transparent hover:border-primary/30">
                {g.name}
              </Link>
            ))}
          </div>
        )}

        {/* Status badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
            <span className={cn('h-2 w-2 rounded-full', STATUS_DOT[manga.status])} />
            {STATUS_LABEL[manga.status]}
          </span>
          {manga.ageRating && manga.ageRating !== 'ALL' && <Badge variant="outline">{manga.ageRating}</Badge>}
          {manga.publishedYear && <Badge variant="outline">{manga.publishedYear}</Badge>}
        </div>

        {/* Rating stars */}
        <button
          onClick={isAuthenticated ? onRateClick : undefined}
          className={cn('flex items-center gap-1 w-fit', isAuthenticated ? 'cursor-pointer group' : 'cursor-default')}
          aria-label={isAuthenticated ? 'Đánh giá truyện' : undefined}
          title={isAuthenticated ? 'Nhấn để đánh giá' : `Điểm: ${globalScore.toFixed(1)}/5`}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className={cn('h-4 w-4 transition-colors',
              i < filledStars ? 'fill-warning text-warning' : 'fill-transparent text-border group-hover:text-warning/60')} />
          ))}
          <span className="ml-1 text-xs font-semibold text-muted-foreground">
            {globalScore > 0 ? globalScore.toFixed(1) : '—'}
            {manga.ratingCount ? ` (${manga.ratingCount.toLocaleString('vi-VN')})` : ''}
          </span>
        </button>

        {/* Meta */}
        {(manga.chapterCount !== undefined || manga.followCount !== undefined) && (
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            {manga.chapterCount !== undefined && <MetaRow label="Số chương" value={String(manga.chapterCount)} />}
            {manga.followCount  !== undefined && <MetaRow label="Theo dõi"  value={manga.followCount.toLocaleString('vi-VN')} />}
          </dl>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <Link href={firstChapterUrl}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity shadow-sm">
            <BookOpen className="h-4 w-4" /> Đọc ngay
          </Link>

          {isAuthenticated && (
            <div className="relative">
              {/* Not following — simple follow button */}
              {!isFollowing ? (
                <button
                  onClick={() => followMutation.mutate(false)}
                  disabled={followMutation.isPending}
                  className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold border-2 border-border text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <Heart className="h-4 w-4" /> Theo dõi
                </button>
              ) : (
                /* Following — split button: status label | dropdown arrow */
                <div className="inline-flex rounded-full border-2 border-primary overflow-hidden">
                  <button
                    onClick={() => setStatusOpen((v) => !v)}
                    className="inline-flex items-center gap-1.5 pl-4 pr-2 py-2 text-sm font-semibold bg-primary/15 text-primary hover:bg-primary/25 transition-colors"
                  >
                    <span>{currentOption?.emoji ?? '❤️'}</span>
                    <span className="hidden sm:inline">{currentOption?.label ?? 'Theo dõi'}</span>
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => followMutation.mutate(true)}
                    disabled={followMutation.isPending}
                    className="px-2 py-2 bg-primary/15 text-primary border-l border-primary/30 hover:bg-destructive/15 hover:text-destructive hover:border-destructive/30 transition-colors text-xs font-bold"
                    title="Bỏ theo dõi"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Status dropdown */}
              {statusOpen && isFollowing && (
                <div className="absolute left-0 top-full mt-1.5 z-20 w-44 rounded-2xl border border-border bg-popover shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                  {FOLLOW_STATUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        changeStatusMutation.mutate(opt.value)
                        setStatusOpen(false)
                      }}
                      className={cn(
                        'flex w-full items-center gap-2.5 px-3 py-2.5 text-sm font-semibold transition-colors hover:bg-secondary/60',
                        currentStatus === opt.value && 'text-primary bg-primary/5'
                      )}
                    >
                      <span>{opt.emoji}</span>
                      <span className="flex-1 text-left">{opt.label}</span>
                      {currentStatus === opt.value && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
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
