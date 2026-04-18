'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth-store'
import { apiClient } from '@/lib/api-client'

/**
 * Silently re-syncs backend roles into the auth store on app mount.
 * Handles the case where the user is already logged in (persisted store)
 * but roles haven't been fetched yet (e.g. after a page refresh).
 */
export function RolesSyncProvider() {
  const user = useAuthStore((s) => s.user)
  const roles = useAuthStore((s) => s.roles)
  const setRoles = useAuthStore((s) => s.setRoles)

  useEffect(() => {
    // Only sync if logged in but roles array is empty (e.g. after page refresh)
    if (!user?.id || roles.length > 0) return

    apiClient.getUserRoles(user.id)
      .then((userRoles) => {
        const roleNames = userRoles.map((r) => r.name)
        if (roleNames.length > 0) setRoles(roleNames)
      })
      .catch(() => {
        // Silently fail — the static user.role will be used as fallback
      })
  }, [user?.id, roles.length, setRoles])

  return null
}
