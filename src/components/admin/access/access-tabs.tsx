'use client';

import { History, ShieldCheck, Users } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useAuthorization } from '@/components/auth/authorization-provider';
import { cn } from '@/lib/utils';
import type { AuthorizationProfile } from '@/types/rbac';

export const ACCESS_TAB_PERMISSIONS = {
  users: ['user:read', 'role:manage'],
  roles: ['role:manage', 'permission:read'],
  audit: ['audit_log:read'],
} as const;

export const ADMIN_ENTRY_PERMISSIONS = [
  'user:read',
  'role:manage',
  'permission:read',
  'audit_log:read',
  'genre:write',
  'genre:delete',
] as const;

const ACCESS_TABS = [
  {
    key: 'users',
    href: '/admin/access/users',
    label: 'Người dùng',
    icon: Users,
    permissions: ACCESS_TAB_PERMISSIONS.users,
  },
  {
    key: 'roles',
    href: '/admin/access/roles',
    label: 'Role & quyền',
    icon: ShieldCheck,
    permissions: ACCESS_TAB_PERMISSIONS.roles,
  },
  {
    key: 'audit',
    href: '/admin/access/audit',
    label: 'Lịch sử',
    icon: History,
    permissions: ACCESS_TAB_PERMISSIONS.audit,
  },
] as const;

export function AccessTabs() {
  const pathname = usePathname();
  const { isAllowed } = useAuthorization();
  const visibleTabs = ACCESS_TABS.filter((tab) => isAllowed({ allOf: tab.permissions }));

  return (
    <nav aria-label="Quản lý phân quyền" className="flex gap-1 overflow-x-auto border-b px-3 pt-3">
      {visibleTabs.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex min-h-11 shrink-0 items-center gap-2 rounded-t-xl px-3 text-sm font-semibold transition-colors',
              active
                ? 'border-b-2 border-primary bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function firstAllowedAccessPath(profile: AuthorizationProfile | undefined): string | null {
  if (!profile) return null;
  const permissions = new Set(profile.permissions);
  return (
    ACCESS_TABS.find((tab) => tab.permissions.every((permission) => permissions.has(permission)))
      ?.href ?? null
  );
}
