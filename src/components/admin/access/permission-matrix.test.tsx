import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { PermissionMatrix } from '@/components/admin/access/permission-matrix';
import { RoleDeleteDialog } from '@/components/admin/access/role-delete-dialog';
import { renderWithQuery } from '@/test/render';
import type { PermissionDefinition, RoleAccessSummary } from '@/types/rbac';

const catalog: PermissionDefinition[] = [
  { name: 'comic:read', object: 'comic', action: 'read', grants: ['read'], contexts: ['any'] },
  {
    name: 'comic:write',
    object: 'comic',
    action: 'write',
    grants: ['create', 'update', 'publish'],
    contexts: ['any'],
  },
  { name: 'role:manage', object: 'role', action: 'manage', grants: ['manage'], contexts: ['any'] },
];

const role: RoleAccessSummary = {
  id: 'translator',
  name: 'translator',
  description: null,
  permissions: ['comic:write'],
  assignedUserCount: 0,
  authorizationVersion: 'g1',
};

describe('PermissionMatrix', () => {
  it('renders catalog-driven rows, checked values, and the write expansion help', () => {
    renderWithQuery(
      <PermissionMatrix catalog={catalog} selected={new Set(['comic:write'])} onChange={vi.fn()} />
    );

    expect(screen.getByRole('row', { name: /truyện/i })).toBeInTheDocument();
    expect(screen.getByRole('checkbox', { name: 'Truyện · Ghi' })).toBeChecked();
    expect(screen.getByText('Tạo, cập nhật và xuất bản')).toBeInTheDocument();
  });
});

describe('RoleDeleteDialog', () => {
  it('requires the exact case-sensitive role name before deletion', async () => {
    const user = userEvent.setup();
    renderWithQuery(
      <RoleDeleteDialog open onOpenChange={vi.fn()} role={role} onDelete={vi.fn()} />
    );

    expect(screen.getByRole('button', { name: 'Xác nhận xóa' })).toBeDisabled();
    await user.type(screen.getByLabelText('Nhập tên role để xác nhận'), 'Translator');
    expect(screen.getByRole('button', { name: 'Xác nhận xóa' })).toBeDisabled();
    await user.clear(screen.getByLabelText('Nhập tên role để xác nhận'));
    await user.type(screen.getByLabelText('Nhập tên role để xác nhận'), 'translator');
    expect(screen.getByRole('button', { name: 'Xác nhận xóa' })).toBeEnabled();
  });

  it('disables deletion and displays the assigned user count', () => {
    renderWithQuery(
      <RoleDeleteDialog
        open
        onOpenChange={vi.fn()}
        role={{ ...role, assignedUserCount: 2 }}
        onDelete={vi.fn()}
      />
    );

    expect(screen.getByText(/đang được gán cho 2 người dùng/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Xác nhận xóa' })).toBeDisabled();
  });
});
