'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LayoutGrid, List, BookOpen, LogIn, History } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MangaGrid, MangaGridSkeleton, type GridVariant } from '@/components/manga/manga-grid'
import { ReadingHistoryTab } from '@/components/library/reading-history-tab'
import { useLibrary } from '@/hooks/use-library'
import { useAuthStore } from '@/stores/auth-store'

type SortKey = 'last_read' | 'added' | 'title' | 'rating'

const SORT_OPTIONS: { label: string; value: SortKey }[] = [
  { label: 'Đọc gần đây', value: 'last_read' },
  { label: 'Mới thêm', value: 'added' },
  { label: 'Tên A–Z', value: 'title' },
  { label: 'Đánh giá cao', value: 'rating' },
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
        <h1 className="text-xl font-bold text-foreground">Thư viện của bạn trống</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Đăng nhập để theo dõi truyện và lưu lịch sử đọc của bạn.
        </p>
        <Button asChild className="mt-6">
          <Link href="/login">
            <LogIn className="h-4 w-4" />
            Đăng nhập
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
      {/* Page header */}
      <h1 className="text-2xl font-bold text-foreground">
        Thư viện
      </h1>

      <Tabs defaultValue="followed">
        <TabsList className="w-full justify-start sm:w-auto">
          <TabsTrigger value="followed" className="gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            Đang theo dõi
            {data && (
              <span className="ml-1 rounded-full bg-muted-foreground/20 px-1.5 py-0.5 text-[10px] font-semibold">
                {data.total}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-1.5">
            <History className="h-3.5 w-3.5" />
            Lịch sử đọc
          </TabsTrigger>
        </TabsList>

        {/* ── Tab: Followed comics ──────────────────────────────────────── */}
        <TabsContent value="followed" className="mt-5">
          {/* Toolbar */}
          <div className="mb-4 flex items-center justify-between">
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="h-8 w-40 text-sm">
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

          {/* Content */}
          {isLoading && <MangaGridSkeleton count={12} variant={gridVariant} />}

          {!isLoading && mangas.length > 0 && (
            <MangaGrid items={mangas} variant={gridVariant} />
          )}

          {!isLoading && mangas.length === 0 && (
            <div className="py-20 text-center text-muted-foreground">
              <BookOpen className="mx-auto mb-3 h-10 w-10 opacity-30" />
              <p className="text-lg font-medium">Chưa có truyện nào</p>
              <p className="mt-1 text-sm">
                Theo dõi truyện từ trang{' '}
                <Link href="/browse" className="text-primary hover:underline">
                  khám phá
                </Link>{' '}
                để thêm vào đây.
              </p>
            </div>
          )}
        </TabsContent>

        {/* ── Tab: Reading history ─────────────────────────────────────── */}
        <TabsContent value="history" className="mt-5">
          <ReadingHistoryTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
