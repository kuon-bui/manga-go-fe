'use client'

import { useState } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { TitleHero } from '@/components/title/title-hero'
import { TitleSynopsis } from '@/components/title/title-synopsis'
import { ChapterList } from '@/components/title/chapter-list'
import { RatingModal } from '@/components/title/rating-modal'
import { CommentSection } from '@/components/comments/comment-section'
import { useMangaDetail, useChapterList } from '@/hooks/use-title-detail'
import { Skeleton } from '@/components/ui/skeleton'

interface TitleDetailViewProps {
  id: string // comicSlug from URL param
}

export function TitleDetailView({ id }: TitleDetailViewProps) {
  const [ratingOpen, setRatingOpen] = useState(false)

  const { data: manga, isLoading } = useMangaDetail(id)
  const { data: chaptersData, isLoading: chaptersLoading } = useChapterList(id)

  // Use latest chapter's id for comments (API requires a chapterId)
  const latestChapterId = chaptersData?.data?.[0]?.id ?? manga?.chapters?.[0]?.id ?? ''

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

      {/* Tabs: Chapters / Comments */}
      <Tabs defaultValue="chapters">
        <TabsList>
          <TabsTrigger value="chapters">
            Chapters
            {chaptersData && (
              <span className="ml-1.5 rounded-full bg-muted-foreground/20 px-1.5 py-0.5 text-xs">
                {chaptersData.total}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="comments">Comments</TabsTrigger>
        </TabsList>

        <TabsContent value="chapters" className="mt-4">
          <ChapterList
            chapters={chaptersData?.data ?? []}
            isLoading={chaptersLoading}
            comicSlug={id}
            contentType={manga.type}
          />
        </TabsContent>

        <TabsContent value="comments" className="mt-4">
          <CommentSection chapterId={latestChapterId} />
        </TabsContent>
      </Tabs>

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
