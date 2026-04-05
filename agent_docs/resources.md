# Essential Resources — Manga Go Frontend

## Official Documentation

| Resource | URL | When to Use |
|---|---|---|
| Next.js 15 App Router | https://nextjs.org/docs/app | Routing, layouts, Server Components, metadata |
| React 19 | https://react.dev | Hooks, composition, Server/Client boundary |
| TypeScript | https://www.typescriptlang.org/docs | Type system, `unknown`, generics |
| Tailwind CSS | https://tailwindcss.com/docs | Utility classes, responsive, dark mode |
| Zustand 5 | https://zustand.docs.pmnd.rs | Store setup, devtools, persist middleware |
| TanStack Query | https://tanstack.com/query/latest | useQuery, useMutation, QueryClient setup |
| TanStack Virtual | https://tanstack.com/virtual/latest | Virtualizing chapter lists |

## Curated References

| Repository | Purpose |
|---|---|
| **PatrickJS/awesome-cursorrules** | Anti-vibe rule templates for AI coding assistants |
| **OneRedOak/claude-code-workflows** | Review workflow packs for Claude Code |
| **modelcontextprotocol/servers** | MCP server implementations |

## Key MCP Protocol Resources

- **MCP Protocol:** modelcontextprotocol.io
- **Playwright Testing:** playwright.dev/docs
- **AI Prompting Patterns:** See v0.dev system prompt patterns

## Manga Go Internal Docs

| Document | Purpose |
|---|---|
| `docs/frontend-prd.md` | Full product requirements, user flows, UX specs |
| `docs/frontend-tech-design.md` | Component architecture, theme system, store designs, API plan |
| `docs/ARCHITECTURE.md` | Tech stack, folder structure, routing, data flow |
| `docs/CODING_CONVENTIONS.md` | Naming rules, TypeScript, responsive patterns |
| `docs/COMPONENT_GUIDELINES.md` | Component structure templates, variant patterns, accessibility |
| `docs/STATE_MANAGEMENT.md` | Zustand store patterns, when to use Zustand vs Query |
| `agent_docs/tech_stack.md` | Stack versions, code templates, naming conventions |
| `agent_docs/product_requirements.md` | Compact feature list and user flows |
| `agent_docs/testing.md` | Test setup and verification loop |

## Patterns to Reference

### IntersectionObserver (Lazy Loading / Scroll Tracking)
```typescript
// Generic hook in src/hooks/use-intersection-observer.ts
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options?: IntersectionObserverInit
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      options
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, options]);
  return isIntersecting;
}
```

### Dynamic Import for Heavy Components
```typescript
import dynamic from 'next/dynamic';

const MangaViewer = dynamic(
  () => import('@/components/readers/manga/manga-viewer'),
  { loading: () => <ViewerSkeleton />, ssr: false }
);
```

### Optimistic Update with TanStack Query
See `docs/frontend-tech-design.md` Section 5.3 for the full follow/unfollow and comment patterns.

### Image Pre-fetching with `<link rel="preload">`
See `docs/frontend-tech-design.md` Section 3.4 for the `useImagePreloader` hook implementation.
