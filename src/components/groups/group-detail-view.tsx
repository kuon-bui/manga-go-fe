'use client'

import { SafeImage as Image } from '@/components/ui/safe-image'
import { Calendar, Users, BookMarked, ShieldCheck } from 'lucide-react'

import { useGroup }  from '@/hooks/use-groups'
import { useBrowse } from '@/hooks/use-manga'
import { Skeleton }  from '@/components/ui/skeleton'
import { MangaCard } from '@/components/manga/manga-card'

interface GroupDetailViewProps {
  slug: string
}

export function GroupDetailView({ slug }: GroupDetailViewProps) {
  const { data: group,      isLoading: groupLoading  } = useGroup(slug)
  const { data: comicsData, isLoading: comicsLoading } = useBrowse({
    translationGroupSlug: slug,
    page: 1,
    limit: 24,
  })

  /* ── Loading ─────────────────────────────────────────────── */
  if (groupLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 md:px-6 pt-2 pb-10 space-y-5">
        <Skeleton className="h-44 w-full rounded-2xl" />
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] w-full rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-20 text-center">
        <h1 className="font-display text-2xl font-bold mb-2">Không tìm thấy nhóm dịch</h1>
        <p className="text-muted-foreground">Nhóm dịch này không tồn tại hoặc đã bị xóa.</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 md:px-6 pt-2 pb-10 space-y-5">

      {/* ── Group header ──────────────────────────────────────── */}
      <section className="cute-card relative overflow-hidden">
        {/* Gradient bg */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent pointer-events-none" />

        <div className="relative p-5 md:p-8 flex flex-col sm:flex-row gap-5 sm:items-center">
          {/* Logo */}
          <div className="h-20 w-20 sm:h-28 sm:w-28 shrink-0 rounded-2xl overflow-hidden ring-4 ring-background shadow-md bg-muted">
            {group.logoUrl ? (
              <Image src={group.logoUrl} alt={group.name} fill className="object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary font-bold text-3xl font-display">
                {group.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 space-y-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-display text-2xl md:text-3xl font-bold leading-tight">
                {group.name}
              </h1>
              <ShieldCheck className="h-5 w-5 text-blue-500 shrink-0" />
            </div>

            <p className="text-sm text-muted-foreground max-w-2xl line-clamp-2">
              {group.description || 'Nhóm dịch chưa cập nhật phần giới thiệu.'}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1">
              <span className="flex items-center gap-1.5 text-sm font-semibold">
                <Users className="h-4 w-4 text-primary" />
                {group.memberCount} thành viên
              </span>
              <span className="flex items-center gap-1.5 text-sm font-semibold">
                <BookMarked className="h-4 w-4 text-primary" />
                {group.titleCount} dự án
              </span>
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Thành lập {new Date(group.createdAt).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Comics grid ───────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="font-display text-xl font-bold">Dự án của nhóm</h2>
          <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
            {comicsData?.total ?? 0}
          </span>
        </div>

        {comicsLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] w-full rounded-2xl" />
            ))}
          </div>
        ) : !comicsData?.data.length ? (
          <div className="cute-card py-16 text-center">
            <BookMarked className="mx-auto mb-3 h-10 w-10 text-muted-foreground opacity-20" />
            <p className="font-display text-base font-bold">Chưa có dự án nào</p>
            <p className="text-sm text-muted-foreground mt-1">Nhóm chưa có dự án nào được đăng tải.</p>
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
