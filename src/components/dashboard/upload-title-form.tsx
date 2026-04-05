'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Check, Upload } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useCreateTitle } from '@/hooks/use-dashboard'
import { useGenres } from '@/hooks/use-manga'
import { cn } from '@/lib/utils'
import type { ContentType, ContentStatus, CreateTitlePayload } from '@/types'

// ─── Steps ────────────────────────────────────────────────────────────────────

const STEPS = ['Basic Info', 'Metadata', 'Review'] as const
type Step = 0 | 1 | 2

// ─── Component ────────────────────────────────────────────────────────────────

export function UploadTitleForm() {
  const router = useRouter()
  const createMutation = useCreateTitle()
  const { data: genres } = useGenres()

  const [step, setStep] = useState<Step>(0)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState<Partial<CreateTitlePayload>>({
    type: 'manga',
    status: 'ongoing',
    genres: [],
    tags: [],
    alternativeTitles: [],
  })

  function set<K extends keyof CreateTitlePayload>(key: K, value: CreateTitlePayload[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    set('coverFile', file)
    setCoverPreview(URL.createObjectURL(file))
  }

  function toggleGenre(slug: string) {
    const current = form.genres ?? []
    set(
      'genres',
      current.includes(slug) ? current.filter((g) => g !== slug) : [...current, slug]
    )
  }

  function handleSubmit() {
    if (!form.title || !form.description || !form.author) {
      toast.error('Please fill in all required fields')
      return
    }
    createMutation.mutate(form as CreateTitlePayload, {
      onSuccess: (data) => {
        toast.success('Title created!')
        router.push(`/titles/${data.id}`)
      },
      onError: () => toast.error('Failed to create title'),
    })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Upload New Title</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <button
              onClick={() => i < step && setStep(i as Step)}
              className={cn(
                'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-colors',
                i < step
                  ? 'bg-primary text-primary-foreground cursor-pointer'
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
            {i < STEPS.length - 1 && <div className="mx-1 h-px w-8 bg-border dark:bg-border" />}
          </div>
        ))}
      </div>

      {/* Step 0: Basic Info */}
      {step === 0 && (
        <div className="space-y-4 rounded-xl border bg-card p-6 dark:border-border">
          {/* Cover upload */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div
              className="relative h-44 w-32 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-border bg-muted transition-colors hover:border-primary dark:border-border"
              onClick={() => coverInputRef.current?.click()}
            >
              {coverPreview ? (
                <Image src={coverPreview} alt="Cover preview" fill className="object-cover" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
                  <Upload className="h-6 w-6" />
                  <span className="text-xs">Upload cover</span>
                </div>
              )}
            </div>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverChange}
            />

            <div className="flex-1 space-y-3">
              <div className="space-y-1">
                <Label htmlFor="title">Title <span className="text-destructive">*</span></Label>
                <Input
                  id="title"
                  value={form.title ?? ''}
                  onChange={(e) => set('title', e.target.value)}
                  placeholder="e.g. One Piece"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="alt-titles">Alternative Titles</Label>
                <Input
                  id="alt-titles"
                  placeholder="Comma-separated"
                  onChange={(e) =>
                    set('alternativeTitles', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Type</Label>
                  <Select value={form.type} onValueChange={(v) => set('type', v as ContentType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manga">Manga</SelectItem>
                      <SelectItem value="novel">Novel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={(v) => set('status', v as ContentStatus)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="hiatus">Hiatus</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="description">Synopsis <span className="text-destructive">*</span></Label>
            <Textarea
              id="description"
              rows={4}
              value={form.description ?? ''}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Brief description of the title…"
            />
          </div>

          <Button onClick={() => setStep(1)} disabled={!form.title || !form.description}>
            Next: Metadata
          </Button>
        </div>
      )}

      {/* Step 1: Metadata */}
      {step === 1 && (
        <div className="space-y-4 rounded-xl border bg-card p-6 dark:border-border">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="author">Author <span className="text-destructive">*</span></Label>
              <Input
                id="author"
                value={form.author ?? ''}
                onChange={(e) => set('author', e.target.value)}
                placeholder="e.g. Eiichiro Oda"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="artist">Artist</Label>
              <Input
                id="artist"
                value={form.artist ?? ''}
                onChange={(e) => set('artist', e.target.value || null)}
                placeholder="If different from author"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                min={1900}
                max={new Date().getFullYear()}
                value={form.year ?? ''}
                onChange={(e) => set('year', e.target.value ? Number(e.target.value) : null)}
                placeholder="e.g. 1999"
              />
            </div>
          </div>

          {genres && genres.length > 0 && (
            <div className="space-y-2">
              <Label>Genres</Label>
              <div className="flex flex-wrap gap-2">
                {genres.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => toggleGenre(g.slug)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-sm transition-colors',
                      (form.genres ?? []).includes(g.slug)
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-foreground hover:bg-accent dark:bg-card'
                    )}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(0)}>Back</Button>
            <Button onClick={() => setStep(2)} disabled={!form.author}>
              Next: Review
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Review */}
      {step === 2 && (
        <div className="space-y-4 rounded-xl border bg-card p-6 dark:border-border">
          <h2 className="font-semibold text-foreground">Review &amp; Submit</h2>

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <ReviewRow label="Title" value={form.title ?? '—'} />
            <ReviewRow label="Type" value={form.type ?? '—'} />
            <ReviewRow label="Status" value={form.status ?? '—'} />
            <ReviewRow label="Author" value={form.author ?? '—'} />
            {form.artist && <ReviewRow label="Artist" value={form.artist} />}
            {form.year && <ReviewRow label="Year" value={String(form.year)} />}
          </dl>

          {(form.genres ?? []).length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Genres</p>
              <div className="flex flex-wrap gap-1.5">
                {(form.genres ?? []).map((slug) => (
                  <Badge key={slug} variant="secondary">{slug}</Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)}>Back</Button>
            <Button onClick={handleSubmit} disabled={createMutation.isPending}>
              {createMutation.isPending ? 'Uploading…' : 'Create Title'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="font-medium capitalize text-foreground">{value}</dd>
    </div>
  )
}
