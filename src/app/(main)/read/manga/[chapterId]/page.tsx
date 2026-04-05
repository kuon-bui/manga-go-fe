import { Suspense } from 'react'

import { MangaReader } from '@/components/reader/manga/manga-reader'

interface PageProps {
  params: Promise<{ chapterId: string }>
}

export default async function MangaReaderPage({ params }: PageProps) {
  const { chapterId } = await params

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-black">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
        </div>
      }
    >
      <MangaReader chapterId={chapterId} />
    </Suspense>
  )
}
