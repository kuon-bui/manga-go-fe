# Component Guidelines — Manga Go

> Reference for all UI/animation standards. Inspired by analysis of Komikku (premium Android manga reader) and applied to web context.

---

## Animation Philosophy

**Goal:** Feel like a native app, not a WordPress site.  
**Rule:** Every state change should be communicated visually. Never show a blank div where a skeleton should be.

### Entrance Animations
Use Tailwind `animate-in` utilities from `tailwindcss-animate`:

```tsx
// Section entrance — fade + slide up
<div className="animate-in fade-in slide-in-from-bottom-4 duration-300">

// Card stagger — add delay via inline style
{items.map((item, i) => (
  <div key={item.id} className="animate-in fade-in duration-300" style={{ animationDelay: `${i * 50}ms` }}>
```

### Hover Effects (Cards)
All interactive cards use a **lift + shadow** pattern:

```tsx
// Standard card hover
className="transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"

// Cover image zoom on hover
className="object-cover transition-transform duration-300 group-hover:scale-105"
```

### Skeleton Loaders
Use shadcn `Skeleton` component. Match the exact shape of the real content — never use a generic gray rectangle.

```tsx
// Manga card skeleton — matches 2:3 cover ratio
<div className="flex flex-col gap-1.5">
  <Skeleton className="aspect-[2/3] w-full rounded-lg" />
  <Skeleton className="h-3.5 w-full" />
  <Skeleton className="h-3 w-2/3" />
</div>
```

### Page Transitions (Reader)
Use CSS transitions for page changes in the reader — no animation libraries needed:

```tsx
// Fade between pages
<div className="transition-opacity duration-150 ease-in-out">
```

---

## Manga Card Standards

### Card Variant (`variant="card"`)
- Cover: `aspect-[2/3]`, `overflow-hidden rounded-lg`
- Cover image: `group-hover:scale-105 transition-transform duration-300`
- Overlay gradient: visible on hover (`opacity-0 group-hover:opacity-100`)
- **Rank badge** (for trending): Large number overlay, top-left, semi-transparent bg
- **Status dot**: `h-1.5 w-1.5 rounded-full` with color per status
- **NEW badge**: `bg-red-500 text-white text-[9px] px-1 rounded` — shown when updated < 24h
- **Chapter badge**: Shows on hover, slides up from bottom

### List Variant (`variant="list"`)
- Cover thumbnail: `w-14 h-20`, `rounded-md`
- Hover: `hover:border-primary/30 hover:bg-accent`

### Reading Progress Overlay
When reading progress is available (Library context):
```tsx
// Bottom of card cover
<div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black/30">
  <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
</div>
```

---

## Section Layouts

### Home Page Sections
Each section follows this structure:
```tsx
<section className="space-y-4">
  {/* Section header */}
  <div className="flex items-center justify-between">
    <h2 className="flex items-center gap-2 text-lg font-bold">
      <Icon className="h-5 w-5 text-primary" />
      Section Title
    </h2>
    <Link href="..." className="flex items-center gap-0.5 text-sm text-muted-foreground hover:text-primary transition-colors">
      Xem thêm <ChevronRight className="h-4 w-4" />
    </Link>
  </div>
  {/* Content */}
</section>
```

### Trending Row — Horizontal Scroll
Trending must use a **horizontal scroll row** with rank numbers, not a grid. This is the #1 pattern that makes manga sites feel premium:

```tsx
<div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
  {items.map((manga, i) => (
    <div key={manga.id} className="relative shrink-0 w-32 sm:w-36 snap-start">
      {/* Rank number */}
      <span className="absolute -left-1 bottom-8 z-10 text-5xl font-black leading-none text-white/20 select-none">
        {i + 1}
      </span>
      <MangaCard manga={manga} />
    </div>
  ))}
</div>
```

### Recently Updated — Chapter-Focused Layout
Show the most recent chapter prominently. Add a NEW badge when chapter < 24h old:

```tsx
// Show "NEW" if updated within 24h
const isNew = Date.now() - new Date(manga.lastChapterAt).getTime() < 86_400_000
```

