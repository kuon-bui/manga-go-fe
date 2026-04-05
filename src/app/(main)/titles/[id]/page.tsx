import { Suspense } from 'react'

import { TitleDetailView } from '@/components/title/title-detail-view'
import { Skeleton } from '@/components/ui/skeleton'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function TitleDetailPage({ params }: PageProps) {
  const { id } = await params

  return (
    <Suspense fallback={<TitleDetailSkeleton />}>
      <TitleDetailView id={id} />
    </Suspense>
  )
}

function TitleDetailSkeleton() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex flex-col gap-6 md:flex-row">
        <Skeleton className="h-64 w-44 shrink-0 rounded-xl md:h-80 md:w-56" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-8 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-2 pt-2">
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-24" />
            <Skeleton className="h-9 w-32" />
          </div>
        </div>
      </div>
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}
