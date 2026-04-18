'use client'

import { useNotificationPolling, useNotificationStream } from '@/hooks/use-notifications'

/**
 * Mounts the notification polling (60s) and SSE (real-time) hooks.
 * Place this component once inside the authenticated app layout.
 * It renders nothing — purely side-effect driven.
 */
export function NotificationProvider() {
  useNotificationPolling()
  useNotificationStream()
  return null
}
