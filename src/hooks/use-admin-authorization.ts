'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { recoverAuthorizationAfterForbidden } from '@/lib/authorization-access';
import { ApiClientError, apiClient } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import { useAuthStore } from '@/stores/auth-store';
import type { AuthorizationUserFilters, CreateRolePayload, UpdateRolePayload } from '@/types/rbac';
import type { AuthorizationAuditFilters } from '@/types/rbac';

export function useAuthorizationAuditLogs(filters: AuthorizationAuditFilters) {
  return useQuery({
    queryKey: queryKeys.authorization.audit({ ...filters }),
    queryFn: () => apiClient.getAuthorizationAuditLogs(filters),
    placeholderData: (previous) => previous,
  });
}

export function useAuthorizationUsers(filters: AuthorizationUserFilters) {
  return useQuery({
    queryKey: queryKeys.authorization.users({ ...filters }),
    queryFn: () => apiClient.getAuthorizationUsers(filters),
    placeholderData: (previous) => previous,
  });
}

export function useAuthorizationRoles() {
  return useQuery({
    queryKey: queryKeys.authorization.roles(),
    queryFn: () => apiClient.getAuthorizationRoles(),
    staleTime: 30_000,
  });
}

export function usePermissionCatalog() {
  return useQuery({
    queryKey: queryKeys.authorization.catalog(),
    queryFn: () => apiClient.getAllPermissions(),
    staleTime: 5 * 60_000,
  });
}

interface ReplaceUserRolesVariables {
  userId: string;
  roleIds: string[];
  expectedVersion: string;
}

export function useReplaceUserRoles() {
  const queryClient = useQueryClient();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const recoverForbidden = useForbiddenRecovery();

  return useMutation({
    mutationFn: ({ userId, roleIds, expectedVersion }: ReplaceUserRolesVariables) =>
      apiClient.replaceUserRoles(userId, { role_ids: roleIds }, expectedVersion),
    onSuccess: async (_result, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['authorization', 'users'] }),
        queryClient.invalidateQueries({ queryKey: queryKeys.authorization.user(variables.userId) }),
        variables.userId === currentUserId
          ? queryClient.invalidateQueries({ queryKey: queryKeys.authorization.me() })
          : Promise.resolve(),
      ]);
    },
    onError: (error, variables) => {
      recoverForbidden(
        error,
        `replace-user-roles:${variables.userId}:${variables.expectedVersion}`
      );
    },
  });
}

interface ReplaceRolePermissionsVariables {
  roleId: string;
  permissions: string[];
  expectedVersion: string;
}

export function useReplaceRolePermissions() {
  const queryClient = useQueryClient();
  const recoverForbidden = useForbiddenRecovery();

  return useMutation({
    mutationFn: ({ roleId, permissions, expectedVersion }: ReplaceRolePermissionsVariables) =>
      apiClient.replaceRolePermissions(roleId, { permissions }, expectedVersion),
    onSuccess: async (_result, variables) => {
      await invalidateRoleQueries(queryClient, variables.roleId);
    },
    onError: (error, variables) => {
      recoverForbidden(
        error,
        `replace-role-permissions:${variables.roleId}:${variables.expectedVersion}`
      );
    },
  });
}

export function useCreateAuthorizationRole() {
  const queryClient = useQueryClient();
  const recoverForbidden = useForbiddenRecovery();

  return useMutation({
    mutationFn: (payload: CreateRolePayload) => apiClient.createRole(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.authorization.roles() });
    },
    onError: (error, variables) => {
      recoverForbidden(error, `create-role:${variables.name}`);
    },
  });
}

interface UpdateRoleVariables {
  roleId: string;
  payload: UpdateRolePayload;
  expectedVersion: string;
}

export function useUpdateAuthorizationRole() {
  const queryClient = useQueryClient();
  const recoverForbidden = useForbiddenRecovery();

  return useMutation({
    mutationFn: ({ roleId, payload, expectedVersion }: UpdateRoleVariables) =>
      apiClient.updateRole(roleId, payload, expectedVersion),
    onSuccess: async (_result, variables) => {
      await invalidateRoleQueries(queryClient, variables.roleId);
    },
    onError: (error, variables) => {
      recoverForbidden(error, `update-role:${variables.roleId}:${variables.expectedVersion}`);
    },
  });
}

interface DeleteRoleVariables {
  roleId: string;
  expectedVersion: string;
}

export function useDeleteAuthorizationRole() {
  const queryClient = useQueryClient();
  const recoverForbidden = useForbiddenRecovery();

  return useMutation({
    mutationFn: ({ roleId, expectedVersion }: DeleteRoleVariables) =>
      apiClient.deleteRole(roleId, expectedVersion),
    onSuccess: async (_result, variables) => {
      await invalidateRoleQueries(queryClient, variables.roleId);
    },
    onError: (error, variables) => {
      recoverForbidden(error, `delete-role:${variables.roleId}:${variables.expectedVersion}`);
    },
  });
}

function useForbiddenRecovery(): (_error: unknown, _attemptKey: string) => void {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  return (error, attemptKey) => {
    if (!(error instanceof ApiClientError) || error.statusCode !== 403) return;
    void recoverAuthorizationAfterForbidden({
      attemptKey,
      queryClient,
      currentPath: pathname,
      navigate: (path) => router.replace(path),
      notify: (message) => toast.warning(message),
    });
  };
}

async function invalidateRoleQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  roleId: string
): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.authorization.roles() }),
    queryClient.invalidateQueries({ queryKey: queryKeys.authorization.role(roleId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.authorization.me() }),
  ]);
}

export type {
  DeleteRoleVariables,
  ReplaceRolePermissionsVariables,
  ReplaceUserRolesVariables,
  UpdateRoleVariables,
};
