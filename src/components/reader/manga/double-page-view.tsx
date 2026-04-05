'use client'

import Image from 'next/image'

import { useImagePreloader } from '@/hooks/use-image-preloader'

interface DoublePageViewProps {
  pages: string[]
  currentPage: number
  onNext: () => void
  onPrev: () => void
}

export function DoublePageView({ pages, currentPage, onNext, onPrev }: DoublePageViewProps) {
  useImagePreloader(pages, currentPage, 3)

  const leftSrc = pages[currentPage]
  const rightSrc = pages[currentPage + 1]

  return (
    <div className="relative flex min-h-screen items-center justify-center gap-0.5">
      {/* Left page */}
      {leftSrc && (
        <div className="relative flex max-h-screen flex-1 justify-end">
          <Image
            src={leftSrc}
            alt={`Page ${currentPage + 1}`}
            width={600}
            height={900}
            className="max-h-screen w-auto select-none object-contain"
            priority
          />
        </div>
      )}

      {/* Right page */}
      {rightSrc ? (
        <div className="relative flex max-h-screen flex-1">
          <Image
            src={rightSrc}
            alt={`Page ${currentPage + 2}`}
            width={600}
            height={900}
            className="max-h-screen w-auto select-none object-contain"
            priority
          />
        </div>
      ) : (
        // Blank right side for odd last page
        <div className="flex-1" />
      )}

      {/* Click zones */}
      <button
        className="absolute left-0 top-0 h-full w-1/4 cursor-pointer opacity-0 focus-visible:bg-white/20"
        onClick={onPrev}
        aria-label="Previous spread"
      />
      <button
        className="absolute right-0 top-0 h-full w-1/4 cursor-pointer opacity-0 focus-visible:bg-white/20"
        onClick={onNext}
        aria-label="Next spread"
      />

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${((currentPage + 2) / pages.length) * 100}%` }}
        />
      </div>
    </div>
  )
}
