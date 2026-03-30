# Component Development Guidelines

This guide provides best practices and patterns for developing React components in the Manga Go Frontend project.

## Table of Contents

- [Component Types](#component-types)
- [Component Structure](#component-structure)
- [Props Design](#props-design)
- [Styling Components](#styling-components)
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
- [ ] Is responsive (tests on mobile, tablet, desktop)
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
