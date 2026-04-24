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
    <div className="mx-auto max-w-7xl px-4 md:px-6 pt-4 pb-10 space-y-6">
      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
        <Skeleton className="h-[420px] w-full rounded-2xl" />
        <Skeleton className="h-[420px] w-full rounded-2xl" />
      </div>
    </div>
  )
}
