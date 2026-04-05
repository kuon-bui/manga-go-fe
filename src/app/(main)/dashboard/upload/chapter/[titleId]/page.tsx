import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { UploadChapterView } from '@/components/dashboard/upload-chapter-view'

interface PageProps {
  params: Promise<{ titleId: string }>
}

export default async function UploadChapterPage({ params }: PageProps) {
  const { titleId } = await params
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <UploadChapterView titleId={titleId} />
    </Suspense>
  )
}
