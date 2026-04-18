'use client'

import dynamic from 'next/dynamic'

const NovelReader = dynamic(
  () => import('@/components/reader/novel/novel-reader').then((m) => ({ default: m.NovelReader })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    ),
  }
)

export function NovelReaderClient({
  comicSlug,
  chapterSlug,
}: {
  comicSlug: string
  chapterSlug: string
}) {
  return <NovelReader comicSlug={comicSlug} chapterSlug={chapterSlug} />
}
