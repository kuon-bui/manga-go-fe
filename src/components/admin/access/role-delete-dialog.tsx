'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authorizationErrorMessage } from '@/lib/authorization-errors';
import { ApiClientError } from '@/lib/api-client';
import type { RoleAccessSummary } from '@/types/rbac';

interface RoleDeleteDialogProps {
  open: boolean;
  onOpenChange: (_open: boolean) => void;
  role: RoleAccessSummary;
  onDelete: (_expectedVersion: string) => Promise<unknown>;
  onRefreshRole?: (_roleId: string) => Promise<RoleAccessSummary>;
}

export function RoleDeleteDialog({
  open,
  onOpenChange,
  role,
  onDelete,
  onRefreshRole,
}: RoleDeleteDialogProps) {
  const [confirmation, setConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState(role);
  const [conflict, setConflict] = useState(false);
  const assigned = currentRole.assignedUserCount > 0;

  useEffect(() => {
    setConfirmation('');
    setError(null);
    setCurrentRole(role);
    setConflict(false);
  }, [open, role]);

  async function handleDelete(): Promise<void> {
    setDeleting(true);
    setError(null);
    try {
      await onDelete(currentRole.authorizationVersion);
      onOpenChange(false);
    } catch (cause: unknown) {
      const message =
        cause instanceof ApiClientError
          ? authorizationErrorMessage(cause.code, cause.message)
          : 'Không thể xóa role. Kiểm tra kết nối rồi thử lại.';
      if (
        cause instanceof ApiClientError &&
        cause.code === 'AUTHORIZATION_STATE_CHANGED' &&
        onRefreshRole
      ) {
        try {
          const refreshed = await onRefreshRole(role.id);
          setCurrentRole(refreshed);
          setConfirmation('');
          setConflict(true);
        } catch {
          setError(`${message} Không thể tải trạng thái role mới nhất.`);
          return;
        }
      }
      setError(message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xóa role {currentRole.name}</DialogTitle>
          <DialogDescription>
            Thao tác này xóa metadata và toàn bộ quyền của role. Nhật ký thay đổi vẫn được giữ lại.
          </DialogDescription>
        </DialogHeader>
        {assigned ? (
          <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
            Role đang được gán cho {currentRole.assignedUserCount} người dùng. Hãy gỡ role khỏi user
            trước.
          </p>
        ) : null}
        <div className="space-y-2">
          <Label htmlFor="delete-role-confirmation">Nhập tên role để xác nhận</Label>
          <Input
            id="delete-role-confirmation"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            disabled={assigned}
          />
        </div>
        {error ? (
          <div role="alert" className="space-y-1 text-sm text-destructive">
            <p>{error}</p>
            {conflict ? (
              <div className="rounded-lg border bg-background p-3 text-foreground">
                <p className="font-semibold">Trạng thái role hiện tại</p>
                <p>{currentRole.name}</p>
                <p className="text-xs text-muted-foreground">
                  {currentRole.description || 'Không có mô tả'}
                </p>
                <p className="mt-2 text-xs">
                  {currentRole.permissions.length
                    ? [...currentRole.permissions].sort().join(', ')
                    : 'Không có quyền'}
                </p>
                <p className="mt-1 text-xs">Đang gán cho {currentRole.assignedUserCount} user</p>
              </div>
            ) : null}
          </div>
        ) : null}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={assigned || confirmation !== currentRole.name || deleting}
            onClick={() => void handleDelete()}
          >
            {deleting ? 'Đang xóa…' : 'Xác nhận xóa'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export type { RoleDeleteDialogProps };
