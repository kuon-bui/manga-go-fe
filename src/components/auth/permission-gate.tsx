'use client'

import { usePermission } from '@/hooks/use-permission'
import type { Permission } from '@/lib/permissions'
import type { UserRole } from '@/types/auth'
import { useAuthStore } from '@/stores/auth-store'

interface PermissionGateProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  permission?: Permission
  allowedRoles?: UserRole[]
}

/**
 * Conditionally renders children if the current user has the given `permission`
 * OR if their role is in `allowedRoles`.
 */
export function PermissionGate({
  children,
  fallback = null,
  permission,
  allowedRoles,
}: PermissionGateProps) {
  const user = useAuthStore((s) => s.user)
  const hasPerm = usePermission(permission as Permission)

  let allowed = false

  if (permission && hasPerm) {
    allowed = true
  }

  if (allowedRoles && user && user.role) {
    if (allowedRoles.includes(user.role)) {
      allowed = true
    }
  }

  // Handle guest fallback if explicitly allowing 'guest' role
  if (allowedRoles?.includes('guest') && !user) {
    allowed = true
  }

  if (allowed) return <>{children}</>
  return <>{fallback}</>
}
