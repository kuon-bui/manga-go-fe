'use client';

import { useInitializeNotifications } from '@/hooks/use-notifications';

/** Mounts the one-time notification bootstrap side-effect; renders nothing. */
export function NotificationPollingProvider() {
  useInitializeNotifications();
  return null;
}
