'use client'

import { usePermission } from '@/hooks/use-permission'
import type { Permission } from '@/lib/permissions'
import type { UserRole } from '@/types/auth'
import { useAuthStore } from '@/stores/auth-store'

interface PermissionGateProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  permission?: Permission
  allowedRoles?: (UserRole | string)[]
}

/**
 * Conditionally renders children if the current user has the given `permission`
 * OR if any of their backend roles is in `allowedRoles`.
 * Reads from the auth store — no extra API calls on render.
 */
export function PermissionGate({
  children,
  fallback = null,
  permission,
  allowedRoles,
}: PermissionGateProps) {
  const user = useAuthStore((s) => s.user)
  const roles = useAuthStore((s) => s.roles) // backend role names, e.g. ['admin']
  const hasPerm = usePermission(permission as Permission)

  let allowed = false

  // Check by permission string
  if (permission && hasPerm) {
    allowed = true
  }

  // Check by role name
  if (allowedRoles && allowedRoles.length > 0) {
    if (roles.length > 0) {
      // Use dynamic backend roles (authoritative)
      if (roles.some((r) => allowedRoles.includes(r))) {
        allowed = true
      }
    } else if (user?.role) {
      // Fallback: static role field on user object
      if (allowedRoles.includes(user.role)) {
        allowed = true
      }
    }
  }

  // Allow guest explicitly
  if (allowedRoles?.includes('guest') && !user) {
    allowed = true
  }

  if (allowed) return <>{children}</>
  return <>{fallback}</>
}
