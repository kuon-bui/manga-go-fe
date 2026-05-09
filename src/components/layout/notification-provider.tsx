'use client'

import {
  useInitializeNotifications,
  useNotificationStream,
} from '@/hooks/use-notifications'

/**
 * Mounts one-time notification bootstrap and SSE syncing.
 * It renders nothing — purely side-effect driven.
 */
export function NotificationProvider() {
  const isInitialized = useInitializeNotifications()

  useNotificationStream(isInitialized)

  return null
}
