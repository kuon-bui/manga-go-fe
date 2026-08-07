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
import { Textarea } from '@/components/ui/textarea';
import type { CreateRolePayload, RoleAccessSummary } from '@/types/rbac';

interface RoleEditorDialogProps {
  open: boolean;
  onOpenChange: (_open: boolean) => void;
  role?: RoleAccessSummary;
  onSubmit: (_payload: CreateRolePayload) => Promise<unknown>;
}

export function RoleEditorDialog({ open, onOpenChange, role, onSubmit }: RoleEditorDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(role?.name ?? '');
    setDescription(role?.description ?? '');
    setError(null);
  }, [open, role]);

  async function handleSubmit(): Promise<void> {
    const trimmedName = name.trim();
    if (trimmedName.length < 2) {
      setError('Tên role phải có ít nhất 2 ký tự.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSubmit({ name: trimmedName, description: description.trim() || null });
      onOpenChange(false);
    } catch (cause: unknown) {
      setError(cause instanceof Error ? cause.message : 'Không thể lưu role.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{role ? 'Đổi tên role' : 'Tạo role'}</DialogTitle>
          <DialogDescription>
            Tên và mô tả giúp admin hiểu phạm vi của role; quyền được chọn riêng trong ma trận.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role-editor-name">Tên role</Label>
            <Input
              id="role-editor-name"
              value={name}
              maxLength={100}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role-editor-description">Mô tả</Label>
            <Textarea
              id="role-editor-description"
              value={description}
              maxLength={1000}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button type="button" disabled={saving} onClick={() => void handleSubmit()}>
            {saving ? 'Đang lưu…' : role ? 'Lưu metadata' : 'Tạo role'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export type { RoleEditorDialogProps };
