'use client'

import { useMemo } from 'react'
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import type {
  AssignRolePermissionsPayload,
  AssignUserRolesPayload,
  PermissionEntity,
  Role,
  RoleDetail,
} from '@/types'

export function useAllRoles() {
  return useQuery<Role[]>({
    queryKey: queryKeys.rbac.roles(),
    queryFn: () => apiClient.getAllRoles(),
  })
}

export function useRoleDetail(roleId: string) {
  return useQuery<RoleDetail>({
    queryKey: queryKeys.rbac.roleDetail(roleId),
    queryFn: () => apiClient.getRoleById(roleId),
    enabled: Boolean(roleId),
  })
}

export function useAllPermissions() {
  return useQuery<PermissionEntity[]>({
    queryKey: queryKeys.rbac.permissions(),
    queryFn: () => apiClient.getAllPermissions(),
  })
}

export function useAssignPermissionsToRole() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ roleId, payload }: { roleId: string; payload: AssignRolePermissionsPayload }) =>
      apiClient.assignPermissionsToRole(roleId, payload),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.rbac.roles() })
      qc.invalidateQueries({ queryKey: queryKeys.rbac.permissions() })
    },
  })
}

export function useAssignRolesToUser() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: AssignUserRolesPayload }) =>
      apiClient.assignRolesToUser(userId, payload),
    onSettled: (_data, _error, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.rbac.userRoles(vars.userId) })
    },
  })
}

export function useUserRoles(userId: string) {
  return useQuery<Role[]>({
    queryKey: queryKeys.rbac.userRoles(userId),
    queryFn: () => apiClient.getUserRoles(userId),
    enabled: Boolean(userId),
  })
}

export function useUserPermissions(userId: string) {
  const rolesQuery = useUserRoles(userId)
  const roleIds = rolesQuery.data?.map((role) => role.id).filter(Boolean) ?? []

  const roleDetailQueries = useQueries({
    queries: roleIds.map((roleId) => ({
      queryKey: queryKeys.rbac.roleDetail(roleId),
      queryFn: () => apiClient.getRoleById(roleId),
      enabled: Boolean(roleId),
    })),
  })

  const permissions = useMemo(() => {
    const map = new Map<string, PermissionEntity>()

    roleDetailQueries.forEach((query) => {
      query.data?.permissions?.forEach((permission) => {
        const key = permission.id || permission.name
        map.set(key, permission)
      })
    })

    return Array.from(map.values())
  }, [roleDetailQueries])

  const isLoading = rolesQuery.isLoading || roleDetailQueries.some((query) => query.isLoading)
  const isError = rolesQuery.isError || roleDetailQueries.some((query) => query.isError)

  return {
    roles: rolesQuery.data ?? [],
    permissions,
    isLoading,
    isError,
  }
}
