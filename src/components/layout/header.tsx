'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, ChevronDown, LayoutDashboard, Upload, LogOut, User, Shield } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

import { cn } from '@/lib/utils';
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
  { href: '/',          label: 'Home' },
  { href: '/browse',    label: 'Browse' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/library',   label: 'Library' },
  { href: '/settings',  label: 'Settings' },
] as const;

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
    <form onSubmit={handleSubmit} className="hidden sm:flex items-center gap-2 bg-input/60 rounded-full px-3 py-1.5 w-52">
      <Search className="h-4 w-4 text-muted-foreground shrink-0" />
      <input
        ref={inputRef}
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Tìm kiếm…"
        className="bg-transparent outline-none text-sm w-full placeholder:text-muted-foreground"
        aria-label="Search"
      />
    </form>
  );
}

function UserMenu() {
  const { user, logout } = useAuthStore();

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-1.5 rounded-full p-1 pr-2 bg-secondary/60 hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/30">
          <Avatar className="h-7 w-7 ring-2 ring-primary/20">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
            <AvatarFallback className="text-xs bg-primary/15 text-primary font-semibold">
              {user.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 shadow-card">
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
              <Shield className="h-4 w-4 text-primary" /> Admin
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
          <LogOut className="h-4 w-4" /> Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function Header() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();

  return (
    <>
      <header className="sticky top-0 z-40 hidden md:block backdrop-blur-md bg-card/70 border-b border-border">
        <div className="mx-auto max-w-7xl px-4 md:px-6 h-16 flex items-center gap-6">

          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2 font-display font-bold text-lg">
            <span className="text-2xl animate-float select-none">🌸</span>
            <span
              className="bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent"
              style={{ backgroundImage: 'var(--gradient-primary)' }}
            >
              Manga Go
            </span>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1" aria-label="Main navigation">
            {NAV_LINKS.map(({ href, label }) => {
              const isActive =
                href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/');
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-sm font-semibold transition-colors',
                    isActive
                      ? 'bg-primary/15 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/60'
                  )}
                >
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <SearchBar />

            {isAuthenticated && <NotificationBell />}

            <ThemeToggle />

            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  href="/login"
                  className="px-3 py-1.5 rounded-full text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-1.5 rounded-full text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Desktop spacer */}
      <div className="hidden md:block h-16" aria-hidden />
    </>
  );
}
