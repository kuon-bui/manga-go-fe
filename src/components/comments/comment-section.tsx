'use client'

import { MessageSquare } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { CommentItem } from '@/components/comments/comment-item'
import { CommentInput } from '@/components/comments/comment-input'
import { useComments, useAddComment, useDeleteComment, useToggleReaction } from '@/hooks/use-comments'
import { useAuthStore } from '@/stores/auth-store'

type CommentScope =
  | { type: 'comic'; comicId: string }
  | { type: 'chapter'; chapterId: string }
  | { type: 'page'; chapterId: string; pageIndex: number }

interface CommentSectionProps {
  scope: CommentScope
}

export function CommentSection({ scope }: CommentSectionProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const { data, isLoading } = useComments(scope)
  const addMutation = useAddComment(scope)
  const deleteMutation = useDeleteComment(scope)
  const toggleReactionMutation = useToggleReaction(scope)

  function handleAddComment(content: string) {
    addMutation.mutate({ content, parentId: null })
  }

  function handleReply(targetCommentId: string, content: string) {
    const targetComment = data?.data.find((c) => c.id === targetCommentId || c.replies?.some((r) => r.id === targetCommentId))
    const target = targetComment?.id === targetCommentId ? targetComment : targetComment?.replies?.find((r) => r.id === targetCommentId)

    // Always use root comment as parentId, mention the target author if replying to nested comment
    const rootParentId = targetComment?.id ?? null
    const mentionedAuthor = target?.id !== targetComment?.id ? target?.author : undefined

    addMutation.mutate({
      content,
      parentId: rootParentId,
      mentionedAuthor,
    })
  }

  function handleDelete(commentId: string) {
    deleteMutation.mutate(commentId)
  }

  function handleToggleReaction(commentId: string, type: string, isLiked: boolean) {
    toggleReactionMutation.mutate({ commentId, type, isLiked })
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <h3 className="text-base font-semibold text-foreground">Bình luận</h3>
        {data && (
          <span className="text-sm text-muted-foreground">({data.total})</span>
        )}
      </div>

      {/* Input — only for authenticated users */}
      {isAuthenticated ? (
        <CommentInput onSubmit={handleAddComment} />
      ) : (
        <p className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground dark:border-border">
          <a href="/login" className="text-primary hover:underline">Đăng nhập</a> để bình luận.
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
                depth={0}
                onDelete={handleDelete}
                onReply={handleReply}
                onToggleReaction={handleToggleReaction}
              />
            </div>
          ))}
        </div>
      )}

      {!isLoading && (!data || data.data.length === 0) && (
        <div className="py-10 text-center text-muted-foreground">
          <MessageSquare className="mx-auto mb-2 h-8 w-8 opacity-30" />
          <p className="text-sm">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
        </div>
      )}
    </div>
  )
}
