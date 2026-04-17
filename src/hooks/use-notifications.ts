'use client'

import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiClient } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import { useAuthStore } from '@/stores/auth-store'
import type { Notification, PaginatedResponse } from '@/types'

const POLL_INTERVAL = 60_000 // 60 s

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useNotifications() {
  return useQuery<PaginatedResponse<Notification>>({
    queryKey: queryKeys.notifications.all(),
    queryFn: () => apiClient.get<PaginatedResponse<Notification>>('/notifications'),
    enabled: false, // driven by the polling hook below
  })
}

export function useUnreadCount() {
  return useQuery<{ count: number }>({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: async () => {
      const result = await apiClient.get<PaginatedResponse<Notification>>('/notifications', {
        params: {
          page: '1',
          limit: '1',
          unreadOnly: 'true',
        },
      })
      return { count: result.total }
    },
    enabled: false,
  })
}

// ─── Polling hook ─────────────────────────────────────────────────────────────

/**
 * Starts polling for unread notification count every 60 s.
 * Pauses automatically when the tab is hidden.
 * Safe to mount once in the root layout.
 */
export function useNotificationPolling() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const qc = useQueryClient()

  useEffect(() => {
    if (!isAuthenticated) return

    let timerId: ReturnType<typeof setInterval> | null = null

    function tick() {
      qc.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() })
    }

    function startPolling() {
      tick() // immediate first fetch
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

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useMarkNotificationRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.patch(`/notifications/${id}/read`),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all() })
      qc.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() })
    },
  })
}

export function useMarkAllRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => apiClient.patch('/notifications/read-all'),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications.all() })
      qc.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() })
    },
  })
}
