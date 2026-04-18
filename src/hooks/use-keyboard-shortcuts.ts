'use client'

import { useEffect } from 'react'

interface ShortcutHandlers {
  onNext?: () => void
  onPrev?: () => void
  onToggleSettings?: () => void
  onToggleFullscreen?: () => void
  enabled?: boolean
}

export function useKeyboardShortcuts({
  onNext,
  onPrev,
  onToggleSettings,
  onToggleFullscreen,
  enabled = true,
}: ShortcutHandlers) {
  useEffect(() => {
    if (!enabled) return

    function handleKeyDown(e: KeyboardEvent) {
      // Ignore when typing in inputs/textareas
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
        case 'PageDown':
          e.preventDefault()
          onNext?.()
          break
        case 'ArrowLeft':
        case 'ArrowUp':
        case 'PageUp':
          e.preventDefault()
          onPrev?.()
          break
        case 'Escape':
          e.preventDefault()
          if (document.fullscreenElement) {
            document.exitFullscreen().catch(() => undefined)
          } else {
            // Native history back if ESC is pressed and we aren't in fullscreen
            window.history.back()
          }
          break
        case 't':
        case 'T':
          onToggleSettings?.()
          break
        case 'f':
        case 'F':
          e.preventDefault()
          if (onToggleFullscreen) {
            onToggleFullscreen()
          } else {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen().catch(() => undefined)
            } else {
              document.exitFullscreen().catch(() => undefined)
            }
          }
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [enabled, onNext, onPrev, onToggleSettings, onToggleFullscreen])
}
