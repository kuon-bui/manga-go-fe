# Plan: Redesign UI sang theme Sakura Kawaii (pastel)

## Context

Hiện tại app dùng palette blue/navy (light) + 5 variant dark (dark/midnight/sepia/slate/forest), border-radius nhỏ (8px), system font. 4 file thiết kế reference yêu cầu chuyển sang phong cách **pastel kawaii**: hồng đào làm chủ đạo, lavender + mint làm phụ, bo tròn rất mạnh, soft shadow, decorative patterns (hearts/stars/sparkles).

User quyết định:
- **Scope theme**: tạo 2 theme mới `sakura-light` + `sakura-dark`, **xóa toàn bộ theme cũ** (light/dark/midnight/sepia/slate/forest).
- **Mascot**: không dùng chibi illustration — chỉ icon lucide (Heart/Star/Sparkles) + soft gradient blob + dotted pattern.
- **Order**: triển khai phân lớp theo 5 phase (tokens → primitives → layout → content pages → reader/dashboard/auth).
- **Font**: thêm **Nunito** qua `next/font/google`.

Giữ nguyên toàn bộ API cũ. Cuối plan có danh sách API mới cần backend bổ sung.

---

## Design tokens (sakura-light / sakura-dark)

Thay toàn bộ block CSS variables trong `src/app/globals.css`. Giá trị HSL đề xuất:

### `:root` (sakura-light, default)
```
--background: 340 60% 99%;   /* #FFFAFB pink-white */
--foreground: 335 35% 22%;   /* #4B2A36 mauve */
--card: 0 0% 100%;
--card-foreground: 335 35% 22%;
--popover: 0 0% 100%;
--popover-foreground: 335 35% 22%;
--primary: 340 82% 70%;      /* #F48FB1 sakura pink */
--primary-foreground: 0 0% 100%;
--secondary: 280 65% 94%;    /* #EDE1F4 soft lavender */
--secondary-foreground: 280 40% 30%;
--muted: 340 40% 96%;        /* #FBECF2 */
--muted-foreground: 335 15% 50%;
--accent: 160 55% 90%;       /* #D7F2E6 mint */
--accent-foreground: 160 50% 25%;
--destructive: 0 78% 68%;    /* #F07777 soft red */
--destructive-foreground: 0 0% 100%;
--border: 340 45% 91%;       /* #F2DAE3 */
--input: 340 45% 93%;
--ring: 340 82% 70%;
--radius: 1rem;              /* 16px — bo mạnh hơn */
--chart-1..5: pastel rotation (pink/lavender/mint/peach/yellow)
```

### `.dark` (sakura-dark)
```
--background: 300 22% 10%;   /* #1F141D dusk purple */
--foreground: 340 30% 95%;
--card: 295 20% 14%;
--card-foreground: 340 30% 95%;
--popover: 295 20% 14%;
--popover-foreground: 340 30% 95%;
--primary: 340 82% 75%;      /* brighter pink trên nền tối */
--primary-foreground: 300 22% 10%;
--secondary: 285 22% 22%;
--secondary-foreground: 340 30% 95%;
--muted: 290 20% 20%;
--muted-foreground: 340 15% 72%;
--accent: 160 35% 30%;
--accent-foreground: 160 40% 92%;
--destructive: 0 70% 55%;
--destructive-foreground: 0 0% 98%;
--border: 285 22% 25%;
--input: 285 22% 25%;
--ring: 340 82% 75%;
```

Xoá toàn bộ `.midnight`, `.sepia-theme`, `.slate-theme`, `.forest-theme` block.

---

## Phase 1 — Design tokens + Font + Theme store

**Target**: app load được, hiển thị bằng màu mới nhưng chưa đổi component layout.

