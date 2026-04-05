// Re-export all auth types as the single source of truth
export type {
  UserRole,
  User,
  LoginPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  AuthResponse,
} from '@/types/auth';

// ─── API ────────────────────────────────────────────────────────────────────

export interface ApiError {
  message: string;
  code?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ─── Content ─────────────────────────────────────────────────────────────────

export type ContentType = 'manga' | 'novel';
export type ContentStatus = 'ongoing' | 'completed' | 'hiatus' | 'cancelled';

export interface Genre {
  id: string;
  name: string;
  slug: string;
}

export interface TranslatorGroup {
  id: string;
  name: string;
  logoUrl: string | null;
}

export interface ChapterSummary {
  id: string;
  number: number;
  title: string | null;
  uploadedAt: string;
  group: TranslatorGroup | null;
}

export interface Manga {
  id: string;
  title: string;
  alternativeTitles: string[];
  coverUrl: string;
  type: ContentType;
  status: ContentStatus;
  description: string;
  author: string;
  artist: string | null;
  genres: Genre[];
  tags: string[];
  year: number | null;
  rating: number;
  ratingCount: number;
  followCount: number;
  chapterCount: number;
  latestChapter: ChapterSummary | null;
  createdAt: string;
  updatedAt: string;
}

export interface Chapter extends ChapterSummary {
  mangaId: string;
  pages: string[]; // image URLs for manga; empty for novel
  content: string | null; // HTML content for novel; null for manga
  prevChapterId: string | null;
  nextChapterId: string | null;
}

// ─── Library ─────────────────────────────────────────────────────────────────

export interface LibraryEntry {
  mangaId: string;
  manga: Manga;
  lastReadChapterId: string | null;
  lastReadAt: string | null;
  addedAt: string;
}

// ─── Comments ────────────────────────────────────────────────────────────────

export interface CommentAuthor {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface Comment {
  id: string;
  body: string;
  author: CommentAuthor;
  parentId: string | null;
  replies: Comment[];
  likeCount: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Search & Discovery ───────────────────────────────────────────────────────

export type SortOption =
  | 'latest'
  | 'oldest'
  | 'title_asc'
  | 'title_desc'
  | 'rating'
  | 'most_followed'
  | 'most_read'

export interface SearchFilters {
  query?: string
  type?: ContentType
  status?: ContentStatus
  genres?: string[]
  tags?: string[]
  ratingMin?: number
  ratingMax?: number
  yearMin?: number
  yearMax?: number
  sort?: SortOption
  page?: number
  pageSize?: number
}

export interface BrowseFilters {
  genre?: string
  tag?: string
  status?: ContentStatus
  sort?: SortOption
  page?: number
}

// ─── Notifications ────────────────────────────────────────────────────────────

export type NotificationType = 'new_chapter' | 'comment_reply' | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  isRead: boolean;
  link: string | null;
  createdAt: string;
}
