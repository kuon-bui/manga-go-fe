# Claude AI Assistant Guide for Manga Go Frontend

This document provides guidance for Claude AI assistants (including Claude Code, Claude Desktop, etc.) working on the Manga Go Frontend project.

## Project Overview

**Manga Go Frontend** is a modern manga reading platform built with:
- Next.js 15 (App Router)
- React 19
- TypeScript (strict mode)
- Tailwind CSS (with dark mode)
- Zustand (state management)

## Quick Reference

### Essential Documentation
Before making any changes, review:
1. [`docs/CODING_CONVENTIONS.md`](./docs/CODING_CONVENTIONS.md) - Naming, TypeScript, formatting rules
2. [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) - Project structure and patterns
3. [`docs/COMPONENT_GUIDELINES.md`](./docs/COMPONENT_GUIDELINES.md) - Component development
4. [`docs/STATE_MANAGEMENT.md`](./docs/STATE_MANAGEMENT.md) - Zustand patterns

### Critical Conventions

#### File Naming
- **Always use kebab-case** for files: `button.tsx`, `use-theme.ts`, `manga-card.tsx`
- **Never use PascalCase** for files: ❌ `Button.tsx`, ❌ `UseTheme.ts`
- Component names in code use PascalCase: `Button`, `MangaCard`, `Header`

#### TypeScript
- Strict mode enabled - no `any` types
- Always define explicit interfaces for props
- Import types with `type` keyword: `import type { User } from '@/types'`
- Prefix unused parameters with `_`: `(_param: Type) => {}`

#### Imports
- Always use `@/` path alias for internal imports
- Import order: React/Next → Third-party → Internal → Types → Styles

```typescript
// ✅ Correct
import { useState } from 'react';
import { create } from 'zustand';
import { Button } from '@/components/ui/button';
import type { User } from '@/types';

// ❌ Wrong
import { Button } from '../components/ui/button';
```

#### Components
- **Server Components by default** (no `'use client'`)
- Add `'use client'` only when using:
  - React hooks (useState, useEffect, etc.)
  - Event handlers (onClick, onChange, etc.)
  - Browser APIs (localStorage, window, etc.)

#### Code Style
- Single quotes for strings (except JSX attributes)
- Semicolons required
- 2 spaces indentation
- 100 character line length
- Trailing commas (ES5)

## Common Tasks

### Creating a New Page
```typescript
// src/app/manga/page.tsx
export default async function MangaPage() {
  // Server Component - can fetch data directly
  const data = await fetchData();
  return <div>{/* content */}</div>;
}
```

### Creating a UI Component
```typescript
// src/components/ui/component-name.tsx
import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ComponentProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary';
}

const Component = forwardRef<HTMLDivElement, ComponentProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('base-styles', variantStyles[variant], className)}
        {...props}
      />
    );
  }
);

Component.displayName = 'Component';

export { Component };
export type { ComponentProps };
```

### Creating a Zustand Store
```typescript
// src/stores/use-feature-store.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface FeatureState {
  data: string;
  setData: (_data: string) => void;
}

export const useFeatureStore = create<FeatureState>()(
  devtools(
    persist(
      (set) => ({
        data: '',
        setData: (data: string) => set({ data }, false, 'setData'),
      }),
      {
        name: 'feature-store',
        partialize: (state) => ({ data: state.data }),
      }
    ),
    { name: 'FeatureStore', enabled: process.env.NODE_ENV === 'development' }
  )
);
```

### Adding Types
```typescript
// src/types/index.ts
export interface NewType {
  id: string;
  name: string;
  createdAt: string;
}
```

## Code Review Checklist

When reviewing or writing code, verify:

### Naming
- [ ] File names are kebab-case
- [ ] Component names are PascalCase
- [ ] Boolean props use `is`, `has`, `should` prefixes
- [ ] Handler props use `on` prefix

### TypeScript
- [ ] No `any` types
- [ ] All props have interfaces
- [ ] Types imported with `type` keyword
- [ ] Unused params prefixed with `_`

### Components
- [ ] `'use client'` only when necessary
- [ ] UI components use `forwardRef`
- [ ] `displayName` set for forwardRef components
- [ ] Supports `className` prop
- [ ] Uses `cn()` utility for class merging
- [ ] Includes dark mode styles (`dark:` prefix)
- [ ] Responsive design (`sm:`, `md:`, `lg:` prefixes)
- [ ] ARIA labels for interactive elements

### Styling
- [ ] Uses Tailwind utility classes
- [ ] Dark mode variants included
- [ ] Responsive breakpoints used
- [ ] No inline styles (use Tailwind)

