'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown, MessageSquare, List } from 'lucide-react'

import { TitleHero }            from '@/components/title/title-hero'
import { TitleSynopsis }        from '@/components/title/title-synopsis'
import { ChapterList }          from '@/components/title/chapter-list'
import { TitleSidebar }         from '@/components/title/title-sidebar'
import { TitleRecommendations } from '@/components/title/title-recommendations'
import { RatingModal }          from '@/components/title/rating-modal'
import { CommentSection }       from '@/components/comments/comment-section'
import { Skeleton }             from '@/components/ui/skeleton'
import { cn }                   from '@/lib/utils'

import { useMangaDetail, useChapterList } from '@/hooks/use-title-detail'
import { useReadingHistories }            from '@/hooks/use-reading-history'
import { useAuthStore }                   from '@/stores/auth-store'

interface TitleDetailViewProps {
  id: string
}

export function TitleDetailView({ id }: TitleDetailViewProps) {
  const [ratingOpen,   setRatingOpen]   = useState(false)
  const [chaptersOpen, setChaptersOpen] = useState(true)
  const [commentsOpen, setCommentsOpen] = useState(false)

  const { data: manga,        isLoading }         = useMangaDetail(id)
  const { data: chaptersData, isLoading: chaptersLoading } = useChapterList(id)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const { data: historyData } = useReadingHistories(
    isAuthenticated && manga?.id ? { comicId: manga.id } : undefined
  )
  const lastReadChapterId = historyData?.data?.[0]?.chapterId ?? null

  /* ── Skeleton ──────────────────────────────────────────── */
  if (isLoading || !manga) {
    return (
      <div className="mx-auto max-w-7xl px-4 md:px-6 pt-4 pb-10">
        <div className="grid lg:grid-cols-[1fr_300px] gap-6">
          <div className="space-y-6">
            <div className="cute-card p-5">
              <div className="grid sm:grid-cols-[160px_1fr] gap-5">
                <Skeleton className="aspect-[3/4] w-[160px] rounded-2xl" />
                <div className="space-y-3">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-2/5" />
                  <div className="flex gap-2 pt-1">
                    <Skeleton className="h-9 w-28 rounded-full" />
                    <Skeleton className="h-9 w-28 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-40 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    )
  }

  const chapterCount = chaptersData?.total ?? 0

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 pt-4 pb-10 space-y-6">

      {/* ── Main grid: content + sidebar ─────────────────────────── */}
      <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">

        {/* ── LEFT: main content ─────────────────────────────────── */}
        <div className="space-y-6 min-w-0">

          {/* Info card */}
          <section className="cute-card p-5 space-y-5">
            <TitleHero manga={manga} onRateClick={() => setRatingOpen(true)} />
            <div className="h-px bg-border/60" />
            <TitleSynopsis text={manga.description ?? ''} />
          </section>

          {/* Chapter list card */}
          <section className="cute-card p-5 flex flex-col gap-4">
            <button
              onClick={() => setChaptersOpen((v) => !v)}
              className="flex w-full items-center justify-between"
            >
              <h2 className="font-display text-lg font-bold flex items-center gap-2">
                <List className="h-5 w-5 text-primary" />
                Danh Sách Chương
                {chapterCount > 0 && (
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                    {chapterCount}
                  </span>
                )}
              </h2>
              {chaptersOpen
                ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>

            <div className={cn(!chaptersOpen && 'hidden')}>
              <ChapterList
                chapters={chaptersData?.data ?? []}
                isLoading={chaptersLoading}
                comicSlug={id}
                contentType={manga.type}
                lastReadChapterId={lastReadChapterId}
              />
            </div>
          </section>

          {/* Recommendations */}
          <TitleRecommendations excludeSlug={id} />

          {/* Comments */}
          <section className="cute-card p-5 space-y-4">
            <button
              onClick={() => setCommentsOpen((v) => !v)}
              className="flex w-full items-center justify-between"
            >
              <h2 className="font-display text-lg font-bold flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Bình Luận
              </h2>
              {commentsOpen
                ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>

            {commentsOpen && (
              <CommentSection scope={{ type: 'comic', comicId: manga.id }} />
            )}
          </section>
        </div>

        {/* ── RIGHT: sidebar ─────────────────────────────────────── */}
        <aside className="hidden lg:block">
          <TitleSidebar manga={manga} />
        </aside>
      </div>

      {/* Sidebar on mobile (below main content) */}
      <div className="lg:hidden">
        <TitleSidebar manga={manga} />
      </div>

      {/* Rating modal */}
      <RatingModal
        open={ratingOpen}
        onOpenChange={setRatingOpen}
        mangaId={manga.slug ?? id}
        mangaTitle={manga.title}
      />
    </div>
  )
}
