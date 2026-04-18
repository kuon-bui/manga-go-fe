'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { BookOpen, MessageSquare, Bell, CheckCheck, AlertCircle, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkNotificationSeen,
  useMarkAllRead,
} from '@/hooks/use-notifications'
import type { Notification, NotificationType } from '@/types'

const TYPE_ICON: Record<NotificationType, React.ReactNode> = {
  new_chapter: <BookOpen className="h-4 w-4 text-primary" />,
  comment_reply: <MessageSquare className="h-4 w-4 text-blue-500" />,
  system: <Bell className="h-4 w-4 text-muted-foreground" />,
}

const TYPE_LABELS: Record<NotificationType, string> = {
  new_chapter: 'Chương mới',
  comment_reply: 'Trả lời',
  system: 'Hệ thống',
}

interface NotificationPanelProps {
  onClose: () => void
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const { data, isLoading, isError, refetch } = useNotifications()
  const markRead = useMarkNotificationRead()
  const markSeen = useMarkNotificationSeen()
  const markAll = useMarkAllRead()

  const notifications = data?.data ?? []
  const unreadNotifications = notifications.filter((n) => !n.isRead)
  const unreadCount = unreadNotifications.length

  // Mark all as "seen" when panel opens (different from "read")
  useEffect(() => {
    const unseenIds = notifications
      .filter((n) => !n.isRead)
      .map((n) => n.id)
    if (unseenIds.length > 0) {
      // Batch fire-and-forget seen marks
      unseenIds.forEach((id) => markSeen.mutate(id))
    }
    // Only run once when panel opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleClick(n: Notification) {
    if (!n.isRead) markRead.mutate(n.id)
    onClose()
  }

  return (
    <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border bg-popover shadow-xl dark:border-border animate-in fade-in slide-in-from-top-2 duration-150">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b dark:border-border">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-foreground" />
          <span className="font-semibold text-foreground">Thông báo</span>
          {unreadCount > 0 && (
            <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold text-primary">
              {unreadCount}
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto gap-1 p-0 text-xs text-primary hover:text-primary/80"
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending}
          >
            <CheckCheck className="h-3.5 w-3.5" />
            Đánh dấu tất cả
          </Button>
        )}
      </div>

      {/* List */}
      <div className="max-h-[420px] overflow-y-auto">
        {/* Loading */}
        {isLoading && (
          <div className="space-y-0 divide-y dark:divide-border">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3 px-4 py-3">
                <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {isError && !isLoading && (
          <div className="flex flex-col items-center gap-2 py-10 text-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground opacity-40" />
            <p className="text-sm text-muted-foreground">Không thể tải thông báo.</p>
            <Button
              variant="outline"
              size="sm"
              className="gap-1"
              onClick={() => void refetch()}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Thử lại
            </Button>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && notifications.length === 0 && (
          <div className="py-12 text-center">
            <Bell className="mx-auto mb-2 h-8 w-8 text-muted-foreground opacity-25" />
            <p className="text-sm text-muted-foreground">Chưa có thông báo nào</p>
          </div>
        )}

        {/* Notification list */}
        {!isLoading && !isError && notifications.length > 0 && (
          <div className="divide-y dark:divide-border">
            {notifications.map((n) => (
              <NotificationRow key={n.id} notification={n} onClick={() => handleClick(n)} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <>
          <Separator />
          <div className="px-4 py-2 text-center">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-muted-foreground hover:text-foreground"
              onClick={onClose}
              asChild
            >
              <Link href="/notifications">Xem tất cả thông báo</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Notification Row ─────────────────────────────────────────────────────────

function NotificationRow({
  notification: n,
  onClick,
}: {
  notification: Notification
  onClick: () => void
}) {
  const commonContent = (
    <>
      {/* Icon */}
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
        {TYPE_ICON[n.type] ?? <Bell className="h-4 w-4 text-muted-foreground" />}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 space-y-0.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-snug text-foreground line-clamp-1">
            {n.title}
          </p>
          {!n.isRead && (
            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
          )}
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2">{n.body}</p>
        <div className="flex items-center gap-1.5 pt-0.5">
          <span className="inline-flex items-center rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            {TYPE_LABELS[n.type] ?? n.type}
          </span>
          <span className="text-[11px] text-muted-foreground/60">{formatDate(n.createdAt)}</span>
        </div>
      </div>
    </>
  )

  const rowClass = cn(
    'flex cursor-pointer gap-3 px-4 py-3 transition-colors',
    !n.isRead ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-accent/60'
  )

  if (n.link) {
    return (
      <a href={n.link} onClick={onClick} className={rowClass}>
        {commonContent}
      </a>
    )
  }

  return (
    <div onClick={onClick} className={rowClass} role="button" tabIndex={0}>
      {commonContent}
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60_000)
    const hours = Math.floor(diff / 3_600_000)
    const days = Math.floor(diff / 86_400_000)
    if (mins < 1) return 'vừa xong'
    if (mins < 60) return `${mins}m trước`
    if (hours < 24) return `${hours}h trước`
    if (days < 7) return `${days}d trước`
    return new Date(iso).toLocaleDateString('vi-VN', { day: 'numeric', month: 'numeric' })
  } catch {
    return iso
  }
}
