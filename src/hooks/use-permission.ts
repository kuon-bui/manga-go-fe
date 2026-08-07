'use client';

import { useAuthorization } from '@/components/auth/authorization-provider';
import { roleHasPermission, type Permission } from '@/lib/permissions';
import { useAuthStore } from '@/stores/auth-store';

/** Resolves semantic product permissions from current backend role names. */
export function usePermission(permission: Permission): boolean {
  const user = useAuthStore((state) => state.user);
  const { profile } = useAuthorization();

  if (!user) return roleHasPermission('guest', permission);
  if (profile?.roles.length) {
    return profile.roles.some((role) => roleHasPermission(role.name, permission));
  }
  return roleHasPermission(user.role ?? 'guest', permission);
}
