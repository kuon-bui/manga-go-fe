# Component Development Guidelines

This guide provides best practices and patterns for developing React components in the Manga Go Frontend project.

## Table of Contents

- [Component Types](#component-types)
- [Component Structure](#component-structure)
- [Props Design](#props-design)
- [Styling Components](#styling-components)
- [Responsive Design](#responsive-design)
- [Accessibility](#accessibility)
- [Performance](#performance)
- [Testing](#testing)

## Component Types

### 1. UI Components (`src/components/ui/`)

**Purpose**: Reusable, generic UI primitives that can be used throughout the application.

**Characteristics:**
- No business logic
- No direct API calls or external state
- Highly customizable via props
- Support variants and sizes
- Fully typed with TypeScript

**Example Structure:**

```typescript
import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

type CardVariant = 'default' | 'outlined' | 'elevated';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-white dark:bg-gray-800 shadow-sm',
  outlined: 'border border-gray-200 dark:border-gray-700',
  elevated: 'bg-white dark:bg-gray-800 shadow-lg',
};

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('rounded-lg', variantStyles[variant], className)}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

export { Card };
export type { CardProps, CardVariant };
```

### 2. Layout Components (`src/components/layout/`)

**Purpose**: Structural components that define page layout and navigation.

**Characteristics:**
- May contain business logic
- Can use Zustand stores
- Often Client Components (for interactivity)
- Typically used in `app/layout.tsx`

**Example:**

```typescript
'use client';

import Link from 'next/link';
import { useTheme } from '@/hooks/use-theme';
import { Button } from '@/components/ui/button';

export function Header() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm dark:bg-gray-950/80">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="font-bold text-xl">
          Logo
        </Link>
        <nav>
          {/* Navigation items */}
        </nav>
        <Button onClick={toggleTheme} variant="ghost" size="icon">
          {theme === 'dark' ? '☀️' : '🌙'}
        </Button>
      </div>
    </header>
  );
}
```

### 3. Feature Components (`src/components/<feature>/`)

**Purpose**: Domain-specific components that implement business logic.

**Characteristics:**
- Tied to specific features/domains
- May use Zustand stores
- Can fetch data (Server Components) or use effects (Client Components)
- May be composed of UI components

**Example:**

```typescript
// src/components/manga/manga-card.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import type { Manga } from '@/types';

interface MangaCardProps {
  manga: Manga;
}

export function MangaCard({ manga }: MangaCardProps) {
  return (
    <Link href={`/manga/${manga.slug}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative aspect-[3/4]">
          <Image
            src={manga.coverImage}
            alt={manga.title}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-4">
          <h3 className="font-semibold line-clamp-2">{manga.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {manga.latestChapter && `Chapter ${manga.latestChapter.number}`}
          </p>
        </div>
      </Card>
    </Link>
  );
}
```

## Component Structure

### Standard Component Template

```typescript
// 1. Imports
import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import type { ComponentSpecificType } from '@/types';

// 2. Type Definitions
type Variant = 'default' | 'secondary';
type Size = 'sm' | 'md' | 'lg';

interface ComponentProps extends HTMLAttributes<HTMLElement> {
  variant?: Variant;
  size?: Size;
  customProp?: string;
}

// 3. Style Maps (if using variant pattern)
const variantStyles: Record<Variant, string> = {
  default: 'bg-primary-600 text-white',
  secondary: 'bg-secondary-600 text-white',
};

const sizeStyles: Record<Size, string> = {
  sm: 'text-sm px-3 py-1',
  md: 'text-base px-4 py-2',
  lg: 'text-lg px-6 py-3',
};

// 4. Component Implementation
const Component = forwardRef<HTMLElement, ComponentProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => {
    const baseStyles = 'rounded-md font-medium transition-colors';

    return (
      <element
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      />
    );
  }
);

// 5. Display Name (for forwardRef)
Component.displayName = 'Component';

// 6. Exports
export { Component };
export type { ComponentProps, Variant, Size };
```

### Server Component Template

```typescript
import type { ComponentSpecificType } from '@/types';

interface ComponentProps {
  id: string;
  otherProp?: string;
}

// No 'use client' directive = Server Component
export async function Component({ id, otherProp }: ComponentProps) {
  // Can fetch data directly
  const data = await fetchData(id);

  return (
    <div>
      {/* Render data */}
    </div>
  );
}
```

### Client Component Template

```typescript
'use client';

import { useState } from 'react';
import type { ComponentSpecificType } from '@/types';

interface ComponentProps {
  initialValue?: number;
}

export function Component({ initialValue = 0 }: ComponentProps) {
  const [state, setState] = useState(initialValue);

  const handleClick = () => {
    setState(state + 1);
  };

  return (
    <div>
      <button onClick={handleClick}>Count: {state}</button>
    </div>
  );
}
```

## Props Design

### Props Interface Best Practices

#### ✅ Do: Extend HTML Element Types

```typescript
// Inherits all native button attributes
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline';
  isLoading?: boolean;
}
```

#### ✅ Do: Use Optional Props with Defaults

```typescript
interface CardProps {
  variant?: 'default' | 'outlined'; // Optional
  elevation?: number; // Optional
}

function Card({ variant = 'default', elevation = 1 }: CardProps) {
  // ...
}
```

#### ✅ Do: Group Related Props

```typescript
// Group related props into an object
interface ButtonProps {
  variant?: 'default' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  iconProps?: {
    icon: React.ReactNode;
    position: 'left' | 'right';
  };
}
```

#### ❌ Don't: Use Ambiguous Boolean Props

```typescript
// ❌ Bad: What does "active" mean?
interface TabProps {
  active?: boolean;
}

// ✅ Good: Clear and specific
interface TabProps {
  isSelected?: boolean;
  isDisabled?: boolean;
}
```

#### ✅ Do: Use Union Types for Variants

```typescript
type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
}
```

### Props Naming Conventions

| Type | Prefix | Example |
|------|--------|---------|
| Boolean | `is`, `has`, `should`, `can` | `isLoading`, `hasError`, `shouldAutoClose` |
| Handler | `on` | `onClick`, `onChange`, `onSubmit` |
| Number | descriptive | `maxLength`, `pageSize`, `itemCount` |
| Callback returning value | `get`, `render` | `getLabel`, `renderItem` |

### Children and Composition

```typescript
// ✅ Simple children
interface CardProps {
  children: React.ReactNode;
}

// ✅ Named slots for complex composition
interface ModalProps {
  header: React.ReactNode;
  body: React.ReactNode;
  footer?: React.ReactNode;
}

// ✅ Render props for custom rendering
interface ListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
}
```

## Styling Components

### Using the `cn` Utility

Always use the `cn` utility to merge class names:

```typescript
import { cn } from '@/lib/utils';

function Component({ className }: { className?: string }) {
  return (
    <div className={cn('base-class another-class', className)}>
      Content
    </div>
  );
}
```

### Conditional Styles

```typescript
<div
  className={cn(
    'base-class',
    isActive && 'active-class',
    !isDisabled && 'enabled-class',
    size === 'large' && 'large-class',
    className
  )}
>
  Content
</div>
```

### Variant Pattern

```typescript
const variants: Record<Variant, string> = {
  default: 'bg-primary-600 text-white',
  outline: 'border border-gray-300 text-gray-900',
  ghost: 'bg-transparent text-gray-900',
};

<button className={cn('base-styles', variants[variant], className)} />
```

### Dark Mode Styles

Always include dark mode variants:

```typescript
<div className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
  Content
</div>
```

### Responsive Styles

```typescript
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive grid */}
</div>
```

## Responsive Design

### Mobile-First Component Development

**All components must be designed mobile-first.** Start with mobile styles and progressively enhance for larger screens. This ensures optimal experience for the majority of manga readers who use mobile devices.

### Core Responsive Principles

1. **Mobile is the default** - Base styles target mobile (320px+)
2. **Progressive enhancement** - Add features/complexity for larger screens
3. **Touch-first interactions** - Design for touch, enhance for mouse
4. **Performance priority** - Optimize for mobile networks and devices
5. **Content priority** - Show most important content first on mobile

### Responsive Layout Patterns

#### 1. Responsive Grid/List

```typescript
// Mobile: Single column, Tablet: 2 columns, Desktop: 3+ columns
export function MangaGrid({ items }: { items: Manga[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((manga) => (
        <MangaCard key={manga.id} manga={manga} />
      ))}
    </div>
  );
}

// Mobile: Stack, Desktop: Horizontal list with scroll
export function HorizontalList({ items }: { items: Item[] }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:overflow-x-auto sm:gap-6">
      {items.map((item) => (
        <Card key={item.id} className="w-full flex-shrink-0 sm:w-64">
          {/* Content */}
        </Card>
      ))}
    </div>
  );
}
```

#### 2. Responsive Card Component

```typescript
import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface MangaCardProps extends HTMLAttributes<HTMLDivElement> {
  manga: Manga;
  variant?: 'compact' | 'detailed';
}

// Mobile-first card that adapts layout based on screen size
const MangaCard = forwardRef<HTMLDivElement, MangaCardProps>(
  ({ manga, variant = 'compact', className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // Mobile: Vertical layout, compact
          'flex flex-col gap-3 rounded-lg bg-white p-3 shadow-sm dark:bg-gray-800',
          // Tablet+: More padding, larger gaps
          'sm:gap-4 sm:p-4',
          // Desktop: Enhanced shadows
          'lg:shadow-md lg:hover:shadow-lg lg:transition-shadow',
          className
        )}
        {...props}
      >
        {/* Image - Responsive aspect ratio */}
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md">
          <Image
            src={manga.coverImage}
            alt={manga.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        </div>

        {/* Content - Responsive typography */}
        <div className="flex flex-col gap-1 sm:gap-2">
          <h3 className="line-clamp-2 text-sm font-semibold sm:text-base lg:text-lg">
            {manga.title}
          </h3>

          {/* Show more details on larger screens */}
          {variant === 'detailed' && (
            <p className="hidden text-xs text-gray-600 dark:text-gray-400 sm:line-clamp-2 sm:block">
              {manga.description}
            </p>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
            <span>{manga.genre}</span>
            <span>•</span>
            <span>Ch. {manga.latestChapter}</span>
          </div>
        </div>
      </div>
    );
  }
);

MangaCard.displayName = 'MangaCard';

export { MangaCard };
```

#### 3. Responsive Navigation

```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="border-b bg-white dark:bg-gray-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Bar */}
        <div className="flex h-16 items-center justify-between sm:h-20">
          {/* Logo - Responsive sizing */}
          <Link
            href="/"
            className="text-lg font-bold sm:text-xl lg:text-2xl"
          >
            Manga Go
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-6 lg:flex lg:gap-8">
            <NavLink href="/browse">Browse</NavLink>
            <NavLink href="/popular">Popular</NavLink>
            <NavLink href="/new">New Releases</NavLink>
            <NavLink href="/genres">Genres</NavLink>
          </div>

          {/* Mobile Menu Button - Touch-friendly size */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-11 w-11 items-center justify-center rounded-md lg:hidden"
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            {isOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>

        {/* Mobile Menu - Slides from top */}
        {isOpen && (
          <div className="border-t py-4 lg:hidden">
            <div className="flex flex-col gap-4">
              <MobileNavLink href="/browse">Browse</MobileNavLink>
              <MobileNavLink href="/popular">Popular</MobileNavLink>
              <MobileNavLink href="/new">New Releases</MobileNavLink>
              <MobileNavLink href="/genres">Genres</MobileNavLink>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// Desktop nav link
function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
    >
      {children}
    </Link>
  );
}

// Mobile nav link - larger touch target
function MobileNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="block py-3 text-base font-medium text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
    >
      {children}
    </Link>
  );
}
```

#### 4. Responsive Forms

```typescript
export function SearchForm() {
  return (
    <form className="w-full">
      {/* Mobile: Stack, Desktop: Horizontal */}
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        {/* Search Input - Full width on mobile */}
        <input
          type="search"
          placeholder="Search manga..."
          className={cn(
            'w-full rounded-md border px-4 py-3',
            'text-sm sm:text-base',
            'focus:outline-none focus:ring-2 focus:ring-primary-500'
          )}
        />

        {/* Filters - Show as row on mobile, keep with search on desktop */}
        <div className="flex gap-2 sm:gap-3">
          <select className="flex-1 rounded-md border px-3 py-3 text-sm sm:flex-none sm:px-4 sm:text-base">
            <option>All Genres</option>
            <option>Action</option>
            <option>Romance</option>
          </select>

          {/* Search Button - Touch-friendly size */}
          <button
            type="submit"
            className="rounded-md bg-primary-600 px-6 py-3 text-sm font-medium text-white hover:bg-primary-700 sm:px-8 sm:text-base"
          >
            Search
          </button>
        </div>
      </div>
    </form>
  );
}
```

#### 5. Responsive Modal/Dialog

```typescript
'use client';

import { useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function Modal({ isOpen, onClose, children, title }: ModalProps) {
  // Prevent scroll on mobile when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal - Slides up on mobile, centered on desktop */}
      <div
        className={cn(
          // Mobile: Full width, bottom sheet
          'relative w-full rounded-t-2xl bg-white dark:bg-gray-900',
          'max-h-[85vh] overflow-y-auto',
          // Tablet+: Centered, max width
          'sm:max-h-[90vh] sm:max-w-lg sm:rounded-2xl',
          // Desktop: Larger
          'lg:max-w-2xl'
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Header */}
        {title && (
          <div className="sticky top-0 z-10 border-b bg-white px-4 py-4 dark:bg-gray-900 sm:px-6">
            <div className="flex items-center justify-between">
              <h2
                id="modal-title"
                className="text-lg font-semibold sm:text-xl"
              >
                {title}
              </h2>
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Close modal"
              >
                <CloseIcon />
              </button>
            </div>
          </div>
        )}

        {/* Content - Responsive padding */}
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </div>
    </div>
  );
}
```

### Responsive Utilities Hook

```typescript
// src/hooks/use-media-query.ts
'use client';

import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    // Set initial value
    setMatches(media.matches);

    // Listen for changes
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

// Usage in components
export function ResponsiveComponent() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
  const isDesktop = useMediaQuery('(min-width: 1025px)');

  return (
    <div>
      {isMobile && <MobileView />}
      {isTablet && <TabletView />}
      {isDesktop && <DesktopView />}
    </div>
  );
}
```

### Responsive Images Pattern

```typescript
// Responsive manga cover image
export function MangaCover({ manga }: { manga: Manga }) {
  return (
    <div
      className={cn(
        // Mobile: Full width
        'relative aspect-[2/3] w-full',
        // Tablet: Limited width
        'sm:aspect-[3/4] sm:max-w-sm',
        // Desktop: Even more limited
        'lg:max-w-md'
      )}
    >
      <Image
        src={manga.coverImage}
        alt={manga.title}
        fill
        className="rounded-lg object-cover"
        // Responsive sizes for optimal image loading
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 384px, 448px"
        priority={false}
      />
    </div>
  );
}

// Responsive chapter page image
export function ChapterPage({ page }: { page: ChapterPage }) {
  return (
    <div className="relative mx-auto w-full max-w-full sm:max-w-2xl lg:max-w-4xl">
      <Image
        src={page.imageUrl}
        alt={`Page ${page.number}`}
        width={page.width}
        height={page.height}
        className="h-auto w-full"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 672px, 896px"
        priority={page.number === 1}
      />
    </div>
  );
}
```

### Touch-Optimized Components

```typescript
// Touch-friendly button sizes
export function TouchButton({ children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        // Mobile: Larger touch target (min 44x44px)
        'min-h-[44px] px-4 py-3',
        // Desktop: Standard size
        'sm:min-h-[40px] sm:px-4 sm:py-2',
        'rounded-md bg-primary-600 text-white font-medium',
        'active:scale-95 transition-transform'
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// Swipeable card for mobile
'use client';

export function SwipeableCard({ children }: { children: React.ReactNode }) {
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 150) {
      // Swipe left
      console.log('Swiped left');
    }
    if (touchStart - touchEnd < -150) {
      // Swipe right
      console.log('Swiped right');
    }
  };

  return (
    <div
      className="touch-pan-x"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {children}
    </div>
  );
}
```

### Responsive Typography

```typescript
// Responsive heading component
export function ResponsiveHeading({
  level,
  children
}: {
  level: 1 | 2 | 3 | 4;
  children: React.ReactNode;
}) {
  const Tag = `h${level}` as const;

  const sizeClasses = {
    1: 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold',
    2: 'text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold',
    3: 'text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold',
    4: 'text-base sm:text-lg md:text-xl lg:text-2xl font-semibold',
  };

  return (
    <Tag className={cn(sizeClasses[level], 'leading-tight')}>
      {children}
    </Tag>
  );
}

// Responsive body text
export function BodyText({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm leading-relaxed sm:text-base lg:text-lg">
      {children}
    </p>
  );
}
```

### Responsive Testing Checklist

When developing components, test on:

- [ ] **Mobile (320px - 640px)** - iPhone SE, small Android phones
- [ ] **Tablet (641px - 1024px)** - iPad, Android tablets
- [ ] **Desktop (1025px+)** - Laptops, monitors
- [ ] **Touch interactions** - Tap targets, swipe gestures
- [ ] **Orientation changes** - Portrait and landscape
- [ ] **Slow 3G network** - Simulate mobile network conditions
- [ ] **Screen reader** - Test accessibility on mobile

### Performance Optimization for Mobile

```typescript
// Lazy load heavy components on mobile
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./heavy-component'), {
  loading: () => <Skeleton className="h-64 w-full" />,
  ssr: false, // Skip SSR if not critical
});

