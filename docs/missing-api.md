# Missing API Endpoints & Field Extensions

This document lists all API endpoints and data fields that the frontend UI expects but the backend doesn't currently provide.

---

## 1. Comics Endpoint Enhancements

### 1.1 Sort & Filter Parameters

**Current:** `GET /comics` only supports `limit` and `page` parameters.

**Needed:** Add sorting and filtering support:

```http
GET /comics?limit=12&page=1&sortBy=lastChapterAt&order=desc
GET /comics?limit=12&page=1&sortBy=createdAt&order=desc
GET /comics?limit=12&status=completed
```

**Parameters:**
- `sortBy?: 'lastChapterAt' | 'createdAt' | 'rating' | 'followCount'` — Sort field
- `order?: 'asc' | 'desc'` — Sort direction (default: `desc`)
- `status?: 'ongoing' | 'completed' | 'hiatus' | 'cancelled'` — Filter by status
- `translationGroupSlug?: string` — Filter by translation group

**TypeScript:**
```typescript
interface ComicsListParams {
  limit?: number
  page?: number
  sortBy?: 'lastChapterAt' | 'createdAt' | 'rating' | 'followCount'
  order?: 'asc' | 'desc'
  status?: ContentStatus
  translationGroupSlug?: string
}
```

---

## 2. Manga (Comics) Response Field Extensions

### 2.1 Uploader Information

**Current:** `Manga` type has no uploader info.

**Needed:** Add uploader/submitter metadata:

```typescript
interface Manga {
  // ... existing fields ...
  uploadedBy?: {
    id: string
    name: string
    avatarUrl: string | null
  }
}
```

**Why:** Comic detail page needs to display who uploaded/submitted each comic.

### 2.2 Translation Group Population

**Current:** `Manga` returns `translationGroupId` only

**Needed:** Return expanded group object to prevent N+1 queries:

```typescript
interface Manga {
  // ... existing ...
  translationGroup?: {
    id: string
    name: string
    slug: string
    logoUrl?: string
  }
}
```

**Why:** Prevents N+1 queries on homepage; group info needed immediately for display (similar to how authors/genres/tags are populated).

### 2.3 Aggregated Stats

**Current:** `followCount`, `ratingCount`, `chapterCount` are optional and not returned by backend.

**Needed:** Include these stats in the response:

```typescript
interface Manga {
  // ... existing fields ...
  followCount: number       // Total follows
  ratingCount: number       // Total ratings submitted
  chapterCount: number      // Total chapters
  avgRating: number | null  // Average rating (0-5)
}
```

**Why:** Homepage and detail pages need these stats to display engagement metrics.

**TypeScript:**
```typescript
interface Manga {
  id: string
  slug: string
  title: string
  alternativeTitles?: string[]
  description?: string
  thumbnail?: string
  banner?: string
  type: 'manga' | 'novel'
  status: ContentStatus
  ageRating?: string
  isPublished: boolean
  isHot: boolean
  isFeatured: boolean
  publishedYear?: number
  lastChapterAt?: string
  artistId?: string
  authors: Author[]
  artist?: Author
  genres: Genre[]
  tags: Tag[]
  translationGroup?: {
    id: string
    name: string
    slug: string
  }
  uploadedBy?: {
    id: string
    name: string
    avatarUrl: string | null
  }
  followCount: number
  ratingCount: number
  chapterCount: number
  avgRating: number | null
  createdAt: string
  updatedAt: string
}
```

---

## 3. Translation Group Endpoints

### 3.1 Group Members List

**Current:** No endpoint to fetch group members.

**Needed:** New endpoint for member management:

```http
GET /translation-groups/:slug/members
```

**Response:**
```typescript
interface GroupMembersResponse {
  data: GroupMember[]
  total: number
}

interface GroupMember {
  id: string
  userId: string
  user: {
    id: string
    name: string
    avatarUrl: string | null
  }
  role: 'admin' | 'member'
  joinedAt: string
}
```

**Why:** Dashboard group management needs to display members and manage roles.

### 3.2 Group Logo Upload

**Current:** Groups have `logoUrl` but no endpoint to update it.