Files:
- `src/app/globals.css` — thay 2 block `:root` / `.dark` như trên; xoá 4 theme cũ; giữ các custom utility và reset.
- `tailwind.config.ts` — bump `borderRadius.lg = 'var(--radius)'` (đã dùng var); thêm `xl: 'calc(var(--radius) + 0.25rem)'`, `2xl: 'calc(var(--radius) + 0.5rem)'`; thêm `fontFamily.sans: ['var(--font-nunito)', ...fallback]`; thêm `boxShadow.sakura = '0 8px 24px -8px hsl(340 82% 70% / 0.3)'` + `boxShadow['sakura-sm']`.
- `src/app/layout.tsx` — import Nunito qua `next/font/google`, set `variable: '--font-nunito'` + gắn vào `<html className={nunito.variable}>`.
- `src/stores/theme-store.ts` — cắt `THEME_OPTIONS` xuống còn `sakura-light`, `sakura-dark`, `system`; cập nhật `THEME_CLASS` map (`sakura-light: ''`, `sakura-dark: 'dark'`); đổi type `Theme` union.
- `src/components/providers/theme-provider.tsx` — đơn giản hoá `applyThemeClasses` (chỉ toggle class `dark`).
- `src/components/layout/theme-toggle.tsx` — còn 2 option + System; swatch preview dùng pink/plum.
- `MEMORY.md` — ghi chú đã rút còn 2 theme.

Verify: `yarn dev`, mở home → thấy toàn bộ nền hồng nhạt, chữ mauve; toggle dark → sang tím đậm + hồng sáng.

---

## Phase 2 — Primitives (shadcn/ui)

**Target**: mọi Button/Card/Badge/Input tự động cute hơn mà không cần sửa từng page.

Files:
- `src/components/ui/button.tsx` — base class đổi `rounded-md` → `rounded-full`; `shadow` → `shadow-sakura-sm hover:shadow-sakura`; giữ các variant, thêm variant `soft: 'bg-primary/15 text-primary hover:bg-primary/25'`; size `lg: 'h-11 px-6'`.
- `src/components/ui/card.tsx` — `rounded-xl` → `rounded-2xl`; `shadow` → `shadow-sakura-sm`; `border` giữ nguyên (dùng token mới).
- `src/components/ui/badge.tsx` — đổi hardcoded `bg-blue-100`/`bg-purple-100`… sang pastel:
  - `ongoing: bg-[hsl(160_55%_90%)] text-[hsl(160_50%_25%)] dark:bg-[hsl(160_40%_25%)]/60 dark:text-[hsl(160_55%_85%)]`
  - `completed: bg-[hsl(220_70%_92%)] text-[hsl(220_60%_35%)] dark:...`
  - `hiatus: bg-[hsl(40_90%_88%)] text-[hsl(30_70%_35%)] dark:...`
  - `cancelled: bg-[hsl(0_78%_92%)] text-[hsl(0_60%_40%)] dark:...`
  - `manga: bg-[hsl(340_80%_92%)] text-[hsl(340_60%_38%)] dark:...`
  - `novel: bg-[hsl(280_65%_92%)] text-[hsl(280_50%_38%)] dark:...`
  - Đổi `rounded-md` → `rounded-full`, tăng `px-3 py-0.5`.
- `src/components/ui/input.tsx`, `textarea.tsx` — `rounded-md` → `rounded-xl`, focus ring `ring-primary/40`.
- `src/components/ui/dialog.tsx`, `sheet.tsx`, `dropdown-menu.tsx` — content `rounded-2xl`, `shadow-sakura`.
- `src/components/ui/genre-chip.tsx` — đã pill; đổi variant màu sang `bg-secondary text-secondary-foreground hover:bg-primary/20`.
- `src/components/ui/star-rating.tsx` — star dùng `text-primary` thay vì yellow hardcoded (nếu có).

Verify: mở Storybook-less — Browse page sẽ cho xem được toàn bộ card/badge/button đổi hình.

---

## Phase 3 — Layout shell (Header, BottomNav, Theme toggle, Notification)

**Target**: khung app (fixed header + bottom nav mobile) đúng tone kawaii.

Files:
- `src/components/layout/header.tsx`:
  - Bỏ logic `text-white` khi trong suốt; thay bằng transparent hover → khi scroll thì `bg-background/80 backdrop-blur-xl border-b border-border/60 shadow-sakura-sm`.
  - Logo: bên cạnh text thêm icon `Sparkles` từ lucide với `text-primary`.
  - Search: `rounded-full bg-muted border border-border`, focus ring `ring-primary/30`.
  - Nav link active: `bg-primary/15 text-primary rounded-full`.
