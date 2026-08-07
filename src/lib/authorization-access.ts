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

const recoveryAttempts = new Set<string>();

export async function recoverAuthorizationAfterForbidden({
  attemptKey,
  queryClient,
  currentPath,
  navigate,
  notify,
}: RecoverAuthorizationOptions): Promise<boolean> {
  if (recoveryAttempts.has(attemptKey)) return false;
  recoveryAttempts.add(attemptKey);

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

export type { RecoverAuthorizationOptions };
