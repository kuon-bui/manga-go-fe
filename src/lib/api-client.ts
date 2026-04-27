import type { User } from '@/types/auth';
import type {
  AssignRolePermissionsPayload,
  AssignUserRolesPayload,
  PermissionEntity,
  Role,
  RoleDetail,
} from '@/types/rbac';
import type {
  Manga,
  PaginatedResponse,
  Genre,
  Author,
  Tag,
  Group,
  Chapter,
  ChapterSummary,
  Comment,
  ReadingHistoryEntry,
  FollowStatus,
  FollowStatusResponse,
} from '@/types';

// ─── Envelope ────────────────────────────────────────────────────────────────

export interface ValidationFieldError {
  field: string;
  message: string;
}

export interface ApiEnvelope<T> {
  data: T;
  message: string;
  error: string;
  validation_errors: ValidationFieldError[];
  success?: boolean;
  httpStatus?: number;
  validationErrors?: ValidationFieldError[];
}

// ─── Error ────────────────────────────────────────────────────────────────────

interface ApiErrorInit {
  message: string;
  statusCode: number;
  validationErrors?: ValidationFieldError[];
}

export class ApiClientError extends Error {
  statusCode: number;
  validationErrors: ValidationFieldError[];

  constructor({ message, statusCode, validationErrors = [] }: ApiErrorInit) {
    super(message);
    this.name = 'ApiClientError';
    this.statusCode = statusCode;
    this.validationErrors = validationErrors;
  }
}

// ─── Payload types ────────────────────────────────────────────────────────────

export interface CreateComicPayload {
  title: string;
  slug: string;
  alternativeTitles: string[];
  type: 'manga' | 'manhwa' | 'manhua' | 'comic' | 'novel';
  description: string;
  authorNames: string[];
  artistNames?: string[];
  genreSlugs: string[];
  tagSlugs: string[];
  thumbnail?: string | null;
  banner?: string | null;
  ageRating?: string;
  publishedYear?: number | null;
}

export interface UpdateComicPayload {
  title?: string;
  slug?: string;
  alternativeTitles?: string[];
  type?: 'manga' | 'manhwa' | 'manhua' | 'comic' | 'novel';
  status?: string;
  description?: string;
  authorNames?: string[];
  artistNames?: string[];
  genreSlugs?: string[];
  tagSlugs?: string[];
  thumbnail?: string | null;
  banner?: string | null;
  ageRating?: string;
  publishedYear?: number | null;
  isHot?: boolean;
  isFeatured?: boolean;
}

export interface ChapterPagePayload {
  pageType: 'image' | 'text';
  imageUrl?: string;
  content?: string;
}

export interface CreateChapterPayload {
  slug: string;
  number: string;
  title: string;
  pages: ChapterPagePayload[];
}

export interface UpdateChapterPayload {
  slug?: string;
  number?: string;
  title?: string;
}

// ─── File Upload Response Types ───────────────────────────────────────────

export interface FileUploadResponse {
  url: string;
  filename: string;
  path: string;
  content_type: string;
  size: number;
}

export interface ChapterImageUploadResponse extends FileUploadResponse { }

export interface CoverUploadResponse {
  url: string;
  path: string;
}

export interface UpdateChapterPagesPayload {
  pages: Array<{
    pageType: 'image';
    imageUrl: string;
  }>;
}

export interface CreateGroupPayload {
  name: string;
  slug: string;
}

export interface UpdateGroupPayload {
  name?: string;
  slug?: string;
}

// ─── Comment normalizer ──────────────────────────────────────────────────────
// Backend returns `user` (Go model field), frontend type expects `author`.

type RawComment = Record<string, unknown>;

