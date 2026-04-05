# Project Brief (Persistent)

- **Product vision:** A modern, responsive web platform for reading manga and light novels — fast, beautiful on any device, with self-service translation publishing and community features.
- **Target Audience:** Casual manga/novel readers (primary), power readers with large libraries, translator groups who publish translated chapters, group admins who manage translation teams.
- **Stage:** MVP Development — Frontend only. Backend API is separate (Go service).
- **Frontend only:** This repository is the frontend. Do NOT build a backend here.
- **UI Library:** shadcn/ui — components are scaffolded into `src/components/ui/` via `npx shadcn@latest add <name>`. They are fully owned and customizable. Never import from shadcn npm packages directly — always import from `@/components/ui/`.

## Key Principles

1. **Ship the simplest solution** that solves the user story — no speculative features.
2. **Mobile-first always** — every component starts with a mobile layout. Breakpoints scale up.
3. **Server Components by default** — only add `'use client'` where genuinely needed (interactivity, stores, event listeners).
4. **One source of truth** — TanStack Query owns server state; Zustand owns client UI state. Never duplicate.
5. **Pre-built patterns over custom** — use existing `docs/COMPONENT_GUIDELINES.md` patterns; don't invent new ones.

## Conventions

| Rule | Detail |
|---|---|
| **File naming** | kebab-case everywhere: `manga-card.tsx`, `use-auth-store.ts` |
| **Component names** | PascalCase exports: `export function MangaCard()` |
| **Imports** | Always `@/` alias from `src/`, never `../../` |
| **Dark mode** | `dark:` Tailwind variant on ALL color/background/border values |
| **Responsive** | Base class = mobile, scale up with `sm:` `md:` `lg:` `xl:` |
| **No `any`** | Use `unknown` + type guards or precise interfaces |
| **Comments** | Only where logic is non-obvious. No redundant JSDoc for trivial getters. |

## Architecture Boundaries

```
Page (app/**/page.tsx)
  └── Server: fetch initial data, pass to components
  └── Client: forms, interactive states

Components (src/components/**)
  └── ui/        — pure primitives, no business logic
  └── layout/    — structural wrappers (header, footer, nav)
  └── features/  — domain-specific (content/, detail/, auth/)
  └── readers/   — heavy reader UIs (novel/, manga/) — dynamically imported

Stores (src/stores/**)
  └── Zustand only — UI state and user preferences

Hooks (src/hooks/**)
  └── Custom hooks — reusable imperative logic (scroll, keyboard, preload)

Lib (src/lib/**)
  └── Pure utilities, api-client, permissions map, query-keys
  └── NO React code in lib/
```

## Quality Gates

Before any task is marked complete:

1. `yarn lint` — zero errors
2. `yarn format` — no changes produced (already formatted)
3. `yarn build` — compiles without errors
4. Manual viewport test: 375px (mobile) and 1280px (desktop)
5. Dark mode visual check
6. `MEMORY.md` updated with any new decisions

## Key Commands

```bash
yarn dev          # Start dev server
yarn build        # Build + type check
yarn lint         # ESLint check
yarn format       # Prettier format
```

## Update Cadence

Update this file when:
- A new architectural decision is made that future agents must respect
- A library is added or removed from the stack
- A convention is changed or clarified
- A new route group or major folder structure is added
