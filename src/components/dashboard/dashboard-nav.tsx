'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, Upload, Plus } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuthStore } from '@/stores/auth-store'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/dashboard',             label: 'Tổng quan',  icon: LayoutDashboard, exact: true },
  { href: '/dashboard/groups',      label: 'Nhóm dịch',  icon: Users,            exact: false },
  { href: '/dashboard/upload/title',label: 'Đăng truyện',icon: Upload,           exact: false },
  { href: '/dashboard/groups/new',  label: 'Tạo nhóm',   icon: Plus,             exact: false },
]

export function DashboardNav() {
  const pathname = usePathname()
  const user = useAuthStore((s) => s.user)
  const initials = (user?.name ?? 'AN').slice(0, 2).toUpperCase()

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  return (
    <>
      {/* ── Desktop sidebar ─────────────────────────────────────── */}
      <aside className="hidden md:flex md:w-52 shrink-0 flex-col gap-3">
        {/* Profile card */}
        <div className="cute-card p-4 flex flex-col items-center text-center gap-2">
          <Avatar className="h-14 w-14 ring-2 ring-primary/30">
            {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
            <AvatarFallback className="text-lg font-bold bg-primary/15 text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-display font-bold text-sm leading-tight">{user?.name ?? 'Người dùng'}</p>
            <p className="text-[11px] text-muted-foreground capitalize mt-0.5">{user?.role ?? 'member'}</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="cute-card p-2 flex flex-col gap-0.5">
          {NAV.map(({ href, label, icon: Icon, exact }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors',
                isActive(href, exact)
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* ── Mobile top tab strip ────────────────────────────────── */}
      <nav className="md:hidden cute-card p-1.5 flex gap-1 overflow-x-auto scrollbar-none">
        {NAV.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-colors whitespace-nowrap',
              isActive(href, exact)
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground hover:bg-secondary/60'
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>
    </>
  )
}
