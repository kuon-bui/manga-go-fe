'use client';

import { Plus, Save, Settings2, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';

import { AccessState } from '@/components/admin/access/access-state';
import { PermissionMatrix } from '@/components/admin/access/permission-matrix';
import { RoleDeleteDialog } from '@/components/admin/access/role-delete-dialog';
import { RoleEditorDialog } from '@/components/admin/access/role-editor-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useAuthorizationRoles,
  useCreateAuthorizationRole,
  useDeleteAuthorizationRole,
  usePermissionCatalog,
  useReplaceRolePermissions,
  useUpdateAuthorizationRole,
} from '@/hooks/use-admin-authorization';
import { authorizationErrorMessage } from '@/lib/authorization-errors';
import { ApiClientError } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import type { CreateRolePayload, RoleAccessSummary } from '@/types/rbac';

export function RolePermissionWorkspace() {
  const rolesQuery = useAuthorizationRoles();
  const catalogQuery = usePermissionCatalog();
  const createRole = useCreateAuthorizationRole();
  const updateRole = useUpdateAuthorizationRole();
  const replacePermissions = useReplaceRolePermissions();
  const deleteRole = useDeleteAuthorizationRole();
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState('');
  const [draftDescription, setDraftDescription] = useState<string | null>(null);
  const [draftPermissions, setDraftPermissions] = useState<Set<string>>(new Set());
  const [editorOpen, setEditorOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [conflictRole, setConflictRole] = useState<RoleAccessSummary | null>(null);
  const [retryVersion, setRetryVersion] = useState<string | null>(null);
  const preserveDraft = useRef(false);

  const roles = useMemo(() => rolesQuery.data ?? [], [rolesQuery.data]);
  const selectedRole = roles.find((role) => role.id === selectedRoleId) ?? roles[0];
  const metadataDirty = Boolean(
    selectedRole &&
    (draftName !== selectedRole.name || draftDescription !== selectedRole.description)
  );
  const permissionDirty = useMemo(() => {
    if (!selectedRole) return false;
    const current = [...selectedRole.permissions].sort();
    const draft = [...draftPermissions].sort();
    return (
      current.length !== draft.length ||
      current.some((permission, index) => permission !== draft[index])
    );
  }, [draftPermissions, selectedRole]);
  const dirty = metadataDirty || permissionDirty;

  useEffect(() => {
    if (!selectedRoleId && roles[0]) setSelectedRoleId(roles[0].id);
  }, [roles, selectedRoleId]);

  useEffect(() => {
    if (!selectedRole || preserveDraft.current) return;
    setDraftName(selectedRole.name);
    setDraftDescription(selectedRole.description);
    setDraftPermissions(new Set(selectedRole.permissions));
    setSaveError(null);
    setConflictRole(null);
    setRetryVersion(null);
  }, [selectedRole]);

  function selectRole(roleId: string): void {
    if (roleId === selectedRole?.id) return;
    if (dirty && !window.confirm('Bỏ các thay đổi chưa lưu của role hiện tại?')) return;
    preserveDraft.current = false;
    setConflictRole(null);
    setRetryVersion(null);
    setSelectedRoleId(roleId);
  }

  function togglePermission(permission: string, checked: boolean): void {
    setDraftPermissions((current) => {
      const next = new Set(current);
      if (checked) next.add(permission);
      else next.delete(permission);
      return next;
    });
    setSaveError(null);
  }

  async function saveRole(): Promise<void> {
    if (!selectedRole || !dirty) return;
    preserveDraft.current = true;
    setSaveError(null);
    const permissionSnapshot = [...draftPermissions].sort();
    let version = retryVersion ?? selectedRole.authorizationVersion;
    try {
      if (metadataDirty) {
        const updated = await updateRole.mutateAsync({
          roleId: selectedRole.id,
          payload: { name: draftName.trim(), description: draftDescription },
          expectedVersion: version,
        });
        version = updated.authorizationVersion;
      }
      if (permissionDirty) {
        await replacePermissions.mutateAsync({
          roleId: selectedRole.id,
          permissions: permissionSnapshot,
          expectedVersion: version,
        });
      }
      preserveDraft.current = false;
      setConflictRole(null);
      setRetryVersion(null);
      await rolesQuery.refetch();
      toast.success('Đã lưu role và quyền');
    } catch (cause: unknown) {
      const message =
        cause instanceof ApiClientError
          ? authorizationErrorMessage(cause.code, cause.message)
          : 'Không thể lưu đầy đủ thay đổi. Draft quyền vẫn được giữ để bạn thử lại.';
      if (cause instanceof ApiClientError && cause.code === 'AUTHORIZATION_STATE_CHANGED') {
        try {
          const refreshed = await rolesQuery.refetch();
          const current = refreshed.data?.find((role) => role.id === selectedRole.id);
          if (!current) throw new Error('Role không còn tồn tại.');
          setConflictRole(current);
          setRetryVersion(current.authorizationVersion);
        } catch {
          setSaveError(`${message} Không thể tải trạng thái role mới nhất.`);
          return;
        }
      }
      setSaveError(message);
    }
  }

  async function submitEditor(payload: CreateRolePayload): Promise<void> {
    if (creating) {
      const created = await createRole.mutateAsync(payload);
      const refreshed = await rolesQuery.refetch();
      setSelectedRoleId(refreshed.data?.find((role) => role.id === created.id)?.id ?? created.id);
      setCreating(false);
      return;
    }
    if (!selectedRole) return;
    setDraftName(payload.name);
    setDraftDescription(payload.description ?? null);
  }

  async function confirmDelete(expectedVersion: string): Promise<void> {
    if (!selectedRole) return;
    await deleteRole.mutateAsync({ roleId: selectedRole.id, expectedVersion });
    preserveDraft.current = false;
    setSelectedRoleId(null);
    await rolesQuery.refetch();
  }

  if (rolesQuery.isLoading || catalogQuery.isLoading) {
    return <Skeleton className="h-[460px] w-full rounded-2xl" />;
  }
  if (rolesQuery.isError || catalogQuery.isError) {
    return (
      <AccessState
        title="Không thể tải role và permission catalog"
        message="Draft hiện tại sẽ không bị tự động gửi lại."
        retry={() => void Promise.all([rolesQuery.refetch(), catalogQuery.refetch()])}
      />
    );
  }
  if (!selectedRole) {
    return (
      <div className="flex min-h-80 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed p-6 text-center">
        <p className="font-semibold">Chưa có role nào</p>
        <p className="text-sm text-muted-foreground">
          Tạo role đầu tiên rồi chọn quyền từ catalog.
        </p>
        <Button
          type="button"
          onClick={() => {
            setCreating(true);
            setEditorOpen(true);
          }}
        >
          <Plus aria-hidden="true" /> Tạo role đầu tiên
        </Button>
        <RoleEditorDialog open={editorOpen} onOpenChange={setEditorOpen} onSubmit={submitEditor} />
      </div>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Role</h2>
          <Button
            type="button"
            size="icon"
            variant="outline"
            aria-label="Tạo role"
            onClick={() => {
              setCreating(true);
              setEditorOpen(true);
            }}
          >
            <Plus aria-hidden="true" />
          </Button>
        </div>
        <select
          className="h-10 w-full rounded-md border bg-background px-3 text-sm lg:hidden"
          aria-label="Chọn role"
          value={selectedRole.id}
          onChange={(event) => selectRole(event.target.value)}
        >
          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.name}
            </option>
          ))}
        </select>
        <div className="hidden space-y-1 lg:block">
          {roles.map((role) => (
            <button
              key={role.id}
              type="button"
              onClick={() => selectRole(role.id)}
              className={cn(
                'w-full rounded-xl px-3 py-2.5 text-left text-sm transition-colors',
                role.id === selectedRole.id ? 'bg-primary/15 text-primary' : 'hover:bg-secondary/60'
              )}
            >
              <span className="block font-semibold">{role.name}</span>
              <span className="text-xs text-muted-foreground">{role.permissions.length} quyền</span>
            </button>
          ))}
        </div>
      </aside>

      <section className="min-w-0 space-y-5">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-bold">{draftName}</h2>
              <Badge variant="secondary">{selectedRole.assignedUserCount} user</Badge>
              {dirty ? <Badge variant="outline">Chưa lưu</Badge> : null}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              {draftDescription || 'Không có mô tả'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCreating(false);
                setEditorOpen(true);
              }}
            >
              <Settings2 aria-hidden="true" /> Metadata
            </Button>
            <Button type="button" variant="destructive" onClick={() => setDeleteOpen(true)}>
              <Trash2 aria-hidden="true" /> Xóa role
            </Button>
            <Button
              type="button"
              disabled={!dirty || updateRole.isPending || replacePermissions.isPending}
              onClick={() => void saveRole()}
            >
              <Save aria-hidden="true" /> Lưu thay đổi
            </Button>
          </div>
        </header>

        {saveError ? (
          <div role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
            <p>{saveError}</p>
            {conflictRole ? (
              <div className="mt-3 grid gap-3 text-foreground sm:grid-cols-2">
                <RoleConflictSnapshot
                  title="Trạng thái role hiện tại"
                  name={conflictRole.name}
                  description={conflictRole.description}
                  permissions={conflictRole.permissions}
                />
                <RoleConflictSnapshot
                  title="Draft của bạn"
                  name={draftName}
                  description={draftDescription}
                  permissions={[...draftPermissions]}
                />
              </div>
            ) : null}
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={() => void saveRole()}
            >
              {conflictRole ? 'Xác nhận lại và thử lại' : 'Thử lại'}
            </Button>
          </div>
        ) : null}

        <PermissionMatrix
          catalog={catalogQuery.data ?? []}
          selected={draftPermissions}
          onChange={togglePermission}
        />
      </section>

      <RoleEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        role={creating ? undefined : selectedRole}
        onSubmit={submitEditor}
      />
      <RoleDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        role={selectedRole}
        onDelete={confirmDelete}
        onRefreshRole={async (roleId) => {
          const refreshed = await rolesQuery.refetch();
          const current = refreshed.data?.find((role) => role.id === roleId);
          if (!current) throw new Error('Không tìm thấy trạng thái role mới nhất.');
          return current;
        }}
      />
    </div>
  );
}

function RoleConflictSnapshot({
  title,
  name,
  description,
  permissions,
}: {
  title: string;
  name: string;
  description: string | null;
  permissions: string[];
}) {
  return (
    <section className="rounded-lg border bg-background/80 p-3">
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-1">{name}</p>
      <p className="text-xs text-muted-foreground">{description || 'Không có mô tả'}</p>
      <p className="mt-2 break-words text-xs">
        {permissions.length ? [...permissions].sort().join(', ') : 'Không có quyền'}
      </p>
    </section>
  );
}
