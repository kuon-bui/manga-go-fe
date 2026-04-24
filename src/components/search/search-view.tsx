'use client'

import { useCallback, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal } from 'lucide-react'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { MangaGrid, MangaGridSkeleton } from '@/components/manga/manga-grid'
import { SearchFilterPanel } from '@/components/search/search-filter-panel'
import { useSearch } from '@/hooks/use-manga'
import type { SearchFilters } from '@/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function paramsToFilters(params: URLSearchParams): SearchFilters {
  return {
    query: params.get('q') ?? undefined,
    type: (params.get('type') as SearchFilters['type']) ?? undefined,
    status: (params.get('status') as SearchFilters['status']) ?? undefined,
    genres: params.get('genres') ? params.get('genres')!.split(',') : undefined,
    ratingMin: params.get('ratingMin') ? Number(params.get('ratingMin')) : undefined,
    ratingMax: params.get('ratingMax') ? Number(params.get('ratingMax')) : undefined,
    sort: (params.get('sort') as SearchFilters['sort']) ?? 'latest',
    page: params.get('page') ? Number(params.get('page')) : 1,
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SearchView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const filters = paramsToFilters(searchParams)

  const [inputValue, setInputValue] = useState(filters.query ?? '')

  const { data, isLoading } = useSearch(filters)

  const updateParams = useCallback(
    (updates: Partial<SearchFilters>) => {
      const next = new URLSearchParams(searchParams.toString())
      for (const [k, v] of Object.entries(updates)) {
        if (v === undefined || v === null || v === '') {
          next.delete(k)
        } else if (Array.isArray(v)) {
          if (v.length > 0) next.set(k, v.join(','))
          else next.delete(k)
        } else {
          next.set(k, String(v))
        }
      }
      next.delete('page') // reset to page 1 on filter change
      router.push(`/search?${next.toString()}`)
    },
    [searchParams, router]
  )

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    updateParams({ query: inputValue })
  }

  const resultCount = data?.total ?? 0
  const hasResults = !isLoading && (data?.data.length ?? 0) > 0
  const isEmpty = !isLoading && (data?.data.length ?? 0) === 0 && Object.keys(filters).length > 1

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 pt-2 pb-10 space-y-5">
      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search titles, authors, genres…"
            className="pl-9"
          />
        </div>
        <Button type="submit">Search</Button>

        {/* Mobile filter trigger */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden" aria-label="Open filters">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <SearchFilterPanel filters={filters} onChange={updateParams} />
            </div>
          </SheetContent>
        </Sheet>
      </form>

      <div className="mt-6 flex gap-6">
        {/* Desktop filter sidebar */}
        <aside className="hidden w-56 shrink-0 md:block">
          <SearchFilterPanel filters={filters} onChange={updateParams} />
        </aside>

        {/* Results */}
        <div className="flex-1 space-y-4">
          {/* Result count */}
          {!isLoading && (
            <p className="text-sm text-muted-foreground">
              {resultCount > 0 ? `${resultCount.toLocaleString()} results` : ''}
            </p>
          )}

          {isLoading && <MangaGridSkeleton count={12} />}

          {hasResults && <MangaGrid items={data!.data} />}

          {isEmpty && (
            <div className="py-16 text-center text-muted-foreground">
              <Search className="mx-auto mb-3 h-10 w-10 opacity-30" />
              <p className="text-lg font-medium">No results found</p>
              <p className="mt-1 text-sm">Try adjusting your filters or search term.</p>
            </div>
          )}

          {!isLoading && !filters.query && !filters.genres && (
            <div className="py-16 text-center text-muted-foreground">
              <Search className="mx-auto mb-3 h-10 w-10 opacity-30" />
              <p className="text-lg font-medium">Search for something</p>
              <p className="mt-1 text-sm">Enter a title, author, or use the filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