- `src/components/layout/bottom-nav.tsx`:
  - Chuyển từ full-width bar sang **floating pill**: `mx-3 mb-3 rounded-full border border-border bg-background/95 backdrop-blur-xl shadow-sakura` + `bottom-0` offset.
  - Active icon: circle background `bg-primary/15 text-primary` thay vì chỉ đổi màu stroke.
- `src/components/layout/theme-toggle.tsx` — đã cập nhật ở Phase 1.
- `src/components/layout/notification-bell.tsx`, `notification-panel.tsx` — dot badge `bg-primary`, panel `rounded-2xl shadow-sakura`.

Verify: toggle theme, mobile view bottom nav nổi lên trên nền hồng nhẹ; desktop header trong suốt trên home → scroll xuống có blur.

---

## Phase 4 — Home + Manga Detail (trang visible nhất)

**Target**: 2 trang người dùng nhìn nhiều nhất giống mock 1, 2, 3.

Files:
- `src/app/(main)/page.tsx` — tăng `space-y-12`, bọc section trong decorative `relative` container.
- `src/components/home/hero-section.tsx`:
  - Gradient blob: thay `bg-primary/15` → gradient pink→lavender `bg-gradient-to-br from-[hsl(340_82%_80%)]/40 via-[hsl(280_65%_88%)]/30 to-transparent`.
  - Xoá hardcoded violet/rose gradient trên genre cards; dùng `bg-primary/20`, `bg-secondary`, `bg-accent`.
  - Thêm scatter sparkle icon (lucide `Sparkles` + `Star` + `Heart`) absolute positioned, rotation ngẫu nhiên cố định, opacity thấp.
  - CTA button: `size="lg"` + `rounded-full` + shadow-sakura.
- `src/components/home/trending-section.tsx`:
  - Nền blurred cover giữ, overlay đổi `from-background via-background/60 to-transparent` (đã dùng token).
  - Arrow button: `bg-background/80 backdrop-blur-md text-foreground border border-border`, không còn `bg-black/50 text-white`.
  - Dots active: `bg-primary w-6`, inactive `bg-muted w-1.5`.
- `src/components/home/latest-updates-section.tsx`, `recently-added-section.tsx`, `completed-section.tsx`, `recently-updated-section.tsx`, `trending-section.tsx` — section header: icon tròn `bg-primary/15 text-primary rounded-full p-2` bên trái tiêu đề; "View all" link dạng pill.
- `src/components/home/genre-section.tsx` — dù đã gỡ khỏi home, giữ lại cho browse; chuyển chip sang pastel rotation.
- `src/components/manga/manga-card.tsx`:
  - Cover: `rounded-md` → `rounded-2xl shadow-sakura-sm group-hover:shadow-sakura`.
  - Status dot: ongoing dùng `bg-[hsl(160_55%_55%)]` (mint đậm) thay green-500; completed `bg-[hsl(220_70%_65%)]`; hiatus `bg-[hsl(40_90%_65%)]`; cancelled `bg-primary`.
  - Badge type: dùng `Badge variant="manga|novel"` (đã pastel ở Phase 2) thay inline `bg-blue-600/90`.
  - Rating pill: `bg-background/70 backdrop-blur-md text-foreground` thay `bg-black/60 text-white`.
  - Latest chapter slide-up: `bg-primary/90 text-primary-foreground` (đã tokenized — chỉ đảm bảo primary là pink).
  - List variant: `rounded-2xl`, hover `hover:border-primary/40 hover:bg-primary/5`.
- `src/components/manga/manga-grid.tsx` — giữ grid, bump `gap-4`.
- `src/components/title/title-hero.tsx`:
  - Cover `rounded-xl` → `rounded-2xl shadow-sakura`.
  - Genres pill: đã dùng `rounded-full border border-border`; đổi hover `hover:bg-primary/15 hover:border-primary/40`.
  - Action buttons: Follow → `variant="soft"` (Phase 2) với Heart icon; Start Reading → `variant="default"` rounded-full to gradient-friendly.
