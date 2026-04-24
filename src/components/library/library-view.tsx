'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LayoutGrid, List, BookOpen, LogIn, History, Heart } from 'lucide-react'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MangaGrid, MangaGridSkeleton, type GridVariant } from '@/components/manga/manga-grid'
import { ReadingHistoryTab } from '@/components/library/reading-history-tab'
import { Skeleton } from '@/components/ui/skeleton'
import { useLibrary } from '@/hooks/use-library'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'

type SortKey = 'last_read' | 'added' | 'title' | 'rating'
type TabKey  = 'followed' | 'history'

const SORT_OPTIONS: { label: string; value: SortKey }[] = [
  { label: 'Đọc gần đây',   value: 'last_read' },
  { label: 'Mới thêm',      value: 'added' },
  { label: 'Tên A–Z',       value: 'title' },
  { label: 'Đánh giá cao',  value: 'rating' },
]

export function LibraryView() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user            = useAuthStore((s) => s.user)

  const [tab,         setTab]         = useState<TabKey>('followed')
  const [gridVariant, setGridVariant] = useState<GridVariant>('card')
  const [sort,        setSort]        = useState<SortKey>('last_read')

  const { data, isLoading } = useLibrary()

  /* ── Unauthenticated ─────────────────────────────────────── */
  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-7xl px-4 md:px-6 pt-2 pb-10">
        <div className="cute-card py-20 text-center">
          <BookOpen className="mx-auto mb-4 h-14 w-14 text-muted-foreground opacity-20" />
          <h1 className="font-display text-2xl font-bold">Thư viện của bạn trống</h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">
            Đăng nhập để theo dõi truyện và lưu lịch sử đọc của bạn.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity shadow-sm"
          >
            <LogIn className="h-4 w-4" />
            Đăng nhập
          </Link>
        </div>
      </div>
    )
  }

  /* ── Sort entries ────────────────────────────────────────── */
  const entries = [...(data?.data ?? [])].sort((a, b) => {
    switch (sort) {
      case 'last_read': return (b.lastReadAt ?? b.addedAt).localeCompare(a.lastReadAt ?? a.addedAt)
      case 'added':     return b.addedAt.localeCompare(a.addedAt)
      case 'title':     return a.manga.title.localeCompare(b.manga.title)
      case 'rating':    return (b.manga.rating ?? 0) - (a.manga.rating ?? 0)
      default:          return 0
    }
  })
  const mangas = entries.map((e) => e.manga)
  const initials = (user?.name ?? 'AN').slice(0, 2).toUpperCase()

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 pt-2 pb-10 space-y-5">

      {/* ── Header card ──────────────────────────────────────── */}
      <div className="cute-card p-5">
        <div className="flex items-center gap-4">
          {/* User avatar */}
          <div className="h-14 w-14 shrink-0 rounded-full bg-primary/15 flex items-center justify-center ring-2 ring-primary/30 text-lg font-bold text-primary">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-2xl font-bold leading-tight">
              {user?.name ? `Thư viện của ${user.name}` : 'Thư viện của bạn'}
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Tất cả truyện bạn đã theo dõi &amp; lịch sử đọc
            </p>
          </div>

          {/* Stats */}
          {isLoading ? (
            <Skeleton className="h-10 w-28 rounded-xl" />
          ) : (
            <div className="hidden sm:flex items-center gap-4 text-center shrink-0">
              <div className="rounded-2xl bg-primary/10 px-4 py-2">
                <p className="text-2xl font-display font-bold text-primary">{data?.total ?? 0}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Đang theo dõi</p>
              </div>
            </div>
          )}
        </div>

        {/* ── Tabs ─────────────────────────────────────────────── */}
        <div className="flex gap-1 mt-5 rounded-xl bg-muted/50 p-1 w-fit">
          <TabButton active={tab === 'followed'} onClick={() => setTab('followed')} icon={<Heart className="h-3.5 w-3.5" />} label="Đang theo dõi" count={data?.total} />
          <TabButton active={tab === 'history'}  onClick={() => setTab('history')}  icon={<History className="h-3.5 w-3.5" />} label="Lịch sử đọc" />
        </div>
      </div>

      {/* ── Tab: Followed ────────────────────────────────────── */}
      {tab === 'followed' && (
        <div className="space-y-4">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-3">
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="h-8 w-44 text-sm rounded-full border-border bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Grid / List toggle */}
            <div className="flex overflow-hidden rounded-full border border-border bg-muted/30 p-0.5">
              <GridToggle icon={<LayoutGrid className="h-3.5 w-3.5" />} label="Grid"  active={gridVariant === 'card'} onClick={() => setGridVariant('card')} />
              <GridToggle icon={<List className="h-3.5 w-3.5" />}       label="List"  active={gridVariant === 'list'} onClick={() => setGridVariant('list')} />
            </div>
          </div>

          {/* Content */}
          {isLoading && <MangaGridSkeleton count={12} variant={gridVariant} />}

          {!isLoading && mangas.length > 0 && (
            <MangaGrid items={mangas} variant={gridVariant} />
          )}

          {!isLoading && mangas.length === 0 && (
            <div className="cute-card py-16 text-center">
              <Heart className="mx-auto mb-3 h-10 w-10 text-muted-foreground opacity-20" />
              <p className="font-display text-lg font-bold">Chưa theo dõi truyện nào</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Vào trang{' '}
                <Link href="/browse" className="text-primary hover:underline font-semibold">khám phá</Link>
                {' '}để tìm truyện yêu thích.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: History ─────────────────────────────────────── */}
      {tab === 'history' && (
        <ReadingHistoryTab />
      )}
    </div>
  )
}

/* ── Sub-components ────────────────────────────────────────────────────────── */

function TabButton({
  active, onClick, icon, label, count,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
  count?: number
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-sm font-semibold transition-all',
        active
          ? 'bg-card text-foreground shadow-sm'
          : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {icon}
      {label}
      {count !== undefined && (
        <span className={cn(
          'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
          active ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground'
        )}>
          {count}
        </span>
      )}
    </button>
  )
}

function GridToggle({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        'h-7 w-7 rounded-full flex items-center justify-center transition-colors',
        active ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {icon}
    </button>
  )
}
