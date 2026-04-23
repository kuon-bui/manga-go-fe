'use client'

import { useRef, useState, useCallback } from 'react'
import { SafeImage as Image } from '@/components/ui/safe-image'
import { Upload, X, GripVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MangaPageUploaderProps {
  pages: File[]
  onChange: (_pages: File[]) => void
}

interface PageItem {
  id: string
  url: string    // object URL for preview
  file: File
}

export function MangaPageUploader({ onChange }: MangaPageUploaderProps) {
  const [items, setItems] = useState<PageItem[]>([])
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  function emitChange(next: PageItem[]) {
    onChange(next.map((p) => p.file))
  }

  function handleFiles(files: FileList | null) {
    if (!files) return
    const newItems: PageItem[] = Array.from(files)
      .filter((f) => f.type.startsWith('image/'))
      .map((file) => ({
        id: `${Date.now()}-${Math.random()}`,
        url: URL.createObjectURL(file),
        file,
      }))
    const next = [...items, ...newItems]
    setItems(next)
    emitChange(next)
  }

  function handleRemove(id: string) {
    const next = items.filter((p) => p.id !== id)
    setItems(next)
    emitChange(next)
  }

  // ─── Drag-to-reorder ────────────────────────────────────────────────────────

  const handleDragStart = useCallback((id: string) => setDraggingId(id), [])
  const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault()
    setDragOverId(id)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!draggingId || draggingId === targetId) {
      setDraggingId(null)
      setDragOverId(null)
      return
    }
    setItems((prev) => {
      const from = prev.findIndex((p) => p.id === draggingId)
      const to = prev.findIndex((p) => p.id === targetId)
      const next = [...prev]
      const [moved] = next.splice(from, 1)
      next.splice(to, 0, moved)
      emitChange(next)
      return next
    })
    setDraggingId(null)
    setDragOverId(null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draggingId])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">
          Pages
          {items.length > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">({items.length})</span>
          )}
        </h3>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-accent dark:border-border"
        >
          <Upload className="h-4 w-4" /> Add Images
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Drop zone (empty state) */}
      {items.length === 0 && (
        <div
          className="flex h-48 cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary dark:border-border"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleFiles(e.dataTransfer.files) }}
        >
          <Upload className="h-8 w-8" />
          <p className="text-sm">Drop images here or click to browse</p>
          <p className="text-xs opacity-60">PNG, JPG, WebP — multiple files supported</p>
        </div>
      )}

      {/* Thumbnails grid */}
      {items.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {items.map((item, i) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(item.id)}
              onDragOver={(e) => handleDragOver(e, item.id)}
              onDrop={(e) => handleDrop(e, item.id)}
              onDragEnd={() => { setDraggingId(null); setDragOverId(null) }}
              className={cn(
                'group relative aspect-[2/3] overflow-hidden rounded-lg border bg-muted transition-all',
                draggingId === item.id && 'opacity-40 scale-95',
                dragOverId === item.id && draggingId !== item.id && 'ring-2 ring-primary',
                'dark:border-border'
              )}
            >
              <Image
                src={item.url}
                alt={`Page ${i + 1}`}
                fill
                sizes="120px"
                className="object-cover"
              />
              {/* Page number */}
              <span className="absolute bottom-1 left-1 rounded-md bg-background/80 px-1 py-0.5 text-[10px] text-foreground backdrop-blur-sm">
                {i + 1}
              </span>
              {/* Drag handle */}
              <span className="absolute left-1 top-1 cursor-grab text-foreground/70 opacity-0 transition-opacity group-hover:opacity-100">
                <GripVertical className="h-4 w-4" />
              </span>
              {/* Remove button */}
              <button
                type="button"
                className="absolute right-1 top-1 rounded-full bg-background/80 p-0.5 text-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground backdrop-blur-sm"
                onClick={() => handleRemove(item.id)}
                aria-label={`Remove page ${i + 1}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}

          {/* Add more button */}
          <div
            className="flex aspect-[2/3] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary dark:border-border"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="h-5 w-5" />
            <span className="mt-1 text-xs">Add</span>
          </div>
        </div>
      )}
    </div>
  )
}
