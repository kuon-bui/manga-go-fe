# CLAUDE.md — Claude Code Configuration for Manga Go

## Project Context

**App:** Manga Go — Manga & Light Novel reading platform  
**Stack:** Next.js 15 App Router · React 19 · TypeScript 5.8 (strict) · Tailwind CSS 3.4 · shadcn/ui · Zustand 5 · TanStack Query · Yarn  
**Stage:** MVP Development — Frontend only (Go backend is a separate service)  
**User Level:** Developer (B)

## Directives

1. **Master Plan:** Always read `AGENTS.md` first. It contains the current phase, all conventions, and protected areas.
2. **Documentation:** Refer to `agent_docs/` for tech stack details, code patterns, product requirements, and testing guides.
3. **Plan-First:** Use Plan Mode for tasks touching more than one file. Propose a brief step-by-step plan and wait for approval before coding.
4. **Incremental Build:** Build one small, testable feature at a time. Do not sweep multiple features in one session.
5. **Verify After Each Change:** Run `yarn lint` and `yarn build` after each feature. Fix all failures before proceeding.
6. **Pre-Commit:** Run `yarn lint && yarn format --check` before committing. Fix failures — do not bypass hooks.
7. **No Feature Creep:** Do NOT add features outside the current phase listed in `AGENTS.md`.
8. **Update Memory:** Write any new architectural decisions to `MEMORY.md` and update the phase checklist.

## Commands

```bash
yarn dev        # Start dev server (localhost:3000)
yarn build      # Production build + type check
yarn lint       # ESLint check (must pass with 0 errors)
yarn format     # Prettier format (run before committing)
```

## Critical Rules (Enforced)

- `any` type is **FORBIDDEN** — use `unknown` + type guards or precise interfaces
- File names are **kebab-case** only (`manga-card.tsx` — never `MangaCard.tsx`)
- Imports always use `@/` path alias (never relative `../../`)
- All components must have `dark:` Tailwind variants for colors/backgrounds/borders
- Responsive design is **mobile-first** — base classes = mobile, scale up with `sm:` `md:` `lg:`
- Server Components by default — only add `'use client'` when genuinely needed
- Zustand for UI state; TanStack Query for all server/API data — never `useEffect` + `fetch` for API calls

## What NOT To Do

- Do NOT delete files without explicit confirmation
- Do NOT modify `tailwind.config.ts`, `next.config.ts`, `tsconfig.json`, or `.github/` workflows without asking
- Do NOT add features outside the current phase
- Do NOT write `any` types — ever
- Do NOT use relative imports from inside `src/`
- Do NOT use PascalCase for file names
- Do NOT use `useEffect` for data fetching — use TanStack Query
- Do NOT add new npm/yarn packages without checking `package.json` first and getting approval

## Key Reference Files

| Need | File |
|---|---|
| Phase roadmap + agent rules | `AGENTS.md` |
| Current phase + decisions | `MEMORY.md` |
| Before marking done | `REVIEW-CHECKLIST.md` |
| What to build | `docs/frontend-prd.md` |
| How to build it | `docs/frontend-tech-design.md` |
| Component patterns | `docs/COMPONENT_GUIDELINES.md` |
| State patterns | `docs/STATE_MANAGEMENT.md` |
| Tech stack + code templates | `agent_docs/tech_stack.md` |
| Feature list (compact) | `agent_docs/product_requirements.md` |
| Testing strategy | `agent_docs/testing.md` |
