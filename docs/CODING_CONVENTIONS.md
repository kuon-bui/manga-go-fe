# Coding Conventions

This document outlines the coding conventions and standards for the Manga Go Frontend project.

## Table of Contents

- [File Naming](#file-naming)
- [Code Style](#code-style)
- [TypeScript](#typescript)
- [React Components](#react-components)
- [Imports](#imports)
- [Responsive Design](#responsive-design)
- [Comments and Documentation](#comments-and-documentation)
- [Error Handling](#error-handling)

## File Naming

### General Rules
- Use **kebab-case** for all file and folder names
- Use **PascalCase** for component names in the code
- File extensions:
  - `.tsx` for files containing JSX/React components
  - `.ts` for pure TypeScript files
  - `.css` for stylesheets

### Examples
```
✅ Good:
- button.tsx
- use-theme.ts
- use-example-store.ts
- counter-example.tsx
- api-client.ts

❌ Bad:
- Button.tsx
- useTheme.ts
- UseExampleStore.ts
- counterExample.tsx
- apiClient.ts
```

## Code Style

### Prettier Configuration
The project uses Prettier with the following configuration:

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "arrowParens": "always",
  "endOfLine": "lf",
  "bracketSpacing": true,
  "jsxSingleQuote": false
}
```

### Key Style Rules
- Always use **single quotes** for strings (except in JSX)
- Use **semicolons** at the end of statements
- Maximum line length: **100 characters**
- Use **2 spaces** for indentation
- Always use **trailing commas** (ES5 compatible)
- Use **arrow functions** with parentheses around parameters

### Examples
```typescript
// ✅ Good
const greeting = 'Hello World';
const numbers = [1, 2, 3];
const user = { name: 'John', age: 30 };
const add = (a: number, b: number) => a + b;

// ❌ Bad
const greeting = "Hello World"
const numbers = [1, 2, 3]
const user = { name: "John", age: 30 }
const add = a => a + b
```

## TypeScript

### Type Safety
- Use **strict mode** (enabled in `tsconfig.json`)
- Always define types for function parameters and return values
- Avoid using `any` - use `unknown` if the type is truly unknown
- Use **type inference** when the type is obvious

### Type Definitions
- Define types in `src/types/index.ts` for shared types
- Use **interfaces** for object shapes
- Use **type aliases** for unions, intersections, and primitives
- Export types alongside components when they're component-specific

### Examples
```typescript
// ✅ Good - Explicit types for parameters and return
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

// ✅ Good - Type inference for simple cases
const count = 0; // inferred as number
const items = ['a', 'b', 'c']; // inferred as string[]

// ✅ Good - Interface for object shapes
interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

// ✅ Good - Type alias for unions
type MangaStatus = 'ongoing' | 'completed' | 'hiatus' | 'cancelled';

// ❌ Bad - Using any
function processData(data: any): any {
  return data;
}

// ❌ Bad - Missing types
function calculate(x, y) {
  return x + y;
}
```

### Type Importing
Always import types with the `type` keyword:

```typescript
// ✅ Good
import type { User } from '@/types';
import { create } from 'zustand';

// ❌ Bad
import { User } from '@/types';
```

## React Components

### Component Structure
1. Imports (React, third-party, local)
2. Type definitions
3. Component implementation
4. Display name (for forwardRef components)
5. Exports

### Client vs Server Components
- **Default**: Server Components (no `'use client'`)
- **Use `'use client'`** only when needed:
  - Event handlers (onClick, onChange, etc.)
  - React hooks (useState, useEffect, etc.)
  - Browser APIs (localStorage, window, etc.)
  - Context consumers

### Examples
```typescript
// ✅ Server Component (default)
export default function HomePage() {
  return <div>Welcome</div>;
}

// ✅ Client Component (when needed)
'use client';

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### Component Props
- Use **interfaces** for props
- Extend HTML element types when appropriate
- Make optional props explicit with `?`
- Document complex props with JSDoc comments

```typescript
// ✅ Good
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

// ✅ Good - Using forwardRef
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'default', size = 'md', ...props }, ref) => {
    // Implementation
  }
);

Button.displayName = 'Button';
```

### Component Naming
- Use **PascalCase** for component names
- Name should be descriptive and clear
- Prefix with the feature/domain when needed

```typescript
// ✅ Good
export function Button() {}
export function CounterExample() {}
export function MangaCard() {}

// ❌ Bad
export function button() {}
export function Btn() {}
export function Component1() {}
```

## Imports

### Import Order
1. React and Next.js imports
2. Third-party libraries
3. Internal components and utilities (using `@/` alias)
4. Types (using `type` keyword)
5. Styles

```typescript
// ✅ Good
import { useState } from 'react';
import Link from 'next/link';
import { create } from 'zustand';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { User } from '@/types';
```

### Path Aliases
Always use the `@/` alias for imports from the `src/` directory:

```typescript
// ✅ Good
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { User } from '@/types';

// ❌ Bad
import { Button } from '../components/ui/button';
import { cn } from '../../lib/utils';
```

## Responsive Design

### Mobile-First Approach

**Always design and code for mobile devices first**, then progressively enhance for larger screens. This ensures optimal performance and user experience on mobile devices.

#### Core Principles

1. **Start with mobile styles** (no breakpoint prefix)
2. **Add tablet styles** with `sm:` and `md:` prefixes
3. **Add desktop styles** with `lg:`, `xl:`, and `2xl:` prefixes
4. **Prioritize touch-friendly interactions** (larger tap targets, spacing)
5. **Optimize for performance** (smaller images, lazy loading)

### Tailwind Breakpoints

Use Tailwind's responsive prefixes in mobile-first order:

| Breakpoint | Min Width | Prefix | Target Device |
|------------|-----------|--------|---------------|
| Default | 0px | (none) | Mobile phones (portrait) |
| xs | 475px | `xs:` | Mobile phones (landscape) |
| sm | 640px | `sm:` | Large phones, small tablets |
| md | 768px | `md:` | Tablets |
| lg | 1024px | `lg:` | Laptops, small desktops |
| xl | 1280px | `xl:` | Desktops |
| 2xl | 1536px | `2xl:` | Large desktops |

### Responsive Design Patterns

#### ✅ Good: Mobile-First Responsive Layout

```typescript
// Mobile: Stack vertically, Tablet+: Grid layout
<div className="flex flex-col gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3">
  <Card />
  <Card />
  <Card />
</div>

// Mobile: Full width, Desktop: Max width container
<div className="w-full px-4 sm:px-6 lg:max-w-7xl lg:mx-auto lg:px-8">
  {/* Content */}
</div>

// Mobile: Small text, Desktop: Larger text
<h1 className="text-2xl font-bold sm:text-3xl lg:text-4xl">
  Page Title
</h1>

// Mobile: Hidden, Desktop: Visible
<nav className="hidden lg:flex lg:items-center lg:gap-6">
  {/* Desktop navigation */}
</nav>

// Mobile: Visible, Desktop: Hidden
<button className="lg:hidden" aria-label="Open menu">
  <MenuIcon />
</button>
```

#### ❌ Bad: Desktop-First Approach

```typescript
// ❌ Wrong: Starts with desktop styles
<div className="grid grid-cols-3 lg:grid-cols-2 sm:flex sm:flex-col">
  {/* This is desktop-first, harder to maintain */}
</div>

// ❌ Wrong: Fixed widths that don't adapt
<div className="w-1200px">
  {/* Will overflow on mobile */}
</div>

// ❌ Wrong: Small tap targets on mobile
<button className="h-6 w-6 p-1">
  {/* Too small for touch */}
</button>
```

### Touch-Friendly Design

#### Minimum Touch Target Sizes

```typescript
// ✅ Good: Touch-friendly sizes (minimum 44x44px)
<button className="h-11 w-11 sm:h-10 sm:w-10">
  <Icon />
</button>

// ✅ Good: Adequate spacing between interactive elements
<nav className="flex flex-col gap-4 sm:flex-row sm:gap-6">
  <Link>Home</Link>
  <Link>About</Link>
  <Link>Contact</Link>
</nav>

// ❌ Bad: Too small for mobile
<button className="h-6 w-6">
  <Icon />
</button>
```

### Responsive Typography

```typescript
// ✅ Good: Scales appropriately across devices
<h1 className="text-2xl font-bold leading-tight sm:text-3xl md:text-4xl lg:text-5xl">
  Hero Title
</h1>

<p className="text-sm leading-relaxed sm:text-base lg:text-lg">
  Body text that's readable on all devices
</p>

// ✅ Good: Line length optimization
<article className="max-w-full prose sm:max-w-prose">
  {/* Optimal reading width */}
</article>
```

### Responsive Images

```typescript
import Image from 'next/image';

// ✅ Good: Responsive image with proper sizing
<div className="relative aspect-video w-full">
  <Image
    src="/hero.jpg"
    alt="Hero image"
    fill
    className="object-cover"
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    priority={false}
  />
</div>

// ✅ Good: Different layouts for mobile/desktop
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
  {items.map((item) => (
    <div key={item.id} className="relative aspect-[3/4]">
      <Image
        src={item.image}
        alt={item.title}
        fill
        className="object-cover"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
    </div>
  ))}
</div>
```

### Responsive Spacing

```typescript
// ✅ Good: Progressive spacing
<section className="px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
  {/* Content */}
</section>

// ✅ Good: Responsive gaps
<div className="flex flex-col gap-4 sm:gap-6 lg:gap-8">
  {/* Items */}
</div>

// ✅ Good: Container padding
<div className="container mx-auto px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>
```

### Responsive Navigation

```typescript
// ✅ Good: Mobile hamburger menu, desktop inline nav
export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm dark:bg-gray-950/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold">
            Logo
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex lg:items-center lg:gap-6">
            <Link href="/manga">Manga</Link>
            <Link href="/genres">Genres</Link>
            <Link href="/popular">Popular</Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="h-11 w-11 lg:hidden"
            aria-label="Toggle menu"
          >
            <MenuIcon />
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="flex flex-col gap-4 py-4 lg:hidden">
            <Link href="/manga">Manga</Link>
            <Link href="/genres">Genres</Link>
            <Link href="/popular">Popular</Link>
          </nav>
        )}
      </div>
    </header>
  );
}
```

### Performance on Mobile

```typescript
// ✅ Good: Lazy load components on mobile
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./heavy-component'), {
  loading: () => <Skeleton />,
  ssr: false, // Don't SSR on mobile if not needed
});

// ✅ Good: Conditional rendering based on viewport
'use client';

import { useMediaQuery } from '@/hooks/use-media-query';

export function ResponsiveComponent() {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div>
      {isMobile ? <MobileVersion /> : <DesktopVersion />}
    </div>
  );
}
```

### Responsive Best Practices Summary

1. **Always start with mobile styles** (base, no prefix)
2. **Use min-width breakpoints** (`sm:`, `md:`, `lg:`)
3. **Touch targets minimum 44x44px** on mobile
4. **Test on actual devices** or browser dev tools
5. **Optimize images** with proper `sizes` attribute
6. **Stack vertically on mobile** (`flex-col`)
7. **Use relative units** (`rem`, `%`, `vh`, `vw`)
8. **Avoid fixed widths** that don't adapt
9. **Consider thumb zones** on mobile (bottom/middle of screen)
10. **Test with slow 3G** to simulate mobile networks

## Comments and Documentation

### JSDoc Comments
Use JSDoc for functions and utilities in `src/lib/`:

```typescript
/**
 * Utility for merging Tailwind CSS classes with conflict resolution.
 * Combines clsx and tailwind-merge for best-in-class class management.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
```

### Inline Comments
- Use comments sparingly - code should be self-documenting
- Only comment when the logic isn't self-evident
- Keep comments concise and up-to-date

```typescript
// ✅ Good - Explaining non-obvious logic
// Only persist specific fields to avoid localStorage bloat
partialize: (state) => ({ count: state.count, user: state.user })

// ❌ Bad - Stating the obvious
// Increment the count
setCount(count + 1);
```

### Section Comments
Use section comments for organizing groups of related items:

```typescript
// ===== User Types =====
export interface User {
  id: string;
  name: string;
}

// ===== Manga Types =====
export interface Manga {
  id: string;
  title: string;
}
```

## Error Handling

### Console Usage
Follow ESLint rules for console statements:

```typescript
// ✅ Allowed
console.warn('Warning message');
console.error('Error message');

// ❌ Not allowed (will trigger ESLint warning)
console.log('Debug message');
```

### Unused Variables
- Prefix unused parameters with underscore `_`:

```typescript
// ✅ Good
const debounce = (fn: (..._args: TArgs) => void, delay: number) => {
  // Implementation
};

// ❌ Bad - ESLint will error
const debounce = (fn: (...args: TArgs) => void, delay: number) => {
  // Implementation without using args
};
```

### Variable Declarations
- Use `const` by default
- Use `let` only when reassignment is needed
- Never use `var`

```typescript
// ✅ Good
const name = 'John';
let count = 0;
count++;

// ❌ Bad
var name = 'John';
```

## ESLint Rules

The project uses the following ESLint configuration:

```json
{
  "extends": "next/core-web-vitals",
  "rules": {
    "no-console": ["warn", { "allow": ["warn", "error"] }],
    "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "prefer-const": "error",
    "no-var": "error"
  }
}
```

## Best Practices Summary

1. **File names**: Always use kebab-case
2. **Component names**: Always use PascalCase
3. **Use strict TypeScript**: Avoid `any`, define explicit types
4. **Import with `@/`**: Use path aliases for all internal imports
5. **Client components**: Only use `'use client'` when necessary
6. **Mobile-first**: Start with mobile styles, add breakpoints for larger screens
7. **Touch-friendly**: Minimum 44x44px touch targets on mobile
8. **Responsive images**: Use Next.js Image with proper `sizes` attribute
9. **Format code**: Run `npm run format` before committing
10. **Lint code**: Run `npm run lint` before committing
11. **Single quotes**: Use single quotes for strings (except JSX)
12. **Type imports**: Import types with `type` keyword
13. **Console logs**: Only use console.warn and console.error in production code
14. **Test responsiveness**: Always test on mobile, tablet, and desktop viewports
