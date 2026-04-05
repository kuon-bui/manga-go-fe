import { MangaReaderClient } from './manga-reader-client'

interface PageProps {
  params: Promise<{ chapterId: string }>
}

export default async function MangaReaderPage({ params }: PageProps) {
  const { chapterId } = await params
  return <MangaReaderClient chapterId={chapterId} />
}
