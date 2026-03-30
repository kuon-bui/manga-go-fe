export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? 'Manga Go';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080/api';

export const ROUTES = {
  home: '/',
  browse: '/browse',
  genres: '/genres',
  manga: (slug: string) => `/manga/${slug}`,
  chapter: (mangaSlug: string, chapterSlug: string) =>
    `/manga/${mangaSlug}/chapter/${chapterSlug}`,
} as const;

export const PAGINATION = {
  defaultPageSize: 20,
  maxPageSize: 100,
} as const;

export const MANGA_GENRES = [
  'Action',
  'Adventure',
  'Comedy',
  'Drama',
  'Fantasy',
  'Horror',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Slice of Life',
  'Sports',
  'Supernatural',
  'Thriller',
] as const;

export type MangaGenre = (typeof MANGA_GENRES)[number];
