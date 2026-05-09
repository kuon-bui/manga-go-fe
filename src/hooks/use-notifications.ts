'use client';

import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { apiClient } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import { useAuthStore } from '@/stores/auth-store';
import type { Notification, NotificationType, PaginatedResponse } from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

const notificationQueryOptions = {
  staleTime: Infinity,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  refetchOnMount: false,
} as const;

export const NOTIFICATION_DELETE_ANIMATION_MS = 220;

type RawNotification = Record<string, unknown>;

const NOTIFICATION_TYPE_ALIASES: Record<string, NotificationType> = {
  'new_chapter': 'new_chapter',
  'comic.new_chapter': 'new_chapter',
  'comic_new_chapter': 'new_chapter',
  'comment_reply': 'comment_reply',
  'comment.reply': 'comment_reply',
  'comment_reply_notification': 'comment_reply',
  'system': 'system',
};

const SSE_NOTIFICATION_EVENTS: Array<[string, NotificationType | undefined]> = [
  ['message', undefined],
  ['notification.created', 'new_notification'],
  ['new_chapter', 'new_chapter'],
  ['comic.new_chapter', 'new_chapter'],
  ['comment_reply', 'comment_reply'],
  ['comment.reply', 'comment_reply'],
  ['system', 'system'],
];

function readString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === 'string') {
      return value;
    }
  }

  return null;
}

function readBoolean(value: unknown): boolean | null {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value !== 0;
  }

  if (typeof value === 'string') {
    if (value === 'true') return true;
    if (value === 'false') return false;
  }

  return null;
}

function normalizeNotificationType(
  value: unknown,
  fallbackType?: NotificationType
): NotificationType {
  if (typeof value === 'string') {
    const normalizedKey = value.trim().toLowerCase();
    const normalizedType = NOTIFICATION_TYPE_ALIASES[normalizedKey];

    if (normalizedType) {
      return normalizedType;
    }
  }

  return fallbackType ?? 'system';
}

function normalizeNotificationRecord(
  raw: RawNotification,
  fallbackType?: NotificationType
): Notification | null {
  const id = readString(raw.id);
  const title = readString(raw.title, raw.subject);
  const body = readString(raw.body, raw.message, raw.content, raw.description);
  const createdAt = readString(raw.createdAt, raw.created_at);

  if (!id || !title || !body || !createdAt) {
    return null;
  }

  return {
    id,
    type: normalizeNotificationType(raw.type, fallbackType),
    title,
    body,
    isRead: readBoolean(raw.isRead ?? raw.is_read) ?? false,
    link: readString(raw.link, raw.actionUrl, raw.action_url, raw.url),
    createdAt,
  };
}

function fetchNotifications(params?: Record<string, string>) {
  return apiClient
    .get<PaginatedResponse<RawNotification>>('/notifications', { params })
    .then((response) => ({
      ...response,
      data: response.data
        .map((notification) => normalizeNotificationRecord(notification))
        .filter((notification): notification is Notification => notification !== null),
    }));
}

async function fetchUnreadCount() {
  const result = await fetchNotifications({
    page: '1',
    limit: '1',
    unreadOnly: 'true',
  });

  return { count: result.total };
}

function unwrapNotificationPayload(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== 'object') return null;

  const record = raw as Record<string, unknown>;

  if (record.data && typeof record.data === 'object') {
    return record.data as Record<string, unknown>;
  }

  if (record.notification && typeof record.notification === 'object') {
    return record.notification as Record<string, unknown>;
  }

  return record;
}

function parseIncomingNotification(
  rawData: string,
  fallbackType?: NotificationType
): Notification | null {
  if (!rawData) return null;

  try {
    const parsed = JSON.parse(rawData) as unknown;
    const payload = unwrapNotificationPayload(parsed);

    if (!payload) return null;

    return normalizeNotificationRecord(payload, fallbackType);
  } catch {
    return null;
  }
}

function applyUnreadCountDelta(qc: ReturnType<typeof useQueryClient>, delta: number) {
  if (delta === 0) return;

  qc.setQueryData<{ count: number; }>(queryKeys.notifications.unreadCount(), (current) => ({
    count: Math.max(0, (current?.count ?? 0) + delta),
  }));
}

function upsertIncomingNotification(
  current: PaginatedResponse<Notification> | undefined,
  incoming: Notification
) {
  if (!current) {
    return {
      next: {
        data: [incoming],
        total: 1,
        page: 1,
        pageSize: 20,
        hasMore: false,
      },
      unreadDelta: incoming.isRead ? 0 : 1,
    };
  }

  const existingIndex = current.data.findIndex((item) => item.id === incoming.id);

  if (existingIndex === -1) {
    return {
      next: {
        ...current,
        data: [incoming, ...current.data],
        total: current.total + 1,
      },
      unreadDelta: incoming.isRead ? 0 : 1,
    };
  }

  const existing = current.data[existingIndex];
  const merged = { ...existing, ...incoming };
  const nextData = [...current.data];
  nextData[existingIndex] = merged;

  return {
    next: {
      ...current,
      data: nextData,
    },
    unreadDelta:
      existing.isRead === merged.isRead ? 0 : merged.isRead ? -1 : 1,
  };
}

