'use client'

import { usePermission } from '@/hooks/use-permission'
import { normalizeRoleName } from '@/lib/permissions'
import type { Permission } from '@/lib/permissions'
import type { UserRole } from '@/types/auth'
import { useAuthStore } from '@/stores/auth-store'
import { Skeleton } from '@/components/ui/skeleton'

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
  let isLoadingRoles = false

  // Check by permission string
  if (permission && hasPerm) {
    allowed = true
  }

  // Check by role name
  if (allowedRoles && allowedRoles.length > 0) {
    if (roles.length > 0) {
      // Use dynamic backend roles (authoritative), with normalization
      const normalizedAllowed = allowedRoles.map((r) => normalizeRoleName(String(r)))
      if (roles.some((r) => normalizedAllowed.includes(normalizeRoleName(r)))) {
        allowed = true
      }
    } else if (user?.role) {
      // Fallback: static role field on user object
      if (allowedRoles.includes(user.role)) {
        allowed = true
      }
    } else if (user) {
      // User is logged in but roles empty and no static role — loading state
      isLoadingRoles = true
    }
  }

  // Allow guest explicitly
  if (allowedRoles?.includes('guest') && !user) {
    allowed = true
  }

  // Show loading skeleton while roles are being fetched
  if (isLoadingRoles) {
    return <Skeleton className="h-96 w-full" />
  }

  if (allowed) return <>{children}</>
  return <>{fallback}</>
}
