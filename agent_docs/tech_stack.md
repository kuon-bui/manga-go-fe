# Tech Stack & Tools

## Core Stack

| Layer | Technology | Version |
|---|---|---|
| **Framework** | Next.js App Router | 15.3.0 |
| **UI Library** | React | 19.0.0 |
| **Language** | TypeScript (strict mode) | 5.8.3 |
| **Styling** | Tailwind CSS | 3.4.x |
| **UI Components** | shadcn/ui | latest |
| **Client State** | Zustand | ^5.0.3 |
| **Server State** | TanStack Query | (add `@tanstack/react-query`) |
| **Package Manager** | Yarn | latest |
| **Linter** | ESLint | (configured in `eslint.config.mjs`) |
| **Formatter** | Prettier | (configured in `.prettierrc`) |

---

## shadcn/ui — Setup & Usage

shadcn/ui is the primary component library. Components are **copied into** `src/components/ui/` (not installed as a package), so they are fully customizable.

### Initial Setup

```bash
npx shadcn@latest init
```

During init, select:
- **Style:** Default
- **Base color:** Slate (or match brand primary)
- **CSS variables:** Yes
- **React Server Components:** Yes

### Installing Components

```bash
# Install individual components as needed:
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add badge
npx shadcn@latest add avatar
npx shadcn@latest add dialog
npx shadcn@latest add drawer        # mobile bottom sheet (vaul)
npx shadcn@latest add tabs
npx shadcn@latest add skeleton
npx shadcn@latest add sonner        # toast notifications
npx shadcn@latest add slider
npx shadcn@latest add select
npx shadcn@latest add dropdown-menu
npx shadcn@latest add sheet         # slide-in panels (settings, filters)
npx shadcn@latest add separator
npx shadcn@latest add label
npx shadcn@latest add checkbox
npx shadcn@latest add radio-group
npx shadcn@latest add switch
npx shadcn@latest add textarea
npx shadcn@latest add scroll-area
npx shadcn@latest add popover
npx shadcn@latest add command       # combobox / search with suggestions
npx shadcn@latest add progress
npx shadcn@latest add alert
npx shadcn@latest add table
```

### Component Mapping — shadcn/ui vs Custom

| Planned `src/components/ui/` file | Source |
|---|---|
| `button.tsx` | shadcn `Button` |
| `card.tsx` | shadcn `Card`, `CardHeader`, `CardContent`, `CardFooter` |
| `input.tsx` | shadcn `Input` |
| `badge.tsx` | shadcn `Badge` |
| `avatar.tsx` | shadcn `Avatar`, `AvatarImage`, `AvatarFallback` |
| `modal.tsx` (dialog) | shadcn `Dialog` |
| `bottom-sheet.tsx` | shadcn `Drawer` (vaul-based, mobile-friendly) |
| `tabs.tsx` | shadcn `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` |
| `skeleton.tsx` | shadcn `Skeleton` |
| `toast.tsx` | shadcn `Sonner` (via `<Toaster />` in root layout) |
| `slider.tsx` | shadcn `Slider` |
| `dropdown.tsx` | shadcn `Select` (forms) or `DropdownMenu` (actions) |
| `progress-bar.tsx` | **Custom** — reading progress bar (thin top strip) |
| `star-rating.tsx` | **Custom** — shadcn has no star rating primitive |
| `bottom-nav.tsx` | **Custom** — mobile tab bar |

### Customizing shadcn Components

shadcn components live in `src/components/ui/` and are **yours to edit**. Extend them by adding new variants via the `cva` (class-variance-authority) helper that shadcn installs automatically:

```typescript
// src/components/ui/badge.tsx — example: add a custom "manga-type" variant
import { cva, type VariantProps } from 'class-variance-authority';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary text-primary-foreground',
        secondary: 'border-transparent bg-secondary text-secondary-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        outline: 'text-foreground',
        // Custom variants for Manga Go:
        ongoing: 'border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        completed: 'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        hiatus: 'border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        manga: 'border-transparent bg-primary/10 text-primary',
        novel: 'border-transparent bg-secondary/10 text-secondary-foreground',
      },
    },
    defaultVariants: { variant: 'default' },
  }
);
```

### Using shadcn Components

```typescript
// Always import from @/components/ui — NOT from shadcn packages directly
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader } from '@/components/ui/drawer';

// Toast: use sonner's toast() function
import { toast } from 'sonner';
toast.success('Chapter uploaded!');
toast.error('Upload failed. Please try again.');
```

### Sonner Toast Setup (Root Layout)

```typescript
// src/app/layout.tsx
import { Toaster } from '@/components/ui/sonner';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
```

### Sheet for Slide-in Panels (Filter Sidebar on Mobile, Reader Settings)

```typescript
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';

// Filter panel on mobile (bottom-to-top or side)
<Sheet>
  <SheetTrigger asChild>
    <Button variant="outline" size="sm">Filters</Button>
  </SheetTrigger>
  <SheetContent side="bottom" className="h-[85dvh]">
    <SheetHeader>
      <SheetTitle>Filters</SheetTitle>
    </SheetHeader>
    <FilterPanel />
  </SheetContent>
</Sheet>
```

