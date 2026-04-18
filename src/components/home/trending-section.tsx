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
    <div className="relative w-full bg-zinc-950 overflow-hidden h-[400px] md:h-[500px] group mb-8">
      {/* Blurred background */}
      {mangas.map((m, i) => (
        <div
          key={m.id}
          className={cn(
            'absolute inset-0 transition-opacity duration-1000 ease-in-out',
            i === currentIndex ? 'opacity-40' : 'opacity-0'
          )}
        >
          {m.thumbnail && (
            <Image
              src={m.thumbnail}
              alt={m.title}
              fill
              className="object-cover blur-md scale-110"
              priority={i === 0}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-zinc-950/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/60 to-transparent md:block hidden" />
        </div>
      ))}

      {/* Content wrapper */}
      <div className="container relative mx-auto h-full flex flex-col justify-end pb-12 pt-16 px-4 md:flex-row md:items-center md:pb-0 z-10">
        
        {/* Info */}
        <div className="flex-1 md:pr-12 animate-in slide-in-from-bottom-4 fade-in duration-500" key={active.id}>
          <div className="flex items-center gap-2 mb-3">
            <Badge className={active.type === 'manga' ? 'bg-blue-600' : 'bg-purple-600'}>
              {TYPE_LABEL[active.type]}
            </Badge>
            <span className="text-primary font-bold tracking-widest text-sm uppercase">#{currentIndex + 1} Trending</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white mb-2 line-clamp-2 leading-tight">
            {active.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-300 font-medium mb-4">
            {active.rating !== undefined && (
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                {active.rating.toFixed(1)}
              </span>
            )}
            <span className="flex items-center gap-1 capitalize">
              <Clock className="w-4 h-4" />
              {active.status}
            </span>
            {active.chapters && active.chapters.length > 0 && (
              <span className="bg-white/10 px-2 py-0.5 rounded-full">
                {active.chapters.length} Chương
              </span>
            )}
          </div>
          
          <div className="hidden md:block text-zinc-400 text-sm mb-6 max-w-2xl line-clamp-3">
            <p>Trải nghiệm ngay bộ truyện đang được đón đọc nhiều nhất trên nền tảng Manga-Go. Khám phá các diễn biến hấp dẫn mới nhất!</p>
          </div>

          <div className="flex gap-3 mt-4 md:mt-0">
            <Link
              href={`/titles/${active.slug}`}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2.5 rounded-full font-bold transition-transform hover:scale-105 active:scale-95"
            >
              Đọc Ngay
            </Link>
          </div>
        </div>

        {/* Cover Stand */}
        <div className="hidden md:block w-1/3 max-w-[280px] shrink-0 mr-[10%]">
          <div className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10 transform rotate-2 hover:rotate-0 transition-transform duration-500" key={`cover-${active.id}`}>
             {active.thumbnail ? (
               <Image
                 src={active.thumbnail}
                 alt={active.title}
                 fill
                 sizes="280px"
                 className="object-cover"
                 priority
               />
             ) : (
               <div className="flex h-full items-center justify-center bg-muted">
                 <BookOpen className="h-12 w-12 text-muted-foreground/40" />
               </div>
             )}
          </div>
        </div>

      </div>

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
