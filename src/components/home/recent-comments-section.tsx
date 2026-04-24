'use client'

import { useQuery } from '@tanstack/react-query'
import { MessageCircle } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { apiClient, normalizeComment } from '@/lib/api-client'
import type { Comment, PaginatedResponse } from '@/types'

function timeAgo(dateStr: string): string {
  const diff  = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  < 1)  return 'Vừa xong'
  if (mins  < 60) return `${mins}m`
  if (hours < 24) return `${hours}h`
  return `${days}d`
}

function useRecentComments() {
  return useQuery<PaginatedResponse<Comment>>({
    queryKey: ['comments', 'global-recent'],
    queryFn: async () => {
      const res = await apiClient.get<PaginatedResponse<unknown>>('/comments', {
        params: { limit: '8', order: 'desc' },
      })
      return {
        ...res,
        data: (res.data as Array<Record<string, unknown>>).map(normalizeComment),
      }
    },
    staleTime: 60 * 1000,
    retry: false,
  })
}

function CommentRow({ comment }: { comment: Comment }) {
  return (
    <div className="flex gap-2.5 py-3 first:pt-0 last:pb-0">
      <Avatar className="h-7 w-7 shrink-0">
        {comment.author.avatarUrl && (
          <AvatarImage src={comment.author.avatarUrl} alt={comment.author.name} />
        )}
        <AvatarFallback className="text-[10px] bg-secondary text-secondary-foreground font-semibold">
          {comment.author.name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-[12px] font-semibold truncate">
            {comment.author.name}
          </span>
          <span className="shrink-0 text-[10px] text-muted-foreground">
            {timeAgo(comment.createdAt)}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5 leading-snug">
          {comment.content}
        </p>
      </div>
    </div>
  )
}

export function RecentCommentsSection() {
  const { data, isLoading, isError } = useRecentComments()
  const comments = data?.data ?? []

  return (
    <section className="cute-card p-5 flex flex-col gap-3">
      <h2 className="font-display text-xl flex items-center gap-2">
        <MessageCircle className="h-5 w-5 text-primary" />
        Bình Luận Mới
      </h2>

      <div>
        {isLoading && (
          <div className="flex flex-col divide-y divide-border/60">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-2.5 py-3 first:pt-0 last:pb-0">
                <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-1/3" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && (isError || comments.length === 0) && (
          <p className="py-4 text-center text-xs text-muted-foreground">
            {isError ? 'Không thể tải bình luận.' : 'Chưa có bình luận nào.'}
          </p>
        )}

        {!isLoading && !isError && comments.length > 0 && (
          <div className="flex flex-col divide-y divide-border/60">
            {comments.map((comment) => (
              <CommentRow key={comment.id} comment={comment} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
