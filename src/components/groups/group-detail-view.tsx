'use client'

import { SafeImage as Image } from '@/components/ui/safe-image'
import { Calendar, Users, BookMarked, ShieldCheck } from 'lucide-react'

import { useGroup } from '@/hooks/use-groups'
import { useBrowse } from '@/hooks/use-manga'
import { Skeleton } from '@/components/ui/skeleton'
import { MangaCard } from '@/components/manga/manga-card'
import { Badge } from '@/components/ui/badge'

interface GroupDetailViewProps {
  slug: string
}

export function GroupDetailView({ slug }: GroupDetailViewProps) {
  const { data: group, isLoading: groupLoading } = useGroup(slug)
  const { data: comicsData, isLoading: comicsLoading } = useBrowse({
    translationGroupSlug: slug,
    page: 1,
    limit: 24,
  })

  if (groupLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold mb-2">Không tìm thấy nhóm dịch</h1>
        <p className="text-muted-foreground">Nhóm dịch này không tồn tại hoặc đã bị xóa.</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-10">
      
      {/* Group Header */}
      <section className="relative overflow-hidden rounded-2xl border bg-card shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent pointer-events-none" />
        
        <div className="relative p-6 md:p-8 flex flex-col md:flex-row gap-6 md:items-center">
          {/* Avatar */}
          <div className="h-24 w-24 md:h-32 md:w-32 shrink-0 rounded-2xl overflow-hidden ring-4 ring-background shadow-md bg-muted">
            {group.logoUrl ? (
              <Image 
                src={group.logoUrl}
                alt={group.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary font-bold text-3xl">
                {group.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-4xl font-black text-foreground tracking-tight">
                {group.name}
              </h1>
              <ShieldCheck className="h-6 w-6 text-blue-500 shrink-0" />
            </div>

            <p className="text-muted-foreground max-w-3xl line-clamp-3">
              {group.description || 'Nhóm dịch chưa cập nhật phần giới thiệu.'}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <Users className="h-4 w-4 text-primary" />
                <span>{group.memberCount} thành viên</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm font-medium">
                <BookMarked className="h-4 w-4 text-primary" />
                <span>{group.titleCount} dự án</span>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Thành lập {new Date(group.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Group Projects */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-foreground">Dự án của nhóm</h2>
          <Badge variant="secondary" className="rounded-full">
            {comicsData?.total ?? 0}
          </Badge>
        </div>

        {comicsLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] w-full rounded-md" />
            ))}
          </div>
        ) : !comicsData?.data.length ? (
          <div className="py-12 text-center rounded-xl border border-dashed bg-muted/30">
            <p className="text-muted-foreground">Nhóm chưa có dự án nào được đăng tải.</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {comicsData.data.map((manga) => (
              <MangaCard key={manga.id} manga={manga} />
            ))}
          </div>
        )}
      </section>

    </div>
  )
}
