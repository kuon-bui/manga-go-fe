# Manga Go Frontend

A modern manga reading platform built with Next.js, Tailwind CSS, and Zustand.

## Tech Stack

- **[Next.js 15](https://nextjs.org/)** – App Router, Server Components, Image Optimization
- **[TypeScript](https://www.typescriptlang.org/)** – Strict mode for type safety
- **[Tailwind CSS](https://tailwindcss.com/)** – Utility-first CSS with dark mode support
- **[Zustand](https://zustand-demo.pmnd.rs/)** – Lightweight state management with devtools & persist

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout with metadata & fonts
│   ├── page.tsx            # Home page (Server Component)
│   ├── globals.css         # Global styles + Tailwind directives
│   ├── loading.tsx         # Global loading UI
│   ├── error.tsx           # Global error boundary
│   └── not-found.tsx       # 404 page
├── components/
│   ├── ui/                 # Reusable UI components
│   │   ├── button.tsx      # Button with variants
│   │   ├── card.tsx        # Card components
│   │   └── input.tsx       # Input with validation states
│   ├── layout/             # Layout components
│   │   ├── header.tsx      # Sticky header with dark mode toggle
│   │   └── footer.tsx      # Footer with links
│   └── examples/
│       └── counter-example.tsx  # Zustand usage demo
├── stores/
│   └── use-example-store.ts    # Example Zustand store
├── hooks/
│   └── use-theme.ts            # Dark mode hook
├── lib/
│   ├── utils.ts                # Utility functions (cn, formatDate, etc.)
│   └── constants.ts            # App constants & routes
├── types/
│   └── index.ts                # TypeScript type definitions
└── providers/
    └── app-providers.tsx       # Root React providers
```

## Getting Started

### Prerequisites

- Node.js 18.17+
- npm / yarn / pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kuon-bui/manga-go-fe.git
   cd manga-go-fe
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check formatting without writing |

## Key Features

### Dark Mode

Dark mode is supported via Tailwind's `class` strategy. The `useTheme` hook manages theme persistence in localStorage and respects the user's system preference on first visit.

```tsx
import { useTheme } from '@/hooks/use-theme';

const { theme, toggleTheme } = useTheme();
```

### Zustand State Management

Stores are organized by feature in `src/stores/`. Each store uses the `devtools` and `persist` middlewares.

```ts
// src/stores/use-example-store.ts
export const useExampleStore = create<ExampleState>()(
  devtools(
    persist(
      (set) => ({
        count: 0,
        increment: () => set((state) => ({ count: state.count + 1 })),
      }),
      { name: 'example-store' }
    )
  )
);
```

**Use selectors** to prevent unnecessary re-renders:

```tsx
// ✅ Only re-renders when `count` changes
const count = useExampleStore((state) => state.count);

// ❌ Re-renders on any store update
const store = useExampleStore();
```

### Path Aliases

Use `@/` to import from the `src/` directory:

```ts
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
```

### Component Conventions

- **File names**: `kebab-case` (e.g., `button.tsx`, `use-theme.ts`)
- **Component names**: `PascalCase` (e.g., `Button`, `Header`)
- **Client Components**: Add `'use client'` only when needed (event handlers, hooks, browser APIs)
- **Server Components**: Default – no `'use client'` directive

## Tailwind Configuration

The Tailwind config (`tailwind.config.ts`) extends the default theme with:

- Custom `primary` and `secondary` color palettes
- Custom fonts (`--font-geist-sans`, `--font-geist-mono`)
- Additional spacing values (`18`, `88`, `112`, `128`)
- Extra breakpoint (`xs: 475px`)

## Adding New Features

1. **New page**: Create `src/app/<route>/page.tsx`
2. **New store**: Create `src/stores/use-<feature>-store.ts`
3. **New component**: Create `src/components/<category>/<component-name>.tsx`
4. **New hook**: Create `src/hooks/use-<name>.ts`
5. **New types**: Add to `src/types/index.ts`

## License

MIT