**Needed:** Add logo upload endpoint:

```http
PUT /translation-groups/:slug/logo
Content-Type: multipart/form-data

file: <binary image>
```

**Response:**
```typescript
interface UpdateLogoResponse {
  logoUrl: string
}
```

**Why:** Group settings/profile page needs ability to change group avatar.

---

## 4. Follow & Unfollow System

### 4.1 Follow Status

**Current Status:** Implemented but verify backend has these:

```http
GET /comics/:slug/follow-status
```

**Response:**
```typescript
interface FollowStatusResponse {
  isFollowed: boolean
}
```

### 4.2 Toggle Follow

**Current Status:** Implemented but verify backend has these:

```http
POST /comics/:slug/follow
DELETE /comics/:slug/follow
```

---

## 5. Ratings System

### 5.1 Get Comics Ratings

**Current Status:** Implemented (MSW mock), verify backend:

```http
GET /ratings/comics/:comicSlug
```

**Response:**
```typescript
interface UserRatingResponse {
  rating: number | null
  comment?: string
}
```

### 5.2 Submit Rating

**Current Status:** Implemented (MSW mock), verify backend:

```http
POST /ratings/comics/:comicSlug
Content-Type: application/json

{
  rating: 5,
  comment?: "Great series!"
}
```

---

## 6. Notifications Streaming (SSE)

### 6.1 Notifications Stream

**Current Status:** Stubbed with MSW mock.

**Needed:** Real Server-Sent Events support:

```http
GET /notifications/stream
```

**Event Format:**
```typescript
interface NotificationEvent {
  type: 'new_chapter' | 'comment_reply' | 'system'
  title: string
  body: string
  link?: string
  createdAt: string
}
```

**Why:** Real-time notifications for new chapters and user interactions.

---

## 7. Comments System

### 7.1 Comment Scopes & Endpoints

Frontend supports **3 comment locations** with different payloads:

#### 7.1.1 Comic-Level Comments (Title Detail Page)
Location: `/titles/{slug}` — comments on the entire manga/novel

**Query:**
```http
GET /comments?comicId={comicUUID}
```

**Create:**
```http
POST /comments
Content-Type: application/json

{
  "comicId": "f29cb385-4347-4461-84dd-f6cc5953367c",  // Use comic UUID, NOT slug or chapterId
  "content": "Great series!",
  "pageIndex": null,
  "parentId": null
}
```

⚠️ **BACKEND BUG:** Current API asks for `chapterId` even for comic-level comments. Should use `comicId` instead to avoid confusion.

#### 7.1.2 Chapter-Level Comments
Location: `/titles/{slug}/chapter/{chapterSlug}` — comments on entire chapter

**Query:**
```http
GET /comments?chapterId={chapterId}
```

**Create:**
```http
POST /comments
Content-Type: application/json

{
  "chapterId": "chapter-uuid",
  "content": "Great translation!",
  "pageIndex": null,           // Null for chapter-level
  "parentId": null
}
```

#### 7.1.3 Page-Specific Comments
Location: Manga reader page — comments on a specific page

**Query:**
```http
GET /comments?chapterId={chapterId}&pageIndex={pageIndex}
```

**Create:**
```http
POST /comments
Content-Type: application/json

{
  "chapterId": "chapter-uuid",
  "content": "Panel at page 5 is hilarious!",
  "pageIndex": 5,              // Specific page number
  "parentId": null
}
```

### 7.2 Comment Actions

**Current Status:** Implemented, verify backend has:

- `DELETE /comments/:id` — Delete comment
- `POST /comments/:id/reactions/:type` — Add/toggle reaction (e.g., `like`, `love`, `laugh`)
- `DELETE /comments/:id/reactions/:type` — Remove reaction

**Comment Type:**
```typescript
interface Comment {
  id: string
  content: string
  comicId?: string              // For comic-level comments
  chapterId?: string            // For chapter/page comments
  pageIndex?: number | null     // null = chapter-level, number = page-specific
  author: {
    id: string
    name: string
    avatarUrl?: string
  }
  parentId?: string             // For replies
  replies: Comment[]
  reactions: {
    type: string               // 'like', 'love', 'laugh', etc.
    count: number
    userReacted: boolean
  }[]
  createdAt: string
  updatedAt: string
}

interface CreateCommentPayload {
  comicId?: string              // For comic-level
  chapterId?: string            // For chapter/page-level
  content: string
  pageIndex?: number | null
  parentId?: string             // For replies
}
```

