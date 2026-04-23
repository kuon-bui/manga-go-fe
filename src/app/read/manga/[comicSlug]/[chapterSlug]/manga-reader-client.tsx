'use client'

import dynamic from 'next/dynamic'

const MangaReader = dynamic(
  () => import('@/components/reader/manga/manga-reader').then((m) => ({ default: m.MangaReader })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    ),
  }
)

export function MangaReaderClient({
  comicSlug,
  chapterSlug,
}: {
  comicSlug: string
  chapterSlug: string
}) {
  return <MangaReader comicSlug={comicSlug} chapterSlug={chapterSlug} />
}
