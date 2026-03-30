# Coding Conventions

This document outlines the coding conventions and standards for the Manga Go Frontend project.

## Table of Contents

- [File Naming](#file-naming)
- [Code Style](#code-style)
- [TypeScript](#typescript)
- [React Components](#react-components)
- [Imports](#imports)
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
6. **Format code**: Run `npm run format` before committing
7. **Lint code**: Run `npm run lint` before committing
8. **Single quotes**: Use single quotes for strings (except JSX)
9. **Type imports**: Import types with `type` keyword
10. **Console logs**: Only use console.warn and console.error in production code
