'use client'

import Link from 'next/link'
import { SafeImage as Image } from '@/components/ui/safe-image'
import { Plus, Users, BookOpen, ListPlus, ChevronRight, Eye, Heart } from 'lucide-react'

import { Badge }    from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useMyGroups, useMyTitles } from '@/hooks/use-dashboard'
import { cn } from '@/lib/utils'

export function DashboardHome() {
  const { data: groups,     isLoading: groupsLoading } = useMyGroups()
  const { data: titlesData, isLoading: titlesLoading } = useMyTitles()

  const totalTitles   = titlesData?.total ?? 0
  const totalChapters = titlesData?.data?.reduce((acc, t) => acc + (t.chapterCount ?? 0), 0) ?? 0

  return (
    <div className="space-y-5">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-bold">Tổng quan</h2>
        <Link
          href="/dashboard/upload/title"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity shadow-sm shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Đăng truyện mới</span>
          <span className="sm:hidden">Đăng mới</span>
        </Link>
      </div>

      {/* ── Stats grid ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Số truyện"
          icon={<BookOpen className="h-5 w-5 text-primary" />}
          iconBg="bg-primary/10"
          loading={titlesLoading}
          value={totalTitles}
          sub="Đang quản lý"
        />
        <StatCard
          label="Số chương"
          icon={<ListPlus className="h-5 w-5 text-secondary-foreground" />}
          iconBg="bg-secondary"
          loading={titlesLoading}
          value={totalChapters}
          sub="Đã tải lên"
        />
        <StatCard
          label="Lượt xem"
          icon={<Eye className="h-5 w-5 text-accent-foreground" />}
          iconBg="bg-accent/60"
          value="—"
          sub="Sắp hỗ trợ"
        />
        <StatCard
          label="Theo dõi"
          icon={<Heart className="h-5 w-5 text-primary" />}
          iconBg="bg-primary/10"
          value="—"
          sub="Sắp hỗ trợ"
        />
      </div>

      {/* ── Main content: titles + groups ───────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">

        {/* ── Titles table ──────────────────────────────────────── */}
        <div className="cute-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold">Truyện của tôi</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Quản lý các truyện bạn đã đăng tải</p>
            </div>
            <Link
              href="/dashboard/upload/title"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-primary hover:text-primary transition-colors shrink-0"
            >
              <Plus className="h-3 w-3" /> Thêm mới
            </Link>
          </div>

          {titlesLoading && (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          )}

          {!titlesLoading && (!titlesData || titlesData.data.length === 0) && (
            <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-muted/30 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Chưa có truyện nào</p>
                <p className="text-sm text-muted-foreground mt-0.5">Bắt đầu đăng truyện đầu tiên của bạn.</p>
              </div>
              <Link
                href="/dashboard/upload/title"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Bắt đầu ngay
              </Link>
            </div>
          )}

          {titlesData && titlesData.data.length > 0 && (
            <div className="overflow-x-auto -mx-5 px-5">
              <table className="w-full min-w-[480px] text-sm">
                <thead>
                  <tr className="border-b border-border/60">
                    <th className="pb-2.5 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">Truyện</th>
                    <th className="pb-2.5 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground hidden sm:table-cell">Loại</th>
                    <th className="pb-2.5 text-left text-xs font-bold uppercase tracking-wide text-muted-foreground">Tình trạng</th>
                    <th className="pb-2.5 text-right text-xs font-bold uppercase tracking-wide text-muted-foreground">Chương</th>
                    <th className="pb-2.5 text-right text-xs font-bold uppercase tracking-wide text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {titlesData.data.map((title) => (
                    <tr key={title.id} className="hover:bg-secondary/40 transition-colors">
                      <td className="py-3 pr-3">
                        <Link
                          href={`/dashboard/title/${title.slug}`}
                          className="flex items-center gap-2.5 hover:text-primary transition-colors"
                        >
                          <div className="relative h-10 w-7 shrink-0 overflow-hidden rounded-lg bg-muted">
                            {title.coverUrl?.trim() ? (
                              <Image src={title.coverUrl} alt={title.title} fill sizes="28px" className="object-cover" />
                            ) : (
                              <div className="flex h-full items-center justify-center text-[9px] font-bold text-muted-foreground">N/A</div>
                            )}
                          </div>
                          <span className="line-clamp-1 font-semibold">{title.title}</span>
                        </Link>
                      </td>
                      <td className="py-3 pr-3 hidden sm:table-cell">
                        <Badge variant="outline" className="capitalize text-xs">{title.type}</Badge>
                      </td>
                      <td className="py-3 pr-3">
                        <Badge variant={title.status} className="capitalize text-xs">
                          {title.status}
                        </Badge>
                      </td>
                      <td className="py-3 pr-3 text-right text-muted-foreground font-medium">
                        {title.chapterCount ?? 0}
                      </td>
                      <td className="py-3 text-right">
                        <Link
                          href={`/dashboard/title/${title.slug}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                        >
                          Sửa <ChevronRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Groups ────────────────────────────────────────────── */}
        <div className="cute-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-bold">Nhóm dịch</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Nhóm bạn đang tham gia</p>
            </div>
            <Link
              href="/dashboard/groups/new"
              className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
              aria-label="Tạo nhóm mới"
            >
              <Plus className="h-3.5 w-3.5" />
            </Link>
          </div>

          {groupsLoading && (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          )}

          {!groupsLoading && (!groups || groups.data.length === 0) && (
            <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-muted/30 py-10 text-center">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <p className="text-sm text-muted-foreground">Chưa tham gia nhóm dịch nào.</p>
              <Link
                href="/dashboard/groups/new"
                className="text-xs font-semibold text-primary hover:underline"
              >
                Tạo nhóm mới →
              </Link>
            </div>
          )}

          {groups && groups.data.length > 0 && (
            <div className="space-y-2">
              {groups.data.map((g) => (
                <Link
                  key={g.id}
                  href={`/dashboard/groups/${g.slug}`}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border border-border/60 bg-card/60 p-3',
                    'hover:border-primary/40 hover:bg-primary/5 transition-all'
                  )}
                >
                  {g.logoUrl ? (
                    <Image src={g.logoUrl} alt={g.name} width={38} height={38} className="rounded-full shrink-0" />
                  ) : (
                    <div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {g.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{g.name}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> {g.memberCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" /> {g.titleCount}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ── Stat card ─────────────────────────────────────────────────────────────── */

function StatCard({
  label, icon, iconBg, loading, value, sub,
}: {
  label: string
  icon: React.ReactNode
  iconBg: string
  loading?: boolean
  value: string | number
  sub: string
}) {
  return (
    <div className="cute-card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</span>
        <div className={cn('h-8 w-8 rounded-full flex items-center justify-center', iconBg)}>
          {icon}
        </div>
      </div>
      {loading ? (
        <Skeleton className="h-8 w-12" />
      ) : (
        <p className="font-display text-3xl font-bold leading-none">{value}</p>
      )}
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  )
}
