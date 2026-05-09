'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Bell } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { NotificationPanel } from '@/components/layout/notification-panel'
import { useUnreadCount } from '@/hooks/use-notifications'
import { cn } from '@/lib/utils'

const PANEL_ANIMATION_MS = 150

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { data } = useUnreadCount()
  const unread = data?.count ?? 0

  const clearCloseTimer = useCallback(() => {
    if (!closeTimerRef.current) return

    clearTimeout(closeTimerRef.current)
    closeTimerRef.current = null
  }, [])

  const openPanel = useCallback(() => {
    clearCloseTimer()
    setMounted(true)
    setOpen(true)
  }, [clearCloseTimer])

  const closePanel = useCallback(() => {
    if (!mounted) return

    setOpen(false)
    clearCloseTimer()
    closeTimerRef.current = setTimeout(() => {
      setMounted(false)
      closeTimerRef.current = null
    }, PANEL_ANIMATION_MS)
  }, [clearCloseTimer, mounted])

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: PointerEvent) {
      const target = event.target

      if (!(target instanceof Node)) return
      if (containerRef.current?.contains(target)) return

      closePanel()
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closePanel()
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, closePanel])

  useEffect(() => {
    return () => {
      clearCloseTimer()
    }
  }, [clearCloseTimer])

  return (
    <div ref={containerRef} className="relative">
      <Button
        variant="ghost"
        size="icon"
        id="notification-bell-btn"
        onClick={() => {
          if (open) {
            closePanel()
            return
          }

          openPanel()
        }}
        aria-label={`Thông báo${unread > 0 ? ` (${unread} chưa đọc)` : ''}`}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Bell className={cn('h-4 w-4 transition-transform', open && 'rotate-12')} />

        {/* Unread badge */}
        {unread > 0 && (
          <span
            className={cn(
              'absolute right-1.5 top-1.5',
              'flex h-4 w-4 items-center justify-center',
              'rounded-full bg-primary text-[10px] font-bold text-primary-foreground',
              'animate-in zoom-in-75 duration-200'
            )}
            aria-hidden
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </Button>

      {mounted && (
        <>
          {/* Invisible backdrop to close on outside click */}
          <div
            className="fixed inset-0 z-40"
            onClick={closePanel}
            aria-hidden
          />
          <NotificationPanel isOpen={open} onClose={closePanel} />
        </>
      )}
    </div>
  )
}