export function normalizeComment(raw: RawComment): Comment {
  const user = (raw.user ?? {}) as { id?: string; name?: string; };
  const author = (raw.author ?? {
    id: user.id ?? '',
    name: user.name ?? 'Unknown',
    avatarUrl: null,
  }) as Comment['author'];

  return {
    id: raw.id as string,
    content: raw.content as string,
    chapterId: raw.chapterId as string,
    pageIndex: (raw.pageIndex ?? null) as number | null,
    parentId: (raw.parentId ?? null) as string | null,
    author,
    replies: ((raw.replies ?? []) as RawComment[]).map(normalizeComment),
    reactions: (raw.reactions ?? []) as Comment['reactions'],
    createdAt: raw.createdAt as string,
    updatedAt: raw.updatedAt as string,
  };
}

// ─── Client ───────────────────────────────────────────────────────────────────

interface RequestConfig extends RequestInit {
  params?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private unwrap<T>(envelope: ApiEnvelope<T>): T {
    return envelope.data;
  }

  private async request<T>(path: string, config: RequestConfig = {}): Promise<T> {
    const { params, headers, ...rest } = config;

    let urlStr = `${this.baseUrl}${path}`;
    if (params) {
      const qs = Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== '')
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join('&');
      if (qs) urlStr += `?${qs}`;
    }

