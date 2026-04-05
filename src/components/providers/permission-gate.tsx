'use client'

import { usePermission } from '@/hooks/use-permission'
import type { Permission } from '@/lib/permissions'

interface PermissionGateProps {
  permission: Permission
  children: React.ReactNode
  /** Rendered when user lacks permission. Defaults to null (hidden). */
  fallback?: React.ReactNode
}

/**
 * Renders children only if the current user has the required permission.
 * Per PRD: hide (not disable) features the role cannot access.
 */
export function PermissionGate({ permission, children, fallback = null }: PermissionGateProps) {
  const allowed = usePermission(permission)
  return allowed ? <>{children}</> : <>{fallback}</>
}
