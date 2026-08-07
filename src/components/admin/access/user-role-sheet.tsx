'use client';

import { useEffect, useMemo, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { authorizationErrorMessage } from '@/lib/authorization-errors';
import { ApiClientError } from '@/lib/api-client';
import { diffPermissions, unionPermissions } from '@/lib/authorization';
import type { AdminUserSummary, RoleAccessSummary } from '@/types/rbac';

interface UserRoleSheetProps {
  open: boolean;
  onOpenChange: (_open: boolean) => void;
  user: AdminUserSummary | null;
  roles: RoleAccessSummary[];
  onSave: (_roleIds: string[], _expectedVersion: string) => Promise<unknown>;
  onRefreshUser?: (_userId: string) => Promise<AdminUserSummary>;
}

interface UserRoleConflict {
  beforeRoleNames: string[];
  currentRoleNames: string[];
}

export function UserRoleSheet({
  open,
  onOpenChange,
  user,
  roles,
  onSave,
  onRefreshUser,
}: UserRoleSheetProps) {
  const [draftRoleIds, setDraftRoleIds] = useState<Set<string>>(new Set());
  const [expectedVersion, setExpectedVersion] = useState('');
  const [conflict, setConflict] = useState<UserRoleConflict | null>(null);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraftRoleIds(new Set(user?.roles.map((role) => role.id) ?? []));
    setExpectedVersion(user?.authorizationVersion ?? '');
    setConflict(null);
    setError(null);
    setConflict(null);
    setConfirmationOpen(false);
  }, [user]);

  const originalRoleIds = useMemo(() => new Set(user?.roles.map((role) => role.id) ?? []), [user]);
  const selectedRoles = roles.filter((role) => draftRoleIds.has(role.id));
  const originalRoles = roles.filter((role) => originalRoleIds.has(role.id));
  const draftPermissions = unionPermissions(selectedRoles);
  const originalPermissions = unionPermissions(originalRoles);
  const permissionDiff = diffPermissions(originalPermissions, draftPermissions);
  const addedRoles = selectedRoles
    .filter((role) => !originalRoleIds.has(role.id))
    .map((role) => role.name)
    .sort();
  const removedRoles = originalRoles
    .filter((role) => !draftRoleIds.has(role.id))
    .map((role) => role.name)
    .sort();
  const dirty = addedRoles.length > 0 || removedRoles.length > 0;
  const changesManagement = [...permissionDiff.added, ...permissionDiff.removed].includes(
    'role:manage'
  );

  function toggleRole(roleId: string, checked: boolean): void {
    setDraftRoleIds((current) => {
      const next = new Set(current);
      if (checked) next.add(roleId);
      else next.delete(roleId);
      return next;
    });
    setError(null);
  }

  async function confirmSave(): Promise<void> {
    if (!user) return;
    setSaving(true);
    setError(null);
    try {
      await onSave([...draftRoleIds].sort(), expectedVersion);
      setConfirmationOpen(false);
      setConflict(null);
      onOpenChange(false);
    } catch (cause: unknown) {
      const message =
        cause instanceof ApiClientError
          ? authorizationErrorMessage(cause.code, cause.message)
          : 'Không thể lưu role. Kiểm tra kết nối rồi thử lại.';
      if (
        cause instanceof ApiClientError &&
        cause.code === 'AUTHORIZATION_STATE_CHANGED' &&
        onRefreshUser
      ) {
        try {
          const current = await onRefreshUser(user.id);
          setExpectedVersion(current.authorizationVersion);
          setConflict({
            beforeRoleNames: user.roles.map((role) => role.name).sort(),
            currentRoleNames: current.roles.map((role) => role.name).sort(),
          });
        } catch {
          setError(`${message} Không thể tải trạng thái mới nhất.`);
          setConfirmationOpen(false);
          return;
        }
      }
      setError(message);
      setConfirmationOpen(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Role của {user?.name ?? 'user'}</SheetTitle>
            <SheetDescription>{user?.email}</SheetDescription>
          </SheetHeader>

          <div className="my-6 space-y-6">
            <fieldset className="space-y-3">
              <legend className="mb-2 text-sm font-semibold">Role được gán</legend>
              {roles.map((role) => {
                const id = `user-role-${role.id}`;
                return (
                  <div key={role.id} className="flex items-start gap-3 rounded-xl border p-3">
                    <Checkbox
                      id={id}
                      aria-label={role.name}
                      checked={draftRoleIds.has(role.id)}
                      onCheckedChange={(checked) => toggleRole(role.id, checked === true)}
                    />
                    <Label htmlFor={id} className="min-w-0 flex-1 cursor-pointer space-y-1">
                      <span className="block font-semibold">{role.name}</span>
                      <span className="block text-xs font-normal text-muted-foreground">
                        {role.description || `${role.permissions.length} quyền`}
                      </span>
                    </Label>
                  </div>
                );
              })}
            </fieldset>

            <section className="space-y-3" aria-live="polite">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Quyền hiệu lực dự kiến</h3>
                <Badge variant={dirty ? 'outline' : 'secondary'}>
                  {dirty ? 'Chưa lưu' : 'Đã lưu'}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {draftPermissions.length ? (
                  draftPermissions.map((permission) => (
                    <Badge key={permission} variant="secondary">
                      {permission}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">Không có quyền từ role</span>
                )}
              </div>
              {permissionDiff.added.length > 0 ? (
                <PermissionDiff title="Quyền được thêm" values={permissionDiff.added} />
              ) : null}
              {permissionDiff.removed.length > 0 ? (
                <PermissionDiff title="Quyền bị gỡ" values={permissionDiff.removed} destructive />
              ) : null}
            </section>

            {error ? (
              <div
                role="alert"
                className="space-y-2 rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
              >
                <p>{error}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setConfirmationOpen(true)}
                >
                  Thử lại
                </Button>
              </div>
            ) : null}

            {conflict ? (
              <div className="space-y-2 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm">
                <p className="font-semibold">So sánh sau xung đột</p>
                <ConflictRoles title="Role trước lần lưu" values={conflict.beforeRoleNames} />
                <ConflictRoles
                  title="Role hiện tại trên hệ thống"
                  values={conflict.currentRoleNames}
                />
                <ConflictRoles
                  title="Draft của bạn"
                  values={selectedRoles.map((role) => role.name).sort()}
                />
              </div>
            ) : null}
          </div>

          <SheetFooter>
            <Button
              type="button"
              disabled={!dirty || saving}
              onClick={() => setConfirmationOpen(true)}
            >
              Lưu role
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Dialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {changesManagement ? 'Xác nhận thay đổi quyền quản trị' : 'Xác nhận thay đổi role'}
            </DialogTitle>
            <DialogDescription>
              {changesManagement
                ? 'Thay đổi này thêm hoặc gỡ quyền role:manage. Hãy kiểm tra kỹ để tránh mất quyền quản trị.'
                : 'Kiểm tra phần role và quyền thay đổi trước khi lưu.'}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-72 space-y-3 overflow-y-auto text-sm">
            <ChangeList title="Role thêm" values={addedRoles} />
            <ChangeList title="Role gỡ" values={removedRoles} />
            <ChangeList title="Quyền thêm" values={permissionDiff.added} />
            <ChangeList title="Quyền gỡ" values={permissionDiff.removed} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setConfirmationOpen(false)}>
              Hủy
            </Button>
            <Button type="button" disabled={saving} onClick={() => void confirmSave()}>
              {saving ? 'Đang lưu…' : 'Xác nhận lưu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function PermissionDiff({
  title,
  values,
  destructive = false,
}: {
  title: string;
  values: string[];
  destructive?: boolean;
}) {
  return (
    <div className={destructive ? 'text-destructive' : 'text-emerald-700 dark:text-emerald-400'}>
      <p className="text-xs font-semibold">{title}</p>
      <p className="text-xs">{values.join(', ')}</p>
    </div>
  );
}

function ChangeList({ title, values }: { title: string; values: string[] }) {
  return (
    <div>
      <p className="font-semibold">{title}</p>
      <p className="text-muted-foreground">{values.length ? values.join(', ') : 'Không có'}</p>
    </div>
  );
}

function ConflictRoles({ title, values }: { title: string; values: string[] }) {
  return (
    <div>
      <p className="font-medium">{title}</p>
      <p className="text-muted-foreground">{values.length ? values.join(', ') : 'Không có role'}</p>
    </div>
  );
}

export type { UserRoleSheetProps };
