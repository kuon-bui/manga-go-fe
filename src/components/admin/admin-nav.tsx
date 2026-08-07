'use client';

import { FileText, KeyRound, Tags } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { label: 'Tổng quan', href: '/admin', icon: FileText, exact: true },
  { label: 'Phân quyền', href: '/admin/access', icon: KeyRound, exact: false },
  { label: 'Thể loại', href: '/admin/genres', icon: Tags, exact: false },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  const links = NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
    const active = exact ? pathname === href : pathname.startsWith(href);
    return (
      <Link
        key={href}
        href={href}
        aria-current={active ? 'page' : undefined}
        className={cn(
          'flex min-h-11 shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
          active
            ? 'bg-primary/15 text-primary'
            : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
        )}
      >
        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
        {label}
      </Link>
    );
  });

  return (
    <>
      <aside className="hidden w-52 shrink-0 md:block">
        <nav className="cute-card sticky top-24 flex flex-col gap-0.5 p-2">{links}</nav>
      </aside>
      <nav className="cute-card scrollbar-none flex gap-1 overflow-x-auto p-1.5 md:hidden">
        {links}
      </nav>
    </>
  );
}
