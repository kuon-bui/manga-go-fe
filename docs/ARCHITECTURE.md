# Project Architecture

This document provides a comprehensive overview of the Manga Go Frontend architecture, folder structure, and design decisions.

## Table of Contents

- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Architectural Patterns](#architectural-patterns)
- [Routing](#routing)
- [Data Flow](#data-flow)
- [Styling Architecture](#styling-architecture)

## Technology Stack

### Core Framework
- **Next.js 15** - React framework with App Router
- **React 19** - UI library with Server Components
- **TypeScript 5.8** - Type-safe JavaScript

### State Management
- **Zustand** - Lightweight state management with middleware support
  - `devtools` - Redux DevTools integration (development only)
  - `persist` - LocalStorage persistence

### Styling
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **PostCSS** - CSS processing
- **Autoprefixer** - Vendor prefix handling

### Code Quality
- **ESLint** - Linting with Next.js rules
- **Prettier** - Code formatting
- **TypeScript Strict Mode** - Enhanced type safety

## Project Structure

```
manga-go-fe/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout (metadata, fonts, providers)
│   │   ├── page.tsx            # Home page (Server Component)
│   │   ├── globals.css         # Global styles + Tailwind directives
│   │   ├── loading.tsx         # Global loading fallback
│   │   ├── error.tsx           # Global error boundary
│   │   └── not-found.tsx       # 404 page
│   │
│   ├── components/             # React components
│   │   ├── ui/                 # Reusable UI primitives
│   │   │   ├── button.tsx      # Button with variants
│   │   │   ├── card.tsx        # Card components
│   │   │   └── input.tsx       # Input with validation states
│   │   ├── layout/             # Layout-specific components
│   │   │   ├── header.tsx      # Site header (Client Component)
│   │   │   └── footer.tsx      # Site footer
│   │   └── examples/           # Example/demo components
│   │       └── counter-example.tsx
│   │
│   ├── stores/                 # Zustand state stores
│   │   └── use-example-store.ts
│   │
│   ├── hooks/                  # Custom React hooks
│   │   └── use-theme.ts        # Dark mode management
│   │
│   ├── lib/                    # Utility functions & constants
│   │   ├── utils.ts            # Helper functions (cn, formatDate, etc.)
│   │   └── constants.ts        # App-wide constants
│   │
│   ├── types/                  # TypeScript type definitions
│   │   └── index.ts            # Centralized type exports
│   │
│   └── providers/              # React context providers
│       └── app-providers.tsx   # Root providers wrapper
│
├── public/                     # Static assets
├── docs/                       # Documentation files
├── .github/                    # GitHub workflows & templates
│
├── next.config.ts              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
├── .eslintrc.json              # ESLint configuration
├── .prettierrc                 # Prettier configuration
├── postcss.config.mjs          # PostCSS configuration
└── package.json                # Dependencies & scripts
```

## Architectural Patterns

### 1. Component Organization

Components are organized by purpose and reusability:

#### **UI Components** (`src/components/ui/`)
- Pure, reusable UI primitives
- No business logic or external state
- Highly composable and customizable
- Use TypeScript for strict typing
- Support variants and sizes via props

**Example**: Button, Card, Input

#### **Layout Components** (`src/components/layout/`)
- Structural components that define page layout
- May contain business logic and state
- Typically used in `app/layout.tsx`

**Example**: Header, Footer, Sidebar

#### **Feature Components** (`src/components/<feature>/`)
- Domain-specific components
- May use Zustand stores
- Can be Client or Server Components

**Example**: `manga/manga-card.tsx`, `reader/chapter-viewer.tsx`

### 2. Server vs Client Components

#### **Server Components (Default)**
- Default for all components in the App Router
- Run on the server, never sent to the client
- Can directly access backend resources
- Cannot use hooks or event handlers

**Use for:**
- Static content rendering
- Data fetching from APIs/databases
- SEO-critical pages
- Large dependencies that don't need client-side

```typescript
// No 'use client' directive = Server Component
export default function HomePage() {
  // Can fetch data directly
  return <div>Static content</div>;
}
```

#### **Client Components**
- Must have `'use client'` directive
- Run on both server (for SSR) and client
- Can use hooks and event handlers
- Can access browser APIs

**Use for:**
- Interactive elements (buttons, forms)
- React hooks (useState, useEffect)
- Browser APIs (localStorage, window)
- Event handlers (onClick, onChange)

```typescript
'use client';

import { useState } from 'react';

export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

### 3. State Management Strategy

#### **Local State** (useState)
Use for component-specific state that doesn't need to be shared:
- Form inputs
- UI toggles (open/closed)
- Temporary data

#### **Zustand Stores** (`src/stores/`)
Use for global or shared state:
- User authentication
- Shopping cart
- Theme preferences
- Application settings

**Pattern:**
```typescript
// src/stores/use-<feature>-store.ts
export const useFeatureStore = create<FeatureState>()(
  devtools(
    persist(
      (set) => ({
        // State
        data: initialState,

        // Actions
        updateData: (newData) => set({ data: newData }),
      }),
      { name: 'feature-store' }
    )
  )
);
```

#### **URL State** (searchParams)
Use for shareable/bookmarkable state:
- Filters and sorting
- Pagination
- Search queries

### 4. Data Fetching

#### **Server Components**
Fetch data directly in Server Components:

```typescript
// app/manga/[id]/page.tsx
async function MangaPage({ params }: { params: { id: string } }) {
  const manga = await fetchManga(params.id); // Direct fetch
  return <MangaDetails manga={manga} />;
}
```

#### **Client Components**
Use `useEffect` or data fetching libraries:

```typescript
'use client';

export function MangaList() {
  const [manga, setManga] = useState([]);

  useEffect(() => {
    fetchMangaList().then(setManga);
  }, []);

  return <div>{/* render manga */}</div>;
}
```

## Routing

### App Router Structure

Next.js 15 uses the App Router (`src/app/` directory):

```
app/
├── layout.tsx           # Root layout (applies to all pages)
├── page.tsx             # Home page: /
├── loading.tsx          # Loading UI for all pages
├── error.tsx            # Error boundary for all pages
├── not-found.tsx        # 404 page
│
├── manga/
│   ├── page.tsx         # Manga list: /manga
│   ├── [id]/
│   │   └── page.tsx     # Manga details: /manga/123
│   └── [id]/chapter/[chapterId]/
│       └── page.tsx     # Chapter reader: /manga/123/chapter/456
│
└── api/                 # API routes (if needed)
    └── hello/
        └── route.ts     # API endpoint: /api/hello
```

### Navigation

Use Next.js `Link` component for client-side navigation:

```typescript
import Link from 'next/link';

<Link href="/manga/123">View Manga</Link>
```

### Dynamic Routes

Use brackets for dynamic segments:
- `[id]` - Single dynamic segment
- `[...slug]` - Catch-all segments
- `[[...slug]]` - Optional catch-all

## Data Flow

### Typical Flow for a Feature

```
1. User Interaction (Client Component)
         ↓
2. Action Called (Zustand store or API call)
         ↓
3. State Updated (Zustand or Server Component re-render)
         ↓
4. UI Re-renders (React reconciliation)
```

### Example: Reading a Manga Chapter

```typescript
// 1. User clicks on chapter in list
<Link href={`/manga/${mangaId}/chapter/${chapterId}`}>
  Chapter {number}
</Link>

// 2. Next.js navigates to chapter page
// app/manga/[id]/chapter/[chapterId]/page.tsx
async function ChapterPage({ params }) {
  // 3. Server Component fetches data
  const chapter = await fetchChapter(params.id, params.chapterId);

  // 4. Passes to Client Component for reader
  return <ChapterReader chapter={chapter} />;
}

// 5. Client Component handles user interactions
'use client';
function ChapterReader({ chapter }) {
  const [currentPage, setCurrentPage] = useState(0);
  // Interactive reading experience
}
```

## Styling Architecture

### Tailwind CSS Strategy

#### **Utility-First Approach**
Use Tailwind utilities directly in JSX:

```typescript
<div className="flex items-center gap-4 p-6 bg-white dark:bg-gray-900">
  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
    Title
  </h1>
</div>
```

#### **Component Variants Pattern**
For components with multiple variants, use the variant pattern:

```typescript
const variantStyles: Record<ButtonVariant, string> = {
  default: 'bg-primary-600 text-white hover:bg-primary-700',
  outline: 'border border-gray-300 bg-transparent',
  ghost: 'bg-transparent hover:bg-gray-100',
};

<button className={cn(baseStyles, variantStyles[variant], className)} />
```

#### **The `cn` Utility**
Use the `cn` utility for merging Tailwind classes:

```typescript
import { cn } from '@/lib/utils';

<div className={cn('base-class', condition && 'conditional-class', className)} />
```

This handles Tailwind class conflicts properly (e.g., `p-4 p-6` becomes `p-6`).

### Dark Mode

Dark mode is implemented using Tailwind's `class` strategy:

1. Theme is managed by `useTheme` hook
2. Theme class is applied to `<html>` element
3. Use `dark:` prefix for dark mode styles

```typescript
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  Content
</div>
```

### Responsive Design

Use Tailwind's responsive prefixes:

```typescript
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Responsive grid */}
</div>
```

**Breakpoints:**
- `xs`: 475px (custom)
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Custom Tailwind Configuration

Custom colors, spacing, and utilities are defined in `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      primary: { /* custom primary palette */ },
      secondary: { /* custom secondary palette */ },
    },
    spacing: {
      '18': '4.5rem',
      '88': '22rem',
      // ...
    },
  },
}
```

## Performance Considerations

### Code Splitting
- Automatic code splitting per route
- Dynamic imports for heavy components:
  ```typescript
  const HeavyComponent = dynamic(() => import('./heavy-component'));
  ```

### Image Optimization
Use Next.js `Image` component:
```typescript
import Image from 'next/image';

