'use client'

import { SafeImage as Image } from '@/components/ui/safe-image'

import { useImagePreloader } from '@/hooks/use-image-preloader'
import { cn } from '@/lib/utils'

interface SinglePageViewProps {
  pages: string[]
  currentPage: number
  onNext: () => void
  onPrev: () => void
}

export function SinglePageView({ pages, currentPage, onNext, onPrev }: SinglePageViewProps) {
  useImagePreloader(pages, currentPage)

  const src = pages[currentPage]
  if (!src) return null

  return (
    <div className="relative flex min-h-screen items-center justify-center">
      {/* Page image */}
      <div className="relative max-h-screen max-w-3xl">
        <Image
          src={src}
          alt={`Page ${currentPage + 1}`}
          width={800}
          height={1200}
          className="max-h-screen w-auto select-none object-contain"
          unoptimized
          priority
        />
      </div>

      {/* Click zones */}
      <button
        className={cn(
          'absolute left-0 top-0 h-full w-1/3 cursor-pointer opacity-0',
          'focus-visible:opacity-20 focus-visible:bg-white'
        )}
        onClick={onPrev}
        aria-label="Previous page"
      />
      <button
        className={cn(
          'absolute right-0 top-0 h-full w-2/3 cursor-pointer opacity-0',
          'focus-visible:opacity-20 focus-visible:bg-white'
        )}
        onClick={onNext}
        aria-label="Next page"
      />

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${((currentPage + 1) / pages.length) * 100}%` }}
        />
      </div>
    </div>
  )
}
