'use client'

import { useRef, useCallback, useState } from 'react'
import { SafeImage as Image } from '@/components/ui/safe-image'
import { MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ImageCommentModal } from './image-comment-modal'

import { useScrollProgress } from '@/hooks/use-scroll-progress'
import { useImagePreloader } from '@/hooks/use-image-preloader'
import { useAuthStore } from '@/stores/auth-store'
import { useMangaViewerStore } from '@/stores/manga-viewer-store'
import { apiClient } from '@/lib/api-client'
import { CommentSection } from '@/components/comments/comment-section'

interface VerticalScrollViewProps {
  pages: string[]
  comicSlug: string
  chapterSlug: string
  chapterId: string
  mangaId?: string
}

export function VerticalScrollView({ pages, comicSlug, chapterSlug, chapterId, mangaId }: VerticalScrollViewProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const { currentPage, controlsVisible } = useMangaViewerStore()
  const markedReadRef = useRef(false)

  const { observeElement } = useScrollProgress({
    comicSlug,
    chapterSlug,
    enabled: isAuthenticated,
  })

  // Preload ±2 pages around current
  useImagePreloader(pages, currentPage)

  // Called by PageImage when the last page enters the viewport
  const handleLastPageVisible = useCallback(() => {
    if (!isAuthenticated || markedReadRef.current) return
    markedReadRef.current = true
    apiClient.markChapterRead(comicSlug, chapterSlug).catch(() => undefined)
  }, [isAuthenticated, comicSlug, chapterSlug])

  return (
    <div className="flex flex-col items-center">
      {pages.map((src, i) => (
        <PageImage
          key={i}
          src={src}
          index={i}
          total={pages.length}
          controlsVisible={controlsVisible}
          observeElement={observeElement}
          onLastVisible={i === pages.length - 1 ? handleLastPageVisible : undefined}
        />
      ))}

      {/* Chapter comments at the bottom for long strip */}
      {mangaId && (
        <div className="w-full max-w-3xl mt-12 mb-20 px-4 md:px-0 relative z-20 stop-propagation">
          <h2 className="text-xl font-bold mb-6 text-foreground cursor-text">Bình luận chương</h2>
          <CommentSection scope={{ type: 'chapter', chapterId }} />
        </div>
      )}
    </div>
  )
}

// ─── Single page image ────────────────────────────────────────────────────────

interface PageImageProps {
  src: string
  index: number
  total: number
  controlsVisible: boolean
  observeElement: (_el: HTMLElement | null, _index: number, _total: number) => void
  onLastVisible?: () => void
}

function PageImage({ src, index, total, controlsVisible, observeElement, onLastVisible }: PageImageProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <div
        ref={(el) => {
          // Assign both local ref and observer
          ;(ref as React.MutableRefObject<HTMLDivElement | null>).current = el
          observeElement(el, index, total)
          // For the last page: attach a one-shot IntersectionObserver that calls onLastVisible
          if (el && onLastVisible) {
            const obs = new IntersectionObserver(
              ([entry]) => {
                if (entry.isIntersecting) {
                  onLastVisible()
                  obs.disconnect()
                }
              },
              { threshold: 0.5 }
            )
            obs.observe(el)
          }
        }}
        className="relative w-full max-w-3xl group"
      >
        <Image
          src={src}
          alt={`Page ${index + 1}`}
          width={800}
          height={1200}
          className="h-auto w-full select-none"
          unoptimized
          loading={index < 3 ? 'eager' : 'lazy'}
          priority={index < 2}
        />
        
        {/* Floating action button */}
        <div className={cn(
          "absolute bottom-4 right-4 z-20 transition-opacity duration-300",
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
        pageIndex={index}
      />
    </>
  )
}

