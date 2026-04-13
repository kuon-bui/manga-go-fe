import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
import { GroupManagementView } from '@/components/dashboard/group-management-view'

interface PageProps {
  params: Promise<{ groupId: string }>
}

export default async function GroupManagementPage({ params }: PageProps) {
  const { groupId } = await params
  return (
    <Suspense fallback={<Skeleton className="h-96 w-full" />}>
      <GroupManagementView groupSlug={groupId} />
    </Suspense>
  )
}