### 7.3 Frontend Implementation Plan

**Needed Components:**
1. `<CommentSection>` — Wrapper for all comment types
2. `<CommentList>` — Display comments with nesting (replies)
3. `<CommentForm>` — Text input + submit (with parent tracking for replies)
4. `<CommentCard>` — Individual comment with reactions + delete/reply buttons
5. `<ReactionBar>` — Like/love/laugh buttons

**Reply Flow (parentId):**

When user clicks "Reply" on a comment, pass the **comment's ID** as `parentId`:

```typescript
// CommentCard.tsx
<Button onClick={() => setReplyingTo(comment.id)}>
  Reply
</Button>

// CommentForm.tsx
const mutation = useAddComment(scope)

function handleSubmit(text: string) {
  mutation.mutate({
    content: text,
    parentId: replyingToId  // ← ID của comment được reply
  })
}
```

Backend sẽ tự động nest reply vào `replies[]` array của parent comment.

**Pages to Add:**
- `/titles/{slug}` → Add `<CommentSection comicId={slug} scope="comic" />`
- `/titles/{slug}/chapter/{chSlug}` → Add `<CommentSection chapterId={id} scope="chapter" />`
- Manga reader → Add `<CommentSection chapterId={id} pageIndex={currentPage} scope="page" />` (sticky overlay)

---

## Implementation Priority

**High Priority (blocking UI):**
1. Comics sort/filter params (`sortBy`, `status`, `translationGroupSlug`)
2. `uploadedBy` field in Manga response
3. Stats fields (`followCount`, `ratingCount`, `chapterCount`)

**Medium Priority (nice to have):**
4. Group members endpoint
5. Notifications SSE
6. Group logo upload

**Low Priority (already mocked):**
7. Verify existing follow/rating/comments implementations

---

## Frontend Workarounds

Until backend provides these endpoints/fields:

- **New homepage sections** may return same data (falls back to showing all comics) — backend params are optional, frontend handles gracefully
- **Admin dashboard** shows stat counts without members list — using hardcoded mock data
- **Comic detail** shows translation group but not uploader — just omit uploader badge
- **Group logo upload** redirected to file upload API (needs `PUT` wrapper)
- **Comments** currently use MSW mocks — needs real backend implementation with 3 scopes clarified
- **Ratings, follow** currently use MSW mocks — should be replaced with real backend

---

## Known Backend Issues to Fix

### 🔴 Comment Scope Confusion
**Issue:** `POST /comments` endpoint asks for `chapterId` even when posting comic-level comments (on title detail page).

**Impact:** Unclear which field to use, breaks separation of concerns.

**Fix:** Support both:
- `comicId` — for comic-level comments (title detail page)
- `chapterId` — for chapter/page-level comments (reader pages)

Either field should be optional, or the endpoint should accept different payload structures based on scope.

### 🔴 Comment Replies Not Populated
**Issue:** `GET /comments` response is missing:
- `parentId` field (for identifying replies)
- `replies` array (for nested replies)

**Current Response:**
```json
{
  "id": "...",
  "userId": "...",
  "content": "...",
  "parentId": null,  // ← Missing, always null
  "replies": []      // ← Missing, not returned
}
```

**Needed Response:**
```json
{
  "id": "comment-uuid",
  "userId": "user-uuid",
  "parentId": "parent-comment-uuid",  // ← NULL if root comment, UUID if reply
  "content": "...",
  "replies": [                         // ← Array of nested replies
    {
      "id": "reply-uuid",
      "parentId": "comment-uuid",
      "content": "reply text",
      "replies": []
    }
  ]
}
```

**Impact:** 
- Nested replies don't display (replies array empty)
- Cannot identify which comment is a reply (parentId always null)
- Reply UI works but nested structure is flat

**Fix:** Backend should return both fields in `GET /comments` response

