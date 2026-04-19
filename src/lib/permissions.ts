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

export function normalizeRoleName(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, '_')
}

export function roleHasPermission(role: UserRole | string, permission: Permission): boolean {
  const normalized = normalizeRoleName(String(role))
  return ROLE_PERMISSIONS[normalized as UserRole]?.includes(permission) ?? false
}

const PERMISSION_ALIASES: Record<Permission, string[]> = {
  follow: ['follow', 'titles.follow', 'comics.follow'],
  rate: ['rate', 'rating.create', 'ratings.rate'],
  comment: ['comment', 'comment.create', 'comments.create'],
  upload_chapter: ['upload_chapter', 'chapter.upload', 'chapters.upload'],
  manage_group: ['manage_group', 'group.manage', 'groups.manage'],
  create_title: ['create_title', 'title.create', 'titles.create'],
  admin_panel: ['admin_panel', 'admin.access', 'admin'],
}

export function normalizePermissionName(value: string): string {
  return value.trim().toLowerCase().replace(/[\s-]+/g, '_')
}

export function permissionMatches(required: Permission, backendPermissionName: string): boolean {
  const normalized = normalizePermissionName(backendPermissionName)
  return PERMISSION_ALIASES[required].some((candidate) => normalizePermissionName(candidate) === normalized)
}
