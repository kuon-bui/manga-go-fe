export interface Role {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface PermissionEntity {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface AssignRolePermissionsPayload {
  // Backend expects camelCase key: permissionIds
  permissionIds: string[];
}

export interface AssignUserRolesPayload {
  // Backend expects snake_case key: role_ids
  role_ids: string[];
}

export interface UserRolesResponse {
  userId?: string;
  roles: Role[];
}

export interface RoleDetail extends Role {
  permissions: PermissionEntity[];
}