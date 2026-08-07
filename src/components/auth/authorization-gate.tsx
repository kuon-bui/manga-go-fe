'use client';

import type { ReactNode } from 'react';

import { AccessState } from '@/components/admin/access/access-state';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthorization } from '@/components/auth/authorization-provider';

interface AuthorizationGateProps {
  children: ReactNode;
  allOf?: readonly string[];
  anyOf?: readonly string[];
  loading?: ReactNode;
  fallback?: ReactNode;
}

export function AuthorizationGate({
  children,
  allOf,
  anyOf,
  loading = <Skeleton className="h-48 w-full rounded-2xl" />,
  fallback = null,
}: AuthorizationGateProps) {
  const authorization = useAuthorization();

  if (authorization.isLoading) return <>{loading}</>;
  if (authorization.isError) {
    return (
      <AccessState
        title="Không thể tải quyền truy cập"
        message="Kết nối đến máy chủ phân quyền gặp sự cố."
        retry={() => void authorization.refetch()}
      />
    );
  }
  if (!authorization.isAllowed({ allOf, anyOf })) return <>{fallback}</>;
  return <>{children}</>;
}

export type { AuthorizationGateProps };
