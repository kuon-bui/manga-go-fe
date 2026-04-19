'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, X, Loader2, Upload } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  useAllAuthors, useCreateAuthor,
  useUpdateComic, useUploadCover, useAllTags,
} from '@/hooks/use-dashboard'
import { useGenres } from '@/hooks/use-manga'
import { cn } from '@/lib/utils'
import type { Manga, Author } from '@/types'

interface TitleEditModalProps {
  title: Manga
  open: boolean
  onOpenChange: (open: boolean) => void
}

function AuthorPicker({
  value,
  onChange,
}: {
  value: Author | null
  onChange: (_a: Author | null) => void
}) {
  const { data: authors, isLoading } = useAllAuthors()
  const createMutation = useCreateAuthor()
  const [query, setQuery] = useState('')
  const [pickerOpen, setPickerOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const filtered = (authors ?? []).filter((a) =>
    a.name.toLowerCase().includes(query.toLowerCase())
  )

  function handleCreate() {
    if (!query.trim()) return
    createMutation.mutate(query.trim(), {
      onSuccess: (author) => {
        onChange(author)
        setQuery('')
        setPickerOpen(false)
        toast.success(`Đã tạo tác giả "${author.name}"`)
      },
      onError: () => toast.error('Không thể tạo tác giả'),
    })
  }

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setPickerOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  if (value) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2">
        <span className="flex-1 text-sm font-medium text-foreground">{value.name}</span>
        <button onClick={() => onChange(null)} aria-label="Xóa tác giả">
          <X className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
        </button>
      </div>
    )
  }

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setPickerOpen(true) }}
          onFocus={() => setPickerOpen(true)}
          placeholder="Tìm hoặc tạo tác giả…"
          className="pl-8"
          disabled={isLoading}
        />
      </div>

      {pickerOpen && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-md">
          {filtered.length > 0 ? (
            <ul className="max-h-40 overflow-y-auto">
              {filtered.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                    onClick={() => { onChange(a); setQuery(''); setPickerOpen(false) }}
                  >
                    {a.name}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {query.trim() && (
            <button
              type="button"
              className="w-full border-t px-3 py-2 text-left text-sm text-primary hover:bg-accent"
              onClick={handleCreate}
            >
              {createMutation.isPending ? 'Đang tạo…' : `Tạo "${query.trim()}"`}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export function TitleEditModal({ title: titleData, open: isOpen, onOpenChange }: TitleEditModalProps) {
  const title = titleData
  const updateMutation = useUpdateComic()
  const uploadCoverMutation = useUploadCover()
  const { data: genres } = useGenres()
  const { data: allTags } = useAllTags()

  // Form state
  const [titleName, setTitleName] = useState(title.title)
  const [altTitles, setAltTitles] = useState(title.alternativeTitles?.join(', ') ?? '')
  const [description, setDescription] = useState(title.description)
  const [author, setAuthor] = useState<Author | null>(
    title.authors?.[0] ?? null
  )
  const [artist, setArtist] = useState(title.artists?.[0] ?? null)
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    title.genres?.map((g) => g.slug) ?? []
  )
  const [selectedTags, setSelectedTags] = useState<string[]>(
    title.tags?.map((t) => t.slug) ?? []
  )
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState(title.thumbnail ?? '')
  const [genreQuery, setGenreQuery] = useState('')
  const [tagQuery, setTagQuery] = useState('')
  const coverInputRef = useRef<HTMLInputElement>(null)

  const isSubmitting = updateMutation.isPending || uploadCoverMutation.isPending

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  const filteredGenres = (genres ?? []).filter((g) =>
    g.name.toLowerCase().includes(genreQuery.toLowerCase())
  )
  const filteredTags = (allTags ?? []).filter((t) =>
    t.name.toLowerCase().includes(tagQuery.toLowerCase())
  )
  const selectedGenresData = (genres ?? []).filter((g) => selectedGenres.includes(g.slug))
  const selectedTagsData = (allTags ?? []).filter((t) => selectedTags.includes(t.slug))

  async function handleSubmit() {
    if (!titleName.trim()) {
      toast.error('Tên truyện không được để trống')
      return
    }

    try {
      let thumbnailPath = title.thumbnail

      // Upload cover if changed
      if (coverFile) {
        const result = await uploadCoverMutation.mutateAsync({ file: coverFile, comicId: title.id })
        thumbnailPath = result.path ?? result.url
      }

      const payload = {
        title: titleName.trim(),
        slug: title.slug,
        alternativeTitles: altTitles
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        description: description.trim(),
        authorNames: author ? [author.name] : [],
        artistNames: artist ? [artist.name] : [],
        genreSlugs: selectedGenres,
        tagSlugs: selectedTags,
        thumbnail: thumbnailPath ?? null,
      }

      updateMutation.mutate(
        { slug: title.slug, payload },
        {
          onSuccess: () => {
            toast.success('Đã cập nhật thông tin truyện')
            onOpenChange(false)
          },
          onError: (err) => {
            toast.error(`Lỗi: ${err instanceof Error ? err.message : 'Không thể cập nhật'}`)
          },
        }
      )
    } catch {
      toast.error('Không thể xử lý yêu cầu')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto max-w-lg">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa thông tin truyện</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Cover */}
          <div>
            <Label>Ảnh bìa</Label>
            <div className="mt-2 flex gap-3">
              <div className="relative h-24 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                {coverPreview && (
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="flex flex-1 flex-col justify-end gap-2">
                <Input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => coverInputRef.current?.click()}
                >
                  <Upload className="h-3.5 w-3.5 mr-1.5" />
                  Thay đổi
                </Button>
              </div>
            </div>
          </div>

          {/* Title */}
          <div>
            <Label htmlFor="title">Tên truyện *</Label>
            <Input
              id="title"
              value={titleName}
              onChange={(e) => setTitleName(e.target.value)}
              placeholder="Tên chính"
            />
          </div>

          {/* Alt titles */}
          <div>
            <Label htmlFor="alt-titles">Tên khác</Label>
            <Input
              id="alt-titles"
              value={altTitles}
              onChange={(e) => setAltTitles(e.target.value)}
              placeholder="Phân tách bằng dấu phẩy"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="desc">Tóm tắt</Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả truyện…"
              rows={3}
            />
          </div>

          {/* Author */}
          <div>
            <Label>Tác giả</Label>
            <AuthorPicker value={author} onChange={setAuthor} />
          </div>

          {/* Artist */}
          <div>
            <Label>Họa sĩ</Label>
            <AuthorPicker value={artist} onChange={setArtist} />
          </div>

          {/* Genres */}
          <div>
            <Label>Thể loại</Label>
            {selectedGenresData.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {selectedGenresData.map((g) => (
                  <Badge key={g.slug} variant="secondary" className="gap-1 pr-1">
                    {g.name}
                    <button
                      type="button"
                      onClick={() => setSelectedGenres(selectedGenres.filter((s) => s !== g.slug))}
                      aria-label={`Xóa ${g.name}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <Input
              value={genreQuery}
              onChange={(e) => setGenreQuery(e.target.value)}
              placeholder="Tìm thể loại…"
            />
            {filteredGenres.length > 0 && genreQuery && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {filteredGenres.slice(0, 10).map((g) => (
                  <button
                    key={g.slug}
                    type="button"
                    onClick={() => {
                      if (!selectedGenres.includes(g.slug)) {
                        setSelectedGenres([...selectedGenres, g.slug])
                      }
                    }}
                    className={cn(
                      'rounded-full border px-2.5 py-0.5 text-xs transition-colors',
                      selectedGenres.includes(g.slug)
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-foreground hover:bg-accent'
                    )}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <Label>Thẻ</Label>
            {selectedTagsData.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1.5">
                {selectedTagsData.map((t) => (
                  <Badge key={t.slug} variant="outline" className="gap-1 pr-1">
                    {t.name}
                    <button
                      type="button"
                      onClick={() => setSelectedTags(selectedTags.filter((s) => s !== t.slug))}
                      aria-label={`Xóa ${t.name}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
            <Input
              value={tagQuery}
              onChange={(e) => setTagQuery(e.target.value)}
              placeholder="Tìm thẻ…"
            />
            {filteredTags.length > 0 && tagQuery && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {filteredTags.slice(0, 10).map((t) => (
                  <button
                    key={t.slug}
                    type="button"
                    onClick={() => {
                      if (!selectedTags.includes(t.slug)) {
                        setSelectedTags([...selectedTags, t.slug])
                      }
                    }}
                    className={cn(
                      'rounded-full border px-2.5 py-0.5 text-xs transition-colors',
                      selectedTags.includes(t.slug)
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-foreground hover:bg-accent'
                    )}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Huỷ
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang lưu…
              </>
            ) : (
              'Lưu thay đổi'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
