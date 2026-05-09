'use client'

import { useEffect, useLayoutEffect, useRef, useState, type RefCallback } from 'react'
import Link from 'next/link'
import { BookOpen, MessageSquare, Bell, CheckCheck, AlertCircle, RefreshCw, Trash2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  NOTIFICATION_DELETE_ANIMATION_MS,
  useNotifications,
  useMarkNotificationRead,
  useMarkNotificationSeen,
  useMarkAllRead,
  useDeleteNotification,
  useDeleteAllNotifications,
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

const EMPTY_NOTIFICATIONS: Notification[] = []

interface NotificationPanelProps {
  isOpen: boolean
  onClose: () => void
}

export function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const { data, isLoading, isError, refetch } = useNotifications()
  const markRead = useMarkNotificationRead()
  const markSeen = useMarkNotificationSeen()
  const markAll = useMarkAllRead()
  const deleteNotification = useDeleteNotification()
  const deleteAllNotifications = useDeleteAllNotifications()
  const [exitingIds, setExitingIds] = useState<string[]>([])
  const deleteTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const rowRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const previousRowTopsRef = useRef<Map<string, number>>(new Map())
  const rowAnimationTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const notifications = data?.data ?? EMPTY_NOTIFICATIONS
  const unreadNotifications = notifications.filter((n) => !n.isRead)
  const unreadCount = unreadNotifications.length

  useEffect(() => {
    const deleteTimers = deleteTimersRef.current
    const rowAnimationTimers = rowAnimationTimersRef.current

    return () => {
      deleteTimers.forEach((timerId) => clearTimeout(timerId))
      deleteTimers.clear()
      rowAnimationTimers.forEach((timerId) => clearTimeout(timerId))
      rowAnimationTimers.clear()
    }
  }, [])

  useLayoutEffect(() => {
    const nextRowTops = new Map<string, number>()

    notifications.forEach((notification) => {
      const row = rowRefs.current.get(notification.id)

      if (!row) return

      const nextTop = row.getBoundingClientRect().top
      nextRowTops.set(notification.id, nextTop)

      const previousTop = previousRowTopsRef.current.get(notification.id)

      if (previousTop === undefined) return

      const deltaY = previousTop - nextTop

      if (Math.abs(deltaY) < 1) return

      const existingTimer = rowAnimationTimersRef.current.get(notification.id)
      if (existingTimer) {
        clearTimeout(existingTimer)
      }

      row.style.transition = 'none'
      row.style.transform = `translateY(${deltaY}px)`
      row.style.willChange = 'transform'

      requestAnimationFrame(() => {
        row.style.transition = `transform ${NOTIFICATION_DELETE_ANIMATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`
        row.style.transform = 'translateY(0)'
      })

      const timerId = setTimeout(() => {
        if (rowRefs.current.get(notification.id) !== row) return

        row.style.transition = ''
        row.style.transform = ''
        row.style.willChange = ''
        rowAnimationTimersRef.current.delete(notification.id)
      }, NOTIFICATION_DELETE_ANIMATION_MS)

      rowAnimationTimersRef.current.set(notification.id, timerId)
    })

    previousRowTopsRef.current = nextRowTops
  }, [notifications])

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
  }

  function queueDeleteNotification(id: string) {
    if (exitingIds.length > 0 || deleteNotification.isPending || deleteAllNotifications.isPending) {
      return
    }

    setExitingIds([id])

    deleteNotification.mutate(id, {
      onError: () => {
        const timerId = deleteTimersRef.current.get(id)

        if (timerId) {
          clearTimeout(timerId)
          deleteTimersRef.current.delete(id)
        }

        setExitingIds([])
      },
    })

    const timerId = setTimeout(() => {
      deleteTimersRef.current.delete(id)

      setExitingIds([])
    }, NOTIFICATION_DELETE_ANIMATION_MS)

    deleteTimersRef.current.set(id, timerId)
  }

  function queueDeleteAllNotifications() {
    if (
      notifications.length === 0 ||
      exitingIds.length > 0 ||
      deleteNotification.isPending ||
      deleteAllNotifications.isPending
    ) {
      return
    }

    const ids = notifications.map((notification) => notification.id)

    setExitingIds(ids)

    deleteAllNotifications.mutate(undefined, {
      onError: () => {
        const timerId = deleteTimersRef.current.get('all')

        if (timerId) {
          clearTimeout(timerId)
          deleteTimersRef.current.delete('all')
        }

        setExitingIds([])
      },
    })

    const timerId = setTimeout(() => {
      deleteTimersRef.current.delete('all')

      setExitingIds((current) => current.filter((id) => !ids.includes(id)))
    }, NOTIFICATION_DELETE_ANIMATION_MS)

    deleteTimersRef.current.set('all', timerId)
  }

  function setRowRef(id: string, node: HTMLDivElement | null) {
    if (node) {
      rowRefs.current.set(id, node)
      return
    }

    rowRefs.current.delete(id)
    previousRowTopsRef.current.delete(id)

    const timerId = rowAnimationTimersRef.current.get(id)
    if (timerId) {
      clearTimeout(timerId)
      rowAnimationTimersRef.current.delete(id)
    }
  }

  return (
    <div
      className={cn(
        'absolute right-0 top-full z-50 mt-2 w-[min(32rem,calc(100vw-1rem))] overflow-hidden rounded-xl border bg-popover shadow-xl dark:border-border duration-150 sm:w-[30rem]',
        isOpen
          ? 'animate-in fade-in slide-in-from-top-2'
          : 'pointer-events-none animate-out fade-out slide-out-to-top-2'
      )}
    >
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

        <div className="flex items-center gap-3">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto gap-1 p-0 text-xs text-primary hover:text-primary/80"
              onClick={() => markAll.mutate()}
              disabled={markAll.isPending || deleteAllNotifications.isPending || exitingIds.length > 0}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Đánh dấu tất cả
            </Button>
          )}

          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto gap-1 p-0 text-xs text-destructive hover:text-destructive/80"
              onClick={queueDeleteAllNotifications}
              disabled={deleteAllNotifications.isPending || markAll.isPending || exitingIds.length > 0}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Xóa tất cả
            </Button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="max-h-[520px] overflow-y-auto">
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
              <NotificationRow
                key={n.id}
                notification={n}
                rowRef={(node) => setRowRef(n.id, node)}
                isDeleting={
                  exitingIds.includes(n.id) ||
                  (deleteNotification.isPending && deleteNotification.variables === n.id)
                }
                onClick={() => handleClick(n)}
                onDelete={() => queueDeleteNotification(n.id)}
              />
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
  rowRef,
  isDeleting,
  onClick,
  onDelete,
}: {
  notification: Notification
  rowRef: RefCallback<HTMLDivElement>
  isDeleting: boolean
  onClick: () => void
  onDelete: () => void
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
    'relative flex items-start gap-2 px-4 py-3 transition-colors duration-200',
    isDeleting && 'pointer-events-none animate-out fade-out-0 slide-out-to-left-6 zoom-out-95',
    !n.isRead ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-accent/60'
  )

  const contentClass = 'flex min-w-0 flex-1 gap-3 pr-8 text-left'

  const deleteButton = (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="absolute right-3 top-3 h-5 w-5 shrink-0 rounded-full text-muted-foreground/70 hover:text-destructive"
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onDelete()
      }}
      disabled={isDeleting}
      aria-label="Xóa thông báo"
    >
      <X className="h-3.5 w-3.5" />
    </Button>
  )

  if (n.link) {
    return (
      <div ref={rowRef} className={rowClass}>
        <a href={n.link} onClick={onClick} className={contentClass}>
          {commonContent}
        </a>
        {deleteButton}
      </div>
    )
  }

  return (
    <div ref={rowRef} className={rowClass}>
      <Button
        type="button"
        variant="ghost"
        className="h-auto min-w-0 flex-1 justify-start p-0 text-left hover:bg-transparent"
        onClick={onClick}
      >
        <div className={contentClass}>{commonContent}</div>
      </Button>
      {deleteButton}
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
