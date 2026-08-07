'use client';

import type { ReactNode } from 'react';

import { usePermission } from '@/hooks/use-permission';
import type { Permission } from '@/lib/permissions';

interface PermissionGateProps {
  children: ReactNode;
  fallback?: ReactNode;
  permission: Permission;
}

/** Keeps legacy product semantics while using current profile role names. */
export function PermissionGate({ children, fallback = null, permission }: PermissionGateProps) {
  return usePermission(permission) ? <>{children}</> : <>{fallback}</>;
}

export type { PermissionGateProps };
