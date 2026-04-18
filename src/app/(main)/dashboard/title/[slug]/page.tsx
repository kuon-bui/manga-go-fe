import { Suspense } from 'react'
import { TitleManagementView } from '@/components/dashboard/title-management-view'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata = { title: 'Manage Title — Manga Go' }

export default async function TitleDashboardPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params

  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-48 w-full" />
        </div>
      }
    >
      <TitleManagementView titleSlug={slug} />
    </Suspense>
  )
}