function applyIncomingNotification(
  qc: ReturnType<typeof useQueryClient>,
  notification: Notification
) {
  let unreadDelta = 0;

  qc.setQueryData<PaginatedResponse<Notification>>(
    queryKeys.notifications.all(),
    (current) => {
      const updated = upsertIncomingNotification(current, notification);
      unreadDelta = updated.unreadDelta;
      return updated.next;
    }
  );

  applyUnreadCountDelta(qc, unreadDelta);
}

function markNotificationReadInCache(
  qc: ReturnType<typeof useQueryClient>,
  id: string
) {
  let unreadDelta = 0;

  qc.setQueryData<PaginatedResponse<Notification>>(
    queryKeys.notifications.all(),
    (current) => {
      if (!current) return current;

      let didChange = false;

      const nextData = current.data.map((notification) => {
        if (notification.id !== id || notification.isRead) return notification;

        didChange = true;
        unreadDelta = -1;

        return {
          ...notification,
          isRead: true,
        };
      });

      return didChange
        ? {
          ...current,
          data: nextData,
        }
        : current;
    }
  );

  applyUnreadCountDelta(qc, unreadDelta);
}

function markAllNotificationsReadInCache(qc: ReturnType<typeof useQueryClient>) {
  qc.setQueryData<PaginatedResponse<Notification>>(
    queryKeys.notifications.all(),
    (current) => {
      if (!current) return current;

      return {
        ...current,
        data: current.data.map((notification) => ({
          ...notification,
          isRead: true,
        })),
      };
    }
  );

  qc.setQueryData(queryKeys.notifications.unreadCount(), { count: 0 });
}

function removeNotificationFromCache(
  qc: ReturnType<typeof useQueryClient>,
  id: string
) {
  let unreadDelta = 0;

  qc.setQueryData<PaginatedResponse<Notification>>(
    queryKeys.notifications.all(),
    (current) => {
      if (!current) return current;

      const notificationToRemove = current.data.find((notification) => notification.id === id);

      if (!notificationToRemove) {
        return current;
      }

      if (!notificationToRemove.isRead) {
        unreadDelta = -1;
      }

      return {
        ...current,
        data: current.data.filter((notification) => notification.id !== id),
        total: Math.max(0, current.total - 1),
      };
    }
  );

  applyUnreadCountDelta(qc, unreadDelta);
}

function clearNotificationsInCache(qc: ReturnType<typeof useQueryClient>) {
  qc.setQueryData<PaginatedResponse<Notification>>(
    queryKeys.notifications.all(),
    (current) => {
      if (!current) return current;

      return {
        ...current,
        data: [],
        total: 0,
        hasMore: false,
      };
    }
  );

  qc.setQueryData(queryKeys.notifications.unreadCount(), { count: 0 });
}

// ─── Queries ──────────────────────────────────────────────────────────────────

/**
 * Fetch all notifications for the current user.
 * Enabled automatically when the user is authenticated.
 */
export function useNotifications(params?: Record<string, string>) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery<PaginatedResponse<Notification>>({
    queryKey: queryKeys.notifications.all(),
    queryFn: () => fetchNotifications(params),
    enabled: isAuthenticated,
    ...notificationQueryOptions,
  });
}

/**
 * Returns the unread notification count.
 * Fetches a single-item page with unreadOnly=true to get the total.
 */
export function useUnreadCount() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return useQuery<{ count: number; }>({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: fetchUnreadCount,
    enabled: isAuthenticated,
    ...notificationQueryOptions,
  });
}

// ─── Bootstrap hook ───────────────────────────────────────────────────────────

/**
 * Refreshes the existing notification list and unread count once after auth.
 * This re-syncs history on page reload in case notifications were removed server-side.
 * Streamed notifications update the cache after this initial bootstrap.
 */
export function useInitializeNotifications() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const qc = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let isCancelled = false;

    if (!isAuthenticated) {
      setIsInitialized(false);
      return;
    }

    setIsInitialized(false);

    async function bootstrap() {
      try {
        await Promise.all([
          qc.fetchQuery({
            queryKey: queryKeys.notifications.all(),
            queryFn: () => fetchNotifications(),
            staleTime: 0,
          }),
          qc.fetchQuery({
            queryKey: queryKeys.notifications.unreadCount(),
            queryFn: fetchUnreadCount,
            staleTime: 0,
          }),
        ]);
      } finally {
        if (!isCancelled) {
          setIsInitialized(true);
        }
      }
    }

    void bootstrap();

    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated, qc]);

  return isInitialized;
}

// ─── SSE hook ─────────────────────────────────────────────────────────────────

