import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthorizationGate } from '@/components/auth/authorization-gate';
import { AuthorizationProvider } from '@/components/auth/authorization-provider';
import { ApiClientError, apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import { renderWithQuery } from '@/test/render';
import type { AuthorizationProfile } from '@/types/rbac';

function profileWith(permissions: string[]): AuthorizationProfile {
  return {
    userId: 'user-admin',
    roles: [{ id: 'role-admin', name: 'Administrator', description: null }],
    permissions,
    version: 'g1:u1',
  };
}

function renderGate(
  gate: React.ReactNode,
  getProfile: () => Promise<AuthorizationProfile>
): ReturnType<typeof renderWithQuery> {
  vi.spyOn(apiClient, 'getMyAuthorization').mockImplementation(getProfile);
  return renderWithQuery(<AuthorizationProvider>{gate}</AuthorizationProvider>);
}

describe('AuthorizationGate', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    useAuthStore.setState({
      user: {
        id: 'user-admin',
        name: 'Admin',
        email: 'admin@example.com',
        avatarUrl: null,
        bio: null,
        createdAt: '2026-08-07T00:00:00Z',
      },
      isAuthenticated: true,
    });
  });

  it('renders a loading shape without flashing the denied fallback', () => {
    renderGate(
      <AuthorizationGate
        allOf={['role:manage']}
        loading={<p>Đang tải quyền</p>}
        fallback={<p>Từ chối</p>}
      >
        <p>Cho phép</p>
      </AuthorizationGate>,
      () => new Promise<AuthorizationProfile>(() => {})
    );

    expect(screen.getByText('Đang tải quyền')).toBeInTheDocument();
    expect(screen.queryByText('Từ chối')).not.toBeInTheDocument();
  });

  it('renders allowed content only when all requirements match', async () => {
    renderGate(
      <AuthorizationGate allOf={['role:manage', 'permission:read']} fallback={<p>Từ chối</p>}>
        <p>Cho phép</p>
      </AuthorizationGate>,
      async () => profileWith(['role:manage', 'permission:read'])
    );

    expect(await screen.findByText('Cho phép')).toBeInTheDocument();
    expect(screen.queryByText('Từ chối')).not.toBeInTheDocument();
  });

  it('allows at least one any-of permission and otherwise renders fallback', async () => {
    const { rerender } = renderGate(
      <AuthorizationGate anyOf={['audit_log:read', 'role:manage']} fallback={<p>Từ chối</p>}>
        <p>Cho phép</p>
      </AuthorizationGate>,
      async () => profileWith(['role:manage'])
    );

    expect(await screen.findByText('Cho phép')).toBeInTheDocument();
    rerender(
      <AuthorizationProvider>
        <AuthorizationGate allOf={['audit_log:read']} fallback={<p>Từ chối</p>}>
          <p>Cho phép</p>
        </AuthorizationGate>
      </AuthorizationProvider>
    );
    expect(await screen.findByText('Từ chối')).toBeInTheDocument();
  });

  it('shows an error state and retries the profile query', async () => {
    const getProfile = vi
      .fn<() => Promise<AuthorizationProfile>>()
      .mockRejectedValueOnce(new Error('network unavailable'))
      .mockResolvedValueOnce(profileWith(['role:manage']));
    const user = userEvent.setup();

    renderGate(
      <AuthorizationGate allOf={['role:manage']}>
        <p>Cho phép</p>
      </AuthorizationGate>,
      getProfile
    );

    expect(await screen.findByText('Không thể tải quyền truy cập')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Thử lại' }));
    expect(await screen.findByText('Cho phép')).toBeInTheDocument();
    expect(getProfile).toHaveBeenCalledTimes(2);
  });

  it('uses the authentication-expiry flow when the profile returns 401', async () => {
    renderGate(
      <AuthorizationGate allOf={['role:manage']}>
        <p>Cho phép</p>
      </AuthorizationGate>,
      async () => {
        throw new ApiClientError({ message: 'expired', statusCode: 401 });
      }
    );

    await waitFor(() => expect(useAuthStore.getState().isAuthenticated).toBe(false));
  });
});
