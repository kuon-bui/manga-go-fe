'use client'

import { MessageSquare } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { CommentItem } from '@/components/comments/comment-item'
import { CommentInput } from '@/components/comments/comment-input'
import { useComments, useAddComment, useDeleteComment } from '@/hooks/use-comments'
import { useAuthStore } from '@/stores/auth-store'

interface CommentSectionProps {
  mangaId: string
}

export function CommentSection({ mangaId }: CommentSectionProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const { data, isLoading } = useComments(mangaId)
  const addMutation = useAddComment(mangaId)
  const deleteMutation = useDeleteComment(mangaId)

  function handleAddComment(body: string) {
    addMutation.mutate({ body, parentId: null })
  }

  function handleReply(parentId: string, body: string) {
    addMutation.mutate({ body, parentId })
  }

  function handleDelete(commentId: string) {
    deleteMutation.mutate(commentId)
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <h3 className="text-base font-semibold text-foreground">Comments</h3>
        {data && (
          <span className="text-sm text-muted-foreground">({data.total})</span>
        )}
      </div>

      {/* Input — only for authenticated users */}
      {isAuthenticated ? (
        <CommentInput onSubmit={handleAddComment} />
      ) : (
        <p className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground dark:border-border">
          <a href="/login" className="text-primary hover:underline">Sign in</a> to join the discussion.
        </p>
      )}

      {/* Comment list */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-1/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && data && data.data.length > 0 && (
        <div className="space-y-5 divide-y divide-border dark:divide-border">
          {data.data.map((comment) => (
            <div key={comment.id} className="pt-5 first:pt-0">
              <CommentItem
                comment={comment}
                mangaId={mangaId}
                depth={0}
                onDelete={handleDelete}
                onReply={handleReply}
              />
            </div>
          ))}
        </div>
      )}

      {!isLoading && (!data || data.data.length === 0) && (
        <div className="py-10 text-center text-muted-foreground">
          <MessageSquare className="mx-auto mb-2 h-8 w-8 opacity-30" />
          <p className="text-sm">No comments yet. Be the first!</p>
        </div>
      )}
    </div>
  )
}
