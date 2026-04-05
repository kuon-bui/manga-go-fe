import type { UserRole } from '@/types/auth'

// ─── Permission constants ─────────────────────────────────────────────────────

export type Permission =
  | 'follow'
  | 'rate'
  | 'comment'
  | 'upload_chapter'
  | 'manage_group'
  | 'create_title'
  | 'admin_panel'

// ─── Role → permissions map ───────────────────────────────────────────────────

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  guest:       [],
  member:      ['follow', 'rate', 'comment'],
  translator:  ['follow', 'rate', 'comment', 'upload_chapter'],
  group_admin: ['follow', 'rate', 'comment', 'upload_chapter', 'manage_group', 'create_title'],
  moderator:   ['follow', 'rate', 'comment', 'upload_chapter', 'manage_group', 'create_title'],
  admin:       ['follow', 'rate', 'comment', 'upload_chapter', 'manage_group', 'create_title', 'admin_panel'],
}

export function roleHasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}
