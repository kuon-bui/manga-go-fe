'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { AuthorizationAuditFilters } from '@/types/rbac';

interface AuditLogFiltersProps {
  filters: AuthorizationAuditFilters;
  onFiltersChange: (_filters: AuthorizationAuditFilters) => void;
}

const ACTIONS = [
  ['user.roles_replaced', 'Thay role người dùng'],
  ['role.permissions_replaced', 'Thay quyền của role'],
  ['role.created', 'Tạo role'],
  ['role.updated', 'Cập nhật role'],
  ['role.deleted', 'Xóa role'],
] as const;

export function AuditLogFilters({ filters, onFiltersChange }: AuditLogFiltersProps) {
  const [actor, setActor] = useState(filters.actor ?? '');
  const [targetId, setTargetId] = useState(filters.targetId ?? '');
  const [startDate, setStartDate] = useState(toLocalDateInput(filters.startAt));
  const [endDate, setEndDate] = useState(toLocalDateInput(filters.endAt));
  const invalidRange = Boolean(startDate && endDate && startDate > endDate);

  useEffect(() => {
    setActor(filters.actor ?? '');
    setTargetId(filters.targetId ?? '');
    setStartDate(toLocalDateInput(filters.startAt));
    setEndDate(toLocalDateInput(filters.endAt));
  }, [filters.actor, filters.endAt, filters.startAt, filters.targetId]);

  function update(patch: Partial<AuthorizationAuditFilters>): void {
    onFiltersChange({ ...filters, ...patch, page: 1 });
  }

  function applyDraft(): void {
    if (invalidRange) return;
    update({
      actor: actor.trim() || undefined,
      targetId: targetId.trim() || undefined,
      startAt: startDate ? localDayBoundary(startDate, false) : undefined,
      endAt: endDate ? localDayBoundary(endDate, true) : undefined,
    });
  }

  function clearFilters(): void {
    setActor('');
    setTargetId('');
    setStartDate('');
    setEndDate('');
    onFiltersChange({ page: 1, limit: filters.limit });
  }

  return (
    <div className="grid gap-3 rounded-2xl border bg-secondary/20 p-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="space-y-1.5">
        <Label htmlFor="audit-actor">Người thực hiện</Label>
        <Input
          id="audit-actor"
          value={actor}
          placeholder="Tên hoặc email"
          onChange={(event) => setActor(event.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="audit-action">Hành động</Label>
        <select
          id="audit-action"
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={filters.action ?? ''}
          onChange={(event) => update({ action: event.target.value })}
        >
          <option value="">Tất cả hành động</option>
          {ACTIONS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="audit-target-type">Loại đối tượng</Label>
        <select
          id="audit-target-type"
          className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
          value={filters.targetType ?? ''}
          onChange={(event) => update({ targetType: event.target.value })}
        >
          <option value="">Tất cả</option>
          <option value="user">Người dùng</option>
          <option value="role">Role</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="audit-target-id">ID đối tượng</Label>
        <Input
          id="audit-target-id"
          value={targetId}
          onChange={(event) => setTargetId(event.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="audit-start">Từ ngày</Label>
        <Input
          id="audit-start"
          type="date"
          value={startDate}
          onChange={(event) => setStartDate(event.target.value)}
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="audit-end">Đến ngày</Label>
        <Input
          id="audit-end"
          type="date"
          value={endDate}
          onChange={(event) => setEndDate(event.target.value)}
        />
      </div>
      <div className="flex items-end gap-2 sm:col-span-2">
        <Button type="button" variant="outline" disabled={invalidRange} onClick={applyDraft}>
          Áp dụng
        </Button>
        <Button type="button" variant="ghost" onClick={clearFilters}>
          Xóa bộ lọc
        </Button>
      </div>
      {invalidRange ? (
        <p role="alert" className="text-sm text-destructive sm:col-span-2 lg:col-span-4">
          Ngày bắt đầu không được sau ngày kết thúc.
        </p>
      ) : null}
    </div>
  );
}

function toLocalDateInput(value: string | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function localDayBoundary(value: string, endOfDay: boolean): string {
  const suffix = endOfDay ? 'T23:59:59.999' : 'T00:00:00.000';
  return new Date(`${value}${suffix}`).toISOString();
}

export type { AuditLogFiltersProps };
export { ACTIONS as AUTHORIZATION_AUDIT_ACTIONS };
