'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { MangaPageUploader } from '@/components/dashboard/manga-page-uploader'
import { NovelChapterEditor } from '@/components/dashboard/novel-chapter-editor'
import { useMangaDetail } from '@/hooks/use-title-detail'
import { useMyGroups, useUploadChapter } from '@/hooks/use-dashboard'

interface UploadChapterViewProps {
  titleId: string
}

export function UploadChapterView({ titleId }: UploadChapterViewProps) {
  const router = useRouter()
  const { data: manga, isLoading } = useMangaDetail(titleId)
  const { data: groups } = useMyGroups()
  const uploadMutation = useUploadChapter()

  const [chapterNumber, setChapterNumber] = useState('')
  const [chapterTitle, setChapterTitle] = useState('')
  const [groupId, setGroupId] = useState('')
  const [pages, setPages] = useState<string[]>([])
  const [novelContent, setNovelContent] = useState('')

  if (isLoading || !manga) {
    return <Skeleton className="h-64 w-full" />
  }

  const isManga = manga.type === 'manga'

  function handleSubmit() {
    if (!chapterNumber || !groupId) {
      toast.error('Chapter number and group are required')
      return
    }
    if (isManga && pages.length === 0) {
      toast.error('Please upload at least one page')
      return
    }
    if (!isManga && !novelContent.trim()) {
      toast.error('Chapter content cannot be empty')
      return
    }

    uploadMutation.mutate(
      {
        mangaId: titleId,
        groupId,
        number: Number(chapterNumber),
        title: chapterTitle.trim() || null,
        pages: isManga ? pages : [],
        content: isManga ? null : novelContent,
      },
      {
        onSuccess: () => {
          toast.success('Chapter uploaded!')
          router.push(`/titles/${titleId}`)
        },
        onError: () => toast.error('Upload failed. Please try again.'),
      }
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Add Chapter</h1>
        <p className="mt-1 text-sm text-muted-foreground">{manga.title}</p>
      </div>

      {/* Chapter meta */}
      <div className="grid grid-cols-2 gap-4 rounded-xl border bg-card p-5 dark:border-border sm:grid-cols-4">
        <div className="space-y-1">
          <Label htmlFor="ch-number">Chapter # <span className="text-destructive">*</span></Label>
          <Input
            id="ch-number"
            type="number"
            min={0}
            step={0.1}
            value={chapterNumber}
            onChange={(e) => setChapterNumber(e.target.value)}
            placeholder="e.g. 42"
          />
        </div>
        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="ch-title">Chapter Title</Label>
          <Input
            id="ch-title"
            value={chapterTitle}
            onChange={(e) => setChapterTitle(e.target.value)}
            placeholder="Optional title"
          />
        </div>
        <div className="space-y-1">
          <Label>Group <span className="text-destructive">*</span></Label>
          <Select value={groupId} onValueChange={setGroupId}>
            <SelectTrigger>
              <SelectValue placeholder="Select group" />
            </SelectTrigger>
            <SelectContent>
              {groups?.map((g) => (
                <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Content upload */}
      {isManga ? (
        <MangaPageUploader pages={pages} onChange={setPages} />
      ) : (
        <NovelChapterEditor content={novelContent} onChange={setNovelContent} />
      )}

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={uploadMutation.isPending}>
          {uploadMutation.isPending ? 'Uploading…' : 'Publish Chapter'}
        </Button>
      </div>
    </div>
  )
}
