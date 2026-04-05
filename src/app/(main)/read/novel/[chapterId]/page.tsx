import { NovelReaderClient } from './novel-reader-client'

interface PageProps {
  params: Promise<{ chapterId: string }>
}

export default async function NovelReaderPage({ params }: PageProps) {
  const { chapterId } = await params
  return <NovelReaderClient chapterId={chapterId} />
}
