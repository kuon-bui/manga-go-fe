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
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ''}`}
        aria-expanded={open}
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span
            className={cn(
              'absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white'
            )}
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </Button>

      {open && (
        <>
          {/* Backdrop */}
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
