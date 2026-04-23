# Missing APIs Requirements for Manga Go

Tài liệu này liệt kê các API mà phía Frontend đang cần để triển khai các giao diện và tính năng mới nhất nhằm đồng bộ dữ liệu.

## 1. API Top Trending (Cho Banner Slider Trang chủ)
Được sử dụng ở phần đầu trang chủ, hiển thị truyện hot theo dạng banner. Cần đảm bảo có tóm tắt (synopsis) và thông tin đầy đủ để làm background cho banner.
- **Endpoint:** `GET /api/v1/titles/trending`
- **Method:** `GET`
- **Query Params:** `?limit=5`
- **Response Structure:**
```typescript
{
  "data": [
    {
      "id": "string",
      "title": "string",
      "coverImage": "string",
      "author": "string",
      "synopsis": "string", // Rất quan trọng để hiển thị trên banner
      "genres": [
        { "id": "string", "name": "string" }
      ],
      "latestChapter": { "number": number, "id": "string" },
      "views": number
    }
  ]
}
```

## 2. API Chương Mới Cập Nhật (Trang chủ)
Tách rõ thông tin truyện và chương để dễ dàng hiển thị theo dạng list 3 cột.
- **Endpoint:** `GET /api/v1/chapters/recent-updates` (hoặc `GET /api/v1/titles/recent-updates`)
- **Query Params:** `?limit=18`
- **Response Structure:**
```typescript
{
  "data": [
    {
      "title": { 
        "id": "string", 
        "name": "string", 
        "coverImage": "string" 
      },
      "chapter": { 
        "id": "string", 
        "number": number, 
        "name": "string", 
        "createdAt": "2026-04-19T00:00:00Z" 
      }
    }
  ],
  "pagination": { ... }
}
```

## 3. API Chi tiết truyện (Manga Detail) - Bổ sung fields mới
Bổ sung `uploaderId` để FE kiểm tra quyền chỉnh sửa truyện và `translationGroup` để tri ân nhóm dịch.
- **Endpoint:** `GET /api/v1/titles/:id`
- **Response Structure Thêm Mới:**
```typescript
{
  // Các data có sẵn ...
  "uploaderId": "string", // ID của người đăng truyện (để so sánh với User hiện tại)
  "translationGroup": {   // Trả về thông tin cơ bản của nhóm dịch
    "id": "string",
    "name": "string",
    "slug": "string"
  } | null
}
```

## 4. Hệ Thống Bình Luận & Cảm Xúc Từng Trang (Page-Level Social Features)
Phục vụ nhu cầu đọc truyện: mỗi ảnh trong chương có thể bấm vào comment/react giống Facebook.

### 4.1 Lấy danh sách bình luận của từng ảnh
- **Endpoint:** `GET /api/v1/comments`
- **Query Params:** `?chapterId={id}&pageIndex={number}`
- **Response Structure:**
```typescript
{
  "data": [
    {
      "id": "string",
      "content": "string",
      "author": { "id": "string", "name": "string", "avatar": "string" },
      "createdAt": "date",
      "reactionCounts": {
        "LIKE": number,
        "LOVE": number,
        "HAHA": number,
        "SAD": number,
        "ANGRY": number
      },
      "userReaction": "LIKE" | null, // Reaction của user đang login lấy từ DB
      "replyCount": number
    }
  ]
}
```

### 4.2 Thả cảm xúc vào từng trang/ảnh của chương
- **Endpoint:** `POST /api/v1/chapters/:chapterId/pages/:pageIndex/react`
- **Request Body:** `{ "type": "LIKE" | "LOVE" | "HAHA" | "WOW" | "SAD" | "ANGRY" }`
- **Response Structure:** `200 OK`

### 4.3 Tương tác với Bình Luận (React / Report)
- **React vào bình luận:**
  - **Endpoint:** `POST /api/v1/comments/:commentId/react`
  - **Request Body:** `{ "type": "LIKE" | "LOVE" | "HAHA" | "WOW" | "SAD" | "ANGRY" }`
  - **Lưu ý:** Gửi cùng 1 type sẽ toggle tính năng react (gỡ react).

