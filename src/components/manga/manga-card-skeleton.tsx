import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function MangaCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col overflow-hidden rounded-lg border bg-card', className)}>
      <Skeleton className="aspect-[2/3] w-full" />
      <div className="flex flex-col gap-2 p-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  )
}

export function MangaListItemSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex gap-3 rounded-lg border bg-card p-2', className)}>
      <Skeleton className="h-20 w-14 shrink-0 rounded-md" />
      <div className="flex flex-1 flex-col justify-between py-0.5">
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  )
}
