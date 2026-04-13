'use client'

import { useEffect, useMemo } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { useUserRoles } from '@/hooks/use-rbac'
import type { UserRole } from '@/types/auth'

const ROLE_PRIORITY: UserRole[] = ['admin', 'group_admin', 'moderator', 'translator', 'member', 'guest']

function normalizeRoleName(roleName: string): UserRole | null {
  const value = roleName.trim().toLowerCase().replace(/[-\s]+/g, '_')

  if (
    value === 'guest' ||
    value === 'member' ||
    value === 'translator' ||
    value === 'group_admin' ||
    value === 'moderator' ||
    value === 'admin'
  ) {
    return value
  }

  return null
}

/**
 * Keeps local auth role in sync with backend user-role assignments.
 * This also guarantees FE calls GET /users/:id/roles after authentication.
 */
export function RbacProvider() {
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)

  const { data } = useUserRoles(user?.id ?? '')

  const resolvedRole = useMemo<UserRole | null>(() => {
    const normalized =
      data?.roles
        ?.map((item) => normalizeRoleName(item.name))
        .filter((role): role is UserRole => role !== null) ?? []

    if (normalized.length === 0) return null

    const sorted = [...normalized].sort(
      (a, b) => ROLE_PRIORITY.indexOf(a) - ROLE_PRIORITY.indexOf(b)
    )

    return sorted[0] ?? null
  }, [data?.roles])

  useEffect(() => {
    if (!user || !resolvedRole) return
    if (user.role === resolvedRole) return
    updateUser({ role: resolvedRole })
  }, [resolvedRole, updateUser, user])

  return null
}
