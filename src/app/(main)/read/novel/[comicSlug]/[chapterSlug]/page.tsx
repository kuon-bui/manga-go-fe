import { NovelReaderClient } from './novel-reader-client'

interface PageProps {
  params: Promise<{ comicSlug: string; chapterSlug: string }>
}

export default async function NovelReaderPage({ params }: PageProps) {
  const { comicSlug, chapterSlug } = await params
  return <NovelReaderClient comicSlug={comicSlug} chapterSlug={chapterSlug} />
}
