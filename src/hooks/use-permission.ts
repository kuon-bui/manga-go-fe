'use client'

import { useAuthStore } from '@/stores/auth-store'
import { roleHasPermission, type Permission } from '@/lib/permissions'

/**
 * Returns true if the current user has the given permission.
 * Unauthenticated users are treated as 'guest'.
 */
export function usePermission(permission: Permission): boolean {
  const user = useAuthStore((s) => s.user)
  const role = user?.role ?? 'guest'
  return roleHasPermission(role, permission)
}