---

## Genre Chips

Genre chips use a **color-per-category** system for visual scanning:

```tsx
const GENRE_COLORS: Record<string, string> = {
  action: 'bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-500/20',
  romance: 'bg-pink-500/10 text-pink-600 hover:bg-pink-500/20 border-pink-500/20',
  fantasy: 'bg-purple-500/10 text-purple-600 hover:bg-purple-500/20 border-purple-500/20',
  comedy: 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-yellow-500/20',
  drama: 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-500/20',
  horror: 'bg-gray-500/10 text-gray-600 hover:bg-gray-500/20 border-gray-500/20',
  // default fallback
  _default: 'bg-primary/10 text-primary hover:bg-primary/20 border-primary/20',
}
```

---

## Reader UI Standards

### Tap Zone Architecture
The reader click overlay must be split into **3 zones** — never a single full-screen toggle:

```
[ PREV (25%) ] [ TOGGLE UI (50%) ] [ NEXT (25%) ]
```

```tsx
<div className="absolute inset-0 z-10 flex">
  <div className="w-1/4 cursor-pointer" onClick={onPrev} />          {/* prev */}
  <div className="flex-1 cursor-pointer" onClick={onToggleUI} />     {/* toggle */}
  <div className="w-1/4 cursor-pointer" onClick={onNext} />          {/* next */}
</div>
```

### Progress Bar (replaces dot indicators)
Use a full-width slider for chapters with any page count:

```tsx
<input
  type="range"
  min={0}
  max={totalPages - 1}
  value={currentPage}
  onChange={(e) => goToPage(Number(e.target.value))}
  className="w-full accent-primary"
/>
```

### Controls Slide Animation
Controls slide in/out smoothly rather than opacity toggle:

```tsx
// Top bar
className={cn(
  'absolute top-0 left-0 right-0 z-20 transition-transform duration-200',
  visible ? 'translate-y-0' : '-translate-y-full'
)}

// Bottom bar  
className={cn(
  'absolute bottom-0 left-0 right-0 z-20 transition-transform duration-200',
  visible ? 'translate-y-0' : 'translate-y-full'
)}
```

---

## Loading States

### Rules
1. **Always show skeletons** — never blank space while loading
2. **Match skeleton shape** to the final content exactly
3. **Shimmer** is handled automatically by shadcn `Skeleton` (uses `animate-pulse`)
4. **Error states** — always show a retry or helpful message, never just nothing

### Error Empty State Pattern
```tsx
<div className="flex flex-col items-center gap-3 py-12 text-center">
  <AlertCircle className="h-10 w-10 text-muted-foreground/40" />
  <p className="text-sm text-muted-foreground">Không thể tải nội dung.</p>
  <Button variant="outline" size="sm" onClick={refetch}>Thử lại</Button>
</div>
```

---

## Dark Mode Rules

- Every bg/text/border color must have a `dark:` variant
- Never use raw hex colors — always use CSS variable tokens (`bg-background`, `text-foreground`, etc.)
- Reader background is always `bg-black` (not dark mode adaptive — intentional for immersion)
- Skeleton component is already dark-mode aware

---

## Typography Scale

| Use case | Classes |
|---|---|
| Section heading | `text-lg font-bold text-foreground` |
| Card title | `text-[13px] font-semibold leading-snug` |
| Caption / metadata | `text-[11px] text-muted-foreground` |
| Badge label | `text-[10px] font-semibold uppercase tracking-wide` |
| Body copy | `text-sm leading-relaxed text-foreground` |

---

## Mobile-First Checklist

Before marking any component done:
- [ ] Base classes target mobile (no `sm:` prefix on the base layout)
- [ ] `sm:` or `md:` breakpoints added for wider layouts  
- [ ] Touch targets are ≥ 44px tall (buttons, links)
- [ ] Horizontal scrolls use `overflow-x-auto scrollbar-none`
- [ ] `pb-16` or `pb-20` on main content to clear bottom nav on mobile
