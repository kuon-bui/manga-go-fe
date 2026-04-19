'use client'

import React from 'react'
import { SafeImage as Image } from '@/components/ui/safe-image'
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { CommentSection } from '@/components/comments/comment-section'
import { Heart, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ImageCommentModalProps {
  open: boolean
  onOpenChange: (_open: boolean) => void
  imageSrc: string
  pageIndex: number
  chapterId: string
  comicId: string
}

export function ImageCommentModal({ open, onOpenChange, imageSrc, pageIndex, chapterId, comicId }: ImageCommentModalProps) {
  // Normally the backend would aggregate reactions and comment counts. 
  // For the UI demonstration, we'll place the react buttons on top of the comment section or at the bottom of the image.

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] w-full h-[90vh] md:h-[85vh] md:max-w-6xl p-0 overflow-hidden bg-black flex flex-col md:flex-row gap-0 border-zinc-800">
        <DialogTitle className="sr-only">Chi tiết trang {pageIndex + 1}</DialogTitle>
        
        {/* Left side: Image Viewer */}
        <div className="relative flex-1 bg-zinc-950 flex flex-col h-[40vh] md:h-full border-b md:border-b-0 md:border-r border-zinc-800">
          <div className="flex-1 relative w-full h-full p-4 flex items-center justify-center">
            <Image
              src={imageSrc}
              alt={`Page ${pageIndex + 1}`}
              fill
              className="object-contain"
              unoptimized
            />
          </div>
          
          {/* Reaction Bar */}
          <div className="h-14 shrink-0 bg-zinc-900 flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
               <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-red-500 hover:bg-zinc-800">
                 <Heart className="w-4 h-4 mr-2" />
                 Thích
               </Button>
               <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-zinc-800">
                 <MessageCircle className="w-4 h-4 mr-2" />
                 Bình luận
               </Button>
            </div>
            <span className="text-xs text-zinc-500">Trang {pageIndex + 1}</span>
          </div>
        </div>

        {/* Right side: Comments */}
        <div className="w-full md:w-[400px] shrink-0 bg-background flex flex-col h-[50vh] md:h-full">
           <div className="p-4 border-b">
             <h3 className="font-semibold flex items-center gap-2">
               Phản hồi (Trang {pageIndex + 1})
             </h3>
           </div>
           <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
              <CommentSection scope={{ type: 'page', chapterId, comicId, pageIndex }} />
           </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
