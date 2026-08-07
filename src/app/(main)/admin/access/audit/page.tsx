'use client';

import { useQueryClient } from '@tanstack/react-query';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo } from 'react';
import { toast } from 'sonner';

import { AccessPagination } from '@/components/admin/access/access-pagination';
import { ACCESS_TAB_PERMISSIONS } from '@/components/admin/access/access-tabs';
import { AuditLogFilters } from '@/components/admin/access/audit-log-filters';
import { AuditLogTable } from '@/components/admin/access/audit-log-table';
import { AuthorizationGate } from '@/components/auth/authorization-gate';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthorizationAuditLogs } from '@/hooks/use-admin-authorization';
import { recoverAuthorizationAfterForbidden } from '@/lib/authorization-access';
import { ApiClientError } from '@/lib/api-client';
import type { AuthorizationAuditFilters } from '@/types/rbac';

const PAGE_LIMIT = 20;

export default function AdminAccessAuditPage() {
  return (
    <AuthorizationGate allOf={ACCESS_TAB_PERMISSIONS.audit}>
      <Suspense fallback={<AuditPageSkeleton />}>
        <AuditPageContent />
      </Suspense>
    </AuthorizationGate>
  );
}

function AuditPageContent() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const serializedSearch = searchParams.toString();
  const filters = useMemo(() => auditFiltersFromSearchParams(searchParams), [searchParams]);
  const auditQuery = useAuthorizationAuditLogs(filters);

  useEffect(() => {
    if (!(auditQuery.error instanceof ApiClientError) || auditQuery.error.statusCode !== 403)
      return;

    void recoverAuthorizationAfterForbidden({
      attemptKey: `audit-logs:${serializedSearch}`,
      queryClient,
      currentPath: pathname,
      navigate: (path) => router.replace(path),
      notify: (message) => toast.warning(message),
    });
  }, [auditQuery.error, pathname, queryClient, router, serializedSearch]);

  function updateFilters(next: AuthorizationAuditFilters): void {
    const params = new URLSearchParams();
    setSearchParam(params, 'page', next.page);
    setSearchParam(params, 'actor', next.actor);
    setSearchParam(params, 'action', next.action);
    setSearchParam(params, 'target_type', next.targetType);
    setSearchParam(params, 'target_id', next.targetId);
    setSearchParam(params, 'start_at', next.startAt);
    setSearchParam(params, 'end_at', next.endAt);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  const filtered = Boolean(
    filters.actor ||
    filters.action ||
    filters.targetType ||
    filters.targetId ||
    filters.startAt ||
    filters.endAt
  );

  return (
    <div className="space-y-4">
      <AuditLogFilters filters={filters} onFiltersChange={updateFilters} />
      <AuditLogTable
        logs={auditQuery.data?.data ?? []}
        loading={auditQuery.isPending}
        error={auditQuery.isError}
        filtered={filtered}
        onRetry={() => void auditQuery.refetch()}
      />
      <AccessPagination
        page={filters.page ?? 1}
        limit={PAGE_LIMIT}
        total={auditQuery.data?.total ?? 0}
        onPageChange={(page) => updateFilters({ ...filters, page })}
      />
    </div>
  );
}

function auditFiltersFromSearchParams(searchParams: URLSearchParams): AuthorizationAuditFilters {
  return {
    page: positiveInteger(searchParams.get('page')),
    limit: PAGE_LIMIT,
    actor: optionalParam(searchParams.get('actor')),
    action: optionalParam(searchParams.get('action')),
    targetType: optionalParam(searchParams.get('target_type')),
    targetId: optionalParam(searchParams.get('target_id')),
    startAt: optionalParam(searchParams.get('start_at')),
    endAt: optionalParam(searchParams.get('end_at')),
  };
}

function positiveInteger(value: string | null): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

function optionalParam(value: string | null): string | undefined {
  return value?.trim() || undefined;
}

function setSearchParam(
  params: URLSearchParams,
  name: string,
  value: string | number | undefined
): void {
  if (value === undefined || value === '' || (name === 'page' && value === 1)) return;
  params.set(name, String(value));
}

function AuditPageSkeleton() {
  return (
    <div className="space-y-4" aria-label="Đang tải lịch sử phân quyền">
      <Skeleton className="h-40 w-full rounded-2xl" />
      <Skeleton className="h-72 w-full rounded-2xl" />
    </div>
  );
}