- `src/components/title/title-synopsis.tsx` — card `rounded-2xl`, heading có icon nhỏ pink.
- `src/components/title/chapter-list.tsx`:
  - Container `rounded-2xl border`.
  - Row hover: `hover:bg-primary/5`.
  - "NEW" badge: `bg-primary text-primary-foreground rounded-full px-2`.
  - Group name màu `text-primary` → giữ.
  - Thêm placeholder icon `Bookmark` bên phải mỗi row (UI-only, chờ API Phase N — xem mục API mới).
- `src/components/title/title-detail-view.tsx` — translation group card `bg-primary/10 border-primary/30 rounded-2xl`.
- `src/components/title/rating-modal.tsx` — đã dùng token, chỉ update padding/radius.

Verify: trang home và trang `/titles/[id]` có cảm giác hồng nhạt, bo tròn, shadow mềm; không còn bất kỳ `bg-black/*` hay `text-white` hardcoded.

---

## Phase 5 — Reader + Library + Dashboard + Browse + Search + Auth + Admin + Comments

**Target**: toàn bộ page còn lại đồng bộ; reader hỗ trợ theme đúng cách.

### Reader (refactor lớn nhất của phase)
- `src/components/reader/manga/manga-reader.tsx`:
  - Root container `bg-black` → dùng CSS variable `--reader-bg` (copy pattern từ novel-reader).
  - Inject CSS vars theo `readerMode` trong manga-viewer-store: thêm state `readerTheme: 'day' | 'night' | 'sepia'`. Day = sakura-light pastel, Night = sakura-dark, Sepia = warm beige (giữ 1 chế độ dark cho đọc).
- `src/components/reader/manga/manga-controls.tsx`:
  - Top bar: `bg-black/80` → `bg-background/85 backdrop-blur-xl border-b border-border shadow-sakura-sm`.
  - Tất cả `text-white/80`, `text-white/50` → `text-foreground`, `text-muted-foreground`.
  - `bg-white/10`, `border-white/15` → `bg-muted hover:bg-muted/60`, `border-border`.
  - Mode switcher: pill container `bg-muted rounded-full p-1`, active `bg-primary text-primary-foreground shadow-sakura-sm`.
  - **Thêm** icon `Bookmark` (toggle), `Settings` (mở settings panel mới), `Maximize` (fullscreen) để match reference 2, 3, 4.
- `src/components/reader/manga/single-page-view.tsx`, `double-page-view.tsx`, `vertical-scroll-view.tsx`:
  - Comment button: `bg-black/60 hover:bg-black/90 border-white/20 text-white` → `bg-background/80 backdrop-blur-md border-border text-foreground shadow-sakura-sm`.
  - `text-white` (vertical-scroll chapter comments heading) → `text-foreground`.
- `src/components/reader/manga/toc-drawer.tsx`, `comments-drawer.tsx` — Sheet content `rounded-l-3xl`, row hover `hover:bg-primary/5`.
- **Mới**: `src/components/reader/manga/settings-panel.tsx` (song song novel-settings-panel.tsx) — slide-in right, slider brightness, theme switch (Day/Night/Sepia), layout (LTR/RTL), fit (width/height/original). Chỉ dùng `manga-viewer-store` mở rộng; không đụng API.
- `src/components/reader/novel/novel-reader.tsx`:
  - `THEME_VARS.day` đổi sang pastel: `{ '--reader-bg': '#FFFAFB', '--reader-text': '#4B2A36', '--reader-surface': '#FBECF2' }`.
  - `night`: `{ '--reader-bg': '#1F141D', '--reader-text': '#F7E7EE', '--reader-surface': '#2E1E2C' }`.
  - `sepia`: giữ như cũ.
- `src/components/reader/novel/novel-nav-bar.tsx`, `novel-settings-panel.tsx` — tokenize color, rounded, match header mới.

