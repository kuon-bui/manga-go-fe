'use client'

import { useState } from 'react'
import { Bell } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { NotificationPanel } from '@/components/layout/notification-panel'
import { useUnreadCount } from '@/hooks/use-notifications'
import { cn } from '@/lib/utils'

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const { data } = useUnreadCount()
  const unread = data?.count ?? 0

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        id="notification-bell-btn"
        onClick={() => setOpen((v) => !v)}
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

      {open && (
        <>
          {/* Invisible backdrop to close on outside click */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <NotificationPanel onClose={() => setOpen(false)} />
        </>
      )}
    </div>
  )
}
