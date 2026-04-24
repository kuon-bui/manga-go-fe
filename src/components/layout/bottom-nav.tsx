'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Search, Library, User, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';

export function BottomNav() {
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const items = [
    { href: '/',        label: 'Home',      icon: BookOpen },
    { href: '/search',  label: 'Search',    icon: Search },
    { href: '/library', label: 'Library',   icon: Library },
    ...(isAuthenticated
      ? [{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }]
      : []),
    { href: isAuthenticated ? '/profile' : '/login', label: isAuthenticated ? 'Profile' : 'Đăng nhập', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-4 md:hidden">
      <div className="cute-card flex items-center gap-1 px-3 py-2">
        {items.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-full px-3 py-1.5 text-[10px] font-semibold transition-all',
                isActive
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
              )}
            >
              <Icon className={cn('h-5 w-5', isActive && 'stroke-[2.5px]')} aria-hidden />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
