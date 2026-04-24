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
    <section className="cute-card relative overflow-hidden rounded-2xl">

      {/* ── Blurred background cover ─────────────────────── */}
      <div key={`bg-${active.id}`} className="absolute inset-0 z-0 animate-in fade-in duration-700">
        {active.thumbnail && (
          <Image
            src={active.thumbnail}
            alt=""
            fill
            aria-hidden
            className="object-cover object-center scale-110 blur-2xl brightness-50 saturate-150"
            priority={current === 0}
          />
        )}
        {/* dark overlay for readability */}
        <div className="absolute inset-0 bg-card/60 dark:bg-card/70" />
      </div>

      {/* ── Content grid ─────────────────────────────────── */}
      <div className="relative z-10 grid md:grid-cols-[1fr_auto] items-center gap-0">

        {/* Left — text */}
        <div
          key={`text-${active.id}`}
          className="p-6 md:p-10 animate-in fade-in slide-in-from-bottom-3 duration-500"
        >
          <p className="text-xs font-bold tracking-widest uppercase mb-2 text-white/70">
            ✦ Featured Manga
          </p>
          <h1 className="text-2xl md:text-4xl font-display font-bold leading-tight line-clamp-2 text-white drop-shadow-sm">
            {active.title}
          </h1>

          <div className="flex flex-wrap items-center gap-2 mt-3 text-sm text-white/70">
            {active.rating !== undefined && (
              <span className="flex items-center gap-1 font-semibold text-white">
                <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                {active.rating.toFixed(1)}
              </span>
            )}
            <span className="capitalize">{active.status}</span>
            <span className="cute-pill bg-white/10 text-white border-white/20 capitalize">
              {active.type}
            </span>
          </div>

          {active.genres && active.genres.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {active.genres.slice(0, 4).map((g) => (
                <span key={g.id} className="cute-pill bg-white/10 text-white/90 border-white/20">
                  {g.name}
                </span>
              ))}
            </div>
          )}

          <div className="mt-5 flex gap-3">
            <Link
              href={`/titles/${active.slug}`}
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg"
            >
              <BookOpen className="h-4 w-4" /> Đọc ngay
            </Link>
            <Link
              href="/browse"
              className="rounded-full bg-white/15 backdrop-blur px-5 py-2 text-sm font-semibold text-white hover:bg-white/25 transition-colors border border-white/20"
            >
              Khám phá
            </Link>
          </div>

          {/* Dots */}
          <div className="mt-6 flex gap-1.5">
            {mangas.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Slide ${i + 1}`}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === current ? 'w-5 bg-primary' : 'w-1.5 bg-white/30'
                )}
              />
            ))}
          </div>
        </div>

        {/* Right — cover card + arrows */}
        <div
          key={`cover-${active.id}`}
          className="hidden md:flex items-center justify-center gap-3 pr-8 py-6 animate-in fade-in slide-in-from-right-4 duration-500"
        >
          <button
            onClick={prev}
            className="rounded-full bg-white/10 backdrop-blur border border-white/20 p-2 hover:bg-white/25 transition-colors text-white shrink-0"
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Cover with shadow */}
          <div className="relative h-52 w-36 shrink-0 rounded-xl overflow-hidden shadow-2xl shadow-black/60 ring-1 ring-white/10">
            {active.thumbnail ? (
              <Image
                src={active.thumbnail}
                alt={active.title}
                fill
                className="object-cover"
                priority={current === 0}
              />
            ) : (
              <div className="w-full h-full bg-muted/30 flex items-center justify-center">
                <BookOpen className="h-10 w-10 text-white/30" />
              </div>
            )}
          </div>

          <button
            onClick={next}
            className="rounded-full bg-white/10 backdrop-blur border border-white/20 p-2 hover:bg-white/25 transition-colors text-white shrink-0"
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mobile arrows overlay */}
      <button
        onClick={prev}
        className="md:hidden absolute left-3 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/30 backdrop-blur border border-white/20 p-2 text-white"
        aria-label="Previous"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        onClick={next}
        className="md:hidden absolute right-3 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/30 backdrop-blur border border-white/20 p-2 text-white"
        aria-label="Next"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </section>
  )
}
