import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { UserRoleSheet } from '@/components/admin/access/user-role-sheet';
import { ApiClientError } from '@/lib/api-client';
import { renderWithQuery } from '@/test/render';
import type { AdminUserSummary, RoleAccessSummary } from '@/types/rbac';

const roles: RoleAccessSummary[] = [
  {
    id: 'admin',
    name: 'Administrator',
    description: null,
    permissions: ['role:manage', 'user:read'],
    assignedUserCount: 1,
    authorizationVersion: 'g1',
  },
  {
    id: 'reader',
    name: 'Reader',
    description: null,
    permissions: ['comic:read'],
    assignedUserCount: 1,
    authorizationVersion: 'g1',
  },
  {
    id: 'moderator',
    name: 'Moderator',
    description: null,
    permissions: ['comment:manage', 'user:read'],
    assignedUserCount: 0,
    authorizationVersion: 'g1',
  },
];

function userWith(roleIds: string[]): AdminUserSummary {
  return {
    id: 'user-1',
    name: 'Nguyễn An',
    email: 'an@example.com',
    roles: roles
      .filter((role) => roleIds.includes(role.id))
      .map(({ id, name, description }) => ({ id, name, description })),
    authorizationVersion: 'g1:u1',
  };
}

describe('UserRoleSheet', () => {
  it('initializes multiple roles, previews staged permission changes, and warns on role:manage', async () => {
    const user = userEvent.setup();
    renderWithQuery(
      <UserRoleSheet
        open
        onOpenChange={vi.fn()}
        user={userWith(['admin', 'reader'])}
        roles={roles}
        onSave={vi.fn().mockResolvedValue(undefined)}
      />
    );

    expect(screen.getByRole('checkbox', { name: 'Administrator' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'Reader' })).toBeChecked();

    await user.click(screen.getByRole('checkbox', { name: 'Moderator' }));
    expect(screen.getByText('Quyền được thêm')).toBeInTheDocument();
    expect(screen.queryByText('Đã lưu')).not.toBeInTheDocument();

    await user.click(screen.getByRole('checkbox', { name: 'Administrator' }));
    await user.click(screen.getByRole('button', { name: 'Lưu role' }));
    expect(screen.getByText('Xác nhận thay đổi quyền quản trị')).toBeInTheDocument();
  });

  it('saves an explicitly empty role set', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn().mockResolvedValue(undefined);
    renderWithQuery(
      <UserRoleSheet
        open
        onOpenChange={vi.fn()}
        user={userWith(['reader'])}
        roles={roles}
        onSave={onSave}
      />
    );

    await user.click(screen.getByRole('checkbox', { name: 'Reader' }));
    await user.click(screen.getByRole('button', { name: 'Lưu role' }));
    await user.click(screen.getByRole('button', { name: 'Xác nhận lưu' }));

    expect(onSave).toHaveBeenCalledWith([], 'g1:u1');
  });

  it('keeps the draft open and maps a 409 conflict', async () => {
    const user = userEvent.setup();
    const refreshedUser = {
      ...userWith(['admin']),
      authorizationVersion: 'g2:u3',
    };
    const onSave = vi
      .fn()
      .mockRejectedValueOnce(
        new ApiClientError({
          message: 'state changed',
          statusCode: 409,
          code: 'AUTHORIZATION_STATE_CHANGED',
        })
      )
      .mockResolvedValueOnce(undefined);
    const onRefreshUser = vi.fn().mockResolvedValue(refreshedUser);
    renderWithQuery(
      <UserRoleSheet
        open
        onOpenChange={vi.fn()}
        user={userWith(['reader'])}
        roles={roles}
        onSave={onSave}
        onRefreshUser={onRefreshUser}
      />
    );

    await user.click(screen.getByRole('checkbox', { name: 'Moderator' }));
    await user.click(screen.getByRole('button', { name: 'Lưu role' }));
    await user.click(screen.getByRole('button', { name: 'Xác nhận lưu' }));

    expect(await screen.findByText(/Dữ liệu phân quyền đã thay đổi/)).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Moderator' })).toBeChecked();
    expect(onRefreshUser).toHaveBeenCalledWith('user-1');
    expect(screen.getByText('Role hiện tại trên hệ thống')).toBeInTheDocument();
    expect(screen.getByText('Draft của bạn')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Thử lại' }));
    await user.click(screen.getByRole('button', { name: 'Xác nhận lưu' }));
    expect(onSave).toHaveBeenLastCalledWith(['moderator', 'reader'], 'g2:u3');
  });
});
