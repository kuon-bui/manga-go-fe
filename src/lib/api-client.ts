import type { User } from '@/types/auth';
import type {
  AssignRolePermissionsPayload,
  AssignUserRolesPayload,
  PermissionEntity,
  Role,
  RoleDetail,
  UserRolesResponse,
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
  type: 'manga' | 'novel';
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
  type?: 'manga' | 'novel';
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

function normalizeComment(raw: RawComment): Comment {
  const user = (raw.user ?? {}) as { id?: string; name?: string };
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

interface FollowStatusResponse {
  isFollowed: boolean;
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

    const url = new URL(`${this.baseUrl}${path}`);
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') url.searchParams.set(k, v);
      });
    }

    const mergedHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...headers,
    };

    const response = await fetch(url.toString(), {
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

  login(email: string, password: string): Promise<{ user: User }> {
    return this.post<{ user: User }>('/users/sign-in', { email, password });
  }

  register(name: string, email: string, password: string): Promise<{ user: User }> {
    return this.post<{ user: User }>('/users', { name, email, password });
  }

  forgotPassword(email: string): Promise<{ message: string }> {
    return this.post<{ message: string }>('/users/request-reset-password', { email });
  }

  resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    return this.post<{ message: string }>('/users/reset-password', {
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

  getCurrentUserProfile(): Promise<{ user: User }> {
    return this.get<{ user: User }>('/users/me');
  }

  // ─── RBAC ───────────────────────────────────────────────────────────────────

  getAllRoles(): Promise<Role[]> {
    return this.get<Role[]>('/roles/all');
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

  getUserRoles(userId: string): Promise<UserRolesResponse> {
    return this.get<UserRolesResponse>(`/users/${userId}/roles`);
  }

  // ─── Comics ──────────────────────────────────────────────────────────────────

  getComics(params?: Record<string, string>): Promise<PaginatedResponse<Manga>> {
    return this.get<PaginatedResponse<Manga>>('/comics', { params });
  }

  getComic(slug: string): Promise<Manga> {
    return this.get<Manga>(`/comics/${slug}`);
  }

  createComic(payload: CreateComicPayload): Promise<{ id: string; slug: string }> {
    return this.post<{ id: string; slug: string }>('/comics', payload);
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

  followComic(comicSlug: string): Promise<void> {
    return this.post<void>(`/comics/${comicSlug}/follow`);
  }

  unfollowComic(comicSlug: string): Promise<void> {
    return this.delete<void>(`/comics/${comicSlug}/follow`);
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

  createChapter(comicSlug: string, payload: CreateChapterPayload): Promise<{ id: string; slug: string }> {
    return this.post<{ id: string; slug: string }>(`/comics/${comicSlug}/chapters`, payload);
  }

  updateChapter(comicSlug: string, chapterSlug: string, payload: UpdateChapterPayload): Promise<void> {
    return this.put<void>(`/comics/${comicSlug}/chapters/${chapterSlug}`, payload);
  }

  updateChapterPages(comicSlug: string, chapterSlug: string, pages: string[]): Promise<void> {
    return this.put<void>(`/comics/${comicSlug}/chapters/${chapterSlug}/pages`, { pages });
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

  createComment(payload: { chapterId: string; content: string; pageIndex?: number | null; parentId?: string | null }): Promise<Comment> {
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

  // ─── Files ───────────────────────────────────────────────────────────────────

  async uploadFile(file: File): Promise<{ url: string; filename: string }> {
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

    const json = (await response.json()) as ApiEnvelope<{ url: string; filename: string }>;
    const data: { url: string; filename: string } =
      'data' in json && json.data !== undefined
        ? json.data
        : (json as unknown as { url: string; filename: string });
    // url is a relative path (/files/content/…) — make it absolute
    if (data.url.startsWith('/')) {
      data.url = `${this.baseUrl}${data.url}`;
    }
    return data;
  }

  getPresignedUrl(filename: string): Promise<{ url: string }> {
    return this.get<{ url: string }>(`/files/presign/${encodeURIComponent(filename)}`);
  }

  // ─── Reading History ─────────────────────────────────────────────────────────

  createReadingHistory(comicId: string, chapterId: string): Promise<void> {
    return this.post<void>('/reading-histories', { comicId, chapterId });
  }

  getReadingHistories(params?: Record<string, string>): Promise<PaginatedResponse<unknown>> {
    return this.get<PaginatedResponse<unknown>>('/reading-histories', { params });
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

export const apiClient = new ApiClient(API_BASE_URL);
