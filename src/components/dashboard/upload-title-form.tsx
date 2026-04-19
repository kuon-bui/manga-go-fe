'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SafeImage as Image } from '@/components/ui/safe-image'
import { Check, Upload, Search, X, Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  useCreateTitle, useAllAuthors, useCreateAuthor,
  useAllTags, useCreateTag, useUploadCover, titleToSlug, useMyGroups,
} from '@/hooks/use-dashboard'
import { apiClient } from '@/lib/api-client'
import { useGenres } from '@/hooks/use-manga'
import { cn } from '@/lib/utils'
import type { ContentType, ContentStatus, ComicAgeRating } from '@/types'
import type { Author, Tag } from '@/types'

// ─── Steps ────────────────────────────────────────────────────────────────────

const STEPS = ['Cơ bản', 'Metadata', 'Kiểm tra'] as const
type Step = 0 | 1 | 2

// ─── Author picker ────────────────────────────────────────────────────────────

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
  const [open, setOpen] = useState(false)
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
        setOpen(false)
        toast.success(`Đã tạo tác giả "${author.name}"`)
      },
      onError: () => toast.error('Không thể tạo tác giả'),
    })
  }

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
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
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Tìm hoặc tạo tác giả…"
          className="pl-8"
          disabled={isLoading}
        />
      </div>

      {open && (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-border bg-popover shadow-md">
          {filtered.length > 0 ? (
            <ul className="max-h-40 overflow-y-auto">
              {filtered.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm hover:bg-accent"
                    onClick={() => { onChange(a); setQuery(''); setOpen(false) }}
                  >
                    {a.name}
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-2 text-center text-xs text-muted-foreground">
              Không tìm thấy.
            </div>
          )}

          {query.trim() && !filtered.some((a) => a.name.toLowerCase() === query.trim().toLowerCase()) && (
            <div className="border-t border-border p-1.5">
              <Button
                size="sm"
                variant="ghost"
                className="w-full gap-1.5 text-xs"
                onClick={handleCreate}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                Tạo &ldquo;{query.trim()}&rdquo;
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Tag picker ────────────────────────────────────────────────────────────────

function TagPicker({
  value,
  onChange,
}: {
  value: string[]     // slugs
  onChange: (_slugs: string[]) => void
}) {
  const { data: tags } = useAllTags()
  const createMutation = useCreateTag()
  const [query, setQuery] = useState('')

  const filtered = (tags ?? []).filter((t) =>
    t.name.toLowerCase().includes(query.toLowerCase())
  )
  const selectedTags = (tags ?? []).filter((t) => value.includes(t.slug))

  function toggle(tag: Tag) {
    if (value.includes(tag.slug)) {
      onChange(value.filter((s) => s !== tag.slug))
    } else {
      onChange([...value, tag.slug])
    }
  }

  function handleCreate() {
    if (!query.trim()) return
    const slug = titleToSlug(query.trim())
    createMutation.mutate({ name: query.trim(), slug }, {
      onSuccess: (tag) => {
        onChange([...value, tag.slug])
        setQuery('')
        toast.success(`Đã tạo tag "${tag.name}"`)
      },
      onError: () => toast.error('Không thể tạo tag'),
    })
  }

  return (
    <div className="space-y-2">
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedTags.map((t) => (
            <Badge key={t.slug} variant="secondary" className="gap-1 pr-1">
              {t.name}
              <button onClick={() => toggle(t)} aria-label={`Xóa tag ${t.name}`}>
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm tag…"
          className="pl-8"
        />
      </div>

      {filtered.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {filtered.slice(0, 20).map((t) => (
            <button
              key={t.slug}
              type="button"
              onClick={() => toggle(t)}
              className={cn(
                'rounded-full border px-2.5 py-0.5 text-xs transition-colors',
                value.includes(t.slug)
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-background text-foreground hover:bg-accent'
              )}
            >
              {t.name}
            </button>
          ))}
        </div>
      )}

      {query.trim() && !filtered.some((t) => t.name.toLowerCase() === query.trim().toLowerCase()) && (
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5 text-xs"
          onClick={handleCreate}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
          Tạo tag &ldquo;{query.trim()}&rdquo;
        </Button>
      )}
    </div>
  )
}

// ─── Form state ───────────────────────────────────────────────────────────────

interface FormState {
  title: string
  alternativeTitles: string[]
  type: ContentType
  status: ContentStatus
  ageRating: ComicAgeRating
  description: string
  author: Author | null
  artistId: string | null
  genres: string[]
  tags: string[]
  year: string
  coverFile: File | null
  thumbnailUrl: string | null
}

const INITIAL: FormState = {
  title: '',
  alternativeTitles: [],
  type: 'manga',
  status: 'ongoing',
  ageRating: 'ALL',
  description: '',
  author: null,
  artistId: null,
  genres: [],
  tags: [],
  year: '',
  coverFile: null,
  thumbnailUrl: null,
}

function GenrePicker({
  value,
  onChange,
}: {
  value: string[]
  onChange: (_slugs: string[]) => void
}) {
  const { data: genres } = useGenres()
  const [query, setQuery] = useState('')

  const filtered = (genres ?? []).filter((g) =>
    g.name.toLowerCase().includes(query.toLowerCase())
  )
  const selectedGenres = (genres ?? []).filter((g) => value.includes(g.slug))

  function toggle(slug: string) {
    if (value.includes(slug)) {
      onChange(value.filter((s) => s !== slug))
    } else {
      onChange([...value, slug])
    }
  }

  return (
    <div className="space-y-2">
      {selectedGenres.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedGenres.map((g) => (
            <Badge key={g.slug} variant="secondary" className="gap-1 pr-1">
              {g.name}
              <button 
                type="button"
                onClick={() => toggle(g.slug)} 
                aria-label={`Xóa thể loại ${g.name}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Tìm thể loại..."
          className="pl-8"
        />
      </div>

      {filtered.length > 0 && query && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {filtered.slice(0, 15).map((g) => (
            <button
              key={g.slug}
              type="button"
              onClick={() => toggle(g.slug)}
              className={cn(
                'rounded-full border px-2.5 py-0.5 text-xs transition-colors',
                value.includes(g.slug)
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
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function UploadTitleForm() {
  const router = useRouter()
  const createMutation = useCreateTitle()
  const uploadCoverMutation = useUploadCover()
  const { data: myGroups } = useMyGroups()

  const [step, setStep] = useState<Step>(0)
  const [form, setForm] = useState<FormState & { groupSlug?: string }>(INITIAL)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  // Auto-select first group once loaded if none set
  useEffect(() => {
    if (myGroups?.data && myGroups.data.length > 0 && !form.groupSlug) {
      setForm(prev => ({ ...prev, groupSlug: myGroups.data[0].slug }))
    }
  }, [myGroups, form.groupSlug])

  const set = useCallback(<K extends keyof FormState>(key: K, val: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: val }))
  }, [])

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    set('coverFile', file)
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  const step0Valid = Boolean(form.title.trim() && form.description.trim())
  const step1Valid = Boolean(form.author && form.groupSlug)

  async function handleSubmit() {
    if (!form.author) {
      toast.error('Vui lòng chọn tác giả')
      return
    }

    const slug = titleToSlug(form.title)

    try {
      // Step 1: Create comic without thumbnail
      const createResponse = await createMutation.mutateAsync({
        title: form.title.trim(),
        slug,
        alternativeTitles: form.alternativeTitles,
        type: form.type,
        description: form.description.trim(),
        authorNames: [form.author.name],
        artistNames: [],
        genreSlugs: form.genres,
        tagSlugs: form.tags,
        thumbnail: null,
        ageRating: form.ageRating,
        publishedYear: form.year ? Number(form.year) : null,
      })

      const comicId = createResponse.id

      // Step 2: Upload cover if provided
      let thumbnailUrl: string | null = null
      if (coverFile) {
        try {
          const uploadResult = await uploadCoverMutation.mutateAsync({ file: coverFile, comicId })
          thumbnailUrl = uploadResult.path ?? uploadResult.url
        } catch (err) {
          console.error('Cover upload failed:', err)
          toast.warning('Tạo truyện thành công nhưng không thể upload ảnh bìa')
        }
      }

      // Step 3: Update comic with thumbnail if uploaded
      if (thumbnailUrl) {
        try {
          await apiClient.updateComic(slug, {
            title: form.title.trim(),
            slug,
            thumbnail: thumbnailUrl
          })
        } catch (err) {
          console.error('Failed to update comic thumbnail:', err)
        }
      }

      toast.success('Đã tạo truyện thành công!')
      router.push(`/dashboard/upload/chapter/${slug}`)
    } catch (err) {
      toast.error(`Lỗi: ${err instanceof Error ? err.message : 'Không thể tạo truyện'}`)
    }
  }

  const isSubmitting = createMutation.isPending || uploadCoverMutation.isPending

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Đăng Truyện Mới</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { if (i < step) setStep(i as Step) }}
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors',
                i < step
                  ? 'cursor-pointer bg-primary text-primary-foreground'
                  : i === step
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
              )}
              aria-current={i === step ? 'step' : undefined}
            >
              {i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}
            </button>
            <span className={cn('text-sm', i === step ? 'font-medium text-foreground' : 'text-muted-foreground')}>
              {label}
            </span>
            {i < STEPS.length - 1 && <div className="mx-1 h-px w-8 bg-border" />}
          </div>
        ))}
      </div>

      {/* ── Step 0: Basic Info ───────────────────────────────────────────────── */}
      {step === 0 && (
        <div className="space-y-5 rounded-xl border bg-card p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div
              className="relative h-44 w-32 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-border transition-colors hover:border-primary"
              onClick={() => coverInputRef.current?.click()}
            >
              {coverPreview ? (
                <Image src={coverPreview} alt="Ảnh bìa" fill className="object-cover" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Upload className="h-6 w-6" />
                  <span className="text-center text-xs leading-tight">Ảnh bìa</span>
                </div>
              )}
            </div>
            <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />

            <div className="flex-1 space-y-3">
              <div className="space-y-1">
                <Label htmlFor="title">Tên truyện <span className="text-destructive">*</span></Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => set('title', e.target.value)}
                  placeholder="vd: One Piece"
                />
                {form.title && (
                  <p className="text-xs text-muted-foreground">Slug: <code>{titleToSlug(form.title)}</code></p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="alt-titles">Tên khác</Label>
                <Input
                  id="alt-titles"
                  placeholder="Phân cách bằng dấu phẩy"
                  onChange={(e) =>
                    set('alternativeTitles', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Loại</Label>
                  <Select value={form.type} onValueChange={(v) => set('type', v as ContentType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manga">Manga</SelectItem>
                      <SelectItem value="novel">Novel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Trạng thái</Label>
                  <Select value={form.status} onValueChange={(v) => set('status', v as ContentStatus)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ongoing">Đang tiến hành</SelectItem>
                      <SelectItem value="completed">Hoàn thành</SelectItem>
                      <SelectItem value="hiatus">Tạm dừng</SelectItem>
                      <SelectItem value="cancelled">Đã huỷ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="description">Tóm tắt <span className="text-destructive">*</span></Label>
            <Textarea
              id="description"
              rows={4}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Mô tả ngắn về truyện…"
            />
          </div>

          <Button onClick={() => setStep(1)} disabled={!step0Valid}>
            Tiếp theo
          </Button>
        </div>
      )}

      {/* ── Step 1: Metadata ─────────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-5 rounded-xl border bg-card p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <Label>Nhóm dịch sở hữu <span className="text-destructive">*</span></Label>
              <Select 
                value={form.groupSlug} 
                onValueChange={(v) => setForm(prev => ({ ...prev, groupSlug: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn nhóm dịch..." />
                </SelectTrigger>
                <SelectContent>
                  {(myGroups?.data ?? []).length === 0 && (
                    <div className="p-2 text-sm text-muted-foreground text-center">Bạn chưa tham gia nhóm dịch nào.</div>
                  )}
                  {(myGroups?.data ?? []).map((group) => (
                    <SelectItem key={group.id} value={group.slug}>{group.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-1">
              <Label>Tác giả <span className="text-destructive">*</span></Label>
              <AuthorPicker value={form.author} onChange={(a) => set('author', a)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="year">Năm xuất bản</Label>
              <Input
                id="year"
                type="number"
                min={1900}
                max={new Date().getFullYear()}
                value={form.year}
                onChange={(e) => set('year', e.target.value)}
                placeholder="vd: 1999"
              />
            </div>
            <div className="space-y-1">
              <Label>Độ tuổi</Label>
              <Select value={form.ageRating} onValueChange={(v) => set('ageRating', v as ComicAgeRating)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Mọi lứa tuổi</SelectItem>
                  <SelectItem value="T">13+</SelectItem>
                  <SelectItem value="16+">16+</SelectItem>
                  <SelectItem value="18+">18+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Thể loại</Label>
            <GenrePicker value={form.genres} onChange={(slugs) => set('genres', slugs)} />
          </div>

          <div className="space-y-2">
            <Label>Tags phụ</Label>
            <TagPicker value={form.tags} onChange={(slugs) => set('tags', slugs)} />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(0)}>Quay lại</Button>
            <Button onClick={() => setStep(2)} disabled={!step1Valid}>Kiểm tra</Button>
          </div>
        </div>
      )}

      {/* ── Step 2: Review ───────────────────────────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-5 rounded-xl border bg-card p-6">
          <h2 className="font-semibold text-foreground">Kiểm tra thông tin</h2>

          <dl className="grid grid-cols-2 gap-3 text-sm">
            {[
              ['Tên truyện', form.title],
              ['Slug', titleToSlug(form.title)],
              ['Loại', form.type],
              ['Trạng thái', form.status],
              ['Tác giả', form.author?.name ?? '—'],
              ['Năm', form.year || '—'],
            ].map(([label, value]) => (
              <div key={label as string}>
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="font-medium capitalize text-foreground">{value}</dd>
              </div>
            ))}
          </dl>

          {form.genres.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Thể loại</p>
              <div className="flex flex-wrap gap-1.5">
                {form.genres.map((slug) => (
                  <Badge key={slug} variant="secondary">{slug}</Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)}>Quay lại</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Đang tạo…</> : 'Tạo truyện'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