/**
 * Connects to /notifications/stream (Server-Sent Events) for real-time
 * notifications after the initial notification cache has loaded.
 */
export function useNotificationStream(isEnabled = true) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const qc = useQueryClient();
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !isEnabled || typeof EventSource === 'undefined') return;

    function connect() {
      // Close any existing connection
      esRef.current?.close();

      const es = new EventSource(`${API_BASE}/notifications/stream`, {
        withCredentials: true,
      });
      esRef.current = es;

      function handleEvent(event: Event, fallbackType?: NotificationType) {
        if (!(event instanceof MessageEvent)) {
          if (fallbackType) {
            void qc.invalidateQueries({ queryKey: queryKeys.notifications.all() });
            void qc.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
          }
          return;
        }

        const notification = parseIncomingNotification(event.data, fallbackType);

        if (notification) {
          applyIncomingNotification(qc, notification);
          return;
        }

        if (fallbackType) {
          void qc.invalidateQueries({ queryKey: queryKeys.notifications.all() });
          void qc.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
        }
      }

      SSE_NOTIFICATION_EVENTS.forEach(([eventName, fallbackType]) => {
        es.addEventListener(eventName, (event) => {
          handleEvent(event, fallbackType);
        });
      });

      es.onerror = () => {
        es.close();
        // Reconnect after 5 s
        setTimeout(connect, 5_000);
      };
    }

    connect();

    return () => {
      esRef.current?.close();
      esRef.current = null;
    };
  }, [isAuthenticated, isEnabled, qc]);
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.markNotificationRead(id),
    onSuccess: (_data, id) => {
      markNotificationReadInCache(qc, id);
    },
  });
}

export function useMarkNotificationSeen() {
  return useMutation({
    mutationFn: (id: string) => apiClient.markNotificationSeen(id),
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.markAllNotificationsRead(),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: queryKeys.notifications.all() });
      await qc.cancelQueries({ queryKey: queryKeys.notifications.unreadCount() });
      const previousNotifications = qc.getQueryData<PaginatedResponse<Notification>>(
        queryKeys.notifications.all()
      );
      const previousUnreadCount = qc.getQueryData<{ count: number; }>(
        queryKeys.notifications.unreadCount()
      );

      markAllNotificationsReadInCache(qc);

      return {
        previousNotifications,
        previousUnreadCount,
      };
    },
    onError: (_error, _variables, context) => {
      if (context?.previousNotifications) {
        qc.setQueryData(queryKeys.notifications.all(), context.previousNotifications);
      }

      if (context?.previousUnreadCount) {
        qc.setQueryData(queryKeys.notifications.unreadCount(), context.previousUnreadCount);
      }
    },
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.deleteNotification(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: queryKeys.notifications.all() });
      await qc.cancelQueries({ queryKey: queryKeys.notifications.unreadCount() });
      const previousNotifications = qc.getQueryData<PaginatedResponse<Notification>>(
        queryKeys.notifications.all()
      );
      const previousUnreadCount = qc.getQueryData<{ count: number; }>(
        queryKeys.notifications.unreadCount()
      );

      const timerId = setTimeout(() => {
        removeNotificationFromCache(qc, id);
      }, NOTIFICATION_DELETE_ANIMATION_MS);

      return {
        previousNotifications,
        previousUnreadCount,
        timerId,
      };
    },
    onError: (_error, _variables, context) => {
      if (context?.timerId) {
        clearTimeout(context.timerId);
      }

      if (context?.previousNotifications) {
        qc.setQueryData(queryKeys.notifications.all(), context.previousNotifications);
      }

      if (context?.previousUnreadCount) {
        qc.setQueryData(queryKeys.notifications.unreadCount(), context.previousUnreadCount);
      }
    },
  });
}

export function useDeleteAllNotifications() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.deleteAllNotifications(),
    onMutate: async () => {
      await qc.cancelQueries({ queryKey: queryKeys.notifications.all() });
      await qc.cancelQueries({ queryKey: queryKeys.notifications.unreadCount() });
      const previousNotifications = qc.getQueryData<PaginatedResponse<Notification>>(
        queryKeys.notifications.all()
      );
      const previousUnreadCount = qc.getQueryData<{ count: number; }>(
        queryKeys.notifications.unreadCount()
      );

      const timerId = setTimeout(() => {
        clearNotificationsInCache(qc);
      }, NOTIFICATION_DELETE_ANIMATION_MS);

      return {
        previousNotifications,
        previousUnreadCount,
        timerId,
      };
    },
    onError: (_error, _variables, context) => {
      if (context?.timerId) {
        clearTimeout(context.timerId);
      }

      if (context?.previousNotifications) {
        qc.setQueryData(queryKeys.notifications.all(), context.previousNotifications);
      }

      if (context?.previousUnreadCount) {
        qc.setQueryData(queryKeys.notifications.unreadCount(), context.previousUnreadCount);
      }
    },
  });
}
