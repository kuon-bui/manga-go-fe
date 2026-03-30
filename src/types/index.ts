// ===== User Types =====
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: UserRole;
  createdAt?: string;
}

export type UserRole = 'user' | 'admin' | 'moderator';

// ===== Manga Types =====
export interface Manga {
  id: string;
  slug: string;
  title: string;
  alternativeTitles?: string[];
  description: string;
  coverImage: string;
  status: MangaStatus;
  genres: string[];
  authors: string[];
  rating: number;
  viewCount: number;
  chapterCount: number;
  latestChapter?: Chapter;
  updatedAt: string;
  createdAt: string;
}

export type MangaStatus = 'ongoing' | 'completed' | 'hiatus' | 'cancelled';

// ===== Chapter Types =====
export interface Chapter {
  id: string;
  slug: string;
  mangaId: string;
  number: number;
  title?: string;
  pages: ChapterPage[];
  viewCount: number;
  publishedAt: string;
}

export interface ChapterPage {
  id: string;
  url: string;
  width: number;
  height: number;
  order: number;
}

// ===== API Types =====
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// ===== Component Types =====
export interface WithClassName {
  className?: string;
}

export interface WithChildren {
  children: React.ReactNode;
}
