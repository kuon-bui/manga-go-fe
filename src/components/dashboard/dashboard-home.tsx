'use client'

import Link from 'next/link'
import { SafeImage as Image } from '@/components/ui/safe-image'
import { Plus, Users, BookOpen, Eye, Heart, ListPlus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useMyGroups, useMyTitles } from '@/hooks/use-dashboard'

export function DashboardHome() {
  const { data: groups, isLoading: groupsLoading } = useMyGroups()
  const { data: titlesData, isLoading: titlesLoading } = useMyTitles()

  // Aggregate some basic stats from available data (placeholder for real backend stats)
  const totalTitles = titlesData?.total || 0
  const totalChapters = titlesData?.data?.reduce((acc, t) => acc + (t.chapterCount || 0), 0) || 0

  return (
    <div className="flex-1 space-y-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Tổng quan</h2>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href="/dashboard/upload/title">
              <Plus className="mr-2 h-4 w-4" /> Đăng truyện mới
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số truyện</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {titlesLoading ? <Skeleton className="h-7 w-12" /> : <div className="text-2xl font-bold">{totalTitles}</div>}
            <p className="text-xs text-muted-foreground mt-1">Truyện bạn đang quản lý</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số chương</CardTitle>
            <ListPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {titlesLoading ? <Skeleton className="h-7 w-12" /> : <div className="text-2xl font-bold">{totalChapters}</div>}
            <p className="text-xs text-muted-foreground mt-1">Đã được tải lên</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lượt xem (Dự kiến)</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">---</div>
            <p className="text-xs text-muted-foreground mt-1">Sẽ hỗ trợ trong tương lai</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lượt theo dõi</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">---</div>
            <p className="text-xs text-muted-foreground mt-1">Sẽ hỗ trợ trong tương lai</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Titles Table Col */}
        <Card className="lg:col-span-4 xl:col-span-5">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="grid gap-1">
              <CardTitle>Truyện của tôi</CardTitle>
              <CardDescription>Quản lý các truyện bạn đã đăng tải.</CardDescription>
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link href="/dashboard/titles">Xem tất cả</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {titlesLoading && <Skeleton className="h-48 w-full rounded-lg" />}
            
            {!titlesLoading && (!titlesData || titlesData.data.length === 0) && (
              <div className="flex h-[200px] flex-col items-center justify-center rounded-md border border-dashed text-center">
                <BookOpen className="mx-auto mb-4 h-8 w-8 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold text-foreground">Chưa có truyện nào</h3>
                <p className="mb-4 text-sm text-muted-foreground">Bạn chưa đóng góp truyện nào lên nền tảng.</p>
                <Button size="sm" asChild>
                  <Link href="/dashboard/upload/title">Bắt đầu ngay</Link>
                </Button>
              </div>
            )}

            {titlesData && titlesData.data.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Truyện</TableHead>
                    <TableHead>Loại</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead className="text-right">Chương</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {titlesData.data.map((title) => (
                    <TableRow key={title.id}>
                      <TableCell>
                        <Link href={`/dashboard/title/${title.slug}`} className="flex items-center gap-3 transition-colors hover:text-primary">
                          <div className="relative h-10 w-7 shrink-0 overflow-hidden rounded-md bg-muted">
                            {title.coverUrl?.trim() ? (
                              <Image
                                src={title.coverUrl}
                                alt={title.title}
                                fill
                                sizes="28px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-[10px] font-semibold text-muted-foreground">
                                N/A
                              </div>
                            )}
                          </div>
                          <span className="line-clamp-1 font-medium">{title.title}</span>
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">{title.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={title.status as any} className="capitalize">{title.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {title.chapterCount}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="ghost" asChild>
                          <Link href={`/dashboard/title/${title.slug}`}>
                            Sửa
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Groups Col */}
        <Card className="lg:col-span-3 xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="grid gap-1">
              <CardTitle>Nhóm dịch</CardTitle>
              <CardDescription>Nhóm bạn đang tham gia</CardDescription>
            </div>
            <Button size="icon" variant="ghost" asChild className="h-8 w-8">
              <Link href="/dashboard/groups/new"><Plus className="h-4 w-4" /><span className="sr-only">Tạo mới</span></Link>
            </Button>
          </CardHeader>
          <CardContent>
            {groupsLoading && (
              <div className="flex flex-col gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-xl" />
                ))}
              </div>
            )}

            {!groupsLoading && (!groups || groups.data.length === 0) && (
              <div className="flex flex-col items-center rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
                <Users className="mb-2 h-6 w-6 opacity-30" />
                Bạn chưa tham gia nhóm dịch nào.
              </div>
            )}

            {groups && groups.data.length > 0 && (
              <div className="flex flex-col gap-4">
                {groups.data.map((g) => (
                  <Link
                    key={g.id}
                    href={`/dashboard/groups/${g.slug}`}
                    className="flex flex-row items-center gap-4 rounded-xl border bg-card p-3 shadow-sm transition-all hover:bg-accent/50 dark:border-border"
                  >
                    {g.logoUrl ? (
                      <Image
                        src={g.logoUrl}
                        alt={g.name}
                        width={40}
                        height={40}
                        className="rounded-full shadow-sm"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {g.name.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="flex flex-col gap-1 overflow-hidden">
                      <span className="truncate text-sm font-semibold text-foreground">{g.name}</span>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />{g.memberCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />{g.titleCount}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
