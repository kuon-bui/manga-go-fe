'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { recoverAuthorizationAfterForbidden } from '@/lib/authorization-access';
import { ApiClientError, apiClient } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import { useAuthStore } from '@/stores/auth-store';
import type { AuthorizationUserFilters } from '@/types/rbac';

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

interface ReplaceUserRolesVariables {
  userId: string;
  roleIds: string[];
  expectedVersion: string;
}

export function useReplaceUserRoles() {
  const queryClient = useQueryClient();
  const currentUserId = useAuthStore((state) => state.user?.id);
  const router = useRouter();
  const pathname = usePathname();

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
      if (!(error instanceof ApiClientError) || error.statusCode !== 403) return;
      void recoverAuthorizationAfterForbidden({
        attemptKey: `replace-user-roles:${variables.userId}:${variables.expectedVersion}`,
        queryClient,
        currentPath: pathname,
        navigate: (path) => router.replace(path),
        notify: (message) => toast.warning(message),
      });
    },
  });
}

export type { ReplaceUserRolesVariables };
