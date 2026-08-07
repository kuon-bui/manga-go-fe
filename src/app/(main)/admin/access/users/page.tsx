'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { AccessPagination } from '@/components/admin/access/access-pagination';
import { ACCESS_TAB_PERMISSIONS } from '@/components/admin/access/access-tabs';
import { UserAccessTable } from '@/components/admin/access/user-access-table';
import { UserRoleSheet } from '@/components/admin/access/user-role-sheet';
import { AuthorizationGate } from '@/components/auth/authorization-gate';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  useAuthorizationRoles,
  useAuthorizationForbiddenRecovery,
  useAuthorizationUsers,
  useReplaceUserRoles,
} from '@/hooks/use-admin-authorization';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { apiClient } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { AdminUserSummary } from '@/types/rbac';

const PAGE_LIMIT = 20;

export default function AdminAccessUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleId, setRoleId] = useState('');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<AdminUserSummary | null>(null);
  const debouncedSearch = useDebouncedValue(search, 300);
  const filters = { page, limit: PAGE_LIMIT, search: debouncedSearch, roleId };
  const usersQuery = useAuthorizationUsers(filters);
  const rolesQuery = useAuthorizationRoles();
  const replaceRoles = useReplaceUserRoles();
  const recoverForbidden = useAuthorizationForbiddenRecovery();

  function clearFilters(): void {
    setSearch('');
    setRoleId('');
    setPage(1);
  }

  return (
    <AuthorizationGate allOf={ACCESS_TAB_PERMISSIONS.users}>
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_240px]">
          <div className="space-y-1.5">
            <Label htmlFor="authorization-user-search">Tìm user</Label>
            <Input
              id="authorization-user-search"
              type="search"
              value={search}
              placeholder="Tên hoặc email"
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="authorization-role-filter">Lọc theo role</Label>
            <select
              id="authorization-role-filter"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={roleId}
              onChange={(event) => {
                setRoleId(event.target.value);
                setPage(1);
              }}
            >
              <option value="">Tất cả role</option>
              {(rolesQuery.data ?? []).map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <UserAccessTable
          users={usersQuery.data?.data ?? []}
          loading={usersQuery.isLoading}
          error={usersQuery.isError}
          hasFilters={Boolean(search || roleId)}
          onRetry={() => void usersQuery.refetch()}
          onClearFilters={clearFilters}
          onSelect={setSelectedUser}
        />

        <AccessPagination
          page={page}
          limit={PAGE_LIMIT}
          total={usersQuery.data?.total ?? 0}
          onPageChange={setPage}
        />

        <UserRoleSheet
          open={selectedUser !== null}
          onOpenChange={(open) => {
            if (!open) setSelectedUser(null);
          }}
          user={selectedUser}
          roles={rolesQuery.data ?? []}
          onRefreshState={async (userId) => {
            try {
              const [user, roles] = await Promise.all([
                queryClient.fetchQuery({
                  queryKey: queryKeys.authorization.user(userId),
                  queryFn: () => apiClient.getAuthorizationUser(userId),
                  staleTime: 0,
                }),
                queryClient.fetchQuery({
                  queryKey: queryKeys.authorization.roles(),
                  queryFn: () => apiClient.getAuthorizationRoles(),
                  staleTime: 0,
                }),
              ]);
              return { user, roles };
            } catch (error: unknown) {
              recoverForbidden(
                error,
                `authorization-user:${userId}:${selectedUser?.authorizationVersion ?? 'unknown'}`
              );
              throw error;
            }
          }}
          onSave={async (roleIds, expectedVersion) => {
            if (!selectedUser) return;
            await replaceRoles.mutateAsync({
              userId: selectedUser.id,
              roleIds,
              expectedVersion,
            });
          }}
        />
      </div>
    </AuthorizationGate>
  );
}
