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

interface DoublePageViewProps {
  pages: string[]
  currentPage: number
  comicSlug: string
  chapterSlug: string
  chapterId: string
  mangaId: string
}

export function DoublePageView({ pages, currentPage, comicSlug, chapterSlug, chapterId, mangaId }: DoublePageViewProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const { controlsVisible } = useMangaViewerStore()
  const markedReadRef = useRef(false)
  const [activeModalIndex, setActiveModalIndex] = useState<number | null>(null)

  useImagePreloader(pages, currentPage, 3)

  // Mark chapter as read when user reaches the last page or the second to last page
  useEffect(() => {
    if (!isAuthenticated || markedReadRef.current) return
    if (currentPage >= pages.length - 2 && pages.length > 0) {
      markedReadRef.current = true
      apiClient.markChapterRead(comicSlug, chapterSlug).catch(() => undefined)
    }
  }, [currentPage, pages.length, isAuthenticated, comicSlug, chapterSlug])

  const leftSrc = pages[currentPage]
  const rightSrc = pages[currentPage + 1]

  return (
    <div className="relative flex min-h-screen items-center justify-center gap-0.5">
      {/* Left page */}
      {leftSrc && (
        <div className="relative flex max-h-screen flex-1 justify-end group">
          <Image
            src={leftSrc}
            alt={`Page ${currentPage + 1}`}
            width={600}
            height={900}
            className="max-h-screen w-auto select-none object-contain"
            unoptimized
            priority
          />
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
                setActiveModalIndex(currentPage)
              }}
            >
              <MessageCircle className="w-5 h-5" />
            </Button>
          </div>
        </div>
      )}

      {/* Right page */}
      {rightSrc ? (
        <div className="relative flex max-h-screen flex-1 group">
          <Image
            src={rightSrc}
            alt={`Page ${currentPage + 2}`}
            width={600}
            height={900}
            className="max-h-screen w-auto select-none object-contain"
            unoptimized
            priority
          />
          <div className={cn(
            "absolute bottom-6 left-6 z-20 transition-opacity duration-300",
            controlsVisible ? "opacity-100" : "opacity-0 md:group-hover:opacity-100"
          )}>
            <Button 
              variant="secondary" 
              size="icon" 
              className="rounded-full shadow-sakura-sm bg-background/80 hover:bg-primary/15 text-foreground hover:text-primary border border-border backdrop-blur-md"
              onClick={(e) => {
                e.stopPropagation()
                setActiveModalIndex(currentPage + 1)
              }}
            >
              <MessageCircle className="w-5 h-5" />
            </Button>
          </div>
        </div>
      ) : (
        // Blank right side for odd last page
        <div className="flex-1" />
      )}

      {activeModalIndex !== null && (
        <ImageCommentModal
          open={true}
          onOpenChange={(open) => !open && setActiveModalIndex(null)}
          imageSrc={pages[activeModalIndex]!}
          pageIndex={activeModalIndex}
          chapterId={chapterId}
          comicId={mangaId}
        />
      )}
    </div>
  )
}
