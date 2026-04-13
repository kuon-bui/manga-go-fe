'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LayoutGrid, List, BookOpen, LogIn } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MangaGrid, MangaGridSkeleton, type GridVariant } from '@/components/manga/manga-grid'
import { useLibrary } from '@/hooks/use-library'
import { useAuthStore } from '@/stores/auth-store'

type SortKey = 'last_read' | 'added' | 'title' | 'rating'

const SORT_OPTIONS: { label: string; value: SortKey }[] = [
  { label: 'Last Read', value: 'last_read' },
  { label: 'Recently Added', value: 'added' },
  { label: 'Title A–Z', value: 'title' },
  { label: 'Highest Rating', value: 'rating' },
]

export function LibraryView() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const [gridVariant, setGridVariant] = useState<GridVariant>('card')
  const [sort, setSort] = useState<SortKey>('last_read')

  const { data, isLoading } = useLibrary()

  // ─── Unauthenticated state ──────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <BookOpen className="mx-auto mb-4 h-14 w-14 text-muted-foreground opacity-30" />
        <h1 className="text-xl font-bold text-foreground">Your library is empty</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Log in to follow titles and track your reading progress.
        </p>
        <Button asChild className="mt-6">
          <Link href="/login">
            <LogIn className="h-4 w-4" />
            Log in
          </Link>
        </Button>
      </div>
    )
  }

  // ─── Sort entries ───────────────────────────────────────────────────────────
  const entries = [...(data?.data ?? [])].sort((a, b) => {
    switch (sort) {
      case 'last_read':
        return (b.lastReadAt ?? b.addedAt).localeCompare(a.lastReadAt ?? a.addedAt)
      case 'added':
        return b.addedAt.localeCompare(a.addedAt)
      case 'title':
        return a.manga.title.localeCompare(b.manga.title)
      case 'rating':
        return (b.manga.rating ?? 0) - (a.manga.rating ?? 0)
      default:
        return 0
    }
  })

  const mangas = entries.map((e) => e.manga)

  return (
    <div className="container mx-auto px-4 py-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">
          My Library
          {data && (
            <span className="ml-2 text-base font-normal text-muted-foreground">
              ({data.total})
            </span>
          )}
        </h1>

        <div className="flex items-center gap-2">
          {/* Sort */}
          <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
            <SelectTrigger className="h-8 w-36 text-sm">
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

          {/* Grid / List toggle */}
          <div className="flex rounded-md border dark:border-border">
            <Button
              variant={gridVariant === 'card' ? 'default' : 'ghost'}
              size="icon"
              className="h-8 w-8 rounded-r-none"
              aria-label="Grid view"
              onClick={() => setGridVariant('card')}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              variant={gridVariant === 'list' ? 'default' : 'ghost'}
              size="icon"
              className="h-8 w-8 rounded-l-none"
              aria-label="List view"
              onClick={() => setGridVariant('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading && <MangaGridSkeleton count={12} variant={gridVariant} />}

      {!isLoading && mangas.length > 0 && (
        <MangaGrid items={mangas} variant={gridVariant} />
      )}

      {!isLoading && mangas.length === 0 && (
        <div className="py-20 text-center text-muted-foreground">
          <BookOpen className="mx-auto mb-3 h-10 w-10 opacity-30" />
          <p className="text-lg font-medium">No titles yet</p>
          <p className="mt-1 text-sm">
            Follow titles from the{' '}
            <Link href="/browse" className="text-primary hover:underline">
              browse page
            </Link>{' '}
            to add them here.
          </p>
        </div>
      )}
    </div>
  )
}
