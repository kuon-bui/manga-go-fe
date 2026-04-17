'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { apiClient } from '@/lib/api-client'
import { queryKeys } from '@/lib/query-keys'
import type { Chapter } from '@/types'

// Shape returned by the backend before our transformation
interface BackendPage {
  id: string;
  chapterId: string;
  pageNumber: number;
  pageType?: 'image' | 'text';
  imageUrl?: string;
  content?: string;
}

interface BackendChapter {
  id: string;
  comicId: string;
  number: string;
  title: string;
  slug: string;
  isPublished: boolean;
  pages?: BackendPage[];
  createdAt: string | null;
  updatedAt: string | null;
}

export function useChapter(comicSlug: string, chapterSlug: string) {
  return useQuery<Chapter>({
    queryKey: queryKeys.chapter.detail(comicSlug, chapterSlug),
    queryFn: async () => {
      const raw = await apiClient.get<BackendChapter>(
        `/comics/${comicSlug}/chapters/${chapterSlug}`
      )
      // Transform backend shape → frontend Chapter type
      const sortedPages = (raw.pages ?? [])
        .slice()
        .sort((a, b) => a.pageNumber - b.pageNumber)
      const imagePages = sortedPages
        .filter((p) => (p.pageType ?? 'image') === 'image' && Boolean(p.imageUrl))
        .map((p) => p.imageUrl as string)
      const textContent = sortedPages
        .filter((p) => p.pageType === 'text' && Boolean(p.content))
        .map((p) => p.content as string)
        .join('\n\n')

      return {
        id: raw.id,
        slug: raw.slug,
        number: raw.number,
        title: raw.title ?? null,
        uploadedAt: raw.createdAt ?? '',
        group: null,
        comicSlug,
        mangaId: comicSlug, // used for back-link in reader controls
        pages: imagePages,
        content: textContent || null,
        prevChapter: null, // not provided by backend; navigate via chapter list
        nextChapter: null,
      } satisfies Chapter
    },
    enabled: Boolean(comicSlug) && Boolean(chapterSlug),
  })
}

export function useMarkChapterRead(comicSlug: string, chapterSlug: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      apiClient.patch(`/comics/${comicSlug}/chapters/${chapterSlug}/mark-as-read`),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.chapter.detail(comicSlug, chapterSlug) })
    },
  })
}
