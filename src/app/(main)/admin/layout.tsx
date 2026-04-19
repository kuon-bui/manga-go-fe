import { ReactNode } from 'react'
import Link from 'next/link'
import { ShieldAlert, Users, Tags, FileText, Settings, Shield } from 'lucide-react'

import { PermissionGate } from '@/components/auth/permission-gate'

const NAV_ITEMS = [
  { label: 'Tổng quan', href: '/admin', icon: <FileText className="h-4 w-4" /> },
  { label: 'Quản lý Role', href: '/admin/roles', icon: <Shield className="h-4 w-4" /> },
  { label: 'Quản lý Thể loại', href: '/admin/genres', icon: <Tags className="h-4 w-4" /> },
  { label: 'Quản lý User', href: '/admin/users', icon: <Users className="h-4 w-4" /> },
  { label: 'Cấu hình chung', href: '/admin/settings', icon: <Settings className="h-4 w-4" /> },
]

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <PermissionGate 
      permission="admin_panel"
      allowedRoles={['admin', 'superadmin']}
      fallback={
        <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center space-y-4">
          <ShieldAlert className="h-16 w-16 text-destructive" />
          <h1 className="text-2xl font-bold">Truy cập bị từ chối</h1>
          <p className="text-muted-foreground w-full max-w-sm">
            Bạn không có quyền truy cập vào khu vực Quản trị viên. Hãy quay lại trang chủ.
          </p>
          <Link href="/" className="bg-primary px-6 py-2 rounded-lg font-medium text-primary-foreground hover:bg-primary/90 mt-4">
            Quay về trang chủ
          </Link>
        </div>
      }
    >
      <div className="container mx-auto flex flex-col md:flex-row gap-6 px-4 py-8">
        
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-none sticky top-24">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent focus:bg-accent hover:text-foreground text-muted-foreground whitespace-nowrap"
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0">
          <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden min-h-[500px]">
            {children}
          </div>
        </main>
        
      </div>
    </PermissionGate>
  )
}
