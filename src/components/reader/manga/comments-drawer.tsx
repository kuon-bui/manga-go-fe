'use client'

import React from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { MessageSquare } from 'lucide-react'
import { CommentSection } from '@/components/comments/comment-section'

export function CommentsDrawer({ chapterId }: { chapterId: string }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-foreground/80 hover:bg-muted hover:text-foreground" aria-label="Bình luận">
          <MessageSquare className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] border-l-border/20 bg-background/95 backdrop-blur sm:w-[400px]">
        <SheetHeader className="mb-4">
          <SheetTitle>Bình luận</SheetTitle>
        </SheetHeader>
        <div className="h-[calc(100vh-80px)] overflow-y-auto pr-2 scrollbar-thin">
          <CommentSection scope={{ type: 'chapter', chapterId }} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