// Conditionally load based on viewport
export function OptimizedComponent() {
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  return (
    <div>
      {isDesktop ? (
        <DesktopVersion />
      ) : (
        <LightweightMobileVersion />
      )}
    </div>
  );
}

// Optimize images for mobile
export function OptimizedImage({ src, alt }: { src: string; alt: string }) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <Image
      src={src}
      alt={alt}
      width={isMobile ? 400 : 800}
      height={isMobile ? 600 : 1200}
      quality={isMobile ? 75 : 90}
      loading="lazy"
    />
  );
}
```

## Accessibility

### Semantic HTML

Use appropriate HTML elements:

```typescript
// ✅ Good: Semantic
<button onClick={handleClick}>Click me</button>
<nav>{/* navigation */}</nav>
<main>{/* main content */}</main>

// ❌ Bad: Non-semantic
<div onClick={handleClick}>Click me</div>
<div>{/* navigation */}</div>
<div>{/* main content */}</div>
```

### ARIA Labels

Provide labels for interactive elements:

```typescript
<button
  onClick={toggleTheme}
  aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
>
  {theme === 'dark' ? '☀️' : '🌙'}
</button>
```

### Keyboard Navigation

Ensure components are keyboard accessible:

```typescript
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Custom Button
</div>
```

### Focus States

Always include focus styles:

```typescript
<button
  className={cn(
    'rounded-md',
    'focus-visible:outline-none',
    'focus-visible:ring-2',
    'focus-visible:ring-primary-500',
    'focus-visible:ring-offset-2'
  )}