---

## Key Libraries to Add (Per Phase)

| Library | Purpose | Install Command |
|---|---|---|
| shadcn/ui init | UI component scaffold | `npx shadcn@latest init` |
| `@tanstack/react-query` | Server state / API fetching | `yarn add @tanstack/react-query` |
| `@tanstack/react-virtual` | Virtualized chapter list | `yarn add @tanstack/react-virtual` |
| `react-image-crop` | Avatar crop UI | `yarn add react-image-crop` |

## Dev Commands

```bash
yarn dev          # Start Next.js dev server (localhost:3000)
yarn build        # Production build + type check
yarn lint         # ESLint check
yarn format       # Prettier format
```

## File Naming Rules

```
kebab-case files:    manga-card.tsx       ✅
                     MangaCard.tsx        ❌

PascalCase exports:  export function MangaCard() {}   ✅

Path alias:          import { cn } from '@/lib/utils'   ✅
                     import { cn } from '../../lib/utils' ❌
```

## Component Structure Template

```typescript
// src/components/content/manga-card.tsx

import { cn } from '@/lib/utils';

interface MangaCardProps {
  title: string;
  coverUrl: string;
  className?: string;
}

export function MangaCard({ title, coverUrl, className }: MangaCardProps) {
  return (
    <div className={cn(
      'relative overflow-hidden rounded-lg bg-white dark:bg-gray-800',
      'transition-shadow hover:shadow-md',
      className
    )}>
      {/* Mobile-first: base styles are mobile, md: and lg: scale up */}
      <div className="aspect-[2/3] w-full">
        {/* Use next/image always */}
      </div>
      <div className="p-2 md:p-3">
        <h3 className="line-clamp-2 text-sm font-medium text-gray-900 dark:text-gray-100 md:text-base">
          {title}
        </h3>
      </div>
    </div>
  );
}

export type { MangaCardProps };
```

## Zustand Store Template

```typescript
// src/stores/use-example-store.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface ExampleState {
  value: string;
  setValue: (_v: string) => void;
}

export const useExampleStore = create<ExampleState>()(
  devtools(
    persist(
      (set) => ({
        value: '',
        setValue: (v) => set({ value: v }, false, 'setValue'),
      }),
      {
        name: 'example-store',
        partialize: (state) => ({ value: state.value }),  // only persist what's needed
      }
    ),
    { name: 'ExampleStore', enabled: process.env.NODE_ENV === 'development' }
  )
);
```

## TanStack Query Pattern

```typescript
// src/hooks/use-manga-list.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { queryKeys } from '@/lib/query-keys';
import type { MangaFilters, PaginatedResponse, Manga } from '@/types';

export function useMangaList(filters: MangaFilters) {
  return useQuery({
    queryKey: queryKeys.manga.list(filters),
    queryFn: () => apiClient.get<PaginatedResponse<Manga>>(`/manga?${new URLSearchParams(filters as Record<string, string>)}`),
    staleTime: 1000 * 60 * 5,  // 5 minutes
  });
}
```

## Error Handling Pattern

```typescript
// API errors are thrown by api-client.ts and caught at the QueryClient level.
// For component-level handling:

const { data, isLoading, isError, error } = useMangaList(filters);

if (isLoading) return <MangaGridSkeleton />;
if (isError) return <ErrorState message={error.message} />;

// For mutations, use onError in useMutation:
const mutation = useMutation({
  mutationFn: submitRating,
  onError: (error) => {
    // Toast notification shown globally via QueryClient MutationCache
    console.error(error);
  },
});
```

## Tailwind Responsive Pattern

```typescript
// ALWAYS mobile-first. Base classes = mobile. Scale up with breakpoint prefixes.
// Breakpoints: xs (475px) sm (640px) md (768px) lg (1024px) xl (1280px) 2xl (1536px)

// ✅ Correct: mobile grid → desktop 4-col
<div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">

// ❌ Wrong: starting from desktop
<div className="xl:grid-cols-5 lg:grid-cols-4 grid-cols-3">

// Dark mode — always pair background + text:
<div className="bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100">
```

## Environment Variables

```bash
# .env.local (create this file — never commit it)
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_FACEBOOK_APP_ID=your_facebook_app_id
```

## Naming Conventions Summary

| Item | Convention | Example |
|---|---|---|
| Files | kebab-case | `manga-card.tsx` |
| Folders | kebab-case | `content/`, `readers/manga/` |
| React Components | PascalCase | `MangaCard` |
| Hooks | camelCase + `use` prefix | `useScrollProgress` |
| Stores | camelCase + `use` prefix | `useAuthStore` |
| Types/Interfaces | PascalCase | `MangaCard`, `UserRole` |
| Constants | SCREAMING_SNAKE_CASE | `POLL_INTERVAL_MS` |
| CSS classes | Tailwind utility strings (no custom CSS except in `globals.css`) | — |
