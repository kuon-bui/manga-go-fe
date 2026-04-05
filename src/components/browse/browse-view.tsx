'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { BookOpen } from 'lucide-react'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { GenreChip } from '@/components/ui/genre-chip'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { MangaGrid, MangaGridSkeleton } from '@/components/manga/manga-grid'
import { useBrowse, useGenres } from '@/hooks/use-manga'
import type { BrowseFilters, ContentStatus, SortOption } from '@/types'

const STATUS_OPTIONS: { label: string; value: ContentStatus }[] = [
  { label: 'Ongoing', value: 'ongoing' },
  { label: 'Completed', value: 'completed' },
  { label: 'Hiatus', value: 'hiatus' },
  { label: 'Cancelled', value: 'cancelled' },
]

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Latest Update', value: 'latest' },
  { label: 'Highest Rating', value: 'rating' },
  { label: 'Most Followed', value: 'most_followed' },
  { label: 'Most Read', value: 'most_read' },
  { label: 'Title A–Z', value: 'title_asc' },
]

export function BrowseView() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const filters: BrowseFilters = {
    genre: searchParams.get('genre') ?? undefined,
    tag: searchParams.get('tag') ?? undefined,
    status: (searchParams.get('status') as ContentStatus) ?? undefined,
    sort: (searchParams.get('sort') as SortOption) ?? 'latest',
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
  }

  const { data: genres, isLoading: genresLoading } = useGenres()
  const { data, isLoading } = useBrowse(filters)

  function setParam(key: string, value: string | undefined) {
    const next = new URLSearchParams(searchParams.toString())
    if (value) next.set(key, value)
    else next.delete(key)
    next.delete('page')
    router.push(`/browse?${next.toString()}`)
  }

  const activeGenre = genres?.find((g) => g.slug === filters.genre)

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {activeGenre ? activeGenre.name : 'Browse All'}
        </h1>
        {filters.status && (
          <div className="mt-1 flex items-center gap-2">
            <Badge variant={filters.status} className="capitalize">
              {filters.status}
            </Badge>
          </div>
        )}
      </div>

      {/* Genre chips */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase text-muted-foreground">Genre</p>
        <div className="flex flex-wrap gap-2">
          <GenreChip
            label="All"
            slug=""
            active={!filters.genre}
          />
          {genresLoading
            ? Array.from({ length: 10 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-16 rounded-full" />
              ))
            : genres?.map((g) => (
                <GenreChip key={g.id} label={g.name} slug={g.slug} active={g.slug === filters.genre} />
              ))}
        </div>
      </div>

      {/* Status filter + Sort */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setParam('status', undefined)}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              !filters.status
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background text-foreground hover:bg-accent dark:bg-card'
            }`}
          >
            All Status
          </button>
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s.value}
              onClick={() =>
                setParam('status', filters.status === s.value ? undefined : s.value)
              }
              className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                filters.status === s.value
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-foreground hover:bg-accent dark:bg-card'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Sort select — pushed right */}
        <div className="ml-auto">
          <Select
            value={filters.sort ?? 'latest'}
            onValueChange={(v) => setParam('sort', v)}
          >
            <SelectTrigger className="h-8 w-44 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results */}
      {isLoading && <MangaGridSkeleton count={12} />}

      {!isLoading && data && data.data.length > 0 && (
        <>
          <MangaGrid items={data.data} />
          <p className="text-center text-xs text-muted-foreground">
            Showing {data.data.length} of {data.total.toLocaleString()} titles
          </p>
        </>
      )}

      {!isLoading && (!data || data.data.length === 0) && (
        <div className="py-20 text-center text-muted-foreground">
          <BookOpen className="mx-auto mb-3 h-10 w-10 opacity-30" />
          <p className="text-lg font-medium">No titles found</p>
          <p className="mt-1 text-sm">Try a different genre or status filter.</p>
        </div>
      )}
    </div>
  )
}
