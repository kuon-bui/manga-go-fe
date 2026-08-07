export interface PermissionDefinition {
  name: string;
  object: string;
  action: string;
  grants: string[];
  contexts: string[];
}

export interface Role {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface RoleAccessSummary {
  id: string;
  name: string;
  description: string | null;
  permissions: string[];
  assignedUserCount: number;
  authorizationVersion: string;
}

export interface AuthorizationProfile {
  userId: string;
  roles: Array<Pick<RoleAccessSummary, 'id' | 'name' | 'description'>>;
  permissions: string[];
  version: string;
}

export interface AdminUserSummary {
  id: string;
  name: string;
  email: string;
  roles: Array<Pick<RoleAccessSummary, 'id' | 'name' | 'description'>>;
  authorizationVersion: string;
}

export type AuthorizationAuditAction =
  | 'user.roles_replaced'
  | 'role.permissions_replaced'
  | 'role.created'
  | 'role.updated'
  | 'role.deleted';

export interface AuthorizationAuditLog {
  id: string;
  actorUserId: string | null;
  actorName: string;
  actorEmail: string;
  action: AuthorizationAuditAction | string;
  targetType: 'user' | 'role' | string;
  targetId: string;
  targetName: string;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  createdAt: string;
}

export interface PagedAdminResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface AuthorizationUserFilters {
  page?: number;
  limit?: number;
  search?: string;
  roleId?: string;
}

export interface AuthorizationAuditFilters {
  page?: number;
  limit?: number;
  actor?: string;
  action?: string;
  targetType?: string;
  targetId?: string;
  startAt?: string;
  endAt?: string;
}

export interface ReplaceRolePermissionsPayload {
  permissions: string[];
}

export interface ReplaceUserRolesPayload {
  role_ids: string[];
}

export interface CreateRolePayload {
  name: string;
  description?: string | null;
}

export interface UpdateRolePayload {
  name: string;
  description?: string | null;
}

// Temporary compatibility aliases for non-authorization screens that are
// migrated in the following feature checkpoints.
export interface PermissionEntity {
  id: string;
  name: string;
  description?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export type AssignRolePermissionsPayload = ReplaceRolePermissionsPayload;
export type AssignUserRolesPayload = ReplaceUserRolesPayload;

export interface UserRolesResponse {
  userId?: string;
  roles: Role[];
}

export interface RoleDetail extends Role {
  permissions: PermissionEntity[];
}
