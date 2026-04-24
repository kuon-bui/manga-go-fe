'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { BookOpen } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { SafeImage as Image } from '@/components/ui/safe-image'
import { apiClient } from '@/lib/api-client'
import { cn } from '@/lib/utils'
import type { Manga, PaginatedResponse } from '@/types'

const TABS = [
  { id: 'all',   label: '🔥 Hot' },
  { id: 'manga', label: 'Manga' },
  { id: 'novel', label: 'Novel' },
] as const

type TabId = (typeof TABS)[number]['id']

function useByTheme(tab: TabId) {
  return useQuery<PaginatedResponse<Manga>>({
    queryKey: ['home', 'by-theme', tab],
    queryFn: () =>
      apiClient.get<PaginatedResponse<Manga>>('/comics', {
        params: {
          ...(tab !== 'all' ? { type: tab } : {}),
          limit: '6',
          sortBy: 'rating',
          order: 'desc',
        },
      }),
    staleTime: 5 * 60 * 1000,
  })
}

function ThemeItem({ manga, rank }: { manga: Manga; rank: number }) {
  return (
    <Link
      href={`/titles/${manga.slug}`}
      className="group flex items-center gap-2.5 px-2 py-2 rounded-xl hover:bg-secondary/60 transition-colors"
    >
      <span
        className={cn(
          'shrink-0 w-5 text-center text-xs font-extrabold',
          rank <= 3 ? 'text-primary' : 'text-muted-foreground'
        )}
      >
        {rank}
      </span>

      <div className="relative h-12 w-9 shrink-0 overflow-hidden rounded-lg bg-muted">
        {manga.thumbnail ? (
          <Image src={manga.thumbnail} alt={manga.title} fill sizes="36px" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen className="h-3.5 w-3.5 text-muted-foreground/40" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-semibold line-clamp-2 leading-tight group-hover:text-primary transition-colors">
          {manga.title}
        </p>
        {manga.genres?.[0] && (
          <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
            {manga.genres[0].name}
          </p>
        )}
      </div>
    </Link>
  )
}

export function FeaturedByThemeSection() {
  const [active, setActive] = useState<TabId>('all')
  const { data, isLoading } = useByTheme(active)
  const items = data?.data ?? []

  return (
    <section className="cute-card p-5 flex flex-col gap-3">
      <h2 className="font-display text-xl">Nổi Bật Theo Thể Loại</h2>

      <div className="flex gap-1.5 bg-muted p-1 rounded-full w-fit">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={cn(
              'cute-pill transition-all',
              active === id
                ? 'bg-card text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="divide-y divide-border/60">
        {isLoading &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2.5 px-2 py-2">
              <Skeleton className="w-5 h-3.5 shrink-0 rounded" />
              <Skeleton className="h-12 w-9 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-3/4" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}

        {!isLoading && items.map((manga, i) => (
          <ThemeItem key={manga.id} manga={manga} rank={i + 1} />
        ))}

        {!isLoading && items.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">Không có dữ liệu.</p>
        )}
      </div>
    </section>
  )
}
