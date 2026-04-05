import { Suspense } from 'react'
import { DashboardHome } from '@/components/dashboard/dashboard-home'
import { Skeleton } from '@/components/ui/skeleton'

export const metadata = { title: 'Dashboard — Manga Go' }

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardHome />
    </Suspense>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}
