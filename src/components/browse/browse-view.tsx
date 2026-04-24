'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { BookOpen, SlidersHorizontal, TrendingUp } from 'lucide-react'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { MangaGrid, MangaGridSkeleton } from '@/components/manga/manga-grid'
import { useBrowse, useGenres } from '@/hooks/use-manga'
import { cn } from '@/lib/utils'
import type { BrowseFilters, ContentStatus, SortOption } from '@/types'

const STATUS_OPTIONS: { label: string; value: ContentStatus }[] = [
  { label: 'Đang tiến hành', value: 'ongoing' },
  { label: 'Hoàn thành',     value: 'completed' },
  { label: 'Tạm dừng',       value: 'hiatus' },
  { label: 'Đã hủy',         value: 'cancelled' },
]

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Mới cập nhật',  value: 'latest' },
  { label: 'Điểm cao nhất', value: 'rating' },
  { label: 'Theo dõi nhiều', value: 'most_followed' },
  { label: 'Đọc nhiều nhất', value: 'most_read' },
  { label: 'Tên A–Z',        value: 'title_asc' },
]

export function BrowseView() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  const filters: BrowseFilters = {
    genre:  searchParams.get('genre') ?? undefined,
    tag:    searchParams.get('tag') ?? undefined,
    status: (searchParams.get('status') as ContentStatus) ?? undefined,
    sort:   (searchParams.get('sort') as SortOption) ?? 'latest',
    page:   searchParams.get('page') ? Number(searchParams.get('page')) : 1,
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

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 pt-2 pb-10 space-y-5">

      {/* ── Header card ─────────────────────────────────────────── */}
      <div className="cute-card p-5 space-y-4">
        <div>
          <h1 className="font-display text-2xl font-bold">Khám phá Manga</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Tìm bộ truyện yêu thích của bạn theo thể loại, tình trạng và nhiều hơn nữa
          </p>
        </div>

        {/* Genre pills */}
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5" /> Thể loại
          </p>
          <div className="flex flex-wrap gap-2">
            <FilterPill
              label="Tất cả"
              active={!filters.genre}
              onClick={() => setParam('genre', undefined)}
            />
            {genresLoading
              ? Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton key={i} className="h-7 w-16 rounded-full" />
                ))
              : genres?.map((g) => (
                  <FilterPill
                    key={g.id}
                    label={g.name}
                    active={g.slug === filters.genre}
                    onClick={() => setParam('genre', g.slug === filters.genre ? undefined : g.slug)}
                  />
                ))}
          </div>
        </div>

        {/* Status + Sort row */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-border/60">
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Tình trạng</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <FilterPill
              label="Tất cả"
              active={!filters.status}
              onClick={() => setParam('status', undefined)}
            />
            {STATUS_OPTIONS.map((s) => (
              <FilterPill
                key={s.value}
                label={s.label}
                active={filters.status === s.value}
                onClick={() => setParam('status', filters.status === s.value ? undefined : s.value)}
              />
            ))}
          </div>

          {/* Sort — pushed right */}
          <div className="ml-auto flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <Select value={filters.sort ?? 'latest'} onValueChange={(v) => setParam('sort', v)}>
              <SelectTrigger className="h-8 w-44 text-sm rounded-full border-border bg-secondary/60">
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
      </div>

      {/* ── Results ─────────────────────────────────────────────── */}
      {isLoading && <MangaGridSkeleton count={18} />}

      {!isLoading && data && data.data.length > 0 && (
        <div className="space-y-3">
          <MangaGrid items={data.data} />
          <p className="text-center text-xs text-muted-foreground py-2">
            Hiển thị {data.data.length.toLocaleString('vi-VN')} / {data.total.toLocaleString('vi-VN')} truyện
          </p>
        </div>
      )}

      {!isLoading && (!data || data.data.length === 0) && (
        <div className="cute-card py-20 text-center">
          <BookOpen className="mx-auto mb-3 h-12 w-12 text-muted-foreground opacity-20" />
          <p className="text-lg font-display font-bold">Không tìm thấy truyện nào</p>
          <p className="mt-1 text-sm text-muted-foreground">Thử thay đổi thể loại hoặc tình trạng.</p>
          <button
            onClick={() => router.push('/browse')}
            className="mt-4 cute-pill bg-primary text-primary-foreground hover:opacity-90 transition-opacity px-5 py-2"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Reusable filter pill ──────────────────────────────────────────────────── */

function FilterPill({
  label, active, onClick,
}: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'cute-pill border text-sm transition-colors',
        active
          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
          : 'bg-secondary text-secondary-foreground border-border hover:bg-accent hover:border-primary/30'
      )}
    >
      {label}
    </button>
  )
}
