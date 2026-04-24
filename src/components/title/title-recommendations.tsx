'use client'

import Link from 'next/link'
import { Sparkles, BookOpen } from 'lucide-react'
import { SafeImage as Image } from '@/components/ui/safe-image'
import { MangaCarousel } from '@/components/ui/manga-carousel'
import { Skeleton } from '@/components/ui/skeleton'
import { useTrending } from '@/hooks/use-manga'
import type { Manga } from '@/types'

function RecommendCard({ manga }: { manga: Manga }) {
  return (
    <Link
      href={`/titles/${manga.slug}`}
      className="group shrink-0 w-[120px] sm:w-[130px] flex flex-col gap-2"
    >
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-muted group-hover:-translate-y-1 group-hover:shadow-glow transition-all duration-300">
        {manga.thumbnail ? (
          <Image
            src={manga.thumbnail}
            alt={manga.title}
            fill
            sizes="130px"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen className="h-6 w-6 text-muted-foreground/40" />
          </div>
        )}
      </div>
      <h3 className="text-[12px] font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
        {manga.title}
      </h3>
      {manga.genres?.[0] && (
        <p className="text-[10px] text-muted-foreground -mt-1 line-clamp-1">
          {manga.genres[0].name}
        </p>
      )}
    </Link>
  )
}

interface TitleRecommendationsProps {
  excludeSlug: string
}

export function TitleRecommendations({ excludeSlug }: TitleRecommendationsProps) {
  const { data, isLoading } = useTrending()
  const mangas = (data?.data ?? []).filter((m) => m.slug !== excludeSlug).slice(0, 10)

  return (
    <section className="cute-card p-5 flex flex-col gap-4">
      <h2 className="font-display text-lg font-bold flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        Có Thể Bạn Thích
      </h2>

      {isLoading && (
        <div className="flex gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="shrink-0 w-[120px] flex flex-col gap-2">
              <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          ))}
        </div>
      )}

      {!isLoading && mangas.length > 0 && (
        <MangaCarousel>
          {mangas.map((manga) => (
            <RecommendCard key={manga.id} manga={manga} />
          ))}
        </MangaCarousel>
      )}
    </section>
  )
}
