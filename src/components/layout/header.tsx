'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, BookOpen, LayoutDashboard, Upload, LogOut, User, ChevronDown, Shield, Sparkles } from 'lucide-react';
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
import { PermissionGate } from '@/components/auth/permission-gate';

const NAV_LINKS = [
  { href: '/browse',           label: 'Browse' },
  { href: '/browse?type=manga', label: 'Manga' },
  { href: '/browse?type=novel', label: 'Novel' },
  { href: '/library',          label: 'Library' },
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

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (
        (e.key === '/' || (e.ctrlKey && e.key === 'k')) &&
        document.activeElement?.tagName !== 'INPUT'
      ) {
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
        className="h-9 w-52 rounded-full border border-border bg-muted pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 lg:w-64"
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

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 rounded-full px-2 py-1 transition-colors hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/40">
          <Avatar className="h-7 w-7 ring-2 ring-primary/30">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
            <AvatarFallback className="text-xs bg-primary/15 text-primary">
              {user.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="hidden max-w-[100px] truncate text-sm font-medium text-foreground lg:block">
            {user.name}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 shadow-sakura">
        <DropdownMenuItem asChild className="rounded-xl">
          <Link href="/profile" className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" /> Profile
          </Link>
        </DropdownMenuItem>
        <PermissionGate permission="upload_chapter">
          <DropdownMenuItem asChild className="rounded-xl">
            <Link href="/dashboard" className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4 text-primary" /> Dashboard
            </Link>
          </DropdownMenuItem>
        </PermissionGate>
        <PermissionGate allowedRoles={['admin', 'superadmin']}>
          <DropdownMenuItem asChild className="rounded-xl">
            <Link href="/admin" className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" /> Admin Dashboard
            </Link>
          </DropdownMenuItem>
        </PermissionGate>
        <PermissionGate permission="create_title">
          <DropdownMenuItem asChild className="rounded-xl">
            <Link href="/dashboard/upload/title" className="flex items-center gap-2">
              <Upload className="h-4 w-4 text-primary" /> Upload Title
            </Link>
          </DropdownMenuItem>
        </PermissionGate>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={logout}
          className="flex items-center gap-2 text-destructive focus:text-destructive rounded-xl"
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
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollDir, setScrollDir] = useState<'up' | 'down'>('up');

  useEffect(() => {
    const threshold = 20;
    let lastScrollY = window.pageYOffset;
    let ticking = false;

    const updateScrollDir = () => {
      const scrollY = window.pageYOffset;
      if (Math.abs(scrollY - lastScrollY) < threshold) {
        ticking = false;
        return;
      }
      setScrollDir(scrollY > lastScrollY ? 'down' : 'up');
      setIsScrolled(scrollY > 50);
      lastScrollY = scrollY > 0 ? scrollY : 0;
      ticking = false;
    };

    const onScroll = () => {
      if (window.pageYOffset <= 50) {
        setIsScrolled(false);
        setScrollDir('up');
      }
      if (!ticking) {
        window.requestAnimationFrame(updateScrollDir);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [scrollDir]);

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 hidden md:block transition-all duration-300',
          isScrolled
            ? 'bg-background/90 backdrop-blur-xl border-b border-border shadow-sakura-sm'
            : 'bg-background/70 backdrop-blur-md border-b border-transparent',
          scrollDir === 'down' && isScrolled ? '-translate-y-full' : 'translate-y-0'
        )}
      >
        <div className="mx-auto w-full max-w-screen-2xl flex h-16 items-center gap-4 px-4 md:px-8">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-1.5 font-bold text-foreground">
            <div className="relative flex items-center">
              <BookOpen className="h-5 w-5 text-primary" aria-hidden />
              <Sparkles className="absolute -right-1.5 -top-1.5 h-3 w-3 text-primary/70" aria-hidden />
            </div>
            <span className="text-base font-extrabold tracking-tight">Manga Go</span>
          </Link>

          {/* Nav links */}
          <nav className="flex items-center gap-0.5" aria-label="Main navigation">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive =
                pathname === href ||
                (href !== '/browse' && pathname.startsWith(href.split('?')[0]));
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/15 text-primary'
                      : 'text-muted-foreground hover:bg-primary/10 hover:text-primary'
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
            <Button variant="ghost" size="icon" className="md:hidden" asChild aria-label="Search">
              <Link href="/search">
                <Search className="h-4 w-4" />
              </Link>
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
      {/* Spacer to push content below fixed header */}
      <div className="hidden md:block h-16" aria-hidden />
    </>
  );
}
