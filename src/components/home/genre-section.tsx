'use client'

import Link from 'next/link'
import { LayoutGrid } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { useGenres } from '@/hooks/use-manga'
import { cn } from '@/lib/utils'
import type { Genre } from '@/types'

// Color palette per genre slug/name keyword — darkmode-aware (uses opacity so it adapts)
const GENRE_PALETTE: { keywords: string[]; classes: string }[] = [
  {
    keywords: ['action', 'hành động', 'hanh dong'],
    classes: 'border-red-500/30 bg-red-500/10 text-red-600 hover:bg-red-500/20 dark:text-red-400',
  },
  {
    keywords: ['romance', 'tình cảm', 'tinh cam', 'love'],
    classes: 'border-pink-500/30 bg-pink-500/10 text-pink-600 hover:bg-pink-500/20 dark:text-pink-400',
  },
  {
    keywords: ['fantasy', 'huyền ảo', 'huyen ao', 'isekai'],
    classes: 'border-purple-500/30 bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 dark:text-purple-400',
  },
  {
    keywords: ['comedy', 'hài', 'hai hước', 'hài hước'],
    classes: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 dark:text-yellow-400',
  },
  {
    keywords: ['drama', 'kịch tính', 'kich tinh'],
    classes: 'border-blue-500/30 bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 dark:text-blue-400',
  },
  {
    keywords: ['horror', 'kinh dị', 'kinh di'],
    classes: 'border-gray-600/30 bg-gray-600/10 text-gray-600 hover:bg-gray-600/20 dark:text-gray-400',
  },
  {
    keywords: ['slice', 'cuộc sống', 'cuoc song', 'school', 'trường học'],
    classes: 'border-green-500/30 bg-green-500/10 text-green-600 hover:bg-green-500/20 dark:text-green-400',
  },
  {
    keywords: ['sci', 'khoa học', 'khoa hoc', 'mecha'],
    classes: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-600 hover:bg-cyan-500/20 dark:text-cyan-400',
  },
  {
    keywords: ['sport', 'thể thao', 'the thao'],
    classes: 'border-orange-500/30 bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 dark:text-orange-400',
  },
  {
    keywords: ['supernatural', 'siêu nhiên', 'sieu nhien', 'magic', 'phép thuật'],
    classes: 'border-violet-500/30 bg-violet-500/10 text-violet-600 hover:bg-violet-500/20 dark:text-violet-400',
  },
]

const DEFAULT_CLASSES =
  'border-primary/20 bg-primary/8 text-primary hover:bg-primary/15 dark:text-primary'

function getGenreClasses(name: string): string {
  const lower = name.toLowerCase()
  const match = GENRE_PALETTE.find((p) => p.keywords.some((kw) => lower.includes(kw)))
  return match ? match.classes : DEFAULT_CLASSES
}

export function GenreSection() {
  const { data, isLoading } = useGenres()

  if (isLoading) {
    return (
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
          <LayoutGrid className="h-5 w-5 text-primary" />
          Thể Loại
        </h2>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 14 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 rounded-full" />
          ))}
        </div>
      </section>
    )
  }

  if (!data || data.length === 0) return null

  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
        <LayoutGrid className="h-5 w-5 text-primary" />
        Thể Loại
      </h2>
      <div className="flex flex-wrap gap-2">
        {data.map((genre, i) => (
          <GenreChipColored
            key={genre.id}
            genre={genre}
            style={{ animationDelay: `${i * 30}ms` }}
          />
        ))}
      </div>
    </section>
  )
}

function GenreChipColored({
  genre,
  style,
}: {
  genre: Genre
  style?: React.CSSProperties
}) {
  return (
    <Link
      href={`/browse?genre=${genre.slug}`}
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-150 animate-in fade-in zoom-in-95',
        'hover:-translate-y-0.5 hover:shadow-sm',
        getGenreClasses(genre.name)
      )}
      style={style}
    >
      {genre.name}
    </Link>
  )
}