### Library / Dashboard / Browse / Search / Profile / Auth / Admin / Comments
Sửa chung pattern (không list từng dòng):
- Thay `rounded-md/lg/xl` → `rounded-2xl` cho container lớn, `rounded-full` cho button/pill/chip/avatar background.
- Thay `bg-blue-*`, `bg-purple-*`, `bg-gray-*` hardcoded (nếu có) → semantic token.
- Shadow dùng `shadow-sakura-sm`/`shadow-sakura`.
- Empty state: icon trong circle `bg-primary/15` thay neutral border-dashed.

Files cần sửa:
- `src/components/library/library-view.tsx`, `reading-history-tab.tsx` — tab pill, category count badge pastel.
- `src/components/dashboard/dashboard-home.tsx` — stats card `rounded-2xl`, icon circular pastel; table header pastel row.
- `src/components/dashboard/upload-title-form.tsx`, `upload-chapter-view.tsx`, `manga-page-uploader.tsx`, `novel-chapter-editor.tsx`, `title-management-view.tsx`, `title-edit-modal.tsx`, `group-management-view.tsx`.
- `src/components/browse/browse-view.tsx`, `src/components/search/search-view.tsx`, `search-filter-panel.tsx`.
- `src/components/profile/settings-view.tsx`, `avatar-crop-modal.tsx`.
- `src/app/(auth)/layout.tsx` + 4 pages (login/register/forgot/reset) — thêm gradient blob background pink + lavender.
- `src/components/admin/*.tsx` (4 file) — table/card rounded + pastel row hover.
- `src/components/comments/comment-section.tsx`, `comment-item.tsx`, `comment-input.tsx` — avatar ring pink, reaction button pill.
- `src/components/groups/group-detail-view.tsx`.

Verify: khi chạy `yarn dev`, đi tuần tự qua:
1. `/` home (2 theme)
2. `/browse`, `/search`
3. `/titles/[id]`, `/read/manga/[slug]/[ch]` (test đủ 3 mode), `/read/novel/...`
4. `/library`, `/profile`, `/settings`
5. `/dashboard`, `/dashboard/upload/title`, `/dashboard/groups/[id]`
6. `/admin`, `/admin/users`, `/admin/roles`
7. `/login`, `/register`
Không còn hardcoded `bg-black`, `text-white`, `bg-blue-600`, `bg-purple-600` không intent (grep toàn repo).

---

## Files critical (ưu tiên đọc trước khi code)

| File | Lý do |
|---|---|
| `src/app/globals.css` | Nguồn của mọi token |
| `tailwind.config.ts` | Phải approve sửa (CLAUDE.md quy định) |
| `src/stores/theme-store.ts` + `theme-provider.tsx` | Cắt theme cũ |
| `src/components/ui/button.tsx`, `card.tsx`, `badge.tsx` | Primitives lan tỏa khắp app |
| `src/components/manga/manga-card.tsx` | Xuất hiện trên ~10 trang |
| `src/components/reader/manga/manga-controls.tsx` + 3 view | Reader có nhiều hardcoded dark |
| `src/components/layout/header.tsx`, `bottom-nav.tsx` | Persistent shell |

## Reuse từ code hiện có

- Pattern `THEME_VARS` + inline style trong [novel-reader.tsx](src/components/reader/novel/novel-reader.tsx) → copy cho manga-reader.
- `applyThemeClasses` trong [theme-provider.tsx](src/components/providers/theme-provider.tsx) → đơn giản hoá, không viết lại.
- `cn()` helper ở `src/lib/utils.ts` — dùng để compose class.
- Badge CVA variants (manga/novel/ongoing/...) → chỉ đổi màu, giữ API.
- `useImagePreloader` hook — không thay đổi.
- `useThemeStore`, `useAuthStore`, `usePermission` — logic giữ nguyên.
- MSW mocks (follow/rating/notifications) — không đụng.

---

## New APIs cần backend bổ sung

Những feature trong 4 reference mà API hiện tại không đáp ứng được. Ghi vào `docs/missing-api.md` (đã có file này từ 2026-04-18):

1. **Bookmark chapter / page**
   - `POST /bookmarks` body `{ chapterId, pageIndex? }`
   - `DELETE /bookmarks/{id}`
   - `GET /users/me/bookmarks?comicSlug=...` → list
   - Reference: icon bookmark trên reader bottom bar (mock 3, 4) và trên title detail (mock 2).

