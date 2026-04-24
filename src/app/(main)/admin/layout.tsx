import { ReactNode } from 'react'
import Link from 'next/link'
import { ShieldAlert } from 'lucide-react'

import { PermissionGate } from '@/components/auth/permission-gate'
import { AdminNav }       from '@/components/admin/admin-nav'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <PermissionGate
      permission="admin_panel"
      allowedRoles={['admin', 'superadmin']}
      fallback={
        <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-16 text-center gap-4">
          <ShieldAlert className="h-16 w-16 text-destructive" />
          <h1 className="text-2xl font-bold">Truy cập bị từ chối</h1>
          <p className="text-muted-foreground max-w-sm text-sm">
            Bạn không có quyền truy cập vào khu vực quản trị.
          </p>
          <Link
            href="/"
            className="rounded-full bg-primary px-6 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
          >
            Quay về trang chủ
          </Link>
        </div>
      }
    >
      <div className="mx-auto max-w-7xl px-4 md:px-6 pt-2 pb-10 space-y-4 md:space-y-0">
        <div className="flex flex-col gap-4 md:flex-row md:gap-6 md:items-start">
          <AdminNav />
          <main className="min-w-0 flex-1">
            <div className="cute-card overflow-hidden min-h-[500px]">
              {children}
            </div>
          </main>
        </div>
      </div>
    </PermissionGate>
  )
}
