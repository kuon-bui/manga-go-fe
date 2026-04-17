'use client'

import { useState } from 'react'
import { Heart, Trash2, MessageSquare } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CommentInput } from '@/components/comments/comment-input'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'
import type { Comment } from '@/types'

interface CommentItemProps {
  comment: Comment
  depth?: number
  onDelete: (_commentId: string) => void
  onReply: (_parentId: string, _content: string) => void
}

export function CommentItem({
  comment,
  depth = 0,
  onDelete,
  onReply,
}: CommentItemProps) {
  const [replyOpen, setReplyOpen] = useState(false)
  const [repliesVisible, setRepliesVisible] = useState(false)

  const currentUser = useAuthStore((s) => s.user)
  const isOwn = currentUser?.id === comment.userId
  const isOptimistic = comment.id.startsWith('optimistic-')
  const canReply = depth < 1 // max depth 2: root + 1 reply level

  const likeReaction = comment?.reactions?.find((r) => r.type === 'like')
  const likeCount = likeReaction?.count ?? 0
  const isLiked = likeReaction?.userReacted ?? false

  const author = comment.author ?? { id: '', name: 'Unknown', avatarUrl: null }
  const initials = author.name.slice(0, 2).toUpperCase()

  return (
    <div className={cn('flex gap-3', depth > 0 && 'ml-8 mt-3')}>
      {/* Avatar */}
      <Avatar className="h-8 w-8 shrink-0">
        {author.avatarUrl && (
          <AvatarImage src={author.avatarUrl} alt={author.name} />
        )}
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-1">
        {/* Header */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">
            {author.name}
          </span>
          <span className="text-xs text-muted-foreground">
            {formatDate(comment.createdAt)}
          </span>
          {isOptimistic && (
            <span className="text-xs text-muted-foreground italic">Sending…</span>
          )}
        </div>

        {/* Body */}
        <p className="text-sm leading-relaxed text-foreground">{comment.content}</p>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            className={cn(
              'flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground',
              isLiked && 'text-red-500 hover:text-red-600'
            )}
            aria-label={`Like comment (${likeCount})`}
          >
            <Heart className={cn('h-3.5 w-3.5', isLiked && 'fill-current')} />
            {likeCount > 0 && likeCount}
          </button>

          {canReply && currentUser && (
            <button
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
              onClick={() => setReplyOpen((v) => !v)}
              aria-label="Reply"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              Reply
            </button>
          )}

          {isOwn && !isOptimistic && (
            <button
              className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
              onClick={() => onDelete(comment.id)}
              aria-label="Delete comment"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Reply input */}
        {replyOpen && (
          <CommentInput
            placeholder="Write a reply…"
            autoFocus
            onSubmit={(body) => {
              onReply(comment.id, body)
              setReplyOpen(false)
            }}
            onCancel={() => setReplyOpen(false)}
          />
        )}

        {/* Replies */}
        {comment.replies.length > 0 && (
          <div className="mt-1">
            {!repliesVisible ? (
              <button
                className="text-xs font-medium text-primary hover:underline"
                onClick={() => setRepliesVisible(true)}
              >
                Show {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
              </button>
            ) : (
              <div className="space-y-3">
                {comment.replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    depth={depth + 1}
                    onDelete={onDelete}
                    onReply={onReply}
                  />
                ))}
                <button
                  className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                  onClick={() => setRepliesVisible(false)}
                >
                  Hide replies
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}
