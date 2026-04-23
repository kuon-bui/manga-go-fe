'use client'

import { useEffect, useRef, useState } from 'react'
import { SafeImage as Image } from '@/components/ui/safe-image'
import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ImageCommentModal } from './image-comment-modal'

import { useMangaViewerStore } from '@/stores/manga-viewer-store'
import { useImagePreloader } from '@/hooks/use-image-preloader'
import { useAuthStore } from '@/stores/auth-store'
import { apiClient } from '@/lib/api-client'

interface SinglePageViewProps {
  pages: string[]
  currentPage: number
  comicSlug: string
  chapterSlug: string
  chapterId: string
  mangaId: string
}

export function SinglePageView({
  pages,
  currentPage,
  comicSlug,
  chapterSlug,
  chapterId,
  mangaId,
}: SinglePageViewProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const { controlsVisible } = useMangaViewerStore()
  const markedReadRef = useRef(false)
  const [modalOpen, setModalOpen] = useState(false)

  useImagePreloader(pages, currentPage)

  // Mark chapter as read when user reaches the last page
  useEffect(() => {
    if (!isAuthenticated || markedReadRef.current) return
    if (currentPage === pages.length - 1 && pages.length > 0) {
      markedReadRef.current = true
      apiClient.markChapterRead(comicSlug, chapterSlug).catch(() => undefined)
    }
  }, [currentPage, pages.length, isAuthenticated, comicSlug, chapterSlug])

  const src = pages[currentPage]
  if (!src) return null

  return (
    <div className="relative flex min-h-screen items-center justify-center">
      {/* Page image */}
      <div className="relative max-h-screen max-w-3xl group">
        <Image
          src={src}
          alt={`Page ${currentPage + 1}`}
          width={800}
          height={1200}
          className="max-h-screen w-auto select-none object-contain"
          unoptimized
          priority
        />
        
        {/* Floating action button */}
        <div className={cn(
          "absolute bottom-6 right-6 z-20 transition-opacity duration-300",
          controlsVisible ? "opacity-100" : "opacity-0 md:group-hover:opacity-100"
        )}>
          <Button 
            variant="secondary" 
            size="icon" 
            className="rounded-full shadow-sakura-sm bg-background/80 hover:bg-primary/15 text-foreground hover:text-primary border border-border backdrop-blur-md"
            onClick={(e) => {
              e.stopPropagation()
              setModalOpen(true)
            }}
          >
            <MessageCircle className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <ImageCommentModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        imageSrc={src}
        pageIndex={currentPage}
        chapterId={chapterId}
        comicId={mangaId}
      />
    </div>
  )
}
