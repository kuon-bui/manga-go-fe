'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FileText, Shield, Tags, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Tổng quan',       href: '/admin',         icon: FileText, exact: true  },
  { label: 'Quản lý Role',    href: '/admin/roles',   icon: Shield,   exact: false },
  { label: 'Thể loại',        href: '/admin/genres',  icon: Tags,     exact: false },
  { label: 'Người dùng',      href: '/admin/users',   icon: Users,    exact: false },
]

export function AdminNav() {
  const pathname = usePathname()

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-52 shrink-0">
        <nav className="cute-card p-2 flex flex-col gap-0.5 sticky top-24">
          {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => (
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

      {/* Mobile tab strip */}
      <nav className="md:hidden cute-card p-1.5 flex gap-1 overflow-x-auto scrollbar-none">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold whitespace-nowrap transition-colors',
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
