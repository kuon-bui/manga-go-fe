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
import { List } from 'lucide-react'
import { useChapterList } from '@/hooks/use-title-detail'
import { ChapterList } from '@/components/title/chapter-list'
import type { Chapter } from '@/types'

export function TOCDrawer({ chapter }: { chapter: Chapter }) {
  const { data, isLoading } = useChapterList(chapter.comicSlug)

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="text-foreground/80 hover:bg-muted hover:text-foreground" aria-label="Mục lục">
          <List className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] border-r-border/20 bg-background/95 backdrop-blur sm:w-[400px]">
        <SheetHeader className="mb-4">
          <SheetTitle>Mục lục</SheetTitle>
        </SheetHeader>
        <div className="h-[calc(100vh-80px)]">
          <ChapterList
            chapters={data?.data ?? []}
            isLoading={isLoading}
            comicSlug={chapter.comicSlug}
            contentType={chapter.type ?? 'manga'}
            lastReadChapterId={chapter.id}
          />
        </div>
      </SheetContent>
    </Sheet>
  )
}
