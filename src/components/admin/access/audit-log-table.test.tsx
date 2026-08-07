import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { AuditLogFilters } from '@/components/admin/access/audit-log-filters';
import { AuditLogTable } from '@/components/admin/access/audit-log-table';
import { renderWithQuery } from '@/test/render';
import type { AuthorizationAuditFilters, AuthorizationAuditLog } from '@/types/rbac';

const logs: AuthorizationAuditLog[] = [
  {
    id: 'older',
    actorUserId: 'user-1',
    actorName: 'Admin A',
    actorEmail: 'a@example.com',
    action: 'role.created',
    targetType: 'role',
    targetId: 'role-1',
    targetName: 'Reader',
    before: {},
    after: { name: 'Reader', description: null },
    createdAt: '2026-08-06T10:00:00Z',
  },
  {
    id: 'newer',
    actorUserId: 'user-2',
    actorName: 'Admin B',
    actorEmail: 'b@example.com',
    action: 'user.roles_replaced',
    targetType: 'user',
    targetId: 'user-3',
    targetName: 'Nguyễn An',
    before: { roleIds: ['reader'] },
    after: { roleIds: ['moderator'] },
    createdAt: '2026-08-07T10:00:00Z',
  },
];

describe('AuditLogFilters', () => {
  it('serializes action filters and resets the page', async () => {
    const user = userEvent.setup();
    const onFiltersChange = vi.fn<(_filters: AuthorizationAuditFilters) => void>();
    renderWithQuery(
      <AuditLogFilters filters={{ page: 3, limit: 20 }} onFiltersChange={onFiltersChange} />
    );

    await user.selectOptions(screen.getByLabelText('Hành động'), 'user.roles_replaced');
    expect(onFiltersChange).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'user.roles_replaced', page: 1 })
    );
  });
});

describe('AuditLogTable', () => {
  it('renders newest first with localized actions and immutable details', async () => {
    const user = userEvent.setup();
    renderWithQuery(
      <AuditLogTable logs={logs} loading={false} error={false} filtered={false} onRetry={vi.fn()} />
    );

    const detailButtons = screen.getAllByRole('button', { name: 'Xem chi tiết thay đổi' });
    expect(detailButtons).toHaveLength(2);
    const newestRow = detailButtons[0].closest('tr');
    expect(newestRow).not.toBeNull();
    expect(within(newestRow!).getAllByText('Thay role người dùng')).not.toHaveLength(0);

    await user.click(detailButtons[0]);
    expect(screen.getByText('Trước thay đổi')).toBeInTheDocument();
    expect(screen.getByText('Sau thay đổi')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /xóa|sửa|xuất/i })).not.toBeInTheDocument();
  });
});
