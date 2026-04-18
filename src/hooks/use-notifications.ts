'use client'

import { useEffect, useRef } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiClient } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import { useAuthStore } from '@/stores/auth-store'
import type { Notification, PaginatedResponse } from '@/types'

const POLL_INTERVAL = 60_000 // 60 s
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080'

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Fetch all notifications for the current user.
 * Enabled automatically when the user is authenticated.
 */
export function useNotifications(params?: Record<string, string>) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return useQuery<PaginatedResponse<Notification>>({
    queryKey: queryKeys.notifications.all(),
    queryFn: () =>
      apiClient.get<PaginatedResponse<Notification>>('/notifications', { params }),
    enabled: isAuthenticated,
    staleTime: 30_000,
  })
}

/**
 * Returns the unread notification count.
 * Fetches a single-item page with unreadOnly=true to get the total.
 */
export function useUnreadCount() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return useQuery<{ count: number }>({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: async () => {
      const result = await apiClient.get<PaginatedResponse<Notification>>('/notifications', {
        params: { page: '1', limit: '1', unreadOnly: 'true' },
      })
      return { count: result.total }
    },
    enabled: isAuthenticated,
    staleTime: 30_000,
  })
}

// ─── Polling hook ─────────────────────────────────────────────────────────────

/**
 * Polls for unread count every 60 s.
 * Pauses automatically when the tab is hidden.
 * Mount once in the root layout.
 */
export function useNotificationPolling() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const qc = useQueryClient()

  useEffect(() => {
    if (!isAuthenticated) return

    let timerId: ReturnType<typeof setInterval> | null = null

    function tick() {
      void qc.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() })
    }

    function startPolling() {
      tick()
      timerId = setInterval(tick, POLL_INTERVAL)
    }

    function stopPolling() {
      if (timerId) {
        clearInterval(timerId)
        timerId = null
      }
    }

    function handleVisibilityChange() {
      if (document.hidden) stopPolling()
      else startPolling()
    }

    startPolling()
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      stopPolling()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isAuthenticated, qc])
}

// ─── SSE hook ─────────────────────────────────────────────────────────────────

/**
 * Connects to /notifications/stream (Server-Sent Events) for real-time
 * notifications. Automatically reconnects on connection drop.
 * Mount once in the root layout alongside useNotificationPolling.
 */
export function useNotificationStream() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const qc = useQueryClient()
  const esRef = useRef<EventSource | null>(null)

  useEffect(() => {
    if (!isAuthenticated || typeof EventSource === 'undefined') return

    function connect() {
      // Close any existing connection
      esRef.current?.close()

      const es = new EventSource(`${API_BASE}/notifications/stream`, {
        withCredentials: true,
      })
      esRef.current = es

      es.addEventListener('message', () => {
        // Any SSE message invalidates both lists so the panel refreshes
        void qc.invalidateQueries({ queryKey: queryKeys.notifications.all() })
        void qc.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() })
      })

      es.addEventListener('new_chapter', () => {
        void qc.invalidateQueries({ queryKey: queryKeys.notifications.all() })
        void qc.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() })
      })

      es.addEventListener('comment_reply', () => {
        void qc.invalidateQueries({ queryKey: queryKeys.notifications.all() })
        void qc.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() })
      })

      es.onerror = () => {
        es.close()
        // Reconnect after 5 s
        setTimeout(connect, 5_000)
      }
    }

    connect()

    return () => {
      esRef.current?.close()
      esRef.current = null
    }
  }, [isAuthenticated, qc])
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useMarkNotificationRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.markNotificationRead(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.notifications.all() })
      void qc.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() })
    },
  })
}

export function useMarkNotificationSeen() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.markNotificationSeen(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.notifications.all() })
    },
  })
}

export function useMarkAllRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => apiClient.markAllNotificationsRead(),
    // Optimistic: immediately zero out the badge
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: queryKeys.notifications.unreadCount() })
      qc.setQueryData(queryKeys.notifications.unreadCount(), { count: 0 })
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.notifications.all() })
      void qc.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() })
    },
  })
}