2. **User reading stats**
   - `GET /users/me/stats` → `{ monthlyChaptersRead, totalHoursRead, mangaInLibrary, downloadsCount, topGenres: [{slug, count}] }`
   - Reference: khối "Reading Stats" trong dashboard (mock 1, 4).

3. **Chapter volume grouping** (có thể dùng field hiện có nếu BE đã có)
   - Cần confirm `Chapter` DTO có field `volumeNumber?: number` + optional `volumeTitle`.
   - `GET /comics/{slug}/chapters?groupByVolume=true` hoặc frontend tự group theo `volumeNumber`.
   - Reference: "Volume 1 (Ch. 1-20)" collapsible section (mock 2).

4. **Offline download chapter** (flag, chưa MVP)
   - `GET /chapters/{id}/download` → zip pages hoặc pre-signed URLs.
   - Reference: icon download per row (mock 3). **Đề xuất defer**, chỉ ẩn icon ở UI.

5. **User reading progress aggregation** (continue reading với %)
   - Đã có `PATCH /chapters/{id}/mark-as-read` — cần thêm `progress` (0-100) để lưu vị trí đọc dở.
   - `GET /users/me/continue-reading` → `[{ manga, lastChapter, progressPercent, updatedAt }]`
   - Reference: progress bar trong "Continue Reading" card (cả 4 mock).

6. **Library categories** (Reading / Planned / Completed / Favourites)
   - Hiện chỉ có follow/unfollow. Cần `PATCH /follows/{comicId}` body `{ status: 'reading' | 'planned' | 'completed' | 'dropped' | 'favourite' }`.
   - Reference: tabs "My Reads / Reading Now / Favourites / Completed" (mock 3).

UI: những chức năng chưa có API sẽ hiển thị ở dạng **disabled placeholder** (tooltip "Coming soon") để không break layout.

---

## Verification (end-to-end)

Sau mỗi phase, user tự chạy (do `yarn lint`/`yarn build` bị block trong session):

```bash
yarn lint
yarn build
yarn dev
```

Smoke test theo phase:
- **P1**: `<html>` có class `dark` khi chọn dark; font-family dùng Nunito (DevTools → Computed).
- **P2**: Button/Badge/Card hiển thị đúng mới; không regresses focus/disabled state.
- **P3**: Header scroll animation still works; bottom nav không đè content (padding `pb-20` ở `<main>`).
- **P4**: Home hero carousel + trending + 5 sections render, manga-card hover intact, title detail chapter list scroll virtual still works.
- **P5**: Reader click-to-toggle controls, mode switch, TOC/comments drawer; novel reader settings slider còn work; auth pages submit form không lỗi.

Grep cuối cùng (đảm bảo không còn hardcode):
```
grep -rn "bg-black" src/
grep -rn "text-white" src/
grep -rn "bg-blue-[0-9]" src/
grep -rn "bg-purple-[0-9]" src/
grep -rn "bg-zinc-" src/
grep -rn "midnight\|sepia-theme\|slate-theme\|forest-theme" src/
```
Kết quả kỳ vọng: 0 match ngoài intent (ví dụ `text-white` trên pastel primary button vẫn OK — review thủ công).

---

## Estimate

- Phase 1: ~30 phút (tokens + font wiring)
- Phase 2: ~45 phút (primitives)
- Phase 3: ~30 phút (layout)
- Phase 4: ~60 phút (home + detail — nhiều file)
- Phase 5: ~90–120 phút (reader refactor + ~20 file còn lại)

Tổng: ~5h coding thuần, chưa tính debug CSS edge-case.

---

## Out of scope (rõ ràng)

- Chibi mascot illustration (user chọn skip).
- Tính năng bookmark/reading-stats/library-categories thực sự hoạt động (chờ backend).
- Animation library (framer-motion) — giữ Tailwind animate hiện có.
- Responsive redesign hoàn toàn mới — giữ breakpoint cũ, chỉ adapt visual.
- i18n copywriting — giữ text hiện tại.