>
  Button
</button>
```

## Performance

### Memoization

Use `React.memo` for expensive components:

```typescript
import { memo } from 'react';

export const ExpensiveComponent = memo(function ExpensiveComponent({ data }) {
  // Expensive rendering logic
  return <div>{/* content */}</div>;
});
```

### Callback Optimization

Use `useCallback` for event handlers passed to child components:

```typescript
const handleClick = useCallback(() => {
  // Handler logic
}, [dependencies]);
```

### useMemo for Expensive Calculations

```typescript
const sortedItems = useMemo(() => {
  return items.sort((a, b) => a.value - b.value);
}, [items]);
```

### Dynamic Imports

Lazy load heavy components:

```typescript
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./heavy-component'), {
  loading: () => <p>Loading...</p>,
  ssr: false, // Disable server-side rendering if needed
});
```

### Image Optimization

Always use Next.js `Image` component:

```typescript
import Image from 'next/image';

<Image
  src="/manga-cover.jpg"
  alt="Manga Cover"
  width={300}
  height={450}
  priority={false} // Set true for above-the-fold images
  placeholder="blur" // Optional blur placeholder
/>
```

## Testing

### Component Testing Checklist

- [ ] Component renders without errors
- [ ] Props are correctly typed
- [ ] Default props work as expected
- [ ] Conditional rendering works correctly
- [ ] Event handlers are called with correct arguments
- [ ] Component is accessible (keyboard navigation, ARIA)
- [ ] Responsive design works on different screen sizes
- [ ] Dark mode styles are applied correctly
- [ ] Loading and error states are handled

### Manual Testing Tips

1. **Test all variants**: Ensure all variant/size combinations render correctly
2. **Test edge cases**: Empty data, very long text, large numbers
3. **Test interactions**: Click, hover, focus, keyboard navigation
4. **Test responsiveness**: Resize browser to test breakpoints
5. **Test dark mode**: Toggle dark mode and verify styles
6. **Test accessibility**: Tab through components, use screen reader

## Common Patterns

### Loading States

```typescript
'use client';