    const mergedHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...headers,
    };

    const response = await fetch(urlStr, {
      ...rest,
      headers: mergedHeaders,
      credentials: 'include',
    });

    if (!response.ok) {
      let message = response.statusText;
      let validationErrors: ValidationFieldError[] = [];
      try {
        const body = (await response.json()) as {
          message?: string;
          error?: string;
          validation_errors?: ValidationFieldError[];
          validationErrors?: ValidationFieldError[];
        };
        message = body.message ?? body.error ?? message;
        validationErrors = body.validation_errors ?? body.validationErrors ?? [];
      } catch {
        // ignore parse error
      }
      throw new ApiClientError({ message, statusCode: response.status, validationErrors });
    }

    if (response.status === 204) return undefined as T;

    const json = (await response.json()) as ApiEnvelope<T>;

    if ('data' in json && json.data !== undefined) {
      return this.unwrap(json);
    }
    return json as unknown as T;
  }

  get<T>(path: string, config?: RequestConfig) {
    return this.request<T>(path, { ...config, method: 'GET' });
  }

  post<T>(path: string, body?: unknown, config?: RequestConfig) {
    return this.request<T>(path, {
      ...config,
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(path: string, body?: unknown, config?: RequestConfig) {
    return this.request<T>(path, {
      ...config,
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(path: string, body?: unknown, config?: RequestConfig) {
    return this.request<T>(path, {
      ...config,
      method: 'PATCH',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(path: string, config?: RequestConfig) {
    return this.request<T>(path, { ...config, method: 'DELETE' });
  }

  // ─── Auth ────────────────────────────────────────────────────────────────────

  login(email: string, password: string): Promise<{ user: User; }> {
    return this.post<{ user: User; }>('/users/sign-in', { email, password });
  }

  register(name: string, email: string, password: string): Promise<{ user: User; }> {
    return this.post<{ user: User; }>('/users', { name, email, password });
  }

  forgotPassword(email: string): Promise<{ message: string; }> {
    return this.post<{ message: string; }>('/users/request-reset-password', { email });
  }

  resetPassword(token: string, newPassword: string): Promise<{ message: string; }> {
    return this.post<{ message: string; }>('/users/reset-password', {
      token,
      new_password: newPassword,
    });
  }

  logout(): Promise<void> {
    return this.delete<void>('/users/logout');
  }

  renewToken(): Promise<void> {
    return this.post<void>('/users/renew-token');
  }

  getMe(): Promise<User> {
    return this.getCurrentUserProfile().then((res) => res.user);
  }

  getCurrentUserProfile(): Promise<{ user: User; }> {
    return this.get<{ user: User; }>('/users/me');
  }

  getAllRoles(): Promise<Role[]> {
    return this.get<Role[]>('/roles/all');
  }

  createRole(name: string, description?: string): Promise<Role> {
    return this.post<Role>('/roles', { name, description });
  }

  getRoleById(roleId: string): Promise<RoleDetail> {
    return this.get<RoleDetail>(`/roles/${roleId}`);
  }

  getAllPermissions(): Promise<PermissionEntity[]> {
    return this.get<PermissionEntity[]>('/permissions/all');
  }

  assignPermissionsToRole(roleId: string, payload: AssignRolePermissionsPayload): Promise<void> {
    return this.post<void>(`/roles/${roleId}/permissions`, payload);
  }

  assignRolesToUser(userId: string, payload: AssignUserRolesPayload): Promise<void> {
    return this.post<void>(`/users/${userId}/roles`, payload);
  }

  getUserRoles(userId: string): Promise<Role[]> {
    return this.get<Role[]>(`/users/${userId}/roles`);
  }

  // ─── Comics ──────────────────────────────────────────────────────────────────

  getComics(params?: Record<string, string>): Promise<PaginatedResponse<Manga>> {
    return this.get<PaginatedResponse<Manga>>('/comics', { params });
  }

  getComic(slug: string): Promise<Manga> {
    return this.get<Manga>(`/comics/${slug}`);
  }

  createComic(payload: CreateComicPayload): Promise<{ id: string; slug: string; }> {
    return this.post<{ id: string; slug: string; }>('/comics', payload);
  }

  updateComic(slug: string, payload: UpdateComicPayload): Promise<Manga> {
    return this.put<Manga>(`/comics/${slug}`, payload);
  }

  deleteComic(slug: string): Promise<void> {
    return this.delete<void>(`/comics/${slug}`);
  }

  publishComic(slug: string, isPublished: boolean): Promise<void> {
    return this.patch<void>(`/comics/${slug}/publish`, { isPublished });
  }

  getComicFollowStatus(comicSlug: string): Promise<FollowStatusResponse> {
    return this.get<FollowStatusResponse>(`/comics/${comicSlug}/follow-status`);
  }

  followComic(comicSlug: string, followStatus: FollowStatus = 'reading'): Promise<void> {
    return this.post<void>(`/comics/${comicSlug}/follow`, { followStatus });
  }

  unfollowComic(comicSlug: string): Promise<void> {
    return this.delete<void>(`/comics/${comicSlug}/follow`);
  }

  updateFollowStatus(comicSlug: string, followStatus: FollowStatus): Promise<void> {
    return this.patch<void>(`/comics/${comicSlug}/follow-status`, { followStatus });
  }

  updateComicStatus(comicSlug: string, status: string): Promise<void> {
    return this.patch<void>(`/comics/${comicSlug}/status`, { status });
  }

  getTrendingComics(limit = 10): Promise<PaginatedResponse<Manga>> {
    return this.get<PaginatedResponse<Manga>>('/comics/trending', { params: { limit: String(limit) } });
  }

  getRecentChapterUpdates(params?: Record<string, string>): Promise<PaginatedResponse<ChapterSummary>> {
    return this.get<PaginatedResponse<ChapterSummary>>('/chapters/recent-updates', { params });
  }

  getFollowedComics(params?: Record<string, string>): Promise<PaginatedResponse<{
    id: string;
    comicId: string;
    comic: Manga;
    createdAt: string | null;
  }>> {
    return this.get<PaginatedResponse<{
      id: string;
      comicId: string;
      comic: Manga;
      createdAt: string | null;
    }>>('/users/me/followed-comics', { params });
  }

  // ─── Chapters ───────────────────────────────────────────────────────────────

  getChapters(comicSlug: string, params?: Record<string, string>): Promise<PaginatedResponse<ChapterSummary>> {
    return this.get<PaginatedResponse<ChapterSummary>>(`/comics/${comicSlug}/chapters`, { params });
  }

  getChapter(comicSlug: string, chapterSlug: string): Promise<Chapter> {
    return this.get<Chapter>(`/comics/${comicSlug}/chapters/${chapterSlug}`);
  }

  createChapter(comicSlug: string, payload: CreateChapterPayload): Promise<{ id: string; slug: string; }> {
    return this.post<{ id: string; slug: string; }>(`/comics/${comicSlug}/chapters`, payload);
  }

  updateChapter(comicSlug: string, chapterSlug: string, payload: UpdateChapterPayload): Promise<void> {
    return this.put<void>(`/comics/${comicSlug}/chapters/${chapterSlug}`, payload);
  }

  updateChapterPages(
    comicId: string,
    chapterId: string,
    pages: Array<{ pageType: 'image'; imageUrl: string; }>
  ): Promise<void> {
    return this.put<void>(`/comics/${comicId}/chapters/${chapterId}/pages`, { pages });
  }

  publishChapter(comicSlug: string, chapterSlug: string, isPublished: boolean): Promise<void> {
    return this.patch<void>(`/comics/${comicSlug}/chapters/${chapterSlug}/publish`, { isPublished });
  }

  markChapterRead(comicSlug: string, chapterSlug: string): Promise<void> {
    return this.patch<void>(`/comics/${comicSlug}/chapters/${chapterSlug}/mark-as-read`);
  }

  // ─── Authors ─────────────────────────────────────────────────────────────────

  getAllAuthors(): Promise<Author[]> {
    return this.get<Author[]>('/authors/all');
  }

  getAuthors(params?: Record<string, string>): Promise<PaginatedResponse<Author>> {
    return this.get<PaginatedResponse<Author>>('/authors', { params });
  }

  createAuthor(name: string): Promise<Author> {
    return this.post<Author>('/authors', { name });
  }

  // ─── Genres ──────────────────────────────────────────────────────────────────

  getAllGenres(): Promise<Genre[]> {
    return this.get<Genre[]>('/genres/all');
  }

  getGenres(params?: Record<string, string>): Promise<PaginatedResponse<Genre>> {
    return this.get<PaginatedResponse<Genre>>('/genres', { params });
  }

  createGenre(name: string, slug: string, description?: string): Promise<Genre> {
    return this.post<Genre>('/genres', { name, slug, description });
  }

  // ─── Tags ────────────────────────────────────────────────────────────────────

  getAllTags(): Promise<Tag[]> {
    return this.get<Tag[]>('/tags/all');
  }

  getTags(params?: Record<string, string>): Promise<PaginatedResponse<Tag>> {
    return this.get<PaginatedResponse<Tag>>('/tags', { params });
  }

  createTag(name: string, slug: string): Promise<Tag> {
    return this.post<Tag>('/tags', { name, slug });
  }

  // ─── Translation Groups ──────────────────────────────────────────────────────

  getTranslationGroups(params?: Record<string, string>): Promise<PaginatedResponse<Group>> {
    return this.get<PaginatedResponse<Group>>('/translation-groups', { params });
  }

  getTranslationGroup(slug: string): Promise<Group> {
    return this.get<Group>(`/translation-groups/${slug}`);
  }

  createTranslationGroup(name: string, slug: string): Promise<Group> {
    return this.post<Group>('/translation-groups', { name, slug });
  }

  updateTranslationGroup(slug: string, payload: UpdateGroupPayload): Promise<Group> {
    return this.put<Group>(`/translation-groups/${slug}`, payload);
  }

  deleteTranslationGroup(slug: string): Promise<void> {
    return this.delete<void>(`/translation-groups/${slug}`);
  }

  transferGroupOwnership(slug: string, newOwnerId: string): Promise<void> {
    return this.put<void>(`/translation-groups/${slug}/transfer-ownership`, { newOwnerId });
  }

  // ─── Comments ────────────────────────────────────────────────────────────────

  getComments(chapterId: string, params?: Record<string, string>): Promise<PaginatedResponse<Comment>> {
    return this.get<PaginatedResponse<RawComment>>('/comments', { params: { chapterId, ...params } })
      .then((res) => ({ ...res, data: res.data.map(normalizeComment) }));
  }

  createComment(payload: { comicId?: string; chapterId?: string; content: string; pageIndex?: number | null; parentId?: string | null; }): Promise<Comment> {
    return this.post<RawComment>('/comments', payload).then(normalizeComment);
  }

  updateComment(id: string, content: string): Promise<Comment> {
    return this.put<RawComment>(`/comments/${id}`, { content }).then(normalizeComment);
  }

  deleteComment(id: string): Promise<void> {
    return this.delete<void>(`/comments/${id}`);
  }

  addCommentReaction(id: string, type: string): Promise<void> {
    return this.post<void>(`/comments/${id}/reactions`, { type });
  }

  removeCommentReaction(id: string, type: string): Promise<void> {
    return this.delete<void>(`/comments/${id}/reactions/${type}`);
  }

  // ─── Files ───────────────────────────────────────────────────────────────────

  async uploadFile(file: File): Promise<{ url: string; filename: string; }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/files/upload`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new ApiClientError({ message: 'File upload failed', statusCode: response.status });
    }

    const json = (await response.json()) as ApiEnvelope<{ url: string; filename: string; }>;
    const data: { url: string; filename: string; } =
      'data' in json && json.data !== undefined
        ? json.data
        : (json as unknown as { url: string; filename: string; });
    // url is a relative path (/files/content/…) — make it absolute
    if (data.url.startsWith('/')) {
      data.url = `${this.baseUrl}${data.url}`;
    }
    return data;
  }

  async uploadChapterImage(
    file: File,
    comicId: string,
    chapterSlug: string,
    pageIdx: number
  ): Promise<FileUploadResponse> {
    const trimmedComicId = comicId.trim();
    const normalizedComicIdInput = trimmedComicId.endsWith(',')
      ? trimmedComicId.slice(0, -1).trim()
      : trimmedComicId;

    let normalizedComicId = normalizedComicIdInput;
    if (normalizedComicIdInput.startsWith('[') && normalizedComicIdInput.endsWith(']')) {
      try {
        const parsedComicId = JSON.parse(normalizedComicIdInput) as unknown;
        if (Array.isArray(parsedComicId) && typeof parsedComicId[0] === 'string') {
          normalizedComicId = parsedComicId[0];
        }
      } catch {
        // Keep the original value when comicId is not valid JSON.
      }
    }

    const formData = new FormData();
    formData.set('file', file);
    formData.set('type', 'chapter');
    formData.set('comicId', normalizedComicId);
    formData.set('chapterSlug', chapterSlug);
    formData.set('pageIdx', String(pageIdx));

    const response = await fetch(`${this.baseUrl}/files/upload`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiClientError({
        message: (error as Record<string, unknown>).error as string || 'Chapter image upload failed',
        statusCode: response.status,
      });
    }

    const json = (await response.json()) as ApiEnvelope<FileUploadResponse>;
    const data = 'data' in json && json.data ? json.data : (json as unknown as FileUploadResponse);
    // url is a relative path (/files/content/…) — make it absolute
    if (data.url.startsWith('/')) {
      data.url = `${this.baseUrl}${data.url}`;
    }
    return data;
  }

  async uploadCover(file: File, comicId: string): Promise<CoverUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'cover');
    formData.append('comicId', comicId);

    const response = await fetch(`${this.baseUrl}/files/upload`, {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiClientError({
        message: (error as Record<string, unknown>).error as string || 'Cover upload failed',
        statusCode: response.status,
      });
    }

    const json = (await response.json()) as ApiEnvelope<CoverUploadResponse>;
    const data = 'data' in json && json.data ? json.data : (json as unknown as CoverUploadResponse);
    // url is a relative path (/files/content/…) — make it absolute
    if (data.url.startsWith('/')) {
      data.url = `${this.baseUrl}${data.url}`;
    }
    return data;
  }

  getPresignedUrl(filename: string): Promise<{ url: string; }> {
    return this.get<{ url: string; }>(`/files/presign/${encodeURIComponent(filename)}`);
  }

  updateComicThumbnail(comicId: string, thumbnail: string): Promise<Manga> {
    return this.patch<Manga>(`/comics/${comicId}`, { thumbnail });
  }

  // ─── Reading History ─────────────────────────────────────────────────────────

  createReadingHistory(comicId: string, chapterId: string): Promise<void> {
    return this.post<void>('/reading-histories', { comicId, chapterId });
  }

  getReadingHistories(params?: Record<string, string>): Promise<PaginatedResponse<ReadingHistoryEntry>> {
    return this.get<PaginatedResponse<ReadingHistoryEntry>>('/reading-histories', { params });
  }

  deleteReadingHistory(id: string): Promise<void> {
    return this.delete<void>(`/reading-histories/${id}`);
  }

  updateReadingHistory(id: string, lastReadAt: string): Promise<void> {
    return this.put<void>(`/reading-histories/${id}`, { lastReadAt });
  }

  // ─── Notifications ───────────────────────────────────────────────────────────

  getNotifications(params?: Record<string, string>): Promise<PaginatedResponse<Record<string, unknown>>> {
    return this.get<PaginatedResponse<Record<string, unknown>>>('/notifications', { params });
  }

  markNotificationRead(id: string): Promise<void> {
    return this.patch<void>(`/notifications/${id}/read`);
  }

  markNotificationSeen(id: string): Promise<void> {
    return this.patch<void>(`/notifications/${id}/seen`);
  }

  markAllNotificationsRead(): Promise<void> {
    return this.patch<void>('/notifications/read-all');
  }

  // ─── User config ─────────────────────────────────────────────────────────────

  getUserConfig(): Promise<Record<string, unknown>> {
    return this.get<Record<string, unknown>>('/users/me/config');
  }

  updateUserConfig(config: {
    enableComicNewChapterNotifications?: boolean;
    enableCommentReplyNotifications?: boolean;
    enableEmailNotifications?: boolean;
    enableMentionNotifications?: boolean;
    enableSseNotifications?: boolean;
    enableSystemAnnouncements?: boolean;
    seenNotificationCenter?: boolean;
  }): Promise<void> {
    return this.patch<void>('/users/me/config', config);
  }

  // ─── Translation group extras ────────────────────────────────────────────────

  getGroupMembers(slug: string): Promise<unknown[]> {
    return this.get<unknown[]>(`/translation-groups/${slug}/members`);
  }

  async uploadGroupLogo(slug: string, file: File): Promise<{ url: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch(`${this.baseUrl}/translation-groups/${slug}/logo`, {
      method: 'PUT',
      body: formData,
      credentials: 'include',
    });
    if (!response.ok) {
      throw new ApiClientError({ message: 'Logo upload failed', statusCode: response.status });
    }
    const json = (await response.json()) as ApiEnvelope<{ url: string }>;
    return 'data' in json && json.data ? json.data : (json as unknown as { url: string });
  }

  // ─── Reading progress ────────────────────────────────────────────────────────

  getReadingProgress(comicSlug: string, chapterSlug: string): Promise<{ scrollPercent: number }> {
    return this.get<{ scrollPercent: number }>(`/comics/${comicSlug}/chapters/${chapterSlug}/reading-progress`);
  }

  updateReadingProgress(comicSlug: string, chapterSlug: string, scrollPercent: number): Promise<void> {
    return this.patch<void>(`/comics/${comicSlug}/chapters/${chapterSlug}/reading-progress`, { scrollPercent });
  }

  // ─── Comment extras ──────────────────────────────────────────────────────────

  getCommentReplies(id: string, params?: Record<string, string>): Promise<PaginatedResponse<Comment>> {
    return this.get<PaginatedResponse<RawComment>>(`/comments/${id}/replies`, { params })
      .then((res) => ({ ...res, data: res.data.map(normalizeComment) }));
  }

  reportComment(id: string, reason: 'SPAM' | 'OFFENSIVE' | 'HARASSMENT' | 'ADULT_CONTENT', details?: string): Promise<void> {
    return this.post<void>(`/comments/${id}/report`, { reason, details });
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

export const apiClient = new ApiClient(API_BASE_URL);
