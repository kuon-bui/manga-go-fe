import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  useAuthorizationForbiddenRecovery,
  useAuthorizationUsers,
} from '@/hooks/use-admin-authorization';
import { resetAuthorizationRecoveryAttempts } from '@/lib/authorization-access';
import { ApiClientError, apiClient } from '@/lib/api-client';

const navigation = vi.hoisted(() => ({ replace: vi.fn<(_path: string) => void>() }));
const notifications = vi.hoisted(() => ({ warning: vi.fn<(_message: string) => void>() }));

vi.mock('next/navigation', () => ({
  usePathname: () => '/admin/access/users',
  useRouter: () => ({ replace: navigation.replace }),
}));

vi.mock('sonner', () => ({ toast: { warning: notifications.warning } }));

describe('admin authorization queries', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    navigation.replace.mockReset();
    notifications.warning.mockReset();
    resetAuthorizationRecoveryAttempts();
  });

  it('refreshes the authorization profile and reroutes after a users query returns 403', async () => {
    vi.spyOn(apiClient, 'getAuthorizationUsers').mockRejectedValue(
      new ApiClientError({ message: 'forbidden', statusCode: 403 })
    );
    const getProfile = vi.spyOn(apiClient, 'getMyAuthorization').mockResolvedValue({
      userId: 'user-1',
      roles: [],
      permissions: ['audit_log:read'],
      version: 'g2:u1',
    });
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });

    renderHook(() => useAuthorizationUsers({ page: 1, limit: 20 }), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    });

    await waitFor(() => expect(getProfile).toHaveBeenCalledTimes(1));
    expect(navigation.replace).toHaveBeenCalledWith('/admin/access/audit');
    expect(notifications.warning).toHaveBeenCalledTimes(1);
  });

  it('reroutes when an on-demand target-user refresh returns 403', async () => {
    const getProfile = vi.spyOn(apiClient, 'getMyAuthorization').mockResolvedValue({
      userId: 'user-1',
      roles: [],
      permissions: ['audit_log:read'],
      version: 'g3:u1',
    });
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    const { result } = renderHook(() => useAuthorizationForbiddenRecovery(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      ),
    });

    act(() => {
      result.current(
        new ApiClientError({ message: 'user:read revoked', statusCode: 403 }),
        'authorization-user:user-2:g2:u4'
      );
    });

    await waitFor(() => expect(getProfile).toHaveBeenCalledTimes(1));
    expect(navigation.replace).toHaveBeenCalledWith('/admin/access/audit');
    expect(notifications.warning).toHaveBeenCalledTimes(1);
  });
});
