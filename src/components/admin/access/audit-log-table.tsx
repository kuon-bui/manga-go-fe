'use client';

import { History } from 'lucide-react';
import { useMemo, useState } from 'react';

import { AccessState } from '@/components/admin/access/access-state';
import { AuditLogSheet } from '@/components/admin/access/audit-log-sheet';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { AuthorizationAuditLog } from '@/types/rbac';

interface AuditLogTableProps {
  logs: AuthorizationAuditLog[];
  loading: boolean;
  error: boolean;
  filtered: boolean;
  onRetry: () => void;
}

const ACTION_LABELS: Readonly<Record<string, string>> = {
  'user.roles_replaced': 'Thay role người dùng',
  'role.permissions_replaced': 'Thay quyền của role',
  'role.created': 'Tạo role',
  'role.updated': 'Cập nhật role',
  'role.deleted': 'Xóa role',
};

export function AuditLogTable({ logs, loading, error, filtered, onRetry }: AuditLogTableProps) {
  const [selected, setSelected] = useState<AuthorizationAuditLog | null>(null);
  const sortedLogs = useMemo(
    () => [...logs].sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    [logs]
  );

  if (error) {
    return (
      <AccessState
        title="Không thể tải lịch sử phân quyền"
        message="Nhật ký là dữ liệu chỉ đọc và sẽ không bị thay đổi khi tải lại."
        retry={onRetry}
      />
    );
  }
  if (!loading && sortedLogs.length === 0) {
    return (
      <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-6 text-center">
        <History className="h-9 w-9 text-muted-foreground" aria-hidden="true" />
        <p className="font-semibold">
          {filtered ? 'Không có thay đổi khớp bộ lọc' : 'Chưa có lịch sử phân quyền'}
        </p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Thời gian</TableHead>
            <TableHead>Người thực hiện</TableHead>
            <TableHead className="hidden md:table-cell">Hành động</TableHead>
            <TableHead className="hidden sm:table-cell">Đối tượng</TableHead>
            <TableHead className="w-16">
              <span className="sr-only">Chi tiết</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading
            ? Array.from({ length: 6 }, (_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-9 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-9 w-36" />
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <Skeleton className="h-7 w-32" />
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Skeleton className="h-7 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8" />
                  </TableCell>
                </TableRow>
              ))
            : sortedLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap text-xs">
                    {new Date(log.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <p className="font-medium">{log.actorName || 'Hệ thống'}</p>
                    <p className="text-xs text-muted-foreground">{log.actorEmail}</p>
                    <p className="mt-1 text-xs md:hidden">{actionLabel(log.action)}</p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{actionLabel(log.action)}</TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <p className="font-medium">{log.targetName || log.targetId}</p>
                    <p className="text-xs text-muted-foreground">{log.targetType}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{changeSummary(log)}</p>
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      aria-label="Xem chi tiết thay đổi"
                      onClick={() => setSelected(log)}
                    >
                      <History aria-hidden="true" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
      <AuditLogSheet
        log={selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
    </>
  );
}

export function authorizationAuditActionLabel(action: string): string {
  return ACTION_LABELS[action] ?? action;
}

function actionLabel(action: string): string {
  return authorizationAuditActionLabel(action);
}

function changeSummary(log: AuthorizationAuditLog): string {
  const fields = new Set([...Object.keys(log.before), ...Object.keys(log.after)]);
  return fields.size > 0 ? `${fields.size} trường dữ liệu` : 'Không có dữ liệu chi tiết';
}

export type { AuditLogTableProps };
