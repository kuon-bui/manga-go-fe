import { QueryClient } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  recoverAuthorizationAfterForbidden,
  resetAuthorizationRecoveryAttempts,
} from '@/lib/authorization-access';
import { apiClient } from '@/lib/api-client';

describe('recoverAuthorizationAfterForbidden', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    resetAuthorizationRecoveryAttempts();
  });

  it('refetches once, redirects to the first allowed tab, and never replays the forbidden query', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const getProfile = vi.spyOn(apiClient, 'getMyAuthorization').mockResolvedValue({
      userId: 'user-1',
      roles: [],
      permissions: ['audit_log:read'],
      version: 'g2:u1',
    });
    const navigate = vi.fn<(_path: string) => void>();
    const notify = vi.fn<(_message: string) => void>();
    const forbiddenQuery = vi.fn();

    expect(
      await recoverAuthorizationAfterForbidden({
        attemptKey: 'users-query',
        queryClient,
        currentPath: '/admin/access/users',
        navigate,
        notify,
      })
    ).toBe(true);
    expect(
      await recoverAuthorizationAfterForbidden({
        attemptKey: 'users-query',
        queryClient,
        currentPath: '/admin/access/users',
        navigate,
        notify,
      })
    ).toBe(false);

    expect(getProfile).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith('/admin/access/audit');
    expect(notify).toHaveBeenCalledTimes(1);
    expect(forbiddenQuery).not.toHaveBeenCalled();
  });
});
