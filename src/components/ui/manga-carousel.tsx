'use client'

import { useRef, useState, useCallback, type ReactNode } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MangaCarouselProps {
  children: ReactNode
  className?: string
}

export function MangaCarousel({ children, className }: MangaCarouselProps) {
  const trackRef  = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [canScrollLeft,  setCanScrollLeft]  = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const dragStart = useRef({ x: 0, scrollLeft: 0 })

  const syncArrows = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }, [])

  const scroll = (dir: 'left' | 'right') => {
    const el = trackRef.current
    if (!el) return
    const amount = el.clientWidth * 0.75
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
    setTimeout(syncArrows, 350)
  }

  /* ── Mouse drag ─────────────────────────────────────── */
  const onMouseDown = (e: React.MouseEvent) => {
    const el = trackRef.current
    if (!el) return
    setIsDragging(true)
    dragStart.current = { x: e.clientX, scrollLeft: el.scrollLeft }
    el.style.cursor = 'grabbing'
    el.style.userSelect = 'none'
  }

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    const el = trackRef.current
    if (!el) return
    el.scrollLeft = dragStart.current.scrollLeft - (e.clientX - dragStart.current.x)
    syncArrows()
  }

  const stopDrag = () => {
    const el = trackRef.current
    if (!el) return
    setIsDragging(false)
    el.style.cursor = 'grab'
    el.style.userSelect = ''
  }

  /* ── Touch drag ─────────────────────────────────────── */
  const onTouchStart = (e: React.TouchEvent) => {
    const el = trackRef.current
    if (!el) return
    dragStart.current = { x: e.touches[0].clientX, scrollLeft: el.scrollLeft }
  }

  const onTouchMove = (e: React.TouchEvent) => {
    const el = trackRef.current
    if (!el) return
    el.scrollLeft = dragStart.current.scrollLeft - (e.touches[0].clientX - dragStart.current.x)
    syncArrows()
  }

  return (
    <div className={cn('relative group/carousel', className)}>
      {/* Left arrow */}
      <button
        onClick={() => scroll('left')}
        aria-label="Cuộn trái"
        className={cn(
          'absolute left-0 top-1/2 -translate-y-1/2 z-10 -translate-x-3',
          'h-9 w-9 rounded-full bg-card border border-border shadow-md',
          'flex items-center justify-center text-foreground',
          'opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200',
          'hover:bg-primary hover:text-primary-foreground hover:border-primary',
          !canScrollLeft && 'pointer-events-none !opacity-0',
        )}
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Track */}
      <div
        ref={trackRef}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={stopDrag}
        onMouseLeave={stopDrag}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={syncArrows}
        onScroll={syncArrows}
        className="flex gap-3 overflow-x-auto scrollbar-none cursor-grab select-none pb-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>

      {/* Right arrow */}
      <button
        onClick={() => scroll('right')}
        aria-label="Cuộn phải"
        className={cn(
          'absolute right-0 top-1/2 -translate-y-1/2 z-10 translate-x-3',
          'h-9 w-9 rounded-full bg-card border border-border shadow-md',
          'flex items-center justify-center text-foreground',
          'opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-200',
          'hover:bg-primary hover:text-primary-foreground hover:border-primary',
          !canScrollRight && 'pointer-events-none !opacity-0',
        )}
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}
