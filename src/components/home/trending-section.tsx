'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { SafeImage as Image } from '@/components/ui/safe-image'
import { ChevronLeft, ChevronRight, BookOpen, Star } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useTrending } from '@/hooks/use-manga'
import { cn } from '@/lib/utils'

export function TrendingSection() {
  const { data, isLoading } = useTrending()
  const mangas = data?.data.slice(0, 7) ?? []
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (mangas.length <= 1) return
    const id = setInterval(() => setCurrent((p) => (p + 1) % mangas.length), 5000)
    return () => clearInterval(id)
  }, [mangas.length])

  const prev = useCallback(() => setCurrent((p) => (p - 1 + mangas.length) % mangas.length), [mangas.length])
  const next = useCallback(() => setCurrent((p) => (p + 1) % mangas.length), [mangas.length])

  if (isLoading) return <Skeleton className="h-56 md:h-72 w-full rounded-2xl" />
  if (!mangas.length) return null

  const active = mangas[current]

  return (
    <section className="cute-card relative overflow-hidden">
      <div className="grid md:grid-cols-[1fr_1.2fr] items-center gap-0">

        {/* Left — text */}
        <div
          key={`text-${active.id}`}
          className="p-6 md:p-10 relative z-10 animate-in fade-in slide-in-from-bottom-3 duration-500"
        >
          <p className="text-xs font-bold text-muted-foreground tracking-widest uppercase mb-2">
            ✦ Featured Manga
          </p>
          <h1 className="text-2xl md:text-4xl font-display font-bold leading-tight line-clamp-2">
            {active.title}
          </h1>

          <div className="flex flex-wrap items-center gap-2 mt-3 text-sm text-muted-foreground">
            {active.rating !== undefined && (
              <span className="flex items-center gap-1 font-semibold text-foreground">
                <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                {active.rating.toFixed(1)}
              </span>
            )}
            <span className="capitalize">{active.status}</span>
            <span className="cute-pill bg-secondary text-secondary-foreground capitalize">
              {active.type}
            </span>
          </div>

          {active.genres && active.genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {active.genres.slice(0, 4).map((g) => (
                <span key={g.id} className="cute-pill bg-muted text-muted-foreground border border-border">
                  {g.name}
                </span>
              ))}
            </div>
          )}

          <div className="mt-5 flex gap-3">
            <Link
              href={`/titles/${active.slug}`}
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" /> Đọc ngay
            </Link>
            <Link
              href="/browse"
              className="rounded-full bg-secondary px-5 py-2 text-sm font-semibold hover:bg-accent transition-colors"
            >
              Khám phá
            </Link>
          </div>
        </div>

        {/* Right — cover */}
        <div
          key={`cover-${active.id}`}
          className="relative h-56 md:h-72 animate-in fade-in slide-in-from-right-4 duration-500"
        >
          {active.thumbnail ? (
            <Image
              src={active.thumbnail}
              alt={active.title}
              fill
              className="object-cover object-center"
              priority={current === 0}
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-muted-foreground/40" />
            </div>
          )}
          {/* overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-l from-transparent via-transparent to-card/80 md:to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-card/60 to-transparent" />

          {/* Arrows */}
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-card/80 backdrop-blur p-2 hover:bg-card transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-card/80 backdrop-blur p-2 hover:bg-card transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Dots */}
      <div className="absolute bottom-3 left-6 z-20 flex gap-1.5">
        {mangas.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
            className={cn(
              'h-1.5 rounded-full transition-all duration-300',
              i === current ? 'w-5 bg-primary' : 'w-1.5 bg-border'
            )}
          />
        ))}
      </div>
    </section>
  )
}
