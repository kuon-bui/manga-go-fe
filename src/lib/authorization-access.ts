import type { QueryClient } from '@tanstack/react-query';

import { firstAllowedAccessPath } from '@/components/admin/access/access-tabs';
import { apiClient } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';

interface RecoverAuthorizationOptions {
  attemptKey: string;
  queryClient: QueryClient;
  currentPath: string;
  navigate: (_path: string) => void;
  notify: (_message: string) => void;
}

const RECOVERY_ATTEMPT_TTL_MS = 60_000;
const MAX_RECOVERY_ATTEMPTS = 200;
const recoveryAttempts = new Map<string, number>();

export async function recoverAuthorizationAfterForbidden({
  attemptKey,
  queryClient,
  currentPath,
  navigate,
  notify,
}: RecoverAuthorizationOptions): Promise<boolean> {
  const now = Date.now();
  pruneAuthorizationRecoveryAttempts(now);
  if (recoveryAttempts.has(attemptKey)) return false;
  if (recoveryAttempts.size >= MAX_RECOVERY_ATTEMPTS) {
    const oldest = recoveryAttempts.keys().next().value;
    if (oldest !== undefined) recoveryAttempts.delete(oldest);
  }
  recoveryAttempts.set(attemptKey, now + RECOVERY_ATTEMPT_TTL_MS);

  try {
    await queryClient.invalidateQueries({
      queryKey: queryKeys.authorization.me(),
      refetchType: 'none',
    });
    const profile = await queryClient.fetchQuery({
      queryKey: queryKeys.authorization.me(),
      queryFn: () => apiClient.getMyAuthorization(),
      staleTime: 0,
    });
    const destination = firstAllowedAccessPath(profile) ?? '/';
    if (destination === '/' || !currentPath.startsWith(destination)) navigate(destination);
    notify('Quyền truy cập của bạn đã thay đổi. Hồ sơ phân quyền đã được tải lại.');
    return true;
  } catch (error: unknown) {
    recoveryAttempts.delete(attemptKey);
    throw error;
  }
}

export function resetAuthorizationRecoveryAttempts(): void {
  recoveryAttempts.clear();
}

function pruneAuthorizationRecoveryAttempts(now: number): void {
  for (const [key, expiresAt] of recoveryAttempts) {
    if (expiresAt <= now) recoveryAttempts.delete(key);
  }
}

export type { RecoverAuthorizationOptions };
