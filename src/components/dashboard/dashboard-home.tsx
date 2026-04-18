'use client'

import Link from 'next/link'
import { SafeImage as Image } from '@/components/ui/safe-image'
import { Plus, Users, BookOpen } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { useMyGroups, useMyTitles } from '@/hooks/use-dashboard'

export function DashboardHome() {
  const { data: groups, isLoading: groupsLoading } = useMyGroups()
  const { data: titlesData, isLoading: titlesLoading } = useMyTitles()

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>

      {/* Groups */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">My Groups</h2>
          <Button size="sm" variant="outline" asChild>
            <Link href="/dashboard/groups/new">
              <Plus className="h-4 w-4" /> New Group
            </Link>
          </Button>
        </div>

        {groupsLoading && (
          <div className="flex gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-40 rounded-xl" />
            ))}
          </div>
        )}

        {!groupsLoading && (!groups || groups.data.length === 0) && (
          <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground dark:border-border">
            You are not a member of any group yet.
          </p>
        )}

        {groups && groups.data.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {groups.data.map((g) => (
              <Link
                key={g.id}
                href={`/dashboard/groups/${g.slug}`}
                className="flex w-44 flex-col gap-2 rounded-xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md dark:border-border"
              >
                <div className="flex items-center gap-2">
                  {g.logoUrl ? (
                    <Image
                      src={g.logoUrl}
                      alt={g.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {g.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <span className="truncate text-sm font-semibold text-foreground">{g.name}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />{g.memberCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />{g.titleCount}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Titles */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">My Titles</h2>
          <Button size="sm" asChild>
            <Link href="/dashboard/upload/title">
              <Plus className="h-4 w-4" /> Upload Title
            </Link>
          </Button>
        </div>

        {titlesLoading && <Skeleton className="h-48 w-full rounded-lg" />}

        {!titlesLoading && (!titlesData || titlesData.data.length === 0) && (
          <p className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground dark:border-border">
            No titles uploaded yet.{' '}
            <Link href="/dashboard/upload/title" className="text-primary hover:underline">
              Upload your first title
            </Link>
          </p>
        )}

        {titlesData && titlesData.data.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Chapters</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
                    <Badge variant={title.type as any}>{title.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={title.status as any}>{title.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {title.chapterCount}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/dashboard/title/${title.slug}`}>
                        Manage
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  )
}
