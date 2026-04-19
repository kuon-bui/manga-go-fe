'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { SafeImage as Image } from '@/components/ui/safe-image'
import { ChevronLeft, ChevronRight, BookOpen, Star, Clock } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useTrending } from '@/hooks/use-manga'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

const TYPE_LABEL = {
  manga: 'Manga',
  novel: 'Novel'
}

export function TrendingSection() {
  const { data, isLoading } = useTrending()
  const mangas = data?.data.slice(0, 7) || []
  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto rotate
  useEffect(() => {
    if (mangas.length <= 1) return
    const id = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mangas.length)
    }, 5000)
    return () => clearInterval(id)
  }, [mangas.length])

  const next = useCallback(() => {
    setCurrentIndex((p) => (p + 1) % mangas.length)
  }, [mangas.length])

  const prev = useCallback(() => {
    setCurrentIndex((p) => (p - 1 + mangas.length) % mangas.length)
  }, [mangas.length])

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full md:h-[500px]" />
  }

  if (!mangas.length) return null

  const active = mangas[currentIndex]

  return (
    <div className="relative w-full bg-background overflow-hidden h-[300px] md:h-[400px] group mb-8 border-b border-border">
      {/* Blurred background */}
      {mangas.map((m, i) => (
        <div
          key={m.id}
          className={cn(
            'absolute inset-0 transition-opacity duration-1000 ease-in-out',
            i === currentIndex ? 'opacity-100' : 'opacity-0'
          )}
        >
          {m.thumbnail && (
            <Image
              src={m.thumbnail}
              alt={m.title}
              fill
              className="object-cover object-center blur-lg opacity-100 dark:opacity-100"
              priority={i === 0}
            />
          )}
          {/* Chỉ dùng một lớp gradient mỏng để dễ đọc text, giữ lại màu sắc rực rỡ của bìa */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/20 to-transparent" />
        </div>
      ))}

      {/* Content wrapper */}
      <Link
        href={`/titles/${active.slug}`}
        className="max-w-screen-2xl relative mx-auto h-full w-full flex flex-row items-center justify-start pb-6 pt-16 px-4 md:px-8 gap-4 md:gap-8 z-10 transition-transform duration-300"
      >
        {/* Cover Stand (Visible on all screens now) */}
        <div className="w-[100px] sm:w-[140px] md:w-1/4 md:max-w-[220px] shrink-0">
          <div className="relative aspect-[3/4] rounded-lg md:rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/20" key={`cover-${active.id}`}>
            {active.thumbnail ? (
              <Image
                src={active.thumbnail}
                alt={active.title}
                fill
                sizes="(max-width: 768px) 140px, 220px"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-muted">
                <BookOpen className="h-10 w-10 text-muted-foreground/40" />
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 md:pr-8 animate-in slide-in-from-right-8 fade-in duration-500" key={active.id}>
          <div className="flex items-center gap-2 mb-1.5 md:mb-2">
            <span className="text-primary font-black tracking-widest text-[10px] md:text-xs uppercase">#{currentIndex + 1} Trending</span>
          </div>

          <h1 className="text-lg sm:text-xl md:text-3xl lg:text-5xl font-black text-foreground mb-1.5 md:mb-3 line-clamp-2 leading-tight">
            {active.title}
          </h1>

          <div className="flex flex-wrap items-center gap-1.5 md:gap-3 text-[10px] md:text-sm text-muted-foreground font-medium mb-1.5 md:mb-3">
            <Badge className={active.type === 'manga' ? 'bg-blue-600/90 text-white' : 'bg-purple-600/90 text-white'} style={{ fontSize: '10px', padding: '0 6px' }}>
              {TYPE_LABEL[active.type]}
            </Badge>
            {active.rating !== undefined && (
              <span className="flex items-center gap-0.5 text-yellow-500">
                <Star className="w-3 h-3 md:w-4 md:h-4 fill-yellow-500" />
                {active.rating.toFixed(1)}
              </span>
            )}
            <span className="flex items-center gap-0.5 capitalize min-w-0">
              <Clock className="w-3 h-3 md:w-4 md:h-4 shrink-0" />
              <span className="truncate">{active.status}</span>
            </span>
            {active.chapters && active.chapters.length > 0 && (
              <span className="bg-foreground/10 px-1.5 md:px-2 py-0.5 rounded-full whitespace-nowrap">
                {active.chapters.length} Chương
              </span>
            )}
          </div>

          {active.genres && active.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 md:gap-1.5 mb-2 md:mb-4">
              {active.genres.slice(0, 4).map(g => (
                <span key={g.id} className="text-[9px] md:text-xs px-1.5 py-0.5 border border-border text-foreground/80 rounded bg-background/50 backdrop-blur-sm whitespace-nowrap">
                  {g.name}
                </span>
              ))}
            </div>
          )}

          {active.description && (
            <div className="hidden sm:block text-muted-foreground text-xs md:text-sm mb-4 max-w-2xl line-clamp-2 md:line-clamp-3 leading-relaxed">
              <p>{active.description}</p>
            </div>
          )}
        </div>
      </Link>

      {/* Navigation Controls */}
      <div className="absolute bottom-6 right-6 md:right-12 z-20 flex gap-2">
        <button
          onClick={prev}
          className="h-10 w-10 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-md text-white border border-white/10 hover:bg-white/20 transition-colors"
          aria-label="Sau"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={next}
          className="h-10 w-10 flex items-center justify-center rounded-full bg-black/50 backdrop-blur-md text-white border border-white/10 hover:bg-white/20 transition-colors"
          aria-label="Tiếp"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Track Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-1.5 md:hidden">
        {mangas.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === currentIndex ? "bg-primary w-6" : "bg-white/40 w-1.5"
            )}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
