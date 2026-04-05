'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BookOpen, MessageSquare, Bell, CheckCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllRead,
} from '@/hooks/use-notifications'
import type { Notification, NotificationType } from '@/types'

const TYPE_ICON: Record<NotificationType, React.ReactNode> = {
  new_chapter: <BookOpen className="h-4 w-4 text-primary" />,
  comment_reply: <MessageSquare className="h-4 w-4 text-blue-500" />,
  system: <Bell className="h-4 w-4 text-muted-foreground" />,
}

interface NotificationPanelProps {
  onClose: () => void
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const [tab, setTab] = useState<'all' | 'unread'>('all')

  const { data, isLoading } = useNotifications()
  const markRead = useMarkNotificationRead()
  const markAll = useMarkAllRead()

  const notifications = data?.data ?? []
  const filtered = tab === 'unread' ? notifications.filter((n) => !n.isRead) : notifications
  const unreadCount = notifications.filter((n) => !n.isRead).length

  function handleClick(n: Notification) {
    if (!n.isRead) markRead.mutate(n.id)
    onClose()
  }

  return (
    <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border bg-popover shadow-lg dark:border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3">
        <span className="font-semibold text-foreground">Notifications</span>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto gap-1 p-0 text-xs text-primary"
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending}
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b dark:border-border">
        {(['all', 'unread'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'flex-1 py-2 text-sm font-medium capitalize transition-colors',
              tab === t
                ? 'border-b-2 border-primary text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {t}
            {t === 'unread' && unreadCount > 0 && (
              <span className="ml-1.5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="max-h-96 overflow-y-auto">
        {isLoading && (
          <div className="space-y-3 p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-muted-foreground">
            <Bell className="mx-auto mb-2 h-8 w-8 opacity-30" />
            {tab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </div>
        )}

        {!isLoading && filtered.map((n, i) => (
          <div key={n.id}>
            {i > 0 && <Separator />}
            <div
              className={cn(
                'flex gap-3 px-4 py-3 transition-colors',
                !n.isRead && 'bg-primary/5',
                n.link && 'cursor-pointer hover:bg-accent'
              )}
              onClick={() => handleClick(n)}
            >
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                {TYPE_ICON[n.type]}
              </div>
              <div className="flex-1 space-y-0.5">
                <p className="text-sm font-medium text-foreground">{n.title}</p>
                <p className="text-xs text-muted-foreground">{n.body}</p>
                <p className="text-[11px] text-muted-foreground/60">
                  {formatDate(n.createdAt)}
                </p>
              </div>
              {!n.isRead && (
                <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
              )}
            </div>
            {n.link && (
              <Link href={n.link} className="hidden" tabIndex={-1} />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString()
}
