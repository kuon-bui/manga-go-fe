'use client';

import { useNotificationPolling } from '@/hooks/use-notifications';

/** Mounts the notification polling side-effect; renders nothing. */
export function NotificationPollingProvider() {
  useNotificationPolling();
  return null;
}