### Zustand Stores
- [ ] Uses `devtools` middleware
- [ ] Uses `persist` middleware (when appropriate)
- [ ] Explicit TypeScript interface
- [ ] Action names in `set()` calls
- [ ] `partialize` config for persistence
- [ ] DevTools only in development

### Imports
- [ ] Uses `@/` path alias
- [ ] Correct import order
- [ ] Types imported separately

### Code Quality
- [ ] Formatted with Prettier
- [ ] Passes ESLint
- [ ] No console.log (use console.warn/error only)
- [ ] Uses `const` over `let`
- [ ] Never uses `var`

## Development Workflow

### Before Writing Code
1. Read relevant documentation in `docs/`
2. Understand existing patterns in codebase
3. Check for similar implementations
4. Plan file structure

### While Writing Code
1. Follow naming conventions
2. Use TypeScript types
3. Use `@/` imports
4. Include dark mode styles
5. Make components responsive
6. Add accessibility attributes

### Before Committing
```bash
npm run format      # Format with Prettier
npm run lint        # Check ESLint
npm run build       # Verify build works
```

## Anti-Patterns to Avoid

### ❌ Don't Do This
```typescript
// PascalCase file names
// File: Button.tsx
export function Button() {}

// Missing types
function Component(props) {}

// Using 'any'
const data: any = {};

// Relative imports
import { Button } from '../../../components/ui/button';

// Missing 'use client' for hooks
export function Component() {
  const [state, setState] = useState(0);
}

// Missing dark mode
<div className="bg-white text-black">

// All state in one store
const useAppStore = create(() => ({
  user: {},
  cart: {},
  settings: {},
  ui: {},
}));
```

### ✅ Do This Instead
```typescript
// kebab-case file name
// File: button.tsx
export function Button() {}

// Explicit types
interface ComponentProps {
  title: string;
}
function Component({ title }: ComponentProps) {}

// Proper typing
const data: User[] = [];

// Path alias imports
import { Button } from '@/components/ui/button';

// 'use client' directive
'use client';
export function Component() {
  const [state, setState] = useState(0);
}

// Dark mode included
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">

// Separate stores by domain
const useUserStore = create(() => ({ user: {} }));
const useCartStore = create(() => ({ cart: {} }));
```

## Performance Considerations

### Use Zustand Selectors
```typescript
// ❌ Bad: Re-renders on any store change
const store = useExampleStore();

// ✅ Good: Only re-renders when count changes
const count = useExampleStore((state) => state.count);
```

### Dynamic Imports
```typescript
// For heavy components
const HeavyComponent = dynamic(() => import('./heavy-component'), {
  loading: () => <div>Loading...</div>,
});
```

### Image Optimization
```typescript
import Image from 'next/image';

<Image
  src="/image.jpg"
  alt="Description"
  width={300}
  height={200}
  priority={false}
/>
```

## Common Pitfalls

1. **File naming**: Always kebab-case, never PascalCase
2. **Client directives**: Only add `'use client'` when needed
3. **Imports**: Always use `@/` not relative paths
4. **Dark mode**: Always include dark mode styles
5. **Types**: Never use `any`, always define explicit types
6. **Zustand**: Use selectors to prevent unnecessary re-renders
7. **Persistence**: Don't persist loading/error states
8. **Console**: Only use console.warn and console.error

## Useful Commands

```bash
# Development
npm run dev              # Start dev server (localhost:3000)

# Code Quality
npm run format           # Format all files
npm run format:check     # Check formatting
npm run lint             # Run ESLint

# Production
npm run build            # Build for production
npm run start            # Start production server
```

## Getting Help

1. Check `docs/` directory for detailed guides
2. Look at existing components for patterns
3. Review `src/components/ui/` for UI component examples
4. Check `src/stores/` for Zustand store examples
5. See `src/types/index.ts` for type definitions

## Project Context

- **Target Users**: Manga readers
- **Key Features**: Reading manga, dark mode, responsive design
- **Browser Support**: Modern browsers (ES2017+)
- **Deployment**: Optimized for Vercel

## Additional Notes

- This project uses Next.js 15 App Router (not Pages Router)
- Server Components are the default - most components should be Server Components
- Tailwind CSS is configured with custom primary/secondary colors
- Dark mode uses `class` strategy (not `media`)
- Zustand DevTools only enabled in development
- TypeScript strict mode is enabled

---

**For detailed information**, always refer to the documentation in the `docs/` directory.

**Last Updated**: 2026-03-30
