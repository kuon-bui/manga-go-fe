import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { AdminNav } from '@/components/admin/admin-nav';
import { ADMIN_ENTRY_PERMISSIONS } from '@/components/admin/access/access-tabs';
import { AuthorizationGate } from '@/components/auth/authorization-gate';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthorizationGate
      anyOf={ADMIN_ENTRY_PERMISSIONS}
      fallback={
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 py-16 text-center">
          <ShieldAlert className="h-16 w-16 text-destructive" aria-hidden="true" />
          <h1 className="text-2xl font-bold">Truy cập bị từ chối</h1>
          <p className="max-w-sm text-sm text-muted-foreground">
            Bạn không có quyền truy cập khu vực quản trị.
          </p>
          <Link
            href="/"
            className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Quay về trang chủ
          </Link>
        </div>
      }
    >
      <div className="mx-auto max-w-7xl space-y-4 px-4 pb-10 pt-2 md:space-y-0 md:px-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
          <AdminNav />
          <main className="min-w-0 flex-1">
            <div className="cute-card min-h-[500px] overflow-hidden">{children}</div>
          </main>
        </div>
      </div>
    </AuthorizationGate>
  );
}
