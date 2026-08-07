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
}

export function RoleDeleteDialog({ open, onOpenChange, role, onDelete }: RoleDeleteDialogProps) {
  const [confirmation, setConfirmation] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const assigned = role.assignedUserCount > 0;

  useEffect(() => {
    setConfirmation('');
    setError(null);
  }, [open, role.id]);

  async function handleDelete(): Promise<void> {
    setDeleting(true);
    setError(null);
    try {
      await onDelete(role.authorizationVersion);
      onOpenChange(false);
    } catch (cause: unknown) {
      setError(
        cause instanceof ApiClientError
          ? authorizationErrorMessage(cause.code, cause.message)
          : 'Không thể xóa role. Kiểm tra kết nối rồi thử lại.'
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xóa role {role.name}</DialogTitle>
          <DialogDescription>
            Thao tác này xóa metadata và toàn bộ quyền của role. Nhật ký thay đổi vẫn được giữ lại.
          </DialogDescription>
        </DialogHeader>
        {assigned ? (
          <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
            Role đang được gán cho {role.assignedUserCount} người dùng. Hãy gỡ role khỏi user trước.
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
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={assigned || confirmation !== role.name || deleting}
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
