'use client'

import Link from 'next/link'
import { ChevronRight, BookOpen, Zap } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { SafeImage as Image } from '@/components/ui/safe-image'
import { useLatestUpdates } from '@/hooks/use-manga'
import type { Manga } from '@/types'

function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)  return 'Vừa xong'
  if (mins < 60) return `${mins}m`
  if (hours < 24) return `${hours}h`
  if (days < 30)  return `${days}d`
  return new Date(dateStr).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' })
}

function ChapterItem({ manga }: { manga: Manga }) {
  const group     = manga.translationGroup?.name ?? manga.authors?.[0]?.name ?? ''
  const latestCh  = manga.chapters?.[manga.chapters.length - 1]

  return (
    <Link
      href={`/titles/${manga.slug}`}
      className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary/60 transition-colors group"
    >
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-muted">
        {manga.thumbnail ? (
          <Image src={manga.thumbnail} alt={manga.title} fill sizes="48px" className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen className="h-4 w-4 text-muted-foreground/40" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">
          {manga.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {latestCh ? `Ch. ${latestCh.number}` : 'New chapter'}
          {group ? ` · ${group}` : ''}
        </p>
      </div>

      <span className="shrink-0 text-xs text-muted-foreground self-start mt-0.5">
        {timeAgo(manga.lastChapterAt)}
      </span>
    </Link>
  )
}

export function LatestUpdatesSection() {
  const { data, isLoading, isError } = useLatestUpdates()
  const mangas = data?.data ?? []

  return (
    <section className="cute-card p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Chapter Mới
        </h2>
        <Link
          href="/browse?sort=latest"
          className="text-sm font-semibold text-primary hover:underline flex items-center gap-0.5"
        >
          Xem thêm <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2">
              <Skeleton className="h-12 w-12 shrink-0 rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-4/5" />
                <Skeleton className="h-3 w-2/3" />
              </div>
              <Skeleton className="h-3 w-8 shrink-0" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <p className="py-6 text-center text-sm text-muted-foreground">
          Không thể tải.{' '}
          <Link href="/login" className="text-primary hover:underline">Đăng nhập</Link>
        </p>
      )}

      {!isLoading && !isError && mangas.length > 0 && (
        <ul className="space-y-1">
          {mangas.map((manga, i) => (
            <li
              key={manga.id}
              className="animate-in fade-in duration-300"
              style={{ animationDelay: `${i * 30}ms` }}
            >
              <ChapterItem manga={manga} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
