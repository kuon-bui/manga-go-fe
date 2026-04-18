import { MangaReaderClient } from './manga-reader-client'

interface PageProps {
  params: Promise<{ comicSlug: string; chapterSlug: string }>
}

export default async function MangaReaderPage({ params }: PageProps) {
  const { comicSlug, chapterSlug } = await params
  return <MangaReaderClient comicSlug={comicSlug} chapterSlug={chapterSlug} />
}
