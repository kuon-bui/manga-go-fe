'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { NotificationBell } from '@/components/layout/notification-bell';
import { useAuthStore } from '@/stores/auth-store';

const NAV_LINKS = [
  { href: '/browse', label: 'Browse' },
  { href: '/browse?type=manga', label: 'Manga' },
  { href: '/browse?type=novel', label: 'Novel' },
  { href: '/library', label: 'My Library' },
] as const;

export function Header() {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 hidden border-b border-border bg-background/80 backdrop-blur-sm md:block">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-foreground">
          <BookOpen className="h-5 w-5 text-primary-500" aria-hidden="true" />
          <span>Manga Go</span>
        </Link>

        {/* Desktop nav links */}
        <nav className="flex items-center gap-1" aria-label="Main navigation">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href || pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground',
                  isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right side: search + theme toggle + auth */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild aria-label="Search">
            <Link href="/search">
              <Search className="h-4 w-4" />
            </Link>
          </Button>
          {isAuthenticated && <NotificationBell />}
          <ThemeToggle />
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="text-sm font-medium text-foreground hover:text-muted-foreground transition-colors"
              >
                {user.name}
              </Link>
              <Button variant="ghost" size="sm" onClick={logout}>
                Sign out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
