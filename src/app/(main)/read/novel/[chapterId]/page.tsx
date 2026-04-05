import { Suspense } from 'react'
import dynamic from 'next/dynamic'

const NovelReader = dynamic(
  () => import('@/components/reader/novel/novel-reader').then((m) => ({ default: m.NovelReader })),
  { ssr: false }
)

interface PageProps {
  params: Promise<{ chapterId: string }>
}

export default async function NovelReaderPage({ params }: PageProps) {
  const { chapterId } = await params

  return (
    <Suspense fallback={<NovelReaderSkeleton />}>
      <NovelReader chapterId={chapterId} />
    </Suspense>
  )
}

function NovelReaderSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
}
