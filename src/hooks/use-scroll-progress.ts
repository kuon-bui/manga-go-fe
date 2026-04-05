'use client'

import { useCallback, useEffect, useRef } from 'react'

import { apiClient } from '@/lib/api-client'

interface UseScrollProgressOptions {
  chapterId: string
  /** Debounce delay before saving progress (ms) */
  debounceMs?: number
  enabled?: boolean
}

/**
 * Tracks reading progress via IntersectionObserver.
 * Returns a ref to attach to each page/paragraph sentinel element.
 * Progress is saved to the API after a debounced delay.
 */
export function useScrollProgress({
  chapterId,
  debounceMs = 1000,
  enabled = true,
}: UseScrollProgressOptions) {
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const latestProgressRef = useRef<number>(0)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const saveProgress = useCallback(
    (progress: number) => {
      if (!enabled || !chapterId) return
      latestProgressRef.current = progress
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => {
        // Fire-and-forget — errors are silently swallowed
        apiClient
          .post(`/chapters/${chapterId}/progress`, { progress })
          .catch(() => undefined)
      }, debounceMs)
    },
    [chapterId, debounceMs, enabled]
  )

  // Attach observer to a sentinel element
  const observeElement = useCallback(
    (el: HTMLElement | null, pageIndex: number, totalPages: number) => {
      if (!el || !enabled) return
      if (!observerRef.current) {
        observerRef.current = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const idx = Number(entry.target.getAttribute('data-page-index'))
                if (!Number.isNaN(idx)) {
                  const progress = Math.round(((idx + 1) / totalPages) * 100)
                  saveProgress(progress)
                }
              }
            })
          },
          { threshold: 0.5 }
        )
      }
      el.setAttribute('data-page-index', String(pageIndex))
      observerRef.current.observe(el)
    },
    [enabled, saveProgress]
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      observerRef.current?.disconnect()
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [])

  return { observeElement }
}
