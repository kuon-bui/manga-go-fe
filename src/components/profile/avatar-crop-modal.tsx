'use client'

import { useState, useRef, useCallback } from 'react'

import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'

interface AvatarCropModalProps {
  open: boolean
  onOpenChange: (_open: boolean) => void
  /** Called with the cropped Blob when user confirms */
  onCrop: (_blob: Blob) => void
}

const OUTPUT_SIZE = 256   // final PNG size px
const CANVAS_DISPLAY = 300 // display canvas size px

export function AvatarCropModal({ open, onOpenChange, onCrop }: AvatarCropModalProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [imgSrc, setImgSrc] = useState<string | null>(null)
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const dragStart = useRef<{ mx: number; my: number; ox: number; oy: number } | null>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)

  // ─── Load image ─────────────────────────────────────────────────────────────

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      imgRef.current = img
      setImgSrc(url)
      setScale(1)
      setOffset({ x: 0, y: 0 })
      drawCanvas(img, 1, { x: 0, y: 0 })
    }
    img.src = url
  }

  // ─── Canvas drawing ──────────────────────────────────────────────────────────

  const drawCanvas = useCallback(
    (img: HTMLImageElement, s: number, off: { x: number; y: number }) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const size = CANVAS_DISPLAY
      canvas.width = size
      canvas.height = size
      ctx.clearRect(0, 0, size, size)

      // Clip circle
      ctx.save()
      ctx.beginPath()
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
      ctx.clip()

      const scaledW = img.naturalWidth * s
      const scaledH = img.naturalHeight * s
      const x = size / 2 - scaledW / 2 + off.x
      const y = size / 2 - scaledH / 2 + off.y
      ctx.drawImage(img, x, y, scaledW, scaledH)
      ctx.restore()

      // Circle border
      ctx.strokeStyle = 'rgba(99,102,241,0.8)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2)
      ctx.stroke()
    },
    []
  )

  function handleScaleChange(val: number) {
    setScale(val)
    if (imgRef.current) drawCanvas(imgRef.current, val, offset)
  }

  // ─── Drag pan ────────────────────────────────────────────────────────────────

  function handleMouseDown(e: React.MouseEvent) {
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y }
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!dragStart.current || !imgRef.current) return
    const dx = e.clientX - dragStart.current.mx
    const dy = e.clientY - dragStart.current.my
    const next = { x: dragStart.current.ox + dx, y: dragStart.current.oy + dy }
    setOffset(next)
    drawCanvas(imgRef.current, scale, next)
  }

  function handleMouseUp() {
    dragStart.current = null
  }

  // ─── Confirm crop ────────────────────────────────────────────────────────────

  function handleConfirm() {
    const canvas = canvasRef.current
    if (!canvas) return
    // Render at OUTPUT_SIZE
    const out = document.createElement('canvas')
    out.width = OUTPUT_SIZE
    out.height = OUTPUT_SIZE
    const ctx = out.getContext('2d')
    if (!ctx) return
    ctx.drawImage(canvas, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE)
    out.toBlob((blob) => {
      if (blob) {
        onCrop(blob)
        onOpenChange(false)
      }
    }, 'image/png')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Crop Avatar</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File input */}
          {!imgSrc && (
            <label className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border text-sm text-muted-foreground transition-colors hover:border-primary dark:border-border">
              Click to choose an image
              <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </label>
          )}

          {/* Canvas */}
          {imgSrc && (
            <div className="flex flex-col items-center gap-3">
              <canvas
                ref={canvasRef}
                width={CANVAS_DISPLAY}
                height={CANVAS_DISPLAY}
                className="cursor-grab rounded-full active:cursor-grabbing"
                style={{ width: CANVAS_DISPLAY, height: CANVAS_DISPLAY }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />

              <div className="w-full space-y-1">
                <Label className="text-xs text-muted-foreground">Zoom</Label>
                <Slider
                  min={0.5} max={3} step={0.05}
                  value={[scale]}
                  onValueChange={([v]) => handleScaleChange(v)}
                />
              </div>

              <button
                type="button"
                className="text-xs text-primary hover:underline"
                onClick={() => { setImgSrc(null); setScale(1); setOffset({ x: 0, y: 0 }) }}
              >
                Choose different image
              </button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={!imgSrc}>
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
