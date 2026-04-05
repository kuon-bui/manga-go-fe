'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Slider } from '@/components/ui/slider'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useGenres } from '@/hooks/use-manga'
import type { SearchFilters, SortOption } from '@/types'

interface SearchFilterPanelProps {
  filters: SearchFilters
  onChange: (_updates: Partial<SearchFilters>) => void
}

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: 'Latest Update', value: 'latest' },
  { label: 'Oldest Update', value: 'oldest' },
  { label: 'Title A–Z', value: 'title_asc' },
  { label: 'Title Z–A', value: 'title_desc' },
  { label: 'Highest Rating', value: 'rating' },
  { label: 'Most Followed', value: 'most_followed' },
  { label: 'Most Read', value: 'most_read' },
]

export function SearchFilterPanel({ filters, onChange }: SearchFilterPanelProps) {
  const { data: genres } = useGenres()

  function toggleGenre(slug: string) {
    const current = filters.genres ?? []
    const updated = current.includes(slug)
      ? current.filter((g) => g !== slug)
      : [...current, slug]
    onChange({ genres: updated.length > 0 ? updated : undefined })
  }

  function clearAll() {
    onChange({
      type: undefined,
      status: undefined,
      genres: undefined,
      ratingMin: undefined,
      ratingMax: undefined,
      sort: 'latest',
    })
  }

  const hasActiveFilters =
    filters.type || filters.status || (filters.genres && filters.genres.length > 0)

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">Filters</span>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="h-auto p-0 text-xs text-primary">
            Clear all
          </Button>
        )}
      </div>

      {/* Sort */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase text-muted-foreground">Sort By</Label>
        <Select
          value={filters.sort ?? 'latest'}
          onValueChange={(v) => onChange({ sort: v as SortOption })}
        >
          <SelectTrigger className="h-8 text-sm">
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

      <Separator />

      {/* Type */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase text-muted-foreground">Type</Label>
        <div className="flex gap-2">
          {(['manga', 'novel'] as const).map((t) => (
            <button
              key={t}
              onClick={() => onChange({ type: filters.type === t ? undefined : t })}
              className={`rounded-md border px-3 py-1 text-sm capitalize transition-colors ${
                filters.type === t
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-foreground hover:bg-accent dark:bg-card'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Status */}
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase text-muted-foreground">Status</Label>
        <div className="grid grid-cols-2 gap-1.5">
          {(['ongoing', 'completed', 'hiatus', 'cancelled'] as const).map((s) => (
            <button
              key={s}
              onClick={() => onChange({ status: filters.status === s ? undefined : s })}
              className={`rounded-md border px-2 py-1 text-xs capitalize transition-colors ${
                filters.status === s
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-foreground hover:bg-accent dark:bg-card'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Rating range */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold uppercase text-muted-foreground">
            Min Rating
          </Label>
          <span className="text-xs text-foreground">
            {filters.ratingMin?.toFixed(1) ?? '0.0'}+
          </span>
        </div>
        <Slider
          min={0}
          max={10}
          step={0.5}
          value={[filters.ratingMin ?? 0]}
          onValueChange={([v]) => onChange({ ratingMin: v > 0 ? v : undefined })}
        />
      </div>

      <Separator />

      {/* Genres */}
      {genres && genres.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase text-muted-foreground">Genres</Label>
          <ScrollArea className="h-48">
            <div className="space-y-2 pr-2">
              {genres.map((genre) => (
                <div key={genre.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`genre-${genre.slug}`}
                    checked={(filters.genres ?? []).includes(genre.slug)}
                    onCheckedChange={() => toggleGenre(genre.slug)}
                  />
                  <label
                    htmlFor={`genre-${genre.slug}`}
                    className="cursor-pointer text-sm text-foreground"
                  >
                    {genre.name}
                  </label>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  )
}