import { useState, useEffect } from 'react';

export function DataComponent() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData()
      .then(setData)
      .catch(setError)
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>No data found</div>;

  return <div>{/* Render data */}</div>;
}
```

### Compound Components

```typescript
// Card with sub-components
export function Card({ children }: { children: React.ReactNode }) {
  return <div className="card">{children}</div>;
}

Card.Header = function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="card-header">{children}</div>;
};

Card.Body = function CardBody({ children }: { children: React.ReactNode }) {
  return <div className="card-body">{children}</div>;
};

Card.Footer = function CardFooter({ children }: { children: React.ReactNode }) {
  return <div className="card-footer">{children}</div>;
};

// Usage
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>Actions</Card.Footer>
</Card>
```

### Polymorphic Components

```typescript
type AsProps<T extends React.ElementType> = {
  as?: T;
} & React.ComponentPropsWithoutRef<T>;

function Text<T extends React.ElementType = 'span'>({
  as,
  children,
  ...props
}: AsProps<T>) {
  const Component = as || 'span';
  return <Component {...props}>{children}</Component>;
}

// Usage
<Text>Default span</Text>
<Text as="h1">Heading</Text>
<Text as="p">Paragraph</Text>
```

## Component Checklist

Before considering a component complete, verify:

- [ ] File name is kebab-case
- [ ] Component name is PascalCase
- [ ] All props are typed with TypeScript
- [ ] Props interface extends appropriate HTML element type
- [ ] Component uses `forwardRef` when needed
- [ ] Display name is set for forwardRef components
- [ ] Supports `className` prop for customization
- [ ] Uses `cn` utility for class merging
- [ ] Includes dark mode styles
- [ ] **Mobile-first responsive design** (starts with mobile styles)
- [ ] **Touch targets minimum 44x44px** on mobile
- [ ] **Responsive typography** (scales across breakpoints)
- [ ] **Responsive images** with proper `sizes` attribute
- [ ] **Tested on mobile, tablet, and desktop** viewports
- [ ] Has proper ARIA labels and accessibility
- [ ] Handles loading/error states when applicable
- [ ] Exports component and types
- [ ] Uses `@/` imports
- [ ] Follows project coding conventions
- [ ] Is documented with JSDoc if complex

## Additional Resources

- [React Component Patterns](https://react.dev/learn/sharing-state-between-components)
- [Next.js Server/Client Components](https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns)
- [Tailwind CSS Best Practices](https://tailwindcss.com/docs/reusing-styles)
- [Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
