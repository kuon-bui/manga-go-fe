# Artifact Review Checklist 🔍

> **AGENTS:** Do not mark a feature or task as "Complete" until you verify these checks manually or via automated test runs. Provide terminal output as proof.
> **HUMANS:** Use this checklist before merging Agent-generated code.

## Code Quality & Safety

- [ ] No `any` types used (or strictly justified with `unknown` and type guards).
- [ ] All new component props have explicit TypeScript interfaces exported alongside the component.
- [ ] No file uses a PascalCase filename (must be kebab-case).
- [ ] All internal imports use `@/` path alias — no relative `../../` imports from `src/`.
- [ ] Protected config files (`tailwind.config.ts`, `next.config.ts`, `tsconfig.json`) were NOT modified without permission.
- [ ] No existing tests were deleted or skipped.
- [ ] Component/function is modular and doesn't violate architecture boundaries (no DB calls from components, no API calls without TanStack Query).

## Execution & Testing

- [ ] Application compiles without fatal errors (`yarn build`).
- [ ] Linter passes with zero errors (`yarn lint`).
- [ ] Formatter passes (`yarn format` produces no changes).
- [ ] No new TypeScript errors introduced.
- [ ] Feature works on mobile viewport (375px width) — no horizontal overflow, no broken layout.
- [ ] Feature works on desktop viewport (1280px width).
- [ ] Dark mode visually correct — all text/backgrounds/borders have `dark:` variants.
- [ ] Touch targets ≥ 44×44px on interactive elements (mobile check).

## Manga Go Specific Checks

- [ ] New UI components include responsive variants (mobile-first Tailwind classes).
- [ ] New Zustand stores follow existing pattern: `devtools(persist(...))` with `partialize` and explicit action names.
- [ ] New TanStack Query hooks use the key conventions from `src/lib/query-keys.ts`.
- [ ] Auth-required actions either use `<PermissionGate>` or the `usePermission` hook.
- [ ] New pages in `(main)/` route group are Server Components by default unless interaction/state is required.
- [ ] `'use client'` directive is present on any component that uses hooks, stores, or event listeners.
- [ ] New reader components are dynamically imported via `next/dynamic`.
- [ ] Any new image usage uses `next/image` with explicit `alt`, `sizes`, and `fill` or explicit dimensions.

## Artifact Handoff

- [ ] `MEMORY.md` updated with any new architectural decisions made during this task.
- [ ] Phase checklist in `MEMORY.md` updated to reflect completed items.
- [ ] Any resolved bugs added to "Known Issues" section in `MEMORY.md` with date and resolution.
