'use client'

import { useAuthStore } from '@/stores/auth-store'
import { normalizeRoleName, roleHasPermission, type Permission } from '@/lib/permissions'

/**
 * Returns true if the current user has the given permission.
 * Reads from the auth store (roles fetched at login time) — no extra API calls.
 * Unauthenticated users are treated as 'guest'.
 */
export function usePermission(permission: Permission): boolean {
  const user = useAuthStore((s) => s.user)
  const roles = useAuthStore((s) => s.roles)

  if (!user) return roleHasPermission('guest', permission)

  // Check against all backend roles stored at login time (with normalization)
  if (roles.length > 0) {
    return roles.some((roleName) => roleHasPermission(normalizeRoleName(roleName), permission))
  }

  // Fallback to the static role field on the user object
  return roleHasPermission(user.role ?? 'guest', permission)
}
