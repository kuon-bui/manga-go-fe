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
