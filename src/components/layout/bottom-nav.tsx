'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Search, Library, User, Upload, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import { usePermission } from '@/hooks/use-permission';

export function BottomNav() {
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const canCreateTitle = usePermission('create_title');

  const items = [
    { href: '/',        label: 'Home',      icon: BookOpen },
    { href: '/search',  label: 'Search',    icon: Search },
    { href: '/library', label: 'Library',   icon: Library },
    ...(isAuthenticated
      ? [{ href: '/profile', label: 'Profile', icon: User }]
      : []),
    ...(isAuthenticated
      ? [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }]
      : []),
    ...(isAuthenticated && canCreateTitle
      ? [{ href: '/dashboard/upload/title', label: 'Upload', icon: Upload }]
      : []),
    ...(!isAuthenticated
      ? [{ href: '/login', label: 'Sign in', icon: User }]
      : []),
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-4 md:hidden">
      <div className="flex items-center gap-1 rounded-full border border-border bg-background/95 px-3 py-2 shadow-sakura backdrop-blur-xl">
        {items.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-full px-3 py-1.5 text-[10px] font-medium transition-all',
                isActive
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon
                className={cn('h-5 w-5', isActive && 'stroke-[2.5px]')}
                aria-hidden="true"
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
