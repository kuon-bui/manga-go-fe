'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, BookOpen, LayoutDashboard, Upload, LogOut, User, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { NotificationBell } from '@/components/layout/notification-bell';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuthStore } from '@/stores/auth-store';
import { usePermission } from '@/hooks/use-permission';

const NAV_LINKS = [
  { href: '/browse',          label: 'Browse' },
  { href: '/browse?type=manga', label: 'Manga' },
  { href: '/browse?type=novel', label: 'Novel' },
  { href: '/library',         label: 'Library' },
] as const;

// ─── Inline search bar ────────────────────────────────────────────────────────

function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    setQuery('');
  }

  // Keyboard shortcut: / or Ctrl+K focuses the bar
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.key === '/' || (e.ctrlKey && e.key === 'k')) && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <form onSubmit={handleSubmit} className="relative hidden md:block">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search titles…"
        className="h-8 w-52 rounded-full border border-border bg-secondary pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 lg:w-64"
        aria-label="Search"
      />
      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-border bg-background px-1 py-0.5 text-[10px] text-muted-foreground hidden lg:block">
        /
      </span>
    </form>
  );
}

// ─── User menu ────────────────────────────────────────────────────────────────

function UserMenu() {
  const { user, logout } = useAuthStore();
  const canCreateTitle = usePermission('create_title');

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 rounded-full p-0.5 transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary/40">
          <Avatar className="h-7 w-7">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
            <AvatarFallback className="text-xs">{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="hidden max-w-[100px] truncate text-sm font-medium text-foreground lg:block">
            {user.name}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center gap-2">
            <User className="h-4 w-4" /> Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Link>
        </DropdownMenuItem>
        {canCreateTitle && (
          <DropdownMenuItem asChild>
            <Link href="/dashboard/upload/title" className="flex items-center gap-2">
              <Upload className="h-4 w-4" /> Upload Title
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={logout}
          className="flex items-center gap-2 text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

export function Header() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 hidden border-b border-border bg-background/95 backdrop-blur-sm md:block">
      <div className="container mx-auto flex h-14 items-center gap-4 px-4">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2 font-bold text-foreground">
          <BookOpen className="h-5 w-5 text-primary" aria-hidden />
          <span className="text-base">Manga Go</span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-0.5" aria-label="Main navigation">
          {NAV_LINKS.map(({ href, label }) => {
            const isActive = pathname === href || (href !== '/browse' && pathname.startsWith(href.split('?')[0]));
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search */}
        <SearchBar />

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Mobile search */}
          <Button variant="ghost" size="icon" className="md:hidden" asChild aria-label="Search">
            <Link href="/search"><Search className="h-4 w-4" /></Link>
          </Button>

          {isAuthenticated && <NotificationBell />}
          <ThemeToggle />

          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <div className="flex items-center gap-1.5">
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