- **Báo cáo bình luận:**
  - **Endpoint:** `POST /api/v1/comments/:commentId/report`
  - **Request Body:** `{ "reason": "SPAM" | "OFFENSIVE", "details": "string" }`

---

## 5. Bookmark Chương / Trang (Kawaii UI Phase — Tham chiếu Reader Mock)

Frontend sẽ hiển thị icon bookmark trên reader bottom bar và trên chapter-list trong title detail.

```typescript
// POST /bookmarks
interface CreateBookmarkRequest {
  chapterId: string
  pageIndex?: number  // nếu undefined → bookmark toàn bộ chương
}

// DELETE /bookmarks/:id

// GET /users/me/bookmarks?comicSlug=...
interface BookmarkListResponse {
  data: Array<{
    id: string
    chapterId: string
    pageIndex: number | null
    chapter: { number: number; slug: string; title?: string }
    createdAt: string
  }>
}
```

**UI hiện tại:** Các icon bookmark hiển thị ở dạng `disabled` với tooltip "Sắp ra mắt" cho đến khi API sẵn sàng.

---

## 6. Thống Kê Đọc Của Người Dùng (User Reading Stats)

Dùng ở dashboard và profile (Reading Stats card).

```typescript
// GET /users/me/stats
interface UserReadingStats {
  monthlyChaptersRead: number
  totalHoursRead: number        // ước tính từ chapters × avg read time
  mangaInLibrary: number
  topGenres: Array<{ slug: string; name: string; count: number }>
}
```

---

## 7. Phân Nhóm Chương Theo Volume (Chapter Volume Grouping)

Frontend có thể group chương theo volume nếu backend trả về `volumeNumber`.

```typescript
// Cần confirm Chapter DTO có field:
interface Chapter {
  // ... fields hiện tại ...
  volumeNumber?: number    // ví dụ: 1, 2, 3
  volumeTitle?: string     // ví dụ: "Arc 1: Awakening"
}

// Hoặc endpoint riêng:
// GET /comics/:slug/chapters?groupByVolume=true
interface VolumeGroupedResponse {
  volumes: Array<{
    volumeNumber: number
    volumeTitle?: string
    chapters: Chapter[]
  }>
}
```

---

## 8. Tiến Độ Đọc Với Phần Trăm (Reading Progress With Percentage)

Backend hiện có `PATCH /chapters/:id/mark-as-read`. Cần bổ sung `progress` (0–100) để lưu vị trí đọc dở và hiển thị progress bar trong "Continue Reading" card.

```typescript
// PATCH /comics/:comicSlug/chapters/:chapterSlug/mark-as-read
interface MarkReadRequest {
  progress?: number   // 0-100, vị trí cuộn trong chương
}

// GET /users/me/continue-reading
interface ContinueReadingItem {
  manga: Comic
  lastChapter: { id: string; slug: string; number: number; title?: string }
  progressPercent: number    // 0-100
  updatedAt: string
}
```

---

## 9. Library Categories (Danh Mục Thư Viện)

Hiện tại chỉ có follow/unfollow. Cần trạng thái theo dõi để tách thành các tab "Đang đọc / Dự định / Hoàn thành / Yêu thích".

```typescript
// PATCH /follows/:comicId
interface UpdateFollowStatusRequest {
  status: 'reading' | 'planned' | 'completed' | 'dropped' | 'favourite'
}

// GET /users/me/library (extend existing)
interface LibraryEntry {
  // ... fields hiện tại ...
  status: 'reading' | 'planned' | 'completed' | 'dropped' | 'favourite' | null
}
```

**UI hiện tại:** Tabs library chỉ hiển thị "Đang theo dõi" và "Lịch sử đọc". Status tabs sẽ mở khóa khi API có `status` field.

---

## 10. Offline Download Chương (Defer — Chỉ UI Placeholder)

Reference mock có icon download per chapter row. Đề xuất defer tính năng thực sự, chỉ giữ icon ở UI với trạng thái disabled.

```typescript
// GET /chapters/:id/download
// → ZIP file hoặc array of pre-signed URLs cho từng trang

// Khi implement, client có thể dùng:
interface DownloadResponse {
  type: 'zip' | 'pages'
  zipUrl?: string
  pageUrls?: string[]
  expiresAt: string   // pre-signed URL expiry
}
```