<Image
  src="/manga-cover.jpg"
  alt="Manga Cover"
  width={300}
  height={450}
  priority={false} // Set true for above-the-fold images
/>
```

### Metadata Management
Define metadata in layout/page files:
```typescript
export const metadata = {
  title: 'Manga Go',
  description: 'Read manga online',
};
```

## Security Considerations

### Environment Variables
- Store sensitive data in `.env.local`
- Prefix with `NEXT_PUBLIC_` for client-accessible variables
- Never commit `.env.local` to version control

### API Routes
- Implement rate limiting
- Validate all inputs
- Use CORS properly
- Sanitize user-generated content

## Deployment

### Build Process
```bash
npm run build      # Creates optimized production build
npm run start      # Starts production server
```

### Environment-Specific Config
- Development: `npm run dev`
- Production: `npm run build && npm run start`

### Recommended Platforms
- **Vercel** - Optimal for Next.js (zero-config)
- **Netlify** - Good alternative
- **Custom** - Docker + Node.js server

## Adding New Features

### Checklist for New Feature Development

1. **Plan the feature**
   - Identify if it's a page, component, or utility
   - Determine if it needs global state (Zustand)
   - Decide Server vs Client Component

2. **Create necessary files**
   ```bash
   # Page
   src/app/<route>/page.tsx

   # Component
   src/components/<category>/<component-name>.tsx

   # Store
   src/stores/use-<feature>-store.ts

   # Types
   # Add to src/types/index.ts
   ```

3. **Follow conventions**
   - Use kebab-case for file names
   - Use PascalCase for component names
   - Add types for all props and state
   - Use `@/` imports

4. **Test the feature**
   - Manual testing in dev mode
   - Check responsive design
   - Test dark mode support
   - Verify accessibility

5. **Format and lint**
   ```bash
   npm run format
   npm run lint
   ```

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Zustand Documentation](https://zustand-demo.pmnd.rs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
