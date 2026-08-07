import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RolePermissionWorkspace } from '@/components/admin/access/role-permission-workspace';
import { ApiClientError } from '@/lib/api-client';
import { renderWithQuery } from '@/test/render';
import type { PermissionDefinition, RoleAccessSummary } from '@/types/rbac';

const mocks = vi.hoisted(() => ({
  replacePermissions: vi.fn(),
  refetchRoles: vi.fn(),
  success: vi.fn(),
}));

const role: RoleAccessSummary = {
  id: 'translator',
  name: 'Translator',
  description: null,
  permissions: ['comic:read'],
  assignedUserCount: 0,
  authorizationVersion: 'g1',
};

const currentRole: RoleAccessSummary = {
  ...role,
  authorizationVersion: 'g2',
};

const catalog: PermissionDefinition[] = [
  { name: 'comic:read', object: 'comic', action: 'read', grants: ['read'], contexts: ['any'] },
  {
    name: 'comic:write',
    object: 'comic',
    action: 'write',
    grants: ['create', 'update', 'publish'],
    contexts: ['any'],
  },
];

vi.mock('sonner', () => ({ toast: { success: mocks.success } }));

vi.mock('@/hooks/use-admin-authorization', () => ({
  useAuthorizationRoles: () => ({
    data: [role],
    isLoading: false,
    isError: false,
    refetch: mocks.refetchRoles,
  }),
  usePermissionCatalog: () => ({
    data: catalog,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useCreateAuthorizationRole: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useUpdateAuthorizationRole: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useReplaceRolePermissions: () => ({
    mutateAsync: mocks.replacePermissions,
    isPending: false,
  }),
  useDeleteAuthorizationRole: () => ({ mutateAsync: vi.fn(), isPending: false }),
}));

describe('RolePermissionWorkspace stale-state recovery', () => {
  beforeEach(() => {
    mocks.replacePermissions.mockReset();
    mocks.refetchRoles.mockReset();
    mocks.success.mockReset();
  });

  it('shows current versus draft state and retries with the refreshed version', async () => {
    const user = userEvent.setup();
    mocks.replacePermissions
      .mockRejectedValueOnce(
        new ApiClientError({
          message: 'state changed',
          statusCode: 409,
          code: 'AUTHORIZATION_STATE_CHANGED',
        })
      )
      .mockResolvedValueOnce(currentRole);
    mocks.refetchRoles.mockResolvedValue({ data: [currentRole] });
    renderWithQuery(<RolePermissionWorkspace />);

    await user.click(screen.getByRole('checkbox', { name: 'Truyện · Ghi' }));
    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }));

    expect(await screen.findByText('Trạng thái role hiện tại')).toBeInTheDocument();
    expect(screen.getByText('Draft của bạn')).toBeInTheDocument();
    expect(mocks.replacePermissions).toHaveBeenCalledWith(
      expect.objectContaining({ expectedVersion: 'g1' })
    );

    await user.click(screen.getByRole('button', { name: 'Xác nhận lại và thử lại' }));
    await waitFor(() =>
      expect(mocks.replacePermissions).toHaveBeenLastCalledWith(
        expect.objectContaining({ expectedVersion: 'g2' })
      )
    );
  });
});
