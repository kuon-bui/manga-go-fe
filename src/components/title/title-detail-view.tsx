'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Users } from 'lucide-react'

import { TitleHero } from '@/components/title/title-hero'
import { TitleSynopsis } from '@/components/title/title-synopsis'
import { ChapterList } from '@/components/title/chapter-list'
import { RatingModal } from '@/components/title/rating-modal'
import { CommentSection } from '@/components/comments/comment-section'
import { useMangaDetail, useChapterList } from '@/hooks/use-title-detail'
import { useReadingHistories } from '@/hooks/use-reading-history'
import { useAuthStore } from '@/stores/auth-store'
import { Skeleton } from '@/components/ui/skeleton'

interface TitleDetailViewProps {
  id: string // comicSlug from URL param
}

export function TitleDetailView({ id }: TitleDetailViewProps) {
  const [ratingOpen, setRatingOpen] = useState(false)

  const { data: manga, isLoading } = useMangaDetail(id)
  const { data: chaptersData, isLoading: chaptersLoading } = useChapterList(id)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  // Fetch only history for this specific comic
  const { data: historyData } = useReadingHistories(
    isAuthenticated && manga?.id ? { comicId: manga.id } : undefined
  )

  // Extract last read chapter ID if present
  const lastReadChapterId = historyData?.data?.[0]?.chapterId ?? null

  if (isLoading || !manga) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Hero: cover + metadata + actions */}
      <TitleHero manga={manga} onRateClick={() => setRatingOpen(true)} />

      {/* Synopsis */}
      <TitleSynopsis text={manga.description ?? ''} />

      {/* Translation Group Tribute */}
      {manga.translationGroup && (
        <div className="flex flex-col gap-2 rounded-2xl border border-primary/20 bg-primary/8 p-4 md:p-5 transition-colors hover:border-primary/40 hover:shadow-sakura-sm">
          <div className="flex items-center gap-2 text-primary font-semibold text-sm">
            <Users className="h-4 w-4" />
            <span>Nhóm Dịch</span>
          </div>
          <p className="text-sm text-muted-foreground break-words">
            Truyện được dịch và đăng tải bởi nhóm{' '}
            <Link href={`/groups/${manga.translationGroup.slug}`} className="font-bold text-foreground hover:text-primary transition-colors hover:underline">
              {manga.translationGroup.name}
            </Link>
            . Ủng hộ nhóm dịch để có thêm nhiều chương mới nhé!
          </p>
        </div>
      )}

      {/* Chapters header */}
      <div className="flex items-center justify-between pt-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          Danh Sách Chương
          {chaptersData && (
            <span className="rounded-full bg-muted-foreground/20 px-2 py-0.5 text-xs font-medium">
              {chaptersData.total}
            </span>
          )}
        </h2>
      </div>

      <div className="mt-2">
        <ChapterList
          chapters={chaptersData?.data ?? []}
          isLoading={chaptersLoading}
          comicSlug={id}
          contentType={manga.type}
          lastReadChapterId={lastReadChapterId}
        />
      </div>

      {/* Comments section */}
      <div className="pt-8">
        <h2 className="text-xl font-bold mb-6">Bình Luận</h2>
        <CommentSection scope={{ type: 'comic', comicId: manga.id }} />
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
