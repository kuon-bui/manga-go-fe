'use client'

import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { useNovelReaderStore, type NovelReaderTheme, type FontFamily } from '@/stores/novel-reader-store'
import { cn } from '@/lib/utils'

interface NovelSettingsPanelProps {
  onClose: () => void
}

const THEME_OPTIONS: { value: NovelReaderTheme; label: string; bg: string; text: string }[] = [
  { value: 'day',   label: 'Day',   bg: '#ffffff', text: '#1a1a1a' },
  { value: 'night', label: 'Night', bg: '#1a1a2e', text: '#e0e0e0' },
  { value: 'sepia', label: 'Sepia', bg: '#f4ecd8', text: '#3b2a1a' },
]

const FONT_OPTIONS: { value: FontFamily; label: string; preview: string }[] = [
  { value: 'serif', label: 'Serif',   preview: 'Aa' },
  { value: 'sans',  label: 'Sans',    preview: 'Aa' },
  { value: 'mono',  label: 'Mono',    preview: 'Aa' },
]

export function NovelSettingsPanel({ onClose }: NovelSettingsPanelProps) {
  const {
    theme, setTheme,
    fontFamily, setFontFamily,
    fontSize, setFontSize,
    lineHeight, setLineHeight,
    textWidth, setTextWidth,
  } = useNovelReaderStore()

  return (
    <aside
      className="fixed right-0 top-12 z-50 h-[calc(100vh-3rem)] w-72 overflow-y-auto p-5 shadow-xl"
      style={{ background: 'var(--reader-surface)', color: 'var(--reader-text)' }}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <span className="font-semibold">Reading Settings</span>
        <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close settings">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-5">
        {/* Theme */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase opacity-60">Theme</Label>
          <div className="flex gap-2">
            {THEME_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTheme(opt.value)}
                className={cn(
                  'flex-1 rounded-lg border-2 py-2 text-xs font-medium transition-all',
                  theme === opt.value ? 'border-primary' : 'border-transparent'
                )}
                style={{ background: opt.bg, color: opt.text }}
                aria-pressed={theme === opt.value}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <Separator style={{ opacity: 0.15 }} />

        {/* Font family */}
        <div className="space-y-2">
          <Label className="text-xs font-semibold uppercase opacity-60">Font</Label>
          <div className="flex gap-2">
            {FONT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFontFamily(opt.value)}
                className={cn(
                  'flex-1 rounded-lg border-2 py-2 text-xs transition-all',
                  fontFamily === opt.value ? 'border-primary' : 'border-transparent opacity-60'
                )}
                style={{
                  fontFamily: opt.value === 'serif' ? 'Georgia, serif'
                    : opt.value === 'mono' ? 'monospace'
                    : 'sans-serif',
                }}
                aria-pressed={fontFamily === opt.value}
              >
                {opt.preview}
                <span className="block text-[10px]">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        <Separator style={{ opacity: 0.15 }} />

        {/* Font size */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold uppercase opacity-60">Font Size</Label>
            <span className="text-xs">{fontSize}px</span>
          </div>
          <Slider
            min={14} max={24} step={1}
            value={[fontSize]}
            onValueChange={([v]) => setFontSize(v)}
          />
        </div>

        {/* Line height */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold uppercase opacity-60">Line Height</Label>
            <span className="text-xs">{lineHeight.toFixed(1)}</span>
          </div>
          <Slider
            min={1.4} max={2.2} step={0.1}
            value={[lineHeight]}
            onValueChange={([v]) => setLineHeight(v)}
          />
        </div>

        {/* Text width */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold uppercase opacity-60">Text Width</Label>
            <span className="text-xs">{textWidth}ch</span>
          </div>
          <Slider
            min={50} max={90} step={5}
            value={[textWidth]}
            onValueChange={([v]) => setTextWidth(v)}
          />
        </div>
      </div>
    </aside>
  )
}
