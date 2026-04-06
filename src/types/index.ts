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

export interface ValidationFieldError {
  field: string;
  message: string;
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
export type ComicAgeRating = 'everyone' | 'teen' | 'mature' | 'adult';

export interface Genre {
  id: string;
  name: string;
  slug: string;
  thumbnail?: string | null;
  description?: string | null;
}

export interface TranslatorGroup {
  id: string;
  name: string;
  logoUrl: string | null;
}

export interface ChapterSummary {
  id: string;
  slug: string;
  number: number;
  title: string | null;
  uploadedAt: string;
  group: TranslatorGroup | null;
}

export interface Manga {
  id: string;
  slug: string;         // primary URL identifier (backend: comicSlug)
  title: string;
  alternativeTitles: string[];
  coverUrl: string;     // UI alias — populated from backend `thumbnail`
  thumbnail?: string | null; // backend field
  banner?: string | null;
  type: ContentType;
  status: ContentStatus;
  ageRating?: ComicAgeRating;
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
  comicSlug: string;    // needed to build API URLs and reader links
  mangaId: string;
  pages: string[];      // image URLs for manga; empty for novel
  content: string | null; // HTML content for novel; null for manga
  prevChapter: { slug: string; number: number } | null;
  nextChapter: { slug: string; number: number } | null;
}

// ─── Rating & Follow ──────────────────────────────────────────────────────────

export interface UserRating {
  mangaId: string;
  score: number; // 1–10
  createdAt: string;
  updatedAt: string;
}

export interface FollowStatus {
  mangaId: string;
  isFollowing: boolean;
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
  name: string;         // backend field (was: username / displayName)
  avatarUrl: string | null;
}

export interface CommentReaction {
  type: string;
  count: number;
  userReacted: boolean;
}

export interface Comment {
  id: string;
  content: string;      // backend field (was: body)
  chapterId: string;
  pageIndex: number | null;
  author: CommentAuthor;
  parentId: string | null;
  replies: Comment[];
  reactions: CommentReaction[];
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
  | 'most_read';

export interface SearchFilters {
  query?: string;
  type?: ContentType;
  status?: ContentStatus;
  genres?: string[];
  tags?: string[];
  ratingMin?: number;
  ratingMax?: number;
  yearMin?: number;
  yearMax?: number;
  sort?: SortOption;
  page?: number;
  pageSize?: number;
}

export interface BrowseFilters {
  genre?: string;
  tag?: string;
  status?: ContentStatus;
  sort?: SortOption;
  page?: number;
}

// ─── Translator Dashboard ─────────────────────────────────────────────────────

export type GroupRole = 'admin' | 'member';

export interface GroupMember {
  id: string;
  userId: string;
  name: string;         // backend field (was: username / displayName)
  avatarUrl: string | null;
  role: GroupRole;
  joinedAt: string;
}

export interface Group {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  description: string | null;
  memberCount: number;
  titleCount: number;
  createdAt: string;
}

export interface DashboardTitle {
  id: string;
  slug: string;
  title: string;
  coverUrl: string;
  type: ContentType;
  status: ContentStatus;
  chapterCount: number;
  lastUploadedAt: string | null;
  groups: Pick<Group, 'id' | 'name'>[];
}

export interface UploadChapterPayload {
  comicSlug: string;    // was: mangaId
  slug: string;
  number: number;
  title: string | null;
  pages: string[];
  content: string | null;
}

export interface CreateTitlePayload {
  title: string;
  alternativeTitles: string[];
  type: ContentType;
  status: ContentStatus;
  description: string;
  author: string;
  artist: string | null;
  genres: string[];
  tags: string[];
  year: number | null;
  coverFile?: File;
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
