# Testing Strategy — Manga Go Frontend

## Frameworks

| Type | Tool | Status |
|---|---|---|
| **Unit Tests** | Vitest (to be added) | Not yet set up |
| **Component Tests** | Vitest + React Testing Library | Not yet set up |
| **E2E Tests** | Playwright (to be added) | Not yet set up |
| **Type Check** | `tsc --noEmit` via `yarn build` | Available now |
| **Lint** | ESLint via `yarn lint` | Available now |
| **Format** | Prettier via `yarn format` | Available now |

## Setup Commands (When Adding Tests)

```bash
# Unit + Component testing
yarn add -D vitest @vitejs/plugin-react @testing-library/react @testing-library/user-event jsdom

# E2E testing  
yarn add -D @playwright/test
npx playwright install
```

## Rules & Requirements

1. **Before marking any task complete:** run `yarn lint` and `yarn build`. Both must pass.
2. **Never skip tests** to make a pipeline green. If a test breaks, fix the code — don't delete the test.
3. **New utilities in `src/lib/`** should have unit tests covering edge cases.
4. **New Zustand stores** should be tested: action changes state, partialize persists correct fields.
5. **Critical user flows** (login, follow/unfollow, chapter navigation) require integration tests once E2E is set up.
6. **Reader components** require a visual check: launch dev server and manually verify in browser.

## Current Verification Loop (Pre-Test Framework)

Since tests aren't set up yet, the verification loop is:

```bash
yarn lint       # Must output: "No linting errors found"
yarn format     # Must produce no changes (already formatted)
yarn build      # Must complete without TypeScript or build errors
```

Then manual browser check:
1. Open `localhost:3000` in Chrome
2. Resize to 375px width (mobile DevTools)
3. Verify the feature works, no horizontal overflow, no broken layout
4. Switch to dark mode, verify colors are correct
5. Resize to 1280px (desktop), verify layout

## Test File Locations (Future)

```
src/
├── components/
│   └── ui/
│       ├── button.tsx
│       └── button.test.tsx       ← colocate with component
├── lib/
│   ├── utils.ts
│   └── utils.test.ts             ← colocate with utility
└── stores/
    ├── use-auth-store.ts
    └── use-auth-store.test.ts    ← colocate with store
```

## Manual Test Checklist Per Feature

For each feature delivered, verify:

- [ ] Works on 375px mobile (Chrome DevTools)
- [ ] Works on 1280px desktop
- [ ] Works in dark mode
- [ ] No console errors or warnings
- [ ] `yarn lint` passes
- [ ] `yarn build` passes
- [ ] Interactive states (hover, focus, loading, error) are present
- [ ] Touch targets ≥ 44px on mobile interactive elements

## Pre-Commit Hook (To Add)

Once `husky` is configured:

```bash
yarn add -D husky lint-staged
npx husky init
```

`.husky/pre-commit`:
```bash
#!/bin/sh
yarn lint
yarn format --check
```

Until then, run manually before each commit.
