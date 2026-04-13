'use client'

import { useAuthStore } from '@/stores/auth-store'
import { roleHasPermission, type Permission } from '@/lib/permissions'

/**
 * Returns true if the current user has the given permission.
 * Uses the user.role from the auth store — no additional API calls.
 * Unauthenticated users are treated as 'guest'.
 */
export function usePermission(permission: Permission): boolean {
  const user = useAuthStore((s) => s.user)
  if (!user) return roleHasPermission('guest', permission)
  return roleHasPermission(user.role ?? 'guest', permission)
}
